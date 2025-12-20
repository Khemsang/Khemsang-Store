import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import {
  FaUsers,
  FaSearch,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaShoppingBag,
  FaUserShield,
  FaUser,
} from "react-icons/fa";

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isAdmin: boolean;
  createdAt: string;
  orderCount?: number;
  totalSpent?: number;
}

const AdminCustomers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const { showToast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [usersRes, ordersRes] = await Promise.all([
        api.get("/stats/users"),
        api.get("/orders"),
      ]);

      const orders = ordersRes.data || [];

      // Calculate order stats for each user
      const usersWithStats = usersRes.data.map((user: User) => {
        const userOrders = orders.filter(
          (o: any) => o.user?._id === user._id || o.user === user._id
        );
        return {
          ...user,
          orderCount: userOrders.length,
          totalSpent: userOrders
            .filter((o: any) => o.paymentStatus === "paid")
            .reduce((sum: number, o: any) => sum + o.totalAmount, 0),
        };
      });

      setUsers(usersWithStats);
    } catch (error: any) {
      showToast("Failed to fetch customers", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase());

    if (filter === "admin") return matchesSearch && user.isAdmin;
    if (filter === "customer") return matchesSearch && !user.isAdmin;
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-6 md:py-8">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
            <FaUsers className="text-purple-600" /> Customer Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {users.length} total users •{" "}
            {users.filter((u) => !u.isAdmin).length} customers
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Users</option>
              <option value="customer">Customers Only</option>
              <option value="admin">Admins Only</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                    Orders
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                    Total Spent
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                    Role
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            user.isAdmin
                              ? "bg-purple-100 text-purple-600"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {user.isAdmin ? <FaUserShield /> : <FaUser />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <FaEnvelope className="text-xs" /> {user.email}
                        </p>
                        {user.phone && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                            <FaPhone className="text-xs" /> {user.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FaShoppingBag className="text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {user.orderCount || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-green-600">
                        Rs. {(user.totalSpent || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-500">
                        <FaCalendarAlt className="text-xs" />
                        <span className="text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          user.isAdmin
                            ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                            : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                        }`}
                      >
                        {user.isAdmin ? "Admin" : "Customer"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <FaUsers className="mx-auto text-4xl text-gray-300 mb-3" />
              <p className="text-gray-500">No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCustomers;
