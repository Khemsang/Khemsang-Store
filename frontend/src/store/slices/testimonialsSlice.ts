import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { testimonialsApi } from "../../services/api";

interface Testimonial {
  _id: string;
  name: string;
  role: string;
  imageUrl: string;
  quote: string;
  rating: number;
  isActive: boolean;
}

interface TestimonialsState {
  items: Testimonial[];
  loading: boolean;
  error: string | null;
}

const initialState: TestimonialsState = {
  items: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchTestimonials = createAsyncThunk(
  "testimonials/fetchAll",
  async () => {
    const response = await testimonialsApi.getAll();
    return response.data;
  }
);

const testimonialsSlice = createSlice({
  name: "testimonials",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTestimonials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTestimonials.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTestimonials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch testimonials";
      });
  },
});

export default testimonialsSlice.reducer;
