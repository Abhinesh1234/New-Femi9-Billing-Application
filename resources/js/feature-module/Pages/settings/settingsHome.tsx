import { useState } from "react";
import { Link, useNavigate } from "react-router";
import PageHeader from "../../../components/page-header/pageHeader";
import { all_routes } from "../../../routes/all_routes";

const route = all_routes;

// ── Types ────────────────────────────────────────────────────────────────────────

interface CardItem {
  icon: string;
  label: string;
  description: string;
  to: string;
}

interface SubSection {
  icon: string;
  title: string;
  items: CardItem[];
}

interface Section {
  title: string;
  subtitle: string;
  subSections: SubSection[];
}

// ── Data ─────────────────────────────────────────────────────────────────────────

const SECTIONS: Section[] = [
  {
    title: "Organisation Settings",
    subtitle: "Manage your organisation profile, branding, and preferences.",
    subSections: [
      {
        icon: "ti ti-building",
        title: "Organisation",
        items: [
          { icon: "ti ti-user-circle",  label: "Profile",   description: "View and update basic organisation details",   to: route.profile },
          { icon: "ti ti-palette",      label: "Branding",  description: "Update logo, colors and brand identity",        to: route.companySettings },
          { icon: "ti ti-map-pin",      label: "Locations", description: "Manage business locations and branches",        to: route.locations },
        ],
      },
      {
        icon: "ti ti-wand",
        title: "Customisation",
        items: [
          { icon: "ti ti-list-numbers", label: "Transaction Number Series", description: "Configure number series for all transactions", to: route.transactionSeriesList },
        ],
      },
    ],
  },
  {
    title: "Module Settings",
    subtitle: "Configure preferences for each module in the platform.",
    subSections: [
      {
        icon: "ti ti-layout-list",
        title: "General",
        items: [
          { icon: "ti ti-users", label: "Customers and Vendors", description: "Manage customer and vendor preferences",  to: "#" },
          { icon: "ti ti-box",   label: "Items",                 description: "Configure item defaults and preferences", to: route.projectSettings },
        ],
      },
      {
        icon: "ti ti-package",
        title: "Inventory",
        items: [
          { icon: "ti ti-building-factory-2", label: "Assemblies",            description: "Manage composite and assembled items",        to: route.compositeItems },
          { icon: "ti ti-adjustments",        label: "Inventory Adjustments", description: "Configure adjustment types and reasons",       to: "#" },
          { icon: "ti ti-package",            label: "Packages",              description: "Set packaging defaults and preferences",      to: "#" },
          { icon: "ti ti-truck",              label: "Shipments",             description: "Manage shipment preferences and carriers",    to: "#" },
          { icon: "ti ti-arrows-exchange",    label: "Transfer Orders",       description: "Configure inter-location transfer settings",  to: "#" },
        ],
      },
      {
        icon: "ti ti-shopping-bag",
        title: "Sales",
        items: [
          { icon: "ti ti-file-invoice",   label: "Sales Orders",      description: "Configure sales order defaults and workflows", to: "#" },
          { icon: "ti ti-truck-delivery", label: "Delivery Challans", description: "Set delivery challan preferences",              to: "#" },
          { icon: "ti ti-receipt",        label: "Invoices",          description: "Manage invoice templates and numbering",        to: "#" },
          { icon: "ti ti-cash",           label: "Payments Received", description: "Configure payment receipt preferences",         to: "#" },
          { icon: "ti ti-arrow-back-up",  label: "Sales Returns",     description: "Set sales return policies and workflows",       to: "#" },
          { icon: "ti ti-file-text",      label: "Credit Notes",      description: "Manage credit note templates and settings",     to: "#" },
        ],
      },
      {
        icon: "ti ti-receipt",
        title: "Purchases",
        items: [
          { icon: "ti ti-file-invoice",   label: "Purchase Orders",   description: "Configure purchase order defaults",            to: "#" },
          { icon: "ti ti-package-import", label: "Purchase Receives", description: "Set receiving preferences and workflows",      to: "#" },
          { icon: "ti ti-file-dollar",    label: "Bills",             description: "Manage bill templates and preferences",        to: "#" },
          { icon: "ti ti-wallet",         label: "Payments Made",     description: "Configure payment disbursement preferences",   to: "#" },
          { icon: "ti ti-file-minus",     label: "Vendor Credits",    description: "Manage vendor credit note settings",           to: "#" },
        ],
      },
    ],
  },
];

// ── ItemCard ──────────────────────────────────────────────────────────────────────

