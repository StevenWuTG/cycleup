import { Link, useLocation } from "react-router-dom";
import { Leaf, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/auth-context";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/marketplace", label: "Marketplace" },
  { to: "/post", label: "Sell an Item" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, username, signOut } = useAuth();

  function handleSignOut() {
    setOpen(false);
    signOut().catch(err => console.error("Sign out failed:", err.message));
  }

  return (
    <header className="sticky top-0 z-50 bg-[#1b4332]/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0" onClick={() => setOpen(false)}>
            <div className="w-8 h-8 bg-[#52b788] rounded-lg flex items-center justify-center">
              <Leaf size={16} className="text-[#1b4332]" strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: "'Fraunces', Georgia, serif" }} className="text-white text-xl font-bold tracking-tight">
              Cycle<span className="text-[#74c69d]">Up</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  pathname === to
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/marketplace"
              className="text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              Browse
            </Link>
            {user ? (
              <>
                <span className="text-sm text-white/60 max-w-[8rem] truncate" title={user.email}>@{username}</span>
                <button
                  onClick={handleSignOut}
                  className="text-sm font-medium text-white/80 hover:text-white transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link to="/login" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                Sign in
              </Link>
            )}
            <Link
              to="/post"
              className="bg-[#52b788] hover:bg-[#74c69d] text-[#1b4332] font-semibold text-sm px-5 py-2 rounded-full transition-all shadow-sm hover:shadow-md"
            >
              + List Item
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-[#1b4332]">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  pathname === to
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                {label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={handleSignOut}
                className="text-left px-4 py-3 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                Sign out <span className="text-white/40">(@{username})</span>
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                Sign in
              </Link>
            )}
            <div className="pt-2 pb-1">
              <Link
                to="/post"
                onClick={() => setOpen(false)}
                className="block text-center bg-[#52b788] hover:bg-[#74c69d] text-[#1b4332] font-semibold text-sm px-5 py-2.5 rounded-full transition-colors"
              >
                + List an Item
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
