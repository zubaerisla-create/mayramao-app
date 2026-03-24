import { palette, radius, shadows, spacing } from '@/src/design-system';
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { FadeInView } from './Animated/FadeInView';

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    delay?: number;
    variant?: 'elevated' | 'outlined' | 'flat';
}

export function Card({
    children,
    style,
    delay = 0,
    variant = 'elevated'
}: CardProps) {
    const isElevated = variant === 'elevated';
    const isOutlined = variant === 'outlined';

    return (
        <FadeInView
            delay={delay}
            direction="up"
            style={[
                styles.container,
                isElevated && styles.elevated,
                isOutlined && styles.outlined,
                style
            ]}
        >
            {children}
        </FadeInView>
    );
}


const styles = StyleSheet.create({
    container: {
        backgroundColor: palette.neutral.white,
        borderRadius: radius.md,
        padding: spacing.lg,
        overflow: 'hidden',
    },
    elevated: {
        ...shadows.md,
    },
    outlined: {
        borderWidth: 1,
        borderColor: palette.neutral.gray200,
    },
});
