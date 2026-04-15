import { useState, useEffect } from 'react';
import { supabase } from './supabase';

export function useSavedCafes(userId: string | null) {
  const [savedCafes, setSavedCafes] = useState<string[]>([]);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      const { data, error } = await supabase
        .from('saved_cafes')
        .select('cafe_id')
        .eq('user_id', userId);
      if (error) {
        console.error('Error loading saved cafes:', error.message);
        return;
      }
      if (data) setSavedCafes(data.map((row) => row.cafe_id));
    };
    load();
  }, [userId]);

  const toggleSave = async (cafeId: string) => {
    if (!userId) return;
    const isSaved = savedCafes.includes(cafeId);
    if (isSaved) {
      const { error } = await supabase
        .from('saved_cafes')
        .delete()
        .eq('user_id', userId)
        .eq('cafe_id', cafeId);
      if (error) {
        console.error('Error removing saved cafe:', error.message);
        return;
      }
      setSavedCafes((prev) => prev.filter((c) => c !== cafeId));
    } else {
      const { error } = await supabase
        .from('saved_cafes')
        .insert({ user_id: userId, cafe_id: cafeId });
      if (error) {
        console.error('Error saving cafe:', error.message);
        return;
      }
      setSavedCafes((prev) => [...prev, cafeId]);
    }
  };

  return { savedCafes, toggleSave };
}
