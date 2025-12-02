import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../services/api";

interface GalleryItem {
  _id: string;
  imageUrl: string;
  title: string;
  description?: string;
  category?: string;
}

interface GalleryState {
  items: GalleryItem[];
  loading: boolean;
  error: string | null;
}

const initialState: GalleryState = {
  items: [],
  loading: false,
  error: null,
};

// Fetch gallery images (you can create this endpoint in backend)
export const fetchGalleryImages = createAsyncThunk(
  "gallery/fetchImages",
  async () => {
    // For now, return products images as gallery
    const response = await api.get("/products");
    const products = response.data;

    // Transform products to gallery items
    const galleryItems = products.flatMap((product: any) =>
      product.images.map((image: string, index: number) => ({
        _id: `${product._id}-${index}`,
        imageUrl: image,
        title: product.title,
        description: product.description,
        category: product.category,
      }))
    );

    return galleryItems;
  }
);

const gallerySlice = createSlice({
  name: "gallery",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGalleryImages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGalleryImages.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchGalleryImages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch gallery";
      });
  },
});

export default gallerySlice.reducer;
