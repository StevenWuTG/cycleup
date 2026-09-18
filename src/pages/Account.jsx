import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { FormError, TextField } from "../components/AuthCard";
import { useAuth } from "../context/auth-context";
import { usePageTitle } from "../lib/usePageTitle";
import { SITE } from "../config/site";

const fontStyle = { fontFamily: "'Inter Variable', system-ui, sans-serif" };

function Card({ title, description, children }) {
  return (
    <section className="bg-white rounded-3xl border border-[#e8e0d5] shadow-sm p-6 sm:p-8">
      <h2 style={{ fontFamily: "'Fraunces Variable', Georgia, serif" }} className="text-xl font-bold text-[#1b4332] mb-1">{title}</h2>
      {description && <p className="text-sm text-[#6b7280] mb-5">{description}</p>}
      {children}
    </section>
  );
}

function SaveButton({ busy, children }) {
  return (
    <button
      type="submit" disabled={busy}
      className="bg-[#2d6a4f] hover:bg-[#1b4332] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition-colors"
    >
      {children}
    </button>
  );
}

function ChangeEmail() {
  const { user, updateEmail } = useAuth();
  const [email, setEmail]   = useState("");
  const [error, setError]   = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy]     = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const next = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(next)) { setError("Enter a valid email address."); return; }
    if (next.toLowerCase() === user.email?.toLowerCase()) { setError("That's already your email address."); return; }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await updateEmail(next);
      setNotice(`We sent a confirmation link to ${next}. Your email changes once you confirm it. You may also need to confirm from your current address.`);
      setEmail("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card title="Email address" description={<>Your sign-in email is <strong className="text-[#1a2e1e]">{user.email}</strong>.</>}>
      {user.new_email && (
        <p className="text-sm bg-[#f0faf3] border border-[#d8f3dc] rounded-xl px-4 py-3 mb-4 text-[#2d6a4f]">
          Waiting for you to confirm <strong>{user.new_email}</strong>. Check that inbox for the link.
        </p>
      )}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <TextField id="email" label="New email address" type="email" autoComplete="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }} />
        <FormError>{error}</FormError>
        {notice && <p role="status" className="text-sm text-[#2d6a4f] bg-[#f0faf3] border border-[#d8f3dc] rounded-xl px-4 py-3">{notice}</p>}
        <SaveButton busy={busy}>{busy ? "Sending…" : "Change email"}</SaveButton>
      </form>
    </Card>
  );
}

function ChangePassword() {
  const { updatePassword } = useAuth();
  const [form, setForm]     = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [error, setError]   = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy]     = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: "" }));
    setNotice("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (form.password.length < 8) errs.password = "Password must be at least 8 characters.";
    if (form.confirm !== form.password) errs.confirm = "Passwords don't match.";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setBusy(true);
    setError("");
    try {
      await updatePassword(form.password);
      setForm({ password: "", confirm: "" });
      setNotice("Password updated. Your other devices have been signed out.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card title="Password" description="Choose a new password. Signing out your other devices keeps your account safe.">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <TextField id="password" label="New password" type="password" autoComplete="new-password" placeholder="At least 8 characters"
          value={form.password} onChange={handleChange} error={errors.password} />
        <TextField id="confirm" label="Confirm new password" type="password" autoComplete="new-password"
          value={form.confirm} onChange={handleChange} error={errors.confirm} />
        <FormError>{error}</FormError>
        {notice && <p role="status" className="text-sm text-[#2d6a4f] bg-[#f0faf3] border border-[#d8f3dc] rounded-xl px-4 py-3">{notice}</p>}
        <SaveButton busy={busy}>{busy ? "Saving…" : "Update password"}</SaveButton>
      </form>
    </Card>
  );
}

export default function Account() {
  usePageTitle("Account settings");
  const subject = encodeURIComponent("Please delete my CycleUp account");
  return (
    <div className="min-h-screen bg-[#f8f4ed]" style={fontStyle}>
      <div className="bg-gradient-to-br from-[#1b4332] to-[#2d6a4f]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
          <Link to="/profile" className="inline-flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-white transition-colors mb-4">
            <ArrowLeft size={15} />
            Back to your profile
          </Link>
          <h1 style={{ fontFamily: "'Fraunces Variable', Georgia, serif" }} className="text-4xl lg:text-5xl font-bold text-white">
            Account settings
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 pb-16 space-y-6">
        <ChangeEmail />
        <ChangePassword />
        <Card
          title="Delete your account"
          description="This removes your profile, your listings and photos, and every conversation you're part of. It can't be undone."
        >
          <a
            href={`mailto:${SITE.contactEmail}?subject=${subject}`}
            className="inline-block border-2 border-red-300 text-red-600 hover:bg-red-50 font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Email us to delete my account
          </a>
        </Card>
      </div>
    </div>
  );
}
