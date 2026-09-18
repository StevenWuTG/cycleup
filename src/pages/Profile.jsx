import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Leaf, Pencil, Plus, Trash2 } from "lucide-react";
import ListingCard from "../components/ListingCard";
import { useAuth } from "../context/auth-context";
import { useListings } from "../context/listings-context";
import { fetchProfileById, fetchProfileByUsername } from "../lib/profiles";

const fontStyle = { fontFamily: "'Inter', system-ui, sans-serif" };

// Loads a profile by user id or by username. Loading is derived (the stored
// result belongs to a different lookup) so switching between profiles never
// shows stale data.
function useProfile(by, value) {
  const key = `${by}:${value}`;
  const [state, setState] = useState({ key: null, profile: null, error: "" });

  useEffect(() => {
    let cancelled = false;
    (by === "id" ? fetchProfileById(value) : fetchProfileByUsername(value))
      .then(profile => { if (!cancelled) setState({ key, profile, error: "" }); })
      .catch(err => { if (!cancelled) setState({ key, profile: null, error: err.message }); });
    return () => { cancelled = true; };
  }, [by, value, key]);

  return { loading: state.key !== key, profile: state.profile, error: state.error };
}

function Centered({ children }) {
  return (
    <div className="min-h-screen bg-[#f8f4ed] flex items-center justify-center px-4 py-20 text-center" style={fontStyle}>
      {children}
    </div>
  );
}

function ProfileView({ profile }) {
  const { user } = useAuth();
  const { listings, loading, deleteListing } = useListings();
  const [deletingId, setDeletingId] = useState(null);
  const [actionError, setActionError] = useState("");

  const isOwn = user?.id === profile.id;
  const mine = listings.filter(l => l.user_id === profile.id);
  const since = new Date(profile.created_at).toLocaleDateString([], { month: "long", year: "numeric" });

  async function handleDelete(listing) {
    if (!window.confirm(`Delete "${listing.title}"? This can't be undone.`)) return;
    setDeletingId(listing.id);
    setActionError("");
    try {
      await deleteListing(listing);
    } catch (err) {
      setActionError(err.message || "Couldn't delete that listing.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f4ed]" style={fontStyle}>
      <div className="bg-gradient-to-br from-[#1b4332] to-[#2d6a4f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div className="flex items-center gap-5 min-w-0">
            <div
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              className="w-20 h-20 shrink-0 rounded-full bg-[#52b788] text-[#0a1f15] flex items-center justify-center text-4xl font-bold"
              aria-hidden="true"
            >
              {profile.username[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-[#74c69d] text-sm font-semibold uppercase tracking-widest mb-1">
                {isOwn ? "Your profile" : "Seller"}
              </p>
              <h1 style={{ fontFamily: "'Fraunces', Georgia, serif" }} className="text-3xl sm:text-4xl font-bold text-white truncate">
                @{profile.username}
              </h1>
              <p className="text-white/60 text-sm mt-1">
                Member since {since} · {loading ? "…" : `${mine.length} ${mine.length === 1 ? "listing" : "listings"}`}
              </p>
              {isOwn && <p className="text-white/40 text-xs mt-0.5 truncate">Signed in as {user.email}</p>}
            </div>
          </div>

          {isOwn && (
            <Link
              to="/post"
              className="inline-flex items-center justify-center gap-2 bg-[#52b788] hover:bg-[#74c69d] text-[#0a1f15] font-bold px-6 py-3 rounded-full transition-all shadow-lg whitespace-nowrap self-start sm:self-auto"
            >
              <Plus size={17} />
              New listing
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {actionError && (
          <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">{actionError}</p>
        )}

        {loading ? (
          <p className="text-sm text-[#8d8073] py-20 text-center">Loading listings…</p>
        ) : mine.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#e8e0d5] py-20 text-center px-6">
            <Leaf size={40} className="text-[#d8f3dc] mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-[#1a2e1e] mb-1">
              {isOwn ? "You haven't listed anything yet" : "No listings yet"}
            </h2>
            <p className="text-[#8d8073] text-sm mb-4">
              {isOwn ? "Give your first upcycled creation a new home." : "Check back soon."}
            </p>
            {isOwn && (
              <Link to="/post" className="text-sm text-[#2d6a4f] font-semibold hover:underline">Post an item</Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-start">
            {mine.map(listing => (
              <div key={listing.id} className="flex flex-col gap-2">
                <ListingCard listing={listing} />
                {isOwn && (
                  <div className="flex gap-2">
                    <Link
                      to={`/item/${listing.id}/edit`}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-[#ddd6cc] hover:border-[#52b788] hover:text-[#2d6a4f] text-[#6b7280] text-sm font-medium py-2 rounded-xl transition-colors"
                    >
                      <Pencil size={14} />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(listing)} disabled={deletingId === listing.id}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium py-2 rounded-xl transition-colors"
                    >
                      <Trash2 size={14} />
                      {deletingId === listing.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// /profile — always the signed-in user's own page.
export function MyProfile() {
  const { user } = useAuth();
  const { loading, profile, error } = useProfile("id", user.id);

  if (error) return <Centered><p className="text-sm text-red-500">{error}</p></Centered>;
  if (loading) return <Centered><p className="text-sm text-[#8d8073]">Loading profile…</p></Centered>;
  if (!profile) return <Centered><p className="text-sm text-[#8d8073]">Couldn't find your profile.</p></Centered>;
  return <ProfileView profile={profile} />;
}

// /u/:username — anyone's public seller page (with owner controls on your own).
export function UserProfile() {
  const { username } = useParams();
  const { loading, profile, error } = useProfile("username", username);

  if (error) return <Centered><p className="text-sm text-red-500">{error}</p></Centered>;
  if (loading) return <Centered><p className="text-sm text-[#8d8073]">Loading profile…</p></Centered>;
  if (!profile) {
    return (
      <Centered>
        <div>
          <Leaf size={40} className="text-[#d8f3dc] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#1a2e1e] mb-2">Profile not found</h1>
          <p className="text-[#6b7280] mb-6">There's no seller called @{username}.</p>
          <Link to="/marketplace" className="text-sm font-semibold text-[#2d6a4f] hover:underline">← Back to Marketplace</Link>
        </div>
      </Centered>
    );
  }
  return <ProfileView profile={profile} />;
}
