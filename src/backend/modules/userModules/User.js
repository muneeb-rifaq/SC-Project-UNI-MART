// User.js
class User {
  #userId;
  #username;
  #email;
  #passwordHash;
  #role;
  #createdAt;
  #updatedAt;
  #lastLogin;

  constructor(
    userId,
    username,
    email,
    passwordHash,
    createdAt = null,
    lastLogin = null
  ) {
    if (!User.validateInput("userId", userId))
      throw new Error(`Invalid userId: ${userId}`);
    if (!User.validateInput("username", username))
      throw new Error(`Invalid username: ${username}`);
    if (!User.validateInput("email", email))
      throw new Error(`Invalid email: ${email}`);
    if (!User.validateInput("passwordHash", passwordHash))
      throw new Error(`Invalid passwordHash`);

    this.#userId = userId;
    this.#username = username;
    this.#email = email;
    this.#passwordHash = passwordHash;
    this.#role = "user"; // fixed
    this.#createdAt = createdAt || new Date().toISOString();
    this.#updatedAt = new Date().toISOString();
    this.#lastLogin = lastLogin || null;
  }

  // -----------------------------
  // Static validation
  // -----------------------------
  static validateInput(attributeName, value) {
    switch (attributeName) {
      case "userId":
        return typeof value === "number" && value > 0;
      case "username":
        return typeof value === "string" && value.length > 0;
      case "email":
        return (
          typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        );
      case "passwordHash":
        return typeof value === "string" && value.length > 0;
      case "createdAt":
      case "updatedAt":
      case "lastLogin":
        return value === null || typeof value === "string";
      case "role":
        return value === "user";
      default:
        return false;
    }
  }

  // -----------------------------
  // Update attribute safely
  // -----------------------------
  updateAttribute(attributeName, newValue) {
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
        return false; // userId, role, createdAt, updatedAt are immutable
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
    let u = new User(
      data.userId,
      data.username,
      data.email,
      data.passwordHash,
      data.createdAt,
      data.lastLogin
    );
    return u;
  }
}

export default User;
