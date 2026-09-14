import useCachedResource from '@/hooks/useCachedResource';
import {
  type AnalyticsRange,
  createEmptyProfileAnalytics,
} from '@/interfaces/Analytics';
import { useAuth } from '@/providers/AuthProvider';
import { getCurrentUserAnalyticsRequest } from '@/services/backendClient';
import { cacheKeys } from '@/services/dataCache';
import { useCallback, useMemo } from 'react';

const useProfileAnalytics = (
  range: AnalyticsRange,
  recentLimit = 5,
  enabled = true,
) => {
  const { authUser } = useAuth();
  const identityId = authUser?.id ?? null;
  const load = useCallback(
    () => getCurrentUserAnalyticsRequest(range, recentLimit),
    [range, recentLimit],
  );
  const initialData = useMemo(
    () => createEmptyProfileAnalytics(range),
    [range],
  );

  return useCachedResource({
    cacheKey: identityId
      ? cacheKeys.analytics(identityId, range, recentLimit)
      : null,
    initialData,
    load,
    fallbackErrorMessage: 'Could not load your analytics.',
    enabled,
  });
};

export default useProfileAnalytics;
