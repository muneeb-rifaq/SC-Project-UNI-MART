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

class UserFactory {
  /**
   * Create a new User from raw input.
   * Never expose raw passwords to User entity.
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
