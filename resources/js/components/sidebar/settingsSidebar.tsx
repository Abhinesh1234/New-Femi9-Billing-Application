import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { all_routes } from "../../routes/all_routes";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

const route = all_routes;

interface SubItem {
  label: string;
  to: string;
}

interface NavItem {
  label: string;
  children: SubItem[];
}

interface NavSection {
  sectionTitle: string;
  items: NavItem[];
}

const NAV: NavSection[] = [
  {
    sectionTitle: "Organisation Settings",
    items: [
      {
        label: "Organisation",
        children: [
          { label: "Profile",                  to: route.profile },
          { label: "Branding",                 to: route.companySettings },
          { label: "Locations",                to: route.locations },
        ],
      },
      {
        label: "Customisation",
        children: [
          { label: "Transaction Number Series", to: route.transactionSeriesList },
        ],
      },
    ],
  },
  {
    sectionTitle: "Module Settings",
    items: [
      {
        label: "General",
        children: [
          { label: "Items", to: route.projectSettings },
        ],
      },
      {
        label: "Inventory",
        children: [
          { label: "Assemblies",            to: route.compositeItems },
          { label: "Inventory Adjustments", to: "#" },
          { label: "Packages",              to: "#" },
          { label: "Shipments",             to: "#" },
          { label: "Transfer Orders",       to: "#" },
        ],
      },
      {
        label: "Sales",
        children: [
          { label: "Sales Orders",      to: "#" },
          { label: "Delivery Challans", to: "#" },
          { label: "Invoices",          to: "#" },
          { label: "Payments Received", to: "#" },
          { label: "Sales Returns",     to: "#" },
          { label: "Credit Notes",      to: "#" },
        ],
      },
      {
        label: "Purchases",
        children: [
          { label: "Purchase Orders",   to: "#" },
          { label: "Purchase Receives", to: "#" },
          { label: "Bills",             to: "#" },
          { label: "Payments Made",     to: "#" },
          { label: "Vendor Credits",    to: "#" },
        ],
      },
    ],
  },
];

const isChildActive = (children: SubItem[], pathname: string) =>
  children.some(c => c.to !== "#" && pathname.startsWith(c.to));

const SettingsSidebar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const initialOpen: Record<string, boolean> = {};
  NAV.forEach(section =>
    section.items.forEach(item => {
      if (isChildActive(item.children, pathname)) initialOpen[item.label] = true;
    })
  );
  const [openItems, setOpenItems] = useState<Record<string, boolean>>(initialOpen);

  const toggle = (label: string) =>
    setOpenItems(prev => ({ ...prev, [label]: !prev[label] }));

  return (
    <div className="sidebar" id="sidebar">
      {/* Header */}
      <div className="sidebar-logo" style={{ borderBottom: "1px solid var(--border-color)" }}>
        <div className="d-flex align-items-center gap-2 py-1">
          <button
            className="btn btn-sm btn-icon btn-outline-light border-0 p-1"
            onClick={() => navigate(route.settingsHome)}
            title="All Settings"
          >
            <i className="ti ti-arrow-left fs-16" />
          </button>
          <span style={{ fontWeight: 600, fontSize: 13, color: "var(--menu-item-heading)" }}>
            All Settings
          </span>
        </div>
      </div>

      {/* Nav */}
      <OverlayScrollbarsComponent style={{ height: "calc(100vh - 60px)" }} options={{ scrollbars: { autoHide: "scroll" } }}>
        <div style={{ padding: "8px 0 24px" }}>
          {NAV.map(section => (
            <div key={section.sectionTitle}>
              {/* Section header */}
              <div style={{
                padding: "16px 16px 6px",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--text-muted, #9ca3af)",
              }}>
                {section.sectionTitle}
              </div>

              {section.items.map(item => {
                const isOpen = !!openItems[item.label];
                const hasActive = isChildActive(item.children, pathname);

                return (
                  <div key={item.label}>
                    {/* Parent item */}
                    <button
                      onClick={() => toggle(item.label)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        padding: "9px 16px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: hasActive ? 600 : 500,
                        color: hasActive ? "var(--primary, #E41F07)" : "var(--menu-item-heading, #374151)",
                        textAlign: "left",
                      }}
                    >
                      <span>{item.label}</span>
                      <i className={`ti ti-chevron-${isOpen ? "down" : "right"} fs-13`} />
                    </button>

                    {/* Children */}
                    {isOpen && (
                      <div style={{ borderLeft: "2px solid #f0f0f0", margin: "0 0 4px 24px" }}>
                        {item.children.map(child => {
                          const active = child.to !== "#" && pathname.startsWith(child.to);
                          return (
                            <Link
                              key={child.label}
                              to={child.to}
                              style={{
                                display: "block",
                                padding: "7px 14px",
                                fontSize: 13,
                                textDecoration: "none",
                                color: active ? "var(--primary, #E41F07)" : "var(--menu-item-color, #4b5563)",
                                fontWeight: active ? 600 : 400,
                                background: active ? "rgba(228,31,7,0.06)" : "none",
                                borderRadius: "0 6px 6px 0",
                              }}
                            >
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </OverlayScrollbarsComponent>
    </div>
  );
};

export default SettingsSidebar;
