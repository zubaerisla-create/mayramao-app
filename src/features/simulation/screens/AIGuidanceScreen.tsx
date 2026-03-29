import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button, Card } from '@/src/components';
import { palette, radius, shadows, spacing, typography } from '@/src/design-system';
import { RootState } from '@/src/store/store';
import { useSelector } from 'react-redux';

export default function AIGuidanceScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();

    const { simulation: simData, history } = useSelector((state: RootState) => state.simulation);
    const currentSim = simData || history?.[0];

    const amount = parseFloat(params.amount as string) || 0;
    const displayAmount = currentSim?.requestPayload?.purchaseAmount || amount;
        
    // Fallback to local logic if no backend data
    let fallbackStatus: 'safe' | 'tight' | 'risky' = 'safe';
    const paymentMethod = params.paymentMethod as string;
    const monthlyPayment = parseFloat(params.monthlyPayment as string) || 0;
    if (paymentMethod === 'full') {
        if (amount > 5400) fallbackStatus = 'risky';
        else if (amount > 2700) fallbackStatus = 'tight';
    } else {
        const ratio = monthlyPayment / 1250;
        if (ratio > 0.3) fallbackStatus = 'risky';
        else if (ratio > 0.1) fallbackStatus = 'tight';
    }

    // Combine backend and fallback config
    const aiGuidance = currentSim?.aiResponse?.ai_guidance;
    const riskLevel = aiGuidance?.risk_level || fallbackStatus.toUpperCase();

    let themeColor: string = palette.status.success;
    let iconBg: string = palette.pastel.green;
    let mainIcon: string = 'bulb-outline';
    let emoji: string = '✨';

    if (riskLevel === 'RISKY') {
        themeColor = palette.status.error;
        iconBg = '#FFEBEE';
        mainIcon = 'alert-circle-outline';
        emoji = '🚨';
    } else if (riskLevel === 'TIGHT' || riskLevel === 'CAUTIOUS') {
        themeColor = palette.status.warning;
        iconBg = '#FFF8E1';
        mainIcon = 'warning-outline';
        emoji = '⚠️';
    }

    // Default hardcoded content just in case API fails
    const fallbackText = "This purchase looks manageable based on your current financial situation, though the exact AI guidance is unavailable.";

    const fallbackInsights: any[] = [
        {
            title: "Quick Assessment",
            desc: "Based on local data, your disposable income will comfortably cover this purchase.",
            icon: "trending-up-outline",
            iconColor: themeColor,
            iconBg: iconBg
        }
    ];

    // Map backend insights or use fallback
    const insights = aiGuidance?.key_insights?.map((insight: any) => ({
        title: insight.title,
        desc: insight.detail,
        icon: riskLevel === 'SAFE' ? 'trending-up-outline' : riskLevel === 'RISKY' ? 'alert-circle-outline' : 'trending-down-outline',
        iconColor: themeColor,
        iconBg: iconBg
    })) || fallbackInsights;

    const alternatives: string[] = aiGuidance?.safer_alternatives || [
        "Consider setting aside the amount first, then purchasing",
        "Look for seasonal sales or discounts to save even more"
    ];

    const content = {
        title: aiGuidance?.assessment_title || "Financial Assessment",
        icon: mainIcon,
        color: themeColor,
        emoji: emoji,
        text: aiGuidance?.guidance || fallbackText,
        insights,
        alternatives
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Dark Header */}
            <View style={styles.header}>
                <View style={styles.navRow}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={palette.neutral.white} />
                    </TouchableOpacity>
                    <ThemedText style={styles.headerTitle}>AI Guidance</ThemedText>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.headerContent}>
                    <View style={[styles.iconBox, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                        <Ionicons name={content.icon as any} size={24} color={content.color} />
                    </View>
                    <View style={{ marginLeft: spacing.md, flex: 1 }}>
                        <ThemedText style={styles.statusTitle}>
                            {content.title} {content.emoji}
                        </ThemedText>
                        <ThemedText style={styles.purchaseLabel}>Purchase: ${displayAmount.toLocaleString()}</ThemedText>
                    </View>
                </View>
            </View>

            {/* Scrollable White Content */}
            <View style={styles.contentContainer}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Main Description Card */}
                    <Card variant="elevated" style={styles.contextCard}>
                        <ThemedText style={styles.contextText}>{content.text}</ThemedText>
                        {/* <ThemedText style={styles.contextText}>{content.text}</ThemedText> */}
                    </Card>

                    {/* Key Insights */}
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>Key Insights</ThemedText>
                        {content.insights.map((insight: any, index: number) => (
                            <Animated.View
                                key={index}
                                entering={FadeInDown.delay(100 + index * 100).springify()}
                                style={styles.insightCard}
                            >
                                <View style={[styles.insightIcon, { backgroundColor: insight.iconBg }]}>
                                    <Ionicons name={insight.icon as any} size={24} color={insight.iconColor} />
                                </View>
                                <View style={styles.insightContent}>
                                    <ThemedText style={styles.insightTitle}>{insight.title}</ThemedText>
                                    <ThemedText style={styles.insightDesc}>{insight.desc}</ThemedText>
                                </View>
                            </Animated.View>
                        ))}
                    </View>

                    {/* Safer Alternatives */}
                    <View style={[styles.section, styles.alternativesSection]}>
                        <View style={styles.altHeader}>
                            <Ionicons name="bulb-outline" size={20} color={palette.brand.tertiary} />
                            <ThemedText style={styles.altTitle}>Safer Alternatives</ThemedText>
                        </View>
                        <View style={styles.altList}>
                            {content.alternatives.map((alt: string, index: number) => (
                                <View key={index} style={styles.altItem}>
                                    <View style={styles.bullet} />
                                    <ThemedText style={styles.altText}>{alt}</ThemedText>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>

                {/* Fixed Footer Button */}
                <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.sm }]}>
                    <Button
                        label="Back to Results"
                        onPress={() => router.back()}
                        style={styles.actionButton}
                        textStyle={styles.actionButtonText}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: palette.brand.primary, // Dark Navy
    },
    header: {

        backgroundColor: palette.brand.primary,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xxl + 20, // Extra padding for overlap
    },
    navRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
        marginTop: spacing.sm,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    headerTitle: {
        ...typography.bodyLarge,
        fontSize: 18,
        fontWeight: '700',
        color: palette.neutral.white,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: radius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: palette.neutral.white,
        marginBottom: 4,
    },
    purchaseLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
    },
    contentContainer: {
        flex: 1,
        backgroundColor: palette.neutral.gray50,
        // borderTopLeftRadius: 30,
        // borderTopRightRadius: 30,
        overflow: 'hidden',
        marginTop: -30,
    },
    scrollContent: {
        backgroundColor: palette.neutral.gray50,
        padding: spacing.lg,
        paddingTop: spacing.xl,
    },
    contextCard: {
        marginBottom: spacing.xl,
        padding: spacing.lg,
        borderRadius: radius.md,
        backgroundColor: palette.neutral.white,
        ...shadows.sm,
    },
    contextText: {
        ...typography.bodyRegular,
        color: palette.neutral.gray700,
        lineHeight: 24,
        fontSize: 15,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: palette.neutral.gray900,
        marginBottom: spacing.md,
    },
    insightCard: {
        flexDirection: 'row',
        backgroundColor: palette.neutral.white,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: palette.neutral.gray100,
        ...shadows.sm,
    },
    insightIcon: {
        width: 48,
        height: 48,
        borderRadius: radius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    insightContent: {
        flex: 1,
        justifyContent: 'center',
    },
    insightTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: palette.neutral.gray900,
        marginBottom: 4,
    },
    insightDesc: {
        fontSize: 12,
        color: palette.neutral.gray600,
        lineHeight: 18,
    },
    alternativesSection: {
        backgroundColor: palette.neutral.white,
        borderRadius: radius.md,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: palette.neutral.gray100,
        ...shadows.sm,
    },
    altHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    altTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: palette.neutral.gray900,
        marginLeft: spacing.sm,
    },
    altList: {
        gap: spacing.sm,
    },
    altItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    bullet: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: palette.status.success, // Adjust bullet color as needed
        marginTop: 8,
        marginRight: spacing.sm,
    },
    altText: {
        fontSize: 13,
        color: palette.neutral.gray700,
        flex: 1,
        lineHeight: 20,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: palette.neutral.white,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: palette.neutral.gray100,
    },
    actionButton: {
        backgroundColor: palette.brand.primary,
        borderRadius: radius.md,
        height: 56,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: palette.neutral.white,
    }
});
