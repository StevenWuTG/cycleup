// Cloudflare Turnstile ("are you a person?") for sign-up, sign-in and password
// reset. It is entirely off unless VITE_TURNSTILE_SITE_KEY is set, so the site
// works without it. IMPORTANT: turning CAPTCHA on in Supabase (Authentication ->
// Attack Protection) makes Supabase reject every sign-up/sign-in/reset that has
// no token, so the site key must be deployed *before* Supabase enforces it.
export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "";
export const captchaEnabled = Boolean(TURNSTILE_SITE_KEY);

const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let loading = null;

// Loads Cloudflare's script once and resolves with window.turnstile.
export function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  loading ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve(window.turnstile);
    script.onerror = () => { loading = null; reject(new Error("Couldn't load the security check.")); };
    document.head.appendChild(script);
  });
  return loading;
}
