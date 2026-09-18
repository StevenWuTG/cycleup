import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import ListingImage from "./ListingImage";
import { tagColors } from "../data/categories";

export default function ListingCard({ listing }) {
  return (
    <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 border border-[#e8e0d5] flex flex-col group">
      <Link to={`/item/${listing.id}`} className="overflow-hidden">
        <div className="group-hover:scale-105 transition-transform duration-300">
          <ListingImage listing={listing} />
        </div>
      </Link>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h3 className="font-semibold text-[#1a2e1e] text-[15px] leading-snug group-hover:text-[#2d6a4f] transition-colors line-clamp-2">
            {listing.title}
          </h3>
          <span className="text-lg font-bold text-[#2d6a4f] whitespace-nowrap shrink-0">
            ${listing.price}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs text-[#8d8073] mb-3">
          {listing.location && (
            <>
              <MapPin size={11} className="shrink-0" />
              <span>{listing.location}</span>
              <span className="mx-1 text-[#c4a882]">·</span>
            </>
          )}
          <span className="text-[#a0785a] font-medium truncate">{listing.seller}</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-auto mb-4">
          {listing.category.map(cat => (
            <span
              key={cat}
              className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${tagColors[cat] || "bg-gray-100 text-gray-700"}`}
            >
              {cat}
            </span>
          ))}
        </div>

        <Link
          to={`/item/${listing.id}`}
          className="w-full text-center text-sm font-semibold text-[#2d6a4f] border-2 border-[#52b788] rounded-xl py-2 hover:bg-[#2d6a4f] hover:text-white hover:border-[#2d6a4f] transition-all duration-150"
        >
          View Item
        </Link>
      </div>
    </article>
  );
}
