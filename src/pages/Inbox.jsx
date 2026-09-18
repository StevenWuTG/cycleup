import { usePageTitle } from "../lib/usePageTitle";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Leaf, MessageCircle } from "lucide-react";
import { useAuth } from "../context/auth-context";
import { useMessages } from "../context/messages-context";
import { fetchInbox } from "../lib/messages";
import { formatWhen } from "../lib/format";

export default function Inbox() {
  usePageTitle("Messages");
  const { user } = useAuth();
  const { unread } = useMessages();
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");

  // Re-runs when the unread count changes, so new messages show up live.
  useEffect(() => {
    let cancelled = false;
    fetchInbox(user.id)
      .then(rows => { if (!cancelled) setItems(rows); })
      .catch(err => { if (!cancelled) setError(err.message); });
    return () => { cancelled = true; };
  }, [user.id, unread]);

  return (
    <div className="min-h-screen bg-[#f8f4ed]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="bg-gradient-to-br from-[#1b4332] to-[#2d6a4f]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif" }} className="text-4xl lg:text-5xl font-bold text-white">
            Messages
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 pb-16">
        {error ? (
          <p className="bg-white rounded-3xl border border-red-200 py-12 text-center text-sm text-red-500">{error}</p>
        ) : items === null ? (
          <p className="py-16 text-center text-sm text-[#8d8073]">Loading messages…</p>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#e8e0d5] py-16 text-center px-6">
            <Leaf size={40} className="text-[#d8f3dc] mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-[#1a2e1e] mb-1">No messages yet</h2>
            <p className="text-sm text-[#8d8073] mb-4">
              Found something you love? Use "Contact Seller" on a listing to start a conversation.
            </p>
            <Link to="/marketplace" className="text-sm font-semibold text-[#2d6a4f] hover:underline">Browse the marketplace</Link>
          </div>
        ) : (
          <ul className="bg-white rounded-3xl border border-[#e8e0d5] shadow-sm divide-y divide-[#f0ebe2] overflow-hidden">
            {items.map(c => (
              <li key={c.id}>
                <Link to={`/messages/${c.id}`} className="flex items-start gap-3 px-5 py-4 hover:bg-[#faf6f0] transition-colors">
                  <div className="w-10 h-10 rounded-full bg-[#d8f3dc] flex items-center justify-center shrink-0">
                    <MessageCircle size={17} className="text-[#2d6a4f]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className={`truncate text-sm ${c.unread ? "font-bold text-[#1a2e1e]" : "font-semibold text-[#1a2e1e]"}`}>
                        @{c.otherName}
                      </span>
                      <span className="text-xs text-[#a0785a] shrink-0">{formatWhen(c.last_message_at)}</span>
                    </div>
                    <div className="text-xs text-[#a0785a] truncate">re: {c.listing_title}</div>
                    <div className={`text-sm truncate mt-0.5 ${c.unread ? "text-[#1a2e1e] font-medium" : "text-[#6b7280]"}`}>
                      {c.last_message}
                    </div>
                  </div>
                  {c.unread > 0 && (
                    <span className="mt-1 min-w-5 h-5 px-1.5 rounded-full bg-[#52b788] text-[#0a1f15] text-xs font-bold flex items-center justify-center shrink-0">
                      {c.unread}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
