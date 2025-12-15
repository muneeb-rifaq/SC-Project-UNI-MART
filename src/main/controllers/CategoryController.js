// backend/controllers/CategoryController.js
import CategoryService from "../../backend/modules/categoryModules/CategoryService.js";

class CategoryController {
  static service = new CategoryService();

  // ------------------------------
  // GET ALL CATEGORIES
  // ------------------------------
  static getAll(req, res) {
    console.log("🔍 CategoryController.getAll called");
    try {
      const categories = this.service.getAll();
      console.log(`✅ Retrieved ${categories.length} categories`);
      return res.status(200).json(categories.map((c) => c.toJSON()));
    } catch (err) {
      console.error("❌ Error in CategoryController.getAll:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ------------------------------
  // FIND CATEGORIES BY ATTRIBUTE
  // ------------------------------
  static findByAttribute(req, res) {
    console.log(
      "🔍 CategoryController.findByAttribute called with query:",
      req.query
    );
    try {
      let { attribute, value } = req.query;

      if (!attribute) {
        console.warn("⚠️ Missing 'attribute' query parameter");
        return res.status(400).json({ error: "Attribute query required" });
      }

      if (typeof value === "string") {
        value = decodeURIComponent(value).replace(/^["']|["']$/g, ""); // strip quotes
      }

      if (!isNaN(value)) value = Number(value); // convert numeric strings

      const categories = this.service.getAll();
      const results = categories.filter(
        (c) => c.getAttribute(attribute) === value
      );

      console.log(
        `✅ Found ${results.length} categories matching ${attribute}=${value}`
      );
      return res.status(200).json(results.map((c) => c.toJSON()));
    } catch (err) {
      console.error("❌ Error in CategoryController.findByAttribute:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ------------------------------
  // ADD CATEGORY
  // ------------------------------
  static async addCategory(req, res) {
    console.log(
      "🔍 CategoryController.addCategory called with body:",
      req.body
    );
    try {
      const { name, description } = req.body;

      if (!name) {
        console.warn("⚠️ Missing category name");
        return res.status(400).json({ error: "Name required" });
      }

      const category = await this.service.addCategory(name, description);
      console.log("✅ Category added:", category.toJSON());
      return res.status(201).json(category.toJSON());
    } catch (err) {
      console.error("❌ Error in CategoryController.addCategory:", err);
      return res.status(400).json({ error: err.message });
    }
  }

  // ------------------------------
  // UPDATE ATTRIBUTE
  // ------------------------------
  static updateAttribute(req, res) {
    console.log(
      "🔍 CategoryController.updateAttribute called for id:",
      req.params.id
    );
    try {
      const id = Number(req.params.id);
      const { attribute, value } = req.body;

      if (!attribute || value === undefined) {
        return res.status(400).json({ error: "Attribute and value required" });
      }

      console.log(
        `🔍 Attempting to update category ${id}: attribute="${attribute}", value="${value}"`
      );

      const updated = this.service.updateAttribute(id, attribute, value);

      if (!updated) {
        console.error(`❌ Failed to update category ${id}:`);
        console.error(`   Attempted attribute: "${attribute}"`);
        console.error(`   Attempted value: "${value}"`);
        console.error(`   Allowed attributes: [categoryName, description]`);
        console.error(
          `   Reason: Either attribute not allowed, category not found, or repository rejected the update`
        );
        return res.status(400).json({
          error: "Attribute update failed",
          details: {
            attempted: attribute,
            allowed: ["categoryName", "description"],
            categoryId: id,
          },
        });
      }

      console.log(`✅ Category ${id} updated attribute ${attribute} to`, value);
      return res.status(200).json(updated.toJSON());
    } catch (err) {
      console.error("❌ Error in CategoryController.updateAttribute:");
      console.error("   Error message:", err.message);
      console.error("   Stack trace:", err.stack);
      return res.status(500).json({ error: err.message });
    }
  }

  // ------------------------------
  // UPDATE CATEGORY (BULK UPDATE)
  // ------------------------------
  static updateCategory(req, res) {
    console.log(
      "🔍 updateCategory called for id:",
      req.params.id,
      "body:",
      req.body
    );
    try {
      const id = Number(req.params.id);
      const updates = req.body;

      // Map of frontend field names to backend attribute names
      const fieldMapping = {
        name: "categoryName",
        description: "description",
      };

      let category = null;

      // Apply each update
      for (const [field, value] of Object.entries(updates)) {
        const attribute = fieldMapping[field] || field;

        if (value !== undefined && value !== null && value !== "") {
          const updated = this.service.updateAttribute(id, attribute, value);
          if (updated) {
            category = updated;
          }
        }
      }

      if (!category) {
        return res.status(400).json({ error: "Failed to update category" });
      }

      console.log(`✅ Category ${id} updated successfully`);
      return res.status(200).json(category.toJSON());
    } catch (err) {
      console.error("❌ Error in updateCategory:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ------------------------------
  // DELETE CATEGORY
  // ------------------------------
  static deleteCategory(req, res) {
    console.log(
      "🔍 CategoryController.deleteCategory called for id:",
      req.params.id
    );
    try {
      const id = Number(req.params.id);
      const ok = this.service.deleteCategory(id);

      if (!ok) {
        console.warn(`⚠️ Category ${id} not found`);
        return res.status(404).json({ error: "Category not found" });
      }

      console.log(`✅ Category ${id} deleted successfully`);
      return res.status(200).json({ message: "Category deleted successfully" });
    } catch (err) {
      console.error("❌ Error in CategoryController.deleteCategory:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ------------------------------
  // ERASE ALL CATEGORIES
  // ------------------------------
  static eraseAll(req, res) {
    console.log("🔍 CategoryController.eraseAll called");
    try {
      const ok = this.service.eraseAll();
      console.log("✅ All categories deleted");
      return res.status(200).json({
        success: ok,
        message: "All categories deleted",
      });
    } catch (err) {
      console.error("❌ Error in CategoryController.eraseAll:", err);
      return res.status(500).json({ error: err.message });
    }
  }
}

export default CategoryController;
