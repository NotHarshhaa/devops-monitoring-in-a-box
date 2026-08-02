import type { Query } from '@tanstack/react-query';

/** Poll slower when the upstream is down so local-dev logs aren't a 502 firehose. */
const ERROR_BACKOFF_MS = 30_000;

/**
 * React Query `refetchInterval` helper: normal cadence while healthy, backoff
 * after failures (e.g. proxy 502 when Docker isn't running).
 */
export function pollingInterval(
  normalMs: number,
  backoffMs: number = ERROR_BACKOFF_MS
): (query: Query) => number | false {
  return (query) => {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      return false;
    }
    if (query.state.error || query.state.status === 'error') {
      return backoffMs;
    }
    return normalMs;
  };
}
