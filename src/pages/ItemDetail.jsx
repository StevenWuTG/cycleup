import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Leaf, MessageCircle, Trash2 } from "lucide-react";
import { useListings } from "../context/listings-context";
import { useAuth } from "../context/auth-context";
import ListingImage from "../components/ListingImage";
import { tagColors } from "../data/categories";

export default function ItemDetail() {
  const { id } = useParams();
  const { listings, loading, deleteListing } = useListings();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const listing = listings.find(l => String(l.id) === id);
  const isOwner = !!user && !!listing && listing.user_id === user.id;

  async function handleDelete() {
    if (!window.confirm(`Delete "${listing.title}"? This can't be undone.`)) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteListing(listing);
      navigate("/marketplace");
    } catch (err) {
      setDeleteError(err.message || "Couldn't delete this listing.");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f4ed] flex items-center justify-center text-sm text-[#8d8073]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        Loading item…
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-[#f8f4ed] flex items-center justify-center px-4 py-20 text-center" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div>
          <Leaf size={40} className="text-[#d8f3dc] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#1a2e1e] mb-2">Item not found</h1>
          <p className="text-[#6b7280] mb-6">This listing may have been removed.</p>
          <Link to="/marketplace" className="text-sm font-semibold text-[#2d6a4f] hover:underline">
            ← Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f4ed]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6b7280] hover:text-[#2d6a4f] transition-colors mb-6"
        >
          <ArrowLeft size={15} />
          Back to Marketplace
        </Link>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* Image */}
          <div className="lg:col-span-3">
            <div className="rounded-3xl overflow-hidden shadow-sm border border-[#e8e0d5]">
              <ListingImage listing={listing} className="h-80 sm:h-[28rem]" />
            </div>
          </div>

          {/* Info */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="flex flex-wrap gap-1.5 mb-3">
              {listing.category.map(cat => (
                <span
                  key={cat}
                  className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${tagColors[cat] || "bg-gray-100 text-gray-700"}`}
                >
                  {cat}
                </span>
              ))}
            </div>

            <h1
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              className="text-3xl sm:text-4xl font-bold text-[#1a2e1e] mb-2 leading-tight"
            >
              {listing.title}
            </h1>

            <div className="text-3xl font-bold text-[#2d6a4f] mb-4">${Number(listing.price).toFixed(2)}</div>

            <div className="flex items-center gap-1 text-sm text-[#8d8073] mb-6">
              <MapPin size={13} className="shrink-0" />
              <span>{listing.location || "Location not specified"}</span>
              <span className="mx-1 text-[#c4a882]">·</span>
              <span className="text-[#a0785a] font-medium">{listing.seller}</span>
            </div>

            {listing.condition && (
              <div className="mb-6">
                <span className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Condition</span>
                <p className="text-sm text-[#1a2e1e] font-medium mt-0.5">{listing.condition}</p>
              </div>
            )}

            {listing.description && (
              <div className="mb-6">
                <h2 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-1.5">Description</h2>
                <p className="text-sm text-[#3f3a33] leading-relaxed">{listing.description}</p>
              </div>
            )}

            {listing.story && (
              <div className="mb-6 bg-[#f0faf3] border border-[#d8f3dc] rounded-2xl p-5">
                <h2 className="flex items-center gap-1.5 text-xs font-semibold text-[#2d6a4f] uppercase tracking-wide mb-1.5">
                  <Leaf size={13} />
                  Origin Story
                </h2>
                <p className="text-sm text-[#3f3a33] leading-relaxed">{listing.story}</p>
              </div>
            )}

            {isOwner ? (
              <div className="mt-auto">
                <button
                  onClick={handleDelete} disabled={deleting}
                  className="w-full flex items-center justify-center gap-2 border-2 border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed font-semibold py-3 rounded-xl transition-colors"
                >
                  <Trash2 size={16} />
                  {deleting ? "Deleting…" : "Delete listing"}
                </button>
                {deleteError && <p className="text-xs text-red-500 text-center mt-2">{deleteError}</p>}
                <p className="text-xs text-[#a0785a] text-center mt-2">This is your listing</p>
              </div>
            ) : (
              <>
                <button className="w-full flex items-center justify-center gap-2 bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-semibold py-3.5 rounded-xl transition-colors mt-auto">
                  <MessageCircle size={17} />
                  Contact Seller
                </button>
                <p className="text-xs text-[#a0785a] text-center mt-2">Messaging coming soon</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
