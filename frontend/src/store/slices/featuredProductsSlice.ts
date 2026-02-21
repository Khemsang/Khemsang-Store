import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../services/api";

interface FeaturedProduct {
  _id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  category: string;
  productId?: string;
  isActive: boolean;
}

interface FeaturedProductsState {
  items: FeaturedProduct[];
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
}

const initialState: FeaturedProductsState = {
  items: [],
  loading: false,
  error: null,
  lastFetch: null,
};

export const fetchFeaturedProducts = createAsyncThunk(
  "featuredProducts/fetchFeaturedProducts",
  async () => {
    const { data } = await api.get("/featured-products");
    return data;
  }
);

export const createFeaturedProduct = createAsyncThunk(
  "featuredProducts/createFeaturedProduct",
  async (formData: FormData) => {
    const { data } = await api.post("/featured-products", formData);
    return data;
  }
);

export const updateFeaturedProduct = createAsyncThunk(
  "featuredProducts/updateFeaturedProduct",
  async ({ id, formData }: { id: string; formData: FormData }) => {
    const { data } = await api.put(`/featured-products/${id}`, formData);
    return data;
  }
);

export const deleteFeaturedProduct = createAsyncThunk(
  "featuredProducts/deleteFeaturedProduct",
  async (id: string) => {
    await api.delete(`/featured-products/${id}`);
    return id;
  }
);

const featuredProductsSlice = createSlice({
  name: "featuredProducts",
  initialState,
  reducers: {
    clearFeaturedProducts: (state) => {
      state.items = [];
      state.lastFetch = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.lastFetch = Date.now();
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch featured products";
      })
      .addCase(createFeaturedProduct.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateFeaturedProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteFeaturedProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p._id !== action.payload);
      });
  },
});

export const { clearFeaturedProducts } = featuredProductsSlice.actions;
export default featuredProductsSlice.reducer;
