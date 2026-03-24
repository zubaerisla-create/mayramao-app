import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { palette, radius, spacing } from '@/src/design-system';

export interface SimulationItemProps {
    id: string;
    name: string;
    price: number;
    date: string; // "Yesterday", "6:26 AM"
    status: 'safe' | 'tight' | 'risky';
    icon?: string; // Placeholder for now
    onPress?: () => void;
}

export function SimulationItemCard({ name, price, date, status, onPress }: SimulationItemProps) {
    const isSafe = status === 'safe';
    const isTight = status === 'tight';

    const statusColor = isSafe
        ? palette.status.success
        : isTight
            ? palette.status.warning
            : palette.status.error;

    const statusBg = isSafe
        ? palette.pastel.green
        : isTight
            ? '#FFF8E1' // Light yellow
            : '#FFEBEE'; // Light red

    const statusLabel = isSafe ? 'Safe' : isTight ? 'Tight' : 'Risky';

    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.info}>
                <ThemedText style={styles.name}>{name}</ThemedText>
                <ThemedText style={styles.date}>{date}</ThemedText>
            </View>

            <View style={styles.rightSection}>
                <ThemedText style={styles.price}>${price.toLocaleString()}</ThemedText>
                <View style={[styles.badge, { backgroundColor: statusBg }]}>
                    <ThemedText style={[styles.badgeText, { color: statusColor }]}>{statusLabel}</ThemedText>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: palette.neutral.white,
        borderRadius: radius.md,
        marginBottom: spacing.sm,
        // Soft shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1,
        borderColor: palette.neutral.gray50,
    },
    iconContainer: {
        width: 52,
        height: 52,
        borderRadius: radius.lg,
        backgroundColor: palette.neutral.gray50,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
        color: palette.neutral.gray900,
        marginBottom: 2,
    },
    date: {
        fontSize: 12,
        color: palette.neutral.gray500,
    },
    rightSection: {
        alignItems: 'flex-end',
    },
    price: {
        fontSize: 16,
        fontWeight: '800',
        color: palette.neutral.gray900,
        marginBottom: 4,
    },
    badge: {
        paddingHorizontal: spacing.sm + 2,
        paddingVertical: 4,
        borderRadius: radius.full,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
    },
});
