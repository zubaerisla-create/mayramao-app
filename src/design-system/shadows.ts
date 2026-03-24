import { Platform, ViewStyle } from 'react-native';
import { palette } from './colors';

function createShadow(
    elevation: number,
    shadowColor: string,
    shadowOpacity: number,
    shadowRadius: number,
    shadowOffset: { width: number; height: number }
): ViewStyle {
    return Platform.select({
        ios: {
            shadowColor,
            shadowOffset,
            shadowOpacity,
            shadowRadius,
        },
        android: {
            elevation,
            shadowColor, // Android 9+ supports colored shadows
        },
        default: {
            // Web fallback
            boxShadow: `${shadowOffset.width}px ${shadowOffset.height}px ${shadowRadius}px ${shadowColor}`,
        },
    });
}

export const shadows = {
    none: {
        ...Platform.select({
            ios: { shadowOpacity: 0 },
            android: { elevation: 0 },
            default: { boxShadow: 'none' },
        }),
    },
    sm: createShadow(2, palette.neutral.black, 0.05, 3, { width: 0, height: 1 }),
    md: createShadow(4, palette.neutral.black, 0.1, 6, { width: 0, height: 2 }),
    lg: createShadow(8, palette.neutral.black, 0.15, 12, { width: 0, height: 4 }),
} as const;
