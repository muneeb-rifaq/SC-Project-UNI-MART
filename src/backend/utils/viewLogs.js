// viewLogs.js - Display all logs from the logging system
import LoggingService from "../modules/loggingModules/LoggingService.js";

// Initialize logging service
const loggingService = new LoggingService();

// Helper: Print logs in a readable format
const printLogs = (logs) => {
  if (!logs || logs.length === 0) {
    console.log("\n📝 No logs found in the database.\n");
    return;
  }

  console.log(`\n📝 Total Logs: ${logs.length}\n`);

  // Convert to JSON
  const data = logs.map((log) =>
    typeof log.toJSON === "function" ? log.toJSON() : log
  );

  // Split into two tables for better readability
  const keys = Object.keys(data[0]);
  const mid = Math.ceil(keys.length / 2);

  const firstHalfKeys = keys.slice(0, mid);
  const secondHalfKeys = keys.slice(mid);

  const table1 = data.map((log) => {
    const obj = {};
    firstHalfKeys.forEach((k) => (obj[k] = log[k]));
    return obj;
  });

  const table2 = data.map((log) => {
    const obj = {};
    secondHalfKeys.forEach((k) => (obj[k] = log[k]));
    return obj;
  });

  console.log("==== PART 1 ====");
  console.table(table1);

  console.log("\n==== PART 2 ====");
  console.table(table2);

  console.log("\n");
};

// Main execution
console.log("\n╔════════════════════════════════════════════╗");
console.log("║        UNIMART LOGGING SYSTEM VIEWER       ║");
console.log("╚════════════════════════════════════════════╝");

try {
  const allLogs = loggingService.getAll();
  printLogs(allLogs);
} catch (err) {
  console.error("\n❌ Error retrieving logs:", err.message);
  console.error(err.stack);
}
