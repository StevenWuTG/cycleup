import { createContext, useContext } from "react";

export const MessagesContext = createContext(null);

export function useMessages() {
  const ctx = useContext(MessagesContext);
  if (!ctx) throw new Error("useMessages must be used within a MessagesProvider");
  return ctx;
}
