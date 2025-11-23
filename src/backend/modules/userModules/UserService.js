// UserService.js
import User from "./User.js";
import UserSQLRepository from "./repository/UserSQLRepository.js";
import UserJSONRepository from "./repository/UserJSONRepository.js";

class UserService {
  constructor(filePath) {
    if (filePath.endsWith(".json")) {
      this.repository = new UserJSONRepository(filePath);
    } else if (filePath.endsWith(".db") || filePath.endsWith(".sqlite")) {
      this.repository = new UserSQLRepository(filePath);
    } else {
      throw new Error("Invalid storage file type. Use .json or .db/.sqlite");
    }

    this.users = this.repository.load();
  }

  // Add a user
  addUser(user) {
    const success = this.repository.addUser(user);
    if (success) this.users.push(user);
  }

  // Delete a user by userId
  deleteUser(id) {
    const success = this.repository.deleteUser(id);
    if (success) {
      this.users = this.users.filter((u) => u.getAttribute("userId") !== id);
    }
  }

  // Get all users (clone of internal cache)
  getAll() {
    return [...this.users];
  }

  // Change attribute of a user
  changeAttribute(id, attributeName, newValue) {
    const updated = this.repository.changeAttribute(
      id,
      attributeName,
      newValue
    );
    if (!updated) return null;

    const index = this.users.findIndex((u) => u.getAttribute("userId") === id);
    if (index !== -1) this.users[index] = updated;

    return updated;
  }

  // Filter users by attribute and value
  findByAttribute(attributeName, value) {
    if (!User.validateInput(attributeName, value)) return [];
    return this.users.filter((u) => u.getAttribute(attributeName) === value);
  }

  // Erase all users
  eraseAll() {
    const success = this.repository.eraseAll();
    if (success) this.users = [];
  }

  // ----------------------------------------------------
  // NEW METHOD 1: Get next available sequential ID (for JSON)
  // ----------------------------------------------------
  getNextAvailableID() {
    if (this.users.length === 0) return 1;

    const maxID = Math.max(...this.users.map((u) => u.getAttribute("userId")));

    return maxID + 1;
  }

  // ----------------------------------------------------
  // NEW METHOD 2: Validate a given ID
  // Rules:
  // - must not match any existing ID
  // - must not be less than the highest ID in the list
  // ----------------------------------------------------
  validateID(id) {
    if (typeof id !== "number" || id <= 0) return false;

    if (this.users.length === 0) return true;

    const ids = this.users.map((u) => u.getAttribute("userId"));
    const maxID = Math.max(...ids);

    if (id < maxID) return false; // cannot be less than highest assigned ID
    if (ids.includes(id)) return false; // cannot already exist

    return true;
  }
}

export default UserService;
