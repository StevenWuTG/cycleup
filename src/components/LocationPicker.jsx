import { useEffect, useId, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { searchPlaces } from "../lib/geocode";

const MIN_QUERY = 3;
const DEBOUNCE_MS = 300;

// Search-as-you-type place picker. `value` is only the initial value; after
// that the picker owns its text. `onChange` receives:
//   - a full { label, latitude, longitude } when a suggestion is chosen,
//   - { label, latitude: null, longitude: null } for typed text (only when
//     `allowFreeText`, e.g. a listing whose seller doesn't pick a suggestion),
//   - null when the box is empty (or for typed text without `allowFreeText`).
export default function LocationPicker({
  value, onChange, allowFreeText = false, autoFocus = false,
  placeholder = "Search for a city or ZIP code…", inputClassName = "", id,
}) {
  const [query, setQuery]     = useState(value?.label ?? "");
  const [results, setResults] = useState([]);
  const [status, setStatus]   = useState("idle"); // idle | loading | done | error
  const [open, setOpen]       = useState(false);
  const [active, setActive]   = useState(-1);
  const listId  = useId();
  const boxRef  = useRef(null);
  const timer   = useRef(null);
  const request = useRef(0); // lets a slow, outdated response be ignored

  useEffect(() => () => { clearTimeout(timer.current); request.current++; }, []);

  useEffect(() => {
    function onPointerDown(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function handleInput(e) {
    const text = e.target.value;
    const trimmed = text.trim();
    setQuery(text);
    setOpen(true);
    setActive(-1);
    onChange(trimmed && allowFreeText ? { label: trimmed, latitude: null, longitude: null } : null);

    clearTimeout(timer.current);
    const thisRequest = ++request.current;
    if (trimmed.length < MIN_QUERY) {
      setResults([]);
      setStatus("idle");
      return;
    }
    setStatus("loading");
    timer.current = setTimeout(async () => {
      try {
        const places = await searchPlaces(trimmed);
        if (thisRequest !== request.current) return;
        setResults(places);
        setStatus("done");
      } catch {
        if (thisRequest !== request.current) return;
        setResults([]);
        setStatus("error");
      }
    }, DEBOUNCE_MS);
  }

  function choose(place) {
    clearTimeout(timer.current);
    request.current++;
    setQuery(place.label);
    setResults([]);
    setStatus("idle");
    setOpen(false);
    setActive(-1);
    onChange(place);
  }

  function handleKeyDown(e) {
    if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "ArrowDown" && results.length) {
      e.preventDefault();
      setOpen(true);
      setActive(i => (i + 1) % results.length);
    } else if (e.key === "ArrowUp" && results.length) {
      e.preventDefault();
      setActive(i => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === "Enter" && open && active >= 0 && results[active]) {
      e.preventDefault(); // don't submit the surrounding form
      choose(results[active]);
    }
  }

  const showPanel = open && query.trim().length >= MIN_QUERY;

  return (
    <div ref={boxRef} className="relative">
      <div className="relative">
        <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a0785a] pointer-events-none" />
        <input
          id={id} type="text" value={query} onChange={handleInput} onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)} autoFocus={autoFocus} autoComplete="off" placeholder={placeholder}
          role="combobox" aria-expanded={showPanel} aria-controls={listId} aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          className={`pl-10 ${inputClassName}`}
        />
      </div>

      {showPanel && (
        <ul
          id={listId} role="listbox"
          className="absolute z-30 left-0 right-0 mt-1.5 bg-white border border-[#e8e0d5] rounded-xl shadow-lg overflow-hidden max-h-64 overflow-y-auto"
        >
          {status === "loading" && <li className="px-4 py-3 text-sm text-[#8d8073]">Searching…</li>}
          {status === "error" && <li className="px-4 py-3 text-sm text-red-500">Couldn't search places right now. Check your connection and try again.</li>}
          {status === "done" && results.length === 0 && <li className="px-4 py-3 text-sm text-[#8d8073]">No places found. Try a nearby city or a ZIP code.</li>}
          {results.map((place, i) => (
            <li key={place.label} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
              <button
                type="button" onClick={() => choose(place)} onMouseEnter={() => setActive(i)}
                className={`w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm text-[#1a2e1e] ${i === active ? "bg-[#f0faf3]" : "hover:bg-[#faf6f0]"}`}
              >
                <MapPin size={13} className="text-[#52b788] shrink-0" />
                <span className="truncate">{place.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
