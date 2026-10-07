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

const ITEMS_PER_PAGE = 10;

export default function Customers() {
  const [customers, setCustomers] = useState([]);

  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getId = (customer) =>
    customer._id || customer.customerId || customer.id;

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");

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

  const validateForm = () => {
    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();

    if (!name || !email || !phone) {
      return "Name, email and phone are required.";
    }

    if (name.length < 2 || name.length > 100) {
      return "Name must be between 2 and 100 characters.";
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return "Please enter a valid email address.";
    }

    const phonePattern =
      /^[0-9+\-\s()]{7,20}$/;

    if (!phonePattern.test(phone)) {
      return "Please enter a valid phone number.";
    }

    return "";
  };

  const filteredAndSortedCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = customers.filter((customer) => {
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

      const matchesSearch = text.includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        customer.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      const first = String(
        a[sortField] || ""
      ).toLowerCase();

      const second = String(
        b[sortField] || ""
      ).toLowerCase();

      if (first < second) {
        return sortDirection === "asc" ? -1 : 1;
      }

      if (first > second) {
        return sortDirection === "asc" ? 1 : -1;
      }

      return 0;
    });
  }, [
    customers,
    search,
    statusFilter,
    sortField,
    sortDirection
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredAndSortedCustomers.length /
        ITEMS_PER_PAGE
    )
  );

  const paginatedCustomers = useMemo(() => {
    const startIndex =
      (currentPage - 1) * ITEMS_PER_PAGE;

    return filteredAndSortedCustomers.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );
  }, [
    filteredAndSortedCustomers,
    currentPage
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...form,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        company: form.company.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim()
      };

      if (editingId) {
        await api.put(
          `/customers/${editingId}`,
          payload
        );

        setSuccess(
          "Customer updated successfully."
        );
      } else {
        await api.post(
          "/customers",
          payload
        );

        setSuccess(
          "Customer created successfully."
        );
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

    setError("");
    setSuccess("");

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
      setError("");
      setSuccess("");

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
    setError("");
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((previous) =>
        previous === "asc"
          ? "desc"
          : "asc"
      );
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return "";
    }

    return sortDirection === "asc"
      ? " ↑"
      : " ↓";
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
                minLength="2"
                maxLength="100"
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
                type="tel"
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
              type="submit"
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

          <div className="d-flex gap-2 flex-wrap">
            <input
              className="form-control search-input"
              placeholder="Search customers..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

            <select
              className="form-select"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
            >
              <option value="All">
                All Statuses
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>
            </select>
          </div>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>
                    <button
                      type="button"
                      className="btn btn-link p-0 text-decoration-none fw-bold"
                      onClick={() =>
                        handleSort("name")
                      }
                    >
                      Name
                      {getSortIcon("name")}
                    </button>
                  </th>

                  <th>
                    <button
                      type="button"
                      className="btn btn-link p-0 text-decoration-none fw-bold"
                      onClick={() =>
                        handleSort("email")
                      }
                    >
                      Email
                      {getSortIcon("email")}
                    </button>
                  </th>

                  <th>Phone</th>

                  <th>
                    <button
                      type="button"
                      className="btn btn-link p-0 text-decoration-none fw-bold"
                      onClick={() =>
                        handleSort("company")
                      }
                    >
                      Company
                      {getSortIcon("company")}
                    </button>
                  </th>

                  <th>Status</th>

                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedCustomers.map(
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
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() =>
                                handleEdit(
                                  customer
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
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

            {!filteredAndSortedCustomers.length && (
              <div className="empty-state">
                No customers found.
              </div>
            )}

            {filteredAndSortedCustomers.length > 0 && (
              <div className="d-flex justify-content-between align-items-center p-3 border-top">
                <span className="text-muted">
                  Showing{" "}
                  {Math.min(
                    (currentPage - 1) *
                      ITEMS_PER_PAGE +
                      1,
                    filteredAndSortedCustomers.length
                  )}{" "}
                  to{" "}
                  {Math.min(
                    currentPage *
                      ITEMS_PER_PAGE,
                    filteredAndSortedCustomers.length
                  )}{" "}
                  of{" "}
                  {filteredAndSortedCustomers.length}
                </span>

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage(
                        (previous) =>
                          previous - 1
                      )
                    }
                  >
                    Previous
                  </button>

                  <span className="px-2 py-1">
                    Page {currentPage} of{" "}
                    {totalPages}
                  </span>

                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    disabled={
                      currentPage === totalPages
                    }
                    onClick={() =>
                      setCurrentPage(
                        (previous) =>
                          previous + 1
                      )
                    }
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}