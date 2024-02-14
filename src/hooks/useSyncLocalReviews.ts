import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import syncLocalReviews from '../functions/syncLocalReviews';

// Define the custom hook
const useSyncLocalReviews = () => {
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        syncLocalReviews();
      }
    });

    // Clean up
    return () => unsubscribe();
  }, []); // Empty dependency array means this effect runs only once after the initial render
};

export default useSyncLocalReviews;
