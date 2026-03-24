import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Button, Input } from '@/src/components';
import { palette, radius, spacing } from '@/src/design-system';
import { createProfile } from '@/src/features/profile/profileSlice';
import { AppDispatch, RootState } from '@/src/store/store';
import { FinancialProfile, INITIAL_PROFILE, ProfileStep } from '../financial-profile.types';

const { width } = Dimensions.get('window');

// ─── Helper Components ────────────────────────────────────────────────────────

const SelectableCard = ({
    selected,
    onPress,
    label,
    subLabel
}: {
    selected: boolean;
    onPress: () => void;
    label: string;
    subLabel?: string;
}) => {
    const selectedBorderColor = palette.brand.secondary;
    const borderColor = palette.neutral.gray200;
    const backgroundColor = palette.neutral.white;
    const selectedBackgroundColor = palette.pastel.blue;

    return (
        <TouchableOpacity
            style={[
                styles.selectableCard,
                {
                    borderColor: selected ? selectedBorderColor : borderColor,
                    backgroundColor: selected ? selectedBackgroundColor : backgroundColor,
                }
            ]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={styles.cardContent}>
                <ThemedText style={[styles.selectableLabel, selected && styles.selectableLabelSelected]}>
                    {label}
                </ThemedText>
                {subLabel && (
                    <ThemedText style={styles.selectableSubLabel}>{subLabel}</ThemedText>
                )}
            </View>

            <View style={[
                styles.radioOuter,
                { borderColor: selected ? selectedBorderColor : palette.neutral.gray400 }
            ]}>
                {selected && (
                    <View style={[styles.radioInner, { backgroundColor: selectedBorderColor }]} />
                )}
            </View>
        </TouchableOpacity>
    );
};

const LoanOptionCard = ({
    selected,
    onPress,
    label
}: {
    selected: boolean;
    onPress: () => void;
    label: string;
}) => {
    const activeColor = palette.status.success;
    const activeBg = 'rgba(16, 185, 129, 0.08)';
    const borderColor = palette.neutral.gray200;
    const backgroundColor = palette.neutral.white;

    return (
        <TouchableOpacity
            style={[
                styles.loanCard,
                {
                    borderColor: selected ? activeColor : borderColor,
                    backgroundColor: selected ? activeBg : backgroundColor,
                }
            ]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <ThemedText style={[
                styles.loanLabel,
                selected && { color: activeColor, fontWeight: '700' }
            ]}>
                {label}
            </ThemedText>
        </TouchableOpacity>
    );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function FinancialProfileSetupScreen() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const userId = useSelector((state: RootState) => state.auth.user?.id);
    const { loading } = useSelector((state: RootState) => state.profile);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [profile, setProfile] = useState<FinancialProfile>(INITIAL_PROFILE);

    const backgroundColor = useThemeColor({}, 'background');
    const headerTextColor = useThemeColor({}, 'text');
    const infoBoxBg = useThemeColor({ light: palette.pastel.blue, dark: 'rgba(59, 130, 246, 0.15)' }, 'background');
    const infoBoxText = useThemeColor({ light: palette.brand.primary, dark: palette.brand.secondary }, 'text');

    const steps: { id: ProfileStep; title: string; subtitle?: string; buttonLabel?: string }[] = useMemo(() => {
        const baseSteps = [
            { id: 'income', title: 'Monthly Income', subtitle: 'Your total take-home pay each month' },
            { id: 'fixed_expenses', title: 'Fixed Expenses', subtitle: 'Recurring monthly bills' },
            { id: 'loan_check', title: 'Existing Loans', subtitle: 'Do you have any other loan payments?' },
            { id: 'variable_expenses', title: 'Variable Expenses', subtitle: 'Groceries, dining, entertainment, etc.' },
            { id: 'savings', title: 'Current Savings', subtitle: 'Money you have saved up' },
            { id: 'dependents', title: 'Dependents', subtitle: 'How many person depends on you?' },
            { id: 'household_responsibility', title: 'Household Responsibility Level', subtitle: 'How much of the household costs do you handle?' },
            { id: 'income_stability', title: 'Income Stability', subtitle: 'How stable is your income?' },
            { id: 'risk_tolerance', title: 'Risk Tolerance', subtitle: 'How do you feel about financial risk?' },
        ] as const;

        return baseSteps as unknown as { id: ProfileStep; title: string; subtitle?: string; buttonLabel?: string }[];
    }, []);

    const currentStep = steps[currentStepIndex];

    useEffect(() => {
        if (!currentStep && steps.length > 0) {
            setCurrentStepIndex(0);
        }
    }, [currentStep, steps.length]);

    const progress = useSharedValue(0);

    useEffect(() => {
        if (steps.length > 0) {
            progress.value = withSpring((currentStepIndex + 1) / steps.length, { damping: 20, stiffness: 90 });
        }
    }, [currentStepIndex, steps.length]);

    const animatedProgressStyle = useAnimatedStyle(() => ({
        width: `${progress.value * 100}%`,
    }));

    const handleNext = async () => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            console.log('Profile Completed:', profile);

            if (!userId) {
                console.error("No user ID found in Redux. Please login first.");
                return;
            }

            // Transform the data to match the API expected format from Postman
            const payload = {
                userId: userId,
                monthlyIncome: Number(profile.monthlyIncome) || 0,
                fixedExpenses: {
                    rent: Number(profile.fixedExpenses.rent) || 0,
                    utilities: Number(profile.fixedExpenses.utilities) || 0,
                    subscriptionsInsurance: Number(profile.fixedExpenses.subscriptions) || 0
                },
                existingLoans: profile.hasLoans ? 1 : 0,
                totalMonthlyLoanPayments: Number(profile.loanDetails.totalMonthlyPayment) || 0,
                variableExpenses: Number(profile.variableExpenses) || 0,
                currentSavings: Number(profile.currentSavings) || 0,
                dependents: profile.dependents?.toString() || "0", // API expects string
                householdResponsibilityLevel: mapHouseholdResponsibility(profile.householdResponsibility),
                incomeStability: mapIncomeStability(profile.incomeStability),
                riskTolerance: mapRiskTolerance(profile.riskTolerance)
            };

            console.log('Sending payload:', payload);

            await dispatch(createProfile(payload)).unwrap()
                .then(() => {
                    router.push('/(tabs)');
                })
                .catch((err) => {
                    console.error("Failed to create profile:", err);
                    alert("Failed to save profile. Please try again.");
                });
        }
    };

    // Helper functions to map frontend values to backend expected values
    const mapHouseholdResponsibility = (value: string | null): string => {
        switch (value) {
            case 'all':
                return 'All'; // Changed to match API expectation
            case 'half':
                return 'Half';
            case 'small':
                return 'Small';
            case 'none':
                return 'None';
            default:
                return 'Half';
        }
    };

    const mapIncomeStability = (value: string | null): string => {
        switch (value) {
            case 'very_stable':
                return 'High';
            case 'mostly_stable':
                return 'High';
            case 'sometimes':
                return 'Medium';
            case 'unpredictable':
                return 'Low';
            default:
                return 'Medium';
        }
    };

    const mapRiskTolerance = (value: string | null): string => {
        switch (value) {
            case 'safety':
                return 'Low';
            case 'balanced':
                return 'Medium';
            case 'risky':
                return 'High';
            default:
                return 'Medium';
        }
    };

    const handleBack = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        } else {
            router.back();
        }
    };

    const renderStepContent = () => {
        if (!currentStep) return null;

        switch (currentStep.id) {
            case 'income':
                return (
                    <Input
                        placeholder="$ 5000"
                        keyboardType="numeric"
                        value={profile.monthlyIncome}
                        onChangeText={(t) => setProfile(p => ({ ...p, monthlyIncome: t }))}
                        containerStyle={styles.largeInputContainer}
                        style={styles.largeInput}
                    />
                );

            case 'fixed_expenses':
                const total =
                    (Number(profile.fixedExpenses.rent) || 0) +
                    (Number(profile.fixedExpenses.utilities) || 0) +
                    (Number(profile.fixedExpenses.subscriptions) || 0);
                return (
                    <View style={{ gap: spacing.md }}>
                        <Input label="Rent / Mortgage" placeholder="1500" keyboardType="numeric" value={profile.fixedExpenses.rent} onChangeText={(t) => setProfile(p => ({ ...p, fixedExpenses: { ...p.fixedExpenses, rent: t } }))} />
                        <Input label="Utilities & Internet" placeholder="1500" keyboardType="numeric" value={profile.fixedExpenses.utilities} onChangeText={(t) => setProfile(p => ({ ...p, fixedExpenses: { ...p.fixedExpenses, utilities: t } }))} />
                        <Input label="Subscriptions & Insurance" placeholder="1500" keyboardType="numeric" value={profile.fixedExpenses.subscriptions} onChangeText={(t) => setProfile(p => ({ ...p, fixedExpenses: { ...p.fixedExpenses, subscriptions: t } }))} />
                        <View style={[styles.totalRow, { borderTopColor: palette.neutral.gray200 }]}>
                            <ThemedText style={styles.totalLabel}>Total</ThemedText>
                            <ThemedText style={styles.totalValue}>$ {total}</ThemedText>
                        </View>
                    </View>
                );

            case 'loan_check':
                return (
                    <View>
                        <View style={styles.rowChoices}>
                            <LoanOptionCard
                                label="No"
                                selected={profile.hasLoans === false}
                                onPress={() => setProfile(p => ({ ...p, hasLoans: false }))}
                            />
                            <LoanOptionCard
                                label="Yes"
                                selected={profile.hasLoans === true}
                                onPress={() => setProfile(p => ({ ...p, hasLoans: true }))}
                            />
                        </View>

                        {profile.hasLoans && (
                            <Animated.View
                                entering={FadeInRight.springify().damping(20)}
                                exiting={FadeOutLeft.duration(200)}
                                style={{ marginTop: spacing.xl }}
                            >
                                <ThemedText style={{ fontSize: 14, color: palette.neutral.gray700, marginBottom: spacing.sm, fontWeight: '500' }}>
                                    Total Monthly Loan Payments
                                </ThemedText>
                                <Input
                                    placeholder="300"
                                    keyboardType="numeric"
                                    value={profile.loanDetails.totalMonthlyPayment}
                                    onChangeText={(t) => setProfile(p => ({ ...p, loanDetails: { totalMonthlyPayment: t } }))}
                                    containerStyle={styles.largeInputContainer}
                                    style={styles.largeInput}
                                />
                            </Animated.View>
                        )}
                    </View>
                );

            case 'variable_expenses':
                return (
                    <Input
                        placeholder="$ 1000"
                        keyboardType="numeric"
                        value={profile.variableExpenses}
                        onChangeText={(t) => setProfile(p => ({ ...p, variableExpenses: t }))}
                        containerStyle={styles.largeInputContainer}
                        style={styles.largeInput}
                    />
                );

            case 'savings':
                return (
                    <Input
                        placeholder="$ 5000"
                        keyboardType="numeric"
                        value={profile.currentSavings}
                        onChangeText={(t) => setProfile(p => ({ ...p, currentSavings: t }))}
                        containerStyle={styles.largeInputContainer}
                        style={styles.largeInput}
                    />
                );

            case 'dependents':
                return (
                    <View style={{ gap: spacing.md }}>
                        {[0, 1, 2, 3, 4, 5].map((val, idx) => {
                            const isSelected = profile.dependents === val;
                            const label = val === 0 ? '0' : val.toString();
                            return (
                                <SelectableCard
                                    key={idx}
                                    label={label}
                                    selected={isSelected}
                                    onPress={() => setProfile(p => ({ ...p, dependents: val }))}
                                />
                            );
                        })}
                    </View>
                );

            case 'household_responsibility':
                return (
                    <View style={{ gap: spacing.md }}>
                        {[
                            { value: 'all', label: 'All or most of it' },
                            { value: 'half', label: 'About half' },
                            { value: 'small', label: 'A small part' },
                            { value: 'none', label: 'Not applicable' },
                        ].map((opt, idx) => (
                            <SelectableCard
                                key={idx}
                                label={opt.label}
                                selected={profile.householdResponsibility === opt.value}
                                onPress={() => setProfile(p => ({ ...p, householdResponsibility: opt.value as any }))}
                            />
                        ))}
                    </View>
                );

            case 'income_stability':
                return (
                    <View style={{ gap: spacing.md }}>
                        {[
                            { value: 'very_stable', label: 'Very stable' },
                            { value: 'mostly_stable', label: 'Mostly stable' },
                            { value: 'sometimes', label: 'Sometimes changes' },
                            { value: 'unpredictable', label: 'Unpredictable' },
                        ].map((opt, idx) => (
                            <SelectableCard
                                key={idx}
                                label={opt.label}
                                selected={profile.incomeStability === opt.value}
                                onPress={() => setProfile(p => ({ ...p, incomeStability: opt.value as any }))}
                            />
                        ))}
                    </View>
                );

            case 'risk_tolerance':
                return (
                    <View style={{ gap: spacing.md }}>
                        {[
                            { value: 'safety', label: 'I prefer safety' },
                            { value: 'balanced', label: 'Balanced' },
                            { value: 'risky', label: "I'm okay with risk" },
                        ].map((opt, idx) => (
                            <SelectableCard
                                key={idx}
                                label={opt.label}
                                selected={profile.riskTolerance === opt.value}
                                onPress={() => setProfile(p => ({ ...p, riskTolerance: opt.value as any }))}
                            />
                        ))}
                    </View>
                );

            default:
                return null;
        }
    };

    if (!currentStep) {
        return <View style={styles.container} />;
    }

    return (
        <ThemedView style={styles.container}>
            <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
                {/* ── Header ── */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Ionicons name="arrow-back" size={24} color={headerTextColor} />
                    </TouchableOpacity>

                    <View style={styles.headerProgressContainer}>
                        <ThemedText style={styles.stepIndicator}>
                            {currentStepIndex + 1} of {steps.length}
                        </ThemedText>
                    </View>

                    {currentStep.id === 'dependents' ? (
                        <TouchableOpacity onPress={handleNext}>
                            <ThemedText type="link" style={{ fontSize: 14 }}>Skip</ThemedText>
                        </TouchableOpacity>
                    ) : (
                        <View style={{ width: 40 }} />
                    )}
                </View>

                {/* ── Progress Bar ── */}
                <View style={styles.progressBarBg}>
                    <Animated.View style={[styles.progressBarFill, animatedProgressStyle]} />
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
                >
                    <ScrollView
                        contentContainerStyle={styles.content}
                        showsVerticalScrollIndicator={false}
                    >
                        <Animated.View
                            key={currentStep.id}
                            entering={FadeInRight.springify().damping(20).mass(0.8)}
                            exiting={FadeOutLeft.duration(150)}
                            style={styles.stepContainer}
                        >
                            <ThemedText type="title" style={styles.stepTitle}>
                                {currentStep.title}
                            </ThemedText>
                            {currentStep.subtitle && (
                                <ThemedText style={styles.stepSubtitle}>
                                    {currentStep.subtitle}
                                </ThemedText>
                            )}

                            <View style={styles.formContainer}>
                                {renderStepContent()}
                            </View>

                            {currentStep.id !== 'dependents' && (
                                <View style={[styles.infoBox, { backgroundColor: infoBoxBg }]}>
                                    <ThemedText style={[styles.infoText, { color: infoBoxText }]}>
                                        Don't worry about being exact. You can update this anytime in your profile.
                                    </ThemedText>
                                </View>
                            )}
                        </Animated.View>
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* ── Footer ── */}
                <View style={[styles.footer, { backgroundColor, borderTopColor: palette.neutral.gray100 }]}>
                    <Button
                        label={loading ? 'Saving...' : (currentStepIndex === steps.length - 1 ? 'Complete Setup' : 'Continue')}
                        onPress={handleNext}
                        disabled={loading}
                        style={styles.mainButton}
                        size="lg"
                        rightIcon={
                            loading ? undefined :
                                currentStepIndex === steps.length - 1
                                    ? <Ionicons name="checkmark" size={18} color="white" />
                                    : <Ionicons name="chevron-forward" size={18} color="white" />
                        }
                    />
                </View>
            </SafeAreaView>
        </ThemedView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        height: 50,
    },
    headerProgressContainer: {},
    stepIndicator: {
        fontSize: 14,
        fontWeight: '500',
        opacity: 0.6,
    },
    progressBarBg: {
        height: 4,
        backgroundColor: palette.neutral.gray200,
        marginHorizontal: spacing.lg,
        borderRadius: radius.full,
        overflow: 'hidden',
        marginTop: spacing.xs,
        marginBottom: spacing.xl,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: palette.status.success,
        borderRadius: radius.full,
    },
    content: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xxxl,
        flexGrow: 1,
    },
    stepContainer: { width: '100%' },
    stepTitle: {
        fontSize: 28,
        marginBottom: spacing.xs,
        textAlign: 'left',
    },
    stepSubtitle: {
        fontSize: 16,
        color: palette.neutral.gray500,
        marginBottom: spacing.xl,
        textAlign: 'left',
        lineHeight: 22,
    },
    formContainer: { marginBottom: spacing.lg },
    largeInputContainer: { marginBottom: 0 },
    largeInput: { height: 60, fontSize: 18 },
    infoBox: {
        padding: spacing.md,
        borderRadius: radius.lg,
        marginTop: spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoText: {
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 18,
        fontWeight: '500',
    },
    footer: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
        borderTopWidth: 1,
    },
    mainButton: {
        backgroundColor: palette.brand.primary,
        borderRadius: radius.xl,
    },
    rowChoices: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    selectableCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
        borderRadius: radius.lg,
        borderWidth: 1.5,
        minHeight: 60,
    },
    cardContent: { flex: 1 },
    selectableLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    selectableLabelSelected: { fontWeight: '700' },
    selectableSubLabel: {
        fontSize: 12,
        opacity: 0.6,
        marginTop: 2,
    },
    radioOuter: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    loanCard: {
        flex: 1,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: radius.lg,
        borderWidth: 1.5,
    },
    loanLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    totalValue: {
        fontSize: 20,
        fontWeight: '700',
        color: palette.brand.primary,
    },
});