import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { palette, radius, spacing, typography } from '@/src/design-system';
import { Button } from './Button';

interface SimulationLimitModalProps {
    visible: boolean;
    onClose: () => void;
    onSubscribe: () => void;
    limit?: number;
}

export function SimulationLimitModal({ visible, onClose, onSubscribe, limit = 5 }: SimulationLimitModalProps) {
    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onClose}
        >
            <Animated.View 
                entering={FadeIn.duration(300)} 
                style={styles.overlay}
            >
                <TouchableOpacity 
                    activeOpacity={1} 
                    style={styles.backdrop} 
                    onPress={onClose} 
                />
                
                <Animated.View 
                    entering={SlideInUp.springify().damping(15)} 
                    style={styles.modalContent}
                >
                    <View style={styles.iconContainer}>
                        <Ionicons name="sparkles" size={40} color={palette.brand.primary} />
                    </View>

                    <ThemedText style={styles.title}>Limit Reached</ThemedText>
                    <ThemedText style={styles.message}>
                        You have reached your simulation limit ({limit}). Upgrade to Premium to unlock unlimited simulations and deeper financial insights.
                    </ThemedText>

                    <View style={styles.buttonContainer}>
                        <Button 
                            label="Subscribe Now" 
                            onPress={onSubscribe}
                            style={styles.subscribeButton}
                        />
                        <TouchableOpacity onPress={onClose} style={styles.notNowButton}>
                            <ThemedText style={styles.notNowText}>Not Now</ThemedText>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.6)', // Semi-transparent dark overlay
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    modalContent: {
        width: '85%',
        backgroundColor: palette.neutral.white,
        borderRadius: radius.xl,
        padding: spacing.xl,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 10,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: palette.brand.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        ...typography.h3,
        color: palette.neutral.gray900,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    message: {
        ...typography.bodyRegular,
        color: palette.neutral.gray600,
        textAlign: 'center',
        marginBottom: spacing.xl,
        lineHeight: 22,
    },
    buttonContainer: {
        width: '100%',
        gap: spacing.md,
    },
    subscribeButton: {
        width: '100%',
    },
    notNowButton: {
        paddingVertical: spacing.sm,
        alignItems: 'center',
    },
    notNowText: {
        fontSize: 14,
        color: palette.neutral.gray400,
        fontWeight: '600',
    },
});
