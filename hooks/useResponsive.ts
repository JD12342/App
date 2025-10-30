import { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, ScaledSize } from 'react-native';
import theme from '../lib/theme';

/**
 * Custom hook for responsive design
 * Returns information about the current screen size and orientation
 * Optimized for performance
 */
export function useResponsive() {
  const [screenDimensions, setScreenDimensions] = useState(Dimensions.get('window'));
  
  // Using useMemo to avoid recalculating on every render
  const orientation = useMemo<'portrait' | 'landscape'>(
    () => screenDimensions.height > screenDimensions.width ? 'portrait' : 'landscape',
    [screenDimensions.height, screenDimensions.width]
  );
  
  // Optimize dimensions change handler
  const onChange = useCallback(({ window }: { window: ScaledSize }) => {
    setScreenDimensions(window);
  }, []);
  
  useEffect(() => {
    // Only add the event listener once
    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription.remove();
  }, [onChange]);
  
  const { width, height } = screenDimensions;
  
  // Use useMemo for all derived values to avoid recalculation
  return useMemo(() => ({
    width,
    height,
    orientation,
    isSmallDevice: width < theme.responsive.breakpoints.small,
    isTablet: width >= theme.responsive.breakpoints.medium,
    isDesktop: width >= theme.responsive.breakpoints.large,
    gridColumns: theme.responsive.getGridColumns(),
    isLandscape: orientation === 'landscape',
    isPortrait: orientation === 'portrait',
    spacing: {
      small: width < theme.responsive.breakpoints.small ? theme.spacing.xs : theme.spacing.sm,
      medium: width < theme.responsive.breakpoints.small ? theme.spacing.sm : theme.spacing.md,
      large: width < theme.responsive.breakpoints.small ? theme.spacing.md : theme.spacing.lg,
    }
  }), [width, height, orientation]);
}

export default useResponsive;
