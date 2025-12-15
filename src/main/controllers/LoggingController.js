// LoggingController.js
import LoggingService from "../../backend/modules/loggingModules/LoggingService.js";

class LoggingController {
  static service = new LoggingService();

  // ------------------------------
  // GET ALL LOGS
  // ------------------------------
  static getAll(req, res) {
    console.log("🔍 LoggingController.getAll called");
    try {
      const logs = this.service.getAll();
      console.log(`✅ Retrieved ${logs.length} logs`);
      return res.status(200).json(logs.map((log) => log.toJSON()));
    } catch (err) {
      console.error("❌ Error in getAll:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ------------------------------
  // FIND LOGS BY ATTRIBUTE
  // ------------------------------
  static findByAttribute(req, res) {
    console.log(
      "🔍 LoggingController.findByAttribute called with query:",
      req.query
    );
    try {
      let { attribute, value } = req.query;

      if (!attribute) {
        console.warn("⚠️ Missing 'attribute' query parameter");
        return res.status(400).json({ error: "attribute query required" });
      }

      // Convert numeric strings to numbers for logId
      if (attribute === "logId" && !isNaN(value)) {
        value = Number(value);
        console.log("🔢 Converted value to number:", value);
      }

      const results = this.service.findByAttribute(attribute, value);
      console.log(
        `✅ Found ${results.length} logs matching ${attribute}=${value}`
      );
      return res.status(200).json(results.map((log) => log.toJSON()));
    } catch (err) {
      console.error("❌ Error in findByAttribute:", err);
      return res.status(500).json({ error: err.message });
    }
  }
}

export default LoggingController;
