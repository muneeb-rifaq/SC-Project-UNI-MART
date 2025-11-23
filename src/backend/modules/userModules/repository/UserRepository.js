// UserRepository.js (ABSTRACT)
class UserRepository {
  constructor(filePath) {
    if (new.target === UserRepository) {
      throw new Error("Cannot instantiate abstract class UserRepository");
    }
    this.filePath = filePath;
  }

  load() {
    throw new Error("load() must be implemented by subclass");
  }

  save(users) {
    throw new Error("save() must be implemented by subclass");
  }

  addUser(user) {
    throw new Error("addUser() must be implemented by subclass");
  }

  deleteUser(id) {
    throw new Error("deleteUser() must be implemented by subclass");
  }

  changeAttribute(id, attributeName, newValue) {
    throw new Error("changeAttribute() must be implemented by subclass");
  }

  eraseAll() {
    throw new Error("eraseAll() must be implemented by subclass");
  }
}

export default UserRepository;
