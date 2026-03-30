import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import "react-native-reanimated";
import { StripeProvider } from "@stripe/stripe-react-native";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { Stack } from "expo-router";

// redux
import { persistor, store } from "@/src/store/store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

export const unstable_settings = {
  initialRouteName: "index",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <StripeProvider 
          publishableKey="pk_test_51PrOoOIB2fwnFU2Pxba0oZ6FFXeipWRUTDKtoYlY0GNAlGId8s9pfq3RKyyTXj4eiQchK2kojT99peyLp3ldumhG00WDiAf38v"
          merchantIdentifier="merchant.com.mayramao"
        >
          <ThemeProvider value={DefaultTheme}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="onboarding" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="modal" options={{ presentation: "modal" }} />
            </Stack>
          </ThemeProvider>
        </StripeProvider>
      </PersistGate>
    </Provider>
  );
}
