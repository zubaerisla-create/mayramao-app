import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/src/components';
import { palette, spacing, typography } from '@/src/design-system';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.32;

export default function AuthSuccessScreen() {
  const router = useRouter();

  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(25);

  useEffect(() => {
    opacity.value = withDelay(
      150,
      withTiming(1, {
        duration: 650,
        easing: Easing.out(Easing.cubic),
      })
    );

    scale.value = withDelay(
      150,
      withTiming(1, {
        duration: 650,
        easing: Easing.out(Easing.cubic),
      })
    );

    translateY.value = withDelay(
      150,
      withTiming(0, {
        duration: 650,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, []);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));

  const handleContinue = () => {
    router.replace('/auth/financial-profile');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.iconWrapper, animatedIconStyle]}>
          <LinearGradient
            colors={['#c2f1d52d', '#01110715']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <Image
              source={require('@/assets/images/verifysuccess.png')}
              style={styles.image}
              resizeMode="contain"
            />
          </LinearGradient>
        </Animated.View>

        <ThemedText style={styles.title}>
          Congratulations!
        </ThemedText>

        <ThemedText style={styles.subtitle}>
          Your account has been created successfully
        </ThemedText>
      </View>

      <View style={styles.footer}>
        <Button
          label="Continue"
          onPress={handleContinue}
          style={styles.button}
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.neutral.white,
    padding: spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    marginBottom: spacing.xxl,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    borderRadius: CIRCLE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '55%',
    height: '55%',
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
    maxWidth: '75%',
  },
  footer: {
    paddingBottom: spacing.xxl,
  },
  button: {
    backgroundColor: palette.brand.primary,
  },
});
