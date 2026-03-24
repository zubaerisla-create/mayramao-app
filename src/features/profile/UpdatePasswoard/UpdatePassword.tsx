import { palette } from '@/src/design-system';
import { changePassword } from '@/src/features/auth/authSlice';
import { AppDispatch, RootState } from '@/src/store/store';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { Component } from 'react';
import {
    Animated,
    Easing,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

// ─── Types ───────────────────────────────────────────────────────────────────
interface PasswordInputProps {
    label: string;
    value: string;
    placeholder?: string;
    delay?: number;
    onChangeText: (text: string) => void;
}

interface PasswordInputState {
    secure: boolean;
}

interface UpdatePasswordState {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    error: string | null;
    success: boolean;
}

// ─── Password Input Field ─────────────────────────────────────────────────────
class PasswordInput extends Component<PasswordInputProps, PasswordInputState> {
    private focusAnim = new Animated.Value(0);
    private slideAnim = new Animated.Value(0);
    private opacityAnim = new Animated.Value(0);

    constructor(props: PasswordInputProps) {
        super(props);
        this.state = { secure: true };
    }

    componentDidMount(): void {
        const delay = this.props.delay ?? 0;
        Animated.parallel([
            Animated.timing(this.slideAnim, {
                toValue: 1,
                duration: 420,
                delay,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(this.opacityAnim, {
                toValue: 1,
                duration: 420,
                delay,
                useNativeDriver: true,
            }),
        ]).start();
    }

    private onFocus = () => {
        Animated.timing(this.focusAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
        }).start();
    };

    private onBlur = () => {
        Animated.timing(this.focusAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    };

    render(): React.ReactNode {
        const { label, value, placeholder = '••••••••••••', onChangeText } = this.props;
        const { secure } = this.state;

        const borderColor = this.focusAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['#E8E8E8', '#1A2340'],
        });

        const translateY = this.slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [18, 0],
        });

        return (
            <Animated.View
                style={[
                    styles.fieldGroup,
                    { opacity: this.opacityAnim, transform: [{ translateY }] },
                ]}
            >
                <Text style={styles.label}>{label}</Text>
                <Animated.View style={[styles.inputWrapper, { borderColor }]}>
                    <TextInput
                        style={styles.input}
                        value={value}
                        placeholder={placeholder}
                        placeholderTextColor="#C0C0C0"
                        secureTextEntry={secure}
                        onFocus={this.onFocus}
                        onBlur={this.onBlur}
                        onChangeText={onChangeText}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <TouchableOpacity
                        onPress={() => this.setState({ secure: !secure })}
                        style={styles.eyeBtn}
                    >
                        <Ionicons
                            name={secure ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color="#AAAAAA"
                        />
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>
        );
    }
}

// ─── Main UpdatePassword Screen ───────────────────────────────────────────────
interface UpdatePasswordProps {
    onSubmit: (payload: any) => Promise<void>;
    loading: boolean;
}

class UpdatePasswordInner extends Component<UpdatePasswordProps, UpdatePasswordState> {
    private headerAnim = new Animated.Value(0);
    private titleAnim = new Animated.Value(0);
    private saveAnim = new Animated.Value(0);
    private savePressAnim = new Animated.Value(1);
    private shakeAnim = new Animated.Value(0);

