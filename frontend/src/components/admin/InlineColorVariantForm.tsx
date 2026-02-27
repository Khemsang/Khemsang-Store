import React, { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Plus, Trash2, Image as ImageIcon, Palette } from "lucide-react";

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

interface VariantFormData {
  colorName: string;
  colorCode: string;
  stock: string;
  price: string;
  images: File[];
}

interface InlineColorVariantFormProps {
  variants: VariantFormData[];
  onVariantsChange: (variants: VariantFormData[]) => void;
  basePrice: string;
}

export const InlineColorVariantForm: React.FC<InlineColorVariantFormProps> = ({
  variants,
  onVariantsChange,
  basePrice,
}) => {
  const [currentVariant, setCurrentVariant] = useState<VariantFormData>({
    colorName: "",
    colorCode: "",
    stock: "",
    price: "",
    images: [],
  });
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [colorImagesMap, setColorImagesMap] = useState<Record<string, File[]>>({});
  const [commonStock, setCommonStock] = useState("");
  const [commonPrice, setCommonPrice] = useState("");

  const handleAddVariant = () => {
    if (bulkMode) {
      // Bulk add multiple colors
      if (selectedColors.length === 0) {
        alert("Please select at least one color");
        return;
      }
      
      // Check if all selected colors have images
      const missingImages = selectedColors.filter(
        color => !colorImagesMap[color] || colorImagesMap[color].length === 0
      );
      
      if (missingImages.length > 0) {
        alert(`Please upload images for: ${missingImages.join(", ")}`);
        return;
      }
      
      if (!commonStock || Number(commonStock) < 0) {
        alert("Please enter valid stock");
        return;
      }

      const newVariants = selectedColors.map(colorName => {
        const color = PREDEFINED_COLORS.find(c => c.name === colorName);
        return {
          colorName: color!.name,
          colorCode: color!.code,
          stock: commonStock,
          price: commonPrice,
          images: colorImagesMap[colorName] || [],
        };
      });

      onVariantsChange([...variants, ...newVariants]);
      
      // Reset bulk form
      setSelectedColors([]);
      setColorImagesMap({});
      setCommonStock("");
      setCommonPrice("");
    } else {
      // Single add
      if (!currentVariant.colorName.trim()) {
        alert("Please select a color");
        return;
      }
      if (currentVariant.images.length < 1 || currentVariant.images.length > 4) {
        alert("Please upload 1-4 images for the color variant");
        return;
      }
      if (!currentVariant.stock || Number(currentVariant.stock) < 0) {
        alert("Please enter valid stock");
        return;
      }

      const color = PREDEFINED_COLORS.find(c => c.name === currentVariant.colorName);
      if (!color) {
        alert("Invalid color selected");
        return;
      }

      onVariantsChange([...variants, { ...currentVariant, colorCode: color.code }]);
      setCurrentVariant({
        colorName: "",
        colorCode: "",
        stock: "",
        price: "",
        images: [],
      });
    }
  };

  const handleRemoveVariant = (index: number) => {
    onVariantsChange(variants.filter((_, i) => i !== index));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (files.length > 4) {
        alert("Maximum 4 images allowed per variant");
        return;
      }
      setCurrentVariant({ ...currentVariant, images: Array.from(files) });
    }
  };

  const handleColorImageChange = (colorName: string, files: FileList | null) => {
    if (files && files.length > 0) {
      if (files.length > 4) {
        alert("Maximum 4 images allowed per color");
        return;
      }
      setColorImagesMap(prev => ({
        ...prev,
        [colorName]: Array.from(files)
      }));
    }
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-bold">Color Variants (Optional)</Label>
        <Badge className="text-xs">
          {variants.length} variant{variants.length !== 1 ? "s" : ""} added
        </Badge>
      </div>

      {/* Add Variant Form */}
      <Card className="border-2 border-dashed border-purple-300 dark:border-purple-700">
        <CardContent className="p-4 space-y-4">
          {/* Mode Toggle */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={!bulkMode ? "default" : "outline"}
              onClick={() => {
                setBulkMode(false);
                setSelectedColors([]);
                setColorImagesMap({});
                setCommonStock("");
                setCommonPrice("");
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
                setCurrentVariant({
                  colorName: "",
                  colorCode: "",
                  stock: "",
                  price: "",
                  images: [],
                });
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
                      const images = colorImagesMap[colorName] || [];
                      return (
                        <div key={colorName} className="p-3 border rounded-lg bg-white dark:bg-gray-800">
                          <div className="flex items-center gap-3 mb-2">
                            <div
                              className="w-8 h-8 rounded-full border-2"
                              style={{ backgroundColor: color?.code }}
                            />
                            <Label className="font-semibold">{colorName}</Label>
                            {images.length > 0 && (
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
                          {images.length > 0 && (
                            <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/10 rounded text-xs">
                              {images.map((img, i) => (
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Stock (Common for all) *</Label>
                  <Input
                    type="number"
                    min="0"
                    value={commonStock}
                    onChange={(e) => setCommonStock(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Price Override (Optional)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={commonPrice}
                    onChange={(e) => setCommonPrice(e.target.value)}
                    placeholder={basePrice ? `Default: Rs. ${basePrice}` : "Optional"}
                  />
                </div>
              </div>
            </>
          ) : (
            /* Single Mode - Dropdown Selection */
            <>
              <div>
                <Label>Color Name *</Label>
                <select
                  value={currentVariant.colorName}
                  onChange={(e) => {
                    const color = PREDEFINED_COLORS.find(c => c.name === e.target.value);
                    setCurrentVariant({ 
                      ...currentVariant, 
                      colorName: e.target.value,
                      colorCode: color?.code || ""
                    });
                  }}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Stock *</Label>
                  <Input
                    type="number"
                    min="0"
                    value={currentVariant.stock}
                    onChange={(e) =>
                      setCurrentVariant({ ...currentVariant, stock: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Price Override (Optional)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={currentVariant.price}
                    onChange={(e) =>
                      setCurrentVariant({ ...currentVariant, price: e.target.value })
                    }
                    placeholder={basePrice ? `Default: Rs. ${basePrice}` : "Optional"}
                  />
                </div>
              </div>

              <div>
                <Label>Variant Images * (1-4 images)</Label>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
                {currentVariant.images.length > 0 && (
                  <div className="mt-2 p-2 bg-green-100 dark:bg-green-900/20 rounded border border-green-400">
                    <p className="text-sm text-green-700 dark:text-green-400 font-semibold">
                      ✅ {currentVariant.images.length} image(s) selected
                    </p>
                    <ul className="text-xs text-green-600 dark:text-green-500 mt-1">
                      {currentVariant.images.map((img, i) => (
                        <li key={i}>
                          • {img.name} ({(img.size / 1024).toFixed(1)} KB)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}

          <Button
            type="button"
            onClick={handleAddVariant}
            variant="outline"
            className="w-full border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            {bulkMode 
              ? `Add ${selectedColors.length} Color Variant(s)`
              : "Add This Color Variant"
            }
          </Button>
        </CardContent>
      </Card>

      {/* Added Variants List */}
      {variants.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Added Variants:</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {variants.map((variant, index) => (
              <Card key={index} className="overflow-hidden border-purple-200 dark:border-purple-800">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full border-2"
                        style={{ backgroundColor: variant.colorCode }}
                      />
                      <div>
                        <p className="font-semibold text-sm">{variant.colorName}</p>
                        <p className="text-xs text-gray-500">{variant.colorCode}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveVariant(index)}
                      className="h-7 w-7 p-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                    <div>
                      <span className="text-gray-500">Stock:</span>
                      <Badge className="ml-1 text-xs">
                        {variant.stock}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-gray-500">Price:</span>
                      <span className="ml-1 font-semibold">
                        {variant.price ? `Rs. ${variant.price}` : "Default"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-1 overflow-x-auto">
                    {variant.images.map((_, idx) => (
                      <div
                        key={idx}
                        className="w-12 h-12 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded border flex items-center justify-center"
                      >
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {variant.images.length} image{variant.images.length !== 1 ? "s" : ""}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {variants.length === 0 && (
        <div className="text-center py-6 text-gray-500 border-2 border-dashed rounded-lg">
          <Palette className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No color variants added yet</p>
          <p className="text-xs">Add variants above or skip to create product without variants</p>
        </div>
      )}
    </div>
  );
};
