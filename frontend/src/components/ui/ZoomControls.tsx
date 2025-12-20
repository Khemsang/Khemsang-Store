import { useState, useEffect } from "react";
import { FaPlus, FaMinus, FaRedo } from "react-icons/fa";

const ZoomControls = () => {
  const [zoom, setZoom] = useState(() => {
    const saved = localStorage.getItem("pageZoom");
    return saved ? parseFloat(saved) : 100;
  });

  useEffect(() => {
    document.documentElement.style.fontSize = `${zoom}%`;
    localStorage.setItem("pageZoom", zoom.toString());
  }, [zoom]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "=" || e.key === "+") {
          e.preventDefault();
          setZoom((prev) => Math.min(prev + 10, 150));
        } else if (e.key === "-") {
          e.preventDefault();
          setZoom((prev) => Math.max(prev - 10, 70));
        } else if (e.key === "0") {
          e.preventDefault();
          setZoom(100);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const increase = () => setZoom((prev) => Math.min(prev + 10, 150));
  const decrease = () => setZoom((prev) => Math.max(prev - 10, 70));
  const reset = () => setZoom(100);

  return (
    <div className="fixed bottom-6 left-6 z-40 flex items-center gap-1 bg-white dark:bg-gray-800 rounded-full shadow-2xl border border-gray-200 dark:border-gray-700 p-1">
      <button
        onClick={decrease}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        title="Zoom Out (Ctrl -)"
      >
        <FaMinus className="w-3 h-3 text-gray-600 dark:text-gray-400" />
      </button>
      <button
        onClick={reset}
        className="px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors min-w-[40px]"
        title="Reset (Ctrl 0)"
      >
        {zoom}%
      </button>
      <button
        onClick={increase}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        title="Zoom In (Ctrl +)"
      >
        <FaPlus className="w-3 h-3 text-gray-600 dark:text-gray-400" />
      </button>
    </div>
  );
};

export default ZoomControls;
