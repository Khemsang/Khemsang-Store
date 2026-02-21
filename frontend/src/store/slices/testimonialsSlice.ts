import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../services/api";

interface Testimonial {
  _id: string;
  name: string;
  email: string;
  rating: number;
  message: string;
  isApproved: boolean;
  createdAt: string;
}

interface TestimonialsState {
  items: Testimonial[];
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
}

const initialState: TestimonialsState = {
  items: [],
  loading: false,
  error: null,
  lastFetch: null,
};

export const fetchTestimonials = createAsyncThunk(
  "testimonials/fetchTestimonials",
  async () => {
    const { data } = await api.get("/testimonials");
    return data;
  }
);

const testimonialsSlice = createSlice({
  name: "testimonials",
  initialState,
  reducers: {
    clearTestimonials: (state) => {
      state.items = [];
      state.lastFetch = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTestimonials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTestimonials.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.lastFetch = Date.now();
      })
      .addCase(fetchTestimonials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch testimonials";
      });
  },
});

export const { clearTestimonials } = testimonialsSlice.actions;
export default testimonialsSlice.reducer;
