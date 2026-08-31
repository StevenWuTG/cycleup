import { useState } from "react";
import { Search, SlidersHorizontal, X, Leaf } from "lucide-react";
import ListingCard from "../components/ListingCard";
import { mockListings, categories } from "../data/mockListings";

const sortOptions = ["Newest", "Price: Low to High", "Price: High to Low"];

export default function Marketplace() {
  const [search, setSearch]             = useState("");
  const [activeCategory, setCategory]   = useState("All");
  const [sort, setSort]                 = useState("Newest");

  const filtered = mockListings
    .filter(item => {
      const q = search.toLowerCase();
      return (
        (item.title.toLowerCase().includes(q) || item.seller.toLowerCase().includes(q)) &&
        (activeCategory === "All" || item.category.includes(activeCategory))
      );
    })
    .sort((a, b) =>
      sort === "Price: Low to High"  ? a.price - b.price :
      sort === "Price: High to Low"  ? b.price - a.price : a.id - b.id
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
          <p className="text-white/60 text-base mt-2">{mockListings.length} upcycled items from independent makers</p>
        </div>
      </div>

      {/* Pulled-up search bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="bg-white rounded-2xl shadow-lg border border-[#e8e0d5] p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a0785a]" />
            <input
              type="text"
              placeholder="Search items or sellers…"
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
          <div className="flex items-center gap-2 shrink-0">
            <SlidersHorizontal size={15} className="text-[#a0785a]" />
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="bg-[#faf6f0] border border-[#e8e0d5] rounded-xl text-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#52b788] text-[#1a2e1e] cursor-pointer"
            >
              {sortOptions.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category pills */}
        <div className="flex gap-2 flex-wrap mb-6">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-[#1b4332] text-white shadow-sm"
                  : "bg-white text-[#6b7280] border border-[#ddd6cc] hover:border-[#52b788] hover:text-[#2d6a4f]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Count */}
        <p className="text-sm text-[#8d8073] mb-6">
          <span className="font-semibold text-[#1a2e1e]">{filtered.length}</span> items
          {activeCategory !== "All" && <> in <span className="font-semibold text-[#2d6a4f]">{activeCategory}</span></>}
          {search && <> matching "<span className="font-semibold text-[#2d6a4f]">{search}</span>"</>}
        </p>

        {/* Grid */}
        {filtered.length > 0 ? (
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
