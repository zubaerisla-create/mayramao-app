import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/src/components';
import { palette, radius, spacing, typography } from '@/src/design-system';
import { updatePreferences } from '@/src/features/profile/profileSlice';
import { AppDispatch, RootState } from '@/src/store/store';

export default function PersonalPreferencesScreen() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { profile, loading } = useSelector((state: RootState) => state.profile);
    const userId = useSelector((state: RootState) => state.auth.user?.id || (state.auth.user as any)?._id);

    // ─── Mapping Helpers ───────────────────────────────────────────────────────
    const mapHouseholdFromEnum = (val: string) => {
        switch (val) {
            case 'All': return 'All of it';
            case 'Half': return 'About half';
            case 'Small': return 'Most of it';
            case 'None': return 'Some of it';
            default: return 'About half';
        }
    };
    const mapHouseholdToEnum = (val: string) => {
        switch (val) {
            case 'All of it': return 'All';
            case 'About half': return 'Half';
            case 'Most of it': return 'Small';
            case 'Some of it': return 'None';
            default: return 'Half';
        }
    };

    const mapStabilityFromEnum = (val: string) => {
        switch (val) {
            case 'High': return 'Very Stable';
            case 'Medium': return 'Somewhat Stable';
            case 'Low': return 'Unstable';
            default: return 'Somewhat Stable';
        }
    };
    const mapStabilityToEnum = (val: string) => {
        switch (val) {
            case 'Very Stable': return 'High';
            case 'Somewhat Stable': return 'Medium';
            case 'Unstable': return 'Low';
            case 'Variable': return 'Low';
            default: return 'Medium';
        }
    };

    const mapRiskFromEnum = (val: string) => {
        switch (val) {
            case 'High': return 'I’m okay with risk';
            case 'Medium': return 'balanced';
            case 'Low': return 'I prefer safety';
            default: return 'balanced';
        }
    };
    const mapRiskToEnum = (val: string) => {
        switch (val) {
            case 'I’m okay with risk': return 'High';
            case 'balanced': return 'Medium';
            case 'I prefer safety': return 'Low';
            default: return 'Medium';
        }
    };

    const formatDependents = () => {
        if (Array.isArray(profile?.dependents) && profile.dependents.length > 0) {
            const val = profile.dependents[0];
            if (parseInt(val) >= 3) return '3+';
            return val.toString();
        }
        return 'N/A';
    };

    const [form, setForm] = useState({
        dependents: formatDependents(),
        householdCosts: mapHouseholdFromEnum(profile?.householdResponsibilityLevel || 'Half'),
        incomeStability: mapStabilityFromEnum(profile?.incomeStability || 'Medium'),
        financialRisk: mapRiskFromEnum(profile?.riskTolerance || 'Medium'),
    });

    const [modalVisible, setModalVisible] = useState(false);
    const [currentField, setCurrentField] = useState<string | null>(null);
    const [options, setOptions] = useState<string[]>([]);

    const openSelector = (field: string, fieldOptions: string[]) => {
        setCurrentField(field);
        setOptions(fieldOptions);
        setModalVisible(true);
    };

    const handleSelect = (value: string) => {
        if (currentField) {
            setForm(prev => ({ ...prev, [currentField]: value }));
        }
        setModalVisible(false);
    };

    const handleSave = async () => {
        const payload = {
            userId: userId, // Added userId to payload
            dependents: form.dependents === 'N/A' ? ["0"] : [form.dependents === '3+' ? "3" : form.dependents],
            householdResponsibilityLevel: mapHouseholdToEnum(form.householdCosts),
            incomeStability: mapStabilityToEnum(form.incomeStability),
            riskTolerance: mapRiskToEnum(form.financialRisk),
        };

        try {
            await dispatch(updatePreferences(payload)).unwrap();
            router.back();
        } catch (error) {
            console.error('Failed to update preferences:', error);
            alert('Failed to update preferences. Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.header}>
                    <Ionicons name="arrow-back" size={24} style={styles.design} color={palette.neutral.white} onPress={() => router.back()} />
                </View>

                <View style={styles.headerContent}>
                    <Animated.View entering={FadeInDown.delay(100).duration(500).springify()}>
                        <ThemedText style={styles.title}>Personal Preferences</ThemedText>
                        <ThemedText style={styles.subtitle}>Update your preferences</ThemedText>
                    </Animated.View>
                </View>

                <Animated.View entering={FadeInDown.delay(200).duration(500).springify()} style={styles.cardContainer}>
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <View style={styles.card}>

                            <SelectInput
                                label="How many person depends on you?"
                                value={form.dependents}
                                onPress={() => openSelector('dependents', ['0', '1', '2', '3+', 'N/A'])}
                            />

                            <SelectInput
                                label="How much of the household costs do you handle?"
                                value={form.householdCosts}
                                onPress={() => openSelector('householdCosts', ['All of it', 'About half', 'Most of it', 'Some of it', 'N/A'])}
                            />

                            <SelectInput
                                label="How stable is your Income?"
                                value={form.incomeStability}
                                onPress={() => openSelector('incomeStability', ['Very Stable', 'Somewhat Stable', 'Unstable', 'Variable', 'N/A'])}
                            />

                            <SelectInput
                                label="How do you feel about financial risk?"
                                value={form.financialRisk}
                                onPress={() => openSelector('financialRisk', ['I’m okay with risk', 'balanced', 'I prefer safety', 'N/A'])}
                            />

                            <View style={styles.buttonGroup}>
                                <Button
                                    label={loading ? "Saving..." : "Save Changes"}
                                    onPress={handleSave}
                                    style={styles.saveButton}
                                    disabled={loading}
                                />
                                <Button
                                    label="Cancel"
                                    variant="outline"
                                    onPress={() => router.back()}
                                    style={styles.cancelButton}
                                />
                            </View>
                        </View>
                    </ScrollView>
                </Animated.View>

                <SelectionModal
                    visible={modalVisible}
                    options={options}
                    onSelect={handleSelect}
                    onClose={() => setModalVisible(false)}
                />
            </SafeAreaView>
        </View>
    );
}

function SelectInput({ label, value, onPress }: { label: string, value: string, onPress: () => void }) {
    return (
        <View style={styles.inputWrapper}>
            <ThemedText style={styles.label}>{label}</ThemedText>
            <TouchableOpacity style={styles.selectInput} onPress={onPress}>
                <ThemedText style={styles.inputText}>{value}</ThemedText>
                <Ionicons name="caret-down" size={12} color={palette.neutral.gray500} />
            </TouchableOpacity>
        </View>
    );
}

function SelectionModal({ visible, options, onSelect, onClose }: any) {
    return (
        <Modal transparent visible={visible} animationType="fade">
            <TouchableOpacity style={styles.modalOverlay} onPress={onClose} activeOpacity={1}>
                <View style={styles.modalContent}>
                    {options.map((option: string, index: number) => (
                        <TouchableOpacity key={index} style={styles.optionItem} onPress={() => onSelect(option)}>
                            <ThemedText style={styles.optionText}>{option}</ThemedText>
                        </TouchableOpacity>
                    ))}
                </View>
            </TouchableOpacity>
        </Modal>
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
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing.sm,
    },
    design: {
        backgroundColor: "#b1b1b15e",
        width: 32,
        height: 32,
        paddingTop: 4,
        padding: 2,
        borderRadius: 15,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',

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
    inputWrapper: {
        marginBottom: spacing.lg,
    },
    label: {
        ...typography.label,
        color: palette.neutral.gray900, // Darker for better contrast on white card
        marginBottom: spacing.xs,
        fontWeight: 'bold',
        fontSize: 12,
    },
    selectInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: palette.neutral.gray200,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        backgroundColor: palette.neutral.white,
    },
    inputText: {
        ...typography.bodyRegular,
        color: palette.neutral.gray900,
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
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: palette.neutral.white,
        borderRadius: radius.lg,
        padding: spacing.md,
    },
    optionItem: {
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: palette.neutral.gray100,
    },
    optionText: {
        ...typography.bodyMedium,
        color: palette.neutral.gray900,
        textAlign: 'center',
    },
});
