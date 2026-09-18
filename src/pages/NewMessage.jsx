import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Leaf, Send } from "lucide-react";
import ListingImage from "../components/ListingImage";
import { useAuth } from "../context/auth-context";
import { useListings } from "../context/listings-context";
import { findConversation, startConversation } from "../lib/messages";

const fontStyle = { fontFamily: "'Inter', system-ui, sans-serif" };

function Message({ title, body, to, linkText }) {
  return (
    <div className="min-h-screen bg-[#f8f4ed] flex items-center justify-center px-4 py-20 text-center" style={fontStyle}>
      <div className="max-w-sm">
        <Leaf size={40} className="text-[#d8f3dc] mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-[#1a2e1e] mb-2">{title}</h1>
        {body && <p className="text-[#6b7280] mb-6">{body}</p>}
        <Link to={to} className="text-sm font-semibold text-[#2d6a4f] hover:underline">{linkText}</Link>
      </div>
    </div>
  );
}

// Reached from "Contact Seller". If the buyer already has a conversation about
// this listing they're sent straight to it; otherwise they write the first
// message here, and the conversation is created when it's sent.
export default function NewMessage() {
  const { listingId } = useParams();
  const { listings, loading } = useListings();
  const { user } = useAuth();
  const navigate = useNavigate();
  const listing = listings.find(l => String(l.id) === listingId);
  const canMessage = !!listing && !!listing.user_id && listing.user_id !== user.id;
  const numericId = listing?.id;

  const [checked, setChecked] = useState(false);
  const [draft, setDraft]     = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    if (!canMessage) return;
    let cancelled = false;
    findConversation(numericId, user.id)
      .then(conv => {
        if (cancelled) return;
        if (conv) navigate(`/messages/${conv.id}`, { replace: true });
        else setChecked(true);
      })
      .catch(() => { if (!cancelled) setChecked(true); });
    return () => { cancelled = true; };
  }, [canMessage, numericId, user.id, navigate]);

  if (loading) {
    return <div className="min-h-screen bg-[#f8f4ed] flex items-center justify-center text-sm text-[#8d8073]" style={fontStyle}>Loading…</div>;
  }
  if (!listing) {
    return <Message title="Item not found" body="This listing may have been removed." to="/marketplace" linkText="← Back to Marketplace" />;
  }
  if (!listing.user_id) {
    return <Message title="Demo listing" body="This is a sample listing with no seller account, so there's no one to message." to={`/item/${listing.id}`} linkText="← Back to the listing" />;
  }
  if (listing.user_id === user.id) {
    return <Message title="This is your listing" body="You can't message yourself. Buyers will reach you from your Messages inbox." to={`/item/${listing.id}`} linkText="← Back to the listing" />;
  }
  if (!checked) {
    return <div className="min-h-screen bg-[#f8f4ed] flex items-center justify-center text-sm text-[#8d8073]" style={fontStyle}>Loading…</div>;
  }

  async function handleSend(e) {
    e.preventDefault();
    const body = draft.trim();
    if (!body) { setError("Write a message first."); return; }
    setSending(true);
    setError("");
    try {
      const conversationId = await startConversation(listing.id, body);
      navigate(`/messages/${conversationId}`, { replace: true });
    } catch (err) {
      setError(err.message || "Couldn't send your message.");
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f4ed]" style={fontStyle}>
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
        <Link to={`/item/${listing.id}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6b7280] hover:text-[#2d6a4f] transition-colors mb-6">
          <ArrowLeft size={15} />
          Back to listing
        </Link>

        <div className="bg-white rounded-3xl border border-[#e8e0d5] shadow-sm overflow-hidden">
          <div className="flex items-center gap-4 p-5 border-b border-[#f0ebe2]">
            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
              <ListingImage listing={listing} className="h-16" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-[#a0785a] font-semibold uppercase tracking-wide">Message the seller</div>
              <div className="font-semibold text-[#1a2e1e] truncate">{listing.title}</div>
              <div className="text-sm text-[#8d8073]">@{listing.seller} · ${Number(listing.price).toFixed(2)}</div>
            </div>
          </div>

          <form onSubmit={handleSend} className="p-5 space-y-4">
            <textarea
              value={draft} onChange={e => { setDraft(e.target.value); setError(""); }}
              rows={5} maxLength={2000} aria-label="Your message"
              placeholder="Hi! Is this still available?"
              className="w-full border border-[#ddd6cc] hover:border-[#a0785a] rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#52b788] bg-white text-[#1a2e1e] placeholder:text-[#c4a882]"
            />
            {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}
            <button
              type="submit" disabled={sending}
              className="w-full flex items-center justify-center gap-2 bg-[#2d6a4f] hover:bg-[#1b4332] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors"
            >
              <Send size={16} />
              {sending ? "Sending…" : "Send message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
