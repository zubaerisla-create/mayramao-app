import { palette, spacing, typography } from '@/src/design-system';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
    Extrapolation,
    SharedValue,
    interpolate,
    useAnimatedStyle
} from 'react-native-reanimated';
import { OnboardingData } from '../data';

interface OnboardingItemProps {
    item: OnboardingData;
    index: number;
    x: SharedValue<number>;
}

export function OnboardingItem({ item, index, x }: OnboardingItemProps) {
    const { width } = useWindowDimensions();

    const animatedIconStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            x.value,
            [(index - 1) * width, index * width, (index + 1) * width],
            [0, 1, 0],
            Extrapolation.CLAMP
        );

        const scale = interpolate(
            x.value,
            [(index - 1) * width, index * width, (index + 1) * width],
            [0.5, 1, 0.5],
            Extrapolation.CLAMP
        );

        const translateY = interpolate(
            x.value,
            [(index - 1) * width, index * width, (index + 1) * width],
            [100, 0, 100],
            Extrapolation.CLAMP
        );

        return {
            opacity,
            transform: [{ scale }, { translateY }],
        };
    });

    const animatedTextTranslateY = useAnimatedStyle(() => {
        const translateY = interpolate(
            x.value,
            [(index - 1) * width, index * width, (index + 1) * width],
            [50, 0, 50],
            Extrapolation.CLAMP
        );
        return {
            transform: [{ translateY }],
        };
    });


    // Map icon string to Expo Vector Icon name
    const getIconName = (icon: string): keyof typeof Ionicons.glyphMap => {
        switch (icon) {
            case 'shield': return 'shield-checkmark-outline';
            case 'chart': return 'trending-up-outline';
            case 'smile': return 'happy-outline';
            default: return 'help-circle-outline';
        }
    };

    const getIconColor = (color: string) => {
        switch (color) {
            case 'green': return palette.status.success;
            case 'blue': return palette.brand.secondary;
            case 'orange': return palette.status.warning;
            default: return palette.brand.primary;
        }
    }

    const getBackgroundColor = (color: string) => {
        switch (color) {
            case 'green': return palette.pastel.green;
            case 'blue': return palette.pastel.blue;
            case 'orange': return palette.pastel.orange;
            default: return palette.neutral.gray100;
        }
    }

    return (
        <View style={[styles.container, { width }]}>
            <Animated.View style={[styles.iconContainer, { backgroundColor: getBackgroundColor(item.color) }, animatedIconStyle]}>
                <Ionicons name={getIconName(item.icon)} size={48} color={getIconColor(item.color)} />
            </Animated.View>

            <Animated.View style={[styles.textContainer, animatedTextTranslateY]}>
                <Animated.Text style={styles.title}>{item.title}</Animated.Text>
                <Animated.Text style={styles.description}>{item.description}</Animated.Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 30, // Squircle-ish
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xxl,
        shadowColor: palette.brand.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    textContainer: {
        alignItems: 'center',
    },
    title: {
        ...typography.h2,
        color: palette.brand.primary,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    description: {
        ...typography.bodyRegular,
        color: palette.neutral.gray600,
        textAlign: 'center',
        paddingHorizontal: spacing.md,
        lineHeight: 24,
    },
});
