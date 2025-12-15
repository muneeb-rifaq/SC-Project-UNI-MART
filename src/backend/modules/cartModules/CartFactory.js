import Cart from "./Cart.js";

class CartFactory {
  static cartCounter = 1;

  static makeCart(userId) {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new Error("Invalid userId for creating cart");
    }

    return new Cart(this.cartCounter++, userId, []);
  }
}

export default CartFactory;
