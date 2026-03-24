import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/src/components';
import { palette, radius, spacing, typography } from '@/src/design-system';

export default function SubscriptionScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.header}>
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color={palette.neutral.white}
                        style={styles.backButton}
                        onPress={() => router.back()}
                    />
                    <ThemedText style={styles.headerTitle}>Subscription</ThemedText>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Current Plan Status */}
                    <Animated.View entering={FadeInDown.delay(100).duration(500).springify()} style={styles.statusCard}>
                        <View style={styles.statusIconBox}>
                            <Ionicons name="flash" size={24} color="#FF9800" />
                        </View>
                        <View style={styles.statusContent}>
                            <ThemedText style={styles.statusTitle}>Free Plan</ThemedText>
                            <ThemedText style={styles.statusText}>
                                You have <ThemedText style={{ fontWeight: 'bold' }}>3</ThemedText> simulations remaining this month.
                            </ThemedText>
                            <ThemedText style={styles.statusReset}>Resets on the 1st of each month</ThemedText>
                        </View>
                    </Animated.View>

                    {/* Free Plan Card */}
                    <Animated.View entering={FadeInDown.delay(200).duration(500).springify()} style={styles.planCard}>
                        <View style={styles.planHeader}>
                            <ThemedText style={styles.planName}>Free</ThemedText>
                            <View style={styles.priceRow}>
                                <ThemedText style={styles.price}>$0</ThemedText>
                                <ThemedText style={styles.perMonth}>/month</ThemedText>
                            </View>
                            <View style={styles.currentPlanBadge}>
                                <ThemedText style={styles.currentPlanText}>Current Plan</ThemedText>
                            </View>
                        </View>
                        <View style={styles.featuresList}>
                            <FeatureItem text="Up to 5 simulations per month" />
                            <FeatureItem text="Basic financial impact analysis" />
                            <FeatureItem text="Safe/Tight/Risky indicators" />
                            <FeatureItem text="Payment comparison" />
                        </View>
                    </Animated.View>

                    {/* Premium Plan Card */}
                    <Animated.View entering={FadeInDown.delay(300).duration(500).springify()} style={[styles.planCard, styles.premiumCard]}>
                        <View style={styles.premiumHeader}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                                <FontAwesome5
                                    name="crown"
                                    size={20}
                                    color={palette.status.success}
                                    style={{ marginRight: 8 }}
                                />
                                <ThemedText style={styles.planName}>Premium</ThemedText>
                            </View>
                            <View style={styles.priceRow}>
                                <ThemedText style={[styles.price, { color: palette.status.success }]}>$9.99</ThemedText>
                                <ThemedText style={styles.perMonth}>/month</ThemedText>
                            </View>
                        </View>
                        <View style={styles.featuresList}>
                            <FeatureItem text="Unlimited simulations" active />
                            <FeatureItem text="Advanced AI guidance" active />
                            <FeatureItem text="Detailed savings projections" active />
                            <FeatureItem text="Priority support" active />
                            <FeatureItem text="Export simulation reports" active />
                            <FeatureItem text="Custom financial scenarios" active />
                            <FeatureItem text="Multi-device sync" active />
                        </View>

                        <Button
                            label="Upgrade to Premium"
                            onPress={() => router.push('/profile/checkout')}
                            style={styles.upgradeButton}
                        />
                    </Animated.View>

                    {/* Why Go Premium */}
                    <Animated.View entering={FadeInDown.delay(400).duration(500).springify()} style={styles.whyCard}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
                            <Ionicons name="trending-up" size={20} color={palette.status.success} style={{ marginRight: 8 }} />
                            <ThemedText style={styles.whyTitle}>Why Go Premium?</ThemedText>
                        </View>

                        <WhyItem
                            icon="flash-outline"
                            color="#3B82F6"
                            bg="#E3F2FD"
                            title="Unlimited Decisions"
                            desc="Test as many purchases as you want, whenever you want—no limits."
                        />
                        <WhyItem
                            icon="shield-checkmark-outline"
                            color="#8B5CF6"
                            bg="#F3E8FF"
                            title="Advanced Insights"
                            desc="Get deeper analysis and personalized recommendations for every scenario."
                        />
                        <WhyItem
                            icon="diamond-outline"
                            color="#10B981"
                            bg="#D1FAE5"
                            title="Priority Support"
                            desc="Get help faster with priority access to our support team."
                        />
                    </Animated.View>

                    <ThemedText style={styles.guaranteeText}>✨ 30-day money-back guarantee.</ThemedText>
                    <ThemedText style={styles.riskFreeText}>Try Premium risk-free.</ThemedText>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

