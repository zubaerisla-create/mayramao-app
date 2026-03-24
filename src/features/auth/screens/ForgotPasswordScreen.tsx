import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button, FadeInView, Input } from '@/src/components';
import { palette, radius, spacing, typography } from '@/src/design-system';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');

    const handleSendOTP = () => {
        // Navigate to OTP for reset
        router.push({ pathname: '/auth/otp', params: { flow: 'reset' } });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={palette.neutral.gray900} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <FadeInView direction="down" style={styles.iconWrapper}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="shield-checkmark-outline" size={32} color={palette.brand.primary} />
                    </View>
                </FadeInView>

                <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.textWrapper}>
                    <ThemedText style={styles.title}>Verify Your Email</ThemedText>
                    <ThemedText style={styles.subtitle}>
                        We've sent a 6-digit code to you@company.com
                    </ThemedText>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.form}>
                    <Input
                        label="Email Address"
                        placeholder="Enter your email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        leftIcon={<Ionicons name="mail-outline" size={20} color={palette.neutral.gray400} />}
                    />
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.footer}>
                    <Button
                        label="Send OTP"
                        onPress={handleSendOTP}
                        style={styles.mainButton}
                        size="lg"
                    />

                    <View style={styles.loginContainer}>
                        <ThemedText style={styles.loginText}>Remember your password? </ThemedText>
                        <TouchableOpacity onPress={() => router.back()}>
                            <ThemedText style={styles.loginLink}>Back to Log In</ThemedText>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: palette.neutral.white,
    },
    header: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: radius.full,
        backgroundColor: palette.neutral.gray100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.xl,
        alignItems: 'center',
        paddingTop: spacing.xl,
    },
    iconWrapper: {
        marginBottom: spacing.xl,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: palette.pastel.green, // Light green bg for Shield
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: palette.brand.secondary,
    },
    textWrapper: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    title: {
        ...typography.h2,
        color: palette.brand.primary,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    subtitle: {
        ...typography.bodyRegular,
        color: palette.neutral.gray600,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: spacing.lg,
    },
    form: {
        width: '100%',
        marginBottom: spacing.xl,
    },
    footer: {
        width: '100%',
        alignItems: 'center',
    },
    mainButton: {
        width: '100%',
        backgroundColor: palette.brand.primary,
        marginBottom: spacing.xl,
    },
    loginContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    loginText: {
        ...typography.bodyRegular,
        color: palette.neutral.gray600,
    },
    loginLink: {
        ...typography.button,
        color: palette.brand.primary,
    }
});
