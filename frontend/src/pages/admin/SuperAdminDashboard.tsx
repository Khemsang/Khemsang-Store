import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import ConfirmDialog from "../../components/common/ConfirmDialog";

interface Warning {
  message: string;
  date: string;
  issuedBy?: { name: string; email: string };
}

interface AdminDetails {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isBlocked?: boolean;
  isVerified?: boolean;
  adminStatus: string;
  adminRole?: string;
  createdAt: string;
  suspendedAt?: string;
  suspendedUntil?: string;
  suspendReason?: string;
  warnings?: Warning[];
  createdBy?: { name: string; email: string };
}

interface Admin {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isBlocked?: boolean;
  isVerified?: boolean;
  adminStatus: string;
  createdAt: string;
}

interface Stats {
  totalAdmins: number;
  activeAdmins: number;
  suspendedAdmins: number;
  totalUsers: number;
}

interface Activity {
  _id: string;
  admin: { _id: string; name: string; email: string };
  action: string;
  actionType: string;
  createdAt: string;
}

interface SiteSettings {
  _id?: string;
  siteName: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  commissionRate: number;
  taxRate: number;
  deliveryCharge: number;
  freeDeliveryMinimum: number;
  contactEmail: string;
  contactPhone: string;
  address: string;
  currency: string;
  currencySymbol: string;
}

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [users, setUsers] = useState<Admin[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "admins" | "users" | "activities" | "settings"
  >("admins");
  const [savingSettings, setSavingSettings] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: string;
    userId: string;
    name: string;
  } | null>(null);

  // Password reset modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordResetTarget, setPasswordResetTarget] = useState<{
    userId: string;
    name: string;
    email: string;
  } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);

  // Admin details modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [adminDetails, setAdminDetails] = useState<AdminDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Suspend modal state
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendTarget, setSuspendTarget] = useState<{
    userId: string;
    name: string;
  } | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendDuration, setSuspendDuration] = useState("0"); // 0 = permanent

  // Warning modal state
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningTarget, setWarningTarget] = useState<{
    userId: string;
    name: string;
  } | null>(null);
  const [warningMessage, setWarningMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  useEffect(() => {
    if (user?.isSuperAdmin) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [adminsRes, statsRes, usersRes, activitiesRes, settingsRes] =
        await Promise.all([
          api.get("/admin-management/admins"),
          api.get("/admin-management/stats"),
          api.get("/admin-management/users"),
          api.get("/admin-management/activities"),
          api.get("/admin-management/settings"),
        ]);
      setAdmins(adminsRes.data);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setActivities(activitiesRes.data.activities || activitiesRes.data);
      setSiteSettings(settingsRes.data);
    } catch (err: any) {
      error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!siteSettings) return;
    setSavingSettings(true);
    try {
      await api.put("/admin-management/settings", siteSettings);
      success("Settings saved successfully!");
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleToggleMaintenance = async () => {
    if (!siteSettings) return;
    try {
      const newMode = !siteSettings.maintenanceMode;
      await api.put("/admin-management/maintenance", { enabled: newMode });
      setSiteSettings({ ...siteSettings, maintenanceMode: newMode });
      success(`Maintenance mode ${newMode ? "enabled" : "disabled"}`);
    } catch (err: any) {
      error("Failed to toggle maintenance mode");
    }
  };

  const handleBlockUser = async (
    userId: string,
    userName: string,
    isBlocked: boolean
  ) => {
    try {
      if (isBlocked) {
        await api.put(`/admin-management/unblock-user/${userId}`);
        success(`${userName} unblocked`);
      } else {
        await api.put(`/admin-management/block-user/${userId}`);
        success(`${userName} blocked`);
      }
      fetchData();
    } catch (err: any) {
      error(err.response?.data?.message || "Action failed");
    }
  };

  const openPasswordResetModal = (
    userId: string,
    name: string,
    email: string
  ) => {
    setPasswordResetTarget({ userId, name, email });
    setNewPassword("");
    setShowPasswordModal(true);
  };

  const handleResetPassword = async () => {
    if (!passwordResetTarget || !newPassword) return;
    if (newPassword.length < 6) {
      error("Password must be at least 6 characters");
      return;
    }

    setResettingPassword(true);
    try {
      await api.put(
        `/admin-management/reset-password/${passwordResetTarget.userId}`,
        {
          newPassword,
        }
      );
      success(`Password reset for ${passwordResetTarget.name}. Email sent!`);
      setShowPasswordModal(false);
      setPasswordResetTarget(null);
      setNewPassword("");
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setResettingPassword(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/admin-management/create-admin", formData);
      success("Admin created successfully!");
      setShowCreateForm(false);
      setFormData({ name: "", email: "", password: "", phone: "" });
      fetchData();
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to create admin");
    }
  };

  // View admin details
  const viewAdminDetails = async (userId: string) => {
    setLoadingDetails(true);
    setShowDetailsModal(true);
    try {
      const res = await api.get(`/admin-management/admin/${userId}`);
      setAdminDetails(res.data);
    } catch (err: any) {
      error("Failed to load admin details");
      setShowDetailsModal(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Open suspend modal
  const openSuspendModal = (userId: string, name: string) => {
    setSuspendTarget({ userId, name });
    setSuspendReason("");
    setSuspendDuration("0");
    setShowSuspendModal(true);
  };

  // Handle suspend with duration
  const handleSuspend = async () => {
    if (!suspendTarget) return;
    try {
      await api.put(`/admin-management/suspend/${suspendTarget.userId}`, {
        reason: suspendReason || "No reason provided",
        duration: parseInt(suspendDuration),
      });
      success(`${suspendTarget.name} suspended & notification email sent!`);
      setShowSuspendModal(false);
      setSuspendTarget(null);
      fetchData();
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to suspend admin");
    }
  };

  // Open warning modal
  const openWarningModal = (userId: string, name: string) => {
    setWarningTarget({ userId, name });
    setWarningMessage("");
    setShowWarningModal(true);
  };

  // Handle warning
  const handleWarning = async () => {
    if (!warningTarget || !warningMessage.trim()) {
      error("Please enter a warning message");
      return;
    }
    try {
      await api.put(`/admin-management/warn/${warningTarget.userId}`, {
        message: warningMessage,
      });
      success(`Warning issued to ${warningTarget.name}`);
      setShowWarningModal(false);
      setWarningTarget(null);
      fetchData();
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to issue warning");
    }
  };

  const handleAction = (type: string, userId: string, name: string) => {
    setConfirmAction({ type, userId, name });
    setShowConfirm(true);
  };

  const executeAction = async () => {
    if (!confirmAction) return;

    try {
      const { type, userId } = confirmAction;

      switch (type) {
        case "activate":
          await api.put(`/admin-management/activate/${userId}`);
          success("Admin activated & notification email sent!");
          break;
        case "demote":
          await api.put(`/admin-management/demote/${userId}`);
          success("Admin demoted to user");
          break;
        case "promote":
          await api.put(`/admin-management/promote/${userId}`);
          success("User promoted to admin");
          break;
      }

      fetchData();
    } catch (err: any) {
      error(err.response?.data?.message || "Action failed");
    } finally {
      setShowConfirm(false);
      setConfirmAction(null);
    }
  };

  if (!user?.isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            Only Super Admin can access this page.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 md:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl md:text-4xl font-bold mb-2 flex items-center gap-3">
              <svg
                className="w-8 h-8 md:w-10 md:h-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              Super Admin Dashboard
            </h2>
            <p className="text-white/90">Manage all admins and users</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-6 py-3 bg-white text-purple-600 rounded-xl hover:bg-purple-50 transition-all font-semibold flex items-center gap-2 shadow-lg"
          >
            {showCreateForm ? (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Cancel
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Admin
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalAdmins}
                </p>
                <p className="text-sm text-gray-500">Total Admins</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.activeAdmins}
                </p>
                <p className="text-sm text-gray-500">Active Admins</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                  />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.suspendedAdmins}
                </p>
                <p className="text-sm text-gray-500">Suspended</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalUsers}
                </p>
                <p className="text-sm text-gray-500">Total Users</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Super Admin Permissions Info */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-indigo-200 dark:border-indigo-800">
        <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-300 mb-4 flex items-center gap-2">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          Super Admin Permissions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* View All Products */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                View All Products
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Monitor all admin products (view only)
              </p>
            </div>
          </div>
          {/* Cannot Edit Others */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                Own Products Only
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Cannot edit/delete other admin's products
              </p>
            </div>
          </div>
          {/* View All Orders */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                View All Orders
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Monitor all orders across admins
              </p>
            </div>
          </div>
          {/* Admin Management */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                Admin Management
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create, suspend, activate, delete admins
              </p>
            </div>
          </div>
          {/* View Activities */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                Admin Activities
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View all admin activity logs
              </p>
            </div>
          </div>
          {/* Skip OTP */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                Skip OTP
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Login without OTP verification
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Admin Form */}
      {showCreateForm && (
        <form
          onSubmit={handleCreateAdmin}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Create New Admin
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Admin name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password *
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Phone number"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 font-semibold"
          >
            Create Admin
          </button>
        </form>
      )}

      {/* Tabs */}
      <div className="flex gap-2 bg-white dark:bg-gray-800 p-2 rounded-xl shadow">
        <button
          onClick={() => setActiveTab("admins")}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
            activeTab === "admins"
              ? "bg-purple-500 text-white"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          Admins ({admins.length})
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
            activeTab === "users"
              ? "bg-purple-500 text-white"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("activities")}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
            activeTab === "activities"
              ? "bg-purple-500 text-white"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          Activities ({activities.length})
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
            activeTab === "settings"
              ? "bg-purple-500 text-white"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          ⚙️ Settings
        </button>
      </div>

      {/* Admins List */}
      {activeTab === "admins" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                    Admin
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {admins.map((admin) => (
                  <tr
                    key={admin._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                          {admin.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {admin.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {admin.phone || "No phone"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {admin.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          admin.adminStatus === "active"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {admin.adminStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2 flex-wrap">
                        <button
                          onClick={() => viewAdminDetails(admin._id)}
                          className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200"
                        >
                          👁️ View
                        </button>
                        {admin.adminStatus === "active" ? (
                          <button
                            onClick={() =>
                              openSuspendModal(admin._id, admin.name)
                            }
                            className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-200"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleAction("activate", admin._id, admin.name)
                            }
                            className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200"
                          >
                            Activate
                          </button>
                        )}
                        <button
                          onClick={() =>
                            openWarningModal(admin._id, admin.name)
                          }
                          className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200"
                        >
                          ⚠️ Warn
                        </button>
                        <button
                          onClick={() =>
                            openPasswordResetModal(
                              admin._id,
                              admin.name,
                              admin.email
                            )
                          }
                          className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200"
                        >
                          🔑 Reset
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {admins.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No admins found</p>
            </div>
          )}
        </div>
      )}

      {/* Users List */}
      {activeTab === "users" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                    Verified
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {user.name}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.isVerified
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {user.isVerified ? "Verified" : "Unverified"}
                        </span>
                        {user.isBlocked && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                            Blocked
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            handleBlockUser(
                              user._id,
                              user.name,
                              user.isBlocked || false
                            )
                          }
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                            user.isBlocked
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-red-100 text-red-700 hover:bg-red-200"
                          }`}
                        >
                          {user.isBlocked ? "Unblock" : "Block"}
                        </button>
                        <button
                          onClick={() =>
                            handleAction("promote", user._id, user.name)
                          }
                          className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200"
                        >
                          Promote
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No users found</p>
            </div>
          )}
        </div>
      )}

      {/* Activities List */}
      {activeTab === "activities" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Admin Activities Log
            </h3>
            <p className="text-sm text-gray-500">
              Recent activities from all admins
            </p>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
            {activities.map((activity) => (
              <div
                key={activity._id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {activity.admin?.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {activity.admin?.name || "Unknown"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {activity.admin?.email}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {activity.action}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          activity.actionType?.includes("order")
                            ? "bg-green-100 text-green-700"
                            : activity.actionType?.includes("product")
                            ? "bg-blue-100 text-blue-700"
                            : activity.actionType?.includes("admin")
                            ? "bg-purple-100 text-purple-700"
                            : activity.actionType?.includes("user")
                            ? "bg-orange-100 text-orange-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {activity.actionType?.replace(/_/g, " ") || "other"}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(activity.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {activities.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No activities found</p>
            </div>
          )}
        </div>
      )}

      {/* Site Settings */}
      {activeTab === "settings" && siteSettings && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Site Settings
              </h3>
              <p className="text-sm text-gray-500">
                Configure system-wide settings
              </p>
            </div>
            <button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 font-semibold disabled:opacity-50"
            >
              {savingSettings ? "Saving..." : "Save Settings"}
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* Maintenance Mode */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-bold text-red-900 dark:text-red-300">
                    🚧 Maintenance Mode
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    Temporarily disable site access for users
                  </p>
                </div>
                <button
                  onClick={handleToggleMaintenance}
                  className={`px-6 py-3 rounded-xl font-bold transition-all ${
                    siteSettings.maintenanceMode
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-red-500 text-white hover:bg-red-600"
                  }`}
                >
                  {siteSettings.maintenanceMode ? "Disable" : "Enable"}
                </button>
              </div>
              <input
                type="text"
                value={siteSettings.maintenanceMessage}
                onChange={(e) =>
                  setSiteSettings({
                    ...siteSettings,
                    maintenanceMessage: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border-2 border-red-300 dark:border-red-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Maintenance message..."
              />
            </div>

            {/* Financial Settings */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                💰 Financial Settings
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    value={siteSettings.commissionRate}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        commissionRate: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    value={siteSettings.taxRate}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        taxRate: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Delivery Charge
                  </label>
                  <input
                    type="number"
                    value={siteSettings.deliveryCharge}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        deliveryCharge: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Free Delivery Min
                  </label>
                  <input
                    type="number"
                    value={siteSettings.freeDeliveryMinimum}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        freeDeliveryMinimum: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Site Info */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                🏪 Site Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={siteSettings.siteName}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        siteName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Currency Symbol
                  </label>
                  <input
                    type="text"
                    value={siteSettings.currencySymbol}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        currencySymbol: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={siteSettings.contactEmail}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        contactEmail: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={siteSettings.contactPhone}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        contactPhone: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={siteSettings.address}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        address: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        title={`Confirm ${confirmAction?.type}`}
        message={`Are you sure you want to ${confirmAction?.type} "${confirmAction?.name}"?`}
        confirmText="Yes, Confirm"
        cancelText="Cancel"
        type={confirmAction?.type === "delete" ? "danger" : "warning"}
        onConfirm={executeAction}
        onCancel={() => setShowConfirm(false)}
      />

      {/* Password Reset Modal */}
      {showPasswordModal && passwordResetTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🔑</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Reset Password</h3>
                  <p className="text-white/80 text-sm">
                    {passwordResetTarget.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Email:{" "}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {passwordResetTarget.email}
                  </span>
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password *
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new password (min 6 characters)"
                  minLength={6}
                />
                <p className="text-xs text-gray-500 mt-2">
                  ⚠️ The new password will be sent to the admin via email
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordResetTarget(null);
                    setNewPassword("");
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetPassword}
                  disabled={resettingPassword || newPassword.length < 6}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 font-semibold disabled:opacity-50 transition-all"
                >
                  {resettingPassword ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Admin Details</h3>
                    <p className="text-white/80 text-sm">
                      {adminDetails?.name || "Loading..."}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setAdminDetails(null);
                  }}
                  className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loadingDetails ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : adminDetails ? (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Name
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {adminDetails.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Email
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {adminDetails.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Phone
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {adminDetails.phone || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Role
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white capitalize">
                        {adminDetails.adminRole || "Admin"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Status
                      </p>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          adminDetails.adminStatus === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {adminDetails.adminStatus}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Joined
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {new Date(adminDetails.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Suspension Info */}
                  {adminDetails.adminStatus === "suspended" && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                      <h4 className="font-bold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
                        🚫 Suspension Details
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            Suspended On
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {adminDetails.suspendedAt
                              ? new Date(
                                  adminDetails.suspendedAt
                                ).toLocaleString()
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            Suspended Until
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {adminDetails.suspendedUntil
                              ? new Date(
                                  adminDetails.suspendedUntil
                                ).toLocaleString()
                              : "Permanent"}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-500 dark:text-gray-400">
                            Reason
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {adminDetails.suspendReason || "No reason provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Warnings */}
                  {adminDetails.warnings &&
                    adminDetails.warnings.length > 0 && (
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                        <h4 className="font-bold text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-2">
                          ⚠️ Warnings ({adminDetails.warnings.length})
                        </h4>
                        <div className="space-y-3">
                          {adminDetails.warnings.map((warning, index) => (
                            <div
                              key={index}
                              className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-amber-200 dark:border-amber-700"
                            >
                              <p className="text-gray-900 dark:text-white">
                                {warning.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(warning.date).toLocaleString()}
                                {warning.issuedBy &&
                                  ` • By ${warning.issuedBy.name}`}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Created By */}
                  {adminDetails.createdBy && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Created by:{" "}
                      <span className="font-medium">
                        {adminDetails.createdBy.name}
                      </span>{" "}
                      ({adminDetails.createdBy.email})
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-gray-500">
                  No details available
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {showSuspendModal && suspendTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🚫</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Suspend Admin</h3>
                  <p className="text-white/80 text-sm">{suspendTarget.name}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Suspension Duration
                </label>
                <select
                  value={suspendDuration}
                  onChange={(e) => setSuspendDuration(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="0">Permanent</option>
                  <option value="1">1 Day</option>
                  <option value="3">3 Days</option>
                  <option value="7">1 Week</option>
                  <option value="14">2 Weeks</option>
                  <option value="30">1 Month</option>
                  <option value="90">3 Months</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason (Optional)
                </label>
                <textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  rows={3}
                  placeholder="Enter reason for suspension..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowSuspendModal(false);
                    setSuspendTarget(null);
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSuspend}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl hover:from-yellow-600 hover:to-orange-700 font-semibold"
                >
                  Suspend Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning Modal */}
      {showWarningModal && warningTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-yellow-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Issue Warning</h3>
                  <p className="text-white/80 text-sm">{warningTarget.name}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Warning Message *
                </label>
                <textarea
                  value={warningMessage}
                  onChange={(e) => setWarningMessage(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  rows={4}
                  placeholder="Enter warning message..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowWarningModal(false);
                    setWarningTarget(null);
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWarning}
                  disabled={!warningMessage.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-xl hover:from-amber-600 hover:to-yellow-700 font-semibold disabled:opacity-50"
                >
                  Issue Warning
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
