import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { palette, radius, spacing, typography } from '@/src/design-system';

interface FinancialOverviewCardProps {
    disposableIncome: number;
    savings: number;
    fixedExpenses: number;
}

export function FinancialOverviewCard({ disposableIncome, savings, fixedExpenses }: FinancialOverviewCardProps) {
    return (
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.container}>
            <View style={styles.cardContent}>
                {/* Decorative Background Element */}
                <View style={styles.decorativeCircle} />
                <View style={styles.decorativeCircle2} />

                <View style={styles.mainSection}>
                    <ThemedText style={styles.label}>Monthly Disposable</ThemedText>
                    <ThemedText style={styles.mainValue}>
                        ${disposableIncome.toLocaleString()}
                    </ThemedText>
                </View>

                <View style={styles.row}>
                    <View style={styles.statBox}>
                        <ThemedText style={styles.smallLabel}>Savings</ThemedText>
                        <ThemedText style={styles.smallValue}>${savings.toLocaleString()}</ThemedText>
                    </View>

                    <View style={styles.statBox}>
                        <ThemedText style={styles.smallLabel}>Fixed Costs</ThemedText>
                        <ThemedText style={styles.smallValue}>${fixedExpenses.toLocaleString()}</ThemedText>
                    </View>
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: spacing.lg,
        marginVertical: spacing.md,
        borderRadius: radius.xl, // 24
        overflow: 'hidden',
        backgroundColor: '#0F172A', // Dark Navy
        // Shadow
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    cardContent: {
        padding: spacing.xl,
        minHeight: 220,
        justifyContent: 'space-between',
        position: 'relative',
    },
    decorativeCircle: {
        position: 'absolute',
        top: -40,
        right: -40,
        width: 150,
        height: 150,
        borderRadius: 90,
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
    },
    decorativeCircle2: {
        position: 'absolute',
        bottom: -60,
        left: -50,
        width: 120,
        height: 120,
        borderRadius: 80,
        backgroundColor: 'rgb(34, 121, 48)',
    },
    mainSection: {
        marginBottom: spacing.lg,
    },
    label: {
        ...typography.bodySmall,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: spacing.xs,
    },
    mainValue: {
        fontSize: 30,
        fontWeight: '700',
        color: palette.neutral.white,
        letterSpacing: -1,
    },
    row: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    statBox: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.14)', // Glassmorphism
        borderRadius: radius.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.26)',
    },
    smallLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 4,
    },
    smallValue: {
        fontSize: 18,
        fontWeight: '600',
        color: palette.neutral.white,
    }
});
