import fs from "fs";
import Logging from "../Logging.js";
import LoggingRepository from "./LoggingRepository.js";

class LoggingJSONRepository extends LoggingRepository {
  constructor(filePath) {
    super(filePath);

    // Initialize storage with lastId if missing
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(
        filePath,
        JSON.stringify(
          {
            lastId: 0,
            logs: [],
          },
          null,
          2
        )
      );
    }

    this.filePath = filePath;
  }

  //------------------------------------------
  // INTERNAL UTILITIES
  //------------------------------------------
  _readFile() {
    return JSON.parse(fs.readFileSync(this.filePath, "utf-8"));
  }

  _writeFile(data) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  //------------------------------------------
  // Load all logs → return Logging instances
  //------------------------------------------
  load() {
    const data = this._readFile();
    return data.logs.map((log) => Logging.fromJSON(log));
  }

  //------------------------------------------
  // Add log with AUTOINCREMENT behavior
  //------------------------------------------
  addLog(loggingInstance) {
    const data = this._readFile();

    // Assign next ID
    const expectedId = data.lastId + 1;
    const givenId = loggingInstance.getAttribute("logId");

    if (givenId !== expectedId) {
      throw new Error(
        `LoggingJSONRepository.addLog: logId must be ${expectedId}, received ${givenId}`
      );
    }

    // Update lastId
    data.lastId = expectedId;

    // Save log
    data.logs.push(loggingInstance.toJSON());
    this._writeFile(data);

    return loggingInstance;
  }

  //------------------------------------------
  // Delete log by ID
  //------------------------------------------
  deleteLog(id) {
    const data = this._readFile();
    const before = data.logs.length;

    data.logs = data.logs.filter((log) => log.logId !== id);

    this._writeFile(data);

    return data.logs.length < before;
  }

  //------------------------------------------
  // Erase all logs and reset lastId
  //------------------------------------------
  eraseAll() {
    const data = this._readFile();
    data.logs = [];
    data.lastId = 0;
    this._writeFile(data);
    return true;
  }

  //------------------------------------------
  // Return last assigned ID (never reuse deleted IDs)
  //------------------------------------------
  getHighestID() {
    const data = this._readFile();
    return data.lastId;
  }

  //------------------------------------------
  // Find logs by table name
  //------------------------------------------
  findByTable(tableName) {
    const logs = this.load();
    return logs.filter((log) => log.getAttribute("tableName") === tableName);
  }

  //------------------------------------------
  // Find logs by operation type
  //------------------------------------------
  findByOperation(operationType) {
    const logs = this.load();
    return logs.filter(
      (log) => log.getAttribute("operationType") === operationType
    );
  }

  //------------------------------------------
  // Find logs by user
  //------------------------------------------
  findByUser(performedBy) {
    const logs = this.load();
    return logs.filter(
      (log) => log.getAttribute("performedBy") === performedBy
    );
  }

  //------------------------------------------
  // Find logs by date range
  //------------------------------------------
  findByDateRange(startDate, endDate) {
    const logs = this.load();
    const start = new Date(startDate).getTime();
    const end = endDate ? new Date(endDate).getTime() : Date.now() + 86400000; // Default to tomorrow if no end date

    return logs.filter((log) => {
      const logTime = new Date(log.getAttribute("timestamp")).getTime();
      return logTime >= start && logTime <= end;
    });
  }
}

export default LoggingJSONRepository;
