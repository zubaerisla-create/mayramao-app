import { ThemedText } from '@/components/themed-text';
import { palette, spacing } from '@/src/design-system';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Types ────────────────────────────────────────────────────────────────────
interface TabItemProps {
    state: any;
    descriptors: any;
    navigation: any;
    route: any;
    index: number;
}

// ─── Icon helper ──────────────────────────────────────────────────────────────
const getIconName = (routeName: string, isFocused: boolean): string => {
    switch (routeName) {
        case 'index':    return isFocused ? 'home'   : 'home-outline';
        case 'history':  return isFocused ? 'time'   : 'time-outline';
        case 'profile':  return isFocused ? 'person' : 'person-outline';
        default:         return 'help-circle-outline';
    }
};

// ─── Tab Item ─────────────────────────────────────────────────────────────────
const TabItem = ({ state, descriptors, navigation, route, index }: TabItemProps) => {
    const { options } = descriptors[route.key];
    const isFocused = state.index === index;

    const label =
        options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
                ? options.title
                : route.name;

    const onPress = () => {
        const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
        });
        if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
        }
    };

    const onLongPress = () => {
        navigation.emit({ type: 'tabLongPress', target: route.key });
    };

    // Icon scale + bounce on active
    const iconAnimStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: withSpring(isFocused ? 1.15 : 1, { damping: 12, stiffness: 180 }) },
        ],
    }));

    // Active indicator pill under icon
    const dotAnimStyle = useAnimatedStyle(() => ({
        opacity: withTiming(isFocused ? 1 : 0, { duration: 200 }),
        transform: [
            { scaleX: withSpring(isFocused ? 1 : 0.3, { damping: 14, stiffness: 160 }) },
        ],
    }));

    return (
        <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabItem}
            activeOpacity={0.75}
        >
            {/* Active dot indicator — TOP */}
            <Animated.View style={[styles.activeDot, dotAnimStyle]} />

            {/* Icon */}
            <Animated.View style={[styles.iconContainer, iconAnimStyle]}>
                <Ionicons
                    name={getIconName(route.name, isFocused) as any}
                    size={24}
                    color={isFocused ? palette.brand.primary : palette.neutral.gray400}
                />
            </Animated.View>

            {/* Label */}
            <ThemedText
                style={[
                    styles.label,
                    {
                        color: isFocused ? palette.brand.primary : palette.neutral.gray400,
                        fontWeight: isFocused ? '600' : '400',
                    },
                ]}
            >
                {label}
            </ThemedText>
        </TouchableOpacity>
    );
};

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────
export const CustomTabBar = (props: BottomTabBarProps) => {
    const insets = useSafeAreaInsets();

    return (
        <View
            style={[
                styles.container,
                { paddingBottom: insets.bottom + spacing.xs },
            ]}
        >
            {props.state.routes.map((route: any, index: number) => (
                <TabItem
                    key={route.key}
                    route={route}
                    index={index}
                    state={props.state}
                    descriptors={props.descriptors}
                    navigation={props.navigation}
                />
            ))}
        </View>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: palette.neutral.white,
        // paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: palette.neutral.gray100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 5,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xs,
    },
    iconContainer: {
        marginBottom: 4,
    },
    label: {
        fontSize: 10,
        lineHeight: 12,
    },
    activeDot: {
        marginBottom: 4,
        width: 18,
        height: 3,
        borderRadius: 2,
        backgroundColor: palette.brand.primary,
    },
});