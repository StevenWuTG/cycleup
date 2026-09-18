import { usePageTitle } from "../lib/usePageTitle";
import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { Leaf, Mail } from "lucide-react";
import { useAuth } from "../context/auth-context";

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export default function Auth({ mode }) {
  const isSignUp = mode === "signup";
  const { user, loading, signIn, signUp } = useAuth();
  const location = useLocation();
  const from = location.state?.from ?? "/marketplace";

  const [form, setForm]         = useState({ email: "", password: "", username: "" });
  const [errors, setErrors]     = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [confirmEmail, setConfirmEmail] = useState(false);
  usePageTitle(isSignUp ? "Create an account" : "Sign in");

  if (!loading && user) return <Navigate to={from} replace />;

  const inputClass = err =>
    `w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#52b788] transition bg-white text-[#1a2e1e] placeholder:text-[#c4a882] ${
      err ? "border-red-400 bg-red-50" : "border-[#ddd6cc] hover:border-[#a0785a]"
    }`;

  function handleChange(e) {
    const { name } = e.target;
    const value = name === "username" ? e.target.value.toLowerCase() : e.target.value;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
  }

  function validate() {
    const e = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = "Enter a valid email address.";
    if (isSignUp) {
      if (!USERNAME_RE.test(form.username)) e.username = "3–20 characters: lowercase letters, numbers, underscores.";
      if (form.password.length < 8) e.password = "Password must be at least 8 characters.";
    } else if (!form.password) {
      e.password = "Enter your password.";
    }
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    setSubmitError("");
    try {
      const email = form.email.trim();
      if (isSignUp) {
        const { needsConfirmation } = await signUp({ email, password: form.password, username: form.username });
        if (needsConfirmation) setConfirmEmail(true);
      } else {
        await signIn({ email, password: form.password });
      }
      // On success the user state updates and the redirect above takes over.
    } catch (err) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const shell = children => (
    <div className="min-h-screen bg-[#f8f4ed] flex items-center justify-center px-4 py-12" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="bg-white rounded-3xl shadow-lg border border-[#e8e0d5] p-8 sm:p-10 max-w-md w-full">
        {children}
      </div>
    </div>
  );

  if (confirmEmail) return shell(
    <div className="text-center">
      <div className="w-16 h-16 bg-[#d8f3dc] rounded-full flex items-center justify-center mx-auto mb-5">
        <Mail size={30} className="text-[#52b788]" />
      </div>
      <h1 style={{ fontFamily: "'Fraunces', Georgia, serif" }} className="text-3xl font-bold text-[#1b4332] mb-2">
        Check your email
      </h1>
      <p className="text-[#6b7280] mb-6">
        We sent a confirmation link to <span className="font-semibold text-[#2d6a4f]">{form.email.trim()}</span>.
        Click it, then sign in.
      </p>
      <Link to="/login" state={{ from }} className="text-sm font-semibold text-[#2d6a4f] hover:underline">
        Go to sign in
      </Link>
    </div>
  );

  return shell(
    <>
      <div className="w-12 h-12 bg-[#d8f3dc] rounded-2xl flex items-center justify-center mb-5">
        <Leaf size={22} className="text-[#2d6a4f]" />
      </div>
      <h1 style={{ fontFamily: "'Fraunces', Georgia, serif" }} className="text-3xl font-bold text-[#1b4332] mb-1">
        {isSignUp ? "Join CycleUp" : "Welcome back"}
      </h1>
      <p className="text-[#6b7280] text-sm mb-6">
        {isSignUp ? "Create an account to list your upcycled items." : "Sign in to list and manage your items."}
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {isSignUp && (
          <div>
            <label htmlFor="username" className="block text-sm font-semibold text-[#1a2e1e] mb-2">Username</label>
            <input
              id="username" name="username" type="text" autoComplete="username"
              value={form.username} onChange={handleChange} placeholder="e.g. ecowoodworks"
              className={inputClass(errors.username)}
            />
            {errors.username && <p className="text-red-500 text-xs mt-1.5">{errors.username}</p>}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-[#1a2e1e] mb-2">Email</label>
          <input
            id="email" name="email" type="email" autoComplete="email"
            value={form.email} onChange={handleChange} placeholder="you@example.com"
            className={inputClass(errors.email)}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-[#1a2e1e] mb-2">Password</label>
          <input
            id="password" name="password" type="password"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            value={form.password} onChange={handleChange}
            placeholder={isSignUp ? "At least 8 characters" : "Your password"}
            className={inputClass(errors.password)}
          />
          {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password}</p>}
        </div>

        {submitError && (
          <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{submitError}</p>
        )}

        <button
          type="submit" disabled={submitting}
          className="w-full bg-[#2d6a4f] hover:bg-[#1b4332] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors"
        >
          {submitting ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}
        </button>
        {isSignUp && (
          <p className="text-xs text-[#8d8073] text-center leading-relaxed">
            By creating an account you agree to our{" "}
            <Link to="/terms" target="_blank" className="font-medium text-[#2d6a4f] underline underline-offset-2">Terms</Link>{" "}
            and{" "}
            <Link to="/privacy" target="_blank" className="font-medium text-[#2d6a4f] underline underline-offset-2">Privacy Policy</Link>.
          </p>
        )}
      </form>

      <p className="text-sm text-[#6b7280] text-center mt-6">
        {isSignUp ? "Already have an account? " : "New to CycleUp? "}
        <Link
          to={isSignUp ? "/login" : "/signup"} state={{ from }}
          className="font-semibold text-[#2d6a4f] hover:underline"
        >
          {isSignUp ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </>
  );
}