const ItemCard = ({ item }: { item: CardItem }) => {
  const isDisabled = item.to === "#";

  return (
    <Link
      to={item.to}
      className="d-flex h-100"
      style={{ textDecoration: "none" }}
      onClick={isDisabled ? (e) => e.preventDefault() : undefined}
    >
      <div
        className="w-100 d-flex flex-column"
        onMouseEnter={e => { if (!isDisabled) e.currentTarget.style.borderColor = "var(--primary)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-color)"; }}
        style={{
          border: "1px solid var(--border-color)",
          borderRadius: 10,
          overflow: "hidden",
          cursor: isDisabled ? "default" : "pointer",
          boxShadow: "var(--box-shadow)",
          background: "var(--white)",
        }}
      >
        {/* Body */}
        <div className="p-3 flex-grow-1">
          {/* Icon */}
          <div
            className="d-flex align-items-center justify-content-center mb-3"
            style={{ width: 48, height: 48, borderRadius: 10, background: "var(--light)", flexShrink: 0 }}
          >
            <i className={item.icon} style={{ fontSize: 20, color: "var(--gray-500)" }} />
          </div>

          {/* Title */}
          <div className="d-flex align-items-start justify-content-between gap-2 mb-1">
            <span className="fw-semibold fs-14" style={{ color: "var(--heading-color)", lineHeight: 1.4 }}>
              {item.label}
            </span>
            {isDisabled && (
              <span className="badge" style={{ background: "var(--warning-transparent)", color: "var(--warning)", fontSize: 10, flexShrink: 0 }}>
                Soon
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-muted small mb-0" style={{ lineHeight: 1.6 }}>
            {item.description}
          </p>
        </div>

        {/* Footer */}
        <div className="d-flex align-items-center justify-content-between px-3 py-2" style={{ borderTop: "1px solid var(--border-color)" }}>
          <span className="fw-semibold" style={{ fontSize: 13, color: "var(--primary)" }}>
            {isDisabled ? "Coming Soon" : "Configure"}
          </span>
          {!isDisabled && <i className="ti ti-arrow-right" style={{ fontSize: 14, color: "var(--primary)" }} />}
        </div>
      </div>
    </Link>
  );
};

// ── SubSectionBlock ───────────────────────────────────────────────────────────────

const SubSectionBlock = ({ sub, isLast }: { sub: SubSection; isLast: boolean }) => (
  <div className={isLast ? "" : "mb-4"}>
    {/* Header */}
    <div className="d-flex align-items-center gap-2 mb-3">
      <span
        className="d-flex align-items-center justify-content-center flex-shrink-0"
        style={{ width: 28, height: 28, borderRadius: 7, background: "var(--primary-transparent)" }}
      >
        <i className={sub.icon} style={{ fontSize: 15, color: "var(--primary)" }} />
      </span>
      <h6 className="fw-semibold mb-0">{sub.title}</h6>
    </div>

    {/* Grid */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: 14,
      }}
    >
      {sub.items.map((item) => (
        <ItemCard key={item.label} item={item} />
      ))}
    </div>
  </div>
);

// ── SectionBlock ──────────────────────────────────────────────────────────────────

const SectionBlock = ({ section }: { section: Section }) => (
  <div className="card mb-4">
    <div className="card-body p-4">
      {/* Section heading */}
      <div className="mb-4" style={{ paddingLeft: 12, borderLeft: "3px solid var(--primary)" }}>
        <h5 className="fw-semibold fs-17 mb-1">{section.title}</h5>
        <p className="text-muted mb-0">{section.subtitle}</p>
      </div>

      {section.subSections.map((sub, i) => (
        <SubSectionBlock key={sub.title} sub={sub} isLast={i === section.subSections.length - 1} />
      ))}
    </div>
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────────

const SettingsHome = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filteredSections = search.trim() === ""
    ? SECTIONS
    : SECTIONS
        .map((section) => ({
          ...section,
          subSections: section.subSections
            .map((sub) => ({
              ...sub,
              items: sub.items.filter(
                (item) =>
                  item.label.toLowerCase().includes(search.toLowerCase()) ||
                  item.description.toLowerCase().includes(search.toLowerCase())
              ),
            }))
            .filter((sub) => sub.items.length > 0),
        }))
        .filter((section) => section.subSections.length > 0);

  return (
    <div className="page-wrapper">
      <div className="content">
        <PageHeader
          title="Settings"
          showModuleTile={false}
          showExport={false}
          badgeCount={false}
          showClose={true}
          onClose={() => navigate(-1)}
        />

        {/* Search */}
        <div className="mb-4" style={{ maxWidth: 380 }}>
          <div className="position-relative">
            <i
              className="ti ti-search position-absolute"
              style={{ left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--body-color)", fontSize: 15, pointerEvents: "none" }}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Search settings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 36 }}
            />
          </div>
        </div>

        {/* Sections */}
        {filteredSections.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-5">
              <i className="ti ti-search-off fs-17" style={{ color: "var(--body-color)", opacity: 0.4 }} />
              <p className="text-muted mt-3 mb-0">
                No settings found for <strong>"{search}"</strong>
              </p>
            </div>
          </div>
        ) : (
          filteredSections.map((section) => (
            <SectionBlock key={section.title} section={section} />
          ))
        )}
      </div>
    </div>
  );
};

export default SettingsHome;
