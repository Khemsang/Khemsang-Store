import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams, useLocation, Link } from "react-router-dom";
import { api } from "../../services/api";
import { useToast } from "../../context/ToastContext";

type Status = "verifying" | "success" | "error-expired" | "error-invalid" | "needs-verification";

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [status, setStatus] = useState<Status>("verifying");
  const [message, setMessage] = useState("");

  // Resend form state
  const [resendEmail, setResendEmail] = useState(
    // Pre-fill email if redirected from login page
    (location.state as any)?.email || ""
  );
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [resendError, setResendError] = useState("");

  // 15-minute countdown state
  const [secondsLeft, setSecondsLeft] = useState(15 * 60);

  const verifiedRef = useRef(false);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start countdown once the page loads (token was just sent)
  useEffect(() => {
    countdownRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(countdownRef.current!);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(countdownRef.current!);
  }, []);

  useEffect(() => {
    // Redirected from login because email isn't verified yet
    if ((location.state as any)?.needsVerification) {
      setStatus("needs-verification");
      setMessage("Your email address is not verified yet.");
      return;
    }

    const token = searchParams.get("token");
    if (!token) {
      setStatus("error-invalid");
      setMessage("No verification token found in this link.");
      return;
    }
    if (verifiedRef.current) return;
    verifiedRef.current = true;
    runVerify(token);
  }, [searchParams, location.state]);

  const runVerify = async (token: string) => {
    try {
      const { data } = await api.get(`/auth/verify-email?token=${token}`);
      if (data.verified) {
        clearInterval(countdownRef.current!);
        setStatus("success");
        setMessage("Email verified successfully! Redirecting to login...");
        toast.success("Email verified successfully!");
        setTimeout(() => navigate("/login", { state: { verified: true } }), 2500);
      }
    } catch (error: any) {
      const msg: string =
        error.response?.data?.message || "Verification failed";
      // Distinguish between expired and invalid token errors
      if (msg.toLowerCase().includes("expired")) {
        setStatus("error-expired");
      } else {
        setStatus("error-invalid");
      }
      setMessage(msg);
      toast.error(msg);
    }
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setResendError("");
    if (!resendEmail.trim()) {
      setResendError("Please enter your email address.");
      return;
    }
    setResendLoading(true);
    try {
      await api.post("/auth/resend-verification", { email: resendEmail });
      setResendSent(true);
      // Reset the countdown to 15 minutes
      setSecondsLeft(15 * 60);
      clearInterval(countdownRef.current!);
      countdownRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(countdownRef.current!);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
      toast.success("Verification email sent! Check your inbox.");
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Failed to resend. Please try again.";
      setResendError(msg);
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 px-4">
      <div className="w-full max-w-md">

        {/* ── VERIFYING ── */}
        {status === "verifying" && (
          <div className="text-center text-white">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-white/20" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2">Verifying your email…</h1>
            <p className="text-white/80">Please wait a moment.</p>
            {/* Countdown pill */}
            <div className="mt-4 inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 text-sm font-mono">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Link expires in {formatTime(secondsLeft)}
            </div>
          </div>
        )}

        {/* ── SUCCESS ── */}
        {status === "success" && (
          <div className="text-center text-white">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">Email Verified!</h1>
            <p className="text-white/80">{message}</p>
            <div className="mt-4 inline-block">
              <div className="w-8 h-1 bg-white/40 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-white rounded-full animate-[grow_2.5s_linear_forwards]" />
              </div>
            </div>
          </div>
        )}

        {/* ── EXPIRED ── */}
        {status === "error-expired" && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Top banner */}
            <div className="bg-amber-500 px-6 py-5 text-white text-center">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold">Verification Link Expired</h1>
              <p className="text-white/80 text-sm mt-1">
                Verification links expire after <strong>15 minutes</strong>.
              </p>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              {resendSent ? (
                <div className="text-center">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-800">New link sent!</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Check your inbox and click the new link within{" "}
                    <span className="font-mono font-semibold text-amber-600">
                      {formatTime(secondsLeft)}
                    </span>.
                  </p>
                  <p className="text-xs text-gray-400 mt-3">
                    Didn't receive it? Check your spam folder.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    Request a new verification link by entering the email you
                    signed up with.
                  </p>
                  <form onSubmit={handleResend} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email address
                      </label>
                      <input
                        type="email"
                        value={resendEmail}
                        onChange={(e) => setResendEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      />
                    </div>
                    {resendError && (
                      <p className="text-xs text-red-600">{resendError}</p>
                    )}
                    <button
                      type="submit"
                      disabled={resendLoading}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                      {resendLoading ? "Sending…" : "Resend Verification Email"}
                    </button>
                  </form>
                </>
              )}

              <div className="mt-5 text-center">
                <Link to="/login" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                  ← Back to Login
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── INVALID / OTHER ERROR ── */}
        {status === "error-invalid" && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-red-500 px-6 py-5 text-white text-center">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-xl font-bold">Verification Failed</h1>
              <p className="text-white/80 text-sm mt-1">{message}</p>
            </div>

            <div className="px-6 py-6 space-y-3">
              <p className="text-sm text-gray-600">
                The link may be invalid or already used. You can request a new one below.
              </p>

              {resendSent ? (
                <div className="text-center">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-800">New link sent!</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Check your inbox and click the new link within{" "}
                    <span className="font-mono font-semibold text-red-500">
                      {formatTime(secondsLeft)}
                    </span>.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleResend} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                    />
                  </div>
                  {resendError && (
                    <p className="text-xs text-red-600">{resendError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={resendLoading}
                    className="w-full py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    {resendLoading ? "Sending…" : "Resend Verification Email"}
                  </button>
                </form>
              )}

              <div className="mt-2 text-center space-x-4">
                <Link to="/login" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                  ← Back to Login
                </Link>
                <Link to="/signup" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                  Create new account
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── NEEDS VERIFICATION (redirected from login) ── */}
        {status === "needs-verification" && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-blue-500 px-6 py-5 text-white text-center">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold">Verify Your Email</h1>
              <p className="text-white/80 text-sm mt-1">
                You need to verify your email before signing in.
              </p>
            </div>

            <div className="px-6 py-6">
              {resendSent ? (
                <div className="text-center">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-800">Verification email sent!</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Check your inbox and click the link within{" "}
                    <span className="font-mono font-semibold text-blue-600">
                      {formatTime(secondsLeft)}
                    </span>.
                  </p>
                  <p className="text-xs text-gray-400 mt-3">Didn't receive it? Check your spam folder.</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    We'll send a new verification link to your email address.
                  </p>
                  <form onSubmit={handleResend} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email address
                      </label>
                      <input
                        type="email"
                        value={resendEmail}
                        onChange={(e) => setResendEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      />
                    </div>
                    {resendError && (
                      <p className="text-xs text-red-600">{resendError}</p>
                    )}
                    <button
                      type="submit"
                      disabled={resendLoading}
                      className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                      {resendLoading ? "Sending…" : "Send Verification Email"}
                    </button>
                  </form>
                </>
              )}

              <div className="mt-5 text-center">
                <Link to="/login" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                  ← Back to Login
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default VerifyEmail;
