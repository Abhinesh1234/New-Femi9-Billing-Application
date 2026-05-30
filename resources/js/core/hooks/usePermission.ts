import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";

export type PermAction = "view" | "create" | "edit" | "delete" | "others";

/**
 * Returns true if the authenticated user has the given permission.
 * Super-admins (permissions === null) always get true.
 * Non-authenticated users always get false.
 */
export function usePermission(module: string, action: PermAction = "view"): boolean {
  const user = useSelector((state: RootState) => state.auth.user);
  if (!user) return false;
  if (user.permissions === null) return true; // null = no individual overrides, full access
  return !!(user.permissions?.[module]?.[action]);
}
