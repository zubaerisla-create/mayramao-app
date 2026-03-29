import { AppDispatch, RootState } from '@/src/store/store';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { 
    FadeInDown, 
    useSharedValue, 
    withRepeat, 
    withSequence, 
    withTiming, 
    useAnimatedStyle 
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg';
import { useDispatch, useSelector } from 'react-redux';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/src/components';
import { palette, radius, spacing, typography } from '@/src/design-system';
import { createSimulation } from '../simulationSlice';
import AnimatedStatusCircle from './AnimatedStatusCircle';

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

    // Calculate initial disposable income from profile
    const initialDisposable = React.useMemo(() => {
        if (!profile) return 0;
        const income = Number(profile.monthlyIncome) || 0;
        const fixed = (profile.fixedExpenses
            ? Object.values(profile.fixedExpenses).reduce((a: any, b: any) => a + (Number(b) || 0), 0)
            : 0) as number;
        const variable = Number(profile.variableExpenses) || 0;
        const loans = (Number(profile.existingLoans) || Number(profile.totalMonthlyLoanPayments) || 0) as number;
        return income - fixed - variable - loans;
    }, [profile]);

    const [currentDisposable, setCurrentDisposable] = React.useState(initialDisposable);
    const [updatedDisposable, setUpdatedDisposable] = React.useState<number | null>(null);

    useEffect(() => {
        if (profile) {
            setCurrentDisposable(initialDisposable);
        }
    }, [profile, initialDisposable]);

    useEffect(() => {
        // Skip calling API if we are viewing a historical simulation
        if (isHistory) return;

        const userId = user?.id || (user as any)?._id;
        // Only run if we don't have simulation data yet or it's for a different user/amount
        const shouldRun = userId && amount > 0 && (!simData || simData.userId !== userId || simData.requestPayload?.purchaseAmount !== amount);

        if (shouldRun && !loading && !simData) {
            const simulationPayload = {
                userId: userId
            };

            console.log("Calling createSimulation recovery with userId:", userId);
            dispatch(createSimulation(simulationPayload));
        } else if (!userId && !loading) {
            console.error("No user ID found. Please login first.");
        }
    }, [dispatch, user?.id, (user as any)?._id, amount, isHistory, simData, loading]);

    // Extract data from backend response
    const aiResponse = simData?.aiResponse;
    const calc = aiResponse?.calculation || {};
    const aiGuidance = aiResponse?.ai_guidance || {};

    // Get values from the calculation
    const monthlyPaymentFromApi = calc?.monthly_payment ||
        (isHistory ? simData?.requestPayload?.monthlyPayment : monthlyPayment) || 0;

    // Update updatedDisposable when data is received
    useEffect(() => {
        if (simData && !loading) {
            setUpdatedDisposable(currentDisposable - (monthlyPaymentFromApi || 0));
        }
    }, [simData, loading, currentDisposable, monthlyPaymentFromApi]);

    if (error) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
                <Ionicons name="alert-circle-outline" size={48} color={palette.status.error} />
                <ThemedText style={{ color: palette.status.error, marginVertical: 16, textAlign: 'center' }}>
                    Error: {error}
                </ThemedText>
                <Button label="Go Back" onPress={() => router.back()} style={{ width: '100%' }} />
            </View>
        );
    }

    if (loading && !simData) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: palette.neutral.white }]}>
                <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, opacity: 0.05, justifyContent: 'center', alignItems: 'center' }}>
                    <Ionicons name="analytics" size={400} color={palette.brand.primary} />
                </View>
                
                <AnimatedStatusCircle size={160} color={palette.brand.primary} bgColor={palette.brand.primary + '15'} />
                
                <View style={{ marginTop: 60, alignItems: 'center', paddingHorizontal: 40 }}>
                    <Animated.Text 
                        entering={FadeInDown.delay(200).springify()}
                        style={{ fontSize: 24, fontWeight: '800', color: palette.neutral.gray900, marginBottom: 12 }}
                    >
                        Analyzing Results
                    </Animated.Text>
                    
                    <Animated.Text 
                        entering={FadeInDown.delay(400).springify()}
                        style={{ textAlign: 'center', color: palette.neutral.gray500, fontSize: 16, lineHeight: 24, marginBottom: 40 }}
                    >
                        Our AI engine is calculating the long-term impact on your financial health.
                    </Animated.Text>
                    
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        {[0, 1, 2].map((i) => (
                            <LoadingDot key={i} delay={i * 150} />
                        ))}
                    </View>
                </View>

                <View style={{ position: 'absolute', bottom: 60, width: '100%', paddingHorizontal: 40 }}>
                    <ThemedText style={{ textAlign: 'center', color: palette.neutral.gray400, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                        Step 3/3 • Simulation Engine
                    </ThemedText>
                </View>
            </View>
        );
    }

    if (!simData && !loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
                <Ionicons name="alert-circle-outline" size={48} color={palette.status.warning} />
                <ThemedText style={{ marginTop: 16, textAlign: 'center' }}>
                    Unable to load simulation data. Please try again.
                </ThemedText>
                <Button
                    label="Back to Input"
                    onPress={() => router.back()}
                    style={{ marginTop: 24, width: '100%' }}
                />
            </View>
        );
    }

    // Fallback display values for historical view if not in params
    const displayAmount = isHistory ? (simData?.requestPayload?.purchaseAmount || amount) : amount;
    const displayMethod = isHistory ? (simData?.requestPayload?.paymentType?.toLowerCase().includes('finance') ? 'finance' : 'full') : paymentMethod;
    const displayDuration = isHistory ? (simData?.requestPayload?.loanDuration || duration) : duration;

    // Risk Logic mapped to local status type
    let status: 'safe' | 'tight' | 'risky' = 'safe';
    const riskLevel = calc?.risk_level || aiGuidance?.risk_level;

    if (riskLevel === 'RISKY') status = 'risky';
    else if (riskLevel === 'CAUTIOUS' || riskLevel === 'TIGHT') status = 'tight';
    else if (riskLevel === 'SAFE' || riskLevel === 'COMFORTABLE') status = 'safe';

    // Colors & Text
    const statusColor = status === 'safe' ? palette.status.success : status === 'tight' ? palette.status.warning : palette.status.error;
    const disposableIncomeValue = calc?.baseline_disposable_income || currentDisposable || 0;
    const statusBg = status === 'safe' ? palette.pastel.green : status === 'tight' ? '#FFF8E1' : '#FFEBEE';
    const statusText = status === 'safe' ? 'Safe' : status === 'tight' ? 'Tight' : 'Risky';
    const statusDesc = aiGuidance.guidance ||
        (status === 'safe'
            ? 'This purchase looks comfortable for your current finances.'
            : status === 'tight'
                ? 'This purchase will reduce your flexibility but is manageable.'
                : 'This purchase may strain your financial stability.');

    const recoveryTime = calc?.recovery_months !== undefined ? calc.recovery_months : (displayMethod === 'full'
        ? Math.ceil(displayAmount / (disposableIncomeValue * 0.5 || 1))
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
                <Animated.View entering={FadeInDown.delay(300).springify()} style={{ flexDirection: 'column', gap: spacing.md, width: '100%' }}>

                    {/* Monthly Disposable Income Card - Highlighted for UX */}
                    <View style={[styles.card, styles.highlightCard]}>
                        <View style={styles.cardHeaderRow}>
                            <ThemedText style={styles.cardLabel}>Monthly Disposable</ThemedText>
                            {loading && (
                                <View style={styles.calculatingTag}>
                                    <ActivityIndicator size="small" color={palette.brand.primary} style={{ marginRight: 6 }} />
                                    <ThemedText style={styles.calculatingText}>Calculating...</ThemedText>
                                </View>
                            )}
                        </View>
                        <ThemedText style={styles.disposableValue}>
                            ${(updatedDisposable !== null ? updatedDisposable : currentDisposable).toLocaleString()}
                        </ThemedText>
                        <ThemedText style={styles.disposableSubtext}>
                            {updatedDisposable !== null ? 'Projected after purchase' : 'Current available'}
                        </ThemedText>
                    </View>

                    <View style={{ flexDirection: 'row', gap: spacing.md }}>
                        <View style={[styles.card, { flex: 1 }]}>
                            <ThemedText style={styles.cardLabel}>
                                {displayMethod === 'full' ? 'Total Cost' : 'Monthly Payment'}
                            </ThemedText>
                            <ThemedText style={styles.metricValue}>
                                ${displayMethod === 'full' ? displayAmount.toLocaleString() : (monthlyPaymentFromApi || 0).toLocaleString()}
                            </ThemedText>
                        </View>
                        <View style={[styles.card, { flex: 1 }]}>
                            <ThemedText style={styles.cardLabel}>Recovery Time</ThemedText>
                            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                                <ThemedText style={styles.metricValue}>{recoveryTime}</ThemedText>
                                <ThemedText style={styles.metricUnit}> mo</ThemedText>
                            </View>
                        </View>
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
                                const valWithout = savings + (disposableIncomeValue * i);
                                dataWithout.push({ x: i, y: valWithout });
                                if (valWithout > maxVal) maxVal = valWithout;

                                // With Purchase
                                let valWith = 0;
                                if (displayMethod === 'full') {
                                    // Immediate deduction at month 0
                                    valWith = (savings - displayAmount) + (disposableIncomeValue * i);
                                } else {
                                    // Monthly deduction
                                    valWith = savings + ((disposableIncomeValue - (monthlyPaymentFromApi || 0)) * i);
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
                        {Array.isArray(keyInsights) && keyInsights.map((insight: any, index: number) => (
                            <View key={index} style={styles.insightItem}>
                                <Ionicons name="checkmark-circle" size={16} color={palette.brand.primary} style={styles.insightIcon} />
                                <View style={styles.insightContent}>
                                    <ThemedText style={styles.insightTitle}>{insight?.title || 'Insight'}</ThemedText>
                                    <ThemedText style={styles.insightDetail}>{insight?.detail || ''}</ThemedText>
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
                        {Array.isArray(saferAlternatives) && saferAlternatives.map((alternative: string, index: number) => (
                            <View key={index} style={styles.alternativeItem}>
                                <Ionicons name="arrow-forward" size={14} color={palette.neutral.gray600} style={styles.alternativeIcon} />
                                <ThemedText style={styles.alternativeText}>{String(alternative)}</ThemedText>
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
        fontSize: 14,
        color: palette.neutral.gray500,
        fontWeight: '500',
    },
    highlightCard: {
        borderColor: palette.brand.primary,
        borderWidth: 1.5,
        backgroundColor: '#F8FAFC',
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    cardLabel: {
        fontSize: 13,
        color: palette.neutral.gray500,
        fontWeight: '500',
    },
    disposableValue: {
        fontSize: 28,
        fontWeight: '800',
        color: palette.neutral.gray900,
    },
    disposableSubtext: {
        fontSize: 11,
        color: palette.neutral.gray400,
        marginTop: 2,
    },
    calculatingTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: palette.brand.primary + '10',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: radius.sm,
    },
    calculatingText: {
        fontSize: 10,
        fontWeight: '700',
        color: palette.brand.primary,
        textTransform: 'uppercase',
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

function LoadingDot({ delay }: { delay: number }) {
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        const timer = setTimeout(() => {
            opacity.value = withRepeat(
                withSequence(
                    withTiming(1, { duration: 600 }),
                    withTiming(0.3, { duration: 600 })
                ),
                -1,
                true
            );
        }, delay);
        return () => clearTimeout(timer);
    }, [delay, opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: 0.8 + 0.2 * opacity.value }]
    }));

    return (
        <Animated.View 
            style={[
                { width: 10, height: 10, borderRadius: 5, backgroundColor: palette.brand.primary },
                animatedStyle
            ]} 
        />
    );
}