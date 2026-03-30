import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { FlatList, StatusBar, StyleSheet, View, ViewToken } from 'react-native';
import Animated, {
    useAnimatedScrollHandler,
    useSharedValue
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/src/components';
import { palette, spacing } from '@/src/design-system';
import { OnboardingItem } from '../components/OnboardingItem';
import { Paginator } from '../components/Paginator';
import { ONBOARDING_DATA } from '../data';

export default function OnboardingScreen() {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useSharedValue(0);
    const flatListRef = useRef<FlatList>(null);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = event.contentOffset.x;
        },
    });

    const viewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems[0] && viewableItems[0].index !== null) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const scrollTo = () => {
        if (currentIndex < ONBOARDING_DATA.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            finishOnboarding();
        }
    };

    const finishOnboarding = () => {
        router.push('/auth/create-account');
    };

    const isLastSlide = currentIndex === ONBOARDING_DATA.length - 1;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={palette.neutral.white} />

            <View style={styles.header}>
                {!isLastSlide && (
                    <Button
                        label="Skip"
                        variant="ghost"
                        size="sm"
                        onPress={finishOnboarding}
                    />
                )}
            </View>

            <View style={{ flex: 3 }}>
                <Animated.FlatList
                    ref={flatListRef}
                    data={ONBOARDING_DATA}
                    renderItem={({ item, index }) => (
                        <OnboardingItem item={item} index={index} x={scrollX} />
                    )}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    bounces={false}
                    onScroll={scrollHandler}
                    scrollEventThrottle={32}
                    onViewableItemsChanged={viewableItemsChanged}
                    viewabilityConfig={viewConfig}
                />
            </View>

            <View style={styles.footer}>
                <Paginator data={ONBOARDING_DATA} x={scrollX} />

                <View style={styles.buttonContainer}>
                    <Button
                        label={isLastSlide ? "Get Started" : "Continue"}
                        onPress={scrollTo}
                        variant="primary"
                        size="lg"
                        style={styles.mainButton}
                    />
                </View>
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
        height: 60,
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingHorizontal: spacing.md,
    },
    footer: {
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.md,
        paddingBottom: spacing.lg,
    },
    buttonContainer: {
        marginTop: spacing.lg,
    },
    mainButton: {
        width: '100%',
        backgroundColor: palette.brand.primary,
    }
});