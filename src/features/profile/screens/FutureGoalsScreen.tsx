import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import { ThemedText } from '@/components/themed-text';
import { Button, Input } from '@/src/components';
import { palette, radius, spacing, typography } from '@/src/design-system';
import { updateProfile } from '@/src/features/profile/profileSlice';
import { AppDispatch, RootState } from '@/src/store/store';

export default function FutureGoalsScreen() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { profile, loading } = useSelector((state: RootState) => state.profile);
    const [viewMode, setViewMode] = useState<'list' | 'add'>('list');

    const hasGoal = !!profile?.planName;
    const goals = hasGoal ? [{
        planName: profile.planName,
        targetAmount: profile.targetAmount,
        targetDate: profile.targetDate,
        description: profile.goalDescription,
        monthly: profile.monthly || 0,
    }] : [];

    const handleSaveGoal = async (newGoal: any) => {
        // The API expects these fields at the root of the profile
        const payload = {
            planName: newGoal.name,
            targetAmount: Number(newGoal.amount) || 0,
            targetDate: newGoal.date, // Make sure date format matches backend expectations (e.g. ISO stream) if necessary
            goalDescription: newGoal.description, // Mapped to goalDescription
        };

        try {
            await dispatch(updateProfile(payload)).unwrap();
            setViewMode('list');
        } catch (error) {
            console.error('Failed to add goal:', error);
            alert('Failed to add goal. Please try again.');
        }
    };

    // Mock adding a goal for demonstration if helpful, or keep empty to show empty state
    // To demonstrate 'List' state, we can add a toggle or just use a state.
    // Let's toggle between Add and List.

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.header}>
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color={palette.neutral.white}
                        style={styles.backButton}
                        onPress={() => {
                            if (viewMode === 'add') setViewMode('list');
                            else router.back();
                        }}
                    />
                </View>

                <View style={styles.headerContent}>
                    <Animated.View entering={FadeInDown.delay(100).duration(500).springify()}>
                        <ThemedText style={styles.title}>
                            {viewMode === 'add' ? 'Add Goal' : 'Future Goals'}
                        </ThemedText>
                        {viewMode === 'list' && (
                            <ThemedText style={styles.subtitle}>
                                Add upcoming plans so Finova can protect them during financial analysis.
                            </ThemedText>
                        )}
                    </Animated.View>
                </View>

                <Animated.View entering={FadeInDown.delay(200).duration(500).springify()} style={styles.cardContainer}>
                    {viewMode === 'list' ? (
                        <GoalsList
                            goals={goals}
                            onAddPress={() => setViewMode('add')}
                            onAddMock={() => handleSaveGoal({ name: 'Summer Vacation', amount: 5000, date: '2026-04-01T00:00:00.000Z', current: 500, monthly: 250 })}
                        />
                    ) : (
                        <AddGoalForm
                            initialGoal={goals[0]}
                            onSave={handleSaveGoal}
                            loading={loading}
                        />
                    )}
                </Animated.View>
            </SafeAreaView>
        </View>
    );
}

function GoalsList({ goals, onAddPress, onAddMock }: any) {
    if (goals.length === 0) {
        return (
            <View style={styles.emptyStateContainer}>
                <Animated.View entering={ZoomIn.delay(300).springify()} style={styles.iconContainer}>
                    <View style={styles.circleOuter}>
                        <View style={styles.circleInner}>
                            <Ionicons name="radio-button-on" size={32} color={palette.neutral.gray400} />
                        </View>
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(400).duration(500).springify()}>
                    <ThemedText style={styles.emptyTitle}>No goals yet</ThemedText>
                    <ThemedText style={styles.emptyDescription}>
                        Create a goal to help Finova plan around your future expenses.
                    </ThemedText>

                    {/* Hidden debug button to populate list for review */}
                    <TouchableOpacity onPress={onAddMock} style={{ height: 20, width: 20, alignSelf: 'center', marginTop: 10 }} />
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(500).duration(500).springify()} style={{ width: '100%', paddingHorizontal: spacing.xl, marginTop: spacing.xl }}>
                    <Button
                        label="Add Goal"
                        onPress={onAddPress}
                        style={styles.addButton}
                    />
                </Animated.View>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.scrollContent}>
            {goals.map((goal: any, index: number) => (
                <View key={index} style={styles.goalCard}>
                    <View style={styles.goalHeader}>
                        <ThemedText style={styles.goalName}>{goal.planName || goal.name}</ThemedText>
                        <Ionicons name="ellipsis-vertical" size={20} color={palette.neutral.gray500} />
                    </View>
                    <ThemedText style={styles.goalAmount}>${(goal.targetAmount || goal.amount || 0).toLocaleString()}</ThemedText>
                    <View style={styles.goalDateRow}>
                        <Ionicons name="calendar-outline" size={14} color={palette.neutral.gray500} />
                        <ThemedText style={styles.goalDate}>Due: {goal.targetDate || goal.date}</ThemedText>
                    </View>
                    {goal.description ? <ThemedText style={styles.goalDesc}>{goal.description}</ThemedText> : null}

                    <View style={styles.statusBox}>
                        <ThemedText style={styles.statusLabel}>Required monthly saving</ThemedText>
                        <ThemedText style={styles.statusValue}>${goal.monthly || 0}</ThemedText>
                    </View>
                </View>
            ))}
            <Button
                label="Edit Goal"
                variant="outline"
                onPress={onAddPress}
                style={styles.addAnotherButton}
            />
        </ScrollView>
    );
}

