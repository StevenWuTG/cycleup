import { MapPin, Tag } from "lucide-react";

const tagColors = {
  Furniture: "bg-amber-100 text-amber-800",
  Fashion:   "bg-emerald-100 text-emerald-800",
  Decor:     "bg-yellow-100 text-yellow-800",
  Garden:    "bg-green-100 text-green-800",
  Textiles:  "bg-orange-100 text-orange-800",
  Lighting:  "bg-yellow-100 text-yellow-800",
  Art:       "bg-rose-100 text-rose-800",
  Industrial:"bg-slate-100 text-slate-700",
  Vintage:   "bg-amber-100 text-amber-800",
  Bags:      "bg-teal-100 text-teal-800",
  Pallet:    "bg-lime-100 text-lime-800",
  Planters:  "bg-green-100 text-green-800",
  Home:      "bg-amber-100 text-amber-800",
  Wood:      "bg-orange-100 text-orange-800",
};

const placeholderGradients = [
  "from-emerald-200 to-teal-300",
  "from-amber-200 to-orange-300",
  "from-green-200 to-emerald-300",
  "from-lime-200 to-green-300",
  "from-teal-200 to-cyan-300",
  "from-yellow-200 to-amber-300",
  "from-orange-200 to-red-200",
];

function ImagePlaceholder({ title, id }) {
  const gradient = placeholderGradients[id % placeholderGradients.length];
  const initials = title.split(" ").slice(0, 2).map(w => w[0]).join("");
  return (
    <div className={`w-full h-52 bg-gradient-to-br ${gradient} flex flex-col items-center justify-center`}>
      <div className="w-14 h-14 rounded-2xl bg-white/50 backdrop-blur-sm flex items-center justify-center text-xl font-bold text-white drop-shadow">
        {initials}
      </div>
    </div>
  );
}

export default function ListingCard({ listing }) {
  return (
    <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 border border-[#e8e0d5] flex flex-col group">
      <div className="overflow-hidden">
        <div className="group-hover:scale-105 transition-transform duration-300">
          <ImagePlaceholder title={listing.title} id={listing.id} />
        </div>
      </div>

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
          <MapPin size={11} className="shrink-0" />
          <span>{listing.location}</span>
          <span className="mx-1 text-[#c4a882]">·</span>
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

        <button className="w-full text-sm font-semibold text-[#2d6a4f] border-2 border-[#52b788] rounded-xl py-2 hover:bg-[#2d6a4f] hover:text-white hover:border-[#2d6a4f] transition-all duration-150">
          View Item
        </button>
      </div>
    </article>
  );
}