function FeatureItem({ text, active }: { text: string, active?: boolean }) {
    return (
        <View style={styles.featureRow}>
            <Ionicons name="checkmark" size={16} color={active ? palette.status.success : palette.neutral.gray400} style={{ marginRight: 12 }} />
            <ThemedText style={[styles.featureText, { color: palette.neutral.gray700 }]}>{text}</ThemedText>
        </View>
    );
}

function WhyItem({ icon, color, bg, title, desc }: any) {
    return (
        <View style={styles.whyItem}>
            <View style={[styles.whyIconBox, { backgroundColor: bg }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <View style={styles.whyContent}>
                <ThemedText style={styles.whyItemTitle}>{title}</ThemedText>
                <ThemedText style={styles.whyItemDesc}>{desc}</ThemedText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: palette.brand.primary, // Dark background
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    backButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        width: 40,
        height: 40,
        textAlign: 'center',
        textAlignVertical: 'center',
    },
    headerTitle: {
        ...typography.h3,
        color: palette.neutral.white,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: spacing.md,
        paddingBottom: 40,
        backgroundColor: palette.neutral.gray50, // Light body

        minHeight: '100%',
        paddingTop: spacing.xl,
    },
    statusCard: {
        backgroundColor: '#FFF8E1', // Light Orange/Beige
        borderRadius: radius.md,
        padding: spacing.lg,
        flexDirection: 'row',
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: '#FFE0B2',
    },
    statusIconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFECB3',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    statusContent: {
        flex: 1,
    },
    statusTitle: {
        ...typography.bodyMedium,
        fontWeight: 'bold',
        color: palette.neutral.gray900,
        marginBottom: 4,
    },
    statusText: {
        ...typography.caption,
        color: palette.neutral.gray700,
        marginBottom: 4,
        lineHeight: 18,
    },
    statusReset: {
        fontSize: 10,
        color: palette.neutral.gray500,
    },
    planCard: {
        backgroundColor: palette.neutral.white,
        borderRadius: radius.md,
        padding: spacing.xl,
        marginBottom: spacing.lg,
        shadowColor: palette.neutral.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        alignItems: 'center',
    },
    premiumCard: {
        backgroundColor: '#F0FDF4', // Very light green
        borderWidth: 1,
        borderColor: '#DCFCE7',
    },
    planHeader: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    premiumHeader: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    planName: {
        ...typography.h3,
        fontWeight: 'bold',
        color: palette.brand.primary,
        marginBottom: 4,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: spacing.sm,
    },
    price: {
        fontSize: 32,
        fontWeight: 'bold',
        color: palette.brand.primary,
    },
    perMonth: {
        ...typography.bodyRegular,
        color: palette.neutral.gray500,
        marginLeft: 4,
    },
    currentPlanBadge: {
        backgroundColor: palette.neutral.gray100,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: radius.full,
    },
    currentPlanText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: palette.neutral.gray600,
    },
    featuresList: {
        width: '100%',
        marginBottom: spacing.lg,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    featureText: {
        ...typography.bodySmall,
        flex: 1,
    },
    upgradeButton: {
        backgroundColor: palette.status.success,
        width: '100%',
        shadowColor: palette.status.success,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    whyCard: {
        backgroundColor: palette.neutral.white,
        borderRadius: radius.md,
        padding: spacing.xl,
        marginBottom: spacing.xl,
    },
    whyTitle: {
        ...typography.h3,
        fontWeight: 'bold',
        color: palette.brand.primary,
    },
    whyItem: {
        flexDirection: 'row',
        marginBottom: spacing.lg,
    },
    whyIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    whyContent: {
        flex: 1,
    },
    whyItemTitle: {
        ...typography.bodyMedium,
        fontWeight: 'bold',
        color: palette.brand.primary,
        marginBottom: 2,
    },
    whyItemDesc: {
        ...typography.caption,
        color: palette.neutral.gray500,
        lineHeight: 18,
    },
    guaranteeText: {
        textAlign: 'center',
        ...typography.bodySmall,
        color: palette.neutral.gray700,
        fontWeight: '600',
        marginBottom: 4,
    },
    riskFreeText: {
        textAlign: 'center',
        fontSize: 10,
        color: palette.neutral.gray500,
    }
});
