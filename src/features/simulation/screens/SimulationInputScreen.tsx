import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button, Input } from '@/src/components';
import { palette, radius, spacing, typography } from '@/src/design-system';
import { updateProfile } from '@/src/features/profile/profileSlice';
import { AppDispatch, RootState } from '@/src/store/store';
import { Ionicons } from '@expo/vector-icons';
import { SimulationLimitModal } from '@/src/components';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';

export default function SimulationInputScreen() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { loading } = useSelector((state: RootState) => state.profile);
    const { history } = useSelector((state: RootState) => state.simulation);
    const userId = useSelector((state: RootState) => state.auth.user?.id || (state.auth.user as any)?._id);
    const insets = useSafeAreaInsets();
    
    // Limit state
    const [showLimitModal, setShowLimitModal] = useState(false);
    const simulationCount = history?.length || 0;
    const MAX_SIMULATIONS = 5;
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'full' | 'finance'>('finance');

    // Loan Config
    const [duration, setDuration] = useState(12); // months
    const [interestRate, setInterestRate] = useState(5); // %

    // Calculations
    const principal = parseFloat(amount.replace(/[^0-9.]/g, '')) || 0;

    // Simple amortization
    // M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1 ]
    // i = monthly interest rate
    // n = number of months
    const calculateMonthly = () => {
        if (principal === 0) return 0;
        if (paymentMethod === 'full') return 0;

        const i = (interestRate / 100) / 12;
        if (i === 0) return principal / duration;

        const n = duration;
        const monthly = principal * ((i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1));
        return monthly;
    }

    const monthlyPayment = calculateMonthly();

    const handleRunSimulation = async () => {
        if (simulationCount >= MAX_SIMULATIONS) {
            setShowLimitModal(true);
            return;
        }

        const simPayload = {
            userId: userId, // Added userId to payload
            purchaseAmount: principal,
            paymentType: paymentMethod === 'finance' ? 'Financing' : 'PayInFull',
            loanDuration: paymentMethod === 'finance' ? duration : 0,
            interestRate: paymentMethod === 'finance' ? interestRate : 0
        };

        try {
            await dispatch(updateProfile({ purchaseSimulation: simPayload })).unwrap();
            // Pass data to results
            router.push({
                pathname: '/simulation/result',
                params: {
                    name,
                    amount: principal,
                    paymentMethod,
                    duration: paymentMethod === 'finance' ? duration : 0,
                    interestRate: paymentMethod === 'finance' ? interestRate : 0,
                    monthlyPayment: monthlyPayment.toFixed(2),
                }
            });
        } catch (e: any) {
            console.error("Failed to update simulation profile:", e);
            alert("Failed to save simulation settings. Please try again.");
        }
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <Ionicons name="arrow-back" size={24} color={palette.neutral.gray900} onPress={() => router.back()} />
                <ThemedText style={styles.headerTitle}>Purchase Simulation</ThemedText>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                <Input
                    label="What are you buying?"
                    placeholder="e.g. MacBook Air"
                    value={name}
                    onChangeText={setName}
                    containerStyle={styles.input}
                />

                <Input
                    label="Purchase Amount"
                    placeholder="$0.00"
                    keyboardType="numeric"
                    leftIcon={<ThemedText style={styles.currency}>$</ThemedText>}
                    value={amount}
                    onChangeText={setAmount}
                    containerStyle={styles.input}
                />

                <ThemedText style={styles.sectionLabel}>Payment Method</ThemedText>
                <View style={styles.toggleContainer}>
                    <ToggleOption
                        label="Pay in Full"
                        selected={paymentMethod === 'full'}
                        onPress={() => setPaymentMethod('full')}
                        icon="wallet-outline"
                    />
                    <ToggleOption
                        label="Financing"
                        selected={paymentMethod === 'finance'}
                        onPress={() => setPaymentMethod('finance')}
                        icon="card-outline"
                    />
                </View>

                {/* Financing Options - Conditional */}
                {paymentMethod === 'finance' && (
                    <Animated.View entering={FadeInDown.springify()} style={styles.financingConfig}>
                        <View style={styles.sliderRow}>
                            <View style={styles.sliderHeader}>
                                <ThemedText style={styles.sliderLabel}>Loan Duration</ThemedText>
                                <ThemedText style={styles.sliderValue}>{duration} months</ThemedText>
                            </View>
                            <Slider
                                style={{ width: '100%', height: 40 }}
                                minimumValue={3}
                                maximumValue={60}
                                step={1}
                                value={duration}
                                onValueChange={setDuration}
                                minimumTrackTintColor={palette.brand.primary}
                                maximumTrackTintColor={palette.neutral.gray200}
                                thumbTintColor={palette.brand.primary}
                            />
                        </View>

                        <View style={styles.sliderRow}>
                            <View style={styles.sliderHeader}>
                                <ThemedText style={styles.sliderLabel}>Interest Rate</ThemedText>
                                <ThemedText style={styles.sliderValue}>{interestRate}%</ThemedText>
                            </View>
                            <Slider
                                style={{ width: '100%', height: 40 }}
                                minimumValue={0}
                                maximumValue={30}
                                step={0.5}
                                value={interestRate}
                                onValueChange={setInterestRate}
                                minimumTrackTintColor={palette.brand.primary}
                                maximumTrackTintColor={palette.neutral.gray200}
                                thumbTintColor={palette.brand.primary}
                            />
                        </View>

                        <View style={styles.monthlyPreview}>
                            <ThemedText style={styles.monthlyLabel}>Est. Monthly Payment</ThemedText>
                            <ThemedText style={styles.monthlyValue}>${monthlyPayment.toFixed(2)}<ThemedText style={styles.unit}>/mo</ThemedText></ThemedText>
                        </View>
                    </Animated.View>
                )}

            </ScrollView>

            <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
                <Button
                    label={loading ? "Saving config..." : (simulationCount >= MAX_SIMULATIONS ? "Limit Reached" : "Run Simulation")}
                    onPress={handleRunSimulation}
                    disabled={loading || principal === 0}
                    style={simulationCount >= MAX_SIMULATIONS ? styles.buttonDisabled : undefined}
                />
            </View>

            <SimulationLimitModal
                visible={showLimitModal}
                onClose={() => setShowLimitModal(false)}
                onSubscribe={() => {
                    setShowLimitModal(false);
                    router.push('/profile/subscription' as any);
                }}
            />
        </View>
    );
}

