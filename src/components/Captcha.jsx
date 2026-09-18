import { useEffect, useRef, useState } from "react";
import { captchaEnabled, loadTurnstile, TURNSTILE_SITE_KEY } from "../lib/captcha";

// Renders the Turnstile widget (nothing at all when CAPTCHA is off). It reports
// each new token through `onToken` (null when it expires or errors), and
// starts a fresh check whenever `resetKey` changes.
export default function Captcha({ onToken, resetKey = 0 }) {
  const box = useRef(null);
  const widgetId = useRef(null);
  const latest = useRef(onToken);
  const [failed, setFailed] = useState(false);

  useEffect(() => { latest.current = onToken; });

  useEffect(() => {
    if (!captchaEnabled) return;
    let cancelled = false;
    loadTurnstile()
      .then(turnstile => {
        if (cancelled || !box.current) return;
        widgetId.current = turnstile.render(box.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: token => latest.current(token),
          "expired-callback": () => latest.current(null),
          "error-callback": () => latest.current(null),
        });
      })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => {
      cancelled = true;
      if (widgetId.current != null) window.turnstile?.remove(widgetId.current);
      widgetId.current = null;
    };
  }, []);

  useEffect(() => {
    if (resetKey > 0 && widgetId.current != null) window.turnstile?.reset(widgetId.current);
  }, [resetKey]);

  if (!captchaEnabled) return null;
  return (
    <div>
      <div ref={box} />
      {failed && (
        <p role="alert" className="text-red-500 text-xs mt-1.5">
          We couldn't load the security check. If you use an ad or content blocker, allow challenges.cloudflare.com and reload the page.
        </p>
      )}
    </div>
  );
}
