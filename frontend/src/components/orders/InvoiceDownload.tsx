import { useState } from "react";
import { api } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { FaFileDownload, FaSpinner } from "react-icons/fa";

interface InvoiceDownloadProps {
  orderId: string;
  className?: string;
}

const InvoiceDownload = ({ orderId, className = "" }: InvoiceDownloadProps) => {
  const [loading, setLoading] = useState(false);
  const { error } = useToast();

  const downloadInvoice = async () => {
    setLoading(true);
    try {
      // Get HTML invoice
      const { data } = await api.get(`/orders/${orderId}/invoice?format=html`);

      // Create a new window with the invoice
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(data);
        printWindow.document.close();

        // Wait for content to load then trigger print
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to download invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={downloadInvoice}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50 ${className}`}
    >
      {loading ? <FaSpinner className="animate-spin" /> : <FaFileDownload />}
      {loading ? "Generating..." : "Download Invoice"}
    </button>
  );
};

export default InvoiceDownload;
