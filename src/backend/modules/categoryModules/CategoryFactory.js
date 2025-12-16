import Category from "./Category.js";

/**
 * CategoryFactory class
 * Responsible for creating valid Category instances.
 */
class CategoryFactory {
  /**
   * Creates a new Category with the current timestamp.
   * @param {number} categoryId - Unique identifier
   * @param {string} categoryName - Name of the category
   * @param {string} description - Description
   * @returns {Category} A new Category instance
   */
  static createNewCategory(categoryId, categoryName, description) {
    return new Category(
      categoryId,
      categoryName,
      description,
      new Date().toISOString()
    );
  }

  static makeSampleCategory(id) {
    return new Category(
      id,
      `SampleCategory${id}`,
      `This is sample category ${id}`,
      new Date().toISOString()
    );
  }
}

export default CategoryFactory;
