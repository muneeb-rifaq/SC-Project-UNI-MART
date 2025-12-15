import Logging from "./Logging.js";

class LoggingFactory {
  /**
   * Create a new logging entry
   * @param {number} logId - Unique log ID
   * @param {string} tableName - Name of the table accessed (e.g., "products", "users")
   * @param {string} operationType - Type of operation: CREATE, READ, UPDATE, DELETE
   * @param {string} performedBy - User who performed the action (email or userId)
   * @param {string} timestamp - ISO timestamp (optional, defaults to current time)
   * @param {string} description - Brief description of the event
   */
  static createNewLog(
    logId,
    tableName,
    operationType,
    performedBy,
    timestamp,
    description
  ) {
    return new Logging(
      logId,
      tableName,
      operationType,
      performedBy,
      timestamp,
      description
    );
  }

  /**
   * Create a sample logging entry for testing
   */
  static makeSampleLog(id = 999) {
    return LoggingFactory.createNewLog(
      id,
      "sample_table",
      "CREATE",
      "sample@example.com",
      new Date().toISOString(),
      `Sample log entry ${id}`
    );
  }

  /**
   * Helper method to create a CREATE operation log
   */
  static logCreate(logId, tableName, performedBy, timestamp, description) {
    return LoggingFactory.createNewLog(
      logId,
      tableName,
      "CREATE",
      performedBy,
      timestamp,
      description
    );
  }

  /**
   * Helper method to create a READ operation log
   */
  static logRead(logId, tableName, performedBy, timestamp, description) {
    return LoggingFactory.createNewLog(
      logId,
      tableName,
      "READ",
      performedBy,
      timestamp,
      description
    );
  }

  /**
   * Helper method to create an UPDATE operation log
   */
  static logUpdate(logId, tableName, performedBy, timestamp, description) {
    return LoggingFactory.createNewLog(
      logId,
      tableName,
      "UPDATE",
      performedBy,
      timestamp,
      description
    );
  }

  /**
   * Helper method to create a DELETE operation log
   */
  static logDelete(logId, tableName, performedBy, timestamp, description) {
    return LoggingFactory.createNewLog(
      logId,
      tableName,
      "DELETE",
      performedBy,
      timestamp,
      description
    );
  }
}

export default LoggingFactory;