function ToggleOption({ label, selected, onPress, icon }: any) {
    return (
        <View style={[styles.toggleOption, selected && styles.toggleOptionSelected]}>
            <Ionicons
                name={icon}
                size={24}
                color={selected ? palette.brand.primary : palette.neutral.gray400}
                style={{ marginBottom: 8 }}
            />
            <ThemedText style={[styles.toggleLabel, selected && styles.toggleLabelSelected]}>
                {label}
            </ThemedText>
            {/* Overlay press handler */}
            <ThemedText onPress={onPress} style={StyleSheet.absoluteFillObject} />
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
    },
    input: {
        marginBottom: spacing.lg,
    },
    currency: {
        ...typography.bodyRegular,
        color: palette.neutral.gray400,
        marginRight: spacing.xs,
    },
    sectionLabel: {
        ...typography.h4,
        color: palette.neutral.gray900,
        marginBottom: spacing.md,
    },
    toggleContainer: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    toggleOption: {
        flex: 1,
        backgroundColor: palette.neutral.white,
        borderRadius: radius.lg,
        padding: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    toggleOptionSelected: {
        borderColor: palette.brand.primary,
        backgroundColor: '#EEF2FF', // Light brand tint
    },
    toggleLabel: {
        ...typography.bodyMedium,
        color: palette.neutral.gray500,
        fontWeight: '600',
    },
    toggleLabelSelected: {
        color: palette.brand.primary,
    },
    financingConfig: {
        backgroundColor: palette.neutral.white,
        borderRadius: radius.lg,
        padding: spacing.lg,
        marginBottom: spacing.lg,
    },
    sliderRow: {
        marginBottom: spacing.lg,
    },
    sliderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    sliderLabel: {
        ...typography.bodySmall,
        color: palette.neutral.gray600,
    },
    sliderValue: {
        ...typography.bodySmall,
        fontWeight: 'bold',
        color: palette.brand.primary,
    },
    monthlyPreview: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.sm,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: palette.neutral.gray100,
    },
    monthlyLabel: {
        ...typography.bodyRegular,
        color: palette.neutral.gray600,
    },
    monthlyValue: {
        ...typography.h3,
        color: palette.neutral.gray900,
    },
    unit: {
        fontSize: 14,
        color: palette.neutral.gray500,
        fontWeight: 'normal',
    },
    footer: {
        padding: spacing.lg,
        backgroundColor: palette.neutral.white,
        borderTopWidth: 1,
        borderTopColor: palette.neutral.gray100,
    },
    buttonDisabled: {
        backgroundColor: palette.neutral.gray800,
    }
});
