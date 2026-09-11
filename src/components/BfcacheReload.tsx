"use client";

import { useEffect } from "react";

/**
 * Back/forward cache (bfcache) restores a frozen snapshot of the page — its
 * old React tree — while the Next.js client router has moved on. Navigating
 * admin → public (or back) and then using the browser's back button could
 * therefore surface hydration-mismatch errors that only a manual hard refresh
 * fixed. Reloading once on a bfcache restore gives the user exactly that
 * fresh state, invisibly.
 */
export default function BfcacheReload() {
  useEffect(() => {
    const onPageshow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        window.location.reload();
      }
    };
    window.addEventListener("pageshow", onPageshow);
    return () => window.removeEventListener("pageshow", onPageshow);
  }, []);

  return null;
}
