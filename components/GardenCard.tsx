import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import theme from '../lib/theme';
import { Garden } from '../types/types';
import Card from './Card';
import PlantIcon from './PlantIcon';
import Typography from './Typography';

// Get screen dimensions for responsive sizing
const screenWidth = Dimensions.get('window').width;

interface GardenCardProps {
  garden: Garden;
  harvestCount: number;
  onPress: (garden: Garden) => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * A specialized card component for displaying garden information
 */
const GardenCard: React.FC<GardenCardProps> = ({
  garden,
  harvestCount,
  onPress,
  style,
}) => {
  return (
    <Card 
      onPress={() => onPress(garden)} 
      style={[styles.container, style]}
      elevation="medium"
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.iconBackground}>
            <PlantIcon iconName="sprout" size={32} />
          </View>
        </View>
        
        <View style={styles.infoContainer}>
          <Typography 
            variant="h3" 
            numberOfLines={1}
            style={styles.gardenName}
          >
            {garden.name}
          </Typography>
          
          {garden.location ? (
            <View style={styles.locationContainer}>
              <MaterialIcons
                name="location-on"
                size={16}
                color={theme.colors.textSecondary}
                style={styles.locationIcon}
              />
              <Typography
                variant="body2"
                color={theme.colors.textSecondary}
                numberOfLines={1}
                style={styles.locationText}
              >
                {garden.location}
              </Typography>
            </View>
          ) : null}

          {garden.description ? (
            <Typography
              variant="body2"
              color={theme.colors.textSecondary}
              numberOfLines={2}
              style={styles.description}
            >
              {garden.description}
            </Typography>
          ) : null}
          
          <View style={styles.harvestBadge}>
            <View style={styles.harvestIconContainer}>
              <MaterialIcons
                name="eco"
                size={14}
                color={theme.colors.primary}
              />
            </View>
            <Typography variant="caption" color={theme.colors.primary} style={styles.harvestText}>
              {harvestCount} {harvestCount === 1 ? 'harvest' : 'harvests'} logged
            </Typography>
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    width: screenWidth - (theme.spacing.lg * 2),
    alignSelf: 'center',
    minHeight: 100,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    padding: theme.spacing.sm,
  },
  iconContainer: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    flexShrink: 0,
  },
  iconBackground: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    backgroundColor: `${theme.colors.primary}12`,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: `${theme.colors.primary}25`,
  },
  infoContainer: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  gardenName: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: -0.3,
    marginBottom: 4,
    flex: 1,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'nowrap',
  },
  locationIcon: {
    marginRight: theme.spacing.xs,
  },
  locationText: {
    marginLeft: 2,
    flexShrink: 1,
  },
  harvestBadge: {
    backgroundColor: `${theme.colors.primary}10`,
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: theme.borderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${theme.colors.primary}20`,
  },
  harvestIconContainer: {
    marginRight: theme.spacing.xs,
  },
  harvestText: {
    fontWeight: '500',
  },
  description: {
    marginBottom: 6,
    fontSize: 13,
  },
});

export default GardenCard;
