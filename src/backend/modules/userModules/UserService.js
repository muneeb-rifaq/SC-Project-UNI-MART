import path from "path";
import { fileURLToPath } from "url";

import User from "./User.js";
import UserSQLRepository from "./repository/UserSQLRepository.js";
import UserJSONRepository from "./repository/UserJSONRepository.js";
import UserFactory from "./UserFactory.js";

/**
 * Service class for managing User entities.
 * Handles storage, retrieval, and business logic for users.
 */
class UserService {
  #users;
  #repository;

  /**
   * Initializes the UserService with a specific file path for storage.
   * Automatically selects between JSON and SQL repositories based on file extension.
   * @param {string} [filePath=null] - Path to the storage file. Defaults to the standard DB path if not provided.
   * @throws {Error} If filePath is not a string or has an invalid extension.
   */
  constructor(filePath = null) {
    // -----------------------------------------
    // Proper default path resolution (same as ProductService)
    // -----------------------------------------
    if (!filePath) {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);

      filePath = path.resolve(
        __dirname,
        "../../storage/DBStorage/unimartDB.db"
      );
    }

    if (typeof filePath !== "string")
      throw new Error("filePath must be a string");

    // -----------------------------------------
    // Pick repository type
    // -----------------------------------------
    if (filePath.endsWith(".json")) {
      this.#repository = new UserJSONRepository(filePath);
    } else if (filePath.endsWith(".db") || filePath.endsWith(".sqlite")) {
      this.#repository = new UserSQLRepository(filePath);
    } else {
      throw new Error("Invalid storage file type");
    }

    // -----------------------------------------
    // Load existing users
    // -----------------------------------------
    try {
      this.#users = this.#repository.load() || [];
    } catch {
      this.#users = [];
    }
  }

  /**
   * Retrieves all users as immutable objects.
   * @returns {User[]} Array of User instances.
   */
  getAll() {
    return this.#users.map((u) => User.fromJSON(u.toJSON()));
  }

  // -----------------------------------------
  // Add user via factory using next available ID
  // -----------------------------------------
  /**
   * Creates and adds a new user to the system.
   * @param {string} username - The username.
   * @param {string} email - The email address.
   * @param {string} passwordHash - The hashed password.
   * @param {string} role - The user's role.
   * @returns {Promise<User|null>} The created User object if successful, null otherwise.
   * @throws {Error} If required fields are missing.
   */
  async addUser(username, email, passwordHash, role) {
    if (!username || !email || !passwordHash)
      throw new Error("username, email, passwordHash required");

    const id = this.getNextAvailableID();

    let user;
    try {
      user = await UserFactory.createNewUser(
        id,
        username,
        email,
        passwordHash,
        role
      );
    } catch (err) {
      console.error("UserFactory.createNewUser failed:", err);
      return null;
    }

    const returnUser = this.#repository.addUser(user);
    if (!returnUser) return null;

    this.#users.push(returnUser);
    return returnUser;
  }

  /**
   * Deletes a user by their ID.
   * @param {number} id - The ID of the user to delete.
   * @returns {boolean} True if deletion was successful, false otherwise.
   */
  deleteUser(id) {
    if (typeof id !== "number" || id <= 0) return false;

    const ok = this.#repository.deleteUser(id);
    if (!ok) return false;

    this.#users = this.#users.filter((u) => u.getAttribute("userId") !== id);
    return true;
  }

  /**
   * Updates a specific attribute of a user.
   * @param {number} id - The ID of the user to update.
   * @param {string} attr - The attribute name to update.
   * @param {any} val - The new value for the attribute.
   * @returns {boolean|null} True if update successful, false if failed, null if invalid input.
   */
  updateAttribute(id, attr, val) {
    if (!attr || typeof id !== "number" || id <= 0) return null;

    const updated = this.#repository.updateAttribute(id, attr, val);
    if (!updated) return null;

    const idx = this.#users.findIndex((u) => u.getAttribute("userId") === id);

    if (idx >= 0) this.#users[idx] = updated;
    else this.#users.push(updated);

    return updated;
  }

  findByAttribute(attr, val) {
    if (!attr) return [];
    return this.getAll().filter((u) => u.getAttribute(attr) === val);
  }

  eraseAll() {
    const ok = this.#repository.eraseAll();
    if (!ok) return false;

    this.#users = [];
    return true;
  }

  // -----------------------------------------
  // Get next available sequential ID
  // -----------------------------------------
  getNextAvailableID() {
    const highest = this.#repository.getHighestID();
    if (highest) return highest + 1;

    const maxId = this.#users.reduce(
      (max, u) => Math.max(max, u.getAttribute("userId")),
      0
    );
    return maxId + 1;
  }
}

export default UserService;
