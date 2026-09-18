import { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";

// How many category pills to show before the rest go behind "More".
const FEATURED = 5;

function Pill({ active, onClick, children, ...rest }) {
  return (
    <button
      type="button" onClick={onClick} aria-pressed={active} {...rest}
      className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
        active
          ? "bg-[#1b4332] text-white shadow-sm"
          : "bg-white text-[#6b7280] border border-[#ddd6cc] hover:border-[#52b788] hover:text-[#2d6a4f]"
      }`}
    >
      {children}
    </button>
  );
}

// "All", the most popular categories as pills, and a "More" panel listing every
// category with its listing count. `categories` excludes "All"; `counts` maps
// category -> number of listings; `value` is the active category or "All".
// Popularity = listing count, ties broken by the order of `categories`. Until
// `ready` (listings loaded) only "All" and "More" show, so the pills don't
// visibly reshuffle once the counts arrive.
export default function CategoryFilter({ categories, counts, value, onChange, ready }) {
  const [open, setOpen] = useState(false);
  const rowRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e) {
      if (rowRef.current && !rowRef.current.contains(e.target)) setOpen(false);
    }
    function onKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const count = cat => counts[cat] ?? 0;
  const ranked = [...categories].sort(
    (a, b) => count(b) - count(a) || categories.indexOf(a) - categories.indexOf(b),
  );
  const featured = ready ? ranked.slice(0, FEATURED) : [];
  // A category chosen from "More" that isn't a pill stays visible, and clears on click.
  const hiddenActive = value !== "All" && !featured.includes(value) ? value : null;

  function choose(cat) {
    onChange(cat);
    setOpen(false);
  }

  return (
    <div ref={rowRef} className="relative flex flex-wrap items-center gap-2 mb-6 min-h-[2.375rem]">
      <Pill active={value === "All"} onClick={() => choose("All")}>All</Pill>

      {featured.map(cat => (
        <Pill key={cat} active={value === cat} onClick={() => choose(cat)}>{cat}</Pill>
      ))}

      {hiddenActive && (
        <Pill active onClick={() => choose("All")} aria-label={`${hiddenActive} — clear this filter`}>
          {hiddenActive}
          <X size={13} />
        </Pill>
      )}

      <button
        type="button" onClick={() => setOpen(o => !o)} aria-expanded={open} aria-haspopup="dialog"
        className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
          open
            ? "bg-[#f0faf3] border-[#52b788] text-[#2d6a4f]"
            : "bg-white border-dashed border-[#c4a882] text-[#6b7280] hover:border-[#52b788] hover:text-[#2d6a4f]"
        }`}
      >
        More
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="dialog" aria-label="All categories"
          className="absolute z-30 left-0 top-full mt-2 w-full sm:w-[30rem] bg-white rounded-2xl border border-[#e8e0d5] shadow-xl p-4"
        >
          <div className="text-sm font-semibold text-[#1a2e1e] mb-3">Browse by category</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ranked.map(cat => (
              <button
                key={cat} type="button" onClick={() => choose(cat)} aria-pressed={value === cat}
                className={`flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl text-sm text-left transition-colors ${
                  value === cat
                    ? "bg-[#1b4332] text-white"
                    : count(cat) === 0
                      ? "bg-[#faf6f0] text-[#a0785a] hover:bg-[#f0faf3]"
                      : "bg-[#faf6f0] text-[#1a2e1e] hover:bg-[#f0faf3]"
                }`}
              >
                <span className="truncate font-medium">{cat}</span>
                <span className={`text-xs tabular-nums ${value === cat ? "text-white/70" : "text-[#a0785a]"}`}>{count(cat)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
