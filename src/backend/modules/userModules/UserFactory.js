// --------------------------------------------
// UserFactory.js (Clean Architecture Version)
// --------------------------------------------
// Responsibilities:
// - Validate raw input from outside world
// - Hash the password
// - Produce a fully-validated User entity
// --------------------------------------------

import User from "./User.js";
import { hashPassword } from "../../utils/passwordUtils.js";
// make sure this path is correct

/**
 * Factory class for creating User entities.
 * Handles password hashing and initial validation.
 */
class UserFactory {
  /**
   * Create a new User from raw input.
   * Never expose raw passwords to User entity.
   * @param {number} userId - Unique identifier for the user.
   * @param {string} username - The user's username.
   * @param {string} email - The user's email address.
   * @param {string} password - The raw password (will be hashed).
   * @param {string} role - The user's role.
   * @returns {Promise<User>} A new User instance with hashed password.
   * @throws {Error} If password is invalid or empty.
   */
  static async createNewUser(userId, username, email, password, role) {
    if (!password || typeof password !== "string") {
      throw new Error("Password must be a non-empty string");
    }

    // Hash the password safely
    const passwordHash = await hashPassword(password);

    // Create a fully validated domain User entity
    return new User(userId, username, email, passwordHash, role);
  }

  // -----------------------------
  // Create a sample user with random valid values
  // -----------------------------
  /**
   * Creates a sample user for testing purposes.
   * @param {number} id - The user ID.
   * @param {string} [role] - Optional role. If not provided, a random role is assigned.
   * @returns {Promise<User>} A sample User instance.
   * @throws {Error} If an invalid role is provided.
   */
  static async makeSampleUser(id, role) {
    const sampleNames = [
      "john_doe",
      "alice_smith",
      "bob_jones",
      "eve_williams",
    ];
    const sampleDomains = ["example.com", "mail.com", "test.org"];

    const username =
      sampleNames[Math.floor(Math.random() * sampleNames.length)];
    const email = `${username}@${
      sampleDomains[Math.floor(Math.random() * sampleDomains.length)]
    }`;
    const plainPassword = "password123";

    const validRoles = ["buyer", "seller", "admin"];
    if (!role) {
      role = validRoles[Math.floor(Math.random() * validRoles.length)];
    } else if (!validRoles.includes(role)) {
      throw new Error(`Invalid role for sample user: ${role}`);
    }

    return this.createNewUser(id, username, email, plainPassword, role);
  }
}

export default UserFactory;
