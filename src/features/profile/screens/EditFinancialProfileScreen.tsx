import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import { ThemedText } from '@/components/themed-text';
import { Button, Input } from '@/src/components';
import { palette, radius, spacing, typography } from '@/src/design-system';
import { updateProfile } from '@/src/features/profile/profileSlice';
import { AppDispatch, RootState } from '@/src/store/store';

export default function EditFinancialProfileScreen() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { profile, loading } = useSelector((state: RootState) => state.profile);
    const userId = useSelector((state: RootState) => state.auth.user?.id || (state.auth.user as any)?._id);

    const [form, setForm] = useState({
        income: profile?.monthlyIncome?.toString() || '',
        fixedExpenses: profile?.fixedExpenses
            ? (profile.fixedExpenses && typeof profile.fixedExpenses === 'object'
                ? ((Number(profile.fixedExpenses.rent) || 0) +
                    (Number(profile.fixedExpenses.utilities) || 0) +
                    (Number(profile.fixedExpenses.subscriptionsInsurance) || 0)).toString()
                : profile.fixedExpenses.toString())
            : '',
        existingLoans: profile?.existingLoans?.toString() || '',
        variableExpenses: profile?.variableExpenses?.toString() || '',
        savings: profile?.currentSavings?.toString() || '',
    });

    const handleChange = (key: string, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        const payload = {
            userId: userId, // Added userId to payload
            monthlyIncome: Number(form.income) || 0,
            fixedExpenses: {
                rent: 0,
                utilities: Number(form.fixedExpenses) || 0, // Put the total in utilities to maintain structure
                subscriptionsInsurance: 0
            },
            existingLoans: Number(form.existingLoans) || 0,
            variableExpenses: Number(form.variableExpenses) || 0,
            currentSavings: Number(form.savings) || 0,
        };

        try {
            await dispatch(updateProfile(payload)).unwrap();
            router.back();
        } catch (error) {
            console.error('Failed to update financial profile:', error);
            alert('Failed to update financial profile. Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.header}>
                    <Ionicons name="arrow-back" size={24} style={{ backgroundColor: '#e9e9e981', width: 30, height: 30, borderRadius: 40, paddingTop: 3, paddingLeft: 2 }} color={palette.neutral.white} onPress={() => router.back()} />
                </View>

                <View style={styles.headerContent}>
                    <Animated.View entering={FadeInDown.delay(100).duration(500).springify()}>
                        <ThemedText style={styles.title}>Edit Financial Profile</ThemedText>
                        <ThemedText style={styles.subtitle}>Update your baseline data</ThemedText>
                    </Animated.View>
                </View>

                <Animated.View entering={FadeInDown.delay(200).duration(500).springify()} style={styles.cardContainer}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={{ flex: 1 }}
                    >
                        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                            <View style={styles.card}>

                                <LabeledInput
                                    label="Monthly Income"
                                    icon="cash-outline"
                                    iconColor={palette.status.success}
                                    value={form.income}
                                    onChangeText={(text: string) => handleChange('income', text)}
                                />

                                <LabeledInput
                                    label="Fixed Expenses"
                                    icon="home-outline"
                                    iconColor={palette.brand.primary}
                                    value={form.fixedExpenses}
                                    onChangeText={(text: string) => handleChange('fixedExpenses', text)}
                                />

                                <LabeledInput
                                    label="Existing Loans"
                                    icon="card-outline"
                                    iconColor={palette.brand.tertiary}
                                    value={form.existingLoans}
                                    onChangeText={(text: string) => handleChange('existingLoans', text)}
                                />

                                <LabeledInput
                                    label="Variable Expenses"
                                    icon="cart-outline"
                                    iconColor={palette.status.warning}
                                    value={form.variableExpenses}
                                    onChangeText={(text: string) => handleChange('variableExpenses', text)}
                                />

                                <LabeledInput
                                    label="Current Savings"
                                    icon="wallet-outline"
                                    iconColor="#E91E63"
                                    value={form.savings}
                                    onChangeText={(text: string) => handleChange('savings', text)}
                                />

                                <View style={styles.buttonGroup}>
                                    <Button
                                        label={loading ? "Saving..." : "Save Changes"}
                                        onPress={handleSave}
                                        disabled={loading}
                                        style={styles.saveButton}
                                    />
                                    <Button
                                        label="Cancel"
                                        variant="outline"
                                        onPress={() => router.back()}
                                        disabled={loading}
                                        style={styles.cancelButton}
                                    />
                                </View>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </Animated.View>
            </SafeAreaView>
        </View>
    );
}

function LabeledInput({ label, icon, iconColor, value, onChangeText }: any) {
    return (
        <View style={styles.inputWrapper}>
            <View style={styles.labelRow}>
                <Ionicons name={icon} size={18} color={iconColor} style={{ marginRight: spacing.xs }} />
                <ThemedText style={styles.label}>{label}</ThemedText>
            </View>
            <Input
                value={value}
                onChangeText={onChangeText}
                keyboardType="numeric"
                containerStyle={styles.noMargin}
                style={styles.input}
            />
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
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing.sm,
    },
    headerContent: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.lg,
    },
    title: {
        ...typography.h2,
        color: palette.neutral.white,
        marginBottom: spacing.xs,
    },
    subtitle: {
        ...typography.bodyRegular,
        color: palette.neutral.gray400,
    },
    cardContainer: {
        flex: 1,
        backgroundColor: palette.neutral.gray50, // Light background for body area
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
    },
    scrollContent: {
        padding: spacing.md,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: palette.neutral.white,
        borderRadius: radius.lg,
        padding: spacing.lg,
        paddingBottom: spacing.xl,
        shadowColor: palette.neutral.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    inputWrapper: {
        marginBottom: spacing.lg,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
        marginLeft: spacing.xs,
    },
    label: {
        ...typography.label,
        color: palette.neutral.gray900,
        fontWeight: 'bold',
        fontSize: 12,
    },
    noMargin: {
        marginBottom: 0,
    },
    input: {
        fontSize: 16,
        fontWeight: '500',
    },
    buttonGroup: {
        marginTop: spacing.md,
        gap: spacing.md,
    },
    saveButton: {
        backgroundColor: palette.status.success,
        borderColor: palette.status.success,
    },
    cancelButton: {
        borderColor: palette.neutral.gray200,
        backgroundColor: palette.neutral.white,
    }
});
