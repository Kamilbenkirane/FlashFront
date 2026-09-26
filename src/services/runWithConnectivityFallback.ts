import { isDeviceOnline } from '@/services/connectivity';

interface ConnectivityFallbackOptions<TResult> {
  runOnline: () => Promise<TResult>;
  runOffline: () => Promise<void>;
  offlineResult: TResult;
}

export const runWithConnectivityFallback = async <TResult>({
  runOnline,
  runOffline,
  offlineResult,
}: ConnectivityFallbackOptions<TResult>) => {
  if (!(await isDeviceOnline())) {
    await runOffline();
    return offlineResult;
  }

  try {
    return await runOnline();
  } catch {
    await runOffline();
    return offlineResult;
  }
};
