import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { bannersApi } from "../../services/api";

interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
  position: string;
  isActive: boolean;
  order: number;
}

interface BannersState {
  items: Banner[];
  loading: boolean;
  error: string | null;
}

const initialState: BannersState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchBanners = createAsyncThunk(
  "banners/fetchAll",
  async (position?: string) => {
    const response = await bannersApi.getAll(position);
    return response.data;
  }
);

const bannersSlice = createSlice({
  name: "banners",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBanners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBanners.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch banners";
      });
  },
});

export default bannersSlice.reducer;
