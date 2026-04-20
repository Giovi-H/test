import { useState, useEffect } from 'react';
import { supabase } from './supabase';

export function useReviews(userId: string | number | null, refreshKey?: number) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [cafesVisited, setCafesVisited] = useState(0);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(
          'id, cafe_id, cafe_name, item_name, comments, drinks_rating, food_rating, vibe_rating, service_rating, photos, created_at'
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error loading reviews:', error.message);
        return;
      }
      if (data) {
        setReviews(data);
        setPhotos(data.flatMap((r) => r.photos ?? []));
        const uniqueCafes = new Set(data.map((r) => r.cafe_id));
        setCafesVisited(uniqueCafes.size);
      }
    };
    load();
  }, [userId, refreshKey]);

  return { reviews, photos, cafesVisited };
}
