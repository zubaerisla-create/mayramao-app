import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { SectionList, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { palette, radius, spacing } from '@/src/design-system';

import { getUserSimulation, setCurrentSimulation } from '@/src/features/simulation/simulationSlice';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { format, isToday, isYesterday, parseISO } from 'date-fns';

const formatPaymentType = (type: string, duration: number) => {
    if (type?.toLowerCase() === 'loan' || type?.toLowerCase() === 'financing') {
        return `${duration}mo Loan`;
    }
    return 'Paid in Full';
};

const groupHistoryData = (historyData: any[]) => {
    if (!historyData || historyData.length === 0) return [];

    const today: any[] = [];
    const yesterday: any[] = [];
    const older: any[] = [];

    historyData.forEach(item => {
        const date = parseISO(item.createdAt);
        const riskLevel = item?.aiResponse?.calculation?.risk_level || item?.aiResponse?.ai_guidance?.risk_level;
        let status: 'safe' | 'tight' | 'risky' = 'safe';
        if (riskLevel === 'RISKY') status = 'risky';
        else if (riskLevel === 'CAUTIOUS' || riskLevel === 'TIGHT') status = 'tight';
        else if (riskLevel === 'SAFE' || riskLevel === 'COMFORTABLE') status = 'safe';
 
        const calc = item?.aiResponse?.calculation || {};
        const payload = item?.requestPayload || {};
        const displayAmount = payload?.purchaseAmount || 0;
        const displayMethod = payload?.paymentType?.toLowerCase().includes('finance') ? 'finance' : 'full';
        const displayDuration = payload?.loanDuration || 0;
        const disposableIncome = Math.abs(calc?.baseline_disposable_income || 0);

        const recoveryTime = calc?.recovery_months !== undefined ? calc.recovery_months : (displayMethod === 'full'
            ? Math.ceil(displayAmount / (disposableIncome * 0.5 || 1))
            : displayDuration);

        const mappedItem = {
            id: item._id,
            name: payload?.planName || 'Simulation',
            price: displayAmount,
            date: format(date, 'h:mm a'),
            status: status,
            payment: formatPaymentType(payload?.paymentType, payload?.loanDuration),
            recovery: `${recoveryTime}mo`
        };

        if (isToday(date)) today.push(mappedItem);
        else if (isYesterday(date)) yesterday.push(mappedItem);
        else older.push(mappedItem);
    });

    const sections = [];
    if (today.length > 0) sections.push({ title: 'TODAY', data: today });
    if (yesterday.length > 0) sections.push({ title: 'YESTERDAY', data: yesterday });
    if (older.length > 0) sections.push({ title: 'OLDER', data: older });

    return sections;
};

const HistoryItem = ({ item, onPress }: { item: any; onPress: () => void }) => {
    return (
        <TouchableOpacity style={styles.cardContainer} onPress={onPress} activeOpacity={0.7}>
            <ThemedText style={styles.itemName}>{item.name}</ThemedText>
            <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: item.status === 'safe' ? palette.pastel.green : palette.pastel.orange }]}>
                    <ThemedText style={styles.font}>$</ThemedText>
                </View>
                <View style={styles.headerInfo}>

                    <ThemedText style={styles.itemPrice}>${item.price.toLocaleString()}</ThemedText>
                    <ThemedText style={styles.itemTime}>{item.date}</ThemedText>
                </View>
                <View style={[styles.badge, { backgroundColor: item.status === 'safe' ? palette.pastel.green : '#FFF8E1' }]}>
                    <Ionicons 
                        name={item.status === 'safe' ? "checkmark-circle" : item.status === 'tight' ? "time" : "alert-circle"} 
                        size={14} 
                        color={item.status === 'safe' ? palette.status.success : item.status === 'tight' ? palette.status.warning : palette.status.error} 
                        style={{ marginRight: 4 }} 
                    />
                    <ThemedText style={[styles.badgeText, { color: item.status === 'safe' ? palette.status.success : item.status === 'tight' ? palette.status.warning : palette.status.error }]}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </ThemedText>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailsRow}>
                <View>
                    <ThemedText style={styles.detailLabel}>Payment</ThemedText>
                    <ThemedText style={styles.detailValue}>{item.payment}</ThemedText>
                </View>
                <View>
                    <ThemedText style={styles.detailLabel}>Recovery</ThemedText>
                    <ThemedText style={styles.detailValue}>{item.recovery}</ThemedText>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default function HistoryScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const dispatch = useAppDispatch();
    const { history, loading } = useAppSelector((state) => state.simulation);
    const { user } = useAppSelector((state) => state.auth);

    React.useEffect(() => {
        if (user?.id) {
            dispatch(getUserSimulation(user.id));
        }
    }, [dispatch, user]);

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

    const HISTORY_DATA = React.useMemo(() => groupHistoryData(history), [history]);

    return (
        <View style={[styles.container]}>
            <StatusBar barStyle="light-content" backgroundColor={palette.brand.primary} />
            <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
                <ThemedText style={styles.headerTitle}>History</ThemedText>
                <ThemedText style={styles.headerSubtitle}>{history?.length || 0} simulations total</ThemedText>
            </View>

            <SectionList
                sections={HISTORY_DATA}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <HistoryItem item={item} onPress={() => handleCardPress(item.id)} />}
                renderSectionHeader={({ section: { title } }) => (
                    <ThemedText style={styles.sectionHeader}>{title}</ThemedText>
                )}
                contentContainerStyle={[styles.listContent, { paddingBottom: 100 }]}
                stickySectionHeadersEnabled={false}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: palette.neutral.gray50,
        color: 'white',
    },
    font: {
        fontWeight: 'bold',
        color: 'green'
    },
    header: {
        backgroundColor: '#0F172A', // Dark Navy
        paddingHorizontal: spacing.lg,
        paddingVertical: 20

    },
    headerTitle: {
        fontSize: 26,
        paddingTop: spacing.sm,
        paddingBottom: spacing.sm,
        fontWeight: 'bold',
        color: palette.neutral.white,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 4,
    },
    listContent: {
        padding: spacing.lg,
    },
    sectionHeader: {
        fontSize: 12,
        fontWeight: '700',
        color: palette.neutral.gray500,
        marginBottom: spacing.md,
        marginTop: spacing.sm,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    cardContainer: {
        backgroundColor: palette.neutral.white,
        borderRadius: radius.md,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: palette.neutral.gray100,
        // Soft shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: radius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    headerInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 18,
        paddingBottom: 10,
        fontWeight: '700',
        color: palette.neutral.gray900,
    },
    itemPrice: {
        fontSize: 20,
        fontWeight: '800',
        color: palette.neutral.gray900,
        marginTop: 2,
    },
    itemTime: {
        fontSize: 12,
        color: palette.neutral.gray500,
        marginTop: 2,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm + 4,
        paddingVertical: 6,
        borderRadius: radius.full,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
    },
    divider: {
        height: 1,
        backgroundColor: palette.neutral.gray100,
        marginVertical: spacing.md,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    detailLabel: {
        fontSize: 12,
        color: palette.neutral.gray500,
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: palette.neutral.gray900,
    }
});
