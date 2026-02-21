# Admin Dashboard - Shadcn Components

## Overview
Admin dashboard using shadcn components with clean, modern design and real-time analytics.

## Implementation

### Dashboard File
`frontend/src/pages/admin/AdminDashboard.tsx`

### Features
- Shadcn/ui components (Card, Button, Badge)
- Real-time data from `/stats/analytics` API
- Modern, professional design
- Responsive layout with dark mode support
- Export to Excel functionality

### Components Used

**Shadcn Components:**
- Card, CardHeader, CardTitle, CardContent
- Button with variants and icons
- Badge for status indicators

**Charts (Recharts):**
- Area Chart - Revenue trend
- Pie Chart - Order status distribution
- Bar Chart - Monthly revenue comparison

### Layout Structure

```
Dashboard
├── Header (Title + Actions: Refresh, Export)
├── Stats Grid (4 cards)
│   ├── Total Revenue
│   ├── Total Orders
│   ├── Products
│   └── Customers
└── Charts Grid
    ├── Revenue Trend (6 months)
    ├── Order Status Distribution
    ├── Monthly Revenue Comparison
    └── Recent Orders List
```

## Data Source
All data is fetched from backend API: `GET /api/stats/analytics`

**No demo or mock data is used - all data is real from database.**

## Color Scheme

**Stat Card Gradients:**
- Revenue: Green to Emerald
- Orders: Blue to Cyan
- Products: Orange to Amber
- Customers: Gray to Dark Gray

**Chart Colors:**
- Primary: Blue (#3b82f6)
- Success: Green (#10b981)
- Warning: Orange (#f59e0b)
- Danger: Red (#ef4444)

## Responsive Design

- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 4 columns (stats), 2 columns (charts)
