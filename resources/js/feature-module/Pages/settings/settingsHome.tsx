import { Link, useNavigate } from "react-router";
import PageHeader from "../../../components/page-header/pageHeader";
import { all_routes } from "../../../routes/all_routes";

const route = all_routes;

interface SettingItem {
  label: string;
  to: string;
}

interface SettingCardProps {
  icon: string;
  iconColor: string;
  headerGradient: string;
  title: string;
  items: SettingItem[];
}

const ITEM_HEIGHT = 41;
const CARD_MIN_HEIGHT = 66 + 7 * ITEM_HEIGHT;

const SettingCard = ({ icon, iconColor, headerGradient, title, items }: SettingCardProps) => (
  <div className="col">
    <div
      style={{
        background: "#fff",
        borderRadius: 10,
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        overflow: "hidden",
        minHeight: CARD_MIN_HEIGHT,
        height: "100%",
      }}
    >
      {/* Gradient header */}
      <div
        className="d-flex align-items-center gap-2"
        style={{
          background: headerGradient,
          padding: "10px 14px",
          margin: "10px",
          borderRadius: 10,
        }}
      >
        <span
          className="d-flex align-items-center justify-content-center"
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: "#fff",
            flexShrink: 0,
            boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
          }}
        >
          <i className={`${icon} fs-15`} style={{ color: iconColor }} />
        </span>
        <span style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>{title}</span>
      </div>

      {/* Links */}
      <ul className="list-unstyled mb-0">
        {items.map(({ label, to }) => (
          <li key={label}>
            <Link
              to={to}
              style={{ display: "block", padding: "10px 16px", fontSize: 14, color: "#374151", textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#E41F07")}
              onMouseLeave={e => (e.currentTarget.style.color = "#374151")}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const CardGrid = ({ children }: { children: React.ReactNode }) => (
  <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-5 g-4">
    {children}
  </div>
);

const SettingsHome = () => {
  const navigate = useNavigate();

  return (
    <div className="page-wrapper">
      <div className="content" style={{ padding: 0 }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "1.5rem 2.5rem" }}>
          <PageHeader
            title="Settings"
            showModuleTile={false}
            showExport={false}
            badgeCount={false}
            showClose={true}
            onClose={() => navigate(-1)}
          />

          {/* Organisation Settings */}
          <div className="card border-0 rounded-0">
            <div className="card-header">
              <h5 className="mb-0">Organisation Settings</h5>
            </div>
            <div className="card-body">
              <CardGrid>

                <SettingCard
                  icon="ti ti-building"
                  iconColor="#16a34a"
                  headerGradient="linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)"
                  title="Organisation"
                  items={[
                    { label: "Profile",   to: route.profile },
                    { label: "Branding",  to: route.companySettings },
                    { label: "Locations", to: route.locations },
                  ]}
                />

                <SettingCard
                  icon="ti ti-wand"
                  iconColor="#d97706"
                  headerGradient="linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)"
                  title="Customisation"
                  items={[
                    { label: "Transaction Number Series", to: route.transactionSeriesList },
                  ]}
                />

              </CardGrid>
            </div>
          </div>

          {/* Module Settings */}
          <div className="card border-0 rounded-0 mt-3">
            <div className="card-header">
              <h5 className="mb-0">Module Settings</h5>
            </div>
            <div className="card-body">
              <CardGrid>

                <SettingCard
                  icon="ti ti-layout-list"
                  iconColor="#16a34a"
                  headerGradient="linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)"
                  title="General"
                  items={[
                    { label: "Customers and Vendors", to: "#" },
                    { label: "Items",                 to: route.projectSettings },
                  ]}
                />

                <SettingCard
                  icon="ti ti-package"
                  iconColor="#dc2626"
                  headerGradient="linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)"
                  title="Inventory"
                  items={[
                    { label: "Assemblies",            to: route.compositeItems },
                    { label: "Inventory Adjustments", to: "#" },
                    { label: "Packages",              to: "#" },
                    { label: "Shipments",             to: "#" },
                    { label: "Transfer Orders",       to: "#" },
                  ]}
                />

                <SettingCard
                  icon="ti ti-shopping-bag"
                  iconColor="#0891b2"
                  headerGradient="linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)"
                  title="Sales"
                  items={[
                    { label: "Sales Orders",      to: "#" },
                    { label: "Delivery Challans", to: "#" },
                    { label: "Invoices",          to: "#" },
                    { label: "Payments Received", to: "#" },
                    { label: "Sales Returns",     to: "#" },
                    { label: "Credit Notes",      to: "#" },
                  ]}
                />

                <SettingCard
                  icon="ti ti-receipt"
                  iconColor="#0d9488"
                  headerGradient="linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)"
                  title="Purchases"
                  items={[
                    { label: "Purchase Orders",   to: "#" },
                    { label: "Purchase Receives", to: "#" },
                    { label: "Bills",             to: "#" },
                    { label: "Payments Made",     to: "#" },
                    { label: "Vendor Credits",    to: "#" },
                  ]}
                />

              </CardGrid>
            </div>
          </div>

        </div>
      </div>

      <footer className="footer d-block d-md-flex justify-content-between text-md-start text-center">
        <p className="mb-md-0 mb-1">
          Copyright &copy;{" "}
          <Link to="#" className="link-primary text-decoration-underline">
            Femi9
          </Link>
        </p>
        <div className="d-flex align-items-center gap-2 footer-links justify-content-center justify-content-md-end">
          <Link to="#">About</Link>
          <Link to="#">Terms</Link>
          <Link to="#">Contact Us</Link>
        </div>
      </footer>
    </div>
  );
};

export default SettingsHome;
