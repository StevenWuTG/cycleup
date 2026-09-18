import { supabase } from "./supabaseClient";

// Starts (or continues) the caller's conversation about a listing and sends
// the first message. The database enforces the rules (no messaging yourself,
// no demo listings) and raises readable errors.
export async function startConversation(listingId, body) {
  const { data, error } = await supabase.rpc("start_conversation", {
    p_listing_id: listingId,
    p_body: body,
  });
  if (error) throw error;
  return data; // the conversation id
}

export async function sendMessage(conversationId, body) {
  const { data, error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, body: body.trim() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function markConversationRead(conversationId) {
  const { error } = await supabase.rpc("mark_conversation_read", { p_conversation_id: conversationId });
  if (error) throw error;
}

// The caller's existing conversation about a listing, if any.
export async function findConversation(listingId, buyerId) {
  const { data, error } = await supabase
    .from("conversations").select("id")
    .eq("listing_id", listingId).eq("buyer_id", buyerId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function countUnread(userId) {
  const { count, error } = await supabase
    .from("messages").select("id", { count: "exact", head: true })
    .is("read_at", null).neq("sender_id", userId);
  if (error) throw error;
  return count ?? 0;
}

async function usernamesById(ids) {
  if (ids.length === 0) return {};
  const { data, error } = await supabase.from("profiles").select("id, username").in("id", ids);
  if (error) throw error;
  return Object.fromEntries(data.map(p => [p.id, p.username]));
}

// Inbox: my conversations, newest activity first, with the other person's
// username and how many of their messages I haven't read.
export async function fetchInbox(userId) {
  const { data: conversations, error } = await supabase
    .from("conversations").select("*").order("last_message_at", { ascending: false });
  if (error) throw error;

  const { data: unreadRows, error: unreadError } = await supabase
    .from("messages").select("conversation_id").is("read_at", null).neq("sender_id", userId);
  if (unreadError) throw unreadError;
  const unreadBy = {};
  for (const r of unreadRows) unreadBy[r.conversation_id] = (unreadBy[r.conversation_id] ?? 0) + 1;

  const names = await usernamesById([...new Set(conversations.map(c => (c.buyer_id === userId ? c.seller_id : c.buyer_id)))]);
  return conversations.map(c => {
    const otherId = c.buyer_id === userId ? c.seller_id : c.buyer_id;
    return { ...c, otherName: names[otherId] ?? "unknown", unread: unreadBy[c.id] ?? 0 };
  });
}

// One thread. Returns null when it doesn't exist or the caller isn't a
// participant (row-level security makes those indistinguishable).
export async function fetchThread(conversationId, userId) {
  const { data: conversation, error } = await supabase
    .from("conversations").select("*").eq("id", conversationId).maybeSingle();
  if (error) throw error;
  if (!conversation) return null;

  const { data: messages, error: messagesError } = await supabase
    .from("messages").select("*").eq("conversation_id", conversationId).order("id", { ascending: true });
  if (messagesError) throw messagesError;

  const otherId = conversation.buyer_id === userId ? conversation.seller_id : conversation.buyer_id;
  const names = await usernamesById([otherId]);
  return { conversation, messages, otherName: names[otherId] ?? "unknown" };
}
