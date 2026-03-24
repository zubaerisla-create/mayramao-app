import React, { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from 'react-native-reanimated';

interface AnimatedStatusCircleProps {
  size?: number;
  color: string;     // inner circle color
  bgColor: string;   // outer circle color
}

export default function AnimatedStatusCircle({ size = 100, color, bgColor }: AnimatedStatusCircleProps) {
  const scale = useSharedValue(1);
  const innerColor = useSharedValue(color);
  const outerColor = useSharedValue(bgColor);

  // Pulse animation
  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  // Animate color change whenever props change
  useEffect(() => {
    innerColor.value = withTiming(color, { duration: 500 });
    outerColor.value = withTiming(bgColor, { duration: 500 });
  }, [color, bgColor]);

  const animatedOuterStyle = useAnimatedStyle(() => ({
    width: size,
    height: size,
    borderRadius: size / 2,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ scale: scale.value }],
    backgroundColor: outerColor.value,
    shadowColor: outerColor.value,
    shadowOpacity: 0.4,
    shadowRadius: 10 * scale.value,
    shadowOffset: { width: 0, height: 4 * scale.value },
  }));

  const animatedInnerStyle = useAnimatedStyle(() => ({
    width: size * 0.7,
    height: size * 0.7,
    borderRadius: (size * 0.7) / 2,
    backgroundColor: innerColor.value,
    transform: [{ scale: 0.8 + 0.2 * scale.value }],
  }));

  return (
    <Animated.View style={animatedOuterStyle}>
      <Animated.View style={animatedInnerStyle} />
    </Animated.View>
  );
}
