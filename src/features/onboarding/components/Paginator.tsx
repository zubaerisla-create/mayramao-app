import { palette, radius, spacing } from '@/src/design-system';
import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
    Extrapolation,
    SharedValue,
    interpolate,
    useAnimatedStyle
} from 'react-native-reanimated';
import { OnboardingData } from '../data';

interface PaginatorProps {
    data: OnboardingData[];
    x: SharedValue<number>;
}

export function Paginator({ data, x }: PaginatorProps) {
    const { width } = useWindowDimensions();

    return (
        <View style={styles.container}>
            {data.map((_, i) => {
                const animatedDotStyle = useAnimatedStyle(() => {
                    const widthAnim = interpolate(
                        x.value,
                        [(i - 1) * width, i * width, (i + 1) * width],
                        [8, 24, 8], // Normal dot is 8, active expands to 24
                        Extrapolation.CLAMP
                    );

                    const opacity = interpolate(
                        x.value,
                        [(i - 1) * width, i * width, (i + 1) * width],
                        [0.3, 1, 0.3],
                        Extrapolation.CLAMP
                    );

                    // Change color for active dot
                    const backgroundColor = interpolate(
                        x.value,
                        [(i - 1) * width, i * width, (i + 1) * width],
                        // We can't interpolate colors directly easily with just interpolate unless using interpolateColor, 
                        // but opacity handles the visual distinction well enough for this simple implementation.
                        // Ideally use interpolateColor for perfect gray -> blue transition
                        [0, 1, 0]
                    );

                    return {
                        width: widthAnim,
                        opacity,
                        backgroundColor: palette.brand.primary, // Base color, opacity changes it appearance
                    };
                });

                return (
                    <Animated.View
                        key={i.toString()}
                        style={[styles.dot, animatedDotStyle]}
                    />
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.sm,
    },
    dot: {
        height: 8,
        borderRadius: radius.full,
        backgroundColor: palette.brand.primary,
    },
});