    constructor(props: UpdatePasswordProps) {
        super(props);
        this.state = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
            error: null,
            success: false,
        };
    }

    componentDidMount(): void {
        Animated.stagger(120, [
            Animated.timing(this.headerAnim, {
                toValue: 1,
                duration: 400,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(this.titleAnim, {
                toValue: 1,
                duration: 400,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
        ]).start();

        Animated.timing(this.saveAnim, {
            toValue: 1,
            duration: 400,
            delay: 700,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start();
    }

    // Shake animation for error
    private shake = (): void => {
        this.shakeAnim.setValue(0);
        Animated.sequence([
            Animated.timing(this.shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
            Animated.timing(this.shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
            Animated.timing(this.shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
            Animated.timing(this.shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
            Animated.timing(this.shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
        ]).start();
    };

    private onSavePress = (): void => {
        const { currentPassword, newPassword, confirmPassword } = this.state;

        if (!currentPassword || !newPassword || !confirmPassword) {
            this.setState({ error: 'All fields are required.', success: false });
            this.shake();
            return;
        }
        if (newPassword.length < 6) {
            this.setState({ error: 'New password must be at least 6 characters.', success: false });
            this.shake();
            return;
        }
        if (newPassword !== confirmPassword) {
            this.setState({ error: 'Passwords do not match.', success: false });
            this.shake();
            return;
        }

        this.setState({ error: null, success: false });

        // Save press animation
        Animated.sequence([
            Animated.timing(this.savePressAnim, {
                toValue: 0.96,
                duration: 80,
                useNativeDriver: true,
            }),
            Animated.spring(this.savePressAnim, {
                toValue: 1,
                friction: 4,
                tension: 120,
                useNativeDriver: true,
            }),
        ]).start(() => {
            this.props.onSubmit({ currentPassword, newPassword, confirmPassword })
                .then(() => {
                    this.setState({ success: true, currentPassword: '', newPassword: '', confirmPassword: '' });
                    setTimeout(() => this.setState({ success: false }), 4000);
                })
                .catch((err) => {
                    this.setState({ error: err.message || 'Failed to change password', success: false });
                    this.shake();
                });
        });
    };

    render(): React.ReactNode {
        const { currentPassword, newPassword, confirmPassword, error, success } = this.state;
        const router = useRouter();

        const headerTranslate = this.headerAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-16, 0],
        });
        const titleTranslate = this.titleAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [16, 0],
        });
        const saveTranslate = this.saveAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0],
        });

        return (
            <View style={styles.screen}>
                <View style={styles.statusBar} />

                {/* ── Header ── */}
                <Animated.View
                    style={[
                        styles.header,
                        {
                            opacity: this.headerAnim,
                            transform: [{ translateY: headerTranslate }],
                        },
                    ]}
                >
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={22} color={palette.neutral.black} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Update password</Text>
                    <View style={{ width: 36 }} />
                </Animated.View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* ── Title ── */}
                    <Animated.View
                        style={[
                            styles.titleBlock,
                            {
                                opacity: this.titleAnim,
                                transform: [{ translateY: titleTranslate }],
                            },
                        ]}
                    >
                        <Text style={styles.title}>Update Your Password</Text>
                        <Text style={styles.subtitle}>Change your current password</Text>
                    </Animated.View>

                    {/* ── Fields ── */}
                    <View style={styles.form}>
                        <PasswordInput
                            label="Current Password"
                            value={currentPassword}
                            delay={200}
                            onChangeText={(t) => this.setState({ currentPassword: t, error: null })}
                        />
                        <PasswordInput
                            label="New password"
                            value={newPassword}
                            placeholder=""
                            delay={320}
                            onChangeText={(t) => this.setState({ newPassword: t, error: null })}
                        />
                        <PasswordInput
                            label="Confirm New Password"
                            value={confirmPassword}
                            placeholder=""
                            delay={440}
                            onChangeText={(t) => this.setState({ confirmPassword: t, error: null })}
                        />

                        {/* Error message */}
                        {error ? (
                            <Animated.Text
                                style={[
                                    styles.errorText,
                                    { transform: [{ translateX: this.shakeAnim }] },
                                ]}
                            >
                                ⚠ {error}
                            </Animated.Text>
                        ) : null}

                        {/* Success message */}
                        {success ? (
                            <Text style={styles.successText}>✓ Password updated successfully!</Text>
                        ) : null}
                    </View>
                </ScrollView>

                {/* ── Save Button (fixed bottom) ── */}
                <Animated.View
                    style={[
                        styles.saveWrapper,
                        {
                            opacity: this.saveAnim,
                            transform: [
                                { translateY: saveTranslate },
                                { scale: this.savePressAnim },
                            ],
                        },
                    ]}
                >
                    <TouchableOpacity
                        style={styles.saveBtn}
                        activeOpacity={0.9}
                        onPress={this.onSavePress}
                        disabled={this.props.loading}
                    >
                        <Text style={styles.saveBtnText}>{this.props.loading ? "Saving..." : "Save"}</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        );
    }
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    statusBar: {
        height: 44,
        backgroundColor: '#FFFFFF',
    },

    // ── Header ───────────────────────────────────────────────────────────────
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A1A1A',
        letterSpacing: 0.3,
    },

    // ── Title Block ───────────────────────────────────────────────────────────
    titleBlock: {
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 8,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 6,
        letterSpacing: 0.2,
    },
    subtitle: {
        fontSize: 13,
        color: '#AAAAAA',
        letterSpacing: 0.1,
    },

    // ── Form ─────────────────────────────────────────────────────────────────
    scrollContent: {
        paddingBottom: 120,
    },
    form: {
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    fieldGroup: {
        marginBottom: 22,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1A1A1A',
        marginBottom: 8,
        letterSpacing: 0.1,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: 10,
        backgroundColor: '#F8F9FA',
        paddingHorizontal: 16,
        height: 52,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#1A1A1A',
        paddingVertical: 0,
        letterSpacing: 1,
    },
    eyeBtn: {
        padding: 4,
        marginLeft: 8,
    },

    // ── Messages ──────────────────────────────────────────────────────────────
    errorText: {
        fontSize: 13,
        color: '#E74C3C',
        marginTop: 4,
        marginLeft: 2,
    },
    successText: {
        fontSize: 13,
        color: '#2ECC71',
        marginTop: 4,
        marginLeft: 2,
        fontWeight: '500',
    },

    // ── Save Button ───────────────────────────────────────────────────────────
    saveWrapper: {
        position: 'absolute',
        bottom: 32,
        left: 24,
        right: 24,
    },
    saveBtn: {
        height: 54,
        borderRadius: 14,
        backgroundColor: '#1A2340',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#1A2340',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 6,
    },
    saveBtnText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
});

export default function UpdatePassword() {
    const dispatch = useDispatch<AppDispatch>();
    const { loading } = useSelector((state: RootState) => state.auth); // changePassword comes from auth state

    const handleSubmit = async (payload: any) => {
        await dispatch(changePassword(payload)).unwrap();
    };

    return (
        <UpdatePasswordInner
            onSubmit={handleSubmit}
            loading={loading}
        />
    );
}
