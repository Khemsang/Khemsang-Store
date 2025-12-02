import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { statsApi } from "../../services/api";

interface Stat {
  _id: string;
  label: string;
  value: number;
  suffix: string;
  icon?: string;
  order: number;
  isActive: boolean;
}

interface StatsState {
  items: Stat[];
  loading: boolean;
  error: string | null;
}

const initialState: StatsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchStats = createAsyncThunk("stats/fetchAll", async () => {
  const response = await statsApi.getAll();
  return response.data;
});

const statsSlice = createSlice({
  name: "stats",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch stats";
      });
  },
});

export default statsSlice.reducer;
