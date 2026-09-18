import { useState } from "react";
import { Search, SlidersHorizontal, X, Leaf } from "lucide-react";
import ListingCard from "../components/ListingCard";
import { categories } from "../data/categories";

const filterableCategories = categories.filter(c => c !== "All");
import { useListings } from "../context/listings-context";
import { useUserLocation } from "../context/location-context";
import LocationControl from "../components/LocationControl";
import CategoryFilter from "../components/CategoryFilter";

const NEAREST = "Distance: Nearest";
const baseSortOptions = ["Newest", "Price: Low to High", "Price: High to Low"];

export default function Marketplace() {
  const { listings, loading, error } = useListings();
  const { place, distanceTo } = useUserLocation();
  const [search, setSearch]             = useState("");
  const [activeCategory, setCategory]   = useState("All");
  const [sort, setSort]                 = useState("Newest");

  // Sorting by distance only makes sense with a location; if it's cleared
  // while selected, fall back to Newest.
  const sortOptions = place ? [NEAREST, ...baseSortOptions] : baseSortOptions;
  const activeSort  = sort === NEAREST && !place ? "Newest" : sort;

  // Nearest first; listings with no coordinates go last (newest first).
  function byDistance(a, b) {
    const da = distanceTo(a), db = distanceTo(b);
    if (da == null && db == null) return b.id - a.id;
    if (da == null) return 1;
    if (db == null) return -1;
    return da - db;
  }

  // How many listings each category has, for ranking the pills and labelling "More".
  const categoryCounts = {};
  for (const listing of listings) {
    for (const cat of listing.category) categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1;
  }

  const filtered = listings
    .filter(item => {
      const q = search.toLowerCase();
      return (
        (item.title.toLowerCase().includes(q) ||
          item.seller.toLowerCase().includes(q) ||
          (item.location ?? "").toLowerCase().includes(q)) &&
        (activeCategory === "All" || item.category.includes(activeCategory))
      );
    })
    .sort((a, b) =>
      activeSort === NEAREST              ? byDistance(a, b) :
      activeSort === "Price: Low to High" ? a.price - b.price :
      activeSort === "Price: High to Low" ? b.price - a.price : b.id - a.id
    );

  return (
    <div className="min-h-screen bg-[#f8f4ed]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Page header */}
      <div className="bg-gradient-to-br from-[#1b4332] to-[#2d6a4f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
          <p className="text-[#74c69d] text-sm font-semibold uppercase tracking-widest mb-2">The Marketplace</p>
          <h1
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            className="text-4xl lg:text-5xl font-bold text-white mb-1"
          >
            Find something unique
          </h1>
          <p className="text-white/60 text-base mt-2">{loading ? "Upcycled items" : `${listings.length} upcycled items`} from independent makers</p>
        </div>
      </div>

      {/* Pulled-up search bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="bg-white rounded-2xl shadow-lg border border-[#e8e0d5] p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a0785a]" />
            <input
              type="text"
              placeholder="Search items, sellers or places…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-[#faf6f0] border border-[#e8e0d5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#52b788] focus:bg-white transition text-[#1a2e1e] placeholder:text-[#a0785a]/70"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a0785a] hover:text-[#6b4c3b]">
                <X size={14} />
              </button>
            )}
          </div>
          <LocationControl onSet={() => setSort(NEAREST)} />
          <div className="flex items-center gap-2 shrink-0">
            <SlidersHorizontal size={15} className="text-[#a0785a]" />
            <select
              value={activeSort}
              onChange={e => setSort(e.target.value)}
              className="bg-[#faf6f0] border border-[#e8e0d5] rounded-xl text-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#52b788] text-[#1a2e1e] cursor-pointer"
            >
              {sortOptions.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category filter */}
        <CategoryFilter
          categories={filterableCategories}
          counts={categoryCounts}
          value={activeCategory}
          onChange={setCategory}
          ready={!loading}
        />

        {/* Count */}
        <p className="text-sm text-[#8d8073] mb-6">
          <span className="font-semibold text-[#1a2e1e]">{filtered.length}</span> {filtered.length === 1 ? "item" : "items"}
          {activeCategory !== "All" && <> in <span className="font-semibold text-[#2d6a4f]">{activeCategory}</span></>}
          {search && <> matching "<span className="font-semibold text-[#2d6a4f]">{search}</span>"</>}
        </p>

        {/* Grid */}
        {loading ? (
          <p className="text-sm text-[#8d8073] py-20 text-center">Loading listings…</p>
        ) : error ? (
          <div className="bg-white rounded-3xl border border-red-200 py-16 text-center">
            <h3 className="text-lg font-semibold text-[#1a2e1e] mb-1">Couldn't load listings</h3>
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-[#e8e0d5] py-20 text-center">
            <Leaf size={40} className="text-[#d8f3dc] mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-[#1a2e1e] mb-1">No items found</h3>
            <p className="text-[#8d8073] text-sm mb-4">Try a different search or category.</p>
            <button
              onClick={() => { setSearch(""); setCategory("All"); }}
              className="text-sm text-[#2d6a4f] font-semibold hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
