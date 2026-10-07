import { useEffect, useState } from "react";

import api, { getApiError } from "../services/api";
import Loading from "../components/Loading";
import AlertMessage from "../components/AlertMessage";

const initialForm = {
  name: "",
  email: "",
  password: "",
  role: "SalesExecutive"
};

export default function Users() {
  const [users, setUsers] = useState([]);

  const [form, setForm] =
    useState(initialForm);

  const [editingId, setEditingId] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const getId = (user) =>
    user._id ||
    user.userId ||
    user.id;

  const loadUsers = async () => {
    try {
      setLoading(true);

      const response =
        await api.get("/users");

      const data = response.data;

      setUsers(
        Array.isArray(data)
          ? data
          : data.users ||
              data.data ||
              []
      );
    } catch (error) {
      setError(
        getApiError(
          error,
          "Failed to load users."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

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
      !form.email
    ) {
      setError(
        "Name and email are required."
      );
      return;
    }

    if (
      !editingId &&
      !form.password
    ) {
      setError(
        "Password is required when creating a user."
      );
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        const payload = {
          name: form.name,
          role: form.role
        };

        await api.put(
          `/users/${editingId}`,
          payload
        );

        setSuccess(
          "User updated successfully."
        );
      } else {
        await api.post(
          "/users",
          form
        );

        setSuccess(
          "User created successfully."
        );
      }

      setForm(initialForm);
      setEditingId("");

      await loadUsers();
    } catch (error) {
      setError(
        getApiError(
          error,
          "Failed to save user."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (user) => {
    setEditingId(getId(user));

    setForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role:
        user.role ||
        "SalesExecutive"
    });
  };

  const handleUnlock = async (id) => {
    try {
      await api.post(
        `/users/${id}/unlock`
      );

      setSuccess(
        "User unlocked successfully."
      );

      await loadUsers();
    } catch (error) {
      setError(
        getApiError(
          error,
          "Failed to unlock user."
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
          <h2>Users</h2>
          <p>
            Admin user and role management.
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
            ? "Edit User"
            : "Create User"}
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
                disabled={Boolean(
                  editingId
                )}
                required
              />
            </div>

            {!editingId && (
              <div className="col-md-6">
                <label className="form-label">
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  className="form-control"
                  value={form.password}
                  onChange={handleChange}
                  minLength="8"
                  required
                />
              </div>
            )}

            <div className="col-md-6">
              <label className="form-label">
                Role
              </label>

              <select
                name="role"
                className="form-select"
                value={form.role}
                onChange={handleChange}
              >
                <option value="Admin">
                  Admin
                </option>

                <option value="Manager">
                  Manager
                </option>

                <option value="SalesExecutive">
                  Sales Executive
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
                ? "Update User"
                : "Create User"}
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
          <h5>User List</h5>
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
                  <th>Role</th>
                  <th>Active</th>
                  <th>Locked</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => {
                  const id = getId(user);

                  const locked =
                    user.lockUntil &&
                    new Date(
                      user.lockUntil
                    ) > new Date();

                  return (
                    <tr key={id}>
                      <td>
                        {user.name}
                      </td>

                      <td>
                        {user.email}
                      </td>

                      <td>
                        <span className="status-badge">
                          {user.role}
                        </span>
                      </td>

                      <td>
                        {user.isActive
                          ? "Yes"
                          : "No"}
                      </td>

                      <td>
                        {locked
                          ? "Yes"
                          : "No"}
                      </td>

                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() =>
                              handleEdit(
                                user
                              )
                            }
                          >
                            Edit
                          </button>

                          {locked && (
                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() =>
                                handleUnlock(
                                  id
                                )
                              }
                            >
                              Unlock
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {!users.length && (
              <div className="empty-state">
                No users found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}