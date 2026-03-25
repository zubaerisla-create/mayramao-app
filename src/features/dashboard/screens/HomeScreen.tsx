import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { palette, radius, spacing } from '@/src/design-system';
import { DecisionStatsCard } from '../components/DecisionStatsCard';
import { FinancialOverviewCard } from '../components/FinancialOverviewCard';
import { SimulationItemCard } from '../components/SimulationItemCard';

import { getUserSimulation, setCurrentSimulation } from '@/src/features/simulation/simulationSlice';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { SimulationLimitModal } from '@/src/components';

export default function HomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const dispatch = useAppDispatch();

    const { history } = useAppSelector((state) => state.simulation);
    const { user } = useAppSelector((state) => state.auth);
    const { profile } = useAppSelector((state) => state.profile);
    const [showLimitModal, setShowLimitModal] = React.useState(false);

    const simulationCount = history?.length || 0;
    const MAX_SIMULATIONS = 5;
    const remainingSimulations = Math.max(0, MAX_SIMULATIONS - simulationCount);

    React.useEffect(() => {
        if (user?.id) {
            dispatch(getUserSimulation(user.id));
        }
    }, [dispatch, user]);

    const RECENT_SIMULATIONS = React.useMemo(() => {
        if (!history) return [];
        return history.slice(0, 3).map((item: any) => {
            const riskLevel = item.aiResponse?.calculation?.risk_level || item.aiResponse?.ai_guidance?.risk_level;
            let status: 'safe' | 'tight' | 'risky' = 'safe';
            if (riskLevel === 'RISKY') status = 'risky';
            else if (riskLevel === 'CAUTIOUS' || riskLevel === 'TIGHT') status = 'tight';
            else if (riskLevel === 'SAFE' || riskLevel === 'COMFORTABLE') status = 'safe';

            return {
                id: item._id,
                name: item.requestPayload?.planName || 'Simulation',
                price: item.requestPayload?.purchaseAmount || 0,
                date: formatDistanceToNow(parseISO(item.createdAt), { addSuffix: true }),
                status: status
            };
        });
    }, [history]);

    const handleCardPress = (id: string) => {
        const item = history.find((h: any) => h._id === id);
        if (item) {
            dispatch(setCurrentSimulation(item));
            router.push({
                pathname: '/simulation/result',
                params: {
                    isHistory: 'true',
                    name: item.requestPayload?.planName || 'Simulation',
                    amount: item.requestPayload?.purchaseAmount || 0,
                    paymentMethod: item.requestPayload?.paymentType?.toLowerCase().includes('finance') ? 'finance' : 'full',
                }
            });
        }
    };

    const handleSimulatePress = () => {
        if (simulationCount >= MAX_SIMULATIONS) {
            setShowLimitModal(true);
        } else {
            router.push('/simulation/new');
        }
    };

    const handleSubscribe = () => {
        setShowLimitModal(false);
        router.push('/profile/subscription' as any);
    };

    // Dynamic Greeting String
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning,';
        if (hour < 18) return 'Good afternoon,';
        return 'Good evening,';
    };

    const displayAvatar = profile?.profileImage || 'https://i.pravatar.cc/150?u=placeholder';
    const displayName = profile?.fullName?.split(' ')[0] || user?.name || 'User';

    const currentDisposableIncome = React.useMemo(() => {
        if (!profile) return 0;
        const income = Number(profile.monthlyIncome) || 0;
        const fixed = (profile.fixedExpenses
            ? Object.values(profile.fixedExpenses).reduce((a: any, b: any) => a + (Number(b) || 0), 0)
            : 0) as number;
        const variable = Number(profile.variableExpenses) || 0;
        const loans = (Number(profile.existingLoans) || Number(profile.totalMonthlyLoanPayments) || 0) as number;
        return income - fixed - variable - loans;
    }, [profile]);

    const stats = React.useMemo(() => {
        if (!history || history.length === 0) return { safe: 0, risky: 0 };
        let safeCount = 0;
        let riskyCount = 0;
        history.forEach((item: any) => {
            if (item.aiResponse?.calculation?.risk_level?.toLowerCase() === 'safe') {
                safeCount++;
            } else {
                riskyCount++;
            }
        });
        const total = safeCount + riskyCount;
        if (total === 0) return { safe: 0, risky: 0 };
        return {
            safe: Math.round((safeCount / total) * 100),
            risky: Math.round((riskyCount / total) * 100)
        };
    }, [history]);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor={palette.brand.primary} />
            <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 100 + insets.bottom }]} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <ThemedText style={styles.greeting}>{getGreeting()}</ThemedText>
                        <ThemedText style={styles.username}>
                            {displayName}
                        </ThemedText>
                    </View>
                    <TouchableOpacity onPress={() => router.push('/profile')} style={styles.avatarContainer}>
                        <Image
                            source={{ uri: displayAvatar }}
                            style={styles.avatar}
                        />
                    </TouchableOpacity>
                </View>

                {/* Financial Overview */}
                <FinancialOverviewCard
                    disposableIncome={(currentDisposableIncome || history?.[0]?.aiResponse?.calculation?.new_disposable_income || 0) as number}
                    savings={(profile?.currentSavings || history?.[0]?.profileSnapshot?.currentSavings || 0) as number}
                    fixedExpenses={
                        (profile?.fixedExpenses
                            ? Object.values(profile.fixedExpenses as any).reduce((a: any, b: any) => a + (Number(b) || 0), 0)
                            : (history?.[0]?.profileSnapshot?.fixedExpenses
                                ? Object.values(history[0].profileSnapshot.fixedExpenses as any).reduce((a: any, b: any) => a + (Number(b) || 0), 0)
                                : 0)) as number
                    }
                />

                {/* Simulate CTA */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <ThemedText style={styles.sectionTitle}>What are you buying?</ThemedText>
                        <View style={styles.limitBadge}>
                            <ThemedText style={styles.limitText}>
                                {remainingSimulations} left
                            </ThemedText>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={[styles.ctaButton, remainingSimulations === 0 && styles.ctaButtonDisabled]}
                        activeOpacity={0.9}
                        onPress={handleSimulatePress}
                    >
                        <Ionicons name="sparkles" size={24} color={palette.neutral.white} style={{ marginRight: spacing.sm }} />
                        <ThemedText style={styles.ctaText}>
                            {remainingSimulations === 0 ? "Upgrade to Simulate" : "Simulate a Purchase"}
                        </ThemedText>
                    </TouchableOpacity>
                </View>

                <SimulationLimitModal 
                    visible={showLimitModal} 
                    onClose={() => setShowLimitModal(false)} 
                    onSubscribe={handleSubscribe} 
                />

                {/* Recent Simulations */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <ThemedText style={styles.sectionTitle}>Recent Simulations</ThemedText>
                        <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
                            <ThemedText style={styles.viewAll}>View All</ThemedText>
                        </TouchableOpacity>
                    </View>

                    {RECENT_SIMULATIONS.map((item, index) => (
                        <Animated.View
                            key={item.id}
                            entering={FadeInDown.delay(200 + index * 100).springify()}
                        >
                            <SimulationItemCard {...item} onPress={() => handleCardPress(item.id)} />
                        </Animated.View>
                    ))}
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <DecisionStatsCard type="safe" percentage={stats.safe} />
                    <View style={{ width: spacing.md }} />
                    <DecisionStatsCard type="risky" percentage={stats.risky} />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: palette.neutral.white, // White background as per design
    },
    content: {
        // dynamic padding applied inline
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        marginBottom: spacing.sm,
    },
    greeting: {
        fontSize: 14,
        color: palette.brand.tertiary,
        // marginBottom: 1,
        fontWeight: '500',
    },
    username: {
        fontSize: 20,
        fontWeight: 'bold',
        color: palette.neutral.gray900,
    },
    avatarContainer: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    section: {
        marginTop: spacing.xl,
        paddingHorizontal: spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: palette.neutral.gray900,
        marginBottom: spacing.sm,
    },
    viewAll: {
        fontSize: 14,
        color: palette.status.success,
        fontWeight: '600',
    },
    ctaButton: {
        backgroundColor: '#0F172A', // Dark Navy
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: radius.md,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    ctaText: {
        fontSize: 16,
        fontWeight: '600',
        color: palette.neutral.white,
    },
    statsRow: {
        flexDirection: 'row',
        marginTop: spacing.xl,
        paddingHorizontal: spacing.lg,
    },
    limitBadge: {
        backgroundColor: palette.brand.primary + '15',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: radius.full,
    },
    limitText: {
        fontSize: 12,
        fontWeight: '700',
        color: palette.brand.primary,
    },
    ctaButtonDisabled: {
        backgroundColor: palette.neutral.gray800,
    }
});
