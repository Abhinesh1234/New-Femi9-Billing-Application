/**
 * setupAxios
 * ----------
 * Configures global axios defaults and interceptors.
 * Import this ONCE, as early as possible in main.tsx, before any service calls.
 *
 * Security measures:
 *  - Always sends Authorization: Bearer <token> if a token is stored
 *  - On 401 → clears token + auth state, redirects to login
 *  - Sets Accept + X-Requested-With headers on every request
 */
import axios from "axios";
import store from "./redux/store";
import { clearAuth } from "./redux/authSlice";
import { clearProductSettings } from "./redux/productSettingsSlice";

export function setupAxios(): void {
  // ── Request: attach token ────────────────────────────────────────────────
  axios.interceptors.request.use((config) => {
    config.headers["Accept"]           = "application/json";
    config.headers["X-Requested-With"] = "XMLHttpRequest";

    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  });

  // ── Response: handle auth errors globally ────────────────────────────────
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status;

      if (status === 401) {
        // Token is invalid or expired — clean up and redirect to login
        localStorage.removeItem("auth_token");
        store.dispatch(clearAuth());
        store.dispatch(clearProductSettings());

        const currentPath = window.location.pathname;
        if (currentPath !== "/login") {
          window.location.replace("/login");
        }
      }

      return Promise.reject(error);
    }
  );
}
