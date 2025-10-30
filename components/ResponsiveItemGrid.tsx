import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import theme from '../lib/theme';
import EmptyState from './EmptyState';
import ResponsiveGrid from './ResponsiveGrid';

interface ResponsiveItemGridProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor?: (item: T, index: number) => string;
  emptyMessage?: string;
  itemMinWidth?: number;
  spacing?: number;
  style?: ViewStyle;
  containerStyle?: ViewStyle;
  numColumns?: number;
}

/**
 * A responsive grid for displaying items with proper empty state handling
 * and performance optimizations
 */
function ResponsiveItemGrid<T>({
  data,
  renderItem,
  keyExtractor,
  emptyMessage = 'No items to display',
  itemMinWidth = 180,
  spacing = theme.spacing.md,
  style,
  containerStyle,
  numColumns,
}: ResponsiveItemGridProps<T>) {
  // If there's no data, show an empty state
  if (!data || data.length === 0) {
    return (
      <View style={[styles.emptyContainer, containerStyle]}>
        <EmptyState
          title={emptyMessage}
          message="Try adding items to see them here"
        />
      </View>
    );
  }

  // Otherwise, render the grid
  return (
    <ResponsiveGrid
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      itemMinWidth={itemMinWidth}
      spacing={spacing}
      style={style}
      containerStyle={containerStyle}
      numColumns={numColumns}
    />
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
});

export default React.memo(ResponsiveItemGrid);
