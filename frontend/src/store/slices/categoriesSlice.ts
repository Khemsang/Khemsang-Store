import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../services/api";

interface Category {
  _id: string;
  name: string;
  image?: string;
  description?: string;
  isActive: boolean;
}

interface CategoriesState {
  items: Category[];
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
}

const initialState: CategoriesState = {
  items: [],
  loading: false,
  error: null,
  lastFetch: null,
};

export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async (adminOnly?: boolean) => {
    const url = adminOnly ? "/categories?adminOnly=true" : "/categories";
    const { data } = await api.get(url);
    return data;
  }
);

export const createCategory = createAsyncThunk(
  "categories/createCategory",
  async (formData: FormData) => {
    const { data } = await api.post("/categories", formData);
    return data;
  }
);

export const updateCategory = createAsyncThunk(
  "categories/updateCategory",
  async ({ id, formData }: { id: string; formData: FormData }) => {
    const { data } = await api.put(`/categories/${id}`, formData);
    return data;
  }
);

export const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  async (id: string) => {
    await api.delete(`/categories/${id}`);
    return id;
  }
);

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearCategories: (state) => {
      state.items = [];
      state.lastFetch = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.lastFetch = Date.now();
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch categories";
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.items.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c._id !== action.payload);
      });
  },
});

export const { clearCategories } = categoriesSlice.actions;
export default categoriesSlice.reducer;
