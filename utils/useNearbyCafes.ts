import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getNearbyCafes, FILTER_QUERIES } from './foursquare';
import { CACHE_TTL, DEFAULT_LAT, DEFAULT_LNG } from './constants';
import { supabase } from './supabase';

const SPECIALTY_QUERIES = ['matcha', 'milk tea', 'boba'];

function dedupe(cafes: any[]): any[] {
  return [...new Map(cafes.map((c) => [c.fsq_place_id, c])).values()];
}

export function useNearbyCafes(
  activeFilter: string | null,
  expandingRadius = false,
  userId?: string | null,
  overrideCoords?: { lat: number; lng: number } | null
) {
  const [nearbyCafes, setNearbyCafes] = useState<any[]>([]);
  const [loadingCafes, setLoadingCafes] = useState(true);

  const load = async () => {
    const lat = overrideCoords?.lat ?? DEFAULT_LAT;
    const lng = overrideCoords?.lng ?? DEFAULT_LNG;

    // Handle visited filter
    if (activeFilter === 'visited' && userId) {
      const { data } = await supabase
        .from('reviews')
        .select('cafe_id, cafe_name')
        .eq('user_id', userId);
      if (data) {
        const uniqueCafes = [...new Map(data.map((r) => [r.cafe_id, r])).values()];
        setNearbyCafes(
          uniqueCafes.map((r) => ({
            fsq_place_id: r.cafe_id,
            name: r.cafe_name,
            location: null,
            categories: [],
          }))
        );
      }
      setLoadingCafes(false);
      return;
    }

    const cacheKey = `cafes_${activeFilter ?? 'none'}_${lat.toFixed(3)}_${lng.toFixed(3)}`;

    if (!overrideCoords) {
      try {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            setNearbyCafes(data);
            setLoadingCafes(false);
            return;
          }
        }
      } catch (e) {}
    }

    const query =
      activeFilter && FILTER_QUERIES[activeFilter] ? FILTER_QUERIES[activeFilter] : undefined;

    if (expandingRadius) {
      const radii = [800, 1600, 3200, 8000];
      for (const radius of radii) {
        const [main, ...specialty] = await Promise.all([
          getNearbyCafes(lat, lng, radius, query),
          ...SPECIALTY_QUERIES.map((q) => getNearbyCafes(lat, lng, radius, q)),
        ]);
        const merged = dedupe([main, ...specialty].flat());
        if (merged.length >= 3) {
          setNearbyCafes(merged);
          setLoadingCafes(false);
          if (!overrideCoords) {
            try {
              await AsyncStorage.setItem(
                cacheKey,
                JSON.stringify({ data: merged, timestamp: Date.now() })
              );
            } catch (e) {}
          }
          return;
        }
      }
      setNearbyCafes([]);
      setLoadingCafes(false);
    } else {
      const [main, ...specialty] = await Promise.all([
        getNearbyCafes(lat, lng, 800, query),
        ...SPECIALTY_QUERIES.map((q) => getNearbyCafes(lat, lng, 800, q)),
      ]);
      const merged = dedupe([main, ...specialty].flat());
      setNearbyCafes(merged);
      setLoadingCafes(false);
      if (!overrideCoords) {
        try {
          await AsyncStorage.setItem(
            cacheKey,
            JSON.stringify({ data: merged, timestamp: Date.now() })
          );
        } catch (e) {}
      }
    }
  };

  useEffect(() => {
    load();
  }, [activeFilter, userId, overrideCoords?.lat, overrideCoords?.lng]);

  return { nearbyCafes, loadingCafes };
}