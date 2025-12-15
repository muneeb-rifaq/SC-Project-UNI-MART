// backend/modules/Authentication.js
import { verifyPassword } from "../../backend/utils/passwordUtils.js";
import UserService from "../../backend/modules/userModules/UserService.js";
import crypto from "crypto";

console.log("🟢 Initializing Authentication module...");

let service;
try {
  service = new UserService();
  console.log("✅ UserService initialized successfully");
} catch (err) {
  console.error("❌ Failed to initialize UserService:", err);
}

export default class Authentication {
  static cache = new Map();

  static async verifyPermissions({ email, password }) {
    console.log(`🔍 Verifying permissions for email: ${email}`);
    let emailUser;
    try {
      emailUser = service.findByAttribute("email", email)[0];
    } catch (err) {
      console.error("❌ Error fetching user by email:", err);
      return null;
    }

    if (!emailUser) {
      console.warn("⚠️ No user found with this email");
      return null;
    }

    const storedHash = emailUser.getAttribute("passwordHash");
    const storedRole = emailUser.getAttribute("role");
    const userId = emailUser.getAttribute("userId");

    let isCorrectPassword = false;
    try {
      isCorrectPassword = await verifyPassword(password, storedHash);
    } catch (err) {
      console.error("❌ Error verifying password:", err);
      return null;
    }

    if (!isCorrectPassword) {
      console.warn("⚠️ Password mismatch");
      return null;
    }

    const key = crypto
      .createHash("sha256")
      .update(email + Date.now().toString())
      .digest("hex");

    this.cache.set(email, { role: storedRole, key });
    console.log(`✅ Permissions verified for ${email}, key generated`);

    return { userId, role: storedRole, key };
  }

  static confirmUserKey(email, key, expectedRole) {
    console.log(`🔍 Confirming key for ${email} and role ${expectedRole}`);
    const stored = this.cache.get(email);
    if (!stored) {
      console.warn("⚠️ No cached key found for user");
      return false;
    }

    const isValid = stored.key === key && stored.role === expectedRole;
    console.log(`🔑 Key validation result: ${isValid}`);
    return isValid;
  }
}
