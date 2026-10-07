import { useEffect, useMemo, useState } from "react";

import api, { getApiError } from "../services/api";
import Loading from "../components/Loading";
import AlertMessage from "../components/AlertMessage";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  source: "",
  status: "New",
  expectedValue: ""
};

const statuses = [
  "New",
  "Contacted",
  "Qualified",
  "Unqualified",
  "Converted",
  "Lost"
];

export default function Leads() {
  const [leads, setLeads] = useState([]);

  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getId = (lead) =>
    lead._id || lead.leadId || lead.id;

  const loadLeads = async () => {
    try {
      setLoading(true);

      const response = await api.get("/leads");

      const data = response.data;

      setLeads(
        Array.isArray(data)
          ? data
          : data.leads || data.data || []
      );
    } catch (error) {
      setError(
        getApiError(
          error,
          "Failed to load leads."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const filteredLeads = useMemo(() => {
    const query = search.toLowerCase();

    return leads.filter((lead) => {
      const text = [
        lead.name,
        lead.email,
        lead.phone,
        lead.company,
        lead.source,
        lead.status
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(query);
    });
  }, [leads, search]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !form.name ||
      !form.email ||
      !form.phone
    ) {
      setError(
        "Name, email and phone are required."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...form,
        expectedValue: Number(
          form.expectedValue || 0
        )
      };

      if (editingId) {
        await api.put(
          `/leads/${editingId}`,
          payload
        );

        setSuccess("Lead updated successfully.");
      } else {
        await api.post("/leads", payload);

        setSuccess("Lead created successfully.");
      }

      setForm(initialForm);
      setEditingId("");

      await loadLeads();
    } catch (error) {
      setError(
        getApiError(
          error,
          "Failed to save lead."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (lead) => {
    setEditingId(getId(lead));

    setForm({
      name: lead.name || "",
      email: lead.email || "",
      phone: lead.phone || "",
      company: lead.company || "",
      source: lead.source || "",
      status: lead.status || "New",
      expectedValue: lead.expectedValue ?? ""
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this lead?")) {
      return;
    }

    try {
      await api.delete(`/leads/${id}`);

      setSuccess("Lead deleted successfully.");

      await loadLeads();
    } catch (error) {
      setError(
        getApiError(
          error,
          "Failed to delete lead."
        )
      );
    }
  };

  const handleConvert = async (id) => {
    if (
      !window.confirm(
        "Convert this lead to a customer?"
      )
    ) {
      return;
    }

    try {
      await api.post(`/leads/${id}/convert`);

      setSuccess(
        "Lead converted successfully."
      );

      await loadLeads();
    } catch (error) {
      setError(
        getApiError(
          error,
          "Failed to convert lead."
        )
      );
    }
  };

  const cancelEdit = () => {
    setEditingId("");
    setForm(initialForm);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Leads</h2>
          <p>
            Manage leads and convert qualified leads.
          </p>
        </div>
      </div>

      <AlertMessage
        message={error}
        type="danger"
        onClose={() => setError("")}
      />

      <AlertMessage
        message={success}
        type="success"
        onClose={() => setSuccess("")}
      />

      <div className="form-card mb-4">
        <h5>
          {editingId
            ? "Edit Lead"
            : "Add Lead"}
        </h5>

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">
                Name
              </label>

              <input
                name="name"
                className="form-control"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Email
              </label>

              <input
                type="email"
                name="email"
                className="form-control"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Phone
              </label>

              <input
                name="phone"
                className="form-control"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Company
              </label>

              <input
                name="company"
                className="form-control"
                value={form.company}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Source
              </label>

              <input
                name="source"
                className="form-control"
                value={form.source}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Status
              </label>

              <select
                name="status"
                className="form-select"
                value={form.status}
                onChange={handleChange}
              >
                {statuses.map((status) => (
                  <option
                    value={status}
                    key={status}
                  >
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Expected Value
              </label>

              <input
                type="number"
                name="expectedValue"
                className="form-control"
                min="0"
                value={form.expectedValue}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mt-3 d-flex gap-2">
            <button
              className="btn btn-primary"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Lead"
                : "Create Lead"}
            </button>

            {editingId && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <h5>Lead List</h5>

          <input
            className="form-control search-input"
            placeholder="Search leads..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        {loading ? (
          <Loading />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Value</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredLeads.map((lead) => {
                  const id = getId(lead);

                  return (
                    <tr key={id}>
                      <td>{lead.name}</td>

                      <td>{lead.email}</td>

                      <td>
                        {lead.company || "-"}
                      </td>

                      <td>
                        {lead.source || "-"}
                      </td>

                      <td>
                        <span className="status-badge">
                          {lead.status}
                        </span>
                      </td>

                      <td>
                        {lead.expectedValue ?? 0}
                      </td>

                      <td>
                        <div className="d-flex gap-2 flex-wrap">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() =>
                              handleEdit(lead)
                            }
                          >
                            Edit
                          </button>

                          {![
                            "Converted",
                            "Lost"
                          ].includes(
                            lead.status
                          ) && (
                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() =>
                                handleConvert(id)
                              }
                            >
                              Convert
                            </button>
                          )}

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              handleDelete(id)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {!filteredLeads.length && (
              <div className="empty-state">
                No leads found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}