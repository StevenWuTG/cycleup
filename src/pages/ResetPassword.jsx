import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound } from "lucide-react";
import { AuthCard, FormError, PrimaryButton, TextField } from "../components/AuthCard";
import { useAuth } from "../context/auth-context";
import { usePageTitle } from "../lib/usePageTitle";

// Reached after pressing "Continue" on the reset link's page, which signs the
// person in with a recovery session. Without a session there's nothing to reset.
export default function ResetPassword() {
  usePageTitle("Choose a new password");
  const { user, loading, updatePassword } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]     = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [done, setDone]     = useState(false);

  if (loading) return null;

  if (!user && !done) {
    return (
      <AuthCard title="This link has expired" subtitle="Reset links only work once, for a limited time.">
        <Link
          to="/forgot-password"
          className="block w-full text-center bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-bold py-3.5 rounded-xl transition-colors"
        >
          Send a new reset link
        </Link>
      </AuthCard>
    );
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: "" }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (form.password.length < 8) errs.password = "Password must be at least 8 characters.";
    if (form.confirm !== form.password) errs.confirm = "Passwords don't match.";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    setSubmitError("");
    try {
      await updatePassword(form.password);
      setDone(true);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <AuthCard title="Password updated" subtitle="You're signed in. Any other devices have been signed out.">
        <button
          type="button" onClick={() => navigate("/marketplace", { replace: true })}
          className="w-full bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-bold py-3.5 rounded-xl transition-colors"
        >
          Continue to CycleUp
        </button>
      </AuthCard>
    );
  }

  return (
    <AuthCard icon={<KeyRound size={22} />} title="Choose a new password" subtitle="Pick something you don't use anywhere else.">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <TextField
          id="password" label="New password" type="password" autoComplete="new-password" placeholder="At least 8 characters" autoFocus
          value={form.password} onChange={handleChange} error={errors.password}
        />
        <TextField
          id="confirm" label="Confirm new password" type="password" autoComplete="new-password"
          value={form.confirm} onChange={handleChange} error={errors.confirm}
        />
        <FormError>{submitError}</FormError>
        <PrimaryButton type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Update password"}
        </PrimaryButton>
      </form>
    </AuthCard>
  );
}
