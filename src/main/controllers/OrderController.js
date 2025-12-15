// backend/controllers/OrderController.js
import OrderService from "../../backend/modules/orderModules/OrderService.js";

class OrderController {
  static service = new OrderService();

  // ------------------------------
  // GET ALL ORDERS
  // ------------------------------
  static getAll(req, res) {
    console.log("🔍 OrderController.getAll called");
    try {
      const orders = this.service.getAll();
      console.log(`✅ Retrieved ${orders.length} orders`);
      return res.status(200).json(orders.map((o) => o.toJSON()));
    } catch (err) {
      console.error("❌ Error in OrderController.getAll:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ------------------------------
  // FIND ORDERS BY ATTRIBUTE
  // ------------------------------
  static findByAttribute(req, res) {
    console.log(
      "🔍 OrderController.findByAttribute called with query:",
      req.query
    );
    try {
      let { attribute, value } = req.query;

      if (!attribute) {
        console.warn("⚠️ Missing 'attribute' query parameter");
        return res.status(400).json({ error: "Attribute query required" });
      }

      if (typeof value === "string") {
        value = decodeURIComponent(value).replace(/^["']|["']$/g, ""); // remove quotes
      }

      if (!isNaN(value)) value = Number(value); // convert numeric strings

      const results = this.service.findByAttribute(attribute, value);
      console.log(
        `✅ Found ${results.length} orders matching ${attribute}=${value}`
      );
      return res.status(200).json(results.map((o) => o.toJSON()));
    } catch (err) {
      console.error("❌ Error in OrderController.findByAttribute:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ------------------------------
  // ADD ORDER
  // ------------------------------
  static async addOrder(req, res) {
    console.log("🔍 OrderController.addOrder called with body:", req.body);
    try {
      const { product, buyerId, sellerId, quantity, totalPrice } = req.body;

      if (!product || !buyerId || !sellerId || !quantity || !totalPrice) {
        console.warn("⚠️ Missing required order fields");
        return res.status(400).json({ error: "Missing required fields" });
      }

      const order = await this.service.addOrder(
        product,
        Number(buyerId),
        Number(sellerId),
        Number(quantity),
        Number(totalPrice)
      );

      if (!order) {
        console.error("❌ OrderService.addOrder returned null");
        return res.status(500).json({ error: "Failed to create order" });
      }

      console.log("✅ Order added:", order.toJSON());
      return res.status(201).json(order.toJSON());
    } catch (err) {
      console.error("❌ Error in OrderController.addOrder:", err);
      return res.status(400).json({ error: err.message });
    }
  }

  // ------------------------------
  // UPDATE ATTRIBUTE
  // ------------------------------
  static updateAttribute(req, res) {
    console.log(
      "🔍 OrderController.updateAttribute called for id:",
      req.params.id,
      "body:",
      req.body
    );
    try {
      const id = Number(req.params.id);
      const { attribute, value } = req.body;

      if (!attribute || value === undefined) {
        return res.status(400).json({ error: "Attribute and value required" });
      }

      console.log(
        `🔍 Attempting to update order ${id}: attribute="${attribute}", value="${value}"`
      );

      const updated = this.service.updateAttribute(id, attribute, value);

      if (!updated) {
        console.error(`❌ Failed to update order ${id}:`);
        console.error(`   Attempted attribute: "${attribute}"`);
        console.error(`   Attempted value: "${value}"`);
        console.error(
          `   Allowed attributes: [product, buyerId, sellerId, quantity, totalPrice, status]`
        );
        console.error(
          `   Reason: Either attribute not allowed, order not found, or repository rejected the update`
        );
        return res.status(400).json({
          error: "Attribute update failed",
          details: {
            attempted: attribute,
            allowed: [
              "product",
              "buyerId",
              "sellerId",
              "quantity",
              "totalPrice",
              "status",
            ],
            orderId: id,
          },
        });
      }

      console.log(`✅ Order ${id} updated attribute ${attribute} to`, value);
      return res.status(200).json(updated.toJSON());
    } catch (err) {
      console.error("❌ Error in OrderController.updateAttribute:");
      console.error("   Error message:", err.message);
      console.error("   Stack trace:", err.stack);
      return res.status(500).json({ error: err.message });
    }
  }

  // ------------------------------
  // DELETE ORDER
  // ------------------------------
  static deleteOrder(req, res) {
    console.log("🔍 OrderController.deleteOrder called for id:", req.params.id);
    try {
      const id = Number(req.params.id);
      const ok = this.service.deleteOrder(id);

      if (!ok) {
        console.warn(`⚠️ Order ${id} not found`);
        return res.status(404).json({ error: "Order not found" });
      }

      console.log(`✅ Order ${id} deleted successfully`);
      return res.status(200).json({ message: "Order deleted successfully" });
    } catch (err) {
      console.error("❌ Error in OrderController.deleteOrder:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ------------------------------
  // ERASE ALL ORDERS
  // ------------------------------
  static eraseAll(req, res) {
    console.log("🔍 OrderController.eraseAll called");
    try {
      const ok = this.service.eraseAll();
      console.log("✅ All orders deleted");
      return res.status(200).json({
        success: ok,
        message: "All orders deleted",
      });
    } catch (err) {
      console.error("❌ Error in OrderController.eraseAll:", err);
      return res.status(500).json({ error: err.message });
    }
  }
}

export default OrderController;
