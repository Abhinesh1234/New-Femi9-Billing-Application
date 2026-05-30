import { Navigate, Outlet } from "react-router";
import { usePermission, type PermAction } from "../core/hooks/usePermission";
import { useSelector } from "react-redux";
import type { RootState } from "../core/redux/store";

interface Props {
  module: string;
  action?: PermAction;
  allowPartyUser?: boolean;
}

/**
 * Wraps routes that require a specific module permission.
 * Redirects to /403 if the user lacks access.
 * Waits while auth is still loading (avoids flash-redirect on page refresh).
 * When allowPartyUser is true, party-type users bypass the permission check.
 */
const PermissionGuard = ({ module, action = "view", allowPartyUser = false }: Props) => {
  const { isLoading, user } = useSelector((state: RootState) => state.auth);
  const allowed = usePermission(module, action);
  const isPartyUser = (user as any)?.user_type === "party";

  if (isLoading) return null;
  if (!allowed && !(allowPartyUser && isPartyUser)) return <Navigate to="/403" replace />;

  return <Outlet />;
};

export default PermissionGuard;
