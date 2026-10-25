import { lazy } from "react";
import { Route } from "react-router-dom";

const Login = lazy(() => import("../pages/auth/login"));
const Signup = lazy(() => import("../pages/auth/signup"));
const VerifyEmail = lazy(() => import("../pages/auth/VerifyEmail"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));
const VerifyOTP = lazy(() => import("../pages/main/VerifyOTP"));
const PaymentSuccess = lazy(() => import("../pages/main/PaymentSuccess"));
const PaymentFailed = lazy(() => import("../pages/main/PaymentFailed"));

const AuthRoutes = () => (
  <>
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/verify-email" element={<VerifyEmail />} />
    <Route path="/verify-otp" element={<VerifyOTP />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="/payment/success" element={<PaymentSuccess />} />
    <Route path="/payment/failed" element={<PaymentFailed />} />
  </>
);

export default AuthRoutes;
