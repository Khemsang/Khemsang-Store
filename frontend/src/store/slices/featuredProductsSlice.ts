import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { featuredProductsApi } from "../../services/api";

interface FeaturedProduct {
  _id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  originalPrice?: number;
  discount: number;
  category: string;
  isActive: boolean;
  isFeatured: boolean;
  order: number;
}

interface FeaturedProductsState {
  items: FeaturedProduct[];
  loading: boolean;
  error: string | null;
}

const initialState: FeaturedProductsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchFeaturedProducts = createAsyncThunk(
  "featuredProducts/fetchAll",
  async () => {
    const response = await featuredProductsApi.getAll();
    return response.data;
  }
);

const featuredProductsSlice = createSlice({
  name: "featuredProducts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to fetch featured products";
      });
  },
});

export default featuredProductsSlice.reducer;
