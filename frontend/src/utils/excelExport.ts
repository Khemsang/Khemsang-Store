import * as XLSX from 'xlsx';

interface ExportData {
  data: any[];
  filename: string;
  sheetName?: string;
}

/**
 * Export data to Excel file
 */
export const exportToExcel = ({ data, filename, sheetName = 'Sheet1' }: ExportData) => {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, `${filename}.xlsx`);

    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return false;
  }
};

/**
 * Export orders to Excel
 */
export const exportOrdersToExcel = (orders: any[]) => {
  const formattedData = orders.map((order, index) => ({
    'S.N.': index + 1,
    'Order ID': order._id?.slice(-8) || 'N/A',
    'Customer Name': order.shippingAddress?.fullName || order.user?.name || 'N/A',
    'Email': order.user?.email || 'N/A',
    'Phone': order.shippingAddress?.phone || 'N/A',
    'Address': `${order.shippingAddress?.address || ''}, ${order.shippingAddress?.city || ''}`,
    'Total Amount (Rs.)': order.totalAmount || 0,
    'Payment Method': order.paymentMethod || 'N/A',
    'Payment Status': order.paymentStatus || 'N/A',
    'Order Status': order.orderStatus || 'N/A',
    'Items Count': order.items?.length || 0,
    'Order Date': new Date(order.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
  }));

  return exportToExcel({
    data: formattedData,
    filename: `Orders_Report_${new Date().toISOString().split('T')[0]}`,
    sheetName: 'Orders',
  });
};

/**
 * Export products to Excel
 */
export const exportProductsToExcel = (products: any[]) => {
  const formattedData = products.map((product, index) => ({
    'S.N.': index + 1,
    'Product Name': product.name || 'N/A',
    'Category': product.category?.name || 'N/A',
    'Brand': product.brand || 'N/A',
    'Price (Rs.)': product.price || 0,
    'Stock': product.stock || 0,
    'Status': product.stock > 0 ? 'In Stock' : 'Out of Stock',
    'Rating': product.rating || 0,
    'Reviews': product.numReviews || 0,
    'Created Date': new Date(product.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
  }));

  return exportToExcel({
    data: formattedData,
    filename: `Products_Report_${new Date().toISOString().split('T')[0]}`,
    sheetName: 'Products',
  });
};

/**
 * Export customers to Excel
 */
export const exportCustomersToExcel = (customers: any[]) => {
  const formattedData = customers.map((customer, index) => ({
    'S.N.': index + 1,
    'Name': customer.name || 'N/A',
    'Email': customer.email || 'N/A',
    'Phone': customer.phone || 'N/A',
    'Status': customer.isBlocked ? 'Blocked' : 'Active',
    'Verified': customer.isVerified ? 'Yes' : 'No',
    'Total Orders': customer.totalOrders || 0,
    'Total Spent (Rs.)': customer.totalSpent || 0,
    'Joined Date': new Date(customer.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
  }));

  return exportToExcel({
    data: formattedData,
    filename: `Customers_Report_${new Date().toISOString().split('T')[0]}`,
    sheetName: 'Customers',
  });
};

/**
 * Export analytics/dashboard data to Excel with multiple sheets
 */
export const exportAnalyticsToExcel = (analytics: any) => {
  try {
    const workbook = XLSX.utils.book_new();

    // Summary Sheet
    const summaryData = [
      { Metric: 'Total Revenue', Value: `Rs. ${analytics.totalRevenue?.toLocaleString() || 0}` },
      { Metric: 'Total Orders', Value: analytics.totalOrders || 0 },
      { Metric: 'Total Products', Value: analytics.totalProducts || 0 },
      { Metric: 'Total Customers', Value: analytics.totalCustomers || 0 },
      { Metric: 'Report Generated', Value: new Date().toLocaleString() },
    ];
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Monthly Revenue Sheet
    if (analytics.monthlyRevenue && analytics.monthlyRevenue.length > 0) {
      const revenueData = analytics.monthlyRevenue.map((item: any) => ({
        Month: item.month,
        'Revenue (Rs.)': item.revenue || 0,
      }));
      const revenueSheet = XLSX.utils.json_to_sheet(revenueData);
      XLSX.utils.book_append_sheet(workbook, revenueSheet, 'Monthly Revenue');
    }

    // Order Status Sheet
    if (analytics.ordersByStatus && analytics.ordersByStatus.length > 0) {
      const statusData = analytics.ordersByStatus.map((item: any) => ({
        Status: item.status?.charAt(0).toUpperCase() + item.status?.slice(1) || 'N/A',
        Count: item.count || 0,
      }));
      const statusSheet = XLSX.utils.json_to_sheet(statusData);
      XLSX.utils.book_append_sheet(workbook, statusSheet, 'Order Status');
    }

    // Recent Orders Sheet
    if (analytics.recentOrders && analytics.recentOrders.length > 0) {
      const ordersData = analytics.recentOrders.map((order: any, index: number) => ({
        'S.N.': index + 1,
        'Order ID': order._id?.slice(-8) || 'N/A',
        'Customer': order.shippingAddress?.fullName || 'N/A',
        'Amount (Rs.)': order.totalAmount || 0,
        'Status': order.orderStatus || 'N/A',
        'Date': new Date(order.createdAt).toLocaleDateString(),
      }));
      const ordersSheet = XLSX.utils.json_to_sheet(ordersData);
      XLSX.utils.book_append_sheet(workbook, ordersSheet, 'Recent Orders');
    }

    // Generate and download
    XLSX.writeFile(workbook, `Analytics_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    return true;
  } catch (error) {
    console.error('Error exporting analytics:', error);
    return false;
  }
};

/**
 * Export revenue report to Excel
 */
export const exportRevenueReportToExcel = (data: any) => {
  const formattedData = data.map((item: any) => ({
    'Month': item.month || item.date,
    'Revenue (Rs.)': item.revenue || 0,
    'Orders': item.orders || 0,
    'Average Order Value (Rs.)': item.orders > 0 ? Math.round(item.revenue / item.orders) : 0,
  }));

  return exportToExcel({
    data: formattedData,
    filename: `Revenue_Report_${new Date().toISOString().split('T')[0]}`,
    sheetName: 'Revenue',
  });
};
