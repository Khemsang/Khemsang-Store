import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { api } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { updateUser } = useAuth();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("");
  const verifiedRef = useRef(false);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link");
      toast.error("Invalid verification link");
      return;
    }

    if (verifiedRef.current) return;
    verifiedRef.current = true;
    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const { data } = await api.get(`/auth/verify-email?token=${token}`);
      
      if (data.user) {
        // Set full user object for proper login state
        updateUser(data.user);
        toast.success("Email verified successfully!");
        
        // Redirect immediately based on user role
        setTimeout(() => {
          if (data.user.isSuperAdmin) {
            navigate("/admin/super-admin", { replace: true });
          } else if (data.user.isAdmin) {
            navigate("/admin/dashboard", { replace: true });
          } else {
            navigate("/", { replace: true });
          }
        }, 1000);
        
        setStatus("success");
        setMessage("Redirecting...");
      }
    } catch (error: any) {
      setStatus("error");
      const errorMsg = error.response?.data?.message || "Verification failed";
      setMessage(errorMsg);
      toast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600">
      <div className="text-center text-white">
        {status === "verifying" && (
          <>
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2">Verifying Email...</h1>
            <p className="text-white/80">Please wait while we verify your email address</p>
          </>
        )}
        
        {status === "success" && (
          <>
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">Email Verified!</h1>
            <p className="text-white/80">{message}</p>
          </>
        )}
        
        {status === "error" && (
          <>
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">Verification Failed</h1>
            <p className="text-white/80 mb-4">{message}</p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/login"
                className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                Go to Login
              </Link>
              <Link
                to="/signup"
                className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                Try Again
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
