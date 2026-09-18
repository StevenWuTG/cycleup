import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { friendlyAuthError } from "../lib/authErrors";
import { AuthContext } from "./auth-context";

// Where links in our emails (confirm, reset, change email) land. The email
// templates in supabase/email-templates send people here with a one-time token.
const confirmUrl = () => `${window.location.origin}/auth/confirm`;

// Runs a Supabase auth call and turns a failure into a friendly Error.
async function run(call) {
  const { data, error } = await call;
  if (error) throw friendlyAuthError(error);
  return data;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => subscription.unsubscribe();
  }, []);

  const user = session?.user ?? null;
  const userId = user?.id;

  // The profiles table is the source of truth for the username (it's what the
  // database stamps on listings). Accounts created outside the signup form get
  // a generated name there, so don't rely on signup metadata.
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    supabase.from("profiles").select("username").eq("id", userId).maybeSingle()
      .then(({ data }) => {
        if (!cancelled && data) setProfile({ id: userId, username: data.username });
      });
    return () => { cancelled = true; };
  }, [userId]);

  const username = !user ? null
    : profile?.id === user.id ? profile.username
    : user.user_metadata?.username ?? user.email;

  async function signUp({ email, password, username, captchaToken }) {
    const { data: taken } = await supabase
      .from("profiles").select("id").eq("username", username).maybeSingle();
    if (taken) throw new Error("That username is already taken.");

    const data = await run(supabase.auth.signUp({
      email,
      password,
      options: { data: { username }, emailRedirectTo: confirmUrl(), captchaToken },
    }));
    // With email confirmation on, an existing address comes back as a user
    // with no identities instead of an error.
    if (data.user && data.user.identities?.length === 0) {
      throw new Error("An account with this email already exists.");
    }
    // No session yet means the user still has to confirm their email.
    return { needsConfirmation: !data.session };
  }

  async function signIn({ email, password, captchaToken }) {
    await run(supabase.auth.signInWithPassword({ email, password, options: { captchaToken } }));
  }

  async function signOut() {
    await run(supabase.auth.signOut());
  }

  // Emails a password-reset link. Supabase gives the same answer whether or not
  // the address has an account, so this can't be used to discover who is registered.
  async function sendPasswordReset(email, captchaToken) {
    await run(supabase.auth.resetPasswordForEmail(email, { redirectTo: confirmUrl(), captchaToken }));
  }

  async function resendConfirmation(email, captchaToken) {
    await run(supabase.auth.resend({ type: "signup", email, options: { emailRedirectTo: confirmUrl(), captchaToken } }));
  }

  // Exchanges the one-time token from an email link for a signed-in session.
  async function verifyEmailToken({ tokenHash, type }) {
    await run(supabase.auth.verifyOtp({ token_hash: tokenHash, type }));
  }

  async function updatePassword(password) {
    await run(supabase.auth.updateUser({ password }));
    // After a password change, sign out every other device/browser.
    await supabase.auth.signOut({ scope: "others" });
  }

  async function updateEmail(email) {
    await run(supabase.auth.updateUser({ email }, { emailRedirectTo: confirmUrl() }));
  }

  return (
    <AuthContext.Provider value={{
      user, username, loading,
      signUp, signIn, signOut,
      sendPasswordReset, resendConfirmation, verifyEmailToken, updatePassword, updateEmail,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
