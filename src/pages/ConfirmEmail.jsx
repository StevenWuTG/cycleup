import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, KeyRound, Mail } from "lucide-react";
import { AuthCard, FormError, PrimaryButton } from "../components/AuthCard";
import { useAuth } from "../context/auth-context";
import { usePageTitle } from "../lib/usePageTitle";

// What each kind of email link is for. The link is only *used* when the person
// presses the button, never just by opening the page: security scanners in some
// mail systems open every link in an email to check it, which would otherwise
// spend the one-time token before the real person ever sees it.
const KINDS = {
  recovery:     { title: "Reset your password",     blurb: "Continue to choose a new password.",            button: "Continue",         icon: <KeyRound size={22} />, next: "/reset-password" },
  email:        { title: "Confirm your email",      blurb: "Press the button to finish creating your account.", button: "Confirm my email", icon: <Mail size={22} /> },
  signup:       { title: "Confirm your email",      blurb: "Press the button to finish creating your account.", button: "Confirm my email", icon: <Mail size={22} /> },
  email_change: { title: "Confirm your new email",  blurb: "Press the button to confirm the change.",      button: "Confirm change",   icon: <Mail size={22} /> },
};

export default function ConfirmEmail() {
  const [params] = useSearchParams();
  const { hash } = useLocation();
  const tokenHash = params.get("token_hash");
  // If the link was already used, or opened by a mail scanner, Supabase sends people
  // here with the reason in the #fragment (e.g. #error_code=otp_expired) and no token.
  const linkError = new URLSearchParams(hash.replace(/^#/, "")).get("error_code");
  const kind = KINDS[params.get("type")];
  const { verifyEmailToken } = useAuth();
  const navigate = useNavigate();
  const [working, setWorking] = useState(false);
  const [error, setError]     = useState("");
  const [done, setDone]       = useState(false);
  usePageTitle(kind?.title ?? "Confirm your email");

  if (linkError && !tokenHash) {
    return (
      <AuthCard title="This link has expired" subtitle="Email links only work once, and only for a limited time.">
        <p className="text-sm text-[#6b7280]">
          <Link to="/forgot-password" className="font-semibold text-[#2d6a4f] hover:underline">Send a new password-reset link</Link>
          {" · "}
          <Link to="/login" className="font-semibold text-[#2d6a4f] hover:underline">Sign in</Link>
          {" "}(you can resend a confirmation email from there).
        </p>
      </AuthCard>
    );
  }

  if (!tokenHash || !kind) {
    return (
      <AuthCard title="This link isn't valid" subtitle="It may have been copied incompletely.">
        <p className="text-sm text-[#6b7280]">
          Try opening the link from your email again, or <Link to="/forgot-password" className="font-semibold text-[#2d6a4f] hover:underline">request a new reset link</Link>.
        </p>
      </AuthCard>
    );
  }

  async function handleConfirm() {
    setWorking(true);
    setError("");
    try {
      await verifyEmailToken({ tokenHash, type: params.get("type") });
      if (kind.next) navigate(kind.next, { replace: true });
      else setDone(true);
    } catch (err) {
      setError(err.message);
      setWorking(false);
    }
  }

  if (done) {
    return (
      <AuthCard icon={<CheckCircle size={22} />} title="You're all set" subtitle="Your email is confirmed.">
        <Link
          to="/marketplace"
          className="block w-full text-center bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-bold py-3.5 rounded-xl transition-colors"
        >
          Browse the marketplace
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard icon={kind.icon} title={kind.title} subtitle={kind.blurb}>
      <div className="space-y-4">
        <FormError>{error}</FormError>
        <PrimaryButton type="button" onClick={handleConfirm} disabled={working}>
          {working ? "One moment…" : kind.button}
        </PrimaryButton>
        {error && (
          <p className="text-sm text-[#6b7280] text-center">
            <Link to="/forgot-password" className="font-semibold text-[#2d6a4f] hover:underline">Send a new reset link</Link>
            {" · "}
            <Link to="/login" className="font-semibold text-[#2d6a4f] hover:underline">Sign in</Link>
          </p>
        )}
      </div>
    </AuthCard>
  );
}
