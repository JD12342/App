import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import theme from '../lib/theme';
import Typography from './Typography';

interface AppLogoProps {
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  labelVariant?: 'full' | 'short';
}

/**
 * App logo component displaying the official Garden Tracker logo
 */
const AppLogo: React.FC<AppLogoProps> = ({
  size = 'medium',
  showLabel = false,
  labelVariant = 'full',
}) => {
  const sizeConfig = {
    small: { imageSize: 32, containerSize: 40 },
    medium: { imageSize: 48, containerSize: 56 },
    large: { imageSize: 60, containerSize: 72 },
  };

  const config = sizeConfig[size];

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.logoContainer,
          { width: config.containerSize, height: config.containerSize },
        ]}
      >
        <Image
          source={require('../assets/images/icon.png')}
          style={[styles.logoImage, { width: config.imageSize, height: config.imageSize }]}
          resizeMode="contain"
        />
      </View>
      {showLabel && (
        <Typography
          variant={size === 'large' ? 'h3' : 'body1'}
          style={styles.label}
          color={theme.colors.text}
        >
          {labelVariant === 'full' ? 'Garden Tracker' : 'GT'}
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  logoContainer: {
    backgroundColor: '#F5F5DC',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoImage: {
    width: 48,
    height: 48,
  },
  label: {
    fontWeight: theme.typography.fontWeight.bold,
  },
});

export default AppLogo;
