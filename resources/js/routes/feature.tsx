import { Outlet, useLocation } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import Header from "../components/header/header";
import Sidebar from "../components/sidebar/sidebar";
import SettingsSidebar from "../components/sidebar/settingsSidebar";
import ThemeSettings from "../components/theme-settings/themeSettings";
import { useEffect } from "react";
import { resetMobileSidebar } from "../core/redux/sidebarSlice";
import { all_routes } from "../routes/all_routes";

const NO_SIDEBAR_PATHS = [all_routes.settingsHome];

const SETTINGS_PREFIXES = [
  "/app-settings",
  "/general-settings",
  "/financial-settings",
  "/website-settings",
  "/system-settings",
  "/user-management",
  "/locations/series",
];

const isSettingsPath = (pathname: string) =>
  SETTINGS_PREFIXES.some(prefix => pathname.startsWith(prefix));

const Feature = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const hideSidebar  = NO_SIDEBAR_PATHS.includes(location.pathname);
  const showSettings = !hideSidebar && isSettingsPath(location.pathname);

  const themeSettings = useSelector((state: any) => state.theme.themeSettings);
  const { miniSidebar, mobileSidebar, expandMenu } = useSelector(
    (state: any) => state.sidebarSlice
  );

  const dataLayout = themeSettings["data-layout"];
  const dataWidth  = themeSettings["data-width"];
  const dataSize   = themeSettings["data-size"];
  const dir        = themeSettings["dir"];

  useEffect(() => {
    dispatch(resetMobileSidebar());
  }, [location.pathname]);

  useEffect(() => {
    const handleCloseFilterClick = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains("close-filter-btn")) {
        const dropdownMenu = target.closest(".dropdown-menu");
        if (dropdownMenu) {
          dropdownMenu.classList.remove("show");
          const dropdownWrapper = dropdownMenu.closest(".dropdown");
          if (dropdownWrapper) {
            const toggleButton = dropdownWrapper.querySelector("[data-toggle]");
            if (toggleButton) toggleButton.classList.remove("show");
          }
        }
      }
    };
    document.addEventListener("click", handleCloseFilterClick);
    return () => document.removeEventListener("click", handleCloseFilterClick);
  }, []);

  return (
    <>
      <div
        className={`
          ${miniSidebar || dataLayout === "mini" || dataSize === "compact" ? "mini-sidebar" : ""}
          ${(expandMenu && miniSidebar) || (expandMenu && dataLayout === "mini") ? "expand-menu" : ""}
          ${mobileSidebar ? "menu-opened slide-nav" : ""}
          ${dataWidth === "box" ? "layout-box-mode mini-sidebar" : ""}
          ${dir === "rtl" ? "layout-mode-rtl" : ""}
        `}
      >
        <div className={`main-wrapper${hideSidebar ? " no-sidebar" : ""}`}>
          <Header />
          {!hideSidebar && (showSettings ? <SettingsSidebar /> : <Sidebar />)}
          <Outlet />
          <ThemeSettings />
        </div>
        {!hideSidebar && (
          <div className={`sidebar-overlay${mobileSidebar ? " opened" : ""}`} />
        )}
      </div>
    </>
  );
};

export default Feature;
