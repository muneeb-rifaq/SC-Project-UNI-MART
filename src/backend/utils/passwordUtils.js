// backend/utils/passwordUtils.js
import bcrypt from "bcryptjs";

/**
 * Hash a plain text password asynchronously.
 */
export async function hashPassword(password) {
  try {
    const saltRounds = 10;
    const hashed = await bcrypt.hash(password, saltRounds);
    console.log("✅ Password hashed successfully");
    return hashed;
  } catch (err) {
    console.error("❌ Error hashing password:", err);
    throw err;
  }
}

/**
 * Compare a plain password with a hash
 */
export async function verifyPassword(password, hash) {
  try {
    const result = await bcrypt.compare(password, hash);
    console.log("✅ Password verification result:", result);
    return result;
  } catch (err) {
    console.error("❌ Error comparing password:", err);
    return false;
  }
}
