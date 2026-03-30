import { palette } from '@/src/design-system';
import { submitContact } from '@/src/features/profile/profileSlice';
import { AppDispatch, RootState } from '@/src/store/store';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { Component } from 'react';
import {
    Animated,
    Easing,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

// ─── Types ───────────────────────────────────────────────────────────────────
interface AnimatedInputProps {
    label: string;
    value: string;
    placeholder: string;
    delay?: number;
    keyboardType?: 'default' | 'email-address';
    multiline?: boolean;
    onChangeText: (text: string) => void;
}

interface ContactState {
    fullName: string;
    email: string;
    description: string;
    sending: boolean;
    sent: boolean;
    error: string | null;
}

// ─── Animated Field ───────────────────────────────────────────────────────────
class AnimatedField extends Component<AnimatedInputProps> {
    private focusAnim = new Animated.Value(0);
    private slideAnim = new Animated.Value(0);
    private opacityAnim = new Animated.Value(0);

    componentDidMount(): void {
        const delay = this.props.delay ?? 0;
        Animated.parallel([
            Animated.timing(this.slideAnim, {
                toValue: 1,
                duration: 480,
                delay,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(this.opacityAnim, {
                toValue: 1,
                duration: 480,
                delay,
                useNativeDriver: true,
            }),
        ]).start();
    }

    private onFocus = () => {
        Animated.timing(this.focusAnim, {
            toValue: 1, duration: 220, useNativeDriver: false,
        }).start();
    };

    private onBlur = () => {
        Animated.timing(this.focusAnim, {
            toValue: 0, duration: 220, useNativeDriver: false,
        }).start();
    };

    render(): React.ReactNode {
        const { label, value, placeholder, keyboardType = 'default', multiline = false, onChangeText } = this.props;

        const borderColor = this.focusAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['#E8E8E8', '#1A2340'],
        });
        const bgColor = this.focusAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['#F8F9FA', '#FFFFFF'],
        });
        const translateY = this.slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0],
        });

        return (
            <Animated.View
                style={[
                    styles.fieldGroup,
                    { opacity: this.opacityAnim, transform: [{ translateY }] },
                ]}
            >
                <Text style={styles.label}>{label}</Text>
                <Animated.View
                    style={[
                        styles.inputWrapper,
                        multiline && styles.textAreaWrapper,
                        { borderColor, backgroundColor: bgColor },
                    ]}
                >
                    <TextInput
                        style={[styles.input, multiline && styles.textArea]}
                        value={value}
                        placeholder={placeholder}
                        placeholderTextColor="#B8B8B8"
                        keyboardType={keyboardType}
                        multiline={multiline}
                        textAlignVertical={multiline ? 'top' : 'center'}
                        onFocus={this.onFocus}
                        onBlur={this.onBlur}
                        onChangeText={onChangeText}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </Animated.View>
            </Animated.View>
        );
    }
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
interface ContactSupportProps {
    initialProfile?: any;
    user?: any;
    onSubmit: (payload: { fullName: string; email: string; description: string }) => Promise<void>;
    loading: boolean;
}

class ContactSupportInner extends Component<ContactSupportProps, ContactState> {
    // Entry anims
    private headerAnim = new Animated.Value(0);
    private saveAnim = new Animated.Value(0);
    private savePressAnim = new Animated.Value(1);

    // Send button spinner
    private spinAnim = new Animated.Value(0);
    private spinLoop: Animated.CompositeAnimation | null = null;

    // Success checkmark scale
    private checkScale = new Animated.Value(0);

    // Shake for error
    private shakeAnim = new Animated.Value(0);

    constructor(props: ContactSupportProps) {
        super(props);
        const { initialProfile, user } = props;
        this.state = {
            fullName: initialProfile?.fullName || user?.name || '',
            email: initialProfile?.email || user?.email || '',
            description: '',
            sending: false,
            sent: false,
            error: null,
        };
    }

