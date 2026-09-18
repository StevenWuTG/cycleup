import { createContext, useContext } from "react";

export const LocationContext = createContext(null);

export function useUserLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useUserLocation must be used within a LocationProvider");
  return ctx;
}
