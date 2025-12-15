import Database from "better-sqlite3";
import Logging from "../Logging.js";
import LoggingRepository from "./LoggingRepository.js";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS logs (
  logId INTEGER PRIMARY KEY AUTOINCREMENT,
  tableName TEXT,
  operationType TEXT,
  performedBy TEXT,
  timestamp TEXT,
  description TEXT
);
`;

class LoggingSQLRepository extends LoggingRepository {
  constructor(dbPath) {
    super(dbPath);
    this.db = new Database(dbPath);

    // Create table if missing
    this.db.prepare(SCHEMA).run();
  }

  //------------------------------------------
  // Load all logs → return Logging instances
  //------------------------------------------
  load() {
    const rows = this.db.prepare("SELECT * FROM logs").all();
    return rows.map(
      (row) =>
        new Logging(
          row.logId,
          row.tableName,
          row.operationType,
          row.performedBy,
          row.timestamp,
          row.description
        )
    );
  }

  //------------------------------------------
  // Add log with AUTOINCREMENT behavior
  //------------------------------------------
  addLog(loggingInstance) {
    const stmt = this.db.prepare(`
      INSERT INTO logs (tableName, operationType, performedBy, timestamp, description)
      VALUES (?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      loggingInstance.getAttribute("tableName"),
      loggingInstance.getAttribute("operationType"),
      loggingInstance.getAttribute("performedBy"),
      loggingInstance.getAttribute("timestamp"),
      loggingInstance.getAttribute("description")
    );

    // Return the log with the auto-generated ID
    const newLog = new Logging(
      info.lastInsertRowid,
      loggingInstance.getAttribute("tableName"),
      loggingInstance.getAttribute("operationType"),
      loggingInstance.getAttribute("performedBy"),
      loggingInstance.getAttribute("timestamp"),
      loggingInstance.getAttribute("description")
    );

    return newLog;
  }

  //------------------------------------------
  // Delete log by ID
  //------------------------------------------
  deleteLog(id) {
    const stmt = this.db.prepare("DELETE FROM logs WHERE logId = ?");
    const info = stmt.run(id);
    return info.changes > 0;
  }

  //------------------------------------------
  // Erase all logs
  //------------------------------------------
  eraseAll() {
    const stmt = this.db.prepare("DELETE FROM logs");
    stmt.run();
    return true;
  }

  //------------------------------------------
  // Return highest ID currently in use
  //------------------------------------------
  getHighestID() {
    const row = this.db.prepare("SELECT MAX(logId) as maxId FROM logs").get();
    return row.maxId || 0;
  }

  //------------------------------------------
  // Find logs by table name
  //------------------------------------------
  findByTable(tableName) {
    const rows = this.db
      .prepare("SELECT * FROM logs WHERE tableName = ?")
      .all(tableName);
    return rows.map(
      (row) =>
        new Logging(
          row.logId,
          row.tableName,
          row.operationType,
          row.performedBy,
          row.timestamp,
          row.description
        )
    );
  }

  //------------------------------------------
  // Find logs by operation type
  //------------------------------------------
  findByOperation(operationType) {
    const rows = this.db
      .prepare("SELECT * FROM logs WHERE operationType = ?")
      .all(operationType);
    return rows.map(
      (row) =>
        new Logging(
          row.logId,
          row.tableName,
          row.operationType,
          row.performedBy,
          row.timestamp,
          row.description
        )
    );
  }

  //------------------------------------------
  // Find logs by user
  //------------------------------------------
  findByUser(performedBy) {
    const rows = this.db
      .prepare("SELECT * FROM logs WHERE performedBy = ?")
      .all(performedBy);
    return rows.map(
      (row) =>
        new Logging(
          row.logId,
          row.tableName,
          row.operationType,
          row.performedBy,
          row.timestamp,
          row.description
        )
    );
  }

  //------------------------------------------
  // Find logs by date range
  //------------------------------------------
  findByDateRange(startDate, endDate) {
    // Default endDate to far future if not provided
    const end = endDate || new Date(Date.now() + 86400000).toISOString();

    const rows = this.db
      .prepare("SELECT * FROM logs WHERE timestamp >= ? AND timestamp <= ?")
      .all(startDate, end);
    return rows.map(
      (row) =>
        new Logging(
          row.logId,
          row.tableName,
          row.operationType,
          row.performedBy,
          row.timestamp,
          row.description
        )
    );
  }
}

export default LoggingSQLRepository;
