import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { AuthContext } from "./auth-context";

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

  async function signUp({ email, password, username }) {
    const { data: taken } = await supabase
      .from("profiles").select("id").eq("username", username).maybeSingle();
    if (taken) throw new Error("That username is already taken.");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username }, emailRedirectTo: window.location.origin },
    });
    if (error) throw error;
    // With email confirmation on, an existing address comes back as a user
    // with no identities instead of an error.
    if (data.user && data.user.identities?.length === 0) {
      throw new Error("An account with this email already exists.");
    }
    // No session yet means the user still has to confirm their email.
    return { needsConfirmation: !data.session };
  }

  async function signIn({ email, password }) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  return (
    <AuthContext.Provider value={{ user, username, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
