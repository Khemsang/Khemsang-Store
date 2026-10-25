import { lazy, Suspense, useEffect, useState } from "react";
import { Routes } from "react-router-dom";
import { Provider } from "react-redux";

import { store } from "./store";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { LoadingProvider } from "./context/LoadingContext";
import { MessageProvider } from "./context/MessageContext";

import ErrorBoundary from "./components/ErrorBoundary";
import ScrollToTop from "./components/common/ScrollToTop";
import BackToTop from "./components/ui/BackToTop";
import AppSpinner from "./components/common/AppSpinner";

import AdminRoutes from "./routes/AdminRoutes";
import AuthRoutes from "./routes/AuthRoutes";
import MainRoutes from "./routes/MainRoutes";

import { api } from "./services/api";

const MaintenancePage = lazy(() => import("./pages/main/MaintenancePage"));

// ---------------------------------------------------------------------------
// AppRoutes — maintenance check + route composition
// ---------------------------------------------------------------------------
const AppRoutes = () => {
  const { user, loading: authLoading } = useAuth();

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [maintenanceLoading, setMaintenanceLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin-management/maintenance-status")
      .then((res) => {
        setMaintenanceMode(res.data.maintenanceMode);
        setMaintenanceMessage(res.data.maintenanceMessage);
      })
      .catch(() => {})
      .finally(() => setMaintenanceLoading(false));
  }, []);

  if (authLoading || maintenanceLoading) return <AppSpinner />;

  if (maintenanceMode && !user?.isSuperAdmin) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-purple-900" />}>
        <MaintenancePage message={maintenanceMessage} />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<AppSpinner />}>
      <Routes>
        {AdminRoutes()}
        {AuthRoutes()}
        {MainRoutes()}
      </Routes>
    </Suspense>
  );
};

// ---------------------------------------------------------------------------
// App — provider tree only
// ---------------------------------------------------------------------------
const App = () => (
  <ErrorBoundary>
    <Provider store={store}>
      <ThemeProvider>
        <ToastProvider>
          <LoadingProvider>
            <AuthProvider>
              <MessageProvider>
                <CartProvider>
                  <ScrollToTop />
                  <AppRoutes />
                  <BackToTop />
                </CartProvider>
              </MessageProvider>
            </AuthProvider>
          </LoadingProvider>
        </ToastProvider>
      </ThemeProvider>
    </Provider>
  </ErrorBoundary>
);

export default App;
