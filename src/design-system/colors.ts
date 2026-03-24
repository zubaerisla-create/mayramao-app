export const palette = {
    // Brand Colors
    brand: {
        primary: '#0B132B',    // Dark Navy (from Splash/Button)
        secondary: '#00D4FF',  // Cyan
        tertiary: '#635BFF',   // Purple
        accent: '#00E676',     // Green
    },

    // Icon Backgrounds (Pastels from design)
    pastel: {
        green: '#E8F5E9',      // Shield background
        blue: '#E3F2FD',       // Chart background
        orange: '#FFF3E0',     // Smiley background
    },

    // UI Colors
    ui: {
        paginationActive: '#0B132B',
        paginationInactive: '#E0E0E0',
    },

    // Neutral Colors
    neutral: {
        white: '#FFFFFF',
        black: '#000000',
        gray50: '#F9FAFB',
        gray100: '#F3F4F6',
        gray200: '#E5E7EB',
        gray300: '#D1D5DB',
        gray400: '#9CA3AF',
        gray500: '#6B7280',
        gray600: '#4B5563',
        gray700: '#374151',
        gray800: '#1F2937',
        gray900: '#111827',
    },

    // Semantic Colors
    status: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
    },

    // Overlay Colors
    overlay: {
        dark: 'rgba(0, 0, 0, 0.5)',
        light: 'rgba(255, 255, 255, 0.5)',
    }
} as const;

export const theme = {
    light: {
        background: {
            default: palette.neutral.white,
            paper: palette.neutral.gray50,
            subtle: palette.neutral.gray100,
        },
        text: {
            primary: palette.brand.primary, // Dark navy for titles
            secondary: palette.neutral.gray600,
            tertiary: palette.neutral.gray400,
            inverse: palette.neutral.white,
        },
        border: {
            default: palette.neutral.gray200,
            focused: palette.brand.primary,
        },
        action: {
            primary: palette.brand.primary,
            secondary: palette.brand.secondary,
            disabled: palette.neutral.gray300,
        }
    },
    // ... dark mode remains similar but inverted
    dark: {
        background: {
            default: palette.neutral.gray900,
            paper: palette.neutral.gray800,
            subtle: palette.neutral.gray700,
        },
        text: {
            primary: palette.neutral.white,
            secondary: palette.neutral.gray300,
            tertiary: palette.neutral.gray500,
            inverse: palette.neutral.gray900,
        },
        border: {
            default: palette.neutral.gray700,
            focused: palette.brand.secondary,
        },
        action: {
            primary: palette.brand.secondary,
            secondary: palette.brand.primary,
            disabled: palette.neutral.gray600,
        }
    }
};

export type Palette = typeof palette;
export type Theme = typeof theme.light;
