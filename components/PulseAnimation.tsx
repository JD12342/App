import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

interface PulseAnimationProps {
  children: React.ReactNode;
  duration?: number;
  minScale?: number;
  maxScale?: number;
  style?: any;
}

export const PulseAnimation: React.FC<PulseAnimationProps> = ({
  children,
  duration = 2000,
  minScale = 1,
  maxScale = 1.05,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(minScale)).current;

  useEffect(() => {
    scaleAnim.setValue(minScale);

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: maxScale,
          duration: duration / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: minScale,
          duration: duration / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, [duration, maxScale, minScale, scaleAnim]);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

export default PulseAnimation;