    componentDidMount(): void {
        Animated.timing(this.headerAnim, {
            toValue: 1, duration: 450,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start();

        Animated.timing(this.saveAnim, {
            toValue: 1, duration: 450, delay: 700,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start();
    }

    private shake = (): void => {
        this.shakeAnim.setValue(0);
        Animated.sequence([
            Animated.timing(this.shakeAnim, { toValue: 9, duration: 55, useNativeDriver: true }),
            Animated.timing(this.shakeAnim, { toValue: -9, duration: 55, useNativeDriver: true }),
            Animated.timing(this.shakeAnim, { toValue: 6, duration: 55, useNativeDriver: true }),
            Animated.timing(this.shakeAnim, { toValue: -6, duration: 55, useNativeDriver: true }),
            Animated.timing(this.shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
        ]).start();
    };

    private startSpinner = (): void => {
        this.spinAnim.setValue(0);
        this.spinLoop = Animated.loop(
            Animated.timing(this.spinAnim, {
                toValue: 1, duration: 800,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );
        this.spinLoop.start();
    };

    private stopSpinner = (): void => {
        this.spinLoop?.stop();
    };

    private showCheck = (): void => {
        Animated.spring(this.checkScale, {
            toValue: 1,
            friction: 4,
            tension: 120,
            useNativeDriver: true,
        }).start();
    };

    private onSendPress = (): void => {
        const { fullName, email, description, sending } = this.state;
        if (sending) return;

        if (!fullName.trim() || !email.trim() || !description.trim()) {
            this.setState({ error: 'Please fill in all fields.' });
            this.shake();
            return;
        }
        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!emailValid) {
            this.setState({ error: 'Please enter a valid email address.' });
            this.shake();
            return;
        }

        this.setState({ error: null, sending: true });

        // Press squish
        Animated.sequence([
            Animated.timing(this.savePressAnim, {
                toValue: 0.96, duration: 80, useNativeDriver: true,
            }),
            Animated.spring(this.savePressAnim, {
                toValue: 1, friction: 4, tension: 120, useNativeDriver: true,
            }),
        ]).start();

        this.startSpinner();

        // Submit to API via Redux
        this.props.onSubmit({ fullName, email, description })
            .then(() => {
                this.stopSpinner();
                this.setState({ sending: false, sent: true });
                this.showCheck();
                setTimeout(() => {
                    this.setState({ sent: false, fullName: '', email: '', description: '' });
                }, 3000);
            })
            .catch((err) => {
                this.stopSpinner();
                this.setState({ sending: false, error: err.message || "Failed to send message." });
                this.shake();
            });
    };

    render(): React.ReactNode {
        const { fullName, email, description, sending, sent, error } = this.state;
        const router = useRouter();

        const headerTranslate = this.headerAnim.interpolate({
            inputRange: [0, 1], outputRange: [-16, 0],
        });
        const saveTranslate = this.saveAnim.interpolate({
            inputRange: [0, 1], outputRange: [20, 0],
        });
        const spin = this.spinAnim.interpolate({
            inputRange: [0, 1], outputRange: ['0deg', '360deg'],
        });

        return (
            <KeyboardAvoidingView
                style={styles.screen}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
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
                    <Text style={styles.headerTitle}>Contact & Support</Text>
                    <View style={{ width: 36 }} />
                </Animated.View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* ── Form ── */}
                    <View style={styles.form}>
                        <AnimatedField
                            label="Full Name"
                            value={fullName}
                            placeholder="e.g. John Doe"
                            delay={180}
                            onChangeText={(t) => this.setState({ fullName: t, error: null })}
                        />
                        <AnimatedField
                            label="Email"
                            value={email}
                            placeholder="e.g. John@gmail.com"
                            keyboardType="email-address"
                            delay={300}
                            onChangeText={(t) => this.setState({ email: t, error: null })}
                        />
                        <AnimatedField
                            label="Description"
                            value={description}
                            placeholder=""
                            multiline
                            delay={420}
                            onChangeText={(t) => this.setState({ description: t, error: null })}
                        />

                        {/* Error */}
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

                        {/* Success */}
                        {sent ? (
                            <Animated.View
                                style={[styles.successBox, { transform: [{ scale: this.checkScale }] }]}
                            >
                                <Ionicons name="checkmark-circle" size={22} color="#2ECC71" />
                                <Text style={styles.successText}>Message sent successfully!</Text>
                            </Animated.View>
                        ) : null}
                    </View>
                </ScrollView>

                {/* ── Send Button fixed bottom ── */}
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
                        style={[styles.saveBtn, sent && styles.saveBtnSuccess]}
                        activeOpacity={0.9}
                        onPress={this.onSendPress}
                        disabled={sent || this.props.loading}
                    >
                        {sending ? (
                            <Animated.View style={{ transform: [{ rotate: spin }] }}>
                                <Ionicons name="reload-outline" size={22} color="#fff" />
                            </Animated.View>
                        ) : sent ? (
                            <View style={styles.sentRow}>
                                <Ionicons name="checkmark" size={20} color="#fff" />
                                <Text style={[styles.saveBtnText, { marginLeft: 8 }]}>Sent!</Text>
                            </View>
                        ) : (
                            <Text style={styles.saveBtnText}>Send</Text>
                        )}
                    </TouchableOpacity>
                </Animated.View>
            </KeyboardAvoidingView>
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
        borderWidth: 1.5,
        borderRadius: 10,
        paddingHorizontal: 16,
        height: 52,
        justifyContent: 'center',
    },
    textAreaWrapper: {
        height: 160,
        paddingVertical: 14,
        justifyContent: 'flex-start',
    },
    input: {
        fontSize: 15,
        color: '#1A1A1A',
        paddingVertical: 0,
    },
    textArea: {
        height: 130,
        fontSize: 15,
        color: '#1A1A1A',
    },

    // ── Messages ──────────────────────────────────────────────────────────────
    errorText: {
        fontSize: 13,
        color: '#E74C3C',
        marginTop: 2,
        marginLeft: 2,
    },
    successBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0FDF6',
        borderRadius: 10,
        padding: 12,
        marginTop: 4,
        gap: 8,
    },
    successText: {
        fontSize: 14,
        color: '#2ECC71',
        fontWeight: '500',
    },

    // ── Send Button ───────────────────────────────────────────────────────────
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
    saveBtnSuccess: {
        backgroundColor: '#2ECC71',
    },
    sentRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    saveBtnText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
});

export default function ContactSupport() {
    const dispatch = useDispatch<AppDispatch>();
    const { profile, loading } = useSelector((state: RootState) => state.profile);
    const { user } = useSelector((state: RootState) => state.auth);

    const handleSubmit = async (payload: { fullName: string; email: string; description: string }) => {
        await dispatch(submitContact(payload)).unwrap();
    };

    return (
        <ContactSupportInner
            initialProfile={profile}
            user={user}
            onSubmit={handleSubmit}
            loading={loading}
        />
    );
}
