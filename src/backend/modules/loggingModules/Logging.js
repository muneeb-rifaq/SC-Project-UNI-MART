// Logging.js
class Logging {
  #logId;
  #tableName;
  #operationType;
  #performedBy;
  #timestamp;
  #description;

  constructor(
    logId,
    tableName,
    operationType,
    performedBy,
    timestamp,
    description
  ) {
    this.#logId = logId;
    this.#tableName = tableName;
    this.#operationType = operationType;
    this.#performedBy = performedBy;
    this.#timestamp = timestamp || new Date().toISOString();
    this.#description = description || "";

    // Validate on creation
    if (!this.validateInput()) {
      throw new Error("Invalid Logging attributes");
    }
  }

  // --------------------------
  // Validate attributes
  // --------------------------
  validateInput() {
    // logId must be a positive number
    if (typeof this.#logId !== "number" || this.#logId <= 0) return false;

    // tableName must be non-empty string
    if (!this.#tableName || typeof this.#tableName !== "string") return false;

    // operationType must be one of: CREATE, READ, UPDATE, DELETE
    const validOperations = ["CREATE", "READ", "UPDATE", "DELETE"];
    if (!validOperations.includes(this.#operationType)) return false;

    // performedBy must be non-empty string (user email or userId)
    if (!this.#performedBy || typeof this.#performedBy !== "string")
      return false;

    // timestamp must be valid ISO string
    if (!this.#timestamp || isNaN(Date.parse(this.#timestamp))) return false;

    // description must be a string (can be empty)
    if (typeof this.#description !== "string") return false;

    return true;
  }

  getAttribute(attr) {
    switch (attr) {
      case "logId":
        return this.#logId;
      case "tableName":
        return this.#tableName;
      case "operationType":
        return this.#operationType;
      case "performedBy":
        return this.#performedBy;
      case "timestamp":
        return this.#timestamp;
      case "description":
        return this.#description;
      default:
        return undefined;
    }
  }

  // Logging entries are immutable - no updateAttribute method

  toJSON() {
    return {
      logId: this.#logId,
      tableName: this.#tableName,
      operationType: this.#operationType,
      performedBy: this.#performedBy,
      timestamp: this.#timestamp,
      description: this.#description,
    };
  }

  static fromJSON(json) {
    return new Logging(
      json.logId,
      json.tableName,
      json.operationType,
      json.performedBy,
      json.timestamp,
      json.description
    );
  }

  toString() {
    return `[${this.#timestamp}] ${this.#operationType} on ${
      this.#tableName
    } by ${this.#performedBy}: ${this.#description}`;
  }
}

export default Logging;
