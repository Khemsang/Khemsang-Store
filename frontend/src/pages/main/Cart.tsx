import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { ShoppingCart, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Package } from "lucide-react";

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      navigate("/login", { state: { from: "/checkout" } });
    } else {
      navigate("/checkout");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:from-gray-900 dark:via-blue-900/10 dark:to-gray-900 py-12">
        <div className="max-w-[1200px] mx-auto px-4">
          <Card className="border-gray-200 dark:border-gray-700">
            <CardContent className="text-center py-16">
              <div className="mx-auto h-24 w-24 bg-gradient-to-br from-blue-100 to-orange-100 dark:from-blue-900/30 dark:to-orange-900/30 rounded-full flex items-center justify-center mb-6">
                <ShoppingCart className="h-12 w-12 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Your cart is empty
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Add some products to get started!
              </p>
              <Button
                onClick={() => navigate("/products")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:from-gray-900 dark:via-blue-900/10 dark:to-gray-900 py-8 sm:py-12">
      <div className="container px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Shopping Cart
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {cart.length} {cart.length === 1 ? "item" : "items"} • {cart.reduce((sum, item) => sum + item.quantity, 0)} total units
              </p>
            </div>
          </div>
          <Badge variant="default" className="bg-blue-600 text-white">
            {cart.length} {cart.length === 1 ? "variant" : "variants"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => {
              if (!item.product || !item.product.title) {
                return null;
              }

              const itemTotal = (item.product.price || 0) * item.quantity;

              const itemKey = item._id || index.toString();

              return (
                <Card
                  key={itemKey}
                  className="border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      
                      <div className="flex-shrink-0 mx-auto sm:mx-0">
                        <div className="relative w-full sm:w-24 md:w-32 h-48 sm:h-24 md:h-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                          <img
                            src={item.product.images?.[0] || "/placeholder.jpg"}
                            alt={item.product.title || "Product"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                              {item.product.title}
                            </h3>
                            {item.colorVariant && (
                              <div className="flex items-center gap-2 mt-1">
                                <div
                                  className="w-5 h-5 rounded-full border-2 border-gray-300"
                                  style={{ backgroundColor: item.colorVariant.colorCode }}
                                  title={item.colorVariant.colorName}
                                />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {item.colorVariant.colorName}
                                </span>
                              </div>
                            )}
                            
                            {item.product.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                                {item.product.description}
                              </p>
                            )}
                            
                            {item.product.brand && (
                              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                Brand: <span className="font-medium">{item.product.brand}</span>
                              </p>
                            )}
                            
                            {item.product.stock !== undefined && (
                              <div className="flex items-center gap-2 mt-1">
                                {item.product.stock > 0 ? (
                                  <>
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-sm text-green-600 dark:text-green-400">
                                      In Stock ({item.product.stock} available)
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    <span className="text-sm text-red-600 dark:text-red-400">
                                      Out of Stock
                                    </span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(itemKey)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 ml-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {item.product.category && (
                          <Badge variant="default" className="mb-3">
                            {item.product.category}
                          </Badge>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">
                              Quantity:
                            </span>
                            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  updateQuantity(
                                    itemKey,
                                    Math.max(1, item.quantity - 1)
                                  )
                                }
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-12 text-center font-semibold text-gray-900 dark:text-white">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  updateQuantity(
                                    itemKey,
                                    item.quantity + 1
                                  )
                                }
                                className="h-8 w-8 p-0"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          
                          <div className="flex items-center justify-between sm:flex-col sm:items-end gap-1">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Rs. {item.product.price?.toLocaleString()} each
                            </span>
                            <span className="text-xl font-bold bg-blue-600 bg-clip-text text-transparent">
                              Rs. {itemTotal.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          
          <div className="lg:col-span-1">
            <Card className="border-gray-200 dark:border-gray-700 lg:sticky lg:top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal ({cart.length} {cart.length === 1 ? "variant" : "variants"}, {cart.reduce((sum, item) => sum + item.quantity, 0)} units)</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Rs. {getCartTotal().toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Shipping</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Rs. 100
                    </span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        Total
                      </span>
                      <span className="text-2xl font-bold bg-blue-600 bg-clip-text text-transparent">
                        Rs. {(getCartTotal() + 100).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                
                <div className="space-y-3 pt-2">
                  <Button
                    onClick={handleCheckout}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    onClick={() => navigate("/products")}
                    variant="outline"
                    className="w-full"
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Continue Shopping
                  </Button>
                </div>

                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                      </div>
                      <span>Secure checkout</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                      </div>
                      <span>Free shipping on orders over Rs. 5000</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                      </div>
                      <span>Easy returns within 7 days</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
