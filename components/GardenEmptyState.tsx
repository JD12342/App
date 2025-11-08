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
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: `${theme.colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    borderWidth: 2,
    borderColor: `${theme.colors.primary}30`,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    marginBottom: theme.spacing.md,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1,
    color: theme.colors.text,
  },
  message: {
    marginBottom: theme.spacing.xl,
    maxWidth: 300,
    fontSize: 16,
    lineHeight: 24,
  },
  button: {
    minWidth: 200,
    height: 52,
    borderRadius: 26,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});

export default GardenEmptyState;
