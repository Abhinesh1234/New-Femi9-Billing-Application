import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../core/redux/store";
import { setUser, clearAuth, setAuthLoading } from "../core/redux/authSlice";
import { setProductSettings, clearProductSettings } from "../core/redux/productSettingsSlice";
import { startLoading, stopLoading } from "../core/redux/loaderSlice";
import { setPartyAuth, setPartyAuthLoading, clearPartyAuth } from "../core/redux/partyAuthSlice";
import { me } from "../core/services/authApi";
import { partyMe } from "../core/services/partyAuthApi";

interface Props {
  children: React.ReactNode;
}

const AuthProvider = ({ children }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { token, isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { isLoaded: settingsLoaded } = useSelector((state: RootState) => state.productSettings);

  // After login (no page refresh): isAuthenticated flips true but the main effect already
  // exited early. Pull settings directly from the user object that was just stored in Redux.
  useEffect(() => {
    if (!isAuthenticated || settingsLoaded) return;
    const s = user?.settings;
    dispatch(setProductSettings({
      enableCompositeItems: s?.enable_composite_items ?? false,
      enablePriceLists:     s?.enable_price_lists     ?? false,
    }));
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Runs once on mount — restores the session from localStorage tokens.
  useEffect(() => {
    dispatch(startLoading("auth"));

    const partyToken = localStorage.getItem("party_auth_token");
    const adminToken = token; // from state.auth (sourced from localStorage.auth_token)

    // ── Party portal session restoration ─────────────────────────────────────
    if (partyToken && !adminToken) {
      (async () => {
        try {
          const result = await partyMe();
          if (result.success) {
            dispatch(setPartyAuth({ user: result.user, token: partyToken }));
          } else {
            localStorage.removeItem("party_auth_token");
            dispatch(clearPartyAuth());
          }
        } catch {
          localStorage.removeItem("party_auth_token");
          dispatch(clearPartyAuth());
        } finally {
          dispatch(setAuthLoading(false));
          dispatch(stopLoading("auth"));
        }
      })();
      return;
    }

    // ── Admin session restoration ─────────────────────────────────────────────
    dispatch(setPartyAuthLoading(false));

    if (!adminToken) {
      dispatch(setAuthLoading(false));
      dispatch(stopLoading("auth"));
      return;
    }

    (async () => {
      try {
        const result = await me();
        if (result.success) {
          const s = result.user.settings;
          dispatch(setProductSettings({
            enableCompositeItems: s?.enable_composite_items ?? false,
            enablePriceLists:     s?.enable_price_lists     ?? false,
          }));
          dispatch(setUser(result.user));
        } else {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_user_type");
          dispatch(clearAuth());
          dispatch(clearProductSettings());
        }
      } catch {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user_type");
        dispatch(clearAuth());
        dispatch(clearProductSettings());
      } finally {
        dispatch(stopLoading("auth"));
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
};

export default AuthProvider;
