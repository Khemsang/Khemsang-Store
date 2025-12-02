import User from "../models/User.js";

// @desc    Get user cart
// @route   GET /api/cart
export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("cart.product");
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Merge cart from localStorage
// @route   POST /api/cart/merge
export const mergeCart = async (req, res) => {
  try {
    const { items } = req.body; // items: [{ product: id, quantity: number }]

    const user = await User.findById(req.user._id);

    // Merge logic: add new items or update quantities
    items.forEach((item) => {
      const existingItem = user.cart.find(
        (cartItem) => cartItem.product.toString() === item.product
      );

      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        user.cart.push(item);
      }
    });

    await user.save();
    const updatedUser = await User.findById(req.user._id).populate(
      "cart.product"
    );

    res.json(updatedUser.cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add to cart
// @route   POST /api/cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const user = await User.findById(req.user._id);
    const existingItem = user.cart.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity || 1;
    } else {
      user.cart.push({ product: productId, quantity: quantity || 1 });
    }

    await user.save();
    const updatedUser = await User.findById(req.user._id).populate(
      "cart.product"
    );

    res.json(updatedUser.cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
export const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;

    const user = await User.findById(req.user._id);
    const cartItem = user.cart.find(
      (item) => item.product.toString() === req.params.productId
    );

    if (!cartItem) {
      return res.status(404).json({ message: "Item not in cart" });
    }

    cartItem.quantity = quantity;
    await user.save();

    const updatedUser = await User.findById(req.user._id).populate(
      "cart.product"
    );
    res.json(updatedUser.cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove from cart
// @route   DELETE /api/cart/:productId
export const removeFromCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = user.cart.filter(
      (item) => item.product.toString() !== req.params.productId
    );

    await user.save();
    const updatedUser = await User.findById(req.user._id).populate(
      "cart.product"
    );

    res.json(updatedUser.cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
export const clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = [];
    await user.save();

    res.json({ message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
