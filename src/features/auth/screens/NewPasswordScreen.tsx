import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button, FadeInView, Input } from '@/src/components';
import { palette, radius, spacing, typography } from '@/src/design-system';

export default function NewPasswordScreen() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleResetPassword = () => {
        // Show success modal or navigate to login
        router.replace('/auth/login');
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
                    <ThemedText style={styles.title}>Create new Password</ThemedText>
                    <ThemedText style={styles.subtitle}>
                        Enter your new password. Make sure it's strong and secure.
                    </ThemedText>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.form}>
                    <Input
                        label="Password"
                        placeholder="Create a strong password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        leftIcon={<Ionicons name="lock-closed-outline" size={20} color={palette.neutral.gray400} />}
                        rightIcon={<Ionicons name="eye-outline" size={20} color={palette.neutral.gray400} />}
                        containerStyle={styles.inputGap}
                    />
                    <Input
                        label="Confirm Password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        leftIcon={<Ionicons name="lock-closed-outline" size={20} color={palette.neutral.gray400} />}
                        rightIcon={<Ionicons name="eye-outline" size={20} color={palette.neutral.gray400} />}
                    />
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.footer}>
                    <Button
                        label="Reset Password"
                        onPress={handleResetPassword}
                        style={styles.mainButton}
                        size="lg"
                    />
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
        backgroundColor: palette.pastel.green,
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
    inputGap: {
        marginBottom: spacing.md,
    },
    footer: {
        width: '100%',
        alignItems: 'center',
    },
    mainButton: {
        width: '100%',
        backgroundColor: palette.brand.primary,
    }
});
