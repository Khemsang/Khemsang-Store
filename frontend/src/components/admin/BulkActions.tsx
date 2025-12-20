import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCheckSquare,
  FaTrash,
  FaEdit,
  FaTimes,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useToast } from "../../context/ToastContext";

interface BulkActionsProps {
  selectedIds: string[];
  onDelete?: (ids: string[]) => Promise<void>;
  onStatusChange?: (ids: string[], status: string) => Promise<void>;
  onClear: () => void;
  entityName?: string;
  statusOptions?: { value: string; label: string }[];
}

const BulkActions = ({
  selectedIds,
  onDelete,
  onStatusChange,
  onClear,
  entityName = "items",
  statusOptions,
}: BulkActionsProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  if (selectedIds.length === 0) return null;

  const handleDelete = async () => {
    if (!onDelete) return;
    setLoading(true);
    try {
      await onDelete(selectedIds);
      showToast(
        `${selectedIds.length} ${entityName} deleted successfully`,
        "success"
      );
      onClear();
      setShowDeleteConfirm(false);
    } catch (error) {
      showToast(`Failed to delete ${entityName}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!onStatusChange || !selectedStatus) return;
    setLoading(true);
    try {
      await onStatusChange(selectedIds, selectedStatus);
      showToast(
        `${selectedIds.length} ${entityName} updated successfully`,
        "success"
      );
      onClear();
      setShowStatusModal(false);
    } catch (error) {
      showToast(`Failed to update ${entityName}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Bulk Actions Bar */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
            <FaCheckSquare className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-purple-600">
              {selectedIds.length} selected
            </span>
          </div>

          {statusOptions && onStatusChange && (
            <button
              onClick={() => setShowStatusModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
            >
              <FaEdit className="w-4 h-4" />
              Change Status
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            >
              <FaTrash className="w-4 h-4" />
              Delete
            </button>
          )}

          <button
            onClick={onClear}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaExclamationTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Delete {selectedIds.length} {entityName}?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  This action cannot be undone. All selected {entityName} will
                  be permanently deleted.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Change Modal */}
      <AnimatePresence>
        {showStatusModal && statusOptions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowStatusModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Change Status
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Update status for {selectedIds.length} {entityName}
                </p>

                <div className="space-y-2 mb-6">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedStatus(option.value)}
                      className={`w-full p-3 rounded-xl border-2 text-left font-medium transition-all ${
                        selectedStatus === option.value
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600"
                          : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStatusChange}
                    disabled={loading || !selectedStatus}
                    className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? "Updating..." : "Update"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BulkActions;
