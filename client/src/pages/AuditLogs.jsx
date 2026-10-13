import { useEffect, useMemo, useState } from "react";
import api, { getApiError } from "../services/api";
import Loading from "../components/Loading";
import AlertMessage from "../components/AlertMessage";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getId = (log) => log._id || log.auditLogId || log.id;

  const fetchLogs = async (isMounted = true) => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/audit");
      const data = response.data;

      const list = Array.isArray(data)
        ? data
        : data?.logs || data?.auditLogs || data?.data || [];

      if (isMounted) {
        setLogs(Array.isArray(list) ? list : []);
      }
    } catch (err) {
      if (isMounted) {
        setError(getApiError(err, "Failed to load audit logs."));
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchLogs(isMounted);

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredLogs = useMemo(() => {
    const query = search.toLowerCase().trim();

    return logs.filter((log) => {
      const user =
        typeof log.userId === "object" && log.userId
          ? `${log.userId.name || ""} ${log.userId.email || ""} ${log.userId._id || ""}`
          : String(log.userId || "");

      const text = [
        log.action,
        log.entityName,
        log.recordId,
        log.ipAddress,
        user
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
          <p>Track important CRM actions.</p>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={() => fetchLogs(true)}
          disabled={loading}
        >
          Refresh
        </button>
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
            onChange={(event) => setSearch(event.target.value)}
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
                {filteredLogs.map((log, index) => (
                  <tr key={getId(log) || index}>
                    <td>
                      <span className="status-badge">
                        {log.action || "-"}
                      </span>
                    </td>
                    <td>{log.entityName || "-"}</td>
                    <td>{log.recordId || "-"}</td>
                    <td>
                      {typeof log.userId === "object" && log.userId
                        ? log.userId.name ||
                          log.userId.email ||
                          log.userId._id ||
                          "-"
                        : log.userId || "-"}
                    </td>
                    <td>
                      {log.createdDate || log.createdAt
                        ? new Date(
                            log.createdDate || log.createdAt
                          ).toLocaleString()
                        : "-"}
                    </td>
                    <td>{log.ipAddress || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!filteredLogs.length && (
              <div className="empty-state">
                {error
                  ? "Audit logs could not be loaded."
                  : search
                  ? "No matching audit logs found."
                  : "No audit logs found."}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}