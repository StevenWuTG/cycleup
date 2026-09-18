import { supabase } from "./supabaseClient";

// Profiles are public (username + join date). Both return null when there's
// no such profile.
export async function fetchProfileByUsername(username) {
  const { data, error } = await supabase
    .from("profiles").select("id, username, created_at")
    .eq("username", username.toLowerCase()).maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchProfileById(id) {
  const { data, error } = await supabase
    .from("profiles").select("id, username, created_at").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}
