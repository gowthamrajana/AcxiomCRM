import { useEffect, useMemo, useState } from "react";

import api, { getApiError } from "../services/api";
import Loading from "../components/Loading";
import AlertMessage from "../components/AlertMessage";

const initialForm = {
  type: "Call",
  subject: "",
  description: "",
  date: "",
  customerId: "",
  leadId: "",
  status: "Planned"
};

const activityTypes = [
  "Call",
  "Meeting",
  "Email",
  "Task"
];

export default function Activities() {
  const [activities, setActivities] =
    useState([]);

  const [customers, setCustomers] =
    useState([]);

  const [leads, setLeads] =
    useState([]);

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
    item.activityId ||
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
        activityResponse,
        customerResponse,
        leadResponse
      ] = await Promise.all([
        api.get("/activities"),
        api.get("/customers"),
        api.get("/leads")
      ]);

      const activityData =
        activityResponse.data;

      const customerData =
        customerResponse.data;

      const leadData =
        leadResponse.data;

      setActivities(
        Array.isArray(activityData)
          ? activityData
          : activityData.activities ||
              activityData.data ||
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
          "Failed to load activities."
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

    return activities.filter(
      (activity) => {
        const text = [
          activity.type,
          activity.subject,
          activity.description,
          activity.status
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return text.includes(query);
      }
    );
  }, [activities, search]);

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

    if (!form.subject || !form.date) {
      setError(
        "Subject and date are required."
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
          `/activities/${editingId}`,
          payload
        );

        setSuccess(
          "Activity updated successfully."
        );
      } else {
        await api.post(
          "/activities",
          payload
        );

        setSuccess(
          "Activity created successfully."
        );
      }

      setForm(initialForm);
      setEditingId("");

      await loadData();
    } catch (error) {
      setError(
        getApiError(
          error,
          "Failed to save activity."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (activity) => {
    setEditingId(getId(activity));

    setForm({
      type:
        activity.type || "Call",
      subject:
        activity.subject || "",
      description:
        activity.description || "",
      date: activity.date
        ? String(
            activity.date
          ).slice(0, 10)
        : "",
      customerId:
        getReferenceId(
          activity.customerId
        ),
      leadId:
        getReferenceId(
          activity.leadId
        ),
      status:
        activity.status || "Planned"
    });
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Delete this activity?"
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/activities/${id}`
      );

      setSuccess(
        "Activity deleted successfully."
      );

      await loadData();
    } catch (error) {
      setError(
        getApiError(
          error,
          "Failed to delete activity."
        )
      );
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Activities</h2>
          <p>
            Manage calls, meetings, emails and tasks.
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
            ? "Edit Activity"
            : "Add Activity"}
        </h5>

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">
                Type
              </label>

              <select
                name="type"
                className="form-select"
                value={form.type}
                onChange={handleChange}
              >
                {activityTypes.map(
                  (type) => (
                    <option
                      value={type}
                      key={type}
                    >
                      {type}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Subject
              </label>

              <input
                name="subject"
                className="form-control"
                value={form.subject}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Date
              </label>

              <input
                type="date"
                name="date"
                className="form-control"
                value={form.date}
                onChange={handleChange}
                required
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
                <option value="Planned">
                  Planned
                </option>

                <option value="Completed">
                  Completed
                </option>

                <option value="Cancelled">
                  Cancelled
                </option>
              </select>
            </div>

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
                  No customer
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
                  No lead
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

            <div className="col-12">
              <label className="form-label">
                Description
              </label>

              <textarea
                name="description"
                className="form-control"
                rows="3"
                value={form.description}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            className="btn btn-primary mt-3"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : editingId
              ? "Update Activity"
              : "Create Activity"}
          </button>
        </form>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <h5>Activity List</h5>

          <input
            className="form-control search-input"
            placeholder="Search activities..."
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
                  <th>Type</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map(
                  (activity) => {
                    const id =
                      getId(activity);

                    return (
                      <tr key={id}>
                        <td>
                          {activity.type}
                        </td>

                        <td>
                          {activity.subject}
                        </td>

                        <td>
                          {activity.date
                            ? String(
                                activity.date
                              ).slice(
                                0,
                                10
                              )
                            : "-"}
                        </td>

                        <td>
                          <span className="status-badge">
                            {activity.status}
                          </span>
                        </td>

                        <td>
                          {activity.description ||
                            "-"}
                        </td>

                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() =>
                                handleEdit(
                                  activity
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() =>
                                handleDelete(
                                  id
                                )
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>

            {!filtered.length && (
              <div className="empty-state">
                No activities found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}