import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Spinner } from "../ui/Bits";

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, loading, role, employee } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;

  // signed in, but no employee record is linked yet
  if (!employee) {
    return (
      <div className="center">
        <div className="card" style={{ maxWidth: 460 }}>
          <div className="card-body">
            <h2>Account not linked</h2>
            <p className="small muted" style={{ marginTop: 8 }}>
              Your login exists but isn't attached to an employee record. Ask an
              admin to add you with this email address, then sign in again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (roles && !roles.includes(role)) return <Navigate to="/dashboard" replace />;

  return children;
}
