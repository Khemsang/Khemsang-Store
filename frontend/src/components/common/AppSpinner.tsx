const AppSpinner = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-900">
    <div className="w-20 h-20 border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 rounded-full animate-spin" />
  </div>
);

export default AppSpinner;
