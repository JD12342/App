import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'horizontal' | 'vertical' | 'icon-only';
  color?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'medium', 
  variant = 'horizontal',
  color = '#4CAF50' 
}) => {
  const getIconSize = () => {
    switch (size) {
      case 'small': return 24;
      case 'medium': return 32;
      case 'large': return 48;
      default: return 32;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small': return 16;
      case 'medium': return 20;
      case 'large': return 28;
      default: return 20;
    }
  };

  const iconSize = getIconSize();
  const textSize = getTextSize();

  if (variant === 'icon-only') {
    return (
      <View style={[styles.iconContainer, { backgroundColor: 'transparent' }]}>
        <Image 
          source={require('../assets/images/icon.png')}
          style={{ width: iconSize, height: iconSize }}
          resizeMode="contain"
        />
      </View>
    );
  }

  if (variant === 'vertical') {
    return (
      <View style={styles.verticalContainer}>
        <View style={[styles.iconContainer, { backgroundColor: 'transparent' }]}>
          <Image 
            source={require('../assets/images/icon.png')}
            style={{ width: iconSize, height: iconSize }}
            resizeMode="contain"
          />
        </View>
        <Text style={[styles.appName, { fontSize: textSize }]}>
          Garden
        </Text>
        <Text style={[styles.appType, { fontSize: textSize * 0.8 }]}>
          Tracker
        </Text>
      </View>
    );
  }

  // Horizontal variant (default)
  return (
    <View style={styles.horizontalContainer}>
      <View style={[styles.iconContainer, { backgroundColor: 'transparent' }]}>
        <Image 
          source={require('../assets/images/icon.png')}
          style={{ width: iconSize, height: iconSize }}
          resizeMode="contain"
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.appName, { fontSize: textSize }]}>
          Garden
        </Text>
        <Text style={[styles.appType, { fontSize: textSize * 0.7 }]}>
          Tracker
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  verticalContainer: {
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    borderRadius: 12,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E6B800',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  textContainer: {
    flexDirection: 'column',
  },
  appName: {
    fontWeight: 'bold',
    letterSpacing: 0.5,
    color: '#B8860B',
  },
  appType: {
    fontWeight: '500',
    letterSpacing: 0.3,
    marginTop: -2,
    color: '#5D8A3A',
  },
});

export default Logo;
