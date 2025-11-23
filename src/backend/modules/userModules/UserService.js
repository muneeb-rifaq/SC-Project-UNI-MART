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

    this.Users = this.repository.load();
  }

  // Add a User
  addUser(User) {
    const success = this.repository.addUser(User);
    if (success) this.Users.push(User);
  }

  // Delete a User by UserId
  deleteUser(id) {
    const success = this.repository.deleteUser(id);
    if (success) {
      this.Users = this.Users.filter((u) => u.getAttribute("UserId") !== id);
    }
  }

  // Get all Users (clone of internal cache)
  getAll() {
    return [...this.Users];
  }

  // Change attribute of a User
  changeAttribute(id, attributeName, newValue) {
    const updated = this.repository.changeAttribute(
      id,
      attributeName,
      newValue
    );
    if (!updated) return null;

    const index = this.Users.findIndex((u) => u.getAttribute("UserId") === id);
    if (index !== -1) this.Users[index] = updated;

    return updated;
  }

  // Filter Users by attribute and value
  findByAttribute(attributeName, value) {
    if (!User.validateInput(attributeName, value)) return [];
    return this.Users.filter((u) => u.getAttribute(attributeName) === value);
  }

  // Erase all Users
  eraseAll() {
    const success = this.repository.eraseAll();
    if (success) this.Users = [];
  }

  // ----------------------------------------------------
  // NEW METHOD 1: Get next available sequential ID (for JSON)
  // ----------------------------------------------------
  getNextAvailableID() {
    if (this.Users.length === 0) return 1;

    const maxID = Math.max(...this.Users.map((u) => u.getAttribute("UserId")));

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

    if (this.Users.length === 0) return true;

    const ids = this.Users.map((u) => u.getAttribute("UserId"));
    const maxID = Math.max(...ids);

    if (id < maxID) return false; // cannot be less than highest assigned ID
    if (ids.includes(id)) return false; // cannot already exist

    return true;
  }
}

export default UserService;
