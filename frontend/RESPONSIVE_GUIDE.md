# Responsive Design Guide - Tailwind CSS

## Breakpoints

```
sm:  640px  (Mobile landscape)
md:  768px  (Tablet)
lg:  1024px (Desktop)
xl:  1280px (Large desktop)
2xl: 1536px (Extra large)
```

## Common Patterns

### 1. Container Width
```jsx
<div className="container mx-auto px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>
```

### 2. Grid Layout
```jsx
{/* Mobile: 1 col, Tablet: 2 cols, Desktop: 3 cols */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

{/* Mobile: 2 cols, Desktop: 4 cols */}
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Products */}
</div>
```

### 3. Flex Layout
```jsx
{/* Stack on mobile, row on desktop */}
<div className="flex flex-col lg:flex-row gap-4">
  <div className="w-full lg:w-1/3">Sidebar</div>
  <div className="w-full lg:w-2/3">Content</div>
</div>
```

### 4. Text Sizes
```jsx
<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
  Responsive Heading
</h1>

<p className="text-sm sm:text-base lg:text-lg">
  Responsive paragraph
</p>
```

### 5. Spacing
```jsx
{/* Padding */}
<div className="p-4 sm:p-6 lg:p-8">Content</div>

{/* Margin */}
<div className="mt-4 sm:mt-6 lg:mt-8">Content</div>

{/* Gap */}
<div className="flex gap-2 sm:gap-4 lg:gap-6">Items</div>
```

### 6. Hide/Show Elements
```jsx
{/* Hide on mobile, show on desktop */}
<div className="hidden lg:block">Desktop only</div>

{/* Show on mobile, hide on desktop */}
<div className="block lg:hidden">Mobile only</div>
```

### 7. Navigation
```jsx
{/* Mobile menu */}
<nav className="lg:hidden">
  <button>☰ Menu</button>
</nav>

{/* Desktop menu */}
<nav className="hidden lg:flex gap-6">
  <a href="/">Home</a>
  <a href="/products">Products</a>
</nav>
```

### 8. Image Sizes
```jsx
<img 
  src="/image.jpg" 
  className="w-full sm:w-1/2 lg:w-1/3 h-auto"
  alt="Responsive"
/>
```

### 9. Card Layout
```jsx
<div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
  <img 
    src="/product.jpg" 
    className="w-full h-48 sm:h-64 object-cover rounded"
  />
  <h3 className="text-lg sm:text-xl font-bold mt-4">Product</h3>
  <p className="text-sm sm:text-base text-gray-600 mt-2">Description</p>
  <button className="w-full sm:w-auto mt-4 px-6 py-2 bg-purple-600 text-white rounded">
    Buy Now
  </button>
</div>
```

### 10. Hero Section
```jsx
<section className="py-12 sm:py-16 lg:py-24">
  <div className="container mx-auto px-4">
    <div className="flex flex-col lg:flex-row items-center gap-8">
      <div className="w-full lg:w-1/2">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
          Welcome to Store
        </h1>
        <p className="text-base sm:text-lg mt-4">
          Best furniture in Nepal
        </p>
        <button className="mt-6 px-8 py-3 bg-purple-600 text-white rounded-lg text-sm sm:text-base">
          Shop Now
        </button>
      </div>
      <div className="w-full lg:w-1/2">
        <img src="/hero.jpg" className="w-full rounded-lg" />
      </div>
    </div>
  </div>
</section>
```

## Complete Example - Product Page

```jsx
function ProductPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <h1 className="text-xl sm:text-2xl font-bold">Store</h1>
            
            {/* Mobile menu button */}
            <button className="lg:hidden">☰</button>
            
            {/* Desktop nav */}
            <nav className="hidden lg:flex gap-6">
              <a href="/">Home</a>
              <a href="/products">Products</a>
              <a href="/cart">Cart</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img 
                src={product.image} 
                className="w-full h-48 sm:h-56 lg:h-64 object-cover"
              />
              <div className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold">{product.name}</h3>
                <p className="text-sm sm:text-base text-gray-600 mt-2">
                  Rs. {product.price}
                </p>
                <button className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded text-sm sm:text-base">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h4 className="text-lg font-bold mb-4">About</h4>
              <p className="text-sm text-gray-400">Best furniture store</p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/">Home</a></li>
                <li><a href="/products">Products</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
```

## Tips

1. **Mobile First**: Start with mobile styles, then add larger breakpoints
   ```jsx
   className="text-sm md:text-base lg:text-lg"
   ```

2. **Test on Real Devices**: Use Chrome DevTools responsive mode

3. **Touch Targets**: Minimum 44x44px for buttons on mobile
   ```jsx
   className="min-h-[44px] min-w-[44px]"
   ```

4. **Readable Text**: 16px minimum on mobile
   ```jsx
   className="text-base" // 16px
   ```

5. **Max Width**: Prevent content from being too wide
   ```jsx
   className="max-w-7xl mx-auto"
   ```

## Common Issues & Fixes

### Issue: Text too small on mobile
```jsx
// ❌ Bad
<p className="text-xs">Text</p>

// ✅ Good
<p className="text-sm sm:text-base">Text</p>
```

### Issue: Images overflow
```jsx
// ❌ Bad
<img src="/img.jpg" />

// ✅ Good
<img src="/img.jpg" className="w-full h-auto" />
```

### Issue: Buttons too small on mobile
```jsx
// ❌ Bad
<button className="px-2 py-1">Click</button>

// ✅ Good
<button className="px-6 py-3 sm:px-8 sm:py-4">Click</button>
```

### Issue: Too much content on mobile
```jsx
// ❌ Bad
<div className="grid grid-cols-4 gap-2">

// ✅ Good
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
```

## Testing Checklist

- [ ] Mobile (375px - iPhone SE)
- [ ] Mobile (390px - iPhone 12/13)
- [ ] Tablet (768px - iPad)
- [ ] Desktop (1024px)
- [ ] Large Desktop (1440px)
- [ ] Touch targets are 44x44px minimum
- [ ] Text is readable (16px+)
- [ ] Images don't overflow
- [ ] Navigation works on all sizes
- [ ] Forms are easy to use on mobile