function AddGoalForm({ initialGoal, onSave, loading }: any) {
    const [form, setForm] = useState({
        name: initialGoal?.planName || '',
        amount: initialGoal?.targetAmount?.toString() || '',
        date: initialGoal?.targetDate || '',
        description: initialGoal?.description || '',
    });

    const handleChange = (key: string, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                    <LabeledInput
                        label="Plan Name"
                        placeholder="e.g. Summer Vacation"
                        value={form.name}
                        onChangeText={(text: string) => handleChange('name', text)}
                    />
                    <LabeledInput
                        label="Target Amount"
                        placeholder="$ 5,000"
                        value={form.amount}
                        onChangeText={(text: string) => handleChange('amount', text)}
                        keyboardType="numeric"
                        leftIcon={<ThemedText style={{ marginRight: 8, fontWeight: 'bold' }}>$</ThemedText>}
                    />
                    <LabeledInput
                        label="Target Date"
                        placeholder="yyyy-mm-dd"
                        value={form.date}
                        onChangeText={(text: string) => handleChange('date', text)}
                        rightIcon={<Ionicons name="calendar-outline" size={20} color={palette.neutral.gray500} />}
                    />
                    <LabeledInput
                        label="Short Description (Optional)"
                        placeholder="Add a small note (optional)"
                        value={form.description}
                        onChangeText={(text: string) => handleChange('description', text)}
                        multiline
                        style={{ height: 80, paddingTop: 12, textAlignVertical: 'top' }}
                    />

                    <Button
                        label={loading ? "Saving..." : "Save Goal"}
                        onPress={() => onSave({ ...form, monthly: 250 })} // Mock calc
                        style={styles.saveGoalButton}
                        disabled={loading}
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

function LabeledInput({ label, value, onChangeText, placeholder, keyboardType, rightIcon, leftIcon, multiline, style }: any) {
    return (
        <View style={styles.inputWrapper}>
            <ThemedText style={styles.label}>{label}</ThemedText>
            <Input
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                keyboardType={keyboardType}
                containerStyle={styles.noMargin}
                style={[styles.input, style]}
                rightIcon={rightIcon}
            // leftIcon={leftIcon} // Input component might need adjustment for text leftIcon, simplistic for now
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: palette.brand.primary,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        // justifyContent: 'center',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing.sm,
    },
    backButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        width: 32,
        height: 32,
        textAlign: 'center',
        textAlignVertical: 'center',

    },
    headerContent: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.lg,
        minHeight: 80, // Reservation for title/subtitle transition
    },
    title: {
        ...typography.h2,
        color: palette.neutral.white,
        marginBottom: spacing.xs,
    },
    subtitle: {
        ...typography.bodyRegular,
        color: palette.neutral.gray400,
        lineHeight: 20,
    },
    cardContainer: {
        flex: 1,
        backgroundColor: palette.neutral.gray50,
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
    emptyStateContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 80,
    },
    iconContainer: {
        marginBottom: spacing.lg,
    },
    circleOuter: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: palette.neutral.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    circleInner: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: palette.neutral.gray100,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: palette.neutral.gray200,
    },
    emptyTitle: {
        ...typography.h3,
        color: palette.neutral.gray900,
        marginBottom: spacing.xs,
        textAlign: 'center',
    },
    emptyDescription: {
        ...typography.bodyRegular,
        color: palette.neutral.gray500,
        textAlign: 'center',
        paddingHorizontal: spacing.xl,
        lineHeight: 20,
    },
    addButton: {
        backgroundColor: palette.status.success,
        width: '100%',
    },
    inputWrapper: {
        marginBottom: spacing.lg,
    },
    label: {
        ...typography.label,
        color: palette.neutral.gray900,
        marginBottom: spacing.xs,
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
    saveGoalButton: {
        backgroundColor: palette.status.success,
        marginTop: spacing.md,
    },
    // Goal Card Styles
    goalCard: {
        backgroundColor: palette.neutral.white,
        borderRadius: radius.lg,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        shadowColor: palette.neutral.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    goalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    goalName: {
        ...typography.h3,
        fontSize: 18,
    },
    goalAmount: {
        ...typography.h1,
        fontSize: 28,
        marginBottom: spacing.xs,
    },
    goalDateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
        gap: 4,
    },
    goalDate: {
        ...typography.caption,
        color: palette.neutral.gray500,
    },
    goalDesc: {
        ...typography.bodySmall,
        color: palette.neutral.gray500,
        marginBottom: spacing.lg,
    },
    statusBox: {
        backgroundColor: '#E3F2FD', // Light blue bg
        padding: spacing.md,
        borderRadius: radius.md,
    },
    statusLabel: {
        ...typography.caption,
        color: palette.brand.primary,
        marginBottom: 4,
        fontWeight: '600',
    },
    statusValue: {
        ...typography.h3,
        fontSize: 20,
        color: palette.brand.primary,
    },
    addAnotherButton: {
        marginTop: spacing.xs,
        borderColor: palette.neutral.gray300,
    }
});
