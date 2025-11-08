import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, Image, Text } from 'react-native';

interface AnimatedSplashScreenProps {
  onAnimationComplete: () => void;
}

export const AnimatedSplashScreen: React.FC<AnimatedSplashScreenProps> = ({ onAnimationComplete }) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }),
      Animated.sequence([
        Animated.delay(200),
        Animated.timing(textFadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true
        })
      ])
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }).start(() => onAnimationComplete());
    }, 2000);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, textFadeAnim, onAnimationComplete]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        <Animated.View style={[styles.logoWrapper, { 
          transform: [{ scale: scaleAnim }]
        }]}>
          <Image 
            source={require('../assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
        <Animated.Text style={[styles.appName, { opacity: textFadeAnim }]}>
          Garden Tracker
        </Animated.Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F5F5DC',
    zIndex: 1000
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  logoWrapper: {
    marginBottom: 16
  },
  logo: {
    width: 120,
    height: 120
  },
  appName: {
    fontSize: 24,
    color: '#5D8A3A',
    fontWeight: '600',
    letterSpacing: 1
  }
});

export default AnimatedSplashScreen;
