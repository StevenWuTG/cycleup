import ImagePlaceholder from "./ImagePlaceholder";

// Shows the seller's uploaded photo when there is one, otherwise the
// generated gradient placeholder.
export default function ListingImage({ listing, className = "h-52" }) {
  if (!listing.image_url) {
    return <ImagePlaceholder title={listing.title} id={listing.id} className={className} />;
  }
  return (
    <img
      src={listing.image_url}
      alt={listing.title}
      loading="lazy"
      className={`w-full object-cover ${className}`}
    />
  );
}
