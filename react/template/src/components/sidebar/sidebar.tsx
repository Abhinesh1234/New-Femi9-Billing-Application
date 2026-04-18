import { useDispatch, useSelector } from "react-redux";
import ImageWithBasePath from "../imageWithBasePath";
import { updateTheme } from "../../core/redux/themeSlice";
import { useEffect, useState } from "react";
import { setExpandMenu, setMobileSidebar } from "../../core/redux/sidebarSlice";
import { Link, useLocation, useNavigate } from "react-router";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import "overlayscrollbars/overlayscrollbars.css";
import { SidebarData } from "./sidebarData";
import React from "react";
import { all_routes } from "../../routes/all_routes";

const Sidebar = () => {
  const route = all_routes;
  const Location = useLocation();
  const pathname = Location.pathname;
  const [subsidebar, setSubsidebar] = useState("");
  
  // Track open state for each menu by label
  const [openMenus, setOpenMenus] = useState<{ [label: string]: boolean }>({});
  const dispatch = useDispatch();

  // On mount or pathname change, auto-open submenus with an active link
  useEffect(() => {
    const newOpenMenus: { [label: string]: boolean } = {};
    SidebarData.forEach((mainLabel) => {
      mainLabel.submenuItems?.forEach((title: any) => {
        // If any submenu link is active, open this menu
        const isActive =
          title.link === pathname ||
          (title.relatedRoutes && title.relatedRoutes.includes(pathname)) ||
          (title.submenuItems && title.submenuItems.some((item: any) =>
            item.link === pathname ||
            (item.relatedRoutes && item.relatedRoutes.includes(pathname)) ||
            (item.submenuItems && item.submenuItems.some((subitem: any) =>
              subitem.link === pathname ||
              (subitem.relatedRoutes && subitem.relatedRoutes.includes(pathname))
            ))
          ));
        if (isActive) {
          newOpenMenus[title.label] = true;
        }
      });
    });
    setOpenMenus((prev) => ({ ...prev, ...newOpenMenus }));
  }, [pathname]);

  // Toggle logic for main menus
  const handleMenuToggle = (label: string) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const toggleSubsidebar = (subitem: any) => {
    if (subitem === subsidebar) {
      setSubsidebar("");
    } else {
      setSubsidebar(subitem);
    }
  };

  const handleClick = (label: any) => {
    handleMenuToggle(label);
  };

  const navigate = useNavigate();
  const themeSettings = useSelector((state: any) => state.theme.themeSettings);

  const handleMiniSidebar = () => {
    const rootElement = document.documentElement;
    const isMini = rootElement.getAttribute("data-layout") === "mini";
    const updatedLayout = isMini ? "default" : "mini";
    dispatch(
      updateTheme({
        "data-layout": updatedLayout,
      })
    );
    if (isMini) {
      rootElement.classList.remove("mini-sidebar");
    } else {
      rootElement.classList.add("mini-sidebar");
      // Collapse all expanded menus when sidebar collapses
      setOpenMenus({});
      setSubsidebar("");
    }
  };
  const onMouseEnter = () => {
    dispatch(setExpandMenu(true));
  };
  const onMouseLeave = () => {
    dispatch(setExpandMenu(false));
    setOpenMenus({});
    setSubsidebar("");
  };

  const handleLayoutClick = (layout: string) => {
    const layoutSettings: any = {
      "data-layout": "default",
      dir: "ltr",
    };

    switch (layout) {
      case "Default":
        layoutSettings["data-layout"] = "default";
        break;
      case "Hidden":
        layoutSettings["data-layout"] = "hidden";
        break;
      case "Mini":
        layoutSettings["data-layout"] = "mini";
        break;
      case "Hover View":
        layoutSettings["data-layout"] = "hoverview";
        break;
      case "Full Width":
        layoutSettings["data-layout"] = "full-width";
        break;
      case "Dark":
        layoutSettings["data-bs-theme"] = "dark";
        break;
      case "RTL":
        layoutSettings.dir = "rtl";
        break;
      default:
        break;
    }
    dispatch(updateTheme(layoutSettings));
    navigate("/dashboard");
  };
  const mobileSidebar = useSelector(
    (state: any) => state.sidebarSlice.mobileSidebar
  );
  const toggleMobileSidebar = () => {
    dispatch(setMobileSidebar(!mobileSidebar));
  };
  useEffect(() => {
    const rootElement: any = document.documentElement;
    Object.entries(themeSettings).forEach(([key, value]) => {
      rootElement.setAttribute(key, value);
    });
    if (themeSettings["data-layout"] === "mini") {
      rootElement.classList.add("mini-sidebar");
    } else {
      rootElement.classList.remove("mini-sidebar");
    }
  }, [themeSettings]);

  

  return (
    <>
      {/* Sidenav Menu Start */}
      <div
        className="sidebar"
        id="sidebar"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {/* Start Logo */}
        <div className="sidebar-logo">
          <div>
            {/* Logo Normal */}
            <Link to={route.dealsDashboard} className="logo logo-normal">
              <ImageWithBasePath src="assets/img/logo.svg" alt="Logo" />
            </Link>
            {/* Logo Small */}
            <Link to={route.dealsDashboard} className="logo-small">
              <ImageWithBasePath src="assets/img/logo-small.svg" alt="Logo" />
            </Link>
            {/* Logo Dark */}
            <Link to={route.dealsDashboard} className="dark-logo">
              <ImageWithBasePath src="assets/img/logo-white.svg" alt="Logo" />
            </Link>
          </div>
          <button
            className="sidenav-toggle-btn btn border-0 p-0 active"
            id="toggle_btn"
            onClick={handleMiniSidebar}
          >
            <i className="ti ti-arrow-bar-to-left" />
          </button>
          {/* Sidebar Menu Close */}
          <button className="sidebar-close" onClick={toggleMobileSidebar}>
            <i className="ti ti-x align-middle" />
          </button>
        </div>
        {/* End Logo */}
        {/* Sidenav Menu */}

        <div className="sidebar-inner" data-simplebar="">
          <OverlayScrollbarsComponent style={{ height: "100%", width: "100%" }}>
            <div id="sidebar-menu" className="sidebar-menu">
              <ul>
                {SidebarData?.map((mainLabel, index) => (
                  <React.Fragment key={`main-${index}`}>
                    <li className="menu-title">
                      <span>{mainLabel?.tittle}</span>
                    </li>
                    <li>
                      <ul>
                        {mainLabel?.submenuItems?.map((title: any, i) => {
                          // Check if any submenu or subsubmenu is active
                          const isSubmenuActive =
                            (title?.submenuItems &&
                              title.submenuItems.some(
                                (item: any) =>
                                  item?.link === Location.pathname ||
                                  (item?.submenuItems &&
                                    item.submenuItems.some(
                                      (subitem: any) => subitem?.link === Location.pathname
                                    ))
                              )) ||
                            false;

                          const isActive =
                            (title.relatedRoutes && title.relatedRoutes.includes(Location.pathname)) ||
                            title.link === Location.pathname ||
                            isSubmenuActive;

                          const isMenuOpen = openMenus[title?.label] || false;

                          return (
                            <li className="submenu" key={`title-${i}`}>
                              <Link
                                to={title?.submenu ? "#" : title?.link}
                                onClick={() => {
                                  handleClick(title?.label);
                                  if (mainLabel?.tittle === "Layout") {
                                    handleLayoutClick(title?.label);
                                  }
                                }}
                                className={`${isActive ? "active" : ""} ${isMenuOpen ? "subdrop" : ""}`}
                              >
                                <i className={`ti ti-${title.icon}`}></i>
                                <span>{title?.label}</span>
                                {(title?.submenu || title?.customSubmenuTwo) && (
                                  <span className="menu-arrow"></span>
                                )}
                                {title?.submenu === false &&
                                  title?.version === "v2.0" && (
                                    <span className="badge bg-danger ms-2 rounded-2 badge-md fs-12 fw-medium">
                                      v2.0
                                    </span>
                                  )}
                              </Link>

                              {title?.submenu !== false && (
                                <ul
                                  style={{
                                    display: isMenuOpen ? "block" : "none",
                                  }}
                                >
                                  {title?.submenuItems?.map(
                                    (item: any, j: any) => {
                                      const isSubActive =
                                        item?.submenuItems
                                          ?.map((link: any) => link?.link)
                                          .includes(Location.pathname) ||
                                        item?.link === Location.pathname;

                                      return (
                                        <li
                                          className={`${
                                            item?.submenuItems
                                              ? "submenu submenu-two"
                                              : ""
                                          } `}
                                          key={`item-${j}`}
                                        >
                                          <Link
                                            to={
                                              item?.submenu ? "#" : item?.link
                                            }
                                            className={`${
                                              isSubActive
                                                ? "active subdrop"
                                                : ""
                                            } ${
                                              subsidebar === item?.label
                                                ? "subdrop"
                                                : ""
                                            }`}
                                            onClick={() => {
                                              toggleSubsidebar(item?.label);
                                              if (title?.label === "Layouts") {
                                                handleLayoutClick(item?.label);
                                              }
                                            }}
                                          >
                                            {item?.label}
                                            {(item?.submenu ||
                                              item?.customSubmenuTwo) && (
                                              <span className="menu-arrow"></span>
                                            )}
                                          </Link>
                                          {item?.submenuItems ? (
                                            <ul
                                              style={{
                                                display:
                                                  subsidebar === item?.label
                                                    ? "block"
                                                    : "none",
                                              }}
                                            >
                                              {item?.submenuItems?.map(
                                                (items: any, k: any) => {
                                                  const isSubSubActive =
                                                    items?.submenuItems
                                                      ?.map(
                                                        (link: any) => link.link
                                                      )
                                                      .includes(
                                                        Location.pathname
                                                      ) ||
                                                    items?.link ===
                                                      Location.pathname;

                                                  return (
                                                    <li
                                                      key={`submenu-item-${k}`}
                                                    >
                                                      <Link
                                                        to={
                                                          items?.submenu
                                                            ? "#"
                                                            : items?.link
                                                        }
                                                        className={`${
                                                          isSubSubActive
                                                            ? "active"
                                                            : ""
                                                        }`}
                                                      >
                                                        {items?.label}
                                                      </Link>
                                                    </li>
                                                  );
                                                }
                                              )}
                                            </ul>
                                          ) : null}
                                        </li>
                                      );
                                    }
                                  )}
                                </ul>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  </React.Fragment>
                ))}
              </ul>
            </div>
          </OverlayScrollbarsComponent>
        </div>
      </div>
      {/* Sidenav Menu End */}
    </>
  );
};

export default Sidebar;
