// ── Axios interceptors must be set up before any service imports ──────────────
import { setupAxios } from "./core/setupAxios";
setupAxios();
// ─────────────────────────────────────────────────────────────────────────────

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router";
import store from "./core/redux/store";
import { base_path } from "./environment";
import ALLRoutes from "./routes/router";
import AuthProvider from "./routes/AuthProvider";
import DynamicTitle from "./routes/dynamicTitle";
import Preloader from "./components/Preloader/Preloader";
import ErrorBoundary from "./components/error-boundary/ErrorBoundary";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "@tabler/icons-webfont/dist/tabler-icons.css";
import "@fortawesome/fontawesome-free/css/fontawesome.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "react-quill-new/dist/quill.snow.css";
import "./index.scss";

const rootElement = document.getElementById("root");

if (!rootElement) {
  document.body.innerHTML =
    '<div style="padding:40px;font-family:system-ui;color:#374151">' +
    '<h2>App failed to start</h2><p>Root element #root not found in the document.</p>' +
    "</div>";
  throw new Error("Root element #root not found.");
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <BrowserRouter basename={base_path}>
          {/* AuthProvider verifies stored token on page load before rendering routes */}
          <AuthProvider>
            <Preloader />
            <ALLRoutes />
            <DynamicTitle />
          </AuthProvider>
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  </StrictMode>
);
