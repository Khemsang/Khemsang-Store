import { configureStore } from "@reduxjs/toolkit";
import productsReducer from "./slices/productsSlice";
import categoriesReducer from "./slices/categoriesSlice";
import ordersReducer from "./slices/ordersSlice";
import analyticsReducer from "./slices/analyticsSlice";
import featuredProductsReducer from "./slices/featuredProductsSlice";
import testimonialsReducer from "./slices/testimonialsSlice";
import galleryReducer from "./slices/gallerySlice";
import bannersReducer from "./slices/bannersSlice";
import statsReducer from "./slices/statsSlice";

export const store = configureStore({
  reducer: {
    products: productsReducer,
    categories: categoriesReducer,
    orders: ordersReducer,
    analytics: analyticsReducer,
    featuredProducts: featuredProductsReducer,
    testimonials: testimonialsReducer,
    gallery: galleryReducer,
    banners: bannersReducer,
    stats: statsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export default for convenience
export default store;
