import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { Button, FadeInView, Input } from "@/src/components";
import { palette, radius, spacing, typography } from "@/src/design-system";

// redux
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import type { RootState } from "@/src/store/store";
import type { AuthState } from "../authSlice";
import { loginUser } from "../authSlice";

export default function LoginScreen() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector<RootState, AuthState>(
    (state) => state.auth,
  );

  const handleLogin = async () => {
    try {
      await dispatch(
        loginUser({ email: form.email, password: form.password }),
      ).unwrap();
      router.replace("/(tabs)");
    } catch (e) {
      console.warn("login failed", e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* LOGO SECTION */}
        <FadeInView delay={100} direction="down" style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/splashScreenImage.png")}
              style={{ width: 50, height: 50 }}
            />
            {/* <Ionicons name="bar-chart" size={40} color={palette.brand.secondary} /> */}
          </View>
          <ThemedText style={styles.title}>Welcome Back</ThemedText>
          <ThemedText style={styles.subtitle}>
            Sign in to continue your journey
          </ThemedText>
        </FadeInView>

        {/* FORM SECTION */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Input
            placeholder="Email address"
            value={form.email}
            onChangeText={(t) => setForm({ ...form, email: t })}
            keyboardType="email-address"
            autoCapitalize="none"
            containerStyle={styles.inputGap}
          />
          <Input
            placeholder="Password"
            value={form.password}
            onChangeText={(t) => setForm({ ...form, password: t })}
            secureTextEntry
            containerStyle={styles.inputGap}
          />

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => router.push("/auth/forgot-password")}
          >
            <ThemedText style={styles.forgotPasswordText}>
              Forgot password?
            </ThemedText>
          </TouchableOpacity>
        </Animated.View>

        {/* BUTTON SECTION */}
        <Animated.View
          entering={FadeInDown.delay(300).springify()}
          style={styles.footer}
        >
          {error ? (
            <ThemedText
              style={{ color: palette.brand.primary, marginBottom: spacing.md }}
            >
              {error}
            </ThemedText>
          ) : null}
          <Button
            label="Sign In"
            onPress={handleLogin}
            size="lg"
            style={styles.mainButton}
            isLoading={loading}
            disabled={loading}
          />

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <ThemedText style={styles.dividerText}>Or continue with</ThemedText>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity style={styles.socialButton}>
            <Ionicons
              name="logo-google"
              size={24}
              color={palette.neutral.black}
            />
            <ThemedText style={styles.socialButtonText}>Google</ThemedText>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <ThemedText style={styles.loginText}>
              Don't have an account?{" "}
            </ThemedText>
            <TouchableOpacity
              onPress={() => router.push("/auth/create-account")}
            >
              <ThemedText style={styles.loginLink}>Sign Up</ThemedText>
            </TouchableOpacity>
          </View>

          <ThemedText style={styles.termsText}>
            By continuing, you agree to Finova's Terms of Service and Privacy
            Policy.
          </ThemedText>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.neutral.white,
  },
  content: {
    padding: spacing.xl,
  },
  header: {
    // alignItems: 'center',
    marginBottom: spacing.xxl,
    marginTop: spacing.lg,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: palette.brand.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: palette.brand.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyRegular,
    color: palette.neutral.gray600,
    // textAlign: 'center',
  },
  inputGap: {
    marginBottom: spacing.md,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    ...typography.caption,
    color: palette.brand.primary,
    fontWeight: "600",
  },
  footer: {
    marginTop: spacing.md,
  },
  mainButton: {
    marginBottom: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: palette.brand.primary,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: palette.neutral.gray200,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    color: palette.neutral.gray500,
    ...typography.caption,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: palette.neutral.gray200,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  socialButtonText: {
    ...typography.button,
    color: palette.neutral.gray900,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  loginText: {
    ...typography.bodyRegular,
    color: palette.neutral.gray600,
  },
  loginLink: {
    ...typography.bodyRegular,
    fontWeight: "700",
    color: palette.brand.primary,
  },
  termsText: {
    ...typography.caption,
    color: palette.neutral.gray400,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: spacing.md,
  },
});
