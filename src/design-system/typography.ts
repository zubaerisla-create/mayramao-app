import { TextStyle } from 'react-native';

export const fontFamilies = {
    regular: 'System', // Replace with custom font (e.g., Inter_400Regular)
    medium: 'System',  // Replace with custom font (e.g., Inter_500Medium)
    bold: 'System',    // Replace with custom font (e.g., Inter_700Bold)
    semiBold: 'System', // Replace with custom font (e.g., Inter_600SemiBold)
};

export const fontSizes = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    display: 32,
};

export const lineHeights = {
    xs: 18,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 30,
    xxl: 36,
    display: 40,
};

export const typography: Record<string, TextStyle> = {
    h1: {
        fontFamily: fontFamilies.bold,
        fontSize: fontSizes.display,
        lineHeight: lineHeights.display,
        fontWeight: '700',
    },
    h2: {
        fontFamily: fontFamilies.bold,
        fontSize: fontSizes.xxl,
        lineHeight: lineHeights.xxl,
        fontWeight: '700',
    },
    h3: {
        fontFamily: fontFamilies.semiBold,
        fontSize: fontSizes.xl,
        lineHeight: lineHeights.xl,
        fontWeight: '600',
    },
    bodyRegular: {
        fontFamily: fontFamilies.regular,
        fontSize: fontSizes.md,
        lineHeight: lineHeights.md,
        fontWeight: '400',
    },
    bodyMedium: {
        fontFamily: fontFamilies.medium,
        fontSize: fontSizes.md,
        lineHeight: lineHeights.md,
        fontWeight: '500',
    },
    label: {
        fontFamily: fontFamilies.medium,
        fontSize: fontSizes.sm,
        lineHeight: lineHeights.sm,
        fontWeight: '500',
    },
    caption: {
        fontFamily: fontFamilies.regular,
        fontSize: fontSizes.xs,
        lineHeight: lineHeights.xs,
        fontWeight: '400',
    },
    button: {
        fontFamily: fontFamilies.semiBold,
        fontSize: fontSizes.md,
        lineHeight: lineHeights.md,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
};
