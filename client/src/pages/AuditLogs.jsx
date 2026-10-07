import { useEffect, useMemo, useState } from "react";

import api, { getApiError } from "../services/api";
import Loading from "../components/Loading";
import AlertMessage from "../components/AlertMessage";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const getId = (log) =>
    log._id ||
    log.auditLogId ||
    log.id;

  const loadLogs = async () => {
    try {
      setLoading(true);

      const response =
        await api.get("/audit");

      const data = response.data;

      setLogs(
        Array.isArray(data)
          ? data
          : data.logs ||
              data.auditLogs ||
              data.data ||
              []
      );
    } catch (error) {
      setError(
        getApiError(
          error,
          "Failed to load audit logs."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    const query =
      search.toLowerCase();

    return logs.filter((log) => {
      const text = [
        log.action,
        log.entityName,
        log.recordId,
        log.ipAddress
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(query);
    });
  }, [logs, search]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Audit Logs</h2>
          <p>
            Track important CRM actions.
          </p>
        </div>
      </div>

      <AlertMessage
        message={error}
        type="danger"
        onClose={() => setError("")}
      />

      <div className="table-card">
        <div className="table-toolbar">
          <h5>Audit History</h5>

          <input
            className="form-control search-input"
            placeholder="Search audit logs..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        {loading ? (
          <Loading text="Loading audit logs..." />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Record ID</th>
                  <th>User</th>
                  <th>Date</th>
                  <th>IP Address</th>
                </tr>
              </thead>

              <tbody>
                {filteredLogs.map(
                  (log) => (
                    <tr
                      key={getId(log)}
                    >
                      <td>
                        <span className="status-badge">
                          {log.action}
                        </span>
                      </td>

                      <td>
                        {log.entityName ||
                          "-"}
                      </td>

                      <td>
                        {log.recordId ||
                          "-"}
                      </td>

                      <td>
                        {typeof log.userId ===
                        "object"
                          ? log.userId.name ||
                            log.userId.email ||
                            log.userId._id
                          : log.userId ||
                            "-"}
                      </td>

                      <td>
                        {log.createdDate
                          ? new Date(
                              log.createdDate
                            ).toLocaleString()
                          : log.createdAt
                          ? new Date(
                              log.createdAt
                            ).toLocaleString()
                          : "-"}
                      </td>

                      <td>
                        {log.ipAddress ||
                          "-"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>

            {!filteredLogs.length && (
              <div className="empty-state">
                No audit logs found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}