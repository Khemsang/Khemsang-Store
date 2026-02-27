import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../ui/card";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Select } from "../../ui/select";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Percent, Calendar } from "lucide-react";

interface CouponFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  loading?: boolean;
  onCancel?: () => void;
}

export const CouponForm = ({
  onSubmit,
  initialData,
  loading = false,
  onCancel,
}: CouponFormProps) => {
  const [formData, setFormData] = useState({
    code: initialData?.code || "",
    discountType: initialData?.discountType || "percentage",
    discountValue: initialData?.discountValue || "",
    minPurchase: initialData?.minPurchase || "",
    maxDiscount: initialData?.maxDiscount || "",
    expiryDate: initialData?.expiryDate || "",
    usageLimit: initialData?.usageLimit || "",
    isActive: initialData?.isActive ?? true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Percent className="w-5 h-5" />
          {initialData ? "Edit Coupon" : "Create New Coupon"}
        </CardTitle>
        <CardDescription>
          {initialData ? "Update coupon details" : "Create a discount coupon for customers"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Coupon Code */}
          <div className="space-y-2">
            <Label htmlFor="code">
              Coupon Code <Badge variant="danger">Required</Badge>
            </Label>
            <Input
              id="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="e.g., SUMMER2024"
              required
              className="uppercase"
            />
            <p className="text-xs text-gray-500">Use uppercase letters and numbers</p>
          </div>

          {/* Discount Type and Value */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discountType">
                Discount Type <Badge variant="danger">Required</Badge>
              </Label>
              <Select
                id="discountType"
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                required
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (Rs.)</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountValue">
                Discount Value <Badge variant="danger">Required</Badge>
              </Label>
              <Input
                id="discountValue"
                name="discountValue"
                type="number"
                value={formData.discountValue}
                onChange={handleChange}
                placeholder={formData.discountType === "percentage" ? "10" : "100"}
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Min Purchase and Max Discount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minPurchase">Minimum Purchase (Rs.)</Label>
              <Input
                id="minPurchase"
                name="minPurchase"
                type="number"
                value={formData.minPurchase}
                onChange={handleChange}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxDiscount">Maximum Discount (Rs.)</Label>
              <Input
                id="maxDiscount"
                name="maxDiscount"
                type="number"
                value={formData.maxDiscount}
                onChange={handleChange}
                placeholder="No limit"
                min="0"
              />
            </div>
          </div>

          {/* Expiry Date and Usage Limit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Expiry Date
              </Label>
              <Input
                id="expiryDate"
                name="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="usageLimit">Usage Limit</Label>
              <Input
                id="usageLimit"
                name="usageLimit"
                type="number"
                value={formData.usageLimit}
                onChange={handleChange}
                placeholder="Unlimited"
                min="0"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="isActive">Status</Label>
            <Select
              id="isActive"
              name="isActive"
              value={formData.isActive.toString()}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.value === "true" })
              }
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </Select>
          </div>

          {/* Preview */}
          <div className="p-4 bg-blue-50 dark:from-blue-900/20 dark:to-orange-900/20 rounded-lg border-2 border-dashed border-blue-300 dark:border-blue-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Coupon Preview:</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{formData.code || "CODE"}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formData.discountType === "percentage"
                    ? `${formData.discountValue}% OFF`
                    : `Rs. ${formData.discountValue} OFF`}
                </p>
              </div>
              <Badge variant={formData.isActive ? "success" : "danger"}>
                {formData.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving...
                </>
              ) : (
                <>{initialData ? "Update Coupon" : "Create Coupon"}</>
              )}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
