import { useEffect, useRef, useState } from "react";
import { LocateFixed, MapPin, X } from "lucide-react";
import LocationPicker from "./LocationPicker";
import { useUserLocation } from "../context/location-context";
import { getCurrentPlace } from "../lib/geocode";

// "Set location" button for the marketplace. `onSet` fires after a new
// location is chosen so the page can switch to sorting by distance.
export default function LocationControl({ onSet }) {
  const { place, setPlace } = useUserLocation();
  const [open, setOpen]   = useState(false);
  const [busy, setBusy]   = useState(false);
  const [error, setError] = useState("");
  const boxRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
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

  function toggle() {
    setOpen(o => !o);
    setError("");
  }

  function apply(next) {
    setPlace(next);
    onSet?.();
    setOpen(false);
  }

  async function useCurrentLocation() {
    setBusy(true);
    setError("");
    try {
      apply(await getCurrentPlace());
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div ref={boxRef} className="relative shrink-0 w-full sm:w-auto">
      <button
        type="button" onClick={toggle} aria-expanded={open} aria-haspopup="dialog"
        className={`flex items-center gap-2 w-full sm:w-auto rounded-xl border px-3.5 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-[#52b788] ${
          place
            ? "bg-[#f0faf3] border-[#b7e4c7] text-[#1b4332] font-medium"
            : "bg-[#faf6f0] border-[#e8e0d5] text-[#1a2e1e] hover:border-[#a0785a]"
        }`}
      >
        <MapPin size={15} className={place ? "text-[#2d6a4f]" : "text-[#a0785a]"} />
        <span className="truncate text-left sm:max-w-[10rem]">{place ? place.label : "Set location"}</span>
      </button>

      {open && (
        <div
          role="dialog" aria-label="Set your location"
          className="absolute z-30 left-0 sm:left-auto sm:right-0 mt-2 w-[min(22rem,calc(100vw-4rem))] bg-white rounded-2xl border border-[#e8e0d5] shadow-xl p-4 space-y-3"
        >
          <div className="text-sm font-semibold text-[#1a2e1e]">Where are you?</div>

          <LocationPicker
            autoFocus
            onChange={next => { if (next?.latitude != null) apply(next); }}
            inputClassName="w-full border border-[#ddd6cc] hover:border-[#a0785a] rounded-xl pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#52b788] bg-white text-[#1a2e1e] placeholder:text-[#c4a882]"
          />

          <button
            type="button" onClick={useCurrentLocation} disabled={busy}
            className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-[#52b788] text-[#2d6a4f] hover:bg-[#f0faf3] disabled:opacity-60 text-sm font-semibold py-2 transition-colors"
          >
            <LocateFixed size={15} />
            {busy ? "Finding you…" : "Use my current location"}
          </button>

          {error && <p className="text-xs text-red-500">{error}</p>}

          {place && (
            <button
              type="button" onClick={() => { setPlace(null); setOpen(false); }}
              className="flex items-center gap-1 text-xs font-medium text-[#a0785a] hover:text-[#6b4c3b]"
            >
              <X size={12} />
              Clear location
            </button>
          )}

          <p className="text-[11px] leading-snug text-[#a0785a]">
            Saved on this device only. Used just to sort listings and show how far away they are.
          </p>
        </div>
      )}
    </div>
  );
}
