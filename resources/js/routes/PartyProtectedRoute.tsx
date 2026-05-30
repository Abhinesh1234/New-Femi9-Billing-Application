import { Navigate, Outlet } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "../core/redux/store";

const PartyProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.partyAuth);

  if (isLoading) {
    return null;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/party/login" replace />;
};

export default PartyProtectedRoute;
