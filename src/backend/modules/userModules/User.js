// User.js
/**
 * Represents a User entity in the system.
 * Encapsulates user details including credentials, role, and timestamps.
 */
class User {
  // -------------------------------------------
  // Attribute metadata (Centralized definitions)
  // -------------------------------------------

  // List of all attributes
  // static ATTRIBUTES = [
  //   "userId",
  //   "username",
  //   "email",
  //   "passwordHash",
  //   "role",
  //   "createdAt",
  //   "updatedAt",
  //   "lastLogin",
  // ];

  /**
   * Validation rules for User attributes.
   * @type {Object.<string, function(any): boolean>}
   */
  static RULES = {
    userId: (v) => typeof v === "number" && v > 0,
    username: (v) => typeof v === "string" && v.length > 0,
    email: (v) => typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    passwordHash: (v) => typeof v === "string" && v.length > 0,
    role: (v) => v === "buyer" || v === "seller" || v === "admin",
    createdAt: (v) => v === null || typeof v === "string",
    updatedAt: (v) => v === null || typeof v === "string",
    lastLogin: (v) => v === null || typeof v === "string",
  };

  /**
   * List of mutable attributes that can be updated.
   * @type {string[]}
   */
  static MUTABLE = ["username", "email", "passwordHash", "lastLogin"];

  // Private fields
  #userId;
  #username;
  #email;
  #passwordHash;
  #role;
  #createdAt;
  #updatedAt;
  #lastLogin;

  /**
   * Creates a new User instance.
   * @param {number} userId - Unique identifier for the user.
   * @param {string} username - The user's username.
   * @param {string} email - The user's email address.
   * @param {string} passwordHash - The hashed password.
   * @param {string} role - The user's role (buyer, seller, admin).
   * @throws {Error} If any input validation fails.
   */
  constructor(userId, username, email, passwordHash, role) {
    if (!User.validateInput("userId", userId))
      throw new Error(`Invalid userId: ${userId}`);
    if (!User.validateInput("username", username))
      throw new Error(`Invalid username: ${username}`);
    if (!User.validateInput("email", email))
      throw new Error(`Invalid email: ${email}`);
    if (!User.validateInput("passwordHash", passwordHash))
      throw new Error(`Invalid passwordHash`);
    if (!User.validateInput("role", role)) throw new Error(`Invalid role`);

    this.#userId = userId;
    this.#username = username;
    this.#email = email;
    this.#passwordHash = passwordHash;
    this.#role = role;
    this.#createdAt = new Date().toISOString();
    this.#updatedAt = new Date().toISOString();
    this.#lastLogin = null;
  }

  // -----------------------------
  // Centralized validation lookup
  // -----------------------------
  /**
   * Validates a specific attribute against defined rules.
   * @param {string} attributeName - The attribute name to validate.
   * @param {any} value - The value to check.
   * @returns {boolean} True if valid, false otherwise.
   */
  static validateInput(attributeName, value) {
    const rule = User.RULES[attributeName];
    return rule ? rule(value) : false;
  }

  // -----------------------------
  // Update attribute safely
  // -----------------------------
  /**
   * Updates a specific attribute if it is mutable and valid.
   * @param {string} attributeName - The attribute to update.
   * @param {any} newValue - The new value.
   * @returns {boolean} True if update successful, false otherwise.
   */
  updateAttribute(attributeName, newValue) {
    // Check if attribute is allowed to change
    if (!User.MUTABLE.includes(attributeName)) return false;

    // Validate value
    if (!User.validateInput(attributeName, newValue)) return false;

    switch (attributeName) {
      case "username":
        this.#username = newValue;
        break;
      case "email":
        this.#email = newValue;
        break;
      case "passwordHash":
        this.#passwordHash = newValue;
        break;
      case "lastLogin":
        this.#lastLogin = newValue;
        break;
      default:
        return false;
    }

    this.#updatedAt = new Date().toISOString();
    return true;
  }

  // -----------------------------
  // Get attribute
  // -----------------------------
  getAttribute(attributeName) {
    switch (attributeName) {
      case "userId":
        return this.#userId;
      case "username":
        return this.#username;
      case "email":
        return this.#email;
      case "passwordHash":
        return this.#passwordHash;
      case "role":
        return this.#role;
      case "createdAt":
        return this.#createdAt;
      case "updatedAt":
        return this.#updatedAt;
      case "lastLogin":
        return this.#lastLogin;
      default:
        return null;
    }
  }

  // -----------------------------
  // Convert to JSON
  // -----------------------------
  toJSON() {
    return {
      userId: this.#userId,
      username: this.#username,
      email: this.#email,
      passwordHash: this.#passwordHash,
      role: this.#role,
      createdAt: this.#createdAt,
      updatedAt: this.#updatedAt,
      lastLogin: this.#lastLogin,
    };
  }

  static fromJSON(data) {
    // FIXED: previous version mistakenly passed timestamps into wrong params
    const u = new User(
      data.userId,
      data.username,
      data.email,
      data.passwordHash,
      data.role
    );
    u.#createdAt = data.createdAt;
    u.#updatedAt = data.updatedAt;
    u.#lastLogin = data.lastLogin;
    return u;
  }
}

export default User;
