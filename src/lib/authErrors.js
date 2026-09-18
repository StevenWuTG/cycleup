// Supabase reports failures with a machine-readable `code`. Map the ones people
// actually hit to plain language; anything else falls back to Supabase's own
// message. The `code` is kept on the returned Error so callers can react to it
// (e.g. offer to resend a confirmation email).
const MESSAGES = {
  invalid_credentials: "Incorrect email or password.",
  email_not_confirmed: "Please confirm your email address before signing in.",
  over_email_send_rate_limit: "We've sent too many emails recently. Please wait a few minutes and try again.",
  over_request_rate_limit: "Too many attempts. Please wait a moment and try again.",
  user_already_exists: "An account with this email already exists.",
  email_exists: "An account with this email already exists.",
  weak_password: "That password is too weak. Use at least 8 characters with a mix of letters and numbers.",
  same_password: "Your new password must be different from your current one.",
  captcha_failed: "The security check didn't pass. Please try again.",
  otp_expired: "This link has expired or was already used.",
  reauthentication_needed: "For security, please sign out and sign back in, then try again.",
};

export function friendlyAuthError(error) {
  const friendly = new Error(MESSAGES[error.code] ?? error.message ?? "Something went wrong. Please try again.");
  friendly.code = error.code;
  return friendly;
}
