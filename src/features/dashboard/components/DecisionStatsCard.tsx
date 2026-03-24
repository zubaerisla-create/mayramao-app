import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { palette, radius, spacing } from '@/src/design-system';

interface DecisionStatsCardProps {
    type: 'safe' | 'risky';
    percentage: number;
}

export function DecisionStatsCard({ type, percentage }: DecisionStatsCardProps) {
    const isSafe = type === 'safe';
    const color = isSafe ? palette.status.success : palette.status.error;
    const iconName = isSafe ? 'trending-up' : 'alert-circle-outline';
    const label = isSafe ? 'Safe Decisions' : 'Risky Decisions';

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name={iconName} size={20} color={color} />
            </View>
            <View style={styles.content}>
                <ThemedText style={styles.percentage}>{percentage}%</ThemedText>
                <ThemedText style={styles.label}>{label}</ThemedText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: palette.neutral.white,
        padding: spacing.lg,
        borderRadius: radius.md,
        minHeight: 140,
        justifyContent: 'space-between',
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 5,
        borderWidth: 1,
        borderColor: palette.neutral.gray50,
    },
    header: {
        alignSelf: 'flex-start',
        backgroundColor: palette.neutral.gray50,
        padding: 8,
        borderRadius: radius.full,
    },
    content: {
        marginTop: spacing.md,
    },
    percentage: {
        fontSize: 32,
        fontWeight: '800',
        color: palette.neutral.gray900,
        letterSpacing: -1,
    },
    label: {
        fontSize: 12,
        fontWeight: '500',
        color: palette.neutral.gray500,
        marginTop: 4,
    }
});
