# Redux Implementation Guide

## Overview
Implemented Redux Toolkit for centralized state management with clean API fetching across all components.

## Benefits
1. **No Duplicate API Calls** - Data cached in Redux store
2. **Centralized State** - Single source of truth
3. **Automatic Loading States** - Built-in loading/error handling
4. **Clean Code** - No useState/useEffect mess in components
5. **Type Safety** - Full TypeScript support

## Structure

```
frontend/src/store/
├── index.ts                      # Store configuration
├── hooks.ts                      # Typed hooks
└── slices/
    ├── productsSlice.ts          # Products state & actions
    ├── categoriesSlice.ts        # Categories state & actions
    ├── featuredProductsSlice.ts  # Featured products state & actions
    ├── ordersSlice.ts            # Orders state & actions
    └── analyticsSlice.ts         # Analytics state & actions
```

## How to Use

### 1. Import Hooks
```typescript
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchProducts, createProduct, updateProduct, deleteProduct } from "../../store/slices/productsSlice";
```

### 2. Use in Component

#### Example: Products Page (BEFORE)
```typescript
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/products");
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

#### Example: Products Page (AFTER - Clean!)
```typescript
const dispatch = useAppDispatch();
const { items: products, loading } = useAppSelector((state) => state.products);

useEffect(() => {
  dispatch(fetchProducts());
}, [dispatch]);
```

### 3. CRUD Operations

#### Fetch Data
```typescript
// Fetch all products
dispatch(fetchProducts());

// Fetch with params
dispatch(fetchProducts({ adminOnly: true }));
dispatch(fetchProducts({ category: "Electronics" }));
```

#### Create
```typescript
const formData = new FormData();
formData.append("title", "New Product");
formData.append("price", "1000");
// ... add more fields

await dispatch(createProduct(formData)).unwrap();
// Automatically adds to store, no need to refetch!
```

#### Update
```typescript
const formData = new FormData();
formData.append("title", "Updated Title");

await dispatch(updateProduct({ id: productId, formData })).unwrap();
// Automatically updates in store!
```

#### Delete
```typescript
await dispatch(deleteProduct(productId)).unwrap();
// Automatically removes from store!
```

### 4. Access State
```typescript
const { items, loading, error, lastFetch } = useAppSelector((state) => state.products);

// Use in JSX
{loading && <Loading />}
{error && <div>Error: {error}</div>}
{items.map(product => <ProductCard key={product._id} product={product} />)}
```

## Available Slices

### 1. Products Slice
```typescript
import { fetchProducts, createProduct, updateProduct, deleteProduct } from "../../store/slices/productsSlice";

// State
state.products.items        // Product[]
state.products.loading      // boolean
state.products.error        // string | null
state.products.lastFetch    // number | null
```

### 2. Categories Slice
```typescript
import { fetchCategories, createCategory, updateCategory, deleteCategory } from "../../store/slices/categoriesSlice";

// State
state.categories.items      // Category[]
state.categories.loading    // boolean
state.categories.error      // string | null
```

### 3. Featured Products Slice
```typescript
import { fetchFeaturedProducts, createFeaturedProduct, updateFeaturedProduct, deleteFeaturedProduct } from "../../store/slices/featuredProductsSlice";

// State
state.featuredProducts.items    // FeaturedProduct[]
state.featuredProducts.loading  // boolean
state.featuredProducts.error    // string | null
```

### 4. Orders Slice
```typescript
import { fetchOrders, updateOrderStatus } from "../../store/slices/ordersSlice";

// State
state.orders.items      // Order[]
state.orders.loading    // boolean
state.orders.error      // string | null
```

### 5. Analytics Slice
```typescript
import { fetchAnalytics } from "../../store/slices/analyticsSlice";

// State
state.analytics.data        // AnalyticsData | null
state.analytics.loading     // boolean
state.analytics.error       // string | null
```

## Migration Examples

### Example 1: AdminProducts Component

**BEFORE (Old Way)**:
```typescript
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(true);

const fetchData = async () => {
  try {
    setLoading(true);
    const { data } = await api.get("/products?adminOnly=true");
    setProducts(data);
  } catch (err) {
    error("Failed to fetch");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchData();
}, []);

const handleDelete = async (id) => {
  await api.delete(`/products/${id}`);
  fetchData(); // Refetch everything!
};
```

**AFTER (Redux Way)**:
```typescript
const dispatch = useAppDispatch();
const { items: products, loading } = useAppSelector((state) => state.products);

