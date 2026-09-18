# Email setup: Resend + GoDaddy DNS + Supabase

Supabase's built-in email sender is for testing only: it allows a handful of emails per hour and often lands in spam.
For a real site you send account emails (confirm your address, reset a password, change email) through your own provider,
from your own domain. This guide uses **Resend** and the domain **thecycleup.com** (registered at GoDaddy).

> Provider dashboards change. Where this guide shows exact record names or values, trust what your Resend dashboard shows
> over this document. The steps and the reasons stay the same.

If you use a provider other than Resend, change `emailProvider` in `src/config/site.js` (the Privacy Policy reads it).

## 1. Create the Resend account and add your domain

1. Sign up at resend.com (the free tier is plenty to start).
2. **Domains → Add Domain** → enter `thecycleup.com`.
3. Resend shows a list of DNS records to add (typically: a **DKIM** TXT record, an **SPF** TXT record and an **MX** record on a
   `send` sub-domain, and optionally **DMARC**). Keep that page open.

## 2. Add the records at GoDaddy

1. GoDaddy → **My Products → thecycleup.com → DNS** (Manage DNS).
2. **Add** each record Resend lists, copying the *Type*, *Name/Host* and *Value* exactly. GoDaddy usually wants the
   host **without** `.thecycleup.com` on the end (e.g. `resend._domainkey`, not `resend._domainkey.thecycleup.com`).
3. **Don't delete or edit any existing records**, especially existing MX or TXT records for your `Steven@thecycleup.com`
   mailbox. Resend's records live on their own names (`send` and `resend._domainkey`), so they sit alongside yours.
   A domain may have only one SPF record *per name*, and Resend puts its SPF on the `send` name, so there is no clash.
4. Back in Resend press **Verify**. It can take a few minutes, occasionally a few hours.
5. Recommended: add a DMARC record so mailbox providers trust your mail. At GoDaddy add a TXT record named `_dmarc` with a
   value like `v=DMARC1; p=none;` (start with `p=none`, which only monitors).

## 3. Create an API key

Resend → **API Keys → Create** → permission **Sending access**, restricted to `thecycleup.com`. Copy the key
(it starts with `re_`). **Treat it like a password**: paste it only into the Supabase dashboard in step 4; never into the code,
a chat, or a file in this repository.

## 4. Point Supabase at Resend

Supabase → **Authentication → Emails → SMTP Settings** → turn on **Enable custom SMTP**:

| Field | Value |
| --- | --- |
| Sender email | `noreply@thecycleup.com` |
| Sender name | `CycleUp` |
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | your API key (`re_...`) |

Save. (`noreply@` does not need a mailbox: it is only ever a sending address.)

## 5. Use the CycleUp email templates

Supabase → **Authentication → Emails → Templates**. For each template set the **Subject** and paste the file's contents
into the **Message body** (HTML) box. **Replace the whole box** (click in it, **Cmd+A**, then paste). If you paste
*after* Supabase's default text, every email contains the default message above ours, and the default's one-click link
is the kind mail scanners use up. Two things we hit when setting this up:

- The **Confirm sign up** and **Change email address** templates would not save until **Confirm email** was turned on
  (step 6). If a template won't save, turn that on first, then retry.
- Check **SMTP Settings → Sender name** says `CycleUp`; ours first showed a personal name in the inbox.


| Supabase template | Subject | File |
| --- | --- | --- |
| Confirm sign up | `Confirm your CycleUp account` | `supabase/email-templates/confirm-signup.html` |
| Reset password | `Reset your CycleUp password` | `supabase/email-templates/reset-password.html` |
| Change email address | `Confirm your new CycleUp email` | `supabase/email-templates/change-email.html` |

These links go **straight to the site** (`/auth/confirm`) with a one-time token, and the token is only used when the person
presses the button on that page. This matters because some mail systems open every link in an email to scan it, which would
use up Supabase's default one-click links before the recipient sees them. It also works when someone signs up on one device
and opens the email on another. The unused templates (Magic link, Invite, Reauthentication) can stay as they are: the app
doesn't use them.

## 6. Turn on the sign-in protections

Supabase → **Authentication**:

- **Sign In / Providers → Email**: turn **Confirm email** **on**. Set **Minimum password length** to **8** (the app
  already requires 8; this makes the server enforce it too).
- **URL Configuration**:
  - **Site URL**: `http://localhost:5173` while developing; change it to your real address (e.g. `https://thecycleup.com`) when you deploy.
  - **Redirect URLs**: add `http://localhost:5173/**` and, once deployed, `https://<your address>/**`. Email links only work for
    addresses on this list.
- **Rate Limits**: with your own SMTP the default hourly email limit can be raised; review it.

## 7. Test the whole thing

Use a throwaway address you can read (with Gmail, `yourname+test1@gmail.com` lands in your normal inbox).

1. **Sign up** with it. You should see "Check your email" and receive the CycleUp confirmation email (from `CycleUp <noreply@thecycleup.com>`).
2. Open the link, press **Confirm my email**, and see "You're all set".
3. **Sign out**, then on the sign-in page choose **Forgot password?** and request a reset.
4. Open the reset email's link, press **Continue**, choose a new password, and sign in with it.
5. Sign in with a wrong password, and check the message reads "Incorrect email or password."
6. In **Account settings**, change the password, and try changing the email.
7. Check the messages didn't land in spam. If they do, wait for DNS to fully verify and confirm the DMARC record exists.

When the site goes live, repeat step 6's Site URL / Redirect URLs with the production address, then repeat this test.
