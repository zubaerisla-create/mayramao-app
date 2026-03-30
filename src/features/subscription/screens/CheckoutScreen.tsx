import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button, Input } from '@/src/components';
import { palette, radius, spacing, typography } from '@/src/design-system';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { purchaseSubscription, fetchStripeKey } from '../subscriptionSlice';
import { getProfile } from '@/src/features/profile/profileSlice';
import { ActivityIndicator, Alert } from 'react-native';
import { StripeProvider, CardField, useStripe } from '@stripe/stripe-react-native';

export default function CheckoutScreen() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { selectedPlan, purchaseLoading, error: subError } = useAppSelector(state => state.subscription);
    const { user } = useAppSelector(state => state.auth);
    const { createPaymentMethod, confirmPayment } = useStripe();

    const [form, setForm] = useState({
        name: user?.name || '',
    });

    React.useEffect(() => {
        if (!selectedPlan) {
            router.replace('/profile/subscription' as any);
        }
        dispatch(fetchStripeKey());
    }, [selectedPlan]);

    const handleChange = (key: string, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handlePurchase = async () => {
        if (!form.name || !selectedPlan) return Alert.alert("Error", "Enter cardholder name or select plan");

        // 1️⃣ Create PaymentMethod
        const { paymentMethod, error: pmError } = await createPaymentMethod({
            paymentMethodType: 'Card',
            paymentMethodData: {
                billingDetails: { name: form.name, email: user?.email },
            },
        });

        if (pmError) return Alert.alert("Payment Error", pmError.message);

        // 2️⃣ Send PaymentMethod to backend to create subscription
        const resultAction = await dispatch(purchaseSubscription({
            planId: selectedPlan._id,
            paymentMethodId: paymentMethod.id,
            cardHolderName: form.name,
        }));

        if (!purchaseSubscription.fulfilled.match(resultAction)) {
            return Alert.alert("Payment Failed", (resultAction.payload as any)?.message || "Failed");
        }

        const { clientSecret } = resultAction.payload as any;
        if (!clientSecret) return Alert.alert("Payment Error", "No client secret returned");

        // 3️⃣ Confirm the payment intent on client
        const { paymentIntent, error: stripeError } = await confirmPayment(clientSecret, {
            paymentMethodType: 'Card',
            paymentMethodData: {
                billingDetails: { name: form.name, email: user?.email },
            }
        });

        if (stripeError) return Alert.alert("Payment Failed", stripeError.message);
        
        // Fixed: Check payment intent status correctly
        if (paymentIntent?.status !== 'Succeeded') {
            return Alert.alert("Payment Failed", "Payment not successful");
        }

        // 4️⃣ Refresh profile to update subscription status
        dispatch(getProfile(user?.id || (user as any)?._id || ''));

        Alert.alert("Success", "Subscription activated", [{ text: "OK", onPress: () => router.replace('/(tabs)' as any) }]);
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

                {subError && (
                    <View style={styles.errorBanner}>
                        <ThemedText style={styles.errorText}>{subError}</ThemedText>
                    </View>
                )}

                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                        {/* Order Summary */}
                        <Animated.View entering={FadeInDown.delay(100).duration(500).springify()} style={styles.summaryCard}>
                            <View style={styles.summaryRow}>
                                <View>
                                    <ThemedText style={styles.summaryLabel}>Selected Plan</ThemedText>
                                    <ThemedText style={styles.summaryPlan}>{selectedPlan?.planName || 'Plan'}</ThemedText>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <ThemedText style={styles.summaryLabel}>Total</ThemedText>
                                    <ThemedText style={styles.summaryPrice}>${selectedPlan?.price || '0.00'}</ThemedText>
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

                            <ThemedText style={styles.label}>Card Details</ThemedText>
                            <CardField
                                postalCodeEnabled={false}
                                placeholders={{
                                    number: '#### #### #### ####',
                                }}
                                cardStyle={{
                                    backgroundColor: '#FFFFFF',
                                    textColor: '#000000',
                                    placeholderColor: palette.neutral.gray400,
                                }}
                                style={styles.cardField}
                            />
                        </Animated.View>

                    </ScrollView>
                </KeyboardAvoidingView>

                <View style={styles.footer}>
                    <Button
                        label={purchaseLoading ? "Processing..." : `Pay $${selectedPlan?.price || '0.00'}`}
                        onPress={handlePurchase}
                        isLoading={purchaseLoading}
                        disabled={purchaseLoading || !selectedPlan}
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
    },
    errorBanner: {
        backgroundColor: '#FEE2E2',
        padding: spacing.sm,
        alignItems: 'center',
    },
    errorText: {
        color: '#B91C1C',
        fontSize: 12,
        fontWeight: '600',
    },
    cardField: {
        width: '100%',
        height: 50,
        marginVertical: spacing.sm,
        borderWidth: 1,
        borderColor: palette.neutral.gray200,
        borderRadius: radius.md,
    }
});