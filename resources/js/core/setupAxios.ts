/**
 * setupAxios
 * ----------
 * Configures global axios defaults and interceptors.
 * Import this ONCE, as early as possible in main.tsx.
 *
 * A single `auth_token` is used for all requests regardless of whether the
 * authenticated user is an admin or a party user — both share the same portal.
 */
import axios from "axios";
import store from "./redux/store";
import { clearAuth } from "./redux/authSlice";
import { clearProductSettings } from "./redux/productSettingsSlice";
import { base_path } from "../environment";

function buildPath(path: string): string {
  return (base_path.replace(/\/$/, "") + path).replace(/^\/\//, "/");
}

export function setupAxios(): void {
  // ── Request: attach token ────────────────────────────────────────────────
  axios.interceptors.request.use((config) => {
    config.headers["Accept"]           = "application/json";
    config.headers["X-Requested-With"] = "XMLHttpRequest";

    const token = localStorage.getItem("auth_token") || localStorage.getItem("party_auth_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  });

  // ── Response: handle auth errors globally ────────────────────────────────
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user_type");
        store.dispatch(clearAuth());
        store.dispatch(clearProductSettings());

        const loginPath = buildPath("/login");
        if (window.location.pathname !== loginPath) {
          window.location.replace(loginPath);
        }
      }

      return Promise.reject(error);
    }
  );
}
