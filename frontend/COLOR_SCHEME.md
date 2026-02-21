# Color Scheme - Gray, Black, Blue, Orange, Green & White

## Primary Colors

### Main Gradients
- **Primary Gradient**: `from-blue-600 to-orange-600`
- **Success Gradient**: `from-green-500 to-emerald-600`
- **Warning Gradient**: `from-orange-500 to-amber-600`
- **Danger Gradient**: `from-orange-600 to-red-600`
- **Neutral Gradient**: `from-gray-600 to-gray-800`

### Background Gradients
- **Light Background**: `from-white via-blue-50/50 to-orange-50/50`
- **Dark Background**: `from-gray-900 via-blue-900/20 to-gray-900`

## Component Colors

### Buttons
- **Default**: `bg-gradient-to-r from-blue-600 to-orange-600`
- **Hover**: `hover:from-blue-700 hover:to-orange-700`
- **Destructive**: `bg-gradient-to-r from-orange-600 to-red-600`
- **Outline**: `border-gray-300 dark:border-gray-600`

### Badges
- **Success**: `bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400`
- **Warning**: `bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400`
- **Danger**: `bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400`
- **Info**: `bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400`
- **Default**: `bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100`

### Cards
- **Background**: `bg-white dark:bg-gray-800`
- **Border**: `border-gray-200 dark:border-gray-700`
- **Hover**: `hover:shadow-lg`

### Inputs
- **Border**: `border-gray-300 dark:border-gray-600`
- **Background**: `bg-white dark:bg-gray-800`
- **Focus Ring**: `focus:ring-2 focus:ring-blue-500`
- **Text**: `text-gray-900 dark:text-gray-100`
- **Placeholder**: `placeholder:text-gray-400`

### Dashboard Stats
- **Revenue**: `from-green-500 to-emerald-600` (Green for money)
- **Orders**: `from-blue-500 to-cyan-600` (Blue for activity)
- **Products**: `from-orange-500 to-amber-600` (Orange for items)
- **Customers**: `from-gray-600 to-gray-800` (Gray for users)

### Order Status
- **Pending**: `text-orange-500` / `bg-orange-100`
- **Processing**: `text-blue-500` / `bg-blue-100`
- **Shipped**: `text-blue-600` / `bg-blue-100`
- **Delivered**: `text-green-500` / `bg-green-100`
- **Cancelled**: `text-red-500` / `bg-red-100`

### Charts
- **Area Chart**: `stroke="#3b82f6"` (Blue)
- **Bar Chart**: `fill="#3b82f6"` (Blue)
- **Line Chart**: `stroke="#10b981"` (Green)
- **Pie Chart**: 
  - Pending: `#f59e0b` (Orange)
  - Processing: `#3b82f6` (Blue)
  - Shipped: `#3b82f6` (Blue)
  - Delivered: `#10b981` (Green)
  - Cancelled: `#ef4444` (Red)

## Text Colors
- **Primary**: `text-gray-900 dark:text-white`
- **Secondary**: `text-gray-600 dark:text-gray-400`
- **Muted**: `text-gray-500 dark:text-gray-500`
- **Link**: `text-blue-600 hover:text-blue-700`
- **Success**: `text-green-600`
- **Warning**: `text-orange-600`
- **Danger**: `text-red-600`

## Loading States
- **Spinner**: `border-blue-600`
- **Pulse**: `bg-gradient-to-br from-blue-500 to-orange-500`

## Shadows
- **Small**: `shadow-sm`
- **Medium**: `shadow-lg`
- **Large**: `shadow-xl`

## Usage Examples

### Button
```tsx
<Button className="bg-gradient-to-r from-blue-600 to-orange-600">
  Click Me
</Button>
```

### Card with Gradient Header
```tsx
<Card>
  <div className="bg-gradient-to-r from-blue-600 to-orange-600 p-6">
    <h2 className="text-white">Title</h2>
  </div>
  <CardContent>Content</CardContent>
</Card>
```

### Status Badge
```tsx
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Cancelled</Badge>
<Badge variant="info">Processing</Badge>
```

## Notes
- All colors support dark mode
- Gradients use blue and orange as primary colors
- Green is used for success/money
- Orange/Red for warnings/errors
- Gray/Black for neutral elements
- White backgrounds with subtle gradients
