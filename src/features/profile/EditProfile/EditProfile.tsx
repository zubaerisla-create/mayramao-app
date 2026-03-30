import { palette } from '@/src/design-system';
import { updateProfile } from '@/src/features/profile/profileSlice';
import { AppDispatch, RootState } from '@/src/store/store';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { Component } from 'react';
import {
    Animated,
    Easing,
    Image,
    Modal,
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
    rightIcon?: React.ReactNode;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    editable?: boolean;
    delay?: number;
    onChangeText?: (text: string) => void;
    onPressRight?: () => void;
}

interface EditProfileState {
    fullName: string;
    email: string;
    dob: string;
    gender: string;
    photoUri: string | null;
    genderModalVisible: boolean;
    showDatePicker: boolean;
    dateObj: Date;
}

// ─── Animated Input Field ────────────────────────────────────────────────────
class AnimatedInput extends Component<AnimatedInputProps> {
    private focusAnim = new Animated.Value(0);
    private slideAnim = new Animated.Value(0);
    private opacityAnim = new Animated.Value(0);

    componentDidMount(): void {
        const delay = this.props.delay ?? 0;
        Animated.parallel([
            Animated.timing(this.slideAnim, {
                toValue: 1,
                duration: 400,
                delay,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(this.opacityAnim, {
                toValue: 1,
                duration: 400,
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
        const {
            label, value, placeholder, rightIcon,
            keyboardType = 'default', editable = true,
            onChangeText, onPressRight,
        } = this.props;

        const borderColor = this.focusAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['#E8E8E8', '#2ECC71'],
        });

        const translateY = this.slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [15, 0],
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
                        placeholderTextColor="#B0B0B0"
                        keyboardType={keyboardType}
                        editable={editable}
                        onFocus={this.onFocus}
                        onBlur={this.onBlur}
                        onChangeText={onChangeText}
                    />
                    {rightIcon ? (
                        <TouchableOpacity onPress={onPressRight}>
                            {rightIcon}
                        </TouchableOpacity>
                    ) : null}
                </Animated.View>
            </Animated.View>
        );
    }
}

// ─── Main EditProfile Screen ──────────────────────────────────────────────────
interface EditProfileProps {
    initialProfile: any;
    user: any;
    onSave: (formData: FormData) => Promise<void>;
    loading: boolean;
}

class EditProfileInner extends Component<EditProfileProps, EditProfileState> {
    private avatarScale = new Animated.Value(0.8);
    private avatarOpacity = new Animated.Value(0);
    private headerAnim = new Animated.Value(0);
    private saveAnim = new Animated.Value(0);
    private savePressAnim = new Animated.Value(1);

    constructor(props: EditProfileProps) {
        super(props);
        const { initialProfile, user } = props;
        const initialDateObj = initialProfile?.dateOfBirth ? new Date(initialProfile.dateOfBirth) : new Date();

        this.state = {
            fullName: initialProfile?.fullName || user?.name || '',
            email: initialProfile?.email || user?.email || '',
            dob: initialProfile?.dateOfBirth ? new Date(initialProfile.dateOfBirth).toLocaleDateString('en-GB') : '',
            gender: initialProfile?.gender || 'Male',
            photoUri: initialProfile?.profileImage || null,
            genderModalVisible: false,
            showDatePicker: false,
            dateObj: initialDateObj,
        };
    }

    componentDidMount(): void {
        // Simple fade + scale for avatar
        Animated.parallel([
            Animated.timing(this.avatarScale, {
                toValue: 1,
                duration: 500,
                easing: Easing.out(Easing.back(1.2)),
                useNativeDriver: true,
            }),
            Animated.timing(this.avatarOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start();

        // Header slide down
        Animated.timing(this.headerAnim, {
            toValue: 1,
            duration: 450,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start();

        // Save button fade up
        Animated.timing(this.saveAnim, {
            toValue: 1,
            duration: 400,
            delay: 600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start();
    }

    // ── Date Picker ───────────────────────────────────────────────────────────
    private onDateChange = (event: any, selectedDate?: Date) => {
        this.setState({ showDatePicker: false });
        if (selectedDate) {
            this.setState({
                dateObj: selectedDate,
                dob: selectedDate.toLocaleDateString('en-GB')
            });
        }
    };

    // ── Image Picker ──────────────────────────────────────────────────────────
    private pickImage = async (): Promise<void> => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Gallery permission is required!');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });
        if (!result.canceled && result.assets.length > 0) {
            this.setState({ photoUri: result.assets[0].uri });
        }
    };

    // ── Save Press ────────────────────────────────────────────────────────────
    private onSavePress = (): void => {
        const { fullName, dob, gender, photoUri } = this.state;

        // Parse dob "DD/MM/YYYY" to ISO String for API
        let formattedDob = null;
        if (dob) {
            const parts = dob.split('/');
            if (parts.length === 3) {
                formattedDob = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00.000Z`).toISOString();
            }
        }

        const formData = new FormData();
        formData.append('fullName', fullName);
        formData.append('gender', gender);
        if (formattedDob) {
            formData.append('dateOfBirth', formattedDob);
        }

        // Only append image if it's a local URI (selected from picker, not the one from the internet)
        if (photoUri && !photoUri.startsWith('http')) {
            const filename = photoUri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename || '');
            const type = match ? `image/${match[1]}` : `image`;
            formData.append('profileImage', { uri: photoUri, name: filename, type } as any);
        }

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
            this.props.onSave(formData);
        });
    };

    render(): React.ReactNode {
        const { fullName, email, dob, gender, photoUri, genderModalVisible } = this.state;
        const router = useRouter();

        const headerTranslate = this.headerAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-16, 0],
        });
        const saveTranslate = this.saveAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [16, 0],
        });

        const GENDER_OPTIONS = ['Male', 'Female'];

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
                    <Text style={styles.headerTitle}>Edit Profile</Text>
                    <View style={{ width: 36 }} />
                </Animated.View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* ── Avatar ── */}
                    <Animated.View
                        style={[
                            styles.avatarContainer,
                            {
                                opacity: this.avatarOpacity,
                                transform: [{ scale: this.avatarScale }],
                            },
                        ]}
                    >
                        <View style={styles.greenRing}>
                            <View style={styles.imageCircle}>
                                {photoUri ? (
                                    <Image source={{ uri: photoUri }} style={styles.profileImage} />
                                ) : (
                                    <View style={styles.imagePlaceholder}>
                                        <Text style={styles.placeholderInitials}>LJ</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Edit badge — click to pick photo */}
                        <TouchableOpacity style={styles.editBadge} onPress={this.pickImage}>
                            <Ionicons name="pencil" size={13} color="#fff" />
                        </TouchableOpacity>
                    </Animated.View>

                    {/* ── Form ── */}
                    <View style={styles.form}>
                        <AnimatedInput
                            label="Full Name"
                            value={fullName}
                            placeholder="Lily Jane"
                            delay={150}
                            onChangeText={(t) => this.setState({ fullName: t })}
                        />
                        <AnimatedInput
                            label="Email Address"
                            value={email}
                            placeholder="email@example.com"
                            keyboardType="email-address"
                            delay={250}
                            onChangeText={(t) => this.setState({ email: t })}
                        />
                        <AnimatedInput
                            label="Date of Birth"
                            value={dob}
                            placeholder="DD/MM/YYYY"
                            editable={false}
                            delay={350}
                            rightIcon={
                                <Ionicons name="calendar-outline" size={20} color="#888" />
                            }
                            onPressRight={() => this.setState({ showDatePicker: true })}
                        />

                        {this.state.showDatePicker && (
                            <DateTimePicker
                                value={this.state.dateObj}
                                mode="date"
                                display="default"
                                onChange={this.onDateChange}
                                maximumDate={new Date()}
                            />
                        )}

                        {/* ── Gender Dropdown ── */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Gender</Text>
                            <TouchableOpacity
                                style={styles.dropdownWrapper}
                                onPress={() => this.setState({ genderModalVisible: true })}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.dropdownText}>{gender}</Text>
                                <Ionicons name="chevron-down" size={18} color="#888" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* ── Save Button ── */}
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
                            <Text style={styles.saveBtnText}>{this.props.loading ? 'Saving...' : 'Save'}</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>

                {/* ── Gender Modal ── */}
                <Modal
                    visible={genderModalVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => this.setState({ genderModalVisible: false })}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => this.setState({ genderModalVisible: false })}
                    >
                        <View style={styles.modalBox}>
                            <Text style={styles.modalTitle}>Select Gender</Text>
                            {GENDER_OPTIONS.map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={[
                                        styles.modalOption,
                                        gender === option && styles.modalOptionActive,
                                    ]}
                                    onPress={() =>
                                        this.setState({ gender: option, genderModalVisible: false })
                                    }
                                >
                                    <Text
                                        style={[
                                            styles.modalOptionText,
                                            gender === option && styles.modalOptionTextActive,
                                        ]}
                                    >
                                        {option}
                                    </Text>
                                    {gender === option && (
                                        <Ionicons name="checkmark" size={18} color="#2ECC71" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </TouchableOpacity>
                </Modal>
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
    scrollContent: {
        paddingBottom: 48,
    },

    // ── Avatar ───────────────────────────────────────────────────────────────
    avatarContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 28,
        marginBottom: 36,
    },
    greenRing: {
        width: 108,
        height: 108,
        borderRadius: 54,
        borderWidth: 3,
        borderColor: '#2ECC71',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3,
    },
    imageCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        overflow: 'hidden',
        backgroundColor: '#E8E8E8',
    },
    profileImage: {
        width: 96,
        height: 96,
        borderRadius: 48,
    },
    imagePlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#C8D8E8',
    },
    placeholderInitials: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 2,
    },
    editBadge: {
        position: 'absolute',
        bottom: 2,
        right: '33%',
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#2ECC71',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2.5,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },

    // ── Form ─────────────────────────────────────────────────────────────────
    form: {
        paddingHorizontal: 24,
    },
    fieldGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1A1A1A',
        marginBottom: 8,
        letterSpacing: 0.2,
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
    },

    // ── Gender Dropdown ───────────────────────────────────────────────────────
    dropdownWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1.5,
        borderColor: '#E8E8E8',
        borderRadius: 10,
        backgroundColor: '#F8F9FA',
        paddingHorizontal: 16,
        height: 52,
    },
    dropdownText: {
        fontSize: 15,
        color: '#1A1A1A',
    },

    // ── Gender Modal ──────────────────────────────────────────────────────────
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBox: {
        width: 280,
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#888',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    modalOptionActive: {
        backgroundColor: '#F0FDF6',
    },
    modalOptionText: {
        fontSize: 15,
        color: '#1A1A1A',
    },
    modalOptionTextActive: {
        color: '#2ECC71',
        fontWeight: '600',
    },

    // ── Save Button ───────────────────────────────────────────────────────────
    saveWrapper: {
        paddingHorizontal: 24,
        marginTop: 12,
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

export default function EditProfile() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const { profile, loading } = useSelector((state: RootState) => state.profile);
    const { user } = useSelector((state: RootState) => state.auth);

    const handleSave = async (formData: FormData) => {
        try {
            await dispatch(updateProfile(formData)).unwrap();
            router.back();
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert('Failed to update profile. Please try again.');
        }
    };

    return (
        <EditProfileInner
            initialProfile={profile}
            user={user}
            loading={loading}
            onSave={handleSave}
        />
    );
}
