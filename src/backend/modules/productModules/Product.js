class Product {
  #productId;
  #name;
  #description;
  #price;
  #sellerId;
  #category;
  #stock;
  #dateUpdated;

  /*
  params: all class instance values
  requires: all values be of the same expected type and accepted input as class instance
  effects: if all values are valid, then all values are set as class instance values
  returns: nothing(no return value)
   */
  constructor(productId, name, description, price, sellerId, category, stock) {
    // Validate each input using static validateInput
    if (!Product.validateInput("productId", productId))
      throw new Error(`Invalid productId: ${productId}`);
    if (!Product.validateInput("name", name))
      throw new Error(`Invalid name: ${name}`);
    if (!Product.validateInput("description", description))
      throw new Error(`Invalid description: ${description}`);
    if (!Product.validateInput("price", price))
      throw new Error(`Invalid price: ${price}`);
    if (!Product.validateInput("sellerId", sellerId))
      throw new Error(`Invalid sellerId: ${sellerId}`);
    if (!Product.validateInput("category", category))
      throw new Error(`Invalid category: ${category}`);
    if (!Product.validateInput("stock", stock))
      throw new Error(`Invalid stock: ${stock}`);

    this.#productId = productId;
    this.#name = name;
    this.#description = description;
    this.#price = price;
    this.#sellerId = sellerId;
    this.#category = category;
    this.#stock = stock;
    //class independant attribute
    this.#dateUpdated = new Date().toISOString();
  }

  // Validate input for specific attribute
  /*
  params: attributeName => Name of valid class atribute
  params: value => A data that is checked to see if is a valid input to attributeName
  requires: attribute name and value is not null
  effects: nothing(no value)
  returns: if attribute exists and value is ValidInput then return true, else return false
   */
  static validateInput(attributeName, value) {
    switch (attributeName) {
      case "name":
      case "description":
      case "category":
        return typeof value === "string" && value.length > 0;

      case "price":
        return typeof value === "number" && value >= 0;

      case "sellerId":
        return typeof value === "number" && value > 0;

      case "stock":
        return Number.isInteger(value) && value >= 0;

      case "dateUpdated":
        return typeof value === "string"; // normally system-set, not user-input

      case "productId":
        return typeof value === "number" && value > 0;

      default:
        return false;
    }
  }

  // Update attribute safely inside Product except id and dateUpdated
  /*
  params: attributeName => Name of valid class atribute
  params: newValue => New data that is to be assigned to instance attributeName 
  requires: attributeName exists in instance properties, value is not null and value is a valid input to the attributeName
  effects: sets instance property attributeName to newValue
  returns: if operation succeeds true, else false
   */
  updateAttribute(attributeName, newValue) {
    if (!Product.validateInput(attributeName, newValue)) return false;

    switch (attributeName) {
      // case "productId":
      //   this.#productId = newValue;
      //   break;
      case "name":
        this.#name = newValue;
        break;
      case "description":
        this.#description = newValue;
        break;
      case "price":
        this.#price = newValue;
        break;
      case "sellerId":
        this.#sellerId = newValue;
        break;
      case "category":
        this.#category = newValue;
        break;
      case "stock":
        this.#stock = newValue;
        break;
      // case "dateUpdated":
      //   this.#dateUpdated = newValue;
      //   break;
      default:
        return false;
    }

    this.#dateUpdated = new Date().toISOString();
    return true;
  }

  /*
  params: attributeName => Name of valid class atribute
  requires: attributeName exists in instance properties
  effects: nothing
  returns: if operation succeeds attibute, else return null
   */
  getAttribute(attributeName) {
    switch (attributeName) {
      case "productId":
        return this.#productId;
      case "name":
        return this.#name;
      case "description":
        return this.#description;
      case "price":
        return this.#price;
      case "sellerId":
        return this.#sellerId;
      case "category":
        return this.#category;
      case "stock":
        return this.#stock;
      case "dateUpdated":
        return this.#dateUpdated;
      default:
        return null;
    }
  }

  /*
  params: nothing
  requires: class attributes have been set
  effects: nothing
  returns: dictionary of entire class instance attributes
   */
  toJSON() {
    return {
      productId: this.#productId,
      name: this.#name,
      description: this.#description,
      price: this.#price,
      sellerId: this.#sellerId,
      category: this.#category,
      stock: this.#stock,
      dateUpdated: this.#dateUpdated,
    };
  }
  static fromJSON(data) {
    let p = new Product(
      data.productId,
      data.name,
      data.description,
      data.price,
      data.sellerId,
      data.category,
      data.stock
    );
    p.dateUpdated = data.dateUpdated;
    return p;
  }
}

export default Product;
