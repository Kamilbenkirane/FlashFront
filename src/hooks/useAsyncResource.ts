import { getErrorMessage } from '@/utils/errorMessage';
import { useCallback, useEffect, useState } from 'react';

interface UseAsyncResourceOptions<T> {
  initialData: T;
  load: () => Promise<T>;
  fallbackErrorMessage: string;
  enabled?: boolean;
  initialLoading?: boolean;
  resetDataOnLoad?: boolean;
  resetDataOnError?: boolean;
}

const useAsyncResource = <T>({
  initialData,
  load,
  fallbackErrorMessage,
  enabled = true,
  initialLoading = enabled,
  resetDataOnLoad = false,
  resetDataOnError = false,
}: UseAsyncResourceOptions<T>) => {
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!enabled) {
      setData(initialData);
      setIsLoading(false);
      setError(null);
      return;
    }

    if (resetDataOnLoad) {
      setData(initialData);
    }

    setIsLoading(true);
    setError(null);

    try {
      const nextData = await load();
      setData(nextData);
    } catch (nextError) {
      if (resetDataOnError) {
        setData(initialData);
      }
      setError(getErrorMessage(nextError, fallbackErrorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [
    enabled,
    fallbackErrorMessage,
    initialData,
    load,
    resetDataOnError,
    resetDataOnLoad,
  ]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    data,
    isLoading,
    error,
    reload,
  };
};

export default useAsyncResource;
