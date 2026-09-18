import { useCallback, useMemo, useState } from "react";
import { distanceMiles } from "../lib/distance";
import { LocationContext } from "./location-context";

const STORAGE_KEY = "cycleup:location";

const isPlace = p =>
  !!p && typeof p.label === "string" && Number.isFinite(p.latitude) && Number.isFinite(p.longitude);

function loadPlace() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return isPlace(stored) ? stored : null;
  } catch {
    return null;
  }
}

// The visitor's own location, used to sort listings and show distances. It is
// kept in this browser only (localStorage) and never sent to the server.
export function LocationProvider({ children }) {
  const [place, setPlaceState] = useState(loadPlace);

  const setPlace = useCallback(next => {
    setPlaceState(next);
    try {
      if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // storage unavailable — the location still works for this session
    }
  }, []);

  // Miles from the visitor to a listing, or null if either has no coordinates.
  const distanceTo = useCallback(
    listing => (place && listing.latitude != null && listing.longitude != null ? distanceMiles(place, listing) : null),
    [place],
  );

  const value = useMemo(() => ({ place, setPlace, distanceTo }), [place, setPlace, distanceTo]);
  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}
