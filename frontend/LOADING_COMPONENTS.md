# E-Commerce Loading Components

This document describes the e-commerce themed loading components available in the project.

## Components Overview

All loading components are located in `frontend/src/components/ui/loading.tsx`

### 1. Loading (Main Component)

The primary loading component with multiple variants for different contexts.

**Props:**
- `message?: string` - Custom loading message (default: "Loading...")
- `variant?: "default" | "cart" | "product" | "delivery"` - Loading animation style

**Variants:**

#### Default
```tsx
<Loading message="Loading..." variant="default" />
```
- Blue/orange gradient spinner
- Generic loading animation
- Use for: Dashboard, general pages

#### Cart
```tsx
<Loading message="Loading cart..." variant="cart" />
```
- Shopping cart icon with blue/orange spinner
- Use for: Cart page, cart operations

#### Product
```tsx
<Loading message="Loading products..." variant="product" />
```
- Package icon with green/blue spinner
- Use for: Product listings, product details

#### Delivery
```tsx
<Loading message="Processing delivery..." variant="delivery" />
```
- Truck icon with orange/green spinner
- Use for: Checkout, order tracking, shipping

### 2. LoadingOverlay

Full-page loading overlay with backdrop blur.

```tsx
<LoadingOverlay message="Processing payment..." />
```

**Features:**
- Fixed position covering entire viewport
- Semi-transparent backdrop with blur effect
- Shopping cart icon animation
- Use for: Payment processing, critical operations

### 3. SkeletonCard

Skeleton loader for card-style content.

```tsx
<SkeletonCard />
```

**Use for:**
- Dashboard stat cards
- Content cards while loading
- List items

### 4. SkeletonProduct

Skeleton loader for product grid items.

```tsx
<SkeletonProduct />
```

**Use for:**
- Product grid loading states
- Product listings
- Featured products

### 5. Spinner

Inline spinner for buttons and small spaces.

```tsx
<Spinner size="sm" />
<Spinner size="md" />
<Spinner size="lg" />
```

**Sizes:**
- `sm`: 16px (w-4 h-4)
- `md`: 24px (w-6 h-6) - default
- `lg`: 32px (w-8 h-8)

**Use for:**
- Button loading states
- Inline loading indicators
- Form submissions

### 6. DotsLoading

Animated dots loading indicator.

```tsx
<DotsLoading />
```

**Features:**
- Three bouncing dots (blue, orange, green)
- Staggered animation
- Use for: Subtle loading states, chat/messaging

### 7. ProgressLoading

Progress bar with percentage.

```tsx
<ProgressLoading progress={45} />
```

**Props:**
- `progress?: number` - Progress percentage (0-100)

**Use for:**
- File uploads
- Multi-step processes
- Download progress

## Color Scheme

All loading components follow the project color scheme:
- Primary: Blue (#3b82f6)
- Secondary: Orange (#f97316)
- Success: Green (#10b981)
- Neutral: Gray

## Usage Examples

### Admin Dashboard
```tsx
if (loading) {
  return <Loading message="Loading analytics..." variant="default" />;
}
```

### Product Page
```tsx
if (loading) {
  return <Loading message="Loading products..." variant="product" />;
}
```

### Cart Page
```tsx
if (loading) {
  return <Loading message="Loading your cart..." variant="cart" />;
}
```

### Checkout Page
```tsx
if (processing) {
  return <LoadingOverlay message="Processing your order..." />;
}
```

### Button Loading State
```tsx
<button disabled={loading}>
  {loading ? <Spinner size="sm" /> : "Submit"}
</button>
```

## Implementation Status

✅ Created loading components library
✅ Updated AdminDashboardEnhanced
✅ Updated App.tsx loading states
⏳ Pending: Other admin pages
⏳ Pending: User-facing pages (products, cart, checkout)

## Notes

- All components support dark mode
- Animations use Tailwind CSS utilities
- Icons from lucide-react library
- Responsive design included
- No purple/pink colors (following project color scheme)
