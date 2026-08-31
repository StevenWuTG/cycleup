import { createContext, useContext } from "react";

export const ListingsContext = createContext(null);

export function useListings() {
  const ctx = useContext(ListingsContext);
  if (!ctx) throw new Error("useListings must be used within a ListingsProvider");
  return ctx;
}
