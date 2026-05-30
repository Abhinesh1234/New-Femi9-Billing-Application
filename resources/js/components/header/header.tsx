import { Link, useLocation, useNavigate } from "react-router";
import HeaderSearchmodal from "../header-searchModal/headerSearchmodal";
import ImageWithBasePath from "../imageWithBasePath";
import { useDispatch, useSelector } from "react-redux";
import { setMobileSidebar } from "../../core/redux/sidebarSlice";
import { useEffect, useState } from "react";
import { updateTheme } from "../../core/redux/themeSlice";
import { clearAuth, setAuth } from "../../core/redux/authSlice";
import type { AuthUser } from "../../core/redux/authSlice";
import { clearProductSettings } from "../../core/redux/productSettingsSlice";
import { logout } from "../../core/services/authApi";
import { partyLogout, partySwitchCategory } from "../../core/services/partyAuthApi";
import { all_routes } from "../../routes/all_routes";
import type { AppDispatch, RootState } from "../../core/redux/store";
import NotificationBell from "../notification/NotificationBell";

const NO_SIDEBAR_PATHS = [all_routes.settingsHome];

import { nameInitial, nameToColor } from "../../core/utils/avatarUtils";

const Header = () => {

  const route = all_routes;
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const hideSidebar = NO_SIDEBAR_PATHS.includes(pathname);
  const dispatch      = useDispatch<AppDispatch>();
  const themeSettings = useSelector((state: RootState) => state.theme.themeSettings);
  const user          = useSelector((state: RootState) => state.auth.user);
  const isParty       = user?.user_type === "party";
  const canViewSettings = !isParty && (user?.permissions === null || !!(user?.permissions?.["settings"]?.view));

  const [switchLoading, setSwitchLoading] = useState(false);

  const handleSignOut = async () => {
    if (isParty) {
      await partyLogout();
    } else {
      await logout();
    }
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user_type");
    dispatch(clearAuth());
    dispatch(clearProductSettings());
    navigate("/login", { replace: true });
  };

  const handleSwitchCategory = async (partyUserId: number) => {
    setSwitchLoading(true);
    const result = await partySwitchCategory(partyUserId);
    setSwitchLoading(false);
    if (!result.success) return;
    localStorage.setItem("auth_token", result.token);
    dispatch(setAuth({ user: result.user as unknown as AuthUser, token: result.token }));
  };

  const otherCategories = isParty
    ? (user?.categories ?? []).filter(c => !c.is_active)
    : [];

  const mobileSidebar = useSelector(
    (state: any) => state.sidebarSlice.mobileSidebar
  );
  const toggleMobileSidebar = () => {
    dispatch(setMobileSidebar(!mobileSidebar));
  };

  const [isFullscreen, setIsFullscreen] = useState(false);
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        setIsFullscreen(false);
      }
    }
  };

  const handleUpdateTheme = (key: string, value: string) => {
    if (themeSettings["dir"] === "rtl" && key !== "dir") {
      dispatch(updateTheme({ dir: "ltr" }));
    }
    dispatch(updateTheme({ [key]: value }));
  };

  useEffect(() => {
    const htmlElement: any = document.documentElement;
    Object.entries(themeSettings).forEach(([key, value]) => {
      htmlElement.setAttribute(key, value);
    });
  }, [themeSettings]);

  return (
    <>
      {/* Topbar Start */}
      <header className="navbar-header">
        <div className="page-container topbar-menu">
          <div className="d-flex align-items-center gap-2">
            {/* Logo */}
            <Link to={route.dealsDashboard} className="logo">
              {/* Logo Normal */}
              <span className="logo-light">
                <span className="logo-lg">
                  <ImageWithBasePath src="assets/img/logo.svg" alt="logo" />
                </span>
                <span className="logo-sm">
                  <ImageWithBasePath
                    src="assets/img/logo-small.svg"
                    alt="small logo"
                  />
                </span>
              </span>
              {/* Logo Dark */}
              <span className="logo-dark">
                <span className="logo-lg">
                  <ImageWithBasePath
                    src="assets/img/logo-white.svg"
                    alt="dark logo"
                  />
                </span>
              </span>
            </Link>
            {/* Sidebar Mobile Button */}
            {!hideSidebar && (
              <Link
                id="mobile_btn"
                className="mobile-btn"
                to="#sidebar"
                onClick={toggleMobileSidebar}
              >
                <i className="ti ti-menu-deep fs-24" />
              </Link>
            )}
            <button
              className="sidenav-toggle-btn btn border-0 p-0"
              id="toggle_btn2"
            >
              <i className="ti ti-arrow-bar-to-right" />
            </button>
            {/* Search */}
            <div className="me-auto d-flex align-items-center header-search d-lg-flex d-none">
              {/* Search */}
              <div className="input-icon position-relative me-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search Keyword"
                />
                <span className="input-icon-addon d-inline-flex p-0 header-search-icon">
                  <i className="ti ti-command" />
                </span>
              </div>
              {/* /Search */}
            </div>
          </div>
          <div className="d-flex align-items-center">
            {/* Search for Mobile */}
            <div className="header-item d-flex d-lg-none me-2">
              <button
                className="topbar-link btn"
                data-bs-toggle="modal"
                data-bs-target="#searchModal"
                type="button"
              >
                <i className="ti ti-search fs-16" />
              </button>
            </div>
            {/* Minimize */}
            <div className="header-item">
              <div className="dropdown me-2">
                <Link
                  to="#"
                  className="btn topbar-link btnFullscreen"
                  onClick={toggleFullscreen}
                >
                  <i className="ti ti-maximize" />
                </Link>
              </div>
            </div>
            {/* Minimize */}
            {/* Light/Dark Mode Button */}
            <div className="header-item d-none d-sm-flex me-2">
              <Link
                to="#"
                id="dark-mode-toggle"
                className={`topbar-link btn btn-icon topbar-link header-togglebtn ${
                  themeSettings["data-bs-theme"] === "dark" ? "activate" : ""
                }`}
                onClick={() => handleUpdateTheme("data-bs-theme", "light")}
              >
                <i className="ti ti-sun fs-16" />
              </Link>
              {/* Light Mode Toggle */}
              <Link
                to="#"
                id="light-mode-toggle"
                className={`topbar-link btn btn-icon topbar-link header-togglebtn ${
                  themeSettings["data-bs-theme"] === "light" ? "activate" : ""
                }`}
                onClick={() => handleUpdateTheme("data-bs-theme", "dark")}
              >
                <i className="ti ti-moon fs-16" />
              </Link>
            </div>
            {/* pages */}
            <div className="header-item d-none d-sm-flex">
              <div className="dropdown me-2">
                <Link
                  to="#"
                  className="btn topbar-link topbar-teal-link"
                  data-bs-toggle="dropdown"
                >
                  <i className="ti ti-layout-grid-add" />
                </Link>
                <div className="dropdown-menu dropdown-menu-end dropdown-menu-md p-2">
                  {/* Item*/}
                  <Link to={route.contactGrid} className="dropdown-item">
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <span className="d-flex mb-1 fw-semibold text-dark">
                          Contacts
                        </span>
                        <span className="fs-13">View All the Contacts</span>
                      </div>
                      <i className="ti ti-chevron-right-pipe text-dark" />
                    </div>
                  </Link>
                  {/* Item*/}
                  <Link to={route.pipeline} className="dropdown-item">
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <span className="d-flex mb-1 fw-semibold text-dark">
                          Pipeline
                        </span>
                        <span className="fs-13">View All the Pipeline</span>
                      </div>
                      <i className="ti ti-chevron-right-pipe text-dark" />
                    </div>
                  </Link>
                  {/* Item*/}
                  <Link to={route.activities} className="dropdown-item">
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <span className="d-flex mb-1 fw-semibold text-dark">
                          Activities
                        </span>
                        <span className="fs-13">Activities</span>
                      </div>
                      <i className="ti ti-chevron-right-pipe text-dark" />
                    </div>
                  </Link>
                  {/* Item*/}
                  <Link to={route.analytics} className="dropdown-item">
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <span className="d-flex mb-1 fw-semibold text-dark">
                          Analytics
                        </span>
                        <span className="fs-13">Analytics</span>
                      </div>
                      <i className="ti ti-chevron-right-pipe text-dark" />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
            {/* faq */}
            <div className="header-item d-none d-sm-flex">
              <div className="dropdown me-2">
                <Link
                  to={route.faq}
                  className="btn topbar-link topbar-indigo-link"
                >
                  <i className="ti ti-help-hexagon" />
                </Link>
              </div>
            </div>
            {/* report */}
            <div className="header-item d-none d-sm-flex">
              <div className="dropdown me-2">
                <Link
                  to={route.leadReports}
                  className="btn topbar-link topbar-warning-link"
                >
                  <i className="ti ti-chart-pie" />
                </Link>
              </div>
            </div>
            <div className="header-line" />
            {/* Settings — hidden for party users and company users without settings permission */}
            {canViewSettings && (
              <div className="header-item">
                <div className="dropdown me-2">
                  <Link to={route.settingsHome} className="btn topbar-link">
                    <i className="ti ti-settings fs-16" />
                  </Link>
                </div>
              </div>
            )}
            {/* Notification Bell */}
            <div className="header-item">
              <div className="me-2">
                <NotificationBell variant="topbar" />
              </div>
            </div>
            {/* Party category switcher — only when the same number is linked to multiple distribution categories */}
            {isParty && otherCategories.length > 0 && (
              <div className="header-item d-none d-sm-flex">
                <div className="dropdown me-2">
                  <button
                    className="btn topbar-link dropdown-toggle drop-arrow-none d-flex align-items-center gap-1"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    disabled={switchLoading}
                    style={{ fontSize: 13 }}
                  >
                    {switchLoading ? (
                      <span className="spinner-border spinner-border-sm" role="status" />
                    ) : (
                      <i className="ti ti-building-store fs-16" />
                    )}
                    <span className="d-none d-md-inline ms-1" style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user?.category_name ?? user?.party_name ?? "My Account"}
                    </span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end" style={{ minWidth: 220 }}>
                    <li>
                      <span className="dropdown-header fs-12 text-uppercase text-muted">Switch Account</span>
                    </li>
                    {otherCategories.map(cat => (
                      <li key={cat.party_user_id}>
                        <button
                          className="dropdown-item d-flex flex-column py-2"
                          type="button"
                          onClick={() => handleSwitchCategory(cat.party_user_id)}
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
              </div>
            )}
            {/* User Dropdown */}
            <div className="dropdown profile-dropdown d-flex align-items-center justify-content-center">
              <Link
                to="#"
                className="topbar-link dropdown-toggle drop-arrow-none position-relative"
                data-bs-toggle="dropdown"
                data-bs-offset="0,22"
                aria-haspopup="false"
                aria-expanded="false"
              >
                {isParty && user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    width={38}
                    height={38}
                    className="rounded-1 d-flex"
                    style={{ objectFit: "cover" }}
                    alt="user-image"
                  />
                ) : (
                  <div style={{
                    width: 38, height: 38, borderRadius: 4,
                    background: nameToColor(user?.name ?? "U"),
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: 700, fontSize: 16, flexShrink: 0,
                    userSelect: "none",
                  }}>
                    {nameInitial(user?.name ?? "U")}
                  </div>
                )}
                <span className="online text-success">
                  <i className="ti ti-circle-filled d-flex bg-white rounded-circle border border-1 border-white" />
                </span>
              </Link>
              <div className="dropdown-menu dropdown-menu-end dropdown-menu-md p-2">
                <div className="d-flex align-items-center bg-light rounded-3 p-2 mb-2">
                  {isParty && user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      width={42}
                      height={42}
                      className="rounded-circle"
                      style={{ objectFit: "cover", flexShrink: 0 }}
                      alt=""
                    />
                  ) : (
                    <div style={{
                      width: 42, height: 42, borderRadius: "50%",
                      background: nameToColor(user?.name ?? "U"),
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontWeight: 700, fontSize: 18, flexShrink: 0,
                      userSelect: "none",
                    }}>
                      {nameInitial(user?.name ?? "U")}
                    </div>
                  )}
                  <div className="ms-2">
                    <p className="fw-medium text-dark mb-0">{user?.name ?? "User"}</p>
                    {user?.party_code
                      ? <span className="d-block fs-13 text-muted">{user.party_code}</span>
                      : <span className="d-block fs-13 text-capitalize">{user?.user_type ?? ""}</span>
                    }
                  </div>
                </div>
                {/* Item*/}
                <Link to={route.profile} className="dropdown-item">
                  <i className="ti ti-user-circle me-1 align-middle" />
                  <span className="align-middle">Profile Settings</span>
                </Link>
                {/* item */}
                <div className="form-check form-switch form-check-reverse d-flex align-items-center justify-content-between dropdown-item mb-0">
                  <label className="form-check-label" htmlFor="notify">
                    <i className="ti ti-bell" />
                    Notifications
                  </label>
                  <input
                    className="form-check-input me-0"
                    type="checkbox"
                    role="switch"
                    id="notify"
                  />
                </div>
                {/* Item*/}
                <div className="pt-2 mt-2 border-top">
                  <button
                    type="button"
                    className="dropdown-item text-danger w-100 text-start"
                    onClick={handleSignOut}
                  >
                    <i className="ti ti-logout me-1 fs-17 align-middle" />
                    <span className="align-middle">Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Topbar End */}
      <HeaderSearchmodal />
    </>
  );
};

export default Header;
