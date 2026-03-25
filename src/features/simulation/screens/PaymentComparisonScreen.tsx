import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/src/components';
import { palette, radius, shadows, spacing, typography } from '@/src/design-system';
import { useAppSelector } from '@/src/store/hooks';

export default function PaymentComparisonScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();

    const { simulation, history } = useAppSelector(state => state.simulation);
    const profile = useAppSelector(state => state.profile.profile);
    
    // Find the latest simulation if current state is null
    const currentSim = simulation || history?.[0];
    const aiResponse = currentSim?.aiResponse;
    const calc = aiResponse?.calculation || {};
    const comparisons = calc.comparisons || {};

    // Recovering parameters from history/redux if possible for consistency
    const displayAmount = currentSim?.requestPayload?.purchaseAmount || parseFloat(params.amount as string) || 0;
    const displayMonthly = currentSim?.requestPayload?.monthlyPayment || parseFloat(params.monthlyPayment as string) || 0;
    const displayDuration = currentSim?.requestPayload?.loanDuration || parseInt(params.duration as string) || 0;

    const totalLoanCost = displayMonthly * displayDuration;
    
    // Recovery Calc logic
    const disposableIncome = Math.abs(calc?.baseline_disposable_income || 0);
    const fullRecovery = calc?.comparisons?.pay_in_full?.recovery_months || Math.ceil(displayAmount / (disposableIncome * 0.5 || 1));
    const financingRecovery = calc?.monthly_payment ? (calc?.recovery_months || displayDuration) : 0; 

    // Risk levels from AI (with fallbacks)
    const payInFullRisk = calc?.comparisons?.pay_in_full?.risk_level || (displayAmount > 1000 ? 'Tight' : 'Safe');
    const financingRisk = calc?.comparisons?.financing?.risk_level || 'Safe';

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={palette.neutral.gray900} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Payment Comparison</ThemedText>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <ThemedText style={styles.subtitle}>Comparing purchase of</ThemedText>
                    <ThemedText style={styles.heroAmount}>${displayAmount.toLocaleString()}</ThemedText>
                </View>

                {/* Summary Cards Row */}
                <View style={styles.summaryRow}>
                    {/* Pay in Full Card */}
                    <View style={styles.summaryCard}>
                        <ThemedText style={styles.cardTitle}>Pay in Full</ThemedText>
                        <View style={[styles.badge, payInFullRisk.toUpperCase() === 'SAFE' ? styles.badgeSafe : styles.badgeTight]}>
                            <Ionicons 
                                name={payInFullRisk.toUpperCase() === 'SAFE' ? "checkmark-circle-outline" : "alert-circle-outline"} 
                                size={12} 
                                color={payInFullRisk.toUpperCase() === 'SAFE' ? palette.status.success : palette.status.warning} 
                                style={{ marginRight: 4 }} 
                            />
                            <Text style={payInFullRisk.toUpperCase() === 'SAFE' ? styles.badgeTextSafe : styles.badgeTextTight}>{payInFullRisk}</Text>
                        </View>
                        <ThemedText style={styles.cardSubtitle}>Immediate impact</ThemedText>
                    </View>
 
                    {/* Loan Card */}
                    <View style={styles.summaryCard}>
                        <ThemedText style={styles.cardTitle}>{displayDuration}-Month Loan</ThemedText>
                        <View style={[styles.badge, financingRisk.toUpperCase() === 'SAFE' ? styles.badgeSafe : styles.badgeTight]}>
                            <Ionicons 
                                name={financingRisk.toUpperCase() === 'SAFE' ? "checkmark-circle-outline" : "alert-circle-outline"} 
                                size={12} 
                                color={financingRisk.toUpperCase() === 'SAFE' ? palette.status.success : palette.status.warning} 
                                style={{ marginRight: 4 }} 
                            />
                            <Text style={financingRisk.toUpperCase() === 'SAFE' ? styles.badgeTextSafe : styles.badgeTextTight}>{financingRisk}</Text>
                        </View>
                        <ThemedText style={styles.cardSubtitle}>Monthly payments</ThemedText>
                    </View>
                </View>

                {/* Comparison Table */}
                <View style={styles.comparisonTable}>
                    {/* Table Header Wrapper */}
                    <View style={styles.tableHeaderRow}>
                        <View style={styles.colLabel} />
                        <View style={styles.colData}>
                            <ThemedText style={styles.colHeaderTitle}>Pay in Full</ThemedText>
                        </View>
                        <View style={styles.colData}>
                            <ThemedText style={styles.colHeaderTitle}>Financing</ThemedText>
                        </View>
                    </View>

                    {/* Risk Row */}
                    <View style={[styles.row, styles.borderBottom]}>
                        <View style={styles.colLabel}>
                            <ThemedText style={styles.rowLabel}>Risk Level</ThemedText>
                        </View>
                        <View style={styles.colData}>
                            <View style={[styles.badge, styles.badgeTight, { marginBottom: 0 }]}>
                                <Text style={styles.badgeTextTight}>{payInFullRisk}</Text>
                            </View>
                        </View>
                        <View style={styles.colData}>
                            <View style={[styles.badge, styles.badgeSafe, { marginBottom: 0 }]}>
                                <Text style={styles.badgeTextSafe}>{financingRisk}</Text>
                            </View>
                        </View>
                    </View>

                    <ComparisonRow
                        label="Monthly Payment"
                        val1="$0"
                        val2={`$${(calc?.monthly_payment || displayMonthly || 0).toLocaleString()}`}
                        highlight1={true}
                        val1Color={palette.status.success}
                        val2Color={palette.neutral.gray900}
                    />

                    <ComparisonRow
                        label="Recovery Time"
                        val1={`${fullRecovery}mo`}
                        val2={`${financingRecovery}mo`}
                        val1Color={fullRecovery > 6 ? palette.status.warning : palette.status.success}
                        val2Color={palette.neutral.gray900}
                    />

                    <ComparisonRow
                        label="Total Cost"
                        val1={`$${displayAmount.toLocaleString()}`}
                        val2={`$${totalLoanCost.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`}
                        val1Color={palette.status.success}
                        val2Color={palette.neutral.gray900}
                    />

                    <ComparisonRow
                        label="Flexibility"
                        val1="Better"
                        val2="Lower"
                        val1Color={palette.status.success}
                        val2Color={palette.neutral.gray600}
                        last
                    />
                </View>

                {/* Recommendation */}
                <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.recommendationBox}>
                    <View style={styles.recHeader}>
                        <Ionicons name="bulb-outline" size={20} color="#8F8F8F" />
                        <ThemedText style={styles.recTitle}>Our Recommendation</ThemedText>
                    </View>
                    <ThemedText style={styles.recText}>
                        <ThemedText style={styles.recTextBold}>Consider financing</ThemedText> to maintain better monthly flexibility.
                        While you'll pay interest, it keeps your financial stability intact.
                    </ThemedText>
                </Animated.View>

            </ScrollView>

            {/* Footer Buttons */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.sm }]}>
                <Button
                    label="Explore Financing Options"
                    onPress={() => { }}
                    style={styles.primaryButton}
                    textStyle={styles.primaryButtonText}
                />
                <Button
                    label="Back to Results"
                    variant="ghost"
                    onPress={() => router.back()}
                    style={styles.secondaryButton}
                    textStyle={styles.secondaryButtonText}
                />
            </View>
        </View>
    );
}

