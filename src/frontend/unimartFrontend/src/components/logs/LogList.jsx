// ============================================================================
// LogList.jsx - Display logs grouped by operation type
// ============================================================================

import { useState } from "react";
import Card from "../common/Card";
import Button from "../common/Button";
import "./LogList.css";

const LogList = ({ logs, loading, onRefresh }) => {
  const [expandedOperation, setExpandedOperation] = useState(null);

  console.log("🎨 LogList rendering with:", logs.length, "logs");

  // Group logs by operationType
  const groupedLogs = logs.reduce((acc, log) => {
    const opType = log.operationType;
    if (!acc[opType]) {
      acc[opType] = [];
    }
    acc[opType].push(log);
    return acc;
  }, {});

  console.log(
    "📊 Grouped logs:",
    Object.keys(groupedLogs).map((key) => `${key}: ${groupedLogs[key].length}`)
  );

  // Sort logs within each group by timestamp (newest first)
  Object.keys(groupedLogs).forEach((opType) => {
    groupedLogs[opType].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
  });

  const operationTypes = Object.keys(groupedLogs).sort();

  const toggleOperation = (opType) => {
    setExpandedOperation(expandedOperation === opType ? null : opType);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getOperationIcon = (opType) => {
    switch (opType) {
      case "CREATE":
        return "➕";
      case "READ":
        return "👁️";
      case "UPDATE":
        return "✏️";
      case "DELETE":
        return "🗑️";
      default:
        return "📝";
    }
  };

  const getOperationColor = (opType) => {
    switch (opType) {
      case "CREATE":
        return "#4caf50";
      case "READ":
        return "#2196f3";
      case "UPDATE":
        return "#ff9800";
      case "DELETE":
        return "#f44336";
      default:
        return "#9e9e9e";
    }
  };

  if (loading) {
    return <div className="loading">Loading logs...</div>;
  }

  if (logs.length === 0) {
    return <div className="no-logs">No logs found</div>;
  }

  return (
    <div className="log-list">
      <div className="log-summary">
        <div className="log-summary-header">
          <h3>📊 Activity Summary</h3>
          {onRefresh && (
            <Button variant="primary" onClick={onRefresh} disabled={loading}>
              🔄 Refresh Logs
            </Button>
          )}
        </div>
        <div className="summary-cards">
          {operationTypes.map((opType) => (
            <div
              key={opType}
              className="summary-card"
              style={{ borderColor: getOperationColor(opType) }}
              onClick={() => toggleOperation(opType)}
            >
              <div
                className="summary-icon"
                style={{ color: getOperationColor(opType) }}
              >
                {getOperationIcon(opType)}
              </div>
              <div className="summary-info">
                <div className="summary-label">{opType}</div>
                <div className="summary-count">
                  {groupedLogs[opType].length}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="log-groups">
        {operationTypes.map((opType) => (
          <div key={opType} className="log-group">
            <div
              className="log-group-header"
              onClick={() => toggleOperation(opType)}
              style={{ borderLeftColor: getOperationColor(opType) }}
            >
              <div className="log-group-title">
                <span className="operation-icon">
                  {getOperationIcon(opType)}
                </span>
                <span className="operation-name">{opType} Operations</span>
                <span className="operation-badge">
                  {groupedLogs[opType].length}
                </span>
              </div>
              <span className="expand-icon">
                {expandedOperation === opType ? "▼" : "▶"}
              </span>
            </div>

            {expandedOperation === opType && (
              <div className="log-group-content">
                {groupedLogs[opType].map((log) => (
                  <Card key={log.logId} className="log-card">
                    <div className="log-header">
                      <div className="log-table">
                        <strong>📋 Table:</strong> {log.tableName}
                      </div>
                      <div className="log-timestamp">
                        🕐 {formatTimestamp(log.timestamp)}
                      </div>
                    </div>

                    <div className="log-body">
                      <div className="log-field">
                        <strong>👤 Performed By:</strong> {log.performedBy}
                      </div>
                      {log.description && (
                        <div className="log-field">
                          <strong>📝 Description:</strong> {log.description}
                        </div>
                      )}
                      <div className="log-field log-id">
                        <strong>🔑 Log ID:</strong> {log.logId}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogList;
