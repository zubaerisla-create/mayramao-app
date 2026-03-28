import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

const API_URL = "https://mayramao-backend-five.vercel.app/api/v1";

export interface ISubscription {
    _id: string;
    planName: string;
    planType: string;           // e.g., "monthly", "yearly"
    price: number;
    duration: number;           // in days
    simulationsLimit: number;
    simulationsUnlimited: boolean;
    features: string[];
    isActive: boolean;
    activePlan: boolean;
    stripePriceId: string;      // Stripe Price ID for recurring billing
    createdAt: string;
    updatedAt: string;
}

export interface UserSubscription {
    planId: string | null;
    planName: string;
    startedAt: string | null;
    expiresAt: string | null;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    stripePriceId: string;
    isActive: boolean;
}

interface SubscriptionState {
    subscriptions: ISubscription[];
    currentSubscription: ISubscription | null;
    selectedPlan: ISubscription | null;
    stripeKey: string | null;
    loading: boolean;
    error: string | null;
    purchaseLoading: boolean;
}

const initialState: SubscriptionState = {
    subscriptions: [],
    currentSubscription: null,
    selectedPlan: null,
    stripeKey: null,
    loading: false,
    error: null,
    purchaseLoading: false,
};

// Helper for auth headers
const getAuthHeaders = (state: any) => {
    const token = state.auth?.accessToken;
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
};

// 1. List All Subscriptions (GET /subscriptions)
export const fetchSubscriptions = createAsyncThunk(
    "subscription/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}/subscriptions`);
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data);
            return data.subscriptions;
        } catch (err: any) {
            return rejectWithValue({ message: err.message || "Network error" });
        }
    }
);

// 2. Get Stripe Publishable Key (GET /subscriptions/stripe-key)
export const fetchStripeKey = createAsyncThunk(
    "subscription/fetchStripeKey",
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}/subscriptions/stripe-key`);
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data);
            return data.publishableKey;
        } catch (err: any) {
            return rejectWithValue({ message: err.message || "Network error" });
        }
    }
);

// 3. Purchase Subscription (POST /subscriptions/purchase)
export const purchaseSubscription = createAsyncThunk(
    "subscription/purchase",
    async (payload: { planId: string; paymentMethodId: string; cardHolderName?: string }, { getState, rejectWithValue }) => {
        try {
            const state = getState();
            const headers = getAuthHeaders(state);
            const response = await fetch(`${API_URL}/subscriptions/purchase`, {
                method: "POST",
                headers,
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data);
            return data;
        } catch (err: any) {
            return rejectWithValue({ message: err.message || "Network error" });
        }
    }
);

// 4. Get Current Subscription (GET /subscriptions/current-subscription-id)
export const fetchCurrentSubscription = createAsyncThunk(
    "subscription/fetchCurrent",
    async (_, { getState, rejectWithValue }) => {
        try {
            const state = getState();
            const headers = getAuthHeaders(state);
            const response = await fetch(`${API_URL}/subscriptions/current-subscription-id`, {
                method: "GET",
                headers,
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data);
            return data.subscription;
        } catch (err: any) {
            return rejectWithValue({ message: err.message || "Network error" });
        }
    }
);

const subscriptionSlice = createSlice({
    name: "subscription",
    initialState,
    reducers: {
        setSelectedPlan: (state, action: PayloadAction<ISubscription | null>) => {
            state.selectedPlan = action.payload;
        },
        clearSubscriptionError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // fetchSubscriptions
        builder.addCase(fetchSubscriptions.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchSubscriptions.fulfilled, (state, action: PayloadAction<ISubscription[]>) => {
            state.loading = false;
            state.subscriptions = action.payload;
        });
        builder.addCase(fetchSubscriptions.rejected, (state, action) => {
            state.loading = false;
            state.error = (action.payload as any)?.message || "Failed to fetch subscriptions";
        });

        // fetchCurrentSubscription
        builder.addCase(fetchCurrentSubscription.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchCurrentSubscription.fulfilled, (state, action: PayloadAction<ISubscription>) => {
            state.loading = false;
            state.currentSubscription = action.payload;
        });
        builder.addCase(fetchCurrentSubscription.rejected, (state, action) => {
            state.loading = false;
            state.error = (action.payload as any)?.message || "Failed to fetch current subscription";
        });

        // fetchStripeKey
        builder.addCase(fetchStripeKey.fulfilled, (state, action: PayloadAction<string>) => {
            state.stripeKey = action.payload;
        });

        // purchaseSubscription
        builder.addCase(purchaseSubscription.pending, (state) => {
            state.purchaseLoading = true;
            state.error = null;
        });
        builder.addCase(purchaseSubscription.fulfilled, (state) => {
            state.purchaseLoading = false;
        });
        builder.addCase(purchaseSubscription.rejected, (state, action) => {
            state.purchaseLoading = false;
            state.error = (action.payload as any)?.message || "Purchase failed";
        });
    }
});

export const { setSelectedPlan, clearSubscriptionError } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
