import { palette } from '@/src/design-system';
import { confirmAccountDeletion, requestAccountDeletion } from '@/src/features/auth/authSlice';
import { AppDispatch, RootState } from '@/src/store/store';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { Component, createRef } from 'react';
import {
    Animated,
    Easing,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

// ─── Types ───────────────────────────────────────────────────────────────────
interface AccountDeletionState {
    otp: string[];
    countdown: number;
    canResend: boolean;
    error: string | null;
    deleting: boolean;
}

const OTP_LENGTH = 6;
const COUNTDOWN_START = 54;

// ─── Main Screen ──────────────────────────────────────────────────────────────
interface AccountDeletionProps {
    email?: string;
    onRequestOtp: (email: string) => Promise<void>;
    onConfirmDelete: (email: string, otp: string) => Promise<void>;
    loading: boolean;
}

class AccountDeletionInner extends Component<AccountDeletionProps, AccountDeletionState> {
    private inputRefs: React.RefObject<TextInput | null>[] = Array.from({ length: OTP_LENGTH }, () =>
        createRef<TextInput>()
    );

    // Entry anims
    private headerAnim = new Animated.Value(0);
    private textAnim = new Animated.Value(0);
    private otpAnim = new Animated.Value(0);
    private bottomAnim = new Animated.Value(0);

    // OTP box individual scales (pop on fill)
    private boxScales: Animated.Value[] = Array.from({ length: OTP_LENGTH }, () => new Animated.Value(1));

    // Shake for error
    private shakeAnim = new Animated.Value(0);

    // Delete button press
    private btnPressAnim = new Animated.Value(1);

    // Timer ref
    private timer: ReturnType<typeof setInterval> | null = null;

    constructor(props: AccountDeletionProps) {
        super(props);
        this.state = {
            otp: Array(OTP_LENGTH).fill(''),
            countdown: COUNTDOWN_START,
            canResend: false,
            error: null,
            deleting: false,
        };
    }

    componentDidMount(): void {
        // Staggered entry
        Animated.stagger(100, [
            Animated.timing(this.headerAnim, {
                toValue: 1, duration: 400,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(this.textAnim, {
                toValue: 1, duration: 400,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(this.otpAnim, {
                toValue: 1, duration: 400,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(this.bottomAnim, {
                toValue: 1, duration: 400,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
        ]).start();

        if (this.props.email) {
            this.props.onRequestOtp(this.props.email).catch(e => {
                this.setState({ error: e.message || 'Failed to send OTP' });
            });
        }

        this.startCountdown();
    }

    componentWillUnmount(): void {
        if (this.timer) clearInterval(this.timer);
    }

    private startCountdown = (): void => {
        if (this.timer) clearInterval(this.timer);
        this.setState({ countdown: COUNTDOWN_START, canResend: false });
        this.timer = setInterval(() => {
            this.setState((prev) => {
                if (prev.countdown <= 1) {
                    clearInterval(this.timer!);
                    return { countdown: 0, canResend: true };
                }
                return { countdown: prev.countdown - 1, canResend: false };
            });
        }, 1000);
    };

    private onResend = (): void => {
        if (!this.state.canResend) return;
        this.setState({ otp: Array(OTP_LENGTH).fill(''), error: null });
        this.inputRefs[0].current?.focus();

        if (this.props.email) {
            this.props.onRequestOtp(this.props.email).catch(e => {
                this.setState({ error: e.message || 'Failed to send OTP' });
            });
        }

        this.startCountdown();
    };

    // OTP box pop animation
    private popBox = (index: number): void => {
        Animated.sequence([
            Animated.timing(this.boxScales[index], {
                toValue: 1.18, duration: 80,
                useNativeDriver: true,
            }),
            Animated.spring(this.boxScales[index], {
                toValue: 1, friction: 4, tension: 200,
                useNativeDriver: true,
            }),
        ]).start();
    };

    private onOtpChange = (text: string, index: number): void => {
        const digit = text.replace(/[^0-9]/g, '').slice(-1);
        const newOtp = [...this.state.otp];
        newOtp[index] = digit;
        this.setState({ otp: newOtp, error: null });

        if (digit) {
            this.popBox(index);
            if (index < OTP_LENGTH - 1) {
                this.inputRefs[index + 1].current?.focus();
            }
        }
    };

    private onKeyPress = (e: any, index: number): void => {
        if (e.nativeEvent.key === 'Backspace' && !this.state.otp[index] && index > 0) {
            const newOtp = [...this.state.otp];
            newOtp[index - 1] = '';
            this.setState({ otp: newOtp });
            this.inputRefs[index - 1].current?.focus();
        }
    };

    private shake = (): void => {
        this.shakeAnim.setValue(0);
        Animated.sequence([
            Animated.timing(this.shakeAnim, { toValue: 10, duration: 55, useNativeDriver: true }),
            Animated.timing(this.shakeAnim, { toValue: -10, duration: 55, useNativeDriver: true }),
            Animated.timing(this.shakeAnim, { toValue: 7, duration: 55, useNativeDriver: true }),
            Animated.timing(this.shakeAnim, { toValue: -7, duration: 55, useNativeDriver: true }),
            Animated.timing(this.shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
        ]).start();
    };

    private onDeletePress = (): void => {
        const { otp, deleting } = this.state;
        if (deleting) return;

        const filled = otp.every((d) => d !== '');
        if (!filled) {
            this.setState({ error: 'To Delete your account please enter your OTP' });
            this.shake();
            return;
        }

        this.setState({ error: null, deleting: true });

        Animated.sequence([
            Animated.timing(this.btnPressAnim, {
                toValue: 0.96, duration: 80, useNativeDriver: true,
            }),
            Animated.spring(this.btnPressAnim, {
                toValue: 1, friction: 4, tension: 120, useNativeDriver: true,
            }),
        ]).start(() => {
            if (this.props.email) {
                this.props.onConfirmDelete(this.props.email, otp.join(''))
                    .then(() => {
                        this.setState({ deleting: false, error: null });
                        // The wrapper will likely push to Login
                    })
                    .catch((err) => {
                        this.setState({ deleting: false, error: err.message || 'Failed to delete account' });
                        this.shake();
                    });
            } else {
                this.setState({ deleting: false, error: 'No email found' });
            }
        });
    };

    render(): React.ReactNode {
        const { otp, countdown, canResend, error, deleting } = this.state;
        const router = useRouter();

        const makeSlide = (anim: Animated.Value, dir: 'up' | 'down' = 'down') => ({
            opacity: anim,
            transform: [{
                translateY: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [dir === 'down' ? -14 : 14, 0],
                }),
            }],
        });

        return (
            <View style={styles.screen}>
                <View style={styles.statusBar} />

                {/* ── Header ── */}
                <Animated.View style={[styles.header, makeSlide(this.headerAnim)]}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={22} color={palette.neutral.black} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Account Deletion</Text>
                    <View style={{ width: 36 }} />
                </Animated.View>

                <View style={styles.content}>
                    {/* ── Warning Text ── */}
                    <Animated.Text style={[styles.warningText, makeSlide(this.textAnim, 'up')]}>
                        Deleting your account is permanent. All your data will be removed and cannot be recovered
                    </Animated.Text>

                    {/* ── OTP Boxes ── */}
                    <Animated.View
                        style={[
                            styles.otpRow,
                            {
                                opacity: this.otpAnim,
                                transform: [
                                    { translateY: this.otpAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
                                    { translateX: this.shakeAnim },
                                ],
                            },
                        ]}
                    >
                        {otp.map((digit, i) => (
                            <Animated.View
                                key={i}
                                style={[
                                    styles.otpBox,
                                    digit ? styles.otpBoxFilled : null,
                                    { transform: [{ scale: this.boxScales[i] }] },
                                ]}
                            >
                                <TextInput
                                    ref={this.inputRefs[i]}
                                    style={styles.otpInput}
                                    value={digit}
                                    maxLength={1}
                                    keyboardType="number-pad"
                                    onChangeText={(t) => this.onOtpChange(t, i)}
                                    onKeyPress={(e) => this.onKeyPress(e, i)}
                                    caretHidden
                                    textAlign="center"
                                />
                            </Animated.View>
                        ))}
                    </Animated.View>

                    {/* ── Countdown / Resend ── */}
                    <Animated.View style={[styles.resendRow, makeSlide(this.bottomAnim, 'up')]}>
                        {canResend ? (
                            <TouchableOpacity onPress={this.onResend}>
                                <Text style={styles.resendActive}>Resend OTP</Text>
                            </TouchableOpacity>
                        ) : (
                            <Text style={styles.resendTimer}>
                                Resend in{' '}
                                <Text style={styles.resendTimerBold}>{countdown} seconds</Text>
                            </Text>
                        )}
                    </Animated.View>

                    {/* ── Error ── */}
                    {error ? (
                        <View style={styles.errorRow}>
                            <View style={styles.errorDot} />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    {/* ── Delete Button ── */}
                    <Animated.View
                        style={[
                            styles.btnWrapper,
                            makeSlide(this.bottomAnim, 'up'),
                            { transform: [{ scale: this.btnPressAnim }] },
                        ]}
                    >
                        <TouchableOpacity
                            style={[styles.deleteBtn, (deleting || this.props.loading) && styles.deleteBtnDisabled]}
                            activeOpacity={0.85}
                            onPress={this.onDeletePress}
                            disabled={deleting || this.props.loading}
                        >
                            <Text style={styles.deleteBtnText}>
                                {deleting || this.props.loading ? 'Deleting...' : 'Delete'}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
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

    // ── Content ───────────────────────────────────────────────────────────────
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 28,
    },
    warningText: {
        fontSize: 14,
        color: '#444444',
        lineHeight: 21,
        marginBottom: 32,
        letterSpacing: 0.1,
    },

    // ── OTP ───────────────────────────────────────────────────────────────────
    otpRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    otpBox: {
        width: 46,
        height: 52,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#E0E0E0',
        backgroundColor: '#F8F9FA',
        alignItems: 'center',
        justifyContent: 'center',
    },
    otpBoxFilled: {
        borderColor: '#1A2340',
        backgroundColor: '#FFFFFF',
    },
    otpInput: {
        width: '100%',
        height: '100%',
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1A1A',
        textAlign: 'center',
    },

    // ── Resend ────────────────────────────────────────────────────────────────
    resendRow: {
        alignItems: 'center',
        marginBottom: 16,
    },
    resendTimer: {
        fontSize: 13,
        color: '#999999',
    },
    resendTimerBold: {
        color: '#555555',
        fontWeight: '600',
    },
    resendActive: {
        fontSize: 14,
        color: '#1A2340',
        fontWeight: '600',
        textDecorationLine: 'underline',
    },

    // ── Error ─────────────────────────────────────────────────────────────────
    errorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        gap: 6,
    },
    errorDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF3B3B',
    },
    errorText: {
        fontSize: 13,
        color: '#FF3B3B',
        flex: 1,
        lineHeight: 18,
    },

    // ── Delete Button ─────────────────────────────────────────────────────────
    btnWrapper: {
        marginTop: 8,
    },
    deleteBtn: {
        height: 54,
        borderRadius: 14,
        backgroundColor: '#FF3B3B',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#FF3B3B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    deleteBtnDisabled: {
        backgroundColor: '#FF8080',
    },
    deleteBtnText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
});

export default function AccountDeletion() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const { loading, user } = useSelector((state: RootState) => state.auth);

    const handleRequestOtp = async (email: string) => {
        await dispatch(requestAccountDeletion({ email })).unwrap();
    };

    const handleConfirmDelete = async (email: string, otp: string) => {
        await dispatch(confirmAccountDeletion({ email, otp })).unwrap();
        // Redirect to login upon successful deletion
        router.replace('/auth/login');
    };

    return (
        <AccountDeletionInner
            email={user?.email}
            onRequestOtp={handleRequestOtp}
            onConfirmDelete={handleConfirmDelete}
            loading={loading}
        />
    );
}
