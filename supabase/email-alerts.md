# Email alerts: reports and new messages

Two automatic emails, sent straight from Postgres -- no Edge Function, no server:

- **New report** &rarr; an email to `Steven@thecycleup.com` (the site owner) with the reason,
  what/who was reported, and any details.
- **New message** &rarr; an email to whichever participant *didn't* send it, so a seller (or buyer)
  finds out even if they're not sitting in the app. At most one email per conversation per person
  every 15 minutes, so a fast back-and-forth doesn't turn into an inbox flood.

This reuses the Resend account and domain from [email-setup.md](email-setup.md) -- it's a second,
independent use of the same account (Supabase's own account-recovery emails are unaffected either way).

## 1. Enable two extensions

Supabase dashboard -> **Database -> Extensions**:

- **pg_net** -- lets Postgres make an outbound HTTP request (to Resend's API).
- **Supabase Vault** -- lets Postgres hold the Resend API key encrypted at rest. Usually already
  enabled on new projects; enable it if you don't see it listed as active.

## 2. Run the migration

Run [supabase/email-alerts.sql](email-alerts.sql) in the SQL Editor, after `reports.sql`. It's
re-runnable (it only creates functions/triggers/table), except for step 3 below, which you run
separately.

## 3. Store your Resend API key (once, by hand)

Reuse the same key from `email-setup.md` step 3 (starts with `re_`) -- it already has "Sending
access", which is all this needs. **Never paste it into a file in this repo, a commit, or chat.**
In the SQL Editor, run this once with your real key, then clear the editor:

```sql
select vault.create_secret('re_your_real_key_here', 'resend_api_key',
  'Resend API key for CycleUp email alerts');
```

Confirm it's stored (this doesn't reveal the key):

```sql
select name, created_at from vault.secrets where name = 'resend_api_key';
```

If you ever need to rotate it, delete the old secret and create a new one:

```sql
select vault.delete_secret(id) from vault.secrets where name = 'resend_api_key';
select vault.create_secret('re_new_key_here', 'resend_api_key', 'Resend API key for CycleUp email alerts');
```

Until this secret exists, both triggers run but silently send nothing -- reports and messages
still work normally, they just don't email anyone. Nothing in the app shows this either way.

## 4. Test it

- **Report:** as any signed-in test account, report a listing or a seller. Check
  `Steven@thecycleup.com`'s inbox for "New report on CycleUp".
- **Message:** send a message between two test accounts. Check the *recipient's* inbox for
  "New message on CycleUp from &lt;sender&gt;". Send a second message right away -- it should
  **not** send a second email (that's the 15-minute cooldown). To re-test sooner, delete that
  conversation's row so the cooldown resets:

  ```sql
  delete from public.message_email_log where conversation_id = <id>;
  ```

## 5. If an email doesn't show up

1. Check it isn't in spam.
2. Check Resend's own dashboard -> **Logs** for the send attempt and any delivery error.
3. Check pg_net actually made the request:

   ```sql
   select * from net._http_response order by id desc limit 5;
   ```

   A non-2xx `status_code` or a populated error column means Resend (or the request itself)
   rejected it -- the response body/error usually says why (e.g. an invalid key, or the `from`
   address's domain isn't verified).
4. Confirm the secret exists (`select name from vault.secrets;` should list `resend_api_key`).

The site owner's address (`Steven@thecycleup.com`) is hardcoded in `notify_new_report()` inside
`email-alerts.sql` -- edit and re-run that file if it changes.
