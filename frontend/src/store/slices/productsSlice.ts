import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../services/api";

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  variants?: any[];
  isActive?: boolean;
}

interface ProductsState {
  items: Product[];
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
}

const initialState: ProductsState = {
  items: [],
  loading: false,
  error: null,
  lastFetch: null,
};

// Async thunks
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (params?: { adminOnly?: boolean; category?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.adminOnly) queryParams.append("adminOnly", "true");
    if (params?.category) queryParams.append("category", params.category);
    
    const { data } = await api.get(`/products?${queryParams.toString()}`);
    return data;
  }
);

export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (formData: FormData) => {
    const { data } = await api.post("/products", formData);
    return data;
  }
);

export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, formData }: { id: string; formData: FormData }) => {
    const { data } = await api.put(`/products/${id}`, formData);
    return data;
  }
);

export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (id: string) => {
    await api.delete(`/products/${id}`);
    return id;
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearProducts: (state) => {
      state.items = [];
      state.lastFetch = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.lastFetch = Date.now();
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch products";
      })
      // Create product
      .addCase(createProduct.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // Update product
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // Delete product
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p._id !== action.payload);
      });
  },
});

export const { clearProducts } = productsSlice.actions;
export default productsSlice.reducer;
