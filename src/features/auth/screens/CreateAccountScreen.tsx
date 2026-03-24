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
import { registerUser } from "../authSlice";

export default function CreateAccountScreen() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const dispatch = useAppDispatch();
  const auth = useAppSelector((state: RootState) => state.auth as AuthState);
  const { loading, error } = auth;

  const handleCreateAccount = async () => {
    if (form.password !== form.confirmPassword) {
      // you could set local error state here or dispatch another action
      return;
    }

    try {
      const result = await dispatch(
        registerUser({
          name: form.fullName,
          email: form.email,
          password: form.password,
        }),
      ).unwrap();
      // success -> navigate to otp screen
      router.push("/auth/otp?flow=register");
    } catch (err) {
      // error is already available in selector; optionally log
      console.warn("register failed", err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* LOGO SECTION */}
        <FadeInView delay={100} direction="down" style={styles.header}>
          <View>
            <Image
              style={styles.logo}
              source={require("@/assets/images/splashScreenImage.png")}
              resizeMode="contain"
            />
          </View>
          <ThemedText style={styles.title}>Create Account</ThemedText>
          <ThemedText style={styles.subtitle}>
            Start making smarter financial decisions today
          </ThemedText>
        </FadeInView>

        {/* FORM SECTION */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Input
            placeholder="Full name"
            value={form.fullName}
            onChangeText={(t) => setForm({ ...form, fullName: t })}
            containerStyle={styles.inputGap}
          />
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
          <Input
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChangeText={(t) => setForm({ ...form, confirmPassword: t })}
            secureTextEntry
            containerStyle={styles.inputGap}
          />
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
            label="Create Account"
            onPress={handleCreateAccount}
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
              Already have an account?{" "}
            </ThemedText>
            <TouchableOpacity onPress={() => router.push("/auth/login")}>
              <ThemedText style={styles.loginLink}>Sign In</ThemedText>
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
  logo: {
    width: 50,
    height: 50,
    marginBottom: 10,
    // marginLeft : spaci
  },
  content: {
    padding: spacing.xl,
  },
  header: {
    // alignItems: 'start',
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
    // borderRadius : 10 ,
    marginBottom: spacing.md,
  },
  footer: {
    marginTop: spacing.xl,
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
