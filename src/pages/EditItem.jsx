import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Leaf } from "lucide-react";
import ListingForm from "../components/ListingForm";
import { useListings } from "../context/listings-context";
import { useAuth } from "../context/auth-context";

const fontStyle = { fontFamily: "'Inter', system-ui, sans-serif" };

function Message({ title, body, children }) {
  return (
    <div className="min-h-screen bg-[#f8f4ed] flex items-center justify-center px-4 py-20 text-center" style={fontStyle}>
      <div>
        <Leaf size={40} className="text-[#d8f3dc] mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-[#1a2e1e] mb-2">{title}</h1>
        {body && <p className="text-[#6b7280] mb-6">{body}</p>}
        {children}
      </div>
    </div>
  );
}

export default function EditItem() {
  const { id } = useParams();
  const { listings, loading, updateListing } = useListings();
  const { user } = useAuth();
  const navigate = useNavigate();
  const listing = listings.find(l => String(l.id) === id);

  if (loading) {
    return <div className="min-h-screen bg-[#f8f4ed] flex items-center justify-center text-sm text-[#8d8073]" style={fontStyle}>Loading item…</div>;
  }
  if (!listing) {
    return (
      <Message title="Item not found" body="This listing may have been removed.">
        <Link to="/marketplace" className="text-sm font-semibold text-[#2d6a4f] hover:underline">← Back to Marketplace</Link>
      </Message>
    );
  }
  // The database enforces this too; this just gives a clear message up front.
  if (listing.user_id !== user.id) {
    return (
      <Message title="You can't edit this listing" body="Only the person who posted a listing can edit it.">
        <Link to={`/item/${listing.id}`} className="text-sm font-semibold text-[#2d6a4f] hover:underline">← Back to the listing</Link>
      </Message>
    );
  }

  async function handleSubmit({ fields, imageFile, removeImage }) {
    await updateListing(listing, { imageFile, removeImage, ...fields });
    navigate(`/item/${listing.id}`);
  }

  return (
    <div className="min-h-screen bg-[#f8f4ed]" style={fontStyle}>
      <div className="bg-gradient-to-br from-[#1b4332] to-[#2d6a4f]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
          <Link
            to={`/item/${listing.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={15} />
            Back to listing
          </Link>
          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif" }} className="text-4xl lg:text-5xl font-bold text-white">
            Edit your item
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-16">
        <ListingForm
          key={listing.id}
          listing={listing}
          submitLabel="Save changes"
          submittingLabel="Saving…"
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