function ComparisonRow({ label, val1, val2, val1Color, val2Color, last }: any) {
    return (
        <View style={[styles.row, !last && styles.borderBottom]}>
            <View style={styles.colLabel}>
                <ThemedText style={styles.rowLabel}>{label}</ThemedText>
            </View>
            <View style={styles.colData}>
                <ThemedText style={[styles.rowData, { color: val1Color || palette.neutral.gray900 }]}>{val1}</ThemedText>
            </View>
            <View style={styles.colData}>
                <ThemedText style={[styles.rowData, { color: val2Color || palette.neutral.gray900 }]}>{val2}</ThemedText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: palette.neutral.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        boxShadow: '10px 10px 10px #faf8f8ff',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: 30,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: palette.neutral.white,
        ...shadows.sm,
        borderWidth: 1,
        borderColor: palette.neutral.gray100,
    },
    headerTitle: {
        ...typography.h3,
        fontSize: 18,
        color: palette.neutral.gray900,
        fontWeight: '700',
    },
    content: {
        paddingHorizontal: spacing.lg,
        paddingBottom: 40,
        alignItems: 'center',
    },
    heroSection: {
        alignItems: 'center',
        marginVertical: spacing.lg,
    },
    subtitle: {
        ...typography.bodyRegular,
        color: palette.neutral.gray500,
        marginBottom: spacing.xs,
    },
    heroAmount: {
        fontSize: 30,
        fontWeight: '800',
        color: palette.brand.primary,
        letterSpacing: -0.5,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: spacing.lg,
        gap: spacing.md,
    },
    summaryCard: {

        flex: 1,
        backgroundColor: palette.neutral.white,
        borderRadius: radius.md,
        padding: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: palette.neutral.gray100,
        ...shadows.sm, // Using soft shadow
    },
    cardTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: palette.neutral.gray600,
        marginBottom: spacing.xs,
    },
    cardSubtitle: {
        fontSize: 11,
        color: palette.neutral.gray400,
        marginTop: spacing.xs,
        textAlign: 'center',
    },
    comparisonTable: {
        width: '100%',
        backgroundColor: palette.neutral.white,
        borderRadius: radius.md,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: palette.neutral.gray100,
        marginBottom: spacing.lg,
        ...shadows.sm,
    },
    tableHeaderRow: {
        flexDirection: 'row',
        marginBottom: spacing.sm,
        paddingBottom: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: palette.neutral.gray100,
    },
    colHeaderTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: palette.neutral.gray700,
    },
    row: {
        flexDirection: 'row',
        paddingVertical: spacing.md,
        alignItems: 'center',
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: palette.neutral.gray50,
    },
    colLabel: {
        flex: 1.2,
        justifyContent: 'center',
    },
    colData: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rowLabel: {
        fontSize: 14,
        color: palette.neutral.gray500,
        fontWeight: '400',
    },
    rowData: {
        fontSize: 14,
        fontWeight: '700',
    },

    // Badges
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 2,
    },
    badgeSafe: {
        backgroundColor: palette.pastel.green, // Light green
    },
    badgeTight: {
        backgroundColor: '#FFF8E1', // Light Orange
    },
    badgeTextSafe: {
        fontSize: 12,
        fontWeight: '700',
        color: palette.status.success,
    },
    badgeTextTight: {
        fontSize: 12,
        fontWeight: '700',
        color: palette.status.warning,
    },

    // Recommendation
    recommendationBox: {
        backgroundColor: '#16fa2915',
        borderRadius: radius.md,
        padding: spacing.lg,
        width: '100%',
        borderWidth: 1,
        borderColor: '#039708fa', // Slightly darker green border
    },
    recHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    recTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: palette.neutral.gray900,
        marginLeft: spacing.xs,
    },
    recText: {
        fontSize: 14,
        color: palette.neutral.gray700,
        lineHeight: 20,
    },
    recTextBold: {
        fontWeight: '700',
        color: palette.neutral.gray900,
    },

    // Footer
    footer: {
        paddingHorizontal: spacing.lg,
        backgroundColor: palette.neutral.white,
    },
    primaryButton: {
        backgroundColor: palette.brand.primary,
        borderRadius: radius.lg,
        height: 56,
        marginBottom: spacing.sm,
    },
    primaryButtonText: {
        fontWeight: '600',
        fontSize: 16,
    },
    secondaryButton: {
        backgroundColor: palette.neutral.white,
        borderWidth: 1,
        borderColor: palette.neutral.gray200,
        borderRadius: radius.lg,
        height: 56,
    },
    secondaryButtonText: {
        color: palette.neutral.gray600,
        fontWeight: '600',
        fontSize: 16,
    }
});
