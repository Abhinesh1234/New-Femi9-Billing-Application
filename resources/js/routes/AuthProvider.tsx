import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../core/redux/store";
import { setUser, clearAuth, setAuthLoading } from "../core/redux/authSlice";
import { me } from "../core/services/authApi";

interface Props {
  children: React.ReactNode;
}

/**
 * AuthProvider
 * ------------
 * Mounted once at the app root.
 * On every page load, if a token is stored in localStorage, it verifies it
 * against GET /api/auth/me and restores the user session into Redux.
 * If the token is invalid or expired, it clears auth state and removes the token.
 */
const AuthProvider = ({ children }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!token) {
      dispatch(setAuthLoading(false));
      return;
    }

    (async () => {
      const result = await me();
      if (result.success) {
        dispatch(setUser(result.user));
      } else {
        // Token is stale / invalid — clear everything
        localStorage.removeItem("auth_token");
        dispatch(clearAuth());
      }
    })();
  }, []); // run once on mount

  return <>{children}</>;
};

export default AuthProvider;
