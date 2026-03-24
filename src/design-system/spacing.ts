export const spacing = {
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48,

    // Layout specific
    gutter: 16, // Standard horizontal padding for screens
    stack: 12,  // Standard vertical spacing between elements
} as const;

export type Spacing = typeof spacing;
