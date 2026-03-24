import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming
} from 'react-native-reanimated';

interface FadeInViewProps {
    children: React.ReactNode;
    style?: ViewStyle;
    delay?: number;
    duration?: number;
    direction?: 'up' | 'down' | 'none';
}

export function FadeInView({
    children,
    style,
    delay = 0,
    duration = 500,
    direction = 'none'
}: FadeInViewProps) {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(direction === 'none' ? 0 : direction === 'up' ? 20 : -20);

    useEffect(() => {
        opacity.value = withDelay(delay, withTiming(1, { duration, easing: Easing.out(Easing.cubic) }));
        if (direction !== 'none') {
            translateY.value = withDelay(delay, withTiming(0, { duration, easing: Easing.out(Easing.cubic) }));
        }
    }, [delay, duration, direction]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [{ translateY: translateY.value }],
        };
    });

    return (
        <Animated.View style={[style, animatedStyle]}>
            {children}
        </Animated.View>
    );
}
