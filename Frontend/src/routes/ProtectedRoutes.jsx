import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import LoadingSpinner from "../components/common/loadingSpinner";

export default function ProtectedRoute({ allowedRoles, isCheckingAuth }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (isCheckingAuth) {
    return <LoadingSpinner fullScreen={true} message="Verifying secure session..." />;
  }


  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const safeRole = user?.role?.toLowerCase().trim();

  if (allowedRoles && !allowedRoles.includes(safeRole)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}