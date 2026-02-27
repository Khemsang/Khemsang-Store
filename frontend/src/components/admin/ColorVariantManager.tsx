import React, { useState } from "react";
import { api } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Plus, Trash2, X, Image as ImageIcon } from "lucide-react";

interface ColorVariant {
  _id: string;
  colorName: string;
  colorCode: string;
  images: string[];
  stock: number;
  price?: number;
  sku?: string;
  isActive: boolean;
}

interface ColorVariantManagerProps {
  productId: string;
  variants: ColorVariant[];
  basePrice: number;
  onUpdate: () => void;
}

// Predefined color options (12 colors)
const PREDEFINED_COLORS = [
  { name: "Black", code: "#000000" },
  { name: "White", code: "#FFFFFF" },
  { name: "Red", code: "#FF0000" },
  { name: "Blue", code: "#0000FF" },
  { name: "Green", code: "#00FF00" },
  { name: "Yellow", code: "#FFFF00" },
  { name: "Orange", code: "#FFA500" },
  { name: "Purple", code: "#800080" },
  { name: "Pink", code: "#FFC0CB" },
  { name: "Brown", code: "#A52A2A" },
  { name: "Gray", code: "#808080" },
  { name: "Navy", code: "#000080" },
];

export const ColorVariantManager: React.FC<ColorVariantManagerProps> = ({
  productId,
  variants,
  basePrice,
  onUpdate,
}) => {
  const { success, error } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    colorName: "",
    stock: "",
    price: "",
  });
  const [images, setImages] = useState<FileList | null>(null);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [colorImagesMap, setColorImagesMap] = useState<Record<string, FileList>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (submitting) return;

    try {
      setSubmitting(true);
      
      if (bulkMode && selectedColors.length > 0) {
        // Bulk create multiple variants with individual images
        let successCount = 0;
        let failCount = 0;
        
        // Check if all selected colors have images
        const missingImages = selectedColors.filter(
          color => !colorImagesMap[color] || colorImagesMap[color].length === 0
        );
        
        if (missingImages.length > 0) {
          error(`Please upload images for: ${missingImages.join(", ")}`);
          setSubmitting(false);
          return;
        }
        
        for (const colorName of selectedColors) {
          const color = PREDEFINED_COLORS.find(c => c.name === colorName);
          if (!color) continue;
          
          const colorImages = colorImagesMap[colorName];
          if (!colorImages || colorImages.length < 1 || colorImages.length > 4) {
            failCount++;
            continue;
          }
          
          try {
            const data = new FormData();
            data.append("colorName", color.name);
            data.append("colorCode", color.code);
            data.append("stock", formData.stock);
            if (formData.price) data.append("price", formData.price);
            
            Array.from(colorImages).forEach((img) => data.append("images", img));

            await api.post(`/variants/${productId}`, data, {
              headers: {
                'Content-Type': undefined, // Let browser set multipart/form-data with boundary
              },
            });
            successCount++;
          } catch (err) {
            console.error(`Failed to add ${color.name}:`, err);
            failCount++;
          }
        }
        
        if (successCount > 0) {
          success(`${successCount} color variant(s) added successfully`);
        }
        if (failCount > 0) {
          error(`${failCount} variant(s) failed to add`);
        }
      } else {
        // Single variant create
        if (!images || images.length < 1 || images.length > 4) {
          error("Please upload 1-4 images for the color variant");
          setSubmitting(false);
          return;
        }
        
        const color = PREDEFINED_COLORS.find(c => c.name === formData.colorName);
        if (!color) {
          error("Invalid color selected");
          setSubmitting(false);
          return;
        }
        
        const data = new FormData();
        data.append("colorName", color.name);
        data.append("colorCode", color.code);
        data.append("stock", formData.stock);
        if (formData.price) data.append("price", formData.price);
        
        Array.from(images).forEach((img) => data.append("images", img));

        await api.post(`/variants/${productId}`, data, {
          headers: {
            'Content-Type': undefined, // Let browser set multipart/form-data with boundary
          },
        });
        success("Color variant added successfully");
      }
      
      resetForm();
      onUpdate();
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to add variant");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (variantId: string) => {
    if (!confirm("Delete this color variant?")) return;
    
    try {
      await api.delete(`/variants/${productId}/${variantId}`);
      success("Variant deleted");
      onUpdate();
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to delete variant");
    }
  };

  const resetForm = () => {
    setFormData({ colorName: "", stock: "", price: "" });
    setImages(null);
    setSelectedColors([]);
    setBulkMode(false);
    setColorImagesMap({});
    setShowForm(false);
  };

  const toggleColorSelection = (colorName: string) => {
    setSelectedColors(prev => {
      if (prev.includes(colorName)) {
        // Remove color and its images
        const newMap = { ...colorImagesMap };
        delete newMap[colorName];
        setColorImagesMap(newMap);
        return prev.filter(c => c !== colorName);
      } else {
        return [...prev, colorName];
      }
    });
  };

  const handleColorImageChange = (colorName: string, files: FileList | null) => {
    if (files && files.length > 0) {
      if (files.length > 4) {
        error("Maximum 4 images allowed per color");
        return;
      }
      setColorImagesMap(prev => ({
        ...prev,
        [colorName]: files
      }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🎨</span>
            Color Variants ({variants.length})
          </CardTitle>
          <Button
            size="sm"
            onClick={() => setShowForm(!showForm)}
            variant={showForm ? "outline" : "default"}
          >
            {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {showForm ? "Cancel" : "Add Color"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Variant Form */}
        {showForm && (
          <Card className="border-2 border-purple-200 dark:border-purple-800">
            <CardContent className="p-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Mode Toggle */}
                <div className="flex gap-2 mb-4">
                  <Button
                    type="button"
                    variant={!bulkMode ? "default" : "outline"}
                    onClick={() => {
                      setBulkMode(false);
                      setSelectedColors([]);
                    }}
                    className="flex-1"
                  >
                    Single Color
                  </Button>
                  <Button
                    type="button"
                    variant={bulkMode ? "default" : "outline"}
                    onClick={() => {
                      setBulkMode(true);
                      setFormData({ ...formData, colorName: "" });
                    }}
                    className="flex-1"
                  >
                    Multiple Colors
                  </Button>
                </div>

                {bulkMode ? (
                  /* Bulk Mode - Multiple Color Selection with Individual Images */
                  <>
                    <div>
                      <Label className="text-lg mb-3 block">Select Colors * (Choose from 12 colors)</Label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 p-3 border rounded-lg bg-gray-50 dark:bg-gray-900">
                        {PREDEFINED_COLORS.map((color) => (
                          <button
                            key={color.name}
                            type="button"
                            onClick={() => toggleColorSelection(color.name)}
                            className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                              selectedColors.includes(color.name)
                                ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30 shadow-md"
                                : "border-gray-300 dark:border-gray-600 hover:border-purple-300 hover:shadow"
                            }`}
                          >
                            <div
                              className="w-12 h-12 rounded-full border-2 border-gray-400 dark:border-gray-500 shadow-sm"
                              style={{ backgroundColor: color.code }}
                            />
                            <span className="text-xs font-medium text-center">{color.name}</span>
                            {selectedColors.includes(color.name) && (
                              <span className="text-purple-600 dark:text-purple-400 text-lg font-bold">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                      {selectedColors.length > 0 && (
                        <div className="mt-3 p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg border border-purple-300">
                          <p className="text-sm font-semibold text-purple-700 dark:text-purple-400">
                            ✓ {selectedColors.length} color(s) selected: {selectedColors.join(", ")}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Upload images for each selected color */}
                    {selectedColors.length > 0 && (
                      <div className="space-y-3 border-t pt-4">
                        <Label className="text-lg font-semibold">Upload Images for Each Color *</Label>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {selectedColors.map((colorName) => {
                            const color = PREDEFINED_COLORS.find(c => c.name === colorName);
                            const images = colorImagesMap[colorName];
                            return (
                              <div key={colorName} className="p-3 border rounded-lg bg-white dark:bg-gray-800">
                                <div className="flex items-center gap-3 mb-2">
                                  <div
                                    className="w-8 h-8 rounded-full border-2"
                                    style={{ backgroundColor: color?.code }}
                                  />
                                  <Label className="font-semibold">{colorName}</Label>
                                  {images && images.length > 0 && (
                                    <Badge variant="success" className="ml-auto">
                                      {images.length} image{images.length !== 1 ? 's' : ''}
                                    </Badge>
                                  )}
                                </div>
                                <Input
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  onChange={(e) => handleColorImageChange(colorName, e.target.files)}
                                  className="cursor-pointer text-sm"
                                />
                                {images && images.length > 0 && (
                                  <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/10 rounded text-xs">
                                    {Array.from(images).map((img, i) => (
                                      <div key={i} className="text-green-700 dark:text-green-400">
                                        • {img.name} ({(img.size / 1024).toFixed(1)} KB)
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  /* Single Mode - Dropdown Selection */
                  <div>
                    <Label>Color Name *</Label>
                    <select
                      required
                      value={formData.colorName}
                      onChange={(e) => setFormData({ ...formData, colorName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Select a color</option>
                      {PREDEFINED_COLORS.map((color) => (
                        <option key={color.name} value={color.name}>
                          {color.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Stock *</Label>
                    <Input
                      required
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Price Override (Optional)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder={`Default: Rs. ${basePrice}`}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty to use base price
                    </p>
                  </div>
                </div>
                
                {!bulkMode && (
                  <div className="border-2 border-dashed border-purple-300 rounded-lg p-4 bg-purple-50 dark:bg-purple-900/10">
                    <Label className="text-lg font-bold text-purple-600">
                      Variant Images * (1-4 images)
                    </Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Upload 1-4 images for this color variant
                    </p>
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setImages(e.target.files)}
                      className="cursor-pointer border-2 border-purple-400"
                      required
                    />
                    {images && images.length > 0 && (
                      <div className="mt-2 p-2 bg-green-100 dark:bg-green-900/20 rounded border border-green-400">
                        <p className="text-sm text-green-700 dark:text-green-400 font-semibold">
                          ✅ {images.length} image(s) selected {images.length > 4 && "⚠️ (Max 4 allowed)"}
                        </p>
                        <ul className="text-xs text-green-600 dark:text-green-500 mt-1">
                          {Array.from(images).slice(0, 4).map((img, i) => (
                            <li key={i}>• {img.name} ({(img.size / 1024).toFixed(1)} KB)</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={submitting || (bulkMode && selectedColors.length === 0)} 
                  className="w-full"
                >
                  {submitting 
                    ? "Adding..." 
                    : bulkMode 
                      ? `Add ${selectedColors.length} Color Variant(s)`
                      : "Add Color Variant"
                  }
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Existing Variants */}
        {variants.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No color variants yet. Add one to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {variants.map((variant) => (
              <Card key={variant._id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full border-2 border-gray-300 dark:border-gray-600"
                        style={{ backgroundColor: variant.colorCode }}
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {variant.colorName}
                        </h4>
                        <p className="text-xs text-gray-500">{variant.colorCode}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(variant._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Stock</p>
                      <Badge variant={variant.stock > 0 ? "success" : "destructive"}>
                        {variant.stock}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Price</p>
                      <p className="font-semibold text-sm">
                        Rs. {(variant.price || basePrice).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Image Thumbnails */}
                  <div className="flex gap-2 overflow-x-auto">
                    {variant.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`${variant.colorName} ${idx + 1}`}
                        className="w-16 h-16 object-cover rounded border border-gray-300 dark:border-gray-600 flex-shrink-0"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {variant.images.length} image{variant.images.length !== 1 ? "s" : ""}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
