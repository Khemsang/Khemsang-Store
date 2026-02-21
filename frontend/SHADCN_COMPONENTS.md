# Shadcn/UI Components Implementation

## Installed Packages
```bash
npm install recharts class-variance-authority clsx tailwind-merge lucide-react
```

## Created Components

### 1. UI Components (Shadcn Style)
- `src/components/ui/card.tsx` - Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- `src/components/ui/button.tsx` - Button with variants (default, outline, ghost, destructive)
- `src/components/ui/badge.tsx` - Badge with variants (default, success, warning, danger, info)
- `src/components/ui/input.tsx` - Input field
- `src/components/ui/label.tsx` - Form label
- `src/components/ui/select.tsx` - Select dropdown
- `src/components/ui/textarea.tsx` - Textarea field

### 2. Utility Functions
- `src/lib/utils.ts` - cn() function for className merging

### 3. Form Components
- `src/components/forms/ProductForm.tsx` - Example form using shadcn components

### 4. Enhanced Dashboard
- `src/pages/admin/AdminDashboardEnhanced.tsx` - Complete analytics dashboard with:
  - Real-time data from backend `/stats/analytics` endpoint
  - 4 stat cards with gradients and icons
  - Area chart for revenue trend (6 months)
  - Pie chart for order status distribution
  - Bar chart for monthly revenue comparison
  - Line chart for revenue growth
  - Order status cards (Pending, Processing, Shipped, Delivered, Cancelled)
  - Recent orders list

## Usage Examples

### Using Card Component
```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

### Using Form Components
```tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

<div className="space-y-2">
  <Label htmlFor="name">Name</Label>
  <Input id="name" placeholder="Enter name" />
  <Button type="submit">Submit</Button>
</div>
```

### Using Badge
```tsx
import { Badge } from "@/components/ui/badge";

<Badge variant="success">Active</Badge>
<Badge variant="danger">Inactive</Badge>
<Badge variant="warning">Pending</Badge>
```

## Dashboard Features

### Revenue Analytics
- **Monthly Revenue Trend**: Area chart showing last 6 months
- **Revenue Comparison**: Bar chart for month-to-month comparison
- **Revenue Growth**: Line chart showing growth trajectory

### Order Analytics
- **Order Distribution**: Pie chart showing orders by status
- **Status Cards**: Quick view of pending, processing, shipped, delivered orders
- **Recent Orders**: List of latest 5 orders with status badges

### Key Metrics
- Total Revenue (with percentage change)
- Total Orders (with trend)
- Total Products (inventory count)
- Total Customers (registered users)

## Backend Integration

Dashboard fetches data from:
```
GET /api/stats/analytics
```

Response includes:
- `totalRevenue`: Sum of all paid orders
- `totalOrders`: Total order count
- `totalProducts`: Product count
- `totalCustomers`: Customer count
- `monthlyRevenue`: Array of {month, revenue} for last 6 months
- `ordersByStatus`: Array of {status, count}
- `recentOrders`: Latest 5 orders

## Color Scheme

### Gradients
- Revenue: `from-emerald-500 to-teal-600`
- Orders: `from-blue-500 to-cyan-600`
- Products: `from-purple-500 to-pink-600`
- Customers: `from-orange-500 to-red-600`

### Status Colors
- Pending: `#f59e0b` (yellow)
- Processing: `#3b82f6` (blue)
- Shipped: `#8b5cf6` (purple)
- Delivered: `#10b981` (green)
- Cancelled: `#ef4444` (red)

## Dark Mode Support
All components support dark mode with proper color variants using Tailwind's `dark:` prefix.

## Icons
Using Lucide React icons:
- Package, ShoppingCart, DollarSign, TrendingUp
- Users, AlertTriangle, CheckCircle, Clock, Truck
- ArrowUpRight, ArrowDownRight

## Responsive Design
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 4 columns for stat cards
- Charts: Full width on mobile, 2 columns on desktop
