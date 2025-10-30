import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, View, ViewStyle } from 'react-native';
import theme from '../lib/theme';

interface EnhancedGridProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor?: (item: T, index: number) => string;
  itemMinWidth?: number;
  spacing?: number;
  style?: ViewStyle;
  numColumns?: number;
  containerStyle?: ViewStyle;
}

/**
 * An enhanced grid component that adjusts the number of columns based on screen width
 * Fully optimized for performance
 */
function EnhancedGrid<T>({
  data,
  renderItem,
  keyExtractor = (_, index) => index.toString(),
  itemMinWidth = 160,
  spacing = theme.spacing.md,
  style,
  numColumns: fixedNumColumns,
  containerStyle,
}: EnhancedGridProps<T>) {
  const [columnCount, setColumnCount] = useState(fixedNumColumns || 1);
  
  // Optimize column calculation
  const updateColumns = useCallback(() => {
    if (fixedNumColumns) {
      setColumnCount(fixedNumColumns);
      return;
    }
    
    const { width } = Dimensions.get('window');
    const availableWidth = width - spacing * 2;
    const columns = Math.max(1, Math.floor(availableWidth / (itemMinWidth + spacing)));
    setColumnCount(columns);
  }, [fixedNumColumns, itemMinWidth, spacing]);

  useEffect(() => {
    // Calculate columns on mount
    updateColumns();
    
    // Attach event listener for dimension changes
    const dimensionsListener = Dimensions.addEventListener('change', updateColumns);
    
    // Clean up
    return () => {
      dimensionsListener.remove();
    };
  }, [updateColumns]);

  // Memoize row data to avoid recalculations on every render
  const rows = useMemo(() => {
    const groupedData = [];
    for (let i = 0; i < data.length; i += columnCount) {
      groupedData.push(data.slice(i, i + columnCount));
    }
    return groupedData;
  }, [data, columnCount]);

  // Optimize row rendering
  const renderRow = useCallback(({ item, index }: { item: any; index: number }) => {
    if (!Array.isArray(item)) return null;
    
    return (
      <View style={[styles.row, { marginBottom: spacing }]}>
        {item.map((subItem, subIndex) => {
          const key = keyExtractor(subItem, index * columnCount + subIndex);
          
          return (
            <View 
              key={key} 
              style={[
                styles.itemContainer, 
                { 
                  marginRight: subIndex < item.length - 1 ? spacing : 0,
                  width: `${100 / columnCount}%`,
                  maxWidth: `${100 / columnCount}%`,
                  paddingRight: subIndex < item.length - 1 ? spacing : 0,
                }
              ]}
            >
              {renderItem(subItem, index * columnCount + subIndex)}
            </View>
          );
        })}
        
        {/* Add empty views to fill the row if needed */}
        {item.length < columnCount && Array.from({ length: columnCount - item.length }).map((_, i) => (
          <View 
            key={`empty-${i}`} 
            style={[
              styles.itemContainer, 
              { 
                width: `${100 / columnCount}%`,
                maxWidth: `${100 / columnCount}%`,
              }
            ]} 
          />
        ))}
      </View>
    );
  }, [keyExtractor, columnCount, renderItem, spacing]);

  return (
    <View style={[styles.container, containerStyle]}>
      <FlatList
        data={rows}
        renderItem={renderRow}
        keyExtractor={(_, index) => `row-${index}`}
        style={[styles.grid, style]}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={8}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  grid: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    width: '100%',
  },
  itemContainer: {
    flex: 1,
  },
});

export default EnhancedGrid;
