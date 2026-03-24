import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { palette, spacing, typography } from '@/src/design-system';

interface HistoryHeaderProps {
    totalSimulations: number;
}

export function HistoryHeader({ totalSimulations }: HistoryHeaderProps) {
    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']}>
                <View style={styles.content}>
                    <ThemedText style={styles.title}>History</ThemedText>
                    <ThemedText style={styles.subtitle}>{totalSimulations} simulations total</ThemedText>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: palette.brand.primary,
        paddingBottom: spacing.xl,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    content: {
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.md,
    },
    title: {
        ...typography.h1,
        color: palette.neutral.white,
        marginBottom: spacing.xs,
    },
    subtitle: {
        ...typography.bodyRegular,
        color: 'rgba(255,255,255,0.7)',
    }
});
