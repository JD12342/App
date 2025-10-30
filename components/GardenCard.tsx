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
          <PlantIcon iconName="sprout" />
        </View>
        
        <View style={styles.infoContainer}>
          <Typography variant="h3" numberOfLines={1}>
            {garden.name}
          </Typography>
          
          {garden.location ? (
            <View style={styles.locationContainer}>
              <MaterialIcons
                name="location-on"
                size={16}
                color={theme.colors.textSecondary}
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
          
          <View style={styles.harvestBadge}>
            <Typography variant="caption" color={theme.colors.primary}>
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
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    width: screenWidth - (theme.spacing.md * 2), // Adjust width based on screen size
    alignSelf: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
  },
  iconContainer: {
    width: screenWidth > 320 ? 60 : 50, // Smaller icon on very small screens
    height: screenWidth > 320 ? 60 : 50,
    borderRadius: 30,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    flexShrink: 0,
  },
  infoContainer: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0, // Important for text truncation
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    flexWrap: 'nowrap',
  },
  locationText: {
    marginLeft: 4,
    flexShrink: 1,
  },
  harvestBadge: {
    marginTop: theme.spacing.sm,
    backgroundColor: `${theme.colors.primary}15`,
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: theme.borderRadius.sm,
  },
});

export default GardenCard;
