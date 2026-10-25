import { useState, useEffect } from "react";
import { FaQuoteLeft, FaTrash, FaCheck, FaTimes, FaStar } from "react-icons/fa";
import { api } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useMinimumLoading } from "../../hooks/useMinimumLoading";
import Loading from "../../components/common/Loading";

interface Testimonial {
  _id: string;
  name: string;
  role?: string;
  imageUrl?: string;
  quote: string;
  rating: number;
  isActive: boolean;
  createdAt: string;
}

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const showLoading = useMinimumLoading(loading, 1000);
  const [filter, setFilter] = useState("all");
  const { showToast } = useToast();

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      // Fetch all testimonials for admin (including hidden ones)
      const { data } = await api.get("/testimonials?all=true");
      setTestimonials(data);
    } catch (error) {
      console.error("Failed to fetch testimonials:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, isActive: boolean) => {
    try {
      await api.put(`/testimonials/${id}`, { isActive });
      setTestimonials(
        testimonials.map((t) => (t._id === id ? { ...t, isActive } : t))
      );
      showToast(`Testimonial ${isActive ? "approved" : "hidden"}`, "success");
    } catch (error) {
      showToast("Failed to update testimonial", "error");
    }
  };

  const deleteTestimonial = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    try {
      await api.delete(`/testimonials/${id}`);
      setTestimonials(testimonials.filter((t) => t._id !== id));
      showToast("Testimonial deleted", "success");
    } catch (error) {
      showToast("Failed to delete", "error");
    }
  };

  const filteredTestimonials = testimonials.filter((t) => {
    if (filter === "approved") return t.isActive;
    if (filter === "pending") return !t.isActive;
    return true;
  });

  if (showLoading) {
    return <Loading text="Loading testimonials..." fullScreen={true} />;
  }

  return (
    <div className="min-h-screen dark:bg-gray-900 dark:from-gray-900 dark:to-gray-800 py-6 md:py-8">
      <div className="container">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FaQuoteLeft className="text-purple-600" /> Testimonials
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {testimonials.length} total
          </p>
        </div>

        <div className="flex gap-4 mb-6">
          {["all", "approved", "pending"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === f
                  ? "bg-purple-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTestimonials.map((t) => (
            <div
              key={t._id}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
            >
              <div className="flex justify-between mb-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={`w-4 h-4 ${
                        i < t.rating ? "text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-bold ${
                    t.isActive
                      ? "bg-green-100 text-green-600"
                      : "bg-yellow-100 text-yellow-600"
                  }`}
                >
                  {t.isActive ? "Active" : "Hidden"}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                "{t.quote}"
              </p>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {t.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!t.isActive && (
                    <button
                      onClick={() => updateStatus(t._id, true)}
                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                      title="Show testimonial"
                    >
                      <FaCheck />
                    </button>
                  )}
                  {t.isActive && (
                    <button
                      onClick={() => updateStatus(t._id, false)}
                      className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200"
                      title="Hide testimonial"
                    >
                      <FaTimes />
                    </button>
                  )}
                  <button
                    onClick={() => deleteTestimonial(t._id)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                    title="Delete testimonial"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminTestimonials;
