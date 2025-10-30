import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import theme from '../lib/theme';
import Button from './Button';
import Typography from './Typography';

interface GardenEmptyStateProps {
  onAddGarden: () => void;
}

/**
 * A specialized empty state component for the garden list
 */
const GardenEmptyState: React.FC<GardenEmptyStateProps> = ({ onAddGarden }) => {
  // Animation values
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale, translateY]);

  return (
    <Animated.View 
      style={[
        styles.container, 
        {
          opacity,
          transform: [{ translateY }, { scale }],
        }
      ]}
    >
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons 
          name="sprout" 
          size={64} 
          color={theme.colors.primary} 
        />
      </View>

      <Typography variant="h2" style={styles.title}>
        No Gardens Yet
      </Typography>

      <Typography 
        variant="body1" 
        color={theme.colors.textSecondary}
        align="center"
        style={styles.message}
      >
        Tap the button below to start your first garden and begin tracking your harvests!
      </Typography>

      <Button
        title="Add Garden"
        onPress={onAddGarden}
        variant="primary"
        style={styles.button}
        icon={<MaterialCommunityIcons name="plus" size={20} color={theme.colors.white} />}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    marginBottom: theme.spacing.md,
  },
  message: {
    marginBottom: theme.spacing.xl,
    maxWidth: 300,
  },
  button: {
    minWidth: 180,
  },
});

export default GardenEmptyState;
