import { useState } from "react";
import { Link } from "react-router-dom";
import { KeyRound, Mail } from "lucide-react";
import { AuthCard, FormError, PrimaryButton, TextField } from "../components/AuthCard";
import { useAuth } from "../context/auth-context";
import { usePageTitle } from "../lib/usePageTitle";

export default function ForgotPassword() {
  usePageTitle("Reset your password");
  const { sendPasswordReset } = useAuth();
  const [email, setEmail]       = useState("");
  const [error, setError]       = useState("");
  const [sent, setSent]         = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setError("Enter a valid email address."); return; }
    setSubmitting(true);
    setError("");
    try {
      await sendPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <AuthCard icon={<Mail size={22} />} title="Check your email">
        <p className="text-[#6b7280] mb-6">
          If there's a CycleUp account for <span className="font-semibold text-[#2d6a4f]">{email.trim()}</span>, we've sent a link
          to reset its password. It only works for a limited time, so use it soon. If nothing arrives, check your spam folder.
        </p>
        <div className="flex items-center justify-between text-sm">
          <button type="button" onClick={() => setSent(false)} className="font-semibold text-[#2d6a4f] hover:underline">
            Try a different email
          </button>
          <Link to="/login" className="font-semibold text-[#2d6a4f] hover:underline">Back to sign in</Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      icon={<KeyRound size={22} />} title="Forgot your password?"
      subtitle="Enter your email and we'll send you a link to choose a new one."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <TextField
          id="email" label="Email" type="email" autoComplete="email" placeholder="you@example.com" autoFocus
          value={email} onChange={e => { setEmail(e.target.value); setError(""); }}
        />
        <FormError>{error}</FormError>
        <PrimaryButton type="submit" disabled={submitting}>
          {submitting ? "Sending…" : "Send reset link"}
        </PrimaryButton>
      </form>
      <p className="text-sm text-[#6b7280] text-center mt-6">
        Remembered it? <Link to="/login" className="font-semibold text-[#2d6a4f] hover:underline">Sign in</Link>
      </p>
    </AuthCard>
  );
}
