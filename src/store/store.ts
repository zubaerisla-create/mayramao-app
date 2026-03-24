import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import authReducer from "../features/auth/authSlice";
import profileReducer from "../features/profile/profileSlice";
import simulationReducer from "../features/simulation/simulationSlice";

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["auth"], // only persist the auth slice for now
};

const rootReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  simulation: simulationReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // necessary for redux-persist
    }),
});

export const persistor = persistStore(store);

// infer the "RootState" and "AppDispatch" types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
