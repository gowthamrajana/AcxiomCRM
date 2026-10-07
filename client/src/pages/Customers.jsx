import { useEffect, useMemo, useState } from "react";

import api, { getApiError } from "../services/api";
import Loading from "../components/Loading";
import AlertMessage from "../components/AlertMessage";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  address: "",
  city: "",
  state: "",
  status: "Active"
};

export default function Customers() {
  const [customers, setCustomers] = useState([]);

  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getId = (customer) =>
    customer._id || customer.customerId || customer.id;

  const loadCustomers = async () => {
    try {
      setLoading(true);

      const response = await api.get("/customers");

      const data = response.data;

      setCustomers(
        Array.isArray(data)
          ? data
          : data.customers || data.data || []
      );
    } catch (error) {
      setError(
        getApiError(
          error,
          "Failed to load customers."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const query = search.toLowerCase();

    return customers.filter((customer) => {
      const text = [
        customer.name,
        customer.email,
        customer.phone,
        customer.company,
        customer.city,
        customer.state,
        customer.status
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(query);
    });
  }, [customers, search]);

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

    if (!form.name || !form.email || !form.phone) {
      setError(
        "Name, email and phone are required."
      );
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        await api.put(
          `/customers/${editingId}`,
          form
        );

        setSuccess("Customer updated successfully.");
      } else {
        await api.post("/customers", form);

        setSuccess("Customer created successfully.");
      }

      setForm(initialForm);
      setEditingId("");

      await loadCustomers();
    } catch (error) {
      setError(
        getApiError(
          error,
          "Failed to save customer."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (customer) => {
    setEditingId(getId(customer));

    setForm({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      company: customer.company || "",
      address: customer.address || "",
      city: customer.city || "",
      state: customer.state || "",
      status: customer.status || "Active"
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this customer?")) {
      return;
    }

    try {
      await api.delete(`/customers/${id}`);

      setSuccess(
        "Customer deleted successfully."
      );

      await loadCustomers();
    } catch (error) {
      setError(
        getApiError(
          error,
          "Failed to delete customer."
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
          <h2>Customers</h2>
          <p>
            Manage customer records.
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
            ? "Edit Customer"
            : "Add Customer"}
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

            <div className="col-md-12">
              <label className="form-label">
                Address
              </label>

              <input
                name="address"
                className="form-control"
                value={form.address}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                City
              </label>

              <input
                name="city"
                className="form-control"
                value={form.city}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                State
              </label>

              <input
                name="state"
                className="form-control"
                value={form.state}
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
                <option value="Active">
                  Active
                </option>

                <option value="Inactive">
                  Inactive
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
                ? "Update Customer"
                : "Create Customer"}
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
          <h5>Customer List</h5>

          <input
            className="form-control search-input"
            placeholder="Search customers..."
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
                  <th>Phone</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map(
                  (customer) => {
                    const id = getId(customer);

                    return (
                      <tr key={id}>
                        <td>
                          {customer.name}
                        </td>

                        <td>
                          {customer.email}
                        </td>

                        <td>
                          {customer.phone}
                        </td>

                        <td>
                          {customer.company || "-"}
                        </td>

                        <td>
                          <span className="status-badge">
                            {customer.status}
                          </span>
                        </td>

                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() =>
                                handleEdit(customer)
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
                  }
                )}
              </tbody>
            </table>

            {!filteredCustomers.length && (
              <div className="empty-state">
                No customers found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}