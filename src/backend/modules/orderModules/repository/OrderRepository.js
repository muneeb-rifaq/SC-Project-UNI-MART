// src/backend/modules/orderModules/repository/OrderRepository.js
export default class OrderRepository {
  constructor(path) {
    if (new.target === OrderRepository) {
      throw new Error(
        "OrderRepository is abstract and cannot be instantiated."
      );
    }
    this.path = path;
  }

  load() {
    throw new Error("load() not implemented");
  }

  addOrder(orderInstance) {
    throw new Error("addOrder() not implemented");
  }

  deleteOrder(id) {
    throw new Error("deleteOrder() not implemented");
  }

  updateAttribute(id, attributeName, newValue) {
    throw new Error("updateAttribute() not implemented");
  }

  save(orders) {
    throw new Error("save() not implemented");
  }

  eraseAll() {
    throw new Error("eraseAll() not implemented");
  }

  getHighestID() {
    throw new Error("getHighestID() not implemented");
  }
}
