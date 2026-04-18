import { Route, Routes, Navigate } from "react-router";
import { authRoutes, publicRoutes } from "./router.link";
import Feature from "./feature";
import AuthFeature from "./authFeature";
import ProtectedRoute from "./ProtectedRoute";

const ALLRoutes: React.FC = () => {
  return (
    <Routes>
      {/* ── Authenticated app routes ── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Feature />}>
          {publicRoutes.map((route, idx) => (
            <Route path={route.path} element={route.element} key={idx} />
          ))}
        </Route>
      </Route>

      {/* ── Auth pages (login, register, etc.) ── */}
      <Route element={<AuthFeature />}>
        {authRoutes.map((route, idx) => (
          <Route path={route.path} element={route.element} key={idx} />
        ))}
      </Route>

      {/* ── Fallback ── */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default ALLRoutes;
