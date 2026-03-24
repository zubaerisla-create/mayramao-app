import { palette, radius, spacing, typography } from '@/src/design-system';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';

interface OTPInputProps {
    length?: number;
    onCodeFilled?: (code: string) => void;
}

export function OTPInput({ length = 6, onCodeFilled }: OTPInputProps) {
    const [code, setCode] = useState('');
    const inputRef = useRef<TextInput>(null);
    const [containerIsFocused, setContainerIsFocused] = useState(false);

    const codeDigitsArray = new Array(length).fill(0);

    const handlePress = () => {
        setContainerIsFocused(true);
        inputRef.current?.focus();
    };

    const handleBlur = () => {
        setContainerIsFocused(false);
    };

    useEffect(() => {
        if (code.length === length) {
            onCodeFilled?.(code);
            handleBlur();
        }
    }, [code]);

    return (
        <View style={styles.container}>
            <Pressable style={styles.inputsContainer} onPress={handlePress}>
                {codeDigitsArray.map((_, index) => {
                    const digit = code[index];
                    const isFocused = containerIsFocused && index === code.length;

                    return (
                        <Animated.View
                            key={index}
                            style={[
                                styles.digitContainer,
                                digit && styles.digitContainerFilled,
                                isFocused && styles.digitContainerFocused
                            ]}
                        >
                            <Text style={styles.digitText}>
                                {digit || ''}
                            </Text>
                        </Animated.View>
                    );
                })}
            </Pressable>

            <TextInput
                ref={inputRef}
                value={code}
                onChangeText={(text) => setCode(text.replace(/[^0-9]/g, ''))}
                maxLength={length}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                style={styles.hiddenInput}
                onBlur={handleBlur}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: spacing.xl,
    },
    inputsContainer: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    hiddenInput: {
        position: 'absolute',
        width: 1,
        height: 1,
        opacity: 0,
    },
    digitContainer: {
        width: 45,
        height: 55,
        borderWidth: 1,
        borderColor: palette.neutral.gray200,
        borderRadius: radius.md,
        backgroundColor: palette.neutral.gray50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    digitContainerFilled: {
        borderColor: palette.brand.primary,
        backgroundColor: palette.neutral.white,
    },
    digitContainerFocused: {
        borderColor: palette.brand.secondary,
        borderWidth: 1.5,
        backgroundColor: palette.neutral.white,
    },
    digitText: {
        ...typography.h3,
        color: palette.neutral.gray900,
    }
});
