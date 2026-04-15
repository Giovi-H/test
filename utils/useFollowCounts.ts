import { useState, useEffect } from 'react';
import { supabase } from './supabase';

export function useFollowCounts(targetUserId: string | number | null, refreshKey?: number) {
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    if (!targetUserId) return;
    const load = async () => {
      const [followersRes, followingRes] = await Promise.all([
        supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', Number(targetUserId)),
        supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', Number(targetUserId)),
      ]);
      if (followersRes.error) {
        console.error('Error loading follower count:', followersRes.error.message);
        return;
      }
      if (followingRes.error) {
        console.error('Error loading following count:', followingRes.error.message);
        return;
      }
      setFollowerCount(followersRes.count ?? 0);
      setFollowingCount(followingRes.count ?? 0);
    };
    load();
  }, [targetUserId, refreshKey]);

  return { followerCount, followingCount };
}
