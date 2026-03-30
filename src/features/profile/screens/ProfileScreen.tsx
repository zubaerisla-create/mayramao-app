import { AppDispatch, RootState } from '@/src/store/store';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/src/components';
import { palette, radius, spacing, typography } from '@/src/design-system';
import { getProfile } from '@/src/features/profile/profileSlice';

export default function ProfileScreen() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { profile, loading } = useSelector((state: RootState) => state.profile);
    const user = useSelector((state: RootState) => state.auth.user);

    useEffect(() => {
        if (user?.id) {
            dispatch(getProfile(user.id));
        }
    }, [dispatch, user?.id]);

    // Calculate fixed expenses securely
    let fixedExpensesTotal = 0;
    if (profile?.fixedExpenses && typeof profile.fixedExpenses === 'object') {
        fixedExpensesTotal =
            (Number(profile.fixedExpenses.rent) || 0) +
            (Number(profile.fixedExpenses.utilities) || 0) +
            (Number(profile.fixedExpenses.subscriptionsInsurance) || 0);
    } else {
        fixedExpensesTotal = Number(profile?.fixedExpenses) || 0;
    }

    const displayName = profile?.fullName || user?.name || 'User';
    const displayAvatar = profile?.profileImage || 'https://i.pravatar.cc/150?u=placeholder';
    const planName = profile?.subscription?.planName || 'Free Plan';

    const income = profile?.monthlyIncome || 0;
    const existingLoans = profile?.existingLoans || 0;
    const variableExpenses = profile?.variableExpenses || 0;
    const currentSavings = profile?.currentSavings || 0;

    const handleSubscription = () => {
        router.push('/profile/subscription')
    }
    return (

        <View style={{ flex: 1 }}>


            {/* header */}
            <View style={styles.header}>
                <Image source={{ uri: displayAvatar }} style={styles.avatar} />
                <View style={styles.userInfo}>
                    <ThemedText style={styles.userName}>{displayName}</ThemedText>
                    <Pressable onPress={handleSubscription} >
                        <View style={styles.planBadge}>
                            <ThemedText style={styles.planText}>{planName}</ThemedText>
                            <Ionicons name="chevron-forward" size={12} color={palette.neutral.gray600} />
                        </View>
                    </Pressable>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Financial Baseline */}
                <Animated.View style={styles.baselineCard} entering={FadeInDown.delay(100).springify()}>
                    <View style={styles.sectionHeader}>
                        <ThemedText style={styles.sectionTitle}>Financial Baseline</ThemedText>
                        <TouchableOpacity onPress={() => router.push('/profile/financial-data')}>
                            <ThemedText style={styles.editLink}>Edit</ThemedText>
                        </TouchableOpacity>
                    </View>
                    <View >
                        <BaselineRow icon="cash-outline" label="Monthly Income" value={income} color={palette.status.success} />
                        <BaselineRow icon="home-outline" label="Fixed Expenses" value={fixedExpensesTotal} color={palette.brand.primary} />
                        <BaselineRow icon="card-outline" label="Existing Loans" value={existingLoans} color={palette.brand.tertiary} />
                        <BaselineRow icon="cart-outline" label="Variable Expenses" value={variableExpenses} color={palette.status.warning} />
                        <View style={styles.divider} />
                        <BaselineRow icon="wallet-outline" label="Current Savings" value={currentSavings} color="#E91E63" bold />
                    </View>
                </Animated.View>

                {/* Financial Context */}
                <View style={styles.section}>
                    <Card>
                        <ThemedText style={styles.sectionTitleGroup}>Financial Context</ThemedText>
                        <MenuRow
                            icon="bulb-outline"
                            label="Future Goals"
                            onPress={() => router.push('/profile/goals')}
                            delay={200}
                            iconColor={palette.status.success}
                            iconBackground={palette.pastel.green}
                        />
                        <MenuRow
                            icon="options-outline"
                            label="Personal Preferences"
                            onPress={() => router.push('/profile/preferences')}
                            delay={300}
                            iconColor={palette.brand.tertiary}
                            iconBackground={palette.pastel.blue}
                        />
                    </Card>
                </View>

                {/* Settings */}
                <View style={styles.section}>
                    <Card>
                        <ThemedText style={styles.sectionTitleGroup}>Settings</ThemedText>
                        <MenuRow
                            icon="person-outline"
                            label="Edit Profile"
                            onPress={() => {
                                console.log("edit ")
                                router.push('/profile/edit')
                            }}
                            delay={400}
                            iconColor={palette.neutral.gray900}
                            iconBackground={palette.neutral.gray100}
                        />
                        <MenuRow
                            icon="lock-closed-outline"
                            label="Privacy & Security"
                            onPress={() => { router.push('/profile/update-passwoard') }}
                            delay={500}
                            iconColor={palette.neutral.gray900}
                            iconBackground={palette.neutral.gray100}
                        />
                        <MenuRow
                            icon="headset-outline"
                            label="Contact & Support"
                            onPress={() => { router.push('/profile/contact-support') }}
                            delay={600}
                            iconColor={palette.neutral.gray900}
                            iconBackground={palette.neutral.gray100}
                        />
                        <MenuRow
                            icon="trash-outline"
                            label="Account Deletion"
                            onPress={() => { router.push('/profile/accountdeletion') }}
                            delay={700}
                            iconColor={palette.neutral.gray500}
                            iconBackground={palette.neutral.gray100}
                        />
                    </Card>
                </View>

                {/* Disclaimer */}
                <Card style={{ marginVertical: 40 }} >
                    <ThemedText style={styles.disclaimerTitle}>
                        Important Disclaimer:
                    </ThemedText>
                    <ThemedText style={styles.disclaimer}>
                        Finova provides educational financial guidance only. It is not a substitute for professional financial advice. Results are based on the information you provide and general assumptions. Always consider your unique circumstances and consult with a financial advisor for major decisions.
                    </ThemedText>
                </Card>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutButton} onPress={() => router.replace('/auth/login')}>
                    <Ionicons name="log-out-outline" size={20} color={palette.status.error} />
                    <ThemedText style={styles.logoutText}>Log Out</ThemedText>
                </TouchableOpacity>

            </ScrollView>
        </View>

    );
}

