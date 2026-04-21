import PagerView from 'react-native-pager-view';
import { useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import HomePage from 'components/pages/home/HomePage';
import ExplorePage from 'components/pages/explore/ExplorePage';
import FeedPage from 'components/pages/feed/FeedPage';
import LeaderboardPage from 'components/pages/leaderboard/LeaderboardPage';
import ProfilePage from 'components/pages/profile/ProfilePage';
import BottomNav from 'components/BottomNav';

export default function TabsLayout() {
  const pagerRef = useRef<PagerView>(null);
  const [activePage, setActivePage] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  const navigateToTab = (index: number) => {
    pagerRef.current?.setPage(index);
  };

  const pointerEvents = isScrolling ? 'none' : 'auto';

  return (
    <View style={{ flex: 1 }}>
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e) => setActivePage(e.nativeEvent.position)}
        onPageScrollStateChanged={(e) =>
          setIsScrolling(e.nativeEvent.pageScrollState !== 'idle')
        }
      >
        <View key="0" style={styles.page} pointerEvents={pointerEvents}><HomePage /></View>
        <View key="1" style={styles.page} pointerEvents={pointerEvents}><ExplorePage /></View>
        <View key="2" style={styles.page} pointerEvents={pointerEvents}><FeedPage /></View>
        <View key="3" style={styles.page} pointerEvents={pointerEvents}><LeaderboardPage /></View>
        <View key="4" style={styles.page} pointerEvents={pointerEvents}><ProfilePage /></View>
      </PagerView>
      <BottomNav
        activeTab={['home', 'explore', 'feed', 'leaderboard', 'profile'][activePage] as any}
        onTabPress={(tab) => {
          const index = ['home', 'explore', 'feed', 'leaderboard', 'profile'].indexOf(tab);
          if (index !== -1) navigateToTab(index);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
});