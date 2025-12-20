import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaFileExport,
  FaFileCsv,
  FaFileExcel,
  FaTimes,
  FaDownload,
} from "react-icons/fa";
import { useToast } from "../../context/ToastContext";

interface ExportDataProps {
  data: any[];
  filename: string;
  columns?: { key: string; label: string }[];
}

const ExportData = ({ data, filename, columns }: ExportDataProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const getColumns = () => {
    if (columns) return columns;
    if (data.length === 0) return [];

    // Auto-detect columns from first item
    return Object.keys(data[0])
      .filter((key) => !key.startsWith("_") && key !== "password")
      .map((key) => ({
        key,
        label:
          key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1"),
      }));
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") {
      if (Array.isArray(value)) return value.join(", ");
      if (value instanceof Date) return value.toISOString();
      return JSON.stringify(value);
    }
    return String(value);
  };

  const exportToCSV = () => {
    setLoading(true);
    try {
      const cols = getColumns();
      const headers = cols.map((c) => c.label).join(",");
      const rows = data.map((item) =>
        cols
          .map((c) => {
            const value = formatValue(item[c.key]);
            // Escape quotes and wrap in quotes if contains comma
            if (
              value.includes(",") ||
              value.includes('"') ||
              value.includes("\n")
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(",")
      );

      const csv = [headers, ...rows].join("\n");
      downloadFile(csv, `${filename}.csv`, "text/csv");
      showToast("CSV exported successfully!", "success");
      setIsOpen(false);
    } catch (error) {
      showToast("Failed to export CSV", "error");
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    setLoading(true);
    try {
      const cols = getColumns();

      // Create HTML table for Excel
      let html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head><meta charset="UTF-8"></head>
        <body>
        <table border="1">
          <thead>
            <tr>${cols
              .map(
                (c) =>
                  `<th style="background:#4F46E5;color:white;font-weight:bold;padding:8px;">${c.label}</th>`
              )
              .join("")}</tr>
          </thead>
          <tbody>
            ${data
              .map(
                (item, idx) => `
              <tr style="background:${idx % 2 === 0 ? "#F9FAFB" : "#FFFFFF"}">
                ${cols
                  .map(
                    (c) =>
                      `<td style="padding:6px;">${formatValue(
                        item[c.key]
                      )}</td>`
                  )
                  .join("")}
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        </body>
        </html>
      `;

      downloadFile(html, `${filename}.xls`, "application/vnd.ms-excel");
      showToast("Excel exported successfully!", "success");
      setIsOpen(false);
    } catch (error) {
      showToast("Failed to export Excel", "error");
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = (
    content: string,
    filename: string,
    mimeType: string
  ) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
      >
        <FaFileExport className="w-4 h-4" />
        Export
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                    <FaDownload className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Export Data
                    </h2>
                    <p className="text-sm text-gray-500">
                      {data.length} records
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Choose your preferred export format:
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={exportToCSV}
                    disabled={loading}
                    className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 dark:border-gray-700 rounded-2xl hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group"
                  >
                    <FaFileCsv className="w-12 h-12 text-green-600" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      CSV
                    </span>
                    <span className="text-xs text-gray-500">
                      Comma Separated
                    </span>
                  </button>

                  <button
                    onClick={exportToExcel}
                    disabled={loading}
                    className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 dark:border-gray-700 rounded-2xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
                  >
                    <FaFileExcel className="w-12 h-12 text-blue-600" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Excel
                    </span>
                    <span className="text-xs text-gray-500">XLS Format</span>
                  </button>
                </div>

                {loading && (
                  <div className="flex items-center justify-center gap-2 text-purple-600">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Exporting...</span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ExportData;
