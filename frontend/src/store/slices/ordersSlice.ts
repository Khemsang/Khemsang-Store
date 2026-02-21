import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../services/api";

interface Order {
  _id: string;
  user: any;
  items: any[];
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
}

interface OrdersState {
  items: Order[];
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
}

const initialState: OrdersState = {
  items: [],
  loading: false,
  error: null,
  lastFetch: null,
};

export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async () => {
    const { data } = await api.get("/orders");
    return data;
  }
);

export const updateOrderStatus = createAsyncThunk(
  "orders/updateOrderStatus",
  async ({ id, status }: { id: string; status: string }) => {
    const { data } = await api.put(`/orders/${id}/status`, { orderStatus: status });
    return data;
  }
);

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearOrders: (state) => {
      state.items = [];
      state.lastFetch = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.lastFetch = Date.now();
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch orders";
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex((o) => o._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export const { clearOrders } = ordersSlice.actions;
export default ordersSlice.reducer;
