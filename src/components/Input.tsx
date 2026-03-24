import { palette, radius, spacing, typography } from '@/src/design-system';
import React, { useState } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    UIManager,
    View,
    ViewStyle
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';

if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    containerStyle?: ViewStyle;
}

export function Input({
    label,
    error,
    leftIcon,
    rightIcon,
    containerStyle,
    onFocus,
    onBlur,
    style,
    ...props
}: InputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const borderColorValue = useSharedValue<string>(palette.neutral.gray200);

    const handleFocus = (e: any) => {
        setIsFocused(true);
        borderColorValue.value = withTiming(palette.brand.primary, { duration: 200 });
        onFocus?.(e);
    };

    const handleBlur = (e: any) => {
        setIsFocused(false);
        borderColorValue.value = withTiming(error ? palette.status.error : palette.neutral.gray200, { duration: 200 });
        onBlur?.(e);
    };

    // If there is an error, force border color to error immediately, but we rely on effect or just render logic
    // Reanimated style for border
    const animatedBorderStyles = useAnimatedStyle(() => {
        return {
            borderColor: error ? palette.status.error : borderColorValue.value,
            borderWidth: 1.5,
        };
    });

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}

            <Animated.View style={[styles.inputContainer, animatedBorderStyles]}>
                {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

                <TextInput
                    style={[styles.input, style]}
                    placeholderTextColor={palette.neutral.gray400}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    selectionColor={palette.brand.primary}
                    {...props}
                />

                {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
            </Animated.View>

            {error && (
                <Animated.View entering={undefined /* simple fade could go here */}>
                    <Text style={styles.errorText}>{error}</Text>
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    label: {
        ...typography.label,
        color: palette.neutral.gray700,
        marginBottom: spacing.xs,
        marginLeft: spacing.xs,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        // backgroundColor: palette.neutral.t,
        borderRadius: radius.md,
        paddingLeft: spacing.md,
        // minHeight: 56, // Accessible touch target
        // paddingHorizontal: spacing.md,
    },
    input: {
        flex: 1,
        // backgroundColor : '#0000001e',
        height: '100%',
        paddingVertical: spacing.md,
    },
    leftIcon: {
        marginRight: spacing.sm,
    },
    rightIcon: {
        marginLeft: spacing.sm,
    },
    errorText: {
        ...typography.caption,
        color: palette.status.error,
        marginTop: spacing.xs,
        marginLeft: spacing.xs,
    },
});
