import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { countUnread } from "../lib/messages";
import { MessagesContext } from "./messages-context";
import { useAuth } from "./auth-context";

// Tracks the unread-message count for the navbar badge. New messages arrive
// over a realtime subscription (the database only sends rows the user may see).
export function MessagesProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [unread, setUnread] = useState(0);

  const refreshUnread = useCallback(async () => {
    if (!userId) return;
    try {
      setUnread(await countUnread(userId));
    } catch (err) {
      console.error("Couldn't load unread count:", err.message);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    countUnread(userId)
      .then(n => { if (!cancelled) setUnread(n); })
      .catch(err => console.error("Couldn't load unread count:", err.message));
    const channel = supabase
      .channel(`unread-${userId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, payload => {
        if (payload.new.sender_id !== userId) refreshUnread();
      })
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [userId, refreshUnread]);

  return (
    <MessagesContext.Provider value={{ unread: userId ? unread : 0, refreshUnread }}>
      {children}
    </MessagesContext.Provider>
  );
}
