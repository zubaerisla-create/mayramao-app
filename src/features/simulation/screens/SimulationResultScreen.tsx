import { AppDispatch, RootState } from '@/src/store/store';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg';
import { useDispatch, useSelector } from 'react-redux';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/src/components';
import { palette, radius, spacing, typography } from '@/src/design-system';
import AnimatedStatusCircle from './AnimatedStatusCircle';
import { createSimulation } from '../simulationSlice';

const { width } = Dimensions.get('window');

export default function SimulationResultScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();

    const name = params.name as string || 'Item';
    const amount = parseFloat(params.amount as string) || 0;
    const monthlyPayment = parseFloat(params.monthlyPayment as string) || 0;
    const duration = parseInt(params.duration as string) || 0;
    const interestRate = parseFloat(params.interestRate as string) || 0;
    const paymentMethod = params.paymentMethod as string;

    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.auth.user);
    const profile = useSelector((state: RootState) => state.profile.profile);
    const { simulation: simData, loading, error } = useSelector((state: RootState) => state.simulation);
    const isHistory = params.isHistory === 'true';

    useEffect(() => {
        // Skip calling API if we are viewing a historical simulation
        if (isHistory) return;

        const userId = user?.id || (user as any)?._id;
        if (userId && amount > 0) {
            const simulationPayload = {
                userId: userId
            };
            
            console.log("Calling createSimulation with payload:", simulationPayload);
            dispatch(createSimulation(simulationPayload));
        } else if (!userId) {
            console.error("No user ID found. Please login first.");
        } else if (amount === 0) {
            console.error("Invalid purchase amount.");
        }
    }, [dispatch, user?.id, (user as any)?._id, amount, isHistory]);

    if (error) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ThemedText style={{ color: palette.status.error, marginBottom: 16 }}>Error: {error}</ThemedText>
                <Button label="Try Again" onPress={() => router.back()} />
            </View>
        );
    }

    if (loading || !simData) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={palette.brand.primary} />
                <ThemedText style={{ marginTop: 16 }}>Running Simulation...</ThemedText>
            </View>
        );
    }

    // Extract data from backend response - matching the structure from your Postman example
    const aiResponse = simData.aiResponse;
    const calc = aiResponse?.calculation || {};
    const aiGuidance = aiResponse?.ai_guidance || {};
    
    // Get values from the calculation
    const disposableIncome = Math.abs(calc.baseline_disposable_income || 0);
    const savingsAfterPurchase = calc.savings_after_purchase || profile?.currentSavings || 0;
    const emergencyBuffer = calc.emergency_buffer || 0;
    const monthlyPaymentFromApi = calc.monthly_payment || 
        (isHistory ? simData.requestPayload?.monthlyPayment : monthlyPayment);
    
    // Fallback display values for historical view if not in params
    const displayAmount = isHistory ? (simData.requestPayload?.purchaseAmount || amount) : amount;
    const displayMethod = isHistory ? (simData.requestPayload?.paymentType?.toLowerCase().includes('finance') ? 'finance' : 'full') : paymentMethod;
    const displayDuration = isHistory ? (simData.requestPayload?.loanDuration || duration) : duration;
    
    // Risk Logic mapped to local status type
    let status: 'safe' | 'tight' | 'risky' = 'safe';
    const riskLevel = calc.risk_level || aiGuidance.risk_level;
    
    if (riskLevel === 'RISKY') status = 'risky';
    else if (riskLevel === 'CAUTIOUS' || riskLevel === 'TIGHT') status = 'tight';
    else if (riskLevel === 'SAFE' || riskLevel === 'COMFORTABLE') status = 'safe';

    // Colors & Text
    const statusColor = status === 'safe' ? palette.status.success : status === 'tight' ? palette.status.warning : palette.status.error;
    const statusBg = status === 'safe' ? palette.pastel.green : status === 'tight' ? '#FFF8E1' : '#FFEBEE';
    const statusText = status === 'safe' ? 'Safe' : status === 'tight' ? 'Tight' : 'Risky';
    const statusDesc = aiGuidance.guidance ||
        (status === 'safe'
            ? 'This purchase looks comfortable for your current finances.'
            : status === 'tight'
                ? 'This purchase will reduce your flexibility but is manageable.'
                : 'This purchase may strain your financial stability.');

    const recoveryTime = calc.recovery_months !== undefined ? calc.recovery_months : (displayMethod === 'full'
        ? Math.ceil(displayAmount / (disposableIncome * 0.5))
        : displayDuration);

    // Use savings from profile or from calculation
    const savings = profile?.currentSavings || 17000;

    // Get insights and alternatives from AI guidance
    const keyInsights = aiGuidance.key_insights || [];
    const saferAlternatives = aiGuidance.safer_alternatives || [];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <Ionicons name="arrow-back" size={24} color={palette.neutral.gray900} onPress={() => router.back()} />
                <ThemedText style={styles.headerTitle}>Financial Impact</ThemedText>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Status Indicator */}
                <View style={{ gap: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 10, marginVertical: 10 }}>
                    <Animated.View entering={FadeInDown.delay(100).springify()} style={[styles.statusContainer, { display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}>
                        <AnimatedStatusCircle size={120} color={statusColor} bgColor={statusBg} />
                        <View style={[styles.statusBadge, { borderColor: statusColor, backgroundColor: statusBg }]}>
                            <Ionicons
                                name={status === 'safe' ? 'checkmark-circle' : 'alert-circle'}
                                size={16}
                                color={statusColor}
                                style={{ marginRight: 4 }}
                            />
                            <ThemedText style={[styles.statusText, { color: statusColor }]}>{statusText}</ThemedText>
                        </View>
                    </Animated.View>
                    <Animated.View entering={FadeInDown.delay(200).springify()}>
                        <ThemedText style={[styles.description, { textAlign: 'left', fontSize: 13, lineHeight: 20 }]}>{statusDesc}</ThemedText>
                    </Animated.View>
                </View>

                {/* Metrics */}
                <Animated.View entering={FadeInDown.delay(300).springify()} style={{ flexDirection: 'row', gap: spacing.md, width: '100%' }}>
                    <View style={[styles.card, { flex: 1 }]}>
                        <ThemedText>
                            {displayMethod === 'full' ? 'Total Cost' : 'Monthly Payment'}
                        </ThemedText>
                        <ThemedText style={styles.metricValue}>
                            ${displayMethod === 'full' ? displayAmount.toLocaleString() : (monthlyPaymentFromApi || 0).toFixed(0)}
                        </ThemedText>
                    </View>
                    <View style={[styles.card, { flex: 1 }]}>
                        <ThemedText>Recovery Time</ThemedText>
                        <ThemedText style={styles.metricValue}>{recoveryTime}</ThemedText>
                        <ThemedText style={styles.metricUnit}>months</ThemedText>
                    </View>
                </Animated.View>

                {/* Financial Pressure Bar */}
                <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="flash" size={18} color={palette.brand.accent} />
                        <ThemedText style={styles.sectionTitle}>Financial Pressure</ThemedText>
                    </View>

                    <View style={styles.pressureBarBg}>
                        <Animated.View
                            style={[
                                styles.pressureBarFill,
                                {
                                    width: status === 'safe' ? '25%' : status === 'tight' ? '60%' : '90%',
                                    backgroundColor: statusColor
                                }
                            ]}
                        />
                    </View>
                    <View style={styles.pressureLabels}>
                        <ThemedText style={styles.pressureLabelText}>Low pressure</ThemedText>
                        <ThemedText style={[styles.pressureLabelText, { color: statusColor, fontWeight: 'bold' }]}>
                            {status === 'safe' ? '25%' : status === 'tight' ? '60%' : '90%'}
                        </ThemedText>
                        <ThemedText style={styles.pressureLabelText}>High pressure</ThemedText>
                    </View>
                </Animated.View>

                {/* Savings Projection Chart */}
                <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="trending-up" size={18} color={palette.brand.secondary} />
                        <ThemedText style={styles.sectionTitle}>Savings Projection</ThemedText>
                    </View>

                    <View style={styles.chartContainer}>
                        {(() => {
                            // Chart Logic
                            const chartHeight = 220;
                            const chartWidth = width - 80;
                            const paddingLeft = 35;
                            const paddingBottom = 25;
                            const graphWidth = chartWidth - paddingLeft;
                            const graphHeight = chartHeight - paddingBottom;

                            // Data Generation
                            const monthsToProject = Math.max(displayDuration, 4);
                            const dataWithout: { x: number; y: number }[] = [];
                            const dataWith: { x: number; y: number }[] = [];
                            let maxVal = 0;

                            for (let i = 0; i <= monthsToProject; i++) {
                                // Without Purchase
                                const valWithout = savings + (disposableIncome * i);
                                dataWithout.push({ x: i, y: valWithout });
                                if (valWithout > maxVal) maxVal = valWithout;

                                // With Purchase
                                let valWith = 0;
                                if (displayMethod === 'full') {
                                    // Immediate deduction at month 0
                                    valWith = (savings - displayAmount) + (disposableIncome * i);
                                } else {
                                    // Monthly deduction
                                    valWith = savings + ((disposableIncome - (monthlyPaymentFromApi || 0)) * i);
                                }
                                dataWith.push({ x: i, y: valWith });
                                if (valWith > maxVal) maxVal = valWith;
                            }

                            // Round maxVal nicely
                            const yMax = Math.ceil(maxVal / 2000) * 2000 + 1000;
                            const xMax = monthsToProject;

                            // Scales
                            const getX = (i: number) => paddingLeft + (i / xMax) * graphWidth;
                            const getY = (v: number) => graphHeight - (v / yMax) * graphHeight + 10; // +10 top padding

                            // Paths
                            const pathWithout = dataWithout.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.x)},${getY(p.y)}`).join(' ');
                            const pathWith = dataWith.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.x)},${getY(p.y)}`).join(' ');

                            return (
                                <Svg height={chartHeight} width={chartWidth}>
                                    {/* Grid Lines & Labels */}
                                    {[0, 0.25, 0.5, 0.75, 1].map((t) => {
                                        const val = Math.round(yMax * t);
                                        const y = getY(val);
                                        return (
                                            <G key={`y-${t}`}>
                                                <Line
                                                    x1={paddingLeft}
                                                    y1={y}
                                                    x2={chartWidth}
                                                    y2={y}
                                                    stroke={palette.neutral.gray200}
                                                    strokeDasharray="4 4"
                                                    strokeWidth={1}
                                                />
                                                <SvgText
                                                    x={paddingLeft - 8}
                                                    y={y + 4}
                                                    textAnchor="end"
                                                    fontSize="10"
                                                    fill={palette.neutral.gray500}
                                                >
                                                    {`$${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                                                </SvgText>
                                            </G>
                                        );
                                    })}

                                    {/* X Axis Labels */}
                                    {dataWithout.map((p, i) => {
                                        // Show roughly 5 labels if many months
                                        if (monthsToProject > 6 && i % 2 !== 0) return null;
                                        return (
                                            <SvgText
                                                key={`x-${i}`}
                                                x={getX(p.x)}
                                                y={chartHeight - 5}
                                                textAnchor="middle"
                                                fontSize="10"
                                                fill={palette.neutral.gray500}
                                            >
                                                {i === 0 ? 'Now' : `${i}m`}
                                            </SvgText>
                                        );
                                    })}

                                    {/* Paths */}
                                    <Path
                                        d={pathWithout}
                                        fill="none"
                                        stroke={palette.neutral.gray400}
                                        strokeWidth="2"
                                        strokeDasharray="5 5"
                                    />
                                    <Path
                                        d={pathWith}
                                        fill="none"
                                        stroke={statusColor}
                                        strokeWidth="3"
                                    />

                                    {/* End Dots */}
                                    <Circle
                                        cx={getX(dataWithout[dataWithout.length - 1].x)}
                                        cy={getY(dataWithout[dataWithout.length - 1].y)}
                                        r="3"
                                        fill={palette.neutral.gray400}
                                    />
                                    <Circle
                                        cx={getX(dataWith[dataWith.length - 1].x)}
                                        cy={getY(dataWith[dataWith.length - 1].y)}
                                        r="4"
                                        fill={statusColor}
                                    />
                                </Svg>
                            );
                        })()}
                        <View style={styles.chartLegend}>
                            <View style={styles.legendItem}>
                                <Svg width={24} height={10}>
                                    <Line x1="0" y1="5" x2="24" y2="5" stroke={palette.neutral.gray400} strokeWidth="2" strokeDasharray="5 5" />
                                </Svg>
                                <ThemedText style={[styles.legendText, { marginLeft: 6 }]}>Without purchase</ThemedText>
                            </View>
                            <View style={styles.legendItem}>
                                <Svg width={24} height={10}>
                                    <Line x1="0" y1="5" x2="24" y2="5" stroke={statusColor} strokeWidth="3" />
                                </Svg>
                                <ThemedText style={[styles.legendText, { marginLeft: 6 }]}>With purchase</ThemedText>
                            </View>
                        </View>
                    </View>
                </Animated.View>

                {/* Key Insights Section */}
                {keyInsights.length > 0 && (
                    <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="bulb-outline" size={18} color={palette.brand.secondary} />
                            <ThemedText style={styles.sectionTitle}>Key Insights</ThemedText>
                        </View>
                        {keyInsights.map((insight: any, index: number) => (
                            <View key={index} style={styles.insightItem}>
                                <Ionicons name="checkmark-circle" size={16} color={palette.brand.primary} style={styles.insightIcon} />
                                <View style={styles.insightContent}>
                                    <ThemedText style={styles.insightTitle}>{insight.title}</ThemedText>
                                    <ThemedText style={styles.insightDetail}>{insight.detail}</ThemedText>
                                </View>
                            </View>
                        ))}
                    </Animated.View>
                )}

                {/* Safer Alternatives Section */}
                {saferAlternatives.length > 0 && (
                    <Animated.View entering={FadeInDown.delay(700).springify()} style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="shield-outline" size={18} color={palette.status.warning} />
                            <ThemedText style={styles.sectionTitle}>Safer Alternatives</ThemedText>
                        </View>
                        {saferAlternatives.map((alternative: string, index: number) => (
                            <View key={index} style={styles.alternativeItem}>
                                <Ionicons name="arrow-forward" size={14} color={palette.neutral.gray600} style={styles.alternativeIcon} />
                                <ThemedText style={styles.alternativeText}>{alternative}</ThemedText>
                            </View>
                        ))}
                    </Animated.View>
                )}

            </ScrollView>

            {/* Actions */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
                <View style={styles.actionRow}>
                    <Button
                        label="Guidance"
                        variant="primary"
                        style={{ flex: 1, backgroundColor: palette.brand.primary }}
                        leftIcon={<Ionicons name="bulb-outline" size={20} color="white" />}
                        onPress={() => router.push({ 
                            pathname: '/simulation/guidance', 
                            params: { 
                                guidance: aiGuidance.guidance,
                                insights: JSON.stringify(keyInsights),
                                alternatives: JSON.stringify(saferAlternatives)
                            } 
                        })}
                    />
                    <View style={{ width: spacing.md }} />
                    <Button
                        label="Compare"
                        variant="outline"
                        style={{ flex: 1 }}
                        leftIcon={<Ionicons name="swap-horizontal" size={20} color={palette.neutral.gray700} />}
                        onPress={() => router.push({ pathname: '/simulation/compare', params })}
                    />
                </View>
                <Button
                    label="Save & Return to Home"
                    variant="primary"
                    style={{ marginTop: spacing.md, backgroundColor: palette.neutral.gray900 }}
                    onPress={() => router.dismissAll()}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: palette.neutral.gray50,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    headerTitle: {
        ...typography.h3,
        color: palette.neutral.gray900,
    },
    content: {
        padding: spacing.lg,
        paddingBottom: 220, // Increased space for footer
    },
    statusContainer: {
        gap: 50,
        paddingTop: 20,
        alignItems: 'center',
        marginBottom: spacing.md,
        marginTop: spacing.sm,
    },
    statusCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: -16,
    },
    innerCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 2,
        backgroundColor: palette.neutral.white,
    },
    statusText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    description: {
        textAlign: 'center',
        ...typography.bodyRegular,
        color: palette.neutral.gray600,
        marginBottom: spacing.xl,
        paddingHorizontal: spacing.xl,
    },
    metricsRow: {
        display: "flex",
        flexDirection: 'row',
        borderRadius: radius.lg,
        marginBottom: spacing.xl,
    },
    card: {
        backgroundColor: palette.neutral.white,
        padding: spacing.lg,
        borderRadius: radius.lg,
        marginBottom: spacing.xl,
        width: "100%",
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    metric: {
        alignItems: 'center',
        flex: 1,
    },
    metricLabel: {
        ...typography.caption,
        color: palette.neutral.gray500,
        marginBottom: 4,
    },
    metricValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: palette.neutral.gray900,
    },
    metricUnit: {
        fontSize: 12,
        color: palette.neutral.gray500,
    },
    section: {
        backgroundColor: palette.neutral.white,
        padding: spacing.lg,
        borderRadius: radius.lg,
        marginBottom: spacing.xl,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        ...typography.h4,
        color: palette.neutral.gray900,
        marginLeft: spacing.xs,
    },
    pressureBarBg: {
        height: 8,
        backgroundColor: palette.neutral.gray100,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: spacing.xs,
    },
    pressureBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    pressureLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    pressureLabelText: {
        ...typography.caption,
        color: palette.neutral.gray400,
        fontSize: 10,
    },
    chartContainer: {
        alignItems: 'center',
        marginTop: spacing.md,
    },
    chartLegend: {
        flexDirection: 'row',
        gap: spacing.lg,
        marginTop: spacing.md,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    legendText: {
        ...typography.caption,
        color: palette.neutral.gray600,
        fontSize: 12,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: palette.neutral.white,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: palette.neutral.gray100,
    },
    actionRow: {
        flexDirection: 'row',
    },
    insightItem: {
        flexDirection: 'row',
        marginBottom: spacing.md,
        alignItems: 'flex-start',
    },
    insightIcon: {
        marginRight: spacing.sm,
        marginTop: 2,
    },
    insightContent: {
        flex: 1,
    },
    insightTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: palette.neutral.gray800,
        marginBottom: 4,
    },
    insightDetail: {
        fontSize: 13,
        color: palette.neutral.gray600,
        lineHeight: 18,
    },
    alternativeItem: {
        flexDirection: 'row',
        marginBottom: spacing.sm,
        alignItems: 'center',
    },
    alternativeIcon: {
        marginRight: spacing.sm,
    },
    alternativeText: {
        fontSize: 13,
        color: palette.neutral.gray700,
        flex: 1,
        lineHeight: 18,
    },
});