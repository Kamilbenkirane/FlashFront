import useAsyncResource from '@/hooks/useAsyncResource';
import {
  type AnalyticsRange,
  createEmptyProfileAnalytics,
} from '@/interfaces/Analytics';
import { getCurrentUserAnalyticsRequest } from '@/services/backendClient';
import { useCallback, useMemo } from 'react';

const useProfileAnalytics = (
  range: AnalyticsRange,
  recentLimit = 5,
  enabled = true,
) => {
  const load = useCallback(
    () => getCurrentUserAnalyticsRequest(range, recentLimit),
    [range, recentLimit],
  );
  const initialData = useMemo(
    () => createEmptyProfileAnalytics(range),
    [range],
  );

  return useAsyncResource({
    initialData,
    load,
    fallbackErrorMessage: 'Could not load your analytics.',
    enabled,
    resetDataOnLoad: true,
  });
};

export default useProfileAnalytics;