function BaselineRow({ icon, label, value, color, bold }: any) {
    return (
        <View style={styles.baselineRow}>
            <View style={styles.baselineLeft}>
                <Ionicons name={icon} size={20} color={color} style={{ marginRight: spacing.md }} />
                <ThemedText style={styles.baselineLabel}>{label}</ThemedText>
            </View>
            <ThemedText style={[styles.baselineValue, bold && styles.boldValue]}>
                ${value.toLocaleString()}
            </ThemedText>
        </View>
    );
}

function MenuRow({ icon, label, onPress, delay, iconColor, iconBackground }: any) {
    return (
        <Animated.View entering={FadeInDown.delay(delay).springify()}>
            <TouchableOpacity style={styles.menuRow} onPress={onPress}>
                <View style={styles.menuLeft}>
                    <View style={[styles.iconBox, { backgroundColor: iconBackground }]}>
                        <Ionicons name={icon} size={20} color={iconColor} />
                    </View>
                    <ThemedText style={styles.menuLabel}>{label}</ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={16} color={palette.neutral.gray400} />
            </TouchableOpacity>
        </Animated.View>
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
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.xl *2, // Added top padding for status bar area matching
        paddingBottom: spacing.xl,
        backgroundColor: palette.brand.primary,
        
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 2,
        borderColor: palette.neutral.white,
    },
    userInfo: {
        marginLeft: spacing.md,
    },
    userName: {
        ...typography.h3,
        color: palette.neutral.white,
        fontSize: 20,
    },
    planBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)', // Translucent background
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: radius.full,
        marginTop: 4,
        alignSelf: 'flex-start',
    },
    planText: {
        fontSize: 12,
        fontWeight: '500',
        color: palette.neutral.white,
        marginRight: 4,
    },
    content: {
        padding: spacing.lg,
        paddingBottom: 40,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
        marginTop: spacing.sm,
    },
    sectionTitle: {
        ...typography.bodyMedium,
        fontWeight: 'bold',
        color: palette.neutral.gray900,
        fontSize: 16,
    },
    sectionTitleGroup: {
        ...typography.bodyMedium, // Bigger than caption
        fontWeight: 'bold',
        color: palette.neutral.gray900, // Darker
        marginBottom: spacing.sm,
        marginLeft: spacing.xs,
        marginTop: spacing.lg,
        fontSize: 16,
    },
    editLink: {
        ...typography.caption,
        color: palette.neutral.gray500, // Gray edit link
        fontWeight: '500',
        fontSize: 14,
    },
    baselineCard: {
        padding: spacing.lg, // More padding
        borderRadius: radius.md, // More rounded
        backgroundColor: palette.neutral.white,
        shadowColor: palette.neutral.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    baselineRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm + 2,
        height: 48,
    },
    baselineLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    baselineLabel: {
        ...typography.bodyRegular,
        color: palette.neutral.gray700,
        fontSize: 14,
    },
    baselineValue: {
        ...typography.bodyMedium,
        color: palette.neutral.gray900,
        fontWeight: 'bold',
        fontSize: 14,
    },
    boldValue: {
        fontWeight: 'bold',
        color: palette.neutral.gray900, // Savings is confusing, stuck to black for now or brand? Design shows black/dark.
    },
    divider: {
        height: 1,
        backgroundColor: palette.neutral.gray100,
        marginVertical: spacing.sm,
    },
    section: {
        marginTop: spacing.md,
    },
    menuRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // backgroundColor: palette.neutral.white,
        padding: spacing.md,
        borderRadius: radius.md,
        marginBottom: spacing.sm, // Gap between items
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20, // Circular
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    menuLabel: {
        ...typography.bodyMedium,
        color: palette.neutral.gray900,
        fontWeight: '500',
    },
    disclaimerTitle: {
        fontSize: 18,
        color: "#825fff",
        fontWeight: '400'
    },
    disclaimer: {
        fontSize: 11,
        color: "#825fff", // Lighter
        textAlign: 'left', // Left aligned
        marginTop: spacing.xs,
        marginBottom: spacing.xl,
        lineHeight: 16,
        paddingHorizontal: spacing.xs,
    },
    logoutButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: palette.neutral.white, // White background
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: palette.status.error, // Red border
        marginBottom: 10,
    },
    logoutText: {
        ...typography.bodyMedium,
        color: palette.status.error,
        fontWeight: 'bold',
        marginLeft: spacing.xs,
    }
});
