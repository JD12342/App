import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

interface AppIconProps {
  size?: number;
}

export const AppIcon: React.FC<AppIconProps> = ({ size = 60 }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image 
        source={require('../assets/images/icon.png')}
        style={{ width: size, height: size, borderRadius: size * 0.25 }}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
});

export default AppIcon;
