import { readCachedValue, writeCachedValue } from '@/services/dataCache';
import { getErrorMessage } from '@/utils/errorMessage';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseCachedResourceOptions<T> {
  // Null disables caching for this resource.
  cacheKey: string | null;
  load: () => Promise<T>;
  initialData: T;
  fallbackErrorMessage: string;
  enabled?: boolean;
  // When false, a background refresh only updates the cache for the next
  // load and leaves the data currently shown untouched (snapshot semantics).
  applyBackgroundRefresh?: boolean;
  writeCache?: (value: T) => Promise<void>;
}

interface ResourceState<T> {
  // The resource this state belongs to; anything else is stale.
  key: string | null;
  data: T;
  hasData: boolean;
  error: string | null;
  isRefreshing: boolean;
}

interface RunLoadOptions {
  force?: boolean;
}

const UNCACHED_KEY = '__uncached__';

// Cache first, network second: a cached value is shown at once and revalidated
// in the background. Every flag is derived from the resource currently asked
// for, so switching resource never shows another one's data, and `isLoading`
// and `error` are only raised while there is nothing to show.
const useCachedResource = <T>({
  cacheKey,
  load,
  initialData,
  fallbackErrorMessage,
  enabled = true,
  applyBackgroundRefresh = true,
  writeCache,
}: UseCachedResourceOptions<T>) => {
  const resourceKey = enabled ? (cacheKey ?? UNCACHED_KEY) : null;
  const [state, setState] = useState<ResourceState<T>>({
    key: null,
    data: initialData,
    hasData: false,
    error: null,
    isRefreshing: false,
  });
  const stateRef = useRef(state);
  stateRef.current = state;
  const requestIdRef = useRef(0);

  const runLoad = useCallback(
    async ({ force = false }: RunLoadOptions = {}) => {
      const key = resourceKey;
      requestIdRef.current += 1;
      const requestId = requestIdRef.current;
      const isCurrent = () => requestIdRef.current === requestId;

      if (key === null) {
        return;
      }

      const cached =
        cacheKey && !force ? await readCachedValue<T>(cacheKey) : null;
      if (!isCurrent()) {
        return;
      }

      // A forced reload keeps showing what is already loaded for this key.
      const previous = stateRef.current;
      const keepsCurrentData =
        force && previous.key === key && previous.hasData;
      const hasDataToShow = cached !== null || keepsCurrentData;

      setState((current) => ({
        key,
        data:
          cached !== null
            ? cached
            : keepsCurrentData
              ? current.data
              : initialData,
        hasData: hasDataToShow,
        error: null,
        isRefreshing: hasDataToShow,
      }));

      try {
        const fresh = await load();
        if (cacheKey) {
          void (
            writeCache ? writeCache(fresh) : writeCachedValue(cacheKey, fresh)
          ).catch(() => undefined);
        }
        if (!isCurrent()) {
          return;
        }
        const appliesFresh = !hasDataToShow || applyBackgroundRefresh || force;
        setState((current) => ({
          key,
          data: appliesFresh ? fresh : current.data,
          hasData: true,
          error: null,
          isRefreshing: false,
        }));
      } catch (nextError) {
        if (!isCurrent()) {
          return;
        }
        setState((current) =>
          hasDataToShow
            ? { ...current, key, isRefreshing: false }
            : {
                key,
                data: initialData,
                hasData: false,
                error: getErrorMessage(nextError, fallbackErrorMessage),
                isRefreshing: false,
              },
        );
      }
    },
    [
      applyBackgroundRefresh,
      cacheKey,
      fallbackErrorMessage,
      initialData,
      load,
      resourceKey,
      writeCache,
    ],
  );

  useEffect(() => {
    void runLoad();
  }, [runLoad]);

  const reload = useCallback(() => runLoad({ force: true }), [runLoad]);

  const isCurrentState = state.key === resourceKey;
  const hasLoaded = isCurrentState && state.hasData;
  const error = isCurrentState ? state.error : null;

  return {
    data: isCurrentState ? state.data : initialData,
    isLoading: resourceKey !== null && !hasLoaded && error === null,
    isRefreshing: isCurrentState && state.isRefreshing,
    hasLoaded,
    error,
    reload,
  };
};

export default useCachedResource;
