// CartService.js

import Cart from "./Cart.js";
import CartFactory from "./CartFactory.js";

class CartService {
  #carts;
  #factory;

  constructor() {
    this.#carts = [];
    this.#factory = new CartFactory();
  }

  // --------------------------
  // Get cart for a user
  // --------------------------
  getCartByUser(userId) {
    return this.#carts.find((c) => c.getAttribute("userId") === userId) || null;
  }

  // --------------------------
  // Create new cart
  // --------------------------
  createCart(userId) {
    const existing = this.getCartByUser(userId);
    if (existing) return existing;

    const cart = this.#factory.createNewCart(userId);
    if (!cart) return null;

    this.#carts.push(cart);
    return cart;
  }

  // --------------------------
  // Add item to cart
  // --------------------------
  addItem(userId, productId, price, volume) {
    let cart = this.getCartByUser(userId);
    if (!cart) cart = this.createCart(userId);

    const item = this.#factory.createItem(productId, price, volume);
    if (!item) return null;

    const items = cart.getAttribute("items");
    const existing = items.find((i) => i.productId === productId);

    if (existing) {
      existing.productVolume += volume;
      cart.updateAttribute("items", items);
      return existing;
    }

    items.push(item);
    cart.updateAttribute("items", items);
    return item;
  }

  // --------------------------
  // Update volume of item
  // --------------------------
  updateVolume(userId, productId, newVolume) {
    const cart = this.getCartByUser(userId);
    if (!cart) return null;

    const items = cart.getAttribute("items");
    const item = items.find((i) => i.productId === productId);

    if (!item) return null;

    if (newVolume <= 0) {
      return this.removeItem(userId, productId);
    }

    item.productVolume = newVolume;
    cart.updateAttribute("items", items);

    return item;
  }

  // --------------------------
  // Remove an item
  // --------------------------
  removeItem(userId, productId) {
    const cart = this.getCartByUser(userId);
    if (!cart) return false;

    let items = cart.getAttribute("items");
    const newItems = items.filter((i) => i.productId !== productId);

    if (newItems.length === items.length) return false;

    cart.updateAttribute("items", newItems);
    return true;
  }

  // --------------------------
  // Clear cart
  // --------------------------
  clearCart(userId) {
    const cart = this.getCartByUser(userId);
    if (!cart) return false;

    cart.updateAttribute("items", []);
    return true;
  }

  // --------------------------
  // Total cost
  // --------------------------
  getTotalCost(userId) {
    const cart = this.getCartByUser(userId);
    if (!cart) return 0;

    return cart
      .getAttribute("items")
      .reduce((sum, item) => sum + item.productPrice * item.productVolume, 0);
  }

  // --------------------------
  // Remove all carts (reset)
  // --------------------------
  eraseAll() {
    this.#carts = [];
    return true;
  }
}

export default CartService;
