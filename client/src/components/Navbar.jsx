import { NavLink, useNavigate } from "react-router-dom";
import api, { getApiError } from "../services/api";

export default function Navbar({ user }) {
  const navigate = useNavigate();

  const navClass = ({ isActive }) =>
    `nav-link ${isActive ? "active" : ""}`;

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.log(getApiError(error, "Logout request failed."));
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/", {
        replace: true
      });
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid px-4">
        <NavLink to="/dashboard" className="navbar-brand fw-bold">
          Acxiom CRM
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#crmNavbar"
          aria-controls="crmNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="crmNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink to="/dashboard" className={navClass}>
                Dashboard
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/customers" className={navClass}>
                Customers
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/leads" className={navClass}>
                Leads
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/opportunities" className={navClass}>
                Opportunities
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/followups" className={navClass}>
                Follow-Ups
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/activities" className={navClass}>
                Activities
              </NavLink>
            </li>

            {user?.role === "Admin" && (
              <>
                <li className="nav-item">
                  <NavLink to="/users" className={navClass}>
                    Users
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink to="/audit" className={navClass}>
                    Audit Logs
                  </NavLink>
                </li>
              </>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3">
            <div className="text-white small">
              {user?.name || user?.email}
            </div>

            <span className="badge bg-primary">
              {user?.role || "User"}
            </span>

            <button
              type="button"
              className="btn btn-outline-light btn-sm"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}