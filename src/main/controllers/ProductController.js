// backend/controllers/ProductController.js
import ProductService from "../../backend/modules/productModules/ProductService.js";

class ProductController {
  static service = new ProductService();

  // ------------------------------
  // GET ALL PRODUCTS
  // ------------------------------
  static getAll(req, res) {
    console.log("🔍 getAll called");
    try {
      const products = this.service.getAll();
      console.log(`✅ Retrieved ${products.length} products`);
      return res.status(200).json(products.map((p) => p.toJSON()));
    } catch (err) {
      console.error("❌ Error in getAll:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ------------------------------
  // ADD PRODUCT
  // ------------------------------
  static async addProduct(req, res) {
    console.log("🔍 addProduct called with body:", req.body);
    try {
      const { name, sellerId, description, price, stock, categoryId } =
        req.body;

      if (!name || !sellerId || !price || !categoryId) {
        console.warn("⚠️ Missing required product fields");
        return res.status(400).json({ error: "Missing required fields" });
      }

      const product = await this.service.addProduct(
        name,
        Number(sellerId),
        description,
        Number(price),
        Number(stock),
        Number(categoryId)
      );

      console.log("✅ Product added:", product.toJSON());
      return res.status(201).json(product.toJSON());
    } catch (err) {
      console.error("❌ Error in addProduct:", err);
      return res.status(400).json({ error: err.message });
    }
  }

  // ------------------------------
  // UPDATE ATTRIBUTE
  // ------------------------------
  static updateAttribute(req, res) {
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔍 ProductController.updateAttribute() CALLED");
    console.log("   Product ID:", req.params.id);
    console.log("   Request body:", JSON.stringify(req.body, null, 2));
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    try {
      const id = Number(req.params.id);
      const { attribute, value } = req.body;

      if (!attribute || value === undefined) {
        return res.status(400).json({ error: "Attribute and value required" });
      }

      console.log(
        `🔍 Attempting to update product ${id}: attribute="${attribute}", value="${value}"`
      );

      const updated = this.service.updateAttribute(id, attribute, value);

      if (!updated) {
        console.error(`❌ Failed to update product ${id}:`);
        console.error(`   Attempted attribute: "${attribute}"`);
        console.error(`   Attempted value: "${value}"`);
        console.error(
          `   Allowed attributes: [productName, sellerId, description, price, stock, categoryId]`
        );
        console.error(
          `   Reason: Either attribute not allowed, product not found, or repository rejected the update`
        );
        return res.status(400).json({
          error: "Attribute update failed",
          details: {
            attempted: attribute,
            allowed: [
              "productName",
              "sellerId",
              "description",
              "price",
              "stock",
              "categoryId",
            ],
            productId: id,
          },
        });
      }

      console.log(`✅ Product ${id} updated attribute ${attribute} to`, value);
      return res.status(200).json(updated.toJSON());
    } catch (err) {
      console.error("❌ Error in updateAttribute:");
      console.error("   Error message:", err.message);
      console.error("   Stack trace:", err.stack);
      return res.status(500).json({ error: err.message });
    }
  }

  // ------------------------------
  // UPDATE PRODUCT (BULK UPDATE)
  // ------------------------------
  static updateProduct(req, res) {
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✨ ProductController.updateProduct() CALLED");
    console.log("   Product ID:", req.params.id);
    console.log("   Request body:", JSON.stringify(req.body, null, 2));
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    try {
      const id = Number(req.params.id);
      const updates = req.body;

      // Map of frontend field names to backend attribute names
      const fieldMapping = {
        name: "productName",
        price: "price",
        stock: "stock",
        description: "description",
        categoryId: "categoryId",
        sellerId: "sellerId",
      };

      let product = null;

      // Apply each update
      for (const [field, value] of Object.entries(updates)) {
        const attribute = fieldMapping[field] || field;

        if (value !== undefined && value !== null && value !== "") {
          const updated = this.service.updateAttribute(id, attribute, value);
          if (updated) {
            product = updated;
          }
        }
      }

      if (!product) {
        return res.status(400).json({ error: "Failed to update product" });
      }

      console.log(`✅ Product ${id} updated successfully`);
      return res.status(200).json(product.toJSON());
    } catch (err) {
      console.error("❌ Error in updateProduct:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ------------------------------
  // DELETE PRODUCT
  // ------------------------------
  static deleteProduct(req, res) {
    console.log("🔍 deleteProduct called for id:", req.params.id);
    try {
      const id = Number(req.params.id);
      const ok = this.service.deleteProduct(id);

      if (!ok) {
        console.warn(`⚠️ Product ${id} not found`);
        return res.status(404).json({ error: "Product not found" });
      }

      console.log(`✅ Product ${id} deleted successfully`);
      return res.status(200).json({ message: "Product deleted successfully" });
    } catch (err) {
      console.error("❌ Error in deleteProduct:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ------------------------------
  // FIND PRODUCT BY ATTRIBUTE
  // ------------------------------
  static findByAttribute(req, res) {
    console.log("🔍 findByAttribute called with query:", req.query);
    try {
      let { attribute, value } = req.query;

      if (!attribute) {
        console.warn("⚠️ Missing 'attribute' query parameter");
        return res.status(400).json({ error: "attribute query required" });
      }

      // 🔥 Convert numeric strings to numbers
      if (!isNaN(value)) {
        value = Number(value);
        console.log("🔢 Converted value to number:", value);
      }

      const results = this.service.findByAttribute(attribute, value);
      console.log(
        `✅ Found ${results.length} products matching ${attribute}=${value}`
      );
      return res.status(200).json(results.map((p) => p.toJSON()));
    } catch (err) {
      console.error("❌ Error in findByAttribute:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ------------------------------
  // ERASE ALL PRODUCTS
  // ------------------------------
  static eraseAll(req, res) {
    console.log("🔍 eraseAll called");
    try {
      const ok = this.service.eraseAll();
      console.log("✅ All products deleted");
      return res.status(200).json({
        success: ok,
        message: "All products deleted",
      });
    } catch (err) {
      console.error("❌ Error in eraseAll:", err);
      return res.status(500).json({ error: err.message });
    }
  }
}

export default ProductController;
