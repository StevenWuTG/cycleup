import { Link } from "react-router-dom";
import { Leaf } from "lucide-react";
import { SITE } from "../config/site";

export default function Footer() {
  return (
    <footer className="bg-[#0a1f15] text-white/60 py-8" style={{ fontFamily: "'Inter Variable', system-ui, sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2 font-semibold text-white">
          <Leaf size={15} className="text-[#52b788]" />
          {SITE.name}
        </div>
        <p className="text-center">© {new Date().getFullYear()} {SITE.name}. Building a circular economy together.</p>
        <nav className="flex gap-4 text-white/50" aria-label="Legal">
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
          <a href={`mailto:${SITE.contactEmail}`} className="hover:text-white transition-colors">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
