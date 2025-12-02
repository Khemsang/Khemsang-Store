import { configureStore } from "@reduxjs/toolkit";
import productsReducer from "./slices/productsSlice";
import galleryReducer from "./slices/gallerySlice";
import testimonialsReducer from "./slices/testimonialsSlice";
import categoriesReducer from "./slices/categoriesSlice";
import featuredProductsReducer from "./slices/featuredProductsSlice";
import bannersReducer from "./slices/bannersSlice";
import statsReducer from "./slices/statsSlice";

export const store = configureStore({
  reducer: {
    products: productsReducer,
    gallery: galleryReducer,
    testimonials: testimonialsReducer,
    categories: categoriesReducer,
    featuredProducts: featuredProductsReducer,
    banners: bannersReducer,
    stats: statsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
