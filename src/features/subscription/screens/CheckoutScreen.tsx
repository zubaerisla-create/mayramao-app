import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button, Input } from '@/src/components';
import { palette, radius, spacing, typography } from '@/src/design-system';

export default function CheckoutScreen() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: 'John Doe',
        cardNumber: '',
        expiry: '',
        cvc: '123'
    });

    const handleChange = (key: string, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={palette.neutral.white} />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color={palette.neutral.black}
                        style={styles.backButton}
                        onPress={() => router.back()}
                    />
                    <ThemedText style={styles.headerTitle}>Secure Checkout</ThemedText>
                    <View style={{ width: 40 }} />
                </View>

                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                        {/* Order Summary */}
                        <Animated.View entering={FadeInDown.delay(100).duration(500).springify()} style={styles.summaryCard}>
                            <View style={styles.summaryRow}>
                                <View>
                                    <ThemedText style={styles.summaryLabel}>Selected Plan</ThemedText>
                                    <ThemedText style={styles.summaryPlan}>Premium Membership</ThemedText>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <ThemedText style={styles.summaryLabel}>Total</ThemedText>
                                    <ThemedText style={styles.summaryPrice}>$9.99</ThemedText>
                                </View>
                            </View>

                            <View style={styles.secureBadge}>
                                <Ionicons name="shield-checkmark" size={16} color="#8B5CF6" style={{ marginRight: 8 }} />
                                <ThemedText style={styles.secureText}>Secure Stripe encrypted payment</ThemedText>
                            </View>
                        </Animated.View>

                        {/* Payment Form */}
                        <Animated.View entering={FadeInDown.delay(200).duration(500).springify()}>
                            <LabeledInput
                                label="Cardholder Name"
                                value={form.name}
                                onChangeText={(text: string) => handleChange('name', text)}
                                placeholder="Enter Name"
                            />

                            <LabeledInput
                                label="Card Number"
                                value={form.cardNumber}
                                onChangeText={(text: string) => handleChange('cardNumber', text)}
                                placeholder="0000 0000 0000 0000"
                                keyboardType="numeric"
                            />

                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: spacing.sm }}>
                                    <LabeledInput
                                        label="Expiry"
                                        value={form.expiry}
                                        onChangeText={(text: string) => handleChange('expiry', text)}
                                        placeholder="MM/YY"
                                        keyboardType="numeric"
                                    />
                                </View>
                                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                                    <LabeledInput
                                        label="CVC"
                                        value={form.cvc}
                                        onChangeText={(text: string) => handleChange('cvc', text)}
                                        placeholder="123"
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
                        </Animated.View>

                    </ScrollView>
                </KeyboardAvoidingView>

                <View style={styles.footer}>
                    <Button
                        label="Pay $9.99"
                        onPress={() => {
                            // Mock payment success
                            alert('Payment Processing...');
                        }}
                        style={styles.payButton}
                    />
                </View>

            </SafeAreaView>
        </View>
    );
}

function LabeledInput({ label, value, onChangeText, placeholder, keyboardType, style }: any) {
    return (
        <View style={[styles.inputWrapper ]}>
            <ThemedText style={styles.label}>{label}</ThemedText>
            <Input
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                keyboardType={keyboardType}
                containerStyle={styles.noMargin}
                style={[styles.input, style]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: palette.neutral.white, // White background for Checkout
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: palette.neutral.gray100,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: palette.neutral.gray50,
        textAlign: 'center',
        textAlignVertical: 'center',
        borderWidth: 1,
        borderColor: palette.neutral.gray200,
    },
    headerTitle: {
        ...typography.h3,
        color: palette.brand.primary,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: spacing.lg,
        paddingBottom: 100,
    },
    summaryCard: {
        backgroundColor: palette.neutral.white,
        borderRadius: radius.md,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: palette.neutral.gray100,
        marginBottom: spacing.xl,
        shadowColor: palette.neutral.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
    },
    summaryLabel: {
        ...typography.caption,
        color: palette.neutral.gray500,
        marginBottom: 4,
    },
    summaryPlan: {
        ...typography.bodyMedium,
        fontWeight: 'bold',
        color: palette.brand.primary,
    },
    summaryPrice: {
        ...typography.h3,
        color: '#1D4ED8', // Blue price
        fontWeight: 'bold',
    },
    secureBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3E8FF', // Light purple
        padding: spacing.sm,
        borderRadius: radius.md,
    },
    secureText: {
        fontSize: 12,
        color: '#7C3AED', // Purple text
        fontWeight: '500',
    },
    inputWrapper: {
        marginBottom: spacing.lg,
    },
    label: {
        ...typography.bodySmall,
        color: palette.neutral.gray700,
        marginBottom: spacing.xs,
        fontWeight: '600',
    },
    noMargin: {
        marginBottom: 0,
    },
    input: {
        height: 50,
        backgroundColor: palette.neutral.white,
        // borderWidth: 1,
        width: '100%',
        
        borderColor: palette.neutral.gray200,
        borderRadius: radius.lg,
        // paddingHorizontal: spacing.md,
    },
    row: {
        flexDirection: 'row',
    },
    footer: {
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: palette.neutral.gray100,
        backgroundColor: palette.neutral.white,
    },
    payButton: {
        backgroundColor: palette.brand.primary,
        width: '100%',
        height: 56,
    }
});
