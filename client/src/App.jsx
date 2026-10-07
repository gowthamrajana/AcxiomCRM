import {
  BrowserRouter,
  Navigate,
  Route,
  Routes
} from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Leads from "./pages/Leads";
import Opportunities from "./pages/Opportunities";
import FollowUps from "./pages/FollowUps";
import Activities from "./pages/Activities";
import Users from "./pages/Users";
import AuditLogs from "./pages/AuditLogs";

function AppLayout() {
  const storedUser =
    localStorage.getItem("user");

  let user = null;

  try {
    user = storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch {
    user = null;
  }

  return (
    <div className="app-shell">
      <Navbar user={user} />

      <main className="page-content">
        <Routes>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/customers"
            element={<Customers />}
          />

          <Route
            path="/leads"
            element={<Leads />}
          />

          <Route
            path="/opportunities"
            element={<Opportunities />}
          />

          <Route
            path="/followups"
            element={<FollowUps />}
          />

          <Route
            path="/activities"
            element={<Activities />}
          />

          <Route
            path="/users"
            element={<Users />}
          />

          <Route
            path="/audit"
            element={<AuditLogs />}
          />

          <Route
            path="*"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Login />}
        />

        <Route element={<ProtectedRoute />}>
          <Route
            path="/*"
            element={<AppLayout />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}