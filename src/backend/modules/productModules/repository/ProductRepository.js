// ProductRepository.js (ABSTRACT)
class ProductRepository {
  constructor(filePath) {
    if (new.target === ProductRepository) {
      throw new Error("Cannot instantiate abstract class ProductRepository");
    }
    this.filePath = filePath;
  }

  load() {
    throw new Error("load() must be implemented by subclass");
  }

  save(products) {
    throw new Error("save() must be implemented by subclass");
  }

  addProduct(product) {
    throw new Error("addProduct() must be implemented by subclass");
  }

  deleteProduct(id) {
    throw new Error("deleteProduct() must be implemented by subclass");
  }

  changeAttribute(id, attributeName, newValue) {
    throw new Erro("changeAttribute() must be implemented by subclass");
  }

  eraseAll() {
    throw new Error("eraseAll() must be implemented by subclass");
  }
}

export default ProductRepository;
