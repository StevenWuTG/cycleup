import ImagePlaceholder from "./ImagePlaceholder";

// Shows the listing's cover photo (the first of its photos) when there is one,
// otherwise the generated gradient placeholder.
export default function ListingImage({ listing, className = "h-52" }) {
  const cover = listing.image_urls?.[0];
  if (!cover) {
    return <ImagePlaceholder title={listing.title} id={listing.id} className={className} />;
  }
  return (
    <img
      src={cover}
      alt={listing.title}
      loading="lazy"
      className={`w-full object-cover ${className}`}
    />
  );
}
