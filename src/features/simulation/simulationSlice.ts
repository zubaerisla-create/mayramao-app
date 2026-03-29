import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const API_URL = "https://mayramao-backend-five.vercel.app/api/v1";
// Alternatively for local testing:
// const API_URL = "http://localhost:5000/api/v1";

interface SimulationState {
    simulation: any | null;
    history: any[];
    loading: boolean;
    error: string | null;
}

const initialState: SimulationState = {
    simulation: null,
    history: [],
    loading: false,
    error: null,
};

const getAuthHeaders = (state: any) => {
    const token = state.auth?.accessToken;
    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
};

export const createSimulation = createAsyncThunk(
    "simulation/create",
    async (payload: any, { getState, rejectWithValue }) => {
        try {
            const state = getState();
            const headers = {
                ...getAuthHeaders(state),
                "Content-Type": "application/json",
            };
            const response = await fetch(`${API_URL}/simulations`, {
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

export const getUserSimulation = createAsyncThunk(
    "simulation/getUser",
    async (userId: string, { getState, rejectWithValue }) => {
        try {
            const state = getState();
            const headers = getAuthHeaders(state);
            const response = await fetch(`${API_URL}/simulations/user/${userId}`, {
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

const simulationSlice = createSlice({
    name: "simulation",
    initialState,
    reducers: {
        clearSimulationState(state) {
            state.loading = false;
            state.error = null;
            state.simulation = null;
        },
        setCurrentSimulation(state, action) {
            state.simulation = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(createSimulation.pending, (state) => { state.loading = true; state.error = null; });
        builder.addCase(createSimulation.fulfilled, (state, action) => {
            state.loading = false;
            state.simulation = action.payload?.simulation || action.payload;
        });
        builder.addCase(createSimulation.rejected, (state, action) => {
            state.loading = false;
            state.error = (action.payload as any)?.message || action.error?.message || "Something went wrong";
        });

        builder.addCase(getUserSimulation.pending, (state) => { state.loading = true; state.error = null; });
        builder.addCase(getUserSimulation.fulfilled, (state, action) => {
            state.loading = false;
            // The API returns { success: true, simulations: [...] }
            state.history = action.payload?.simulations || [];
            if (state.history.length > 0) {
                state.simulation = state.history[0]; // Set the latest simulation as the current one optionally
            } else {
                state.simulation = null;
            }
        });
        builder.addCase(getUserSimulation.rejected, (state, action) => {
            state.loading = false;
            state.error = (action.payload as any)?.message || action.error?.message || "Something went wrong";
        });
    }
});

export const { clearSimulationState, setCurrentSimulation } = simulationSlice.actions;
export default simulationSlice.reducer;
