import React from 'react';
import { Pressable, StyleProp, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';

interface ScaleButtonProps {
    children: React.ReactNode;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
    scale?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ScaleButton({
    children,
    onPress,
    style,
    scale = 0.96
}: ScaleButtonProps) {
    const scaleValue = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scaleValue.value }],
        };
    });

    const handlePressIn = () => {
        scaleValue.value = withSpring(scale, { damping: 10, stiffness: 300 });
    };

    const handlePressOut = () => {
        scaleValue.value = withSpring(1, { damping: 10, stiffness: 300 });
    };

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[style, animatedStyle]}
        >
            {children}
        </AnimatedPressable>
    );
}
