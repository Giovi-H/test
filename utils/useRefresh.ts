import { useState, useCallback } from 'react';

export function useRefresh(onRefresh: () => Promise<void>) {
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshKey((prev) => prev + 1);
    setRefreshing(false);
  }, [onRefresh]);

  return { refreshing, refresh, refreshKey };
}
