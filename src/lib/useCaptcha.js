import { useCallback, useState } from "react";
import { captchaEnabled } from "./captcha";

// State for one form's security check. `ready` is true when the form may be
// submitted: always when CAPTCHA is off, otherwise once a token has arrived. A
// token works only once, so call refresh() after every attempt to get a new one.
export function useCaptcha() {
  const [token, setToken]       = useState(null);
  const [resetKey, setResetKey] = useState(0);
  const refresh = useCallback(() => { setToken(null); setResetKey(k => k + 1); }, []);
  return { enabled: captchaEnabled, token, setToken, resetKey, refresh, ready: !captchaEnabled || !!token };
}
