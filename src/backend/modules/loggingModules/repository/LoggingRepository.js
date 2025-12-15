class LoggingRepository {
  constructor(dbPath) {
    if (new.target === LoggingRepository)
      throw new Error("Cannot instantiate abstract class LoggingRepository");
    this.dbPath = dbPath;
  }

  load() {
    throw new Error("load() must be implemented");
  }

  addLog(logging) {
    throw new Error("addLog() must be implemented");
  }

  deleteLog(id) {
    throw new Error("deleteLog() must be implemented");
  }

  eraseAll() {
    throw new Error("eraseAll() must be implemented");
  }

  getHighestID() {
    throw new Error("getHighestID() must be implemented");
  }

  // Additional methods specific to logging
  findByTable(tableName) {
    throw new Error("findByTable() must be implemented");
  }

  findByOperation(operationType) {
    throw new Error("findByOperation() must be implemented");
  }

  findByUser(performedBy) {
    throw new Error("findByUser() must be implemented");
  }

  findByDateRange(startDate, endDate) {
    throw new Error("findByDateRange() must be implemented");
  }
}

export default LoggingRepository;
