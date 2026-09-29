/**
 * URL filter synchronisation helpers.
 *
 * Pages keep their filter state in React and mirror it into the query string
 * so views are shareable and survive navigation. Reading happens once on
 * mount; writing uses history.replaceState (shallow routing) so syncing a
 * filter never re-renders the page or refetches data.
 */

export function readFiltersFromUrl(): URLSearchParams {
  if (typeof window === 'undefined') return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

/**
 * Mirror the given filters into the URL. `undefined`, empty strings and the
 * sentinel 'all' are treated as "default" and omitted so the URL stays clean.
 */
export function writeFiltersToUrl(filters: Record<string, string | undefined>) {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value && value !== 'all') {
      params.set(key, value);
    }
  }
  const query = params.toString();
  const url = query ? `${window.location.pathname}?${query}` : window.location.pathname;
  window.history.replaceState(null, '', url);
}
