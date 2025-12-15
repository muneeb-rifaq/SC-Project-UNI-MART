import Category from "./Category.js";

class CategoryFactory {
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
