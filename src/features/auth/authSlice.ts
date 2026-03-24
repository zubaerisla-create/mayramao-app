import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  loading: boolean;
  error: string | null;
  message: string;
  email?: string; // track email for OTP or subsequent flows
  user?: User;
  accessToken?: string;
  refreshToken?: string;
  // you can expand with other fields as needed
}

const initialState: AuthState = {
  loading: false,
  error: null,
  message: "",
  email: undefined,
  user: undefined,
  accessToken: undefined,
  refreshToken: undefined,
};

export const registerUser = createAsyncThunk(
  "auth/register",
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      const response = await fetch(
        "https://mayramao-backend-five.vercel.app/api/v1/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: payload.name,
            email: payload.email,
            password: payload.password,
          }),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        // the API might return validation errors or message
        return rejectWithValue(data);
      }
      return data;
    } catch (err: any) {
      return rejectWithValue({ message: err.message || "Network error" });
    }
  },
);

// otp verification thunk
export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async (payload: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await fetch("https://mayramao-backend-five.vercel.app/api/v1/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data);
      }
      return data;
    } catch (err: any) {
      return rejectWithValue({ message: err.message || "Network error" });
    }
  },
);

export const resendOtp = createAsyncThunk(
  "auth/resendOtp",
  async (payload: { email: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        "https://mayramao-backend-five.vercel.app/api/v1/auth/resend-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data);
      }
      return data;
    } catch (err: any) {
      return rejectWithValue({ message: err.message || "Network error" });
    }
  },
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch("https://mayramao-backend-five.vercel.app/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data);
      }
      return data;
    } catch (err: any) {
      return rejectWithValue({ message: err.message || "Network error" });
    }
  },
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (payload: any, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (state.auth?.accessToken) {
        headers["Authorization"] = `Bearer ${state.auth.accessToken}`;
      }

      const response = await fetch("https://mayramao-backend-five.vercel.app/api/v1/auth/change-password", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data);
      }
      return data;
    } catch (err: any) {
      return rejectWithValue({ message: err.message || "Network error" });
    }
  },
);

export const requestAccountDeletion = createAsyncThunk(
  "auth/requestAccountDeletion",
  async (payload: { email: string }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (state.auth?.accessToken) {
        headers["Authorization"] = `Bearer ${state.auth.accessToken}`;
      }

      const response = await fetch("https://mayramao-backend-five.vercel.app/api/v1/auth/request-account-deletion", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data);
      }
      return data;
    } catch (err: any) {
      return rejectWithValue({ message: err.message || "Network error" });
    }
  },
);

export const confirmAccountDeletion = createAsyncThunk(
  "auth/confirmAccountDeletion",
  async (payload: { email: string; otp: string }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (state.auth?.accessToken) {
        headers["Authorization"] = `Bearer ${state.auth.accessToken}`;
      }

      const response = await fetch("https://mayramao-backend-five.vercel.app/api/v1/auth/confirm-account-deletion", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data);
      }
      return data;
    } catch (err: any) {
      return rejectWithValue({ message: err.message || "Network error" });
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = "";
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload?.message || "";
        // keep the email so other screens can read it
        // `meta` is not part of the default PayloadAction signature;
        // cast to `any` so TypeScript doesn't complain.
        const metaArg = (action as any).meta?.arg as
          | RegisterPayload
          | undefined;
        if (metaArg) {
          state.email = metaArg.email;
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as any)?.message ||
          action.error?.message ||
          "Something went wrong";
      })
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = "";
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload?.message || "Password changed successfully";
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as any)?.message ||
          action.error?.message ||
          "Something went wrong";
      })
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = "";
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload?.message || "Verified successfully";
        if (action.payload?.user) {
          state.user = action.payload.user;
        }
        if (action.payload?.accessToken) {
          state.accessToken = action.payload.accessToken;
        }
        if (action.payload?.refreshToken) {
          state.refreshToken = action.payload.refreshToken;
        }
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as any)?.message ||
          action.error?.message ||
          "Something went wrong";
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = "";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload?.message || "Logged in successfully";
        if (action.payload?.user) {
          state.user = action.payload.user;
        }
        if (action.payload?.accessToken) {
          state.accessToken = action.payload.accessToken;
        }
        if (action.payload?.refreshToken) {
          state.refreshToken = action.payload.refreshToken;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as any)?.message ||
          action.error?.message ||
          "Something went wrong";
      })
      .addCase(requestAccountDeletion.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = "";
      })
      .addCase(requestAccountDeletion.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload?.message || "OTP sent for deletion";
      })
      .addCase(requestAccountDeletion.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as any)?.message ||
          action.error?.message ||
          "Failed to request deletion";
      })
      .addCase(confirmAccountDeletion.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = "";
      })
      .addCase(confirmAccountDeletion.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload?.message || "Account deleted successfully";
        // Optionally clear the user session:
        state.user = undefined;
        state.accessToken = undefined;
        state.refreshToken = undefined;
        state.email = undefined;
      })
      .addCase(confirmAccountDeletion.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as any)?.message ||
          action.error?.message ||
          "Failed to confirm deletion";
      });
  },
});

export default authSlice.reducer;

// export types for use in components
export type { AuthState, User };

