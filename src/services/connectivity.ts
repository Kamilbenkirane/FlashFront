import NetInfo from '@react-native-community/netinfo';

// An unknown state counts as online: a request that fails will fall back to
// the offline path anyway, while assuming offline would block for nothing.
export const isDeviceOnline = async (): Promise<boolean> => {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected !== false;
  } catch {
    return true;
  }
};
