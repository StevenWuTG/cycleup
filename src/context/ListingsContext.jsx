import { useEffect, useState } from "react";
import { mockListings } from "../data/mockListings";
import { ListingsContext } from "./listings-context";

const STORAGE_KEY = "cycleup:listings";

function loadInitialListings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // corrupt or inaccessible storage — fall back to the mock catalog
  }
  return mockListings;
}

export function ListingsProvider({ children }) {
  const [listings, setListings] = useState(loadInitialListings);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
    } catch {
      // storage full or unavailable — listings still work for this session
    }
  }, [listings]);

  function addListing(data) {
    const listing = { id: Date.now(), ...data };
    setListings(prev => [listing, ...prev]);
    return listing;
  }

  return (
    <ListingsContext.Provider value={{ listings, addListing }}>
      {children}
    </ListingsContext.Provider>
  );
}
