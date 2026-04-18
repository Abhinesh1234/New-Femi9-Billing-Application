import { Navigate, Outlet } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "../core/redux/store";

/**
 * Wraps app routes that require authentication.
 * - Shows a full-screen spinner while verifying a stored token on page load.
 * - Redirects unauthenticated users to /login.
 * - Passes authenticated users through to the child routes.
 */
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  if (isLoading) {
    return (
      <div
        style={{ height: "100vh" }}
        className="d-flex align-items-center justify-content-center"
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
