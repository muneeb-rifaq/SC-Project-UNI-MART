import fs from "fs";
import Category from "../Category.js";
import CategoryRepository from "./CategoryRepository.js";

class CategoryJSONRepository extends CategoryRepository {
  constructor(filePath) {
    super(filePath);

    // Initialize storage with lastId if missing
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(
        filePath,
        JSON.stringify(
          {
            lastId: 0,
            categories: [],
          },
          null,
          2
        )
      );
    }

    this.filePath = filePath;
  }

  //------------------------------------------
  // INTERNAL UTILITIES
  //------------------------------------------
  _readFile() {
    return JSON.parse(fs.readFileSync(this.filePath, "utf-8"));
  }

  _writeFile(data) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  //------------------------------------------
  // Load all categories → return Category instances
  //------------------------------------------
  load() {
    const data = this._readFile();
    return data.categories.map((c) => Category.fromJSON(c));
  }

  //------------------------------------------
  // Add category with AUTOINCREMENT behavior
  //------------------------------------------
  addCategory(categoryInstance) {
    const data = this._readFile();

    // Assign next ID
    const expectedId = data.lastId + 1;
    const givenId = categoryInstance.getAttribute("categoryId");

    if (givenId !== expectedId) {
      throw new Error(
        `CategoryJSONRepository.addCategory: categoryId must be ${expectedId}, received ${givenId}`
      );
    }

    // Update lastId
    data.lastId = expectedId;

    // Save category
    data.categories.push(categoryInstance.toJSON());
    this._writeFile(data);

    return categoryInstance;
  }

  //------------------------------------------
  // Delete category by ID
  //------------------------------------------
  deleteCategory(id) {
    const data = this._readFile();
    const before = data.categories.length;

    data.categories = data.categories.filter((c) => c.categoryId !== id);

    this._writeFile(data);

    return data.categories.length < before;
  }

  //------------------------------------------
  // Update attribute of a category
  //------------------------------------------
  updateAttribute(id, attr, value) {
    const allowed = new Set(["categoryName", "description"]);

    if (!allowed.has(attr)) return null;

    const data = this._readFile();
    const category = data.categories.find((c) => c.categoryId === id);
    if (!category) return null;

    category[attr] = value;
    this._writeFile(data);

    return Category.fromJSON(category);
  }

  //------------------------------------------
  // Erase all categories (does not reset lastId)
  //------------------------------------------
  eraseAll() {
    const data = this._readFile();
    data.categories = [];
    this._writeFile(data);
    return true;
  }

  //------------------------------------------
  // Return last assigned ID (never reuse deleted IDs)
  //------------------------------------------
  getHighestID() {
    const data = this._readFile();
    return data.lastId;
  }
}

export default CategoryJSONRepository;
