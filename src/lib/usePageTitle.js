import { useEffect } from "react";

const DEFAULT_TITLE = "CycleUp — Marketplace for Upcycled Goods";

// Sets the browser tab title while a page is showing, and puts the default back
// when it goes away. Pass nothing (or a falsy value) for the default title.
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · CycleUp` : DEFAULT_TITLE;
    return () => { document.title = DEFAULT_TITLE; };
  }, [title]);
}
