'use client';

import { useSyncExternalStore } from 'react';

function subscribe() {
  return () => {};
}

// True only after client hydration. Server and the hydration pass both see
// false, so components that depend on browser-only state (localStorage)
// render identically on both sides and never cause hydration mismatches.
export function useMounted(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
