# Fixed Sizes to Responsive - Quick Reference

## Common Replacements

### 1. Fixed Widths → Responsive
```tsx
// ❌ Before
className="w-[280px]"
className="w-[300px]"
className="w-[400px]"
className="w-[500px]"
className="w-[600px]"
className="w-[1200px]"

// ✅ After
className="w-full max-w-xs"      // 280px → 320px max
className="w-full max-w-sm"      // 300px → 384px max
className="w-full max-w-md"      // 400px → 448px max
className="w-full max-w-lg"      // 500px → 512px max
className="w-full max-w-xl"      // 600px → 576px max
className="w-full max-w-7xl"     // 1200px → 1280px max
```

### 2. Fixed Heights → Auto/Responsive
```tsx
// ❌ Before
className="h-[200px]"
className="h-[300px]"
className="h-[400px]"
className="h-[500px]"
className="h-[600px]"
className="min-h-[60vh]"

// ✅ After
className="h-auto"
className="h-48 sm:h-56 lg:h-64"     // 200px responsive
className="h-64 sm:h-72 lg:h-80"     // 300px responsive
className="h-80 sm:h-96 lg:h-[28rem]" // 400px responsive
className="min-h-screen sm:min-h-[600px]"
className="min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]"
```

### 3. Fixed Min-Width → Responsive
```tsx
// ❌ Before
className="min-w-[150px]"
className="min-w-[200px]"
className="min-w-[250px]"
className="min-w-[300px]"

// ✅ After
className="min-w-0 sm:min-w-[150px]"
className="min-w-0 sm:min-w-[200px]"
className="w-full sm:w-auto sm:min-w-[250px]"
className="w-full sm:w-auto sm:min-w-[300px]"
```

### 4. Fixed Max-Height → Responsive
```tsx
// ❌ Before
className="max-h-[90vh]"
className="max-h-[400px]"
className="max-h-[calc(90vh-100px)]"

// ✅ After
className="max-h-screen sm:max-h-[90vh]"
className="max-h-96 sm:max-h-[400px]"
className="max-h-[80vh] sm:max-h-[calc(90vh-100px)]"
```

### 5. Sidebar/Menu Widths
```tsx
// ❌ Before
className="w-[280px]"  // Mobile menu

// ✅ After
className="w-4/5 sm:w-80 max-w-sm"  // 80% on mobile, 320px on desktop
```

### 6. Modal Widths
```tsx
// ❌ Before
className="max-w-4xl w-full max-h-[90vh]"

// ✅ After (Already good! But can improve)
className="w-[95%] sm:w-full sm:max-w-4xl max-h-[90vh]"
```

### 7. Image Heights
```tsx
// ❌ Before
className="h-[300px] md:h-[400px]"
className="h-[400px] md:h-[500px]"

// ✅ After
className="h-48 sm:h-64 md:h-80 lg:h-96"
className="h-64 sm:h-80 md:h-96 lg:h-[28rem]"
```

### 8. Card/Container Heights
```tsx
// ❌ Before
className="h-[60vh]"
className="min-h-[600px]"

// ✅ After
className="h-auto min-h-[50vh] sm:h-[60vh]"
className="min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]"
```

## Tailwind Size Reference

### Width Classes
- `w-full` = 100%
- `w-screen` = 100vw
- `w-auto` = auto
- `w-1/2` = 50%
- `w-1/3` = 33.333%
- `w-2/3` = 66.666%
- `w-1/4` = 25%
- `w-3/4` = 75%

### Max-Width Classes
- `max-w-xs` = 320px
- `max-w-sm` = 384px
- `max-w-md` = 448px
- `max-w-lg` = 512px
- `max-w-xl` = 576px
- `max-w-2xl` = 672px
- `max-w-3xl` = 768px
- `max-w-4xl` = 896px
- `max-w-5xl` = 1024px
- `max-w-6xl` = 1152px
- `max-w-7xl` = 1280px

### Height Classes
- `h-auto` = auto
- `h-full` = 100%
- `h-screen` = 100vh
- `h-48` = 12rem (192px)
- `h-56` = 14rem (224px)
- `h-64` = 16rem (256px)
- `h-72` = 18rem (288px)
- `h-80` = 20rem (320px)
- `h-96` = 24rem (384px)

## Priority Fixes

### High Priority (User-facing)
1. ✅ Navbar mobile menu width
2. ✅ Product card images
3. ✅ Modal widths
4. ✅ Hero section heights
5. ✅ Cart page width

### Medium Priority
6. ✅ Feature cards
7. ✅ Banner heights
8. ✅ About page images
9. ✅ Comparison table columns

### Low Priority
10. ✅ Toast notifications
11. ✅ Dropdown menus
12. ✅ Background blur effects

## Auto-Fix Script

Run this to find all fixed sizes:
```bash
# Find all w-[ and h-[ in TSX files
grep -r "w-\[" frontend/src --include="*.tsx"
grep -r "h-\[" frontend/src --include="*.tsx"
```

## Testing Checklist
- [ ] Mobile (375px)
- [ ] Tablet (768px)
- [ ] Desktop (1024px)
- [ ] Large (1440px)
- [ ] All images scale properly
- [ ] No horizontal scroll
- [ ] Text is readable
- [ ] Buttons are touchable (44px min)
