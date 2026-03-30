import { palette, spacing, typography } from '@/src/design-system';
import { useAppSelector } from '@/src/store/hooks';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';



export default function SplashScreen() {
    const router = useRouter();
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);
    const { user, accessToken } = useAppSelector((state) => state.auth);
    // Wait for redux-persist rehydration before making routing decisions
    const rehydrated = useAppSelector((state) => (state as any)._persist?.rehydrated ?? true);

    useEffect(() => {
        scale.value = withSequence(
            withSpring(1, { damping: 40 }),
            withSpring(1, { damping: 50 })
        );

        opacity.value = withDelay(100, withTiming(1, { duration: 600 }));
    }, []);

    useEffect(() => {
        if (!rehydrated) return; // Wait until persist hydration is complete

        const timer = setTimeout(() => {
            if (user && accessToken) {
                router.replace('/(tabs)');
            } else {
                router.replace('/onboarding');
            }
        }, 2500);

        return () => clearTimeout(timer);
    }, [rehydrated, user, accessToken]);

    const animatedIconStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));
    const animatedTextStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.logoContainer, animatedIconStyle]}>
                <Image
                    source={require('@/assets/images/splashScreenImage.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </Animated.View>

            <Animated.Text style={[styles.title, animatedTextStyle]}>
                Finova
            </Animated.Text>

            <Animated.Text style={[styles.subtitle, animatedTextStyle]}>
                Test before you spend
            </Animated.Text>

            <View style={styles.paginationContainer}>
                <View style={[styles.dot, { opacity: 1 }]} />
                <View style={[styles.dot, { opacity: 0.5 }]} />
                <View style={[styles.dot, { opacity: 0.5 }]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: palette.brand.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        marginBottom: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
        width: 120,
        height: 120,

    },
    logo: {
        width: 80,
        height: 80,
    },
    title: {
        fontSize: 42,
        fontWeight: 'bold',
        color: palette.neutral.white,
        marginBottom: spacing.xs,
        letterSpacing: 1,
    },
    subtitle: {
        ...typography.bodyRegular,
        color: palette.neutral.gray400,
        marginBottom: spacing.xxxl,
    },
    paginationContainer: {
        flexDirection: 'row',
        gap: spacing.sm,
        position: 'absolute',
        bottom: spacing.xxxl,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: palette.neutral.white,
    }
});
