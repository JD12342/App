import React, { useCallback, useMemo, useRef } from 'react';
import { Animated, FlatList, RefreshControl, StyleSheet } from 'react-native';
import theme from '../lib/theme';
import { Garden, Harvest } from '../types/types';
import GardenCard from './GardenCard';

// Importing constants for list virtualization
const INITIAL_NUM_TO_RENDER = 3; // Reduced from 5
const MAX_TO_RENDER_PER_BATCH = 2; // Reduced from 3
const WINDOW_SIZE = 3; // Reduced from 5

interface AnimatedGardenListProps {
  gardens: Garden[];
  harvests: Harvest[];
  refreshing: boolean;
  onRefresh: () => void;
  onGardenPress: (garden: Garden) => void;
  headerComponent?: React.ReactElement;
}

/**
 * An animated list of garden cards with fade-in and slide-up effects
 * Optimized for performance
 */
const AnimatedGardenList: React.FC<AnimatedGardenListProps> = ({
  gardens,
  harvests,
  refreshing,
  onRefresh,
  onGardenPress,
  headerComponent,
}) => {
  // Pre-calculate harvest counts for better performance
  const harvestCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    harvests.forEach(harvest => {
      counts[harvest.gardenId] = (counts[harvest.gardenId] || 0) + 1;
    });
    return counts;
  }, [harvests]);

  // Store animation references
  const animationsRef = useRef(new Map<string, { fade: Animated.Value; translate: Animated.Value }>());
  
  // Initialize animations for new items
  const getAnimations = useCallback((id: string, index: number) => {
    if (!animationsRef.current.has(id)) {
      const fadeAnim = new Animated.Value(0);
      const translateY = new Animated.Value(20); // Further reduced from 30 for faster animation
      
      animationsRef.current.set(id, { fade: fadeAnim, translate: translateY });
      
      // Start animations with staggered delay based on index
      // Using a shorter duration and smaller delay
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200, // Further reduced from 300
          delay: index * 25, // Further reduced from 50
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200, // Further reduced from 300
          delay: index * 25, // Further reduced from 50
          useNativeDriver: true,
        }),
      ]).start();
    }
    
    return animationsRef.current.get(id)!;
  }, []);

  // Render each garden item with animation - memoized for performance
  const renderGardenItem = useCallback(({ item, index }: { item: Garden; index: number }) => {
    const animations = getAnimations(item.id, index);

    return (
      <Animated.View
        style={[
          {
            opacity: animations.fade,
            transform: [{ translateY: animations.translate }],
          },
        ]}
      >
        <GardenCard
          garden={item}
          harvestCount={harvestCounts[item.id] || 0}
          onPress={onGardenPress}
        />
      </Animated.View>
    );
  }, [getAnimations, harvestCounts, onGardenPress]);

  return (
    <FlatList
      data={gardens}
      renderItem={renderGardenItem}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={headerComponent}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
      showsVerticalScrollIndicator={false}
      initialNumToRender={INITIAL_NUM_TO_RENDER} // Reduced initial render count
      maxToRenderPerBatch={MAX_TO_RENDER_PER_BATCH} // Render fewer items per batch
      windowSize={WINDOW_SIZE} // Keep fewer items in memory
      removeClippedSubviews={true} // Remove items outside of viewport
      updateCellsBatchingPeriod={50} // Batch cell updates
      getItemLayout={(data, index) => (
        // Pre-calculate item dimensions to improve scroll performance
        { length: 110, offset: 110 * index, index }
      )}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xxl * 2, // Extra padding for FAB
    width: '100%',
  },
});

export default React.memo(AnimatedGardenList); // Prevent re-renders when parent re-renders
