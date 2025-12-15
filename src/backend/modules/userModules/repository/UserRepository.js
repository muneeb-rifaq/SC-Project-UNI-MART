// UserRepository.js
// Abstract base class / interface for repositories.

export default class UserRepository {
  constructor(path) {
    if (new.target === UserRepository) {
      throw new Error(
        "UserRepository is abstract and cannot be instantiated directly."
      );
    }
    this.path = path;
  }

  // Load all users -> returns array of User instances
  load() {
    throw new Error("load() not implemented");
  }

  // Add a single user -> returns true on success, false on failure
  addUser(user) {
    throw new Error("addUser() not implemented");
  }

  // Delete user by id -> returns boolean
  deleteUser(id) {
    throw new Error("deleteUser() not implemented");
  }

  // Change attribute -> returns updated User instance or null
  updateAttribute(id, attributeName, newValue) {
    throw new Error("changeAttribute() not implemented");
  }

  // Overwrite store with provided users -> returns boolean
  save(users) {
    throw new Error("save() not implemented");
  }

  // Remove all users -> returns boolean
  eraseAll() {
    throw new Error("eraseAll() not implemented");
  }

  getHighestID() {
    throw new Error("getHighestID() not implemented");
  }
}
