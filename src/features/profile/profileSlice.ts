import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const API_URL = "https://mayramao-backend-five.vercel.app/api/v1";
// Alternatively for local testing:
// const API_URL = "http://localhost:5000/api/v1";

interface ProfileState {
    profile: any | null;
    loading: boolean;
    error: string | null;
    message: string;
}

const initialState: ProfileState = {
    profile: null,
    loading: false,
    error: null,
    message: "",
};

// Helper for auth headers
const getAuthHeaders = (state: any) => {
    const token = state.auth?.accessToken;
    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
};

// 1. Onboarding / Create Profile (POST /api/v1/users/profile)
export const createProfile = createAsyncThunk(
    "profile/create",
    async (payload: any, { getState, rejectWithValue }) => {
        try {
            const state = getState();
            const headers = {
                ...getAuthHeaders(state),
                "Content-Type": "application/json",
            };
            const response = await fetch(`${API_URL}/users/profile`, {
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

// 2. Update Profile / Add Goal (PATCH /api/v1/users/profile)
export const updateProfile = createAsyncThunk(
    "profile/update",
    async (payload: any | FormData, { getState, rejectWithValue }) => {
        try {
            const state = getState();
            const headers = getAuthHeaders(state);

            let body: any;
            if (payload instanceof FormData) {
                // fetch automatically sets multipart/form-data boundary when using FormData
                body = payload;
            } else {
                headers["Content-Type"] = "application/json";
                body = JSON.stringify(payload);
            }

            const response = await fetch(`${API_URL}/users/profile`, {
                method: "POST",
                headers,
                body,
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data);
            return data;
        } catch (err: any) {
            return rejectWithValue({ message: err.message || "Network error" });
        }
    }
);

// 3. Get Profile (GET /api/v1/users/profile/:userId)
export const getProfile = createAsyncThunk(
    "profile/get",
    async (userId: string, { getState, rejectWithValue }) => {
        try {
            const state = getState();
            const headers = getAuthHeaders(state);
            const response = await fetch(`${API_URL}/users/profile/${userId}`, {
                method: "GET",
                headers,
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data);
            return data;
        } catch (err: any) {
            return rejectWithValue({ message: err.message || "Network error" });
        }
    }
);

// 4. Submit Contact / Support Ticket (POST /api/v1/users/profile/contact)
export const submitContact = createAsyncThunk(
    "profile/contact",
    async (payload: { fullName: string; email: string; description: string }, { getState, rejectWithValue }) => {
        try {
            const state = getState();
            const headers = { ...getAuthHeaders(state), "Content-Type": "application/json" };
            const response = await fetch(`${API_URL}/users/profile/contact`, {
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

// 5. Update Preferences (POST /api/v1/users/profile) // Note: The prompt mentioned POST for this, though often it's PATCH.
export const updatePreferences = createAsyncThunk(
    "profile/updatePreferences",
    async (payload: any, { getState, rejectWithValue }) => {
        try {
            const state = getState();
            const headers = { ...getAuthHeaders(state), "Content-Type": "application/json" };
            const response = await fetch(`${API_URL}/users/profile`, {
                method: "POST", // according to user prompt "personal preferences post api"
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


const profileSlice = createSlice({
    name: "profile",
    initialState,
    reducers: {
        clearProfileState(state) {
            state.loading = false;
            state.error = null;
            state.message = "";
        },
    },
    extraReducers: (builder) => {
        // getProfile
        builder.addCase(getProfile.pending, (state) => { state.loading = true; state.error = null; });
        builder.addCase(getProfile.fulfilled, (state, action) => {
            state.loading = false;
            state.profile = action.payload?.profile || action.payload;
        });
        builder.addCase(getProfile.rejected, (state, action) => {
            state.loading = false;
            state.error = (action.payload as any)?.message || action.error?.message || "Something went wrong";
        });

        // createProfile
        builder.addCase(createProfile.pending, (state) => { state.loading = true; state.error = null; });
        builder.addCase(createProfile.fulfilled, (state, action) => {
            state.loading = false;
            if (action.payload?.profile) {
                state.profile = action.payload.profile;
            }
        });
        builder.addCase(createProfile.rejected, (state, action) => {
            state.loading = false;
            state.error = (action.payload as any)?.message || action.error?.message || "Something went wrong";
        });

        // updateProfile
        builder.addCase(updateProfile.pending, (state) => { state.loading = true; state.error = null; });
        builder.addCase(updateProfile.fulfilled, (state, action) => {
            state.loading = false;
            if (action.payload?.profile) {
                state.profile = action.payload.profile;
            }
        });
        builder.addCase(updateProfile.rejected, (state, action) => {
            state.loading = false;
            state.error = (action.payload as any)?.message || action.error?.message || "Something went wrong";
        });

        // submitContact
        builder.addCase(submitContact.pending, (state) => { state.loading = true; state.error = null; });
        builder.addCase(submitContact.fulfilled, (state, action) => {
            state.loading = false;
            state.message = "Contact submitted successfully";
        });
        builder.addCase(submitContact.rejected, (state, action) => {
            state.loading = false;
            state.error = (action.payload as any)?.message || action.error?.message || "Something went wrong";
        });

        // updatePreferences
        builder.addCase(updatePreferences.pending, (state) => { state.loading = true; state.error = null; });
        builder.addCase(updatePreferences.fulfilled, (state, action) => {
            state.loading = false;
            if (action.payload?.profile) {
                state.profile = action.payload.profile;
            }
        });
        builder.addCase(updatePreferences.rejected, (state, action) => {
            state.loading = false;
            state.error = (action.payload as any)?.message || action.error?.message || "Something went wrong";
        });
    }
});

export const { clearProfileState } = profileSlice.actions;
export default profileSlice.reducer;
