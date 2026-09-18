import { Link } from "react-router-dom";
import { Leaf } from "lucide-react";
import { usePageTitle } from "../lib/usePageTitle";

export default function NotFound() {
  usePageTitle("Page not found");
  return (
    <div
      className="min-h-[70vh] bg-[#f8f4ed] flex items-center justify-center px-4 py-20 text-center"
      style={{ fontFamily: "'Inter Variable', system-ui, sans-serif" }}
    >
      <div className="max-w-md">
        <Leaf size={44} className="text-[#d8f3dc] mx-auto mb-4" />
        <p className="text-sm font-semibold text-[#52b788] uppercase tracking-widest mb-2">Error 404</p>
        <h1 style={{ fontFamily: "'Fraunces Variable', Georgia, serif" }} className="text-4xl font-bold text-[#1b4332] mb-3">
          We couldn't find that page
        </h1>
        <p className="text-[#6b7280] mb-8">
          The link may be broken, or the page may have been moved or removed.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/marketplace"
            className="bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Browse the marketplace
          </Link>
          <Link to="/" className="font-semibold text-[#2d6a4f] hover:underline px-6 py-3">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
