# Bot protection: Cloudflare Turnstile

Turnstile is Cloudflare's free "are you a person?" check. It is usually invisible: most people never see a puzzle.
The site shows it on **sign-up, sign-in and password reset**, and Supabase checks the result on its side.

> **Order matters, or everyone gets locked out.** Once CAPTCHA is switched on in Supabase, Supabase rejects every
> sign-up / sign-in / reset that doesn't carry a valid check. So the site must already be sending the check (steps 1-3)
> *before* you switch it on in Supabase (step 4). If you are ever locked out, turn CAPTCHA off in Supabase again.

## 1. Create a Turnstile widget

1. Sign up / log in at dash.cloudflare.com (free), then open **Turnstile** in the sidebar.
2. **Add widget**:
   - **Name:** `CycleUp`
   - **Hostnames:** add `localhost` (for development). When you deploy, also add your real domain(s), e.g. `thecycleup.com`
     and `www.thecycleup.com`. A widget only works on hostnames listed here.
   - **Widget mode:** *Managed* (recommended).
3. You get two keys:
   - **Site key**: public. It goes in the website.
   - **Secret key**: private. It goes **only** into Supabase (step 4). Never put it in the code, a file in this repo, or a chat.

## 2. Give the site its key

In `.env.local` add (the site key is public, so this is safe):

```
VITE_TURNSTILE_SITE_KEY=<your site key>
```

Restart the dev server (Vite only reads env at startup). For production, add the same variable in Netlify → Site settings →
Environment variables, then redeploy.

## 3. Check the site shows the check

Open `/login`, `/signup` and `/forgot-password`. The sign-in / create-account / send buttons should stay greyed for a second or
two and then unlock once the check finishes. Without a site key the whole feature is off, and the Privacy Policy doesn't mention it.

## 4. Turn it on in Supabase (only after steps 1-3)

Supabase → **Authentication → Attack Protection** (older dashboards: *Bot and Abuse Protection*) → **Enable CAPTCHA protection**:

- **Provider:** Turnstile by Cloudflare
- **Secret key:** paste the secret from step 1
- Save.

## 5. Test

- Signing up, signing in and requesting a password reset all still work in the browser.
- A request with no check is refused. In the browser console on the site you can confirm this: a sign-in call without a
  captcha token now fails with `captcha_failed`.

## When you deploy

Add your real domain to the widget's **Hostnames** in Cloudflare, add `VITE_TURNSTILE_SITE_KEY` to the host's environment
variables, and redeploy. The site's Content-Security-Policy already allows `challenges.cloudflare.com` (script and frame).
