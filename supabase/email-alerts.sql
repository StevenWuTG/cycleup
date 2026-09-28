-- Email alerts for new reports and new messages, sent straight from Postgres
-- (pg_net for the HTTP call, Vault for the API key) -- no Edge Function, no
-- server. Run once in the Supabase SQL Editor, after reports.sql.
-- Safe to re-run, EXCEPT the vault.create_secret step at the bottom, which is
-- run once by hand with your real key (see supabase/email-alerts.md).
--
-- Requires two extensions enabled first (Database -> Extensions):
--   pg_net           -- lets Postgres make an outbound HTTP request
--   supabase_vault    -- lets Postgres hold the Resend API key encrypted
-- If either is missing, the statements below fail with "schema ... does not
-- exist" -- enable them and re-run.
create extension if not exists pg_net;
create extension if not exists supabase_vault;

-- --------------------------------------------------------------- html_escape
-- Report details, message text and listing titles are free text a user
-- typed. They end up inside an HTML email, so they're escaped first --
-- otherwise a report or message could inject markup/links into the alert
-- the site owner reads.
create or replace function public.html_escape(p text)
returns text
language sql
immutable
as $$
  select replace(replace(replace(replace(replace(
    coalesce(p, ''), '&', '&amp;'), '<', '&lt;'), '>', '&gt;'), '"', '&quot;'), '''', '&#39;');
$$;

-- ------------------------------------------------------------- send_alert_email
-- Fire-and-forget: looks up the Resend key from Vault and posts to Resend's
-- API via pg_net (async -- the caller doesn't wait on it). If the key isn't
-- configured yet, or there's no address to send to, it quietly does nothing
-- rather than blocking (or erroring out) whatever triggered it.
create or replace function public.send_alert_email(p_to text, p_subject text, p_html text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key text;
begin
  select decrypted_secret into v_key
    from vault.decrypted_secrets
   where name = 'resend_api_key'
   order by created_at desc
   limit 1;

  if v_key is null or p_to is null then
    return;
  end if;

  perform net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_key
    ),
    body := jsonb_build_object(
      'from', 'CycleUp Alerts <alerts@thecycleup.com>',
      'to', array[p_to],
      'subject', p_subject,
      'html', p_html
    )
  );
exception when others then
  -- An alert failing to send must never break a report or a message.
  raise warning 'send_alert_email failed: %', sqlerrm;
end;
$$;

revoke all on function public.send_alert_email(text, text, text) from public, anon, authenticated;
revoke all on function public.html_escape(text) from public, anon, authenticated;

-- ---------------------------------------------------------------- new report
-- Emails the site owner every time submit_report() (reports.sql) succeeds.
-- Reports are already capped at 10/hour per person, so this can't be used to
-- flood the owner's inbox.
create or replace function public.notify_new_report()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reporter text;
  v_target text;
begin
  select username into v_reporter from public.profiles where id = new.reporter_id;

  v_target := case new.target_type
    when 'listing' then 'the listing "' || public.html_escape(new.listing_title) || '"'
    when 'user' then 'the seller "' || public.html_escape(new.reported_username) || '"'
    else 'a conversation about "' || public.html_escape(new.listing_title) || '"'
  end;

  perform public.send_alert_email(
    'Steven@thecycleup.com',
    'New report on CycleUp (' || new.reason || ')',
    '<p><strong>' || public.html_escape(coalesce(v_reporter, 'Someone')) || '</strong> reported ' || v_target || '.</p>' ||
    '<p><strong>Reason:</strong> ' || public.html_escape(new.reason) || '</p>' ||
    case when new.details is not null
      then '<p><strong>Details:</strong> ' || public.html_escape(new.details) || '</p>'
      else ''
    end ||
    '<p>Report #' || new.id || ' &middot; review it in the Supabase dashboard (Table editor &rarr; reports).</p>'
  );
  return new;
end;
$$;

revoke all on function public.notify_new_report() from public, anon, authenticated;

drop trigger if exists reports_notify on public.reports;
create trigger reports_notify
  after insert on public.reports
  for each row execute function public.notify_new_report();

-- --------------------------------------------------------------- new message
-- Emails the *other* participant in a conversation. To avoid an email per
-- message during a fast back-and-forth, at most one email per conversation
-- per recipient goes out every v_cooldown; message_email_log tracks the last
-- one sent. RLS is on with no policies -- only this function touches it.
create table if not exists public.message_email_log (
  conversation_id bigint not null references public.conversations (id) on delete cascade,
  recipient_id uuid not null references auth.users (id) on delete cascade,
  last_sent_at timestamptz not null default now(),
  primary key (conversation_id, recipient_id)
);
alter table public.message_email_log enable row level security;

create or replace function public.notify_new_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conv public.conversations%rowtype;
  v_recipient uuid;
  v_recipient_email text;
  v_sender text;
  v_last_sent timestamptz;
  v_cooldown interval := interval '15 minutes';
begin
  select * into v_conv from public.conversations where id = new.conversation_id;
  if not found then
    return new;
  end if;

  v_recipient := case when v_conv.buyer_id = new.sender_id then v_conv.seller_id else v_conv.buyer_id end;

  select last_sent_at into v_last_sent
    from public.message_email_log
   where conversation_id = new.conversation_id and recipient_id = v_recipient;

  if v_last_sent is not null and now() - v_last_sent < v_cooldown then
    return new; -- already emailed this person about this conversation recently
  end if;

  select email into v_recipient_email from auth.users where id = v_recipient;
  select username into v_sender from public.profiles where id = new.sender_id;

  perform public.send_alert_email(
    v_recipient_email,
    'New message on CycleUp from ' || coalesce(v_sender, 'someone'),
    '<p><strong>' || public.html_escape(coalesce(v_sender, 'Someone')) || '</strong> sent you a message about "' ||
      public.html_escape(v_conv.listing_title) || '":</p>' ||
    '<blockquote style="margin:12px 0;padding:8px 12px;border-left:3px solid #2d6a4f;color:#333;">' ||
      public.html_escape(left(new.body, 300)) ||
    '</blockquote>' ||
    '<p>Sign in to CycleUp to reply.</p>'
  );

  insert into public.message_email_log (conversation_id, recipient_id, last_sent_at)
  values (new.conversation_id, v_recipient, now())
  on conflict (conversation_id, recipient_id) do update set last_sent_at = excluded.last_sent_at;

  return new;
end;
$$;

revoke all on function public.notify_new_message() from public, anon, authenticated;

drop trigger if exists messages_notify on public.messages;
create trigger messages_notify
  after insert on public.messages
  for each row execute function public.notify_new_message();

-- ---------------------------------------------------------------------------
-- One-time, by hand (not part of running this file): store your Resend key in
-- Vault -- the same "Sending access" key from email-setup.md works. NEVER
-- paste the real key into a file in this repo; run this once in the SQL
-- Editor instead, then clear the editor. See supabase/email-alerts.md.
--
--   select vault.create_secret('re_your_real_key_here', 'resend_api_key',
--     'Resend API key for CycleUp email alerts');
--
-- To check it's stored (without revealing it):
--   select name, created_at from vault.secrets where name = 'resend_api_key';
--
-- To rotate it: delete the old one, then create_secret again.
--   select vault.delete_secret(id) from vault.secrets where name = 'resend_api_key';
