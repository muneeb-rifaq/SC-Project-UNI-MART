// backend/controllers/UserController.js
import UserService from "../../backend/modules/userModules/UserService.js";

class UserController {
  static service = new UserService();

  // ------------------------------
  // GET ALL USERS
  // ------------------------------
  static getAll(req, res) {
    console.log("🔍 UserController.getAll called");
    try {
      const users = this.service.getAll();
      console.log(`✅ Retrieved ${users.length} users`);
      return res.status(200).json(users.map((u) => u.toJSON()));
    } catch (err) {
      console.error("❌ Error in UserController.getAll:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ------------------------------
  // ADD USER
  // ------------------------------
  static async addUser(req, res) {
    console.log("🔍 UserController.addUser called with body:", req.body);
    try {
      const { name, email, passwordHash, role } = req.body;

      if (!name || !email || !passwordHash || !role) {
        console.warn("⚠️ Missing required user fields");
        return res.status(400).json({ error: "Missing required fields" });
      }

      const user = await this.service.addUser(name, email, passwordHash, role);
      console.log("✅ User added:", user.toJSON());
      return res.status(201).json(user.toJSON());
    } catch (err) {
      console.error("❌ Error in UserController.addUser:", err);
      return res.status(400).json({ error: err.message });
    }
  }

  // ------------------------------
  // UPDATE USER ATTRIBUTE
  // ------------------------------
  static updateAttribute(req, res) {
    console.log(
      "🔍 UserController.updateAttribute called for id:",
      req.params.id
    );
    try {
      const id = Number(req.params.id);
      const { attribute, value } = req.body;

      if (!attribute || value === undefined) {
        return res.status(400).json({ error: "Attribute and value required" });
      }

      console.log(
        `🔍 Attempting to update user ${id}: attribute="${attribute}", value="${value}"`
      );

      const updated = this.service.updateAttribute(id, attribute, value);

      if (!updated) {
        console.error(`❌ Failed to update user ${id}:`);
        console.error(`   Attempted attribute: "${attribute}"`);
        console.error(`   Attempted value: "${value}"`);
        console.error(
          `   Allowed attributes: [username, email, passwordHash, role, lastLogin]`
        );
        console.error(
          `   Reason: Either attribute not allowed, user not found, or repository rejected the update`
        );
        return res.status(400).json({
          error: "Attribute update failed",
          details: {
            attempted: attribute,
            allowed: ["username", "email", "passwordHash", "role", "lastLogin"],
            userId: id,
          },
        });
      }

      console.log(`✅ User ${id} updated attribute ${attribute} to`, value);
      return res.status(200).json(updated.toJSON());
    } catch (err) {
      console.error("❌ Error in UserController.updateAttribute:");
      console.error("   Error message:", err.message);
      console.error("   Stack trace:", err.stack);
      return res.status(500).json({ error: err.message });
    }
  }

  // ------------------------------
  // FIND USERS BY ATTRIBUTE
  // ------------------------------
  static findByAttribute(req, res) {
    console.log("🔍 UserController.findByAttribute called");
    try {
      // Support both query parameters (GET) and body (POST)
      const attribute = req.query.attribute || req.body?.attribute;
      const value = req.query.value || req.body?.value;

      if (!attribute || value === undefined) {
        return res.status(400).json({ error: "Attribute and value required" });
      }

      console.log(`🔍 Searching for users where ${attribute}="${value}"`);

      const users = this.service.findByAttribute(attribute, value);

      console.log(
        `✅ Found ${users.length} user(s) with ${attribute}=${value}`
      );
      return res.status(200).json(users.map((u) => u.toJSON()));
    } catch (err) {
      console.error("❌ Error in UserController.findByAttribute:");
      console.error(`   Attempted search: ${attribute}="${value}"`);
      console.error("   Error message:", err.message);
      console.error("   Stack trace:", err.stack);
      return res.status(500).json({ error: err.message });
    }
  }

  // ------------------------------
  // DELETE USER
  // ------------------------------
  static deleteUser(req, res) {
    console.log("🔍 UserController.deleteUser called for id:", req.params.id);
    try {
      const id = Number(req.params.id);
      const ok = this.service.deleteUser(id);

      if (!ok) {
        console.warn(`⚠️ User ${id} not found`);
        return res.status(404).json({ error: "User not found" });
      }

      console.log(`✅ User ${id} deleted successfully`);
      return res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
      console.error("❌ Error in UserController.deleteUser:");
      console.error("   Error message:", err.message);
      console.error("   Stack trace:", err.stack);
      return res.status(500).json({ error: err.message });
    }
  }

  // ------------------------------
  // ERASE ALL USERS
  // ------------------------------
  static eraseAll(req, res) {
    console.log("🔍 UserController.eraseAll called");
    try {
      const ok = this.service.eraseAll();

      if (!ok) {
        console.error("❌ Failed to erase all users");
        return res.status(500).json({ error: "Failed to erase users" });
      }

      console.log("✅ All users erased successfully");
      return res.status(200).json({ message: "All users erased" });
    } catch (err) {
      console.error("❌ Error in UserController.eraseAll:");
      console.error("   Error message:", err.message);
      console.error("   Stack trace:", err.stack);
      return res.status(500).json({ error: err.message });
    }
  }
}

export default UserController;
