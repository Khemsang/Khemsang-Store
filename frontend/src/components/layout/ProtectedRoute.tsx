import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute = ({
  children,
  adminOnly = false,
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:from-gray-900 dark:via-blue-900/10 dark:to-gray-900">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            {/* Rotating gradient ring */}
            <div className="absolute inset-0 rounded-full bg-blue-500 animate-spin"></div>
            <div className="absolute inset-1 rounded-full bg-white dark:bg-gray-900"></div>
            
            {/* Inner spinning ring */}
            <div className="absolute inset-3 rounded-full border-4 border-transparent border-t-blue-600 border-r-orange-600 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
            
            {/* Center lock icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
                <svg className="w-6 h-6 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-semibold">Verifying access...</p>
          <div className="flex justify-center gap-2 mt-4">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    // Store the current path to redirect back after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
