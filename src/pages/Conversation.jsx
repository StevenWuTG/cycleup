import { usePageTitle } from "../lib/usePageTitle";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Leaf, Send } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { fetchThread, markConversationRead, sendMessage } from "../lib/messages";
import { formatWhen } from "../lib/format";
import ReportButton from "../components/ReportButton";
import { useAuth } from "../context/auth-context";
import { useMessages } from "../context/messages-context";

const fontStyle = { fontFamily: "'Inter Variable', system-ui, sans-serif" };

// Merge by id so a message that arrives both from our own send and from the
// realtime feed (or before the initial fetch finishes) is only shown once.
function mergeMessages(prev, incoming) {
  const byId = new Map();
  for (const m of [...prev, ...incoming]) byId.set(m.id, m);
  return [...byId.values()].sort((a, b) => a.id - b.id);
}

function Thread({ id }) {
  const { user } = useAuth();
  const { refreshUnread } = useMessages();
  const [thread, setThread]     = useState(undefined); // undefined = loading, null = not found
  const [messages, setMessages] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [draft, setDraft]       = useState("");
  const [sending, setSending]   = useState(false);
  const [sendError, setSendError] = useState("");
  const bottomRef = useRef(null);
  usePageTitle("Messages");

  const addMessages = useCallback(list => setMessages(prev => mergeMessages(prev, list)), []);

  useEffect(() => {
    let cancelled = false;
    const markRead = () =>
      markConversationRead(id).then(refreshUnread).catch(err => console.error("Couldn't mark as read:", err.message));

    fetchThread(id, user.id)
      .then(result => {
        if (cancelled) return;
        setThread(result);
        if (result) {
          addMessages(result.messages);
          markRead();
        }
      })
      .catch(err => { if (!cancelled) setLoadError(err.message); });

    const channel = supabase
      .channel(`thread-${id}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${id}` },
        payload => {
          addMessages([payload.new]);
          if (payload.new.sender_id !== user.id) markRead();
        })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [id, user.id, refreshUnread, addMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  async function handleSend(e) {
    e?.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setSendError("");
    try {
      addMessages([await sendMessage(id, body)]);
      setDraft("");
    } catch (err) {
      setSendError(err.message || "Couldn't send your message.");
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (loadError) {
    return <div className="min-h-screen bg-[#f8f4ed] flex items-center justify-center px-4 text-sm text-red-500" style={fontStyle}>{loadError}</div>;
  }
  if (thread === undefined) {
    return <div className="min-h-screen bg-[#f8f4ed] flex items-center justify-center text-sm text-[#8d8073]" style={fontStyle}>Loading conversation…</div>;
  }
  if (thread === null) {
    return (
      <div className="min-h-screen bg-[#f8f4ed] flex items-center justify-center px-4 text-center" style={fontStyle}>
        <div>
          <Leaf size={40} className="text-[#d8f3dc] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#1a2e1e] mb-2">Conversation not found</h1>
          <Link to="/messages" className="text-sm font-semibold text-[#2d6a4f] hover:underline">← Back to messages</Link>
        </div>
      </div>
    );
  }

  const { conversation, otherName } = thread;

  return (
    <div className="min-h-screen bg-[#f8f4ed]" style={fontStyle}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col min-h-[calc(100vh-4rem)]">
        <Link to="/messages" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6b7280] hover:text-[#2d6a4f] transition-colors mb-4">
          <ArrowLeft size={15} />
          All messages
        </Link>

        <div className="bg-white rounded-2xl border border-[#e8e0d5] px-5 py-4 mb-4">
          <div className="flex items-start justify-between gap-3">
            <div style={{ fontFamily: "'Fraunces Variable', Georgia, serif" }} className="text-xl font-bold text-[#1b4332]">@{otherName}</div>
            <ReportButton
              label="Report" heading={`Report your conversation with @${otherName}`} target={{ conversationId: conversation.id }}
              className="text-[#a0785a] hover:text-red-600 shrink-0 pt-1.5"
            />
          </div>
          <div className="text-sm text-[#8d8073]">
            about{" "}
            {conversation.listing_id ? (
              <Link to={`/item/${conversation.listing_id}`} className="font-medium text-[#2d6a4f] hover:underline">{conversation.listing_title}</Link>
            ) : (
              <span>{conversation.listing_title} <span className="text-[#a0785a]">(listing removed)</span></span>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-3 pb-4">
          {messages.map(m => {
            const mine = m.sender_id === user.id;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${mine ? "bg-[#2d6a4f] text-white rounded-br-md" : "bg-white border border-[#e8e0d5] text-[#1a2e1e] rounded-bl-md"}`}>
                  <p className="text-sm whitespace-pre-wrap break-words">{m.body}</p>
                  <p className={`text-[11px] mt-1 ${mine ? "text-white/60" : "text-[#a0785a]"}`}>{formatWhen(m.created_at)}</p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="sticky bottom-0 bg-[#f8f4ed] pt-2 pb-4">
          {sendError && <p className="text-red-500 text-xs mb-2">{sendError}</p>}
          <div className="flex items-end gap-2">
            <textarea
              value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={handleKeyDown}
              rows={2} maxLength={2000} placeholder="Write a message…" aria-label="Message"
              className="flex-1 border border-[#ddd6cc] hover:border-[#a0785a] rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#52b788] bg-white text-[#1a2e1e] placeholder:text-[#c4a882]"
            />
            <button
              type="submit" disabled={sending || !draft.trim()} aria-label="Send message"
              className="bg-[#2d6a4f] hover:bg-[#1b4332] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl p-3.5 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-[11px] text-[#a0785a] mt-1.5">Enter to send · Shift+Enter for a new line</p>
        </form>
      </div>
    </div>
  );
}

// Keyed by id so moving between conversations resets all thread state.
export default function Conversation() {
  const { id } = useParams();
  return <Thread key={id} id={id} />;
}
