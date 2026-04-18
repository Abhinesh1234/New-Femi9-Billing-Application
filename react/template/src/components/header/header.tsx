import { Link } from "react-router";
import HeaderSearchmodal from "../header-searchModal/headerSearchmodal";
import ImageWithBasePath from "../imageWithBasePath";
import { useDispatch, useSelector } from "react-redux";
import { setMobileSidebar } from "../../core/redux/sidebarSlice";
import { useEffect, useState } from "react";
import { updateTheme } from "../../core/redux/themeSlice";
import { all_routes } from "../../routes/all_routes";

const Header = () => {

  const route = all_routes
  const dispatch = useDispatch();
  const themeSettings = useSelector((state: any) => state.theme.themeSettings);

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
            <Link
              id="mobile_btn"
              className="mobile-btn"
              to="#sidebar"
              onClick={toggleMobileSidebar}
            >
              <i className="ti ti-menu-deep fs-24" />
            </Link>
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
            {/* message */}
            <div className="header-item">
              <div className="dropdown me-2">
                <Link to={route.chat} className="btn topbar-link">
                  <i className="ti ti-message-circle-exclamation" />
                  <span className="badge rounded-pill">14</span>
                </Link>
              </div>
            </div>
            {/* Notification Dropdown */}
            <div className="header-item">
              <div className="dropdown me-2">
                <button
                  className="topbar-link btn topbar-link dropdown-toggle drop-arrow-none"
                  data-bs-toggle="dropdown"
                  data-bs-offset="0,24"
                  type="button"
                  aria-haspopup="false"
                  aria-expanded="false"
                >
                  <i className="ti ti-bell-check fs-16 animate-ring" />
                  <span className="badge rounded-pill">10</span>
                </button>
                <div
                  className="dropdown-menu p-0 dropdown-menu-end dropdown-menu-lg"
                  style={{ minHeight: 300 }}
                >
                  <div className="p-2 border-bottom">
                    <div className="row align-items-center">
                      <div className="col">
                        <h6 className="m-0 fs-16 fw-semibold">
                          {" "}
                          Notifications
                        </h6>
                      </div>
                    </div>
                  </div>
                  {/* Notification Body */}
                  <div
                    className="notification-body position-relative z-2 rounded-0"
                    data-simplebar=""
                  >
                    {/* Item*/}
                    <div
                      className="dropdown-item notification-item py-3 text-wrap border-bottom"
                      id="notification-1"
                    >
                      <div className="d-flex">
                        <div className="me-2 position-relative flex-shrink-0">
                          <ImageWithBasePath
                            src="assets/img/users/user-01.jpg"
                            className="avatar-md rounded-circle"
                            alt=""
                          />
                        </div>
                        <div className="flex-grow-1">
                          <p className="mb-0 fw-medium text-dark">John Doe</p>
                          <p className="mb-1 text-wrap">
                            left 6 comments on{" "}
                            <span className="fw-medium text-dark">
                              Isla Nublar SOC2 compliance report
                            </span>
                          </p>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fs-12">
                              <i className="ti ti-clock me-1" />4 min ago
                            </span>
                            <div className="notification-action d-flex align-items-center float-end gap-2">
                              <Link
                                to="#"
                                className="notification-read rounded-circle bg-danger"
                                data-bs-toggle="tooltip"
                                title=""
                                data-bs-original-title="Make as Read"
                                aria-label="Make as Read"
                              />
                              <button
                                className="btn rounded-circle p-0"
                                data-dismissible="#notification-1"
                              >
                                <i className="ti ti-x" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Item*/}
                    <div
                      className="dropdown-item notification-item py-3 text-wrap border-bottom"
                      id="notification-2"
                    >
                      <div className="d-flex">
                        <div className="me-2 position-relative flex-shrink-0">
                          <ImageWithBasePath
                            src="assets/img/users/user-12.jpg"
                            className="avatar-md rounded-circle"
                            alt=""
                          />
                        </div>
                        <div className="flex-grow-1">
                          <p className="mb-0 fw-medium text-dark">
                            Thomas William
                          </p>
                          <p className="mb-1 text-wrap">
                            “Oh, I finished de-bugging the phones, but the
                            system's compiling for eighteen minutes, or
                            twenty...”
                          </p>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fs-12">
                              <i className="ti ti-clock me-1" />8 min ago
                            </span>
                            <div className="notification-action d-flex align-items-center float-end gap-2">
                              <Link
                                to="#"
                                className="notification-read rounded-circle bg-danger"
                                data-bs-toggle="tooltip"
                                title=""
                                data-bs-original-title="Make as Read"
                                aria-label="Make as Read"
                              />
                              <button
                                className="btn rounded-circle p-0"
                                data-dismissible="#notification-2"
                              >
                                <i className="ti ti-x" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Item*/}
                    <div
                      className="dropdown-item notification-item py-3 text-wrap border-bottom"
                      id="notification-3"
                    >
                      <div className="d-flex">
                        <div className="me-2 position-relative flex-shrink-0">
                          <ImageWithBasePath
                            src="assets/img/profiles/avatar-12.jpg"
                            className="avatar-md rounded-circle"
                            alt=""
                          />
                        </div>
                        <div className="flex-grow-1">
                          <p className="mb-0 fw-medium text-dark">
                            Sarah Anderson
                          </p>
                          <p className="mb-1 text-wrap">
                            attached a file to{" "}
                            <span className="fw-medium text-dark">
                              Isla Nublar SOC2 compliance report
                            </span>
                          </p>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fs-12">
                              <i className="ti ti-clock me-1" />
                              15 min ago
                            </span>
                            <div className="notification-action d-flex align-items-center float-end gap-2">
                              <Link
                                to="#"
                                className="notification-read rounded-circle bg-danger"
                                data-bs-toggle="tooltip"
                                title=""
                                data-bs-original-title="Make as Read"
                                aria-label="Make as Read"
                              />
                              <button
                                className="btn rounded-circle p-0"
                                data-dismissible="#notification-3"
                              >
                                <i className="ti ti-x" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Item*/}
                    <div
                      className="dropdown-item notification-item py-3 text-wrap"
                      id="notification-4"
                    >
                      <div className="d-flex">
                        <div className="me-2 position-relative flex-shrink-0">
                          <ImageWithBasePath
                            src="assets/img/profiles/avatar-08.jpg"
                            className="avatar-md rounded-circle"
                            alt=""
                          />
                        </div>
                        <div className="flex-grow-1">
                          <p className="mb-0 fw-medium text-dark">
                            Ann McClure
                          </p>
                          <p className="mb-1 text-wrap">
                            mentioned you in{" "}
                            <span className="fw-medium text-dark">
                              Bug Fix Review - Task #432
                            </span>
                          </p>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fs-12">
                              <i className="ti ti-clock me-1" />
                              20 min ago
                            </span>
                            <div className="notification-action d-flex align-items-center float-end gap-2">
                              <Link
                                to="#"
                                className="notification-read rounded-circle bg-danger"
                                data-bs-toggle="tooltip"
                                title=""
                                data-bs-original-title="Make as Read"
                                aria-label="Make as Read"
                              />
                              <button
                                className="btn rounded-circle p-0"
                                data-dismissible="#notification-4"
                              >
                                <i className="ti ti-x" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* View All*/}
                  <div className="p-2 rounded-bottom border-top text-center">
                    <Link
                      to={route.notificationbell}
                      className="text-center text-decoration-underline fs-14 mb-0"
                    >
                      View All Notifications
                    </Link>
                  </div>
                </div>
              </div>
            </div>
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
                <ImageWithBasePath
                  src="assets/img/users/user-40.jpg"
                  width={38}
                  className="rounded-1 d-flex"
                  alt="user-image"
                />
                <span className="online text-success">
                  <i className="ti ti-circle-filled d-flex bg-white rounded-circle border border-1 border-white" />
                </span>
              </Link>
              <div className="dropdown-menu dropdown-menu-end dropdown-menu-md p-2">
                <div className="d-flex align-items-center bg-light rounded-3 p-2 mb-2">
                  <ImageWithBasePath
                    src="assets/img/users/user-40.jpg"
                    className="rounded-circle"
                    width={42}
                    height={42}
                    alt=""
                  />
                  <div className="ms-2">
                    <p className="fw-medium text-dark mb-0">Katherine Brooks</p>
                    <span className="d-block fs-13">Installer</span>
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
                <Link to="#" className="dropdown-item">
                  <i className="ti ti-help-circle me-1 align-middle" />
                  <span className="align-middle">Help &amp; Support</span>
                </Link>
                {/* Item*/}
                <Link to={route.profile} className="dropdown-item">
                  <i className="ti ti-settings me-1 align-middle" />
                  <span className="align-middle">Settings</span>
                </Link>
                {/* Item*/}
                <div className="pt-2 mt-2 border-top">
                  <Link to={route.login} className="dropdown-item text-danger">
                    <i className="ti ti-logout me-1 fs-17 align-middle" />
                    <span className="align-middle">Sign Out</span>
                  </Link>
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
