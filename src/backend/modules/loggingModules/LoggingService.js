import path from "path";
import { fileURLToPath } from "url";

import Logging from "./Logging.js";
import LoggingFactory from "./LoggingFactory.js";
import LoggingSQLRepository from "./repository/LoggingSQLRepository.js";
import LoggingJSONRepository from "./repository/LoggingJSONRepository.js";

/**
 * LoggingService class
 * Manages the lifecycle and retrieval of audit logs.
 * Handles persistence via repositories (SQL or JSON).
 */
class LoggingService {
  #logs;
  #repository;

  /**
   * Initializes the LoggingService.
   * @param {string} [filePath] - Path to the storage file (DB or JSON). Defaults to unimartDB.db
   * @throws {Error} If filePath is invalid or file type is unsupported
   */
  constructor(filePath = null) {
    // -----------------------------------
    // Resolve default DB path if missing
    // -----------------------------------
    if (!filePath) {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);

      filePath = path.resolve(
        __dirname,
        "../../storage/DBStorage/unimartDB.db"
      );
    }

    if (typeof filePath !== "string")
      throw new Error("filePath must be a string");

    // -----------------------------------
    // Choose JSON or SQLite repository
    // -----------------------------------
    if (filePath.endsWith(".json"))
      this.#repository = new LoggingJSONRepository(filePath);
    else if (filePath.endsWith(".db") || filePath.endsWith(".sqlite"))
      this.#repository = new LoggingSQLRepository(filePath);
    else throw new Error("Invalid storage file type");

    // -----------------------------------
    // Load logs (or fallback)
    // -----------------------------------
    try {
      this.#logs = this.#repository.load() || [];
    } catch {
      this.#logs = [];
    }
  }

  getAll() {
    // Reload from repository to get fresh data (including logs added by other service instances)
    this.#logs = this.#repository.load() || [];
    return this.#logs.map((log) => Logging.fromJSON(log.toJSON()));
  }

  /**
   * Add a new log entry
   * @param {string} tableName - Table that was accessed
   * @param {string} operationType - CREATE, READ, UPDATE, or DELETE
   * @param {string} performedBy - User who performed the action
   * @param {string} description - Description of the event
   */
  addLog(tableName, operationType, performedBy, description) {
    if (!tableName || !operationType || !performedBy)
      throw new Error("tableName, operationType, and performedBy are required");

    const id = this.getNextAvailableID();
    const log = LoggingFactory.createNewLog(
      id,
      tableName,
      operationType,
      performedBy,
      new Date().toISOString(),
      description
    );

    const newLog = this.#repository.addLog(log);
    if (!newLog) return null;

    this.#logs.push(newLog);
    return newLog;
  }

  deleteLog(id) {
    if (typeof id !== "number" || id <= 0) return false;

    const ok = this.#repository.deleteLog(id);
    if (!ok) return false;

    this.#logs = this.#logs.filter((log) => log.getAttribute("logId") !== id);
    return true;
  }

  findByAttribute(attr, val) {
    if (!attr) return [];
    return this.getAll().filter((log) => log.getAttribute(attr) === val);
  }

  findByTable(tableName) {
    return this.#repository.findByTable(tableName);
  }

  findByOperation(operationType) {
    return this.#repository.findByOperation(operationType);
  }

  findByUser(performedBy) {
    return this.#repository.findByUser(performedBy);
  }

  findByDateRange(startDate, endDate) {
    return this.#repository.findByDateRange(startDate, endDate);
  }

  eraseAll() {
    const ok = this.#repository.eraseAll();
    if (ok) this.#logs = [];
    return ok;
  }

  getNextAvailableID() {
    return this.#repository.getHighestID() + 1;
  }

  /**
   * Helper methods for common logging operations
   */
  logCreate(tableName, performedBy, description) {
    return this.addLog(tableName, "CREATE", performedBy, description);
  }

  logRead(tableName, performedBy, description) {
    return this.addLog(tableName, "READ", performedBy, description);
  }

  logUpdate(tableName, performedBy, description) {
    return this.addLog(tableName, "UPDATE", performedBy, description);
  }

  logDelete(tableName, performedBy, description) {
    return this.addLog(tableName, "DELETE", performedBy, description);
  }
}

export default LoggingService;
