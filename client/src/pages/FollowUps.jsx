import { useEffect, useMemo, useState } from "react";

import api, { getApiError } from "../services/api";
import Loading from "../components/Loading";
import AlertMessage from "../components/AlertMessage";

const initialForm = {
  customerId: "",
  leadId: "",
  followUpDate: "",
  followUpType: "Call",
  remarks: "",
  status: "Planned"
};

const statuses = [
  "Planned",
  "Completed",
  "Missed",
  "Cancelled"
];

const types = [
  "Call",
  "Meeting",
  "Email",
  "Task"
];

export default function FollowUps() {
  const [items, setItems] = useState([]);

  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);

  const [form, setForm] =
    useState(initialForm);

  const [editingId, setEditingId] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const getId = (item) =>
    item._id ||
    item.followUpId ||
    item.id;

  const getReferenceId = (value) => {
    if (!value) return "";

    if (typeof value === "object") {
      return value._id || value.id || "";
    }

    return value;
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        followUpResponse,
        customerResponse,
        leadResponse
      ] = await Promise.all([
        api.get("/followups"),
        api.get("/customers"),
        api.get("/leads")
      ]);

      const followUpData =
        followUpResponse.data;

      const customerData =
        customerResponse.data;

      const leadData =
        leadResponse.data;

      setItems(
        Array.isArray(followUpData)
          ? followUpData
          : followUpData.followUps ||
              followUpData.followups ||
              followUpData.data ||
              []
      );

      setCustomers(
        Array.isArray(customerData)
          ? customerData
          : customerData.customers ||
              customerData.data ||
              []
      );

      setLeads(
        Array.isArray(leadData)
          ? leadData
          : leadData.leads ||
              leadData.data ||
              []
      );
    } catch (error) {
      setError(
        getApiError(
          error,
          "Failed to load follow-ups."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    const query =
      search.toLowerCase();

    return items.filter((item) => {
      const text = [
        item.followUpType,
        item.status,
        item.remarks
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(query);
    });
  }, [items, search]);

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.followUpDate) {
      setError(
        "Follow-up date is required."
      );
      return;
    }

    const today =
      new Date().toISOString().split("T")[0];

    if (
      form.status === "Planned" &&
      form.followUpDate < today
    ) {
      setError(
        "A planned follow-up cannot be before today."
      );
      return;
    }

    if (
      !form.customerId &&
      !form.leadId
    ) {
      setError(
        "Select a customer or a lead."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...form,
        customerId:
          form.customerId || undefined,
        leadId:
          form.leadId || undefined
      };

      if (editingId) {
        await api.put(
          `/followups/${editingId}`,
          payload
        );

        setSuccess(
          "Follow-up updated successfully."
        );
      } else {
        await api.post(
          "/followups",
          payload
        );

        setSuccess(
          "Follow-up created successfully."
        );
      }

      setForm(initialForm);
      setEditingId("");

      await loadData();
    } catch (error) {
      setError(
        getApiError(
          error,
          "Failed to save follow-up."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(getId(item));

    setForm({
      customerId: getReferenceId(
        item.customerId
      ),
      leadId: getReferenceId(
        item.leadId
      ),
      followUpDate: item.followUpDate
        ? String(
            item.followUpDate
          ).slice(0, 10)
        : "",
      followUpType:
        item.followUpType || "Call",
      remarks: item.remarks || "",
      status:
        item.status || "Planned"
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Delete this follow-up?"
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/followups/${id}`
      );

      setSuccess(
        "Follow-up deleted successfully."
      );

      await loadData();
    } catch (error) {
      setError(
        getApiError(
          error,
          "Failed to delete follow-up."
        )
      );
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Follow-Ups</h2>
          <p>
            Schedule and manage customer follow-ups.
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
            ? "Edit Follow-Up"
            : "Add Follow-Up"}
        </h5>

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">
                Customer
              </label>

              <select
                name="customerId"
                className="form-select"
                value={form.customerId}
                onChange={handleChange}
              >
                <option value="">
                  Select customer
                </option>

                {customers.map(
                  (customer) => {
                    const id =
                      customer._id ||
                      customer.customerId;

                    return (
                      <option
                        key={id}
                        value={id}
                      >
                        {customer.name}
                      </option>
                    );
                  }
                )}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Lead
              </label>

              <select
                name="leadId"
                className="form-select"
                value={form.leadId}
                onChange={handleChange}
              >
                <option value="">
                  Select lead
                </option>

                {leads.map((lead) => {
                  const id =
                    lead._id ||
                    lead.leadId;

                  return (
                    <option
                      key={id}
                      value={id}
                    >
                      {lead.name}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Follow-Up Date
              </label>

              <input
                type="date"
                name="followUpDate"
                className="form-control"
                value={form.followUpDate}
                min={
                  form.status === "Planned"
                    ? new Date()
                        .toISOString()
                        .split("T")[0]
                    : undefined
                }
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Type
              </label>

              <select
                name="followUpType"
                className="form-select"
                value={form.followUpType}
                onChange={handleChange}
              >
                {types.map((type) => (
                  <option
                    value={type}
                    key={type}
                  >
                    {type}
                  </option>
                ))}
              </select>
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
                {statuses.map(
                  (status) => (
                    <option
                      value={status}
                      key={status}
                    >
                      {status}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="col-md-12">
              <label className="form-label">
                Remarks
              </label>

              <textarea
                name="remarks"
                className="form-control"
                rows="3"
                value={form.remarks}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mt-3">
            <button
              className="btn btn-primary"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Follow-Up"
                : "Create Follow-Up"}
            </button>
          </div>
        </form>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <h5>Follow-Up List</h5>

          <input
            className="form-control search-input"
            placeholder="Search..."
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
                  <th>Date</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Remarks</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((item) => {
                  const id = getId(item);

                  return (
                    <tr key={id}>
                      <td>
                        {item.followUpDate
                          ? String(
                              item.followUpDate
                            ).slice(0, 10)
                          : "-"}
                      </td>

                      <td>
                        {item.followUpType}
                      </td>

                      <td>
                        <span className="status-badge">
                          {item.status}
                        </span>
                      </td>

                      <td>
                        {item.remarks || "-"}
                      </td>

                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() =>
                              handleEdit(item)
                            }
                          >
                            Edit
                          </button>

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

            {!filtered.length && (
              <div className="empty-state">
                No follow-ups found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}