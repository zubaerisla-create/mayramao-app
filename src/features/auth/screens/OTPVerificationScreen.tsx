import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { Button, FadeInView } from "@/src/components";
import { palette, radius, spacing, typography } from "@/src/design-system";
import { OTPInput } from "../components/OTPInput";

// redux
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import type { RootState } from "@/src/store/store";
import type { AuthState } from "../authSlice";
import { resendOtp, verifyOtp } from "../authSlice";
export default function OTPVerificationScreen() {
  const router = useRouter();
  const { flow } = useLocalSearchParams<{ flow: string }>();
  const [code, setCode] = useState("");

  const dispatch = useAppDispatch();
  const auth = useAppSelector((state: RootState) => state.auth as AuthState);
  const { email, loading, error, message } = auth;

  const handleVerify = async () => {
    if (!email) return;
    try {
      await dispatch(verifyOtp({ email, otp: code })).unwrap();
      if (flow === "reset") {
        router.push("/auth/new-password");
      } else {
        router.push("/auth/success");
      }
    } catch (e) {
      console.warn("Verification failed", e);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    try {
      await dispatch(resendOtp({ email })).unwrap();
      // you could show toast/alert with message
    } catch (e) {
      console.warn("Resend OTP failed", e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={palette.neutral.gray900}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <FadeInView direction="down" style={styles.iconWrapper}>
          <View style={styles.iconCircle}>
            <Ionicons
              name="mail-outline"
              size={32}
              color={palette.brand.primary}
            />
          </View>
        </FadeInView>

        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={styles.textWrapper}
        >
          <ThemedText style={styles.title}>Check Your Email</ThemedText>
          <ThemedText style={styles.subtitle}>
            We've sent a 6-digit OTP to {email || "your email"}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Enter the code below to continue.
          </ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <ThemedText style={styles.label}>Enter OTP Code</ThemedText>
          <OTPInput length={6} onCodeFilled={setCode} />
          {error ? (
            <ThemedText
              style={{ color: palette.brand.primary, marginTop: spacing.sm }}
            >
              {error}
            </ThemedText>
          ) : null}
          {message ? (
            <ThemedText
              style={{ color: palette.brand.primary, marginTop: spacing.sm }}
            >
              {message}
            </ThemedText>
          ) : null}
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(300).springify()}
          style={styles.footer}
        >
          <Text style={styles.timerText}>
            This code will expire in 2 minutes
          </Text>

          <Button
            label="Verify OTP"
            onPress={handleVerify}
            style={styles.verifyButton}
            isLoading={loading}
            disabled={loading}
          />

          <View style={styles.resendContainer}>
            <ThemedText style={styles.resendLabel}>
              Didn't receive the code?
            </ThemedText>
            <TouchableOpacity onPress={handleResend}>
              <ThemedText style={styles.resendLink}>Resend OTP</ThemedText>
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
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    paddingTop: spacing.xl,
  },
  iconWrapper: {
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: palette.pastel.blue,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: palette.brand.secondary,
  },
  textWrapper: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h2,
    color: palette.brand.primary,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  subtitle: {
    ...typography.bodyRegular,
    color: palette.neutral.gray600,
    textAlign: "center",
    lineHeight: 22,
  },
  label: {
    ...typography.label,
    alignSelf: "center",
    marginBottom: spacing.sm,
  },
  footer: {
    width: "100%",
    alignItems: "center",
  },
  timerText: {
    ...typography.caption,
    color: palette.neutral.gray500,
    marginBottom: spacing.lg,
  },
  verifyButton: {
    width: "100%",
    backgroundColor: palette.brand.primary,
    marginBottom: spacing.xl,
  },
  resendContainer: {
    alignItems: "center",
    gap: spacing.xs,
  },
  resendLabel: {
    ...typography.bodyRegular,
    color: palette.neutral.gray500,
  },
  resendLink: {
    ...typography.button,
    color: palette.brand.primary,
  },
});
