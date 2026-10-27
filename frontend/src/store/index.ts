import { configureStore } from "@reduxjs/toolkit";
import productsReducer from "./slices/productsSlice";
import featuredProductsReducer from "./slices/featuredProductsSlice";

/**
 * Redux is used only for server data that needs cross-component optimistic
 * updates driven by section-level components that predate the React Query
 * migration (LatestItems, Product showcase) and still dispatch thunks.
 *
 * Everything else lives in:
 *   - React Query  →  server data (useServerQueries, useProducts, useOrders…)
 *   - Context      →  cross-cutting UI state (auth, cart, theme, toasts)
 *   - Local state  →  component-level UI (modals, form values, pagination)
 */
export const store = configureStore({
  reducer: {
    products:         productsReducer,
    featuredProducts: featuredProductsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export type RootState  = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
