import { Stack } from 'expo-router';

export default function AuthLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="create-account" />
            <Stack.Screen name="login" />
            <Stack.Screen name="otp" />
            <Stack.Screen name="forgot-password" />
            <Stack.Screen name="new-password" />
            <Stack.Screen name="financial-profile" />
            <Stack.Screen name="success" />
        </Stack>
    );
}
