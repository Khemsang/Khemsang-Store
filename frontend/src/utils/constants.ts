// Status Colors
export const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    delivered:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    pending:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    processing:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    shipped: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
  return (
    colors[status] ||
    "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
  );
};

// Format Currency
export const formatCurrency = (amount: number) =>
  `Rs. ${amount.toLocaleString()}`;

// Format Date
export const formatDate = (date: string) => new Date(date).toLocaleDateString();
