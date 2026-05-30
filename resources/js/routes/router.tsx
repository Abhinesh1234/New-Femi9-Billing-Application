import { Suspense, lazy } from "react";
import { Route, Routes, Navigate } from "react-router";
import { authRoutes, publicRoutes } from "./router.link";
import Feature from "./feature";
import AuthFeature from "./authFeature";
import ProtectedRoute from "./ProtectedRoute";
import PartyProtectedRoute from "./PartyProtectedRoute";
import FeatureGuard from "./FeatureGuard";
import PermissionGuard from "./PermissionGuard";
import ChunkLoader from "./ChunkLoader";
import RouteChangeWatcher from "./RouteChangeWatcher";
import type { PermAction } from "../core/hooks/usePermission";

const PartyLogin              = lazy(() => import("../feature-module/Authentication/party-login/PartyLogin"));
const PartyLayout             = lazy(() => import("../feature-module/party-portal/PartyLayout"));
const PartyDashboard          = lazy(() => import("../feature-module/party-portal/PartyDashboard"));
const PartyItemsList          = lazy(() => import("../feature-module/party-portal/PartyItemsList"));
const PartyCompositeItemsList = lazy(() => import("../feature-module/party-portal/PartyCompositeItemsList"));
const PartyPriceList          = lazy(() => import("../feature-module/party-portal/PartyPriceList"));

const ALLRoutes: React.FC = () => {
  return (
    <Suspense fallback={<ChunkLoader />}>
    <RouteChangeWatcher />
    <Routes>
      {/* ── Authenticated app routes ── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Feature />}>
          {publicRoutes.map((r, idx) => {
            const inner = <Route key={`inner-${idx}`} path={r.path} element={r.element} />;

            // Build from inside out: first perm guard, then feature guard
            let wrapped: React.ReactNode = inner;

            if ((r as any).permModule) {
              wrapped = (
                <Route key={`perm-${idx}`} element={
                  <PermissionGuard
                    module={(r as any).permModule}
                    action={((r as any).permAction as PermAction) ?? "view"}
                    allowPartyUser={(r as any).permAllowParty === true}
                  />
                }>
                  {inner}
                </Route>
              );
            }

            if (r.feature) {
              wrapped = (
                <Route key={idx} element={
                  <FeatureGuard feature={r.feature as "composite_items" | "price_lists"} />
                }>
                  {wrapped}
                </Route>
              );
              return wrapped;
            }

            // Unwrapped or only perm-wrapped
            if ((r as any).permModule) {
              return <Route key={idx} element={
                <PermissionGuard
                  module={(r as any).permModule}
                  action={((r as any).permAction as PermAction) ?? "view"}
                  allowPartyUser={(r as any).permAllowParty === true}
                />
              }>
                <Route path={r.path} element={r.element} />
              </Route>;
            }

            return <Route path={r.path} element={r.element} key={idx} />;
          })}
        </Route>
      </Route>

      {/* ── Auth pages (login, register, etc.) ── */}
      <Route element={<AuthFeature />}>
        {authRoutes.map((route, idx) => (
          <Route path={route.path} element={route.element} key={idx} />
        ))}
      </Route>

      {/* ── Party portal login (public) ── */}
      <Route path="/party/login" element={<PartyLogin />} />

      {/* ── Party portal authenticated routes ── */}
      <Route element={<PartyProtectedRoute />}>
        <Route element={<PartyLayout />}>
          <Route path="/party/dashboard"          element={<PartyDashboard />} />
          <Route path="/party/items"              element={<PartyItemsList />} />
          <Route path="/party/items/:id"          element={<PartyItemsList />} />
          <Route path="/party/composite-items"    element={<PartyCompositeItemsList />} />
          <Route path="/party/price-list"         element={<PartyPriceList />} />
        </Route>
      </Route>

      {/* ── Fallback ── */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
    </Suspense>
  );
};

export default ALLRoutes;
