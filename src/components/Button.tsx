import { palette, radius, spacing, typography } from '@/src/design-system';
import React from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';
import { ScaleButton } from './Animated/ScaleButton';

interface ButtonProps {
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export function Button({
    label,
    onPress,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    style,
    textStyle,
    leftIcon,
    rightIcon,
}: ButtonProps) {
    const isPrimary = variant === 'primary';
    const isOutline = variant === 'outline';
    const isGhost = variant === 'ghost';

    const baseBackgroundColor = isPrimary
        ? palette.brand.primary
        : isOutline || isGhost
            ? 'transparent'
            : palette.brand.secondary;

    const baseTextColor = isPrimary
        ? palette.neutral.white
        : isOutline
            ? palette.brand.primary
            : isGhost
                ? palette.neutral.gray700
                : palette.neutral.black;

    return (
        <ScaleButton
            onPress={!isLoading && !disabled ? onPress : undefined}
            style={[
                styles.container,
                {
                    backgroundColor: disabled ? palette.neutral.gray300 : baseBackgroundColor,
                    paddingVertical: size === 'sm' ? spacing.xs : size === 'lg' ? spacing.md : spacing.sm + 4,
                    paddingHorizontal: size === 'sm' ? spacing.md : size === 'lg' ? spacing.xl : spacing.lg,
                    borderColor: isOutline ? palette.brand.primary : 'transparent',
                    borderWidth: isOutline ? 1 : 0,
                },
                style,
            ]}
            scale={disabled ? 1 : 0.96}
        >
            {isLoading ? (
                <ActivityIndicator color={baseTextColor} size="small" />
            ) : (
                <>
                    {leftIcon}
                    <Text
                        style={[
                            typography.button,
                            {
                                color: disabled ? palette.neutral.gray500 : baseTextColor,
                                fontSize: size === 'sm' ? 12 : size === 'lg' ? 18 : 16,
                            },
                            textStyle,
                        ]}
                    >
                        {label}
                    </Text>
                    {rightIcon}
                </>
            )}
        </ScaleButton>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: radius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: spacing.sm,
    },
});
