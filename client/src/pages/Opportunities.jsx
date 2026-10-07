import { useEffect, useMemo, useState } from "react";

import api, { getApiError } from "../services/api";
import Loading from "../components/Loading";
import AlertMessage from "../components/AlertMessage";

const initialForm = {
  name: "",
  customerId: "",
  leadId: "",
  amount: "",
  stage: "Qualification",
  probability: 20,
  expectedCloseDate: "",
  status: "Open"
};

const stages = [
  "Qualification",
  "Proposal",
  "Negotiation",
  "Won",
  "Lost"
];

export default function Opportunities() {
  const [opportunities, setOpportunities] =
    useState([]);

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
    item.opportunityId ||
    item.id;

  const getReferenceId = (value) => {
    if (!value) {
      return "";
    }

    if (typeof value === "object") {
      return value._id || value.id || "";
    }

    return value;
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        opportunityResponse,
        customerResponse,
        leadResponse
      ] = await Promise.all([
        api.get("/opportunities"),
        api.get("/customers"),
        api.get("/leads")
      ]);

      const opportunityData =
        opportunityResponse.data;

      const customerData =
        customerResponse.data;

      const leadData =
        leadResponse.data;

      setOpportunities(
        Array.isArray(opportunityData)
          ? opportunityData
          : opportunityData.opportunities ||
              opportunityData.data ||
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
          "Failed to load opportunities."
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

    return opportunities.filter(
      (item) => {
        const text = [
          item.name,
          item.stage,
          item.status
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return text.includes(query);
      }
    );
  }, [opportunities, search]);

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

    if (
      !form.name ||
      !form.customerId ||
      !form.amount ||
      !form.expectedCloseDate
    ) {
      setError(
        "Name, customer, amount and expected close date are required."
      );
      return;
    }

    if (Number(form.amount) <= 0) {
      setError(
        "Opportunity amount must be greater than 0."
      );
      return;
    }

    if (
      Number(form.probability) < 0 ||
      Number(form.probability) > 100
    ) {
      setError(
        "Probability must be between 0 and 100."
      );
      return;
    }

    const today =
      new Date().toISOString().split("T")[0];

    if (
      form.status === "Open" &&
      form.expectedCloseDate < today
    ) {
      setError(
        "Active opportunity close date cannot be in the past."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...form,
        amount: Number(form.amount),
        probability: Number(form.probability),
        leadId:
          form.leadId || undefined
      };

      if (editingId) {
        await api.put(
          `/opportunities/${editingId}`,
          payload
        );

        setSuccess(
          "Opportunity updated successfully."
        );
      } else {
        await api.post(
          "/opportunities",
          payload
        );

        setSuccess(
          "Opportunity created successfully."
        );
      }

      setForm(initialForm);
      setEditingId("");

      await loadData();
    } catch (error) {
      setError(
        getApiError(
          error,
          "Failed to save opportunity."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(getId(item));

    setForm({
      name: item.name || "",
      customerId: getReferenceId(
        item.customerId
      ),
      leadId: getReferenceId(
        item.leadId
      ),
      amount: item.amount ?? "",
      stage:
        item.stage ||
        "Qualification",
      probability:
        item.probability ?? 20,
      expectedCloseDate:
        item.expectedCloseDate
          ? String(
              item.expectedCloseDate
            ).slice(0, 10)
          : "",
      status:
        item.status || "Open"
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Delete this opportunity?"
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/opportunities/${id}`
      );

      setSuccess(
        "Opportunity deleted successfully."
      );

      await loadData();
    } catch (error) {
      setError(
        getApiError(
          error,
          "Failed to delete opportunity."
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
          <h2>Opportunities</h2>
          <p>
            Manage deals and sales pipeline.
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
            ? "Edit Opportunity"
            : "Add Opportunity"}
        </h5>

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">
                Opportunity Name
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
                Customer
              </label>

              <select
                name="customerId"
                className="form-select"
                value={form.customerId}
                onChange={handleChange}
                required
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

            <div className="col-md-6">
              <label className="form-label">
                Amount
              </label>

              <input
                type="number"
                name="amount"
                min="0.01"
                step="0.01"
                className="form-control"
                value={form.amount}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Stage
              </label>

              <select
                name="stage"
                className="form-select"
                value={form.stage}
                onChange={handleChange}
              >
                {stages.map((stage) => (
                  <option
                    key={stage}
                    value={stage}
                  >
                    {stage}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Probability %
              </label>

              <input
                type="number"
                name="probability"
                min="0"
                max="100"
                className="form-control"
                value={form.probability}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Expected Close Date
              </label>

              <input
                type="date"
                name="expectedCloseDate"
                className="form-control"
                value={
                  form.expectedCloseDate
                }
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
                <option value="Open">
                  Open
                </option>

                <option value="Won">
                  Won
                </option>

                <option value="Lost">
                  Lost
                </option>
              </select>
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
                ? "Update Opportunity"
                : "Create Opportunity"}
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
          <h5>
            Opportunity List
          </h5>

          <input
            className="form-control search-input"
            placeholder="Search opportunities..."
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
                  <th>Amount</th>
                  <th>Stage</th>
                  <th>Probability</th>
                  <th>Close Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((item) => {
                  const id = getId(item);

                  return (
                    <tr key={id}>
                      <td>{item.name}</td>

                      <td>
                        {Number(
                          item.amount || 0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      <td>
                        <span className="status-badge">
                          {item.stage}
                        </span>
                      </td>

                      <td>
                        {item.probability ?? 0}%
                      </td>

                      <td>
                        {item.expectedCloseDate
                          ? String(
                              item.expectedCloseDate
                            ).slice(0, 10)
                          : "-"}
                      </td>

                      <td>
                        {item.status}
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
                No opportunities found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}