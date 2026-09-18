import { usePageTitle } from "../lib/usePageTitle";
import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import ListingForm from "../components/ListingForm";
import { useListings } from "../context/listings-context";

export default function PostItem() {
  usePageTitle("Post an item");
  const { addListing }            = useListings();
  const [createdListing, setDone] = useState(null);

  async function handleSubmit({ fields, photos }) {
    setDone(await addListing({ photos, ...fields }));
  }

  if (createdListing) return (
    <div className="min-h-screen bg-[#f8f4ed] flex items-center justify-center px-4 py-12" style={{ fontFamily: "'Inter Variable', system-ui, sans-serif" }}>
      <div className="bg-white rounded-3xl shadow-lg border border-[#e8e0d5] p-8 sm:p-12 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-[#d8f3dc] rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={32} className="text-[#52b788]" />
        </div>
        <h2 style={{ fontFamily: "'Fraunces Variable', Georgia, serif" }} className="text-3xl font-bold text-[#1b4332] mb-2">
          It's live!
        </h2>
        <p className="text-[#6b7280] mb-6">
          <span className="font-semibold text-[#2d6a4f]">"{createdListing.title}"</span> is now on the CycleUp marketplace.
        </p>
        <div className="bg-[#f0faf3] border border-[#d8f3dc] rounded-2xl p-5 mb-6 text-left space-y-2">
          {[
            ["Title",      createdListing.title],
            ["Price",      `$${Number(createdListing.price).toFixed(2)}`],
            ["Categories", createdListing.category.join(", ")],
            ["Condition",  createdListing.condition],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm gap-3">
              <span className="text-[#6b7280]">{k}</span>
              <span className="font-medium text-[#1a2e1e] text-right">{v}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <Link
            to={`/item/${createdListing.id}`}
            className="block w-full text-center bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-semibold py-3.5 rounded-xl transition-colors"
          >
            View Listing
          </Link>
          <button
            onClick={() => setDone(null)}
            className="w-full text-sm font-semibold text-[#2d6a4f] hover:underline"
          >
            List Another Item
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f4ed]" style={{ fontFamily: "'Inter Variable', system-ui, sans-serif" }}>
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1b4332] to-[#2d6a4f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
          <p className="text-[#74c69d] text-sm font-semibold uppercase tracking-widest mb-2">Sell on CycleUp</p>
          <h1 style={{ fontFamily: "'Fraunces Variable', Georgia, serif" }} className="text-4xl lg:text-5xl font-bold text-white mb-2">
            Post your item
          </h1>
          <p className="text-white/60">Give your upcycled creation a new home</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-16">
        <div className="grid lg:grid-cols-3 gap-8 items-start">

          <ListingForm
            className="lg:col-span-2"
            submitLabel="Publish Listing"
            submittingLabel="Publishing…"
            onSubmit={handleSubmit}
          />

          {/* Sidebar tips */}
          <div className="hidden lg:flex flex-col gap-5 sticky top-24">
            <div className="bg-[#1b4332] rounded-3xl p-6 text-white">
              <h3 style={{ fontFamily: "'Fraunces Variable', Georgia, serif" }} className="text-xl font-bold mb-4">Listing tips</h3>
              <ul className="space-y-3 text-sm text-white/80">
                {[
                  "Use a clear, descriptive title with the material",
                  "Include dimensions in the description",
                  "Share the original item's story — buyers love context",
                  "Price fairly — check similar items in the marketplace",
                  "Select all relevant categories for more exposure",
                ].map((tip, i) => (
                  <li key={i} className="flex gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#52b788]/30 text-[#74c69d] text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">{i + 1}</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-3xl border border-[#e8e0d5] p-6">
              <div className="text-2xl font-bold text-[#2d6a4f] mb-1">Free to list</div>
              <p className="text-sm text-[#6b7280]">Posting costs nothing. Interested buyers message you directly to arrange the sale.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
