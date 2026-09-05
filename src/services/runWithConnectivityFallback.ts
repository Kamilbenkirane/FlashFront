import NetInfo from '@react-native-community/netinfo';

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
  const connectionInfo = await NetInfo.fetch();
  if (!connectionInfo.isConnected) {
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
