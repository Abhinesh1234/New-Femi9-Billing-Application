import { useState } from "react";
import { Link, Outlet, useNavigate, useMatch } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../core/redux/store";
import { setPartyAuth, clearPartyAuth } from "../../core/redux/partyAuthSlice";
import { partyLogout, partySwitchCategory } from "../../core/services/partyAuthApi";
import ImageWithBasePath from "../../components/imageWithBasePath";
import { all_routes } from "../../routes/all_routes";
import NotificationBell from "../../components/notification/NotificationBell";

const PartyLayout = () => {
  const dispatch          = useDispatch<AppDispatch>();
  const navigate          = useNavigate();
  const { user }          = useSelector((state: RootState) => state.partyAuth);
  const onItems           = useMatch("/party/items/*");
  const onCompositeItems  = useMatch("/party/composite-items/*");
  const onPriceList       = useMatch("/party/price-list/*");

  const showCompositeItems = user?.settings?.enable_composite_items && user?.permissions?.composite_items?.view;
  const showPriceList      = user?.settings?.enable_price_lists     && user?.permissions?.price_list?.view;
  const hasItemsSubMenu    = showCompositeItems || showPriceList;
  const onAnyItems         = onItems || onCompositeItems || onPriceList;

  const [switchLoading, setSwitchLoading] = useState(false);
  const [switchError,   setSwitchError]   = useState<string | null>(null);

  const handleLogout = async () => {
    await partyLogout();
    localStorage.removeItem("party_auth_token");
    dispatch(clearPartyAuth());
    navigate("/party/login", { replace: true });
  };

  const handleSwitch = async (partyUserId: number) => {
    setSwitchError(null);
    setSwitchLoading(true);
    const result = await partySwitchCategory(partyUserId);
    setSwitchLoading(false);

    if (!result.success) {
      setSwitchError(result.message);
      return;
    }

    localStorage.setItem("party_auth_token", result.token);
    dispatch(setPartyAuth({ user: result.user, token: result.token }));
    navigate(all_routes.partyDashboard, { replace: true });
  };

  const otherCategories = user?.categories.filter(c => !c.is_active) ?? [];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* ── Top navbar ── */}
      <nav
        className="navbar navbar-expand-lg bg-white border-bottom"
        style={{ height: 60, padding: "0 24px", zIndex: 100, position: "sticky", top: 0 }}
      >
        <div className="d-flex align-items-center gap-3 me-auto">
          <ImageWithBasePath
            src="assets/img/logo.svg"
            style={{ height: 32 }}
            alt="Logo"
          />
          {user?.party_name && (
            <span className="fw-semibold fs-14" style={{ color: "#212529" }}>
              {user.party_name}
            </span>
          )}
          {user?.category_name && (
            <span
              className="badge fs-12 fw-medium"
              style={{ background: "#fff0f2", color: "#E41F07", border: "1px solid #ffc5bb" }}
            >
              {user.category_name}
            </span>
          )}
          {/* Nav links */}
          <div className="d-flex align-items-center gap-1 ms-2">
            <Link
              to={all_routes.partyDashboard}
              className="btn btn-sm fs-13 fw-medium"
              style={{ color: (!onAnyItems) ? "#E41F07" : "#6c757d", background: "transparent", border: "none" }}
            >
              Dashboard
            </Link>

            {/* Items — plain link when no sub-items, dropdown when sub-items exist */}
            {!hasItemsSubMenu ? (
              <Link
                to={all_routes.partyItems}
                className="btn btn-sm fs-13 fw-medium"
                style={{ color: onItems ? "#E41F07" : "#6c757d", background: "transparent", border: "none" }}
              >
                Items
              </Link>
            ) : (
              <div className="dropdown">
                <button
                  className="btn btn-sm fs-13 fw-medium dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ color: onAnyItems ? "#E41F07" : "#6c757d", background: "transparent", border: "none", boxShadow: "none" }}
                >
                  Items
                </button>
                <ul className="dropdown-menu" style={{ minWidth: 180 }}>
                  <li>
                    <Link
                      to={all_routes.partyItems}
                      className="dropdown-item fs-13"
                      style={{ color: onItems ? "#E41F07" : undefined }}
                    >
                      <i className="ti ti-box me-2" />Items
                    </Link>
                  </li>
                  {showCompositeItems && (
                    <li>
                      <Link
                        to={all_routes.partyCompositeItems}
                        className="dropdown-item fs-13"
                        style={{ color: onCompositeItems ? "#E41F07" : undefined }}
                      >
                        <i className="ti ti-building-factory-2 me-2" />Composite Items
                      </Link>
                    </li>
                  )}
                  {showPriceList && (
                    <li>
                      <Link
                        to={all_routes.partyPriceList}
                        className="dropdown-item fs-13"
                        style={{ color: onPriceList ? "#E41F07" : undefined }}
                      >
                        <i className="ti ti-tag me-2" />Price List
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">

          {/* Notification bell */}
          <NotificationBell />

          {/* Switch category dropdown */}
          {otherCategories.length > 0 && (
            <div className="dropdown">
              <button
                className="btn btn-outline-secondary btn-sm dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                disabled={switchLoading}
                style={{ fontSize: 13 }}
              >
                {switchLoading
                  ? <><span className="spinner-border spinner-border-sm me-1" role="status" />Switching…</>
                  : <><i className="ti ti-refresh me-1" />Switch Account</>
                }
              </button>
              <ul className="dropdown-menu dropdown-menu-end" style={{ minWidth: 220 }}>
                {switchError && (
                  <li>
                    <div className="px-3 py-2 fs-13 text-danger">
                      <i className="ti ti-alert-circle me-1" />{switchError}
                    </div>
                  </li>
                )}
                {otherCategories.map(cat => (
                  <li key={cat.party_user_id}>
                    <button
                      className="dropdown-item d-flex flex-column"
                      type="button"
                      onClick={() => handleSwitch(cat.party_user_id)}
                    >
                      <span className="fw-medium fs-13">{cat.party_name ?? "—"}</span>
                      {cat.category_name && (
                        <span className="fs-12 text-muted">{cat.category_name}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* User menu */}
          <div className="dropdown">
            <button
              className="btn btn-sm d-flex align-items-center gap-2"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{ border: "1px solid #dee2e6", borderRadius: 8, padding: "4px 12px" }}
            >
              <div
                style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "#E41F07", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 600, flexShrink: 0,
                }}
              >
                {user?.name?.charAt(0).toUpperCase() ?? "P"}
              </div>
              <span className="fs-13 fw-medium">{user?.name}</span>
              <i className="ti ti-chevron-down" style={{ fontSize: 14 }} />
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <button className="dropdown-item" type="button" onClick={handleLogout}>
                  <i className="ti ti-logout me-2" />Logout
                </button>
              </li>
            </ul>
          </div>

        </div>
      </nav>

      {/* ── Page content ── */}
      <main style={{ flex: 1, background: "#f8f9fa", padding: 24 }}>
        <Outlet />
      </main>

    </div>
  );
};

export default PartyLayout;
