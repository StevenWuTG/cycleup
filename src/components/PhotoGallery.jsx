import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ListingImage from "./ListingImage";

// The photos on a listing page: a large main image with previous/next buttons
// and a strip of thumbnails. Listings with no photos get the placeholder.
export default function PhotoGallery({ listing }) {
  const photos = listing.image_urls ?? [];
  const [index, setIndex] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="rounded-3xl overflow-hidden shadow-sm border border-[#e8e0d5]">
        <ListingImage listing={listing} className="h-80 sm:h-[28rem]" />
      </div>
    );
  }

  const current = Math.min(index, photos.length - 1);
  const step = delta => setIndex((current + delta + photos.length) % photos.length);

  return (
    <div>
      <div className="relative rounded-3xl overflow-hidden shadow-sm border border-[#e8e0d5] bg-[#efe9df]">
        <img
          src={photos[current]}
          alt={`${listing.title}, photo ${current + 1} of ${photos.length}`}
          className="w-full h-80 sm:h-[28rem] object-contain"
        />
        {photos.length > 1 && (
          <>
            <button
              type="button" onClick={() => step(-1)} aria-label="Previous photo"
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#1a2e1e] rounded-full p-2 shadow"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button" onClick={() => step(1)} aria-label="Next photo"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#1a2e1e] rounded-full p-2 shadow"
            >
              <ChevronRight size={20} />
            </button>
            <span className="absolute bottom-3 right-3 bg-black/55 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              {current + 1} / {photos.length}
            </span>
          </>
        )}
      </div>

      {photos.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {photos.map((url, i) => (
            <button
              key={url} type="button" onClick={() => setIndex(i)} aria-label={`Show photo ${i + 1}`}
              aria-current={i === current}
              className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                i === current ? "border-[#52b788]" : "border-transparent hover:border-[#c4a882]"
              }`}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
