import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

// Circumference of the SVG circle (r=46): 2π × 46 ≈ 289
const CIRCUMFERENCE = 289;

interface ProgressRingProps {
  progress: number;
}

const ProgressRing = ({ progress }: ProgressRingProps) => (
  <svg
    className="absolute inset-0 w-full h-full -rotate-90"
    viewBox="0 0 100 100"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="loader-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stopColor="var(--root-color)" />
        <stop offset="50%"  stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#EC4899" />
      </linearGradient>
    </defs>
    <circle
      cx="50"
      cy="50"
      r="46"
      fill="none"
      stroke="url(#loader-gradient)"
      strokeWidth="4"
      strokeLinecap="round"
      strokeDasharray={`${progress * (CIRCUMFERENCE / 100)}, ${CIRCUMFERENCE}`}
      className="transition-all duration-300 ease-out"
    />
  </svg>
);

const PageLoader = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    setProgress(0);

    const tick = setInterval(() => {
      setProgress((p) => (p >= 90 ? p : p + Math.random() * 15));
    }, 100);

    const done = setTimeout(() => {
      setProgress(100);
      setTimeout(() => setLoading(false), 200);
    }, 1200);

    return () => {
      clearInterval(tick);
      clearTimeout(done);
    };
  }, [location.pathname]);

  if (!loading) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-white via-purple-50/50 to-pink-50/50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      {/* Ambient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[var(--root-color)]/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "0.5s" }}
        />
      </div>

      <div className="relative text-center px-4">
        {/* Ring + floating particles */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700" />
          <ProgressRing progress={progress} />

          <div className="absolute -top-2 -right-2 w-4 h-4 bg-[var(--root-color)] rounded-full animate-float opacity-60" />
          <div
            className="absolute -bottom-1 -left-1 w-3 h-3 bg-purple-500 rounded-full animate-float opacity-60"
            style={{ animationDelay: "0.3s" }}
          />
          <div
            className="absolute top-1/2 -right-4 w-2 h-2 bg-pink-500 rounded-full animate-float opacity-60"
            style={{ animationDelay: "0.6s" }}
          />
        </div>

        {/* Percentage */}
        <span className="block text-4xl font-bold mb-4 bg-gradient-to-r from-[var(--root-color)] via-purple-500 to-pink-500 bg-clip-text text-transparent">
          {Math.round(progress)}%
        </span>

        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          Loading
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          Preparing your experience...
        </p>

        {/* Progress bar */}
        <div className="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mx-auto">
          <div
            className="h-full bg-gradient-to-r from-[var(--root-color)] via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Bounce dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {(["0ms", "150ms", "300ms"] as const).map((delay, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full animate-bounce ${
                i === 1 ? "bg-purple-500" : i === 2 ? "bg-pink-500" : "bg-[var(--root-color)]"
              }`}
              style={{ animationDelay: delay }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
