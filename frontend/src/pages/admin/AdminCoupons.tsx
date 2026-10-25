import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useScrollToTop } from "../../hooks/useScrollToTop";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Loading } from "../../components/ui/loading";
import { Pagination } from "../../components/ui/pagination";
import { Plus, Edit, Trash2, X, Ticket, Percent } from "lucide-react";

interface Coupon {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  endDate?: string;
  isActive: boolean;
  usageLimit?: number;
  usedCount?: number;
}

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Scroll to top when page changes
  useScrollToTop(currentPage);
  
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: "",
    minOrderAmount: "",
    maxDiscount: "",
    endDate: "",
    usageLimit: "",
    isActive: true,
  });
  const { success, error } = useToast();

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/coupons");
      setCoupons(data);
    } catch (err) {
      error("Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        discountValue: Number(formData.discountValue),
        minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : undefined,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
      };

      if (editingId) {
        await api.put(`/coupons/${editingId}`, payload);
        success("Coupon updated");
      } else {
        await api.post("/coupons", payload);
        success("Coupon created");
      }
      resetForm();
      fetchCoupons();
    } catch (err: any) {
      error(err.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingId(coupon._id);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minOrderAmount: coupon.minOrderAmount?.toString() || "",
      maxDiscount: coupon.maxDiscount?.toString() || "",
      endDate: coupon.endDate ? coupon.endDate.split("T")[0] : "",
      usageLimit: coupon.usageLimit?.toString() || "",
      isActive: coupon.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    try {
      await api.delete(`/coupons/${id}`);
      success("Coupon deleted");
      fetchCoupons();
    } catch (err) {
      error("Failed to delete");
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      discountType: "percentage",
      discountValue: "",
      minOrderAmount: "",
      maxDiscount: "",
      endDate: "",
      usageLimit: "",
      isActive: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Pagination logic
  const totalPages = Math.ceil(coupons.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCoupons = coupons.slice(startIndex, endIndex);

  if (loading) return <Loading message="Loading coupons..." fullScreen={true} />;

  return (
    <div className="p-6 space-y-6 dark:bg-gray-900 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Coupons</h1>
          <p className="text-gray-500 mt-1">{coupons.length} total coupons</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm ? "Cancel" : "Add Coupon"}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Coupon" : "New Coupon"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Code *</Label>
                  <Input
                    required
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    placeholder="SAVE20"
                  />
                </div>
                <div>
                  <Label>Discount Type *</Label>
                  <select
                    required
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountType: e.target.value as "percentage" | "fixed",
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <Label>Discount Value *</Label>
                  <Input
                    required
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    placeholder={formData.discountType === "percentage" ? "20" : "500"}
                  />
                </div>
                <div>
                  <Label>Min Purchase</Label>
                  <Input
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    placeholder="1000"
                  />
                </div>
                <div>
                  <Label>Max Discount</Label>
                  <Input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    placeholder="500"
                  />
                </div>
                <div>
                  <Label>Usage Limit</Label>
                  <Input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    placeholder="100"
                  />
                </div>
                <div>
                  <Label>Expiry Date</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editingId ? "Update" : "Create"}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentCoupons.map((coupon) => (
          <Card key={coupon._id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
                    <Ticket className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{coupon.code}</h3>
                    <Badge variant={coupon.isActive ? "success" : "danger"}>
                      {coupon.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-gray-500" />
                  <span className="font-bold text-green-600">
                    {coupon.discountType === "percentage"
                      ? `${coupon.discountValue}% OFF`
                      : `Rs. ${coupon.discountValue} OFF`}
                  </span>
                </div>
                {coupon.minOrderAmount && (
                  <p className="text-gray-600">Min: Rs. {coupon.minOrderAmount}</p>
                )}
                {coupon.maxDiscount && (
                  <p className="text-gray-600">Max: Rs. {coupon.maxDiscount}</p>
                )}
                {coupon.usageLimit && (
                  <p className="text-gray-600">
                    Used: {coupon.usedCount || 0}/{coupon.usageLimit}
                  </p>
                )}
                {coupon.endDate && (
                  <p className="text-gray-600">
                    Expires: {new Date(coupon.endDate).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(coupon)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(coupon._id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {coupons.length === 0 && (
        <div className="text-center py-12">
          <Ticket className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No coupons found</p>
        </div>
      )}

      {/* Pagination */}
      {coupons.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={coupons.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      )}
    </div>
  );
};

export default AdminCoupons;
