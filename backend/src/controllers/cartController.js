import User from "../models/User.js";

// Get user cart
export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("cart.product");
    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Merge localStorage cart after login
export const mergeCart = async (req, res) => {
  try {
    const { items } = req.body;
    console.log("🔄 Merging cart items:", items);
    
    const user = await User.findById(req.user._id);

    if (!items || items.length === 0) {
      const updatedUser = await User.findById(req.user._id).populate("cart.product");
      return res.json(updatedUser.cart);
    }

    items.forEach(item => {
      // Handle both formats: {product: {_id: "..."}, quantity: 1} and {product: "id", quantity: 1}
      const productId = typeof item.product === 'object' ? item.product._id : item.product;
      
      const existing = user.cart.find(c => c.product.toString() === productId);
      if (existing) {
        existing.quantity += item.quantity;
        console.log(`✅ Updated existing item ${productId}: quantity ${existing.quantity}`);
      } else {
        user.cart.push({ product: productId, quantity: item.quantity });
        console.log(`✅ Added new item ${productId}: quantity ${item.quantity}`);
      }
    });

    await user.save();
    const updatedUser = await User.findById(req.user._id).populate("cart.product");
    console.log("✅ Cart merged successfully. Total items:", updatedUser.cart.length);
    res.json(updatedUser.cart);
  } catch (err) {
    console.error("❌ Error merging cart:", err);
    res.status(500).json({ message: err.message });
  }
};

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const user = await User.findById(req.user._id);

    const existing = user.cart.find(item => item.product.toString() === productId);
    if (existing) existing.quantity += quantity;
    else user.cart.push({ product: productId, quantity });

    await user.save();
    const updatedUser = await User.findById(req.user._id).populate("cart.product");
    res.json(updatedUser.cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const user = await User.findById(req.user._id);

    const item = user.cart.find(c => c.product.toString() === req.params.productId);
    if (!item) return res.status(404).json({ message: "Item not in cart" });

    item.quantity = quantity;
    await user.save();

    const updatedUser = await User.findById(req.user._id).populate("cart.product");
    res.json(updatedUser.cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = user.cart.filter(item => item.product.toString() !== req.params.productId);

    await user.save();
    const updatedUser = await User.findById(req.user._id).populate("cart.product");
    res.json(updatedUser.cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = [];
    await user.save();
    res.json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
