import { useState, useEffect } from "react";
import { contactApi } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useMinimumLoading } from "../../hooks/useMinimumLoading";
import Loading from "../../components/common/Loading";
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaClock,
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaLinkedin,
  FaSave,
  FaInbox,
} from "react-icons/fa";

interface ContactSettings {
  email: string;
  phone: string;
  address: string;
  workingHours: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  mapUrl?: string;
}

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: "new" | "read" | "replied";
  createdAt: string;
}

const AdminContact = () => {
  const [loading, setLoading] = useState(true);
  const showLoading = useMinimumLoading(loading, 1000);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"settings" | "messages">(
    "settings"
  );
  const { showToast } = useToast();

  const [formData, setFormData] = useState<ContactSettings>({
    email: "",
    phone: "",
    address: "",
    workingHours: "",
    socialMedia: {},
    mapUrl: "",
  });

  const [messages, setMessages] = useState<ContactMessage[]>([]);

  useEffect(() => {
    fetchContactSettings();
    fetchMessages();
  }, []);

  const fetchContactSettings = async () => {
    try {
      setLoading(true);
      const { data } = await contactApi.getSettings();
      setFormData({
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        workingHours: data.workingHours || "",
        socialMedia: data.socialMedia || {},
        mapUrl: data.mapUrl || "",
      });
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Failed to fetch contact settings",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data } = await contactApi.getAllMessages();
      setMessages(data);
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Failed to fetch messages",
        "error"
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await contactApi.updateSettings(formData);
      showToast("Contact settings updated successfully", "success");
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Failed to update settings",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await contactApi.updateMessageStatus(id, status);
      showToast("Message status updated", "success");
      fetchMessages();
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Failed to update status",
        "error"
      );
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      await contactApi.deleteMessage(id);
      showToast("Message deleted successfully", "success");
      fetchMessages();
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Failed to delete message",
        "error"
      );
    }
  };

  if (showLoading) {
    return <Loading text="Loading contact settings..." fullScreen={true} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 py-6 md:py-8">
      <div className="container">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-4 shadow-lg">
            <FaEnvelope className="text-white text-2xl" />
            <span className="text-white font-bold text-lg">
              Contact Manager
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-3">
            Manage Contact
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Update contact information and manage customer messages
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === "settings"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md"
            }`}
          >
            Contact Settings
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              activeTab === "messages"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md"
            }`}
          >
            <FaInbox />
            Messages
            {messages.filter((m) => m.status === "new").length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {messages.filter((m) => m.status === "new").length}
              </span>
            )}
          </button>
        </div>

        {activeTab === "settings" ? (
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 border border-purple-100 dark:border-purple-900/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <FaPhone className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Contact Information
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Basic contact details
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FaEnvelope className="text-purple-600" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="info@example.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FaPhone className="text-purple-600" />
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+1 234 567 8900"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-purple-600" />
                    Address *
                  </label>
                  <textarea
                    required
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="123 Main Street, City, Country"
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 resize-none"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FaClock className="text-purple-600" />
                    Working Hours
                  </label>
                  <input
                    type="text"
                    value={formData.workingHours}
                    onChange={(e) =>
                      setFormData({ ...formData, workingHours: e.target.value })
                    }
                    placeholder="Mon - Fri: 9:00 AM - 6:00 PM"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 border border-purple-100 dark:border-purple-900/30">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Social Media Links
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FaFacebook className="text-blue-600" />
                    Facebook
                  </label>
                  <input
                    type="url"
                    value={formData.socialMedia?.facebook || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialMedia: {
                          ...formData.socialMedia,
                          facebook: e.target.value,
                        },
                      })
                    }
                    placeholder="https://facebook.com/yourpage"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FaInstagram className="text-pink-600" />
                    Instagram
                  </label>
                  <input
                    type="url"
                    value={formData.socialMedia?.instagram || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialMedia: {
                          ...formData.socialMedia,
                          instagram: e.target.value,
                        },
                      })
                    }
                    placeholder="https://instagram.com/yourpage"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FaTwitter className="text-blue-400" />
                    Twitter
                  </label>
                  <input
                    type="url"
                    value={formData.socialMedia?.twitter || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialMedia: {
                          ...formData.socialMedia,
                          twitter: e.target.value,
                        },
                      })
                    }
                    placeholder="https://twitter.com/yourpage"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FaLinkedin className="text-blue-700" />
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    value={formData.socialMedia?.linkedin || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialMedia: {
                          ...formData.socialMedia,
                          linkedin: e.target.value,
                        },
                      })
                    }
                    placeholder="https://linkedin.com/company/yourpage"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="sticky bottom-4 z-10 flex justify-center">
              <button
                type="submit"
                disabled={saving}
                className="group relative px-10 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white rounded-2xl hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transform"
              >
                <span className="flex items-center gap-3">
                  <FaSave className="text-xl" />
                  {saving ? "Saving Changes..." : "Save Contact Settings"}
                </span>
              </button>
            </div>
          </form>
        ) : (
          <div className="max-w-6xl mx-auto">
            {messages.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
                <FaInbox className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                  No Messages Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Customer messages will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-purple-500"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                          {message.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {message.email}
                        </p>
                        {message.phone && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {message.phone}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={message.status}
                          onChange={(e) =>
                            handleStatusChange(message._id, e.target.value)
                          }
                          className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                            message.status === "new"
                              ? "bg-green-100 text-green-800"
                              : message.status === "read"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          <option value="new">New</option>
                          <option value="read">Read</option>
                          <option value="replied">Replied</option>
                        </select>
                        <button
                          onClick={() => handleDeleteMessage(message._id)}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      {message.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(message.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminContact;
