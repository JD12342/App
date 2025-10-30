import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

interface FadeInViewProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  style?: any;
  from?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

export const FadeInView: React.FC<FadeInViewProps> = ({
  children,
  duration = 800,
  delay = 0,
  style,
  from = 'center',
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 0,
        duration,
        delay,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => {
      animation.stop();
    };
  }, [delay, duration, fadeAnim, translateAnim]);

  const getTransformStyle = () => {
    switch (from) {
      case 'top':
        return { transform: [{ translateY: translateAnim.interpolate({ inputRange: [0, 50], outputRange: [0, -50] }) }] };
      case 'bottom':
        return { transform: [{ translateY: translateAnim }] };
      case 'left':
        return { transform: [{ translateX: translateAnim.interpolate({ inputRange: [0, 50], outputRange: [0, -50] }) }] };
      case 'right':
        return { transform: [{ translateX: translateAnim }] };
      default:
        return { transform: [{ translateY: translateAnim }] };
    }
  };

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          ...getTransformStyle(),
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

export default FadeInView;
