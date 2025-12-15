class CategoryRepository {
  constructor(dbPath) {
    if (new.target === CategoryRepository)
      throw new Error("Cannot instantiate abstract class CategoryRepository");
    this.dbPath = dbPath;
  }

  load() {
    throw new Error("load() must be implemented");
  }

  addCategory(category) {
    throw new Error("addCategory() must be implemented");
  }

  deleteCategory(id) {
    throw new Error("deleteCategory() must be implemented");
  }

  updateAttribute(id, attr, value) {
    throw new Error("updateAttribute() must be implemented");
  }

  eraseAll() {
    throw new Error("eraseAll() must be implemented");
  }

  getHighestID() {
    throw new Error("getHighestID() must be implemented");
  }
}

export default CategoryRepository;
