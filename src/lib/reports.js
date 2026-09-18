import { supabase } from "./supabaseClient";

// Files a report about exactly one of: a listing, a person, or a conversation.
// The database enforces the rules (not yourself, not a sample listing, no
// duplicate open reports, an hourly limit) and raises readable errors.
export async function submitReport({ reason, details, listingId, userId, conversationId }) {
  const { error } = await supabase.rpc("submit_report", {
    p_reason: reason,
    p_details: details?.trim() || null,
    p_listing_id: listingId ?? null,
    p_user_id: userId ?? null,
    p_conversation_id: conversationId ?? null,
  });
  if (error) throw error;
}