useEffect(() => {
  dispatch(fetchProducts({ adminOnly: true }));
}, [dispatch]);

const handleDelete = async (id: string) => {
  await dispatch(deleteProduct(id)).unwrap();
  // No refetch needed! Automatically removed from store
};
```

### Example 2: Categories Page

**BEFORE**:
```typescript
const [categories, setCategories] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetch = async () => {
    try {
      const { data } = await api.get("/categories");
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  fetch();
}, []);
```

**AFTER**:
```typescript
const dispatch = useAppDispatch();
const { items: categories, loading } = useAppSelector((state) => state.categories);

useEffect(() => {
  dispatch(fetchCategories());
}, [dispatch]);
```

### Example 3: Dashboard Analytics

**BEFORE**:
```typescript
const [analytics, setAnalytics] = useState(null);
const [loading, setLoading] = useState(true);

const fetchAnalytics = async () => {
  try {
    setLoading(true);
    const { data } = await api.get("/stats/analytics");
    setAnalytics(data);
  } catch (err) {
    error("Failed");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchAnalytics();
}, []);
```

**AFTER**:
```typescript
const dispatch = useAppDispatch();
const { data: analytics, loading } = useAppSelector((state) => state.analytics);

useEffect(() => {
  dispatch(fetchAnalytics());
}, [dispatch]);

// Refresh button
const handleRefresh = () => {
  dispatch(fetchAnalytics());
};
```

## Advanced Features

### 1. Caching with lastFetch
```typescript
useEffect(() => {
  const { lastFetch } = useAppSelector((state) => state.products);
  const CACHE_TIME = 5 * 60 * 1000; // 5 minutes
  
  if (!lastFetch || Date.now() - lastFetch > CACHE_TIME) {
    dispatch(fetchProducts());
  }
}, [dispatch]);
```

### 2. Error Handling
```typescript
try {
  await dispatch(createProduct(formData)).unwrap();
  success("Product created!");
} catch (err: any) {
  error(err.message || "Failed to create product");
}
```

### 3. Loading States
```typescript
const { loading } = useAppSelector((state) => state.products);

if (loading) return <Loading />;
```

### 4. Filtering in Component
```typescript
const { items } = useAppSelector((state) => state.products);
const activeProducts = items.filter(p => p.isActive);
const searchResults = items.filter(p => 
  p.title.toLowerCase().includes(search.toLowerCase())
);
```

## Components to Migrate

### High Priority
1. ✅ AdminProducts - Use productsSlice
2. ✅ AdminCategories - Use categoriesSlice
3. ✅ AdminFeaturedProducts - Use featuredProductsSlice
4. ✅ AdminOrders - Use ordersSlice
5. ✅ AdminDashboard - Use analyticsSlice
6. ✅ Products (user) - Use productsSlice
7. ✅ Categories (user) - Use categoriesSlice
8. ✅ AllFeaturedProducts - Use featuredProductsSlice

### Medium Priority
9. ProductShowcase - Use featuredProductsSlice
10. BrowseByCategory - Use categoriesSlice
11. LatestItems - Use productsSlice

## Best Practices

1. **Always use typed hooks**: `useAppDispatch` and `useAppSelector`
2. **Use .unwrap()** for error handling in async operations
3. **Don't refetch after mutations** - Redux automatically updates
4. **Cache data** - Check lastFetch before fetching
5. **Clear state on logout** - Use clear actions

## Testing

```typescript
// Test if data is in store
const products = useAppSelector((state) => state.products.items);
console.log("Products in store:", products.length);

// Test loading state
const loading = useAppSelector((state) => state.products.loading);
console.log("Loading:", loading);

// Test last fetch time
const lastFetch = useAppSelector((state) => state.products.lastFetch);
console.log("Last fetched:", new Date(lastFetch || 0).toLocaleString());
```

## Next Steps

1. Migrate AdminProducts to use Redux
2. Migrate AdminCategories to use Redux
3. Migrate AdminDashboard to use Redux
4. Migrate user-facing pages
5. Remove old useState/useEffect patterns
6. Test all CRUD operations
7. Verify no duplicate API calls

## Files Created

1. `frontend/src/store/index.ts` - Store configuration
2. `frontend/src/store/hooks.ts` - Typed hooks
3. `frontend/src/store/slices/productsSlice.ts`
4. `frontend/src/store/slices/categoriesSlice.ts`
5. `frontend/src/store/slices/featuredProductsSlice.ts`
6. `frontend/src/store/slices/ordersSlice.ts`
7. `frontend/src/store/slices/analyticsSlice.ts`
