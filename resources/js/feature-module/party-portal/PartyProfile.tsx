import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../core/redux/store";
import { setPartyAuth } from "../../core/redux/partyAuthSlice";
import { partySwitchCategory } from "../../core/services/partyAuthApi";

type Tab = "overview" | "address" | "banking";

const AVATAR_COLORS = ["#e03131", "#2f9e44", "#1971c2", "#e67700", "#7048e8", "#0c8599"];
function avatarColor(id: number) { return AVATAR_COLORS[id % AVATAR_COLORS.length]; }

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

function fmt(val: string | null | undefined): string {
  return val == null || val === "" ? "—" : val;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="d-flex align-items-center px-4 py-2">
      <span className="text-muted fs-14 flex-shrink-0" style={{ width: "45%" }}>{label}</span>
      <span className="fs-14 fw-medium">{value}</span>
    </div>
  );
}

function AddressBlock({
  label,
  address,
}: {
  label: string;
  address: Record<string, string | null> | null | undefined;
}) {
  const lines = address
    ? ([
        address.attention,
        address.street1,
        address.street2,
        [address.city, address.pin_code].filter(Boolean).join(", ") || null,
        address.state,
        address.country ?? null,
        address.phone
          ? `Phone: ${address.phone_code ? address.phone_code + " " : ""}${address.phone}`
          : null,
      ].filter(Boolean) as string[])
    : [];

  return (
    <div>
      <div
        className="fs-13 fw-semibold text-uppercase mb-2"
        style={{ color: "#6c757d", letterSpacing: "0.04em" }}
      >
        {label}
      </div>
      {lines.length > 0 ? (
        <div className="fs-14 text-muted" style={{ lineHeight: 1.9 }}>
          {lines.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      ) : (
        <span className="fs-14 text-muted">No {label.toLowerCase()}</span>
      )}
    </div>
  );
}

const PartyProfile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.partyAuth);

  const [activeTab,   setActiveTab]   = useState<Tab>("overview");
  const [listSearch,  setListSearch]  = useState("");
  const [switchingId, setSwitchingId] = useState<number | null>(null);

  if (!user) return null;

  const avatarUrl     = (user as any).avatar_url ?? null;
  const partyInitials = user.party_name ? initials(user.party_name) : initials(user.name);
  const avatarBg      = avatarColor(user.id);
  const hasBanking    = user.account_number || user.ifsc_code || user.upi_number;

  // ── Left panel: filter party accounts by search ──────────────────────────
  const filteredAccounts = user.categories.filter((c) => {
    const q = listSearch.toLowerCase();
    return (
      !q ||
      c.party_name?.toLowerCase().includes(q) ||
      c.category_name?.toLowerCase().includes(q)
    );
  });

  // ── Switch to a different party account ──────────────────────────────────
  const handleSwitch = async (partyUserId: number) => {
    if (switchingId !== null) return;
    if (partyUserId === user.id) return; // already active
    setSwitchingId(partyUserId);
    try {
      const result = await partySwitchCategory(partyUserId);
      if (result.success) {
        localStorage.setItem("party_auth_token", result.token);
        dispatch(setPartyAuth({ user: result.user, token: result.token }));
      }
    } finally {
      setSwitchingId(null);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "address",  label: "Address"  },
    ...(hasBanking ? [{ key: "banking" as Tab, label: "Banking Details" }] : []),
  ];

  return (
    <div
      style={{
        height: "calc(100vh - 108px)",
        minHeight: "unset",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", flex: 1, overflow: "hidden", border: "1px solid #dee2e6", borderRadius: 10, background: "#fff" }}>

        {/* ── Left panel ────────────────────────────────────────────────────── */}
        <div
          className="d-none d-xl-flex"
          style={{
            width: 340,
            minWidth: 340,
            flexDirection: "column",
            borderRight: "1px solid #dee2e6",
            background: "#fff",
            overflow: "hidden",
          }}
        >
          {/* Search */}
          <div className="px-3 py-3" style={{ borderBottom: "1px solid #dee2e6", flexShrink: 0 }}>
            <div className="input-group">
              <span className="input-group-text border-end-0 bg-white">
                <i className="ti ti-search text-muted fs-13" />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search accounts…"
                value={listSearch}
                onChange={(e) => setListSearch(e.target.value)}
              />
              {listSearch && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-light border-start-0"
                  onClick={() => setListSearch("")}
                >
                  <i className="ti ti-x fs-12 text-muted" />
                </button>
              )}
            </div>
          </div>

          {/* Account list */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {filteredAccounts.length === 0 ? (
              <div className="text-center py-4 text-muted fs-13">
                <i className="ti ti-mood-empty d-block fs-24 mb-1" />
                No accounts found
              </div>
            ) : (
              filteredAccounts.map((cat) => {
                const isActive    = cat.party_user_id === user.id;
                const isSwitching = switchingId === cat.party_user_id;
                const bg          = avatarColor(cat.party_id);
                const ini         = cat.party_name ? initials(cat.party_name) : "?";
                return (
                  <div
                    key={cat.party_user_id}
                    className="d-flex align-items-center gap-2 px-3"
                    style={{
                      paddingTop: 11,
                      paddingBottom: 11,
                      borderBottom: "1px solid #f5f5f5",
                      cursor: isActive ? "default" : "pointer",
                      background: isActive ? "#fff1f0" : "transparent",
                      opacity: isSwitching ? 0.6 : 1,
                    }}
                    onClick={() => !isActive && handleSwitch(cat.party_user_id)}
                    onMouseEnter={(e) => {
                      if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "#f8f9fa";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background = isActive ? "#fff1f0" : "transparent";
                    }}
                  >
                    {/* Avatar */}
                    <div
                      className="rounded d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 28, height: 28, background: bg }}
                    >
                      <span style={{ color: "#fff", fontWeight: 700, fontSize: 11 }}>{ini}</span>
                    </div>

                    {/* Name + category */}
                    <div className="flex-grow-1 overflow-hidden">
                      <span
                        className="d-block text-truncate"
                        style={{
                          fontSize: 14,
                          fontWeight: isActive ? 600 : 400,
                          color: isActive ? "#e03131" : "#212529",
                        }}
                      >
                        {cat.party_name ?? "—"}
                      </span>
                      {cat.category_name && (
                        <span className="d-block text-truncate fs-12 text-muted">
                          {cat.category_name}
                        </span>
                      )}
                    </div>

                    {/* Spinner while switching */}
                    {isSwitching && (
                      <span
                        className="spinner-border spinner-border-sm flex-shrink-0"
                        style={{ width: 14, height: 14, borderWidth: 2, color: "#e03131" }}
                      />
                    )}

                    {/* Active indicator */}
                    {isActive && !isSwitching && (
                      <i className="ti ti-check flex-shrink-0 fs-13" style={{ color: "#e03131" }} />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right panel ───────────────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <div style={{ padding: "1.25rem" }}>

            {/* ── Header ── */}
            <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
              <div className="d-flex align-items-start gap-3">
                {/* Avatar */}
                <div
                  className="rounded border d-flex align-items-center justify-content-center flex-shrink-0 overflow-hidden"
                  style={{ width: 56, height: 56, background: avatarUrl ? "#f5f5f5" : avatarBg }}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={user.party_name ?? user.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>{partyInitials}</span>
                  )}
                </div>

                {/* Name + badges */}
                <div>
                  <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                    <h4 className="fw-bold mb-0 lh-sm">{user.party_name ?? user.name}</h4>
                    <span className="badge badge-soft-success d-inline-flex align-items-center gap-1 fs-12">
                      <span
                        style={{
                          width: 7, height: 7, borderRadius: "50%",
                          flexShrink: 0, background: "#12b76a", display: "inline-block",
                        }}
                      />
                      Active
                    </span>
                  </div>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    {user.party_code && (
                      <span className="badge fs-12" style={{ background: "#f1f3f5", color: "#6c757d" }}>
                        {user.party_code}
                      </span>
                    )}
                    {user.category_name && (
                      <span className="badge fs-12" style={{ background: "#f1f3f5", color: "#6c757d" }}>
                        {user.category_name}
                      </span>
                    )}
                    {user.party_type && (
                      <span
                        className={`badge fs-12 ${user.party_type === "individual" ? "badge-soft-secondary" : "badge-soft-primary"}`}
                      >
                        {user.party_type === "individual" ? "Customer" : "Business"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Tab nav ── */}
            <div className="mb-4 scrollbar-hidden" style={{ overflowX: "auto" }}>
              <div className="d-inline-flex rounded" style={{ background: "#f1f3f5", padding: 4, gap: 2 }}>
                {tabs.map((t) => {
                  const isActive = activeTab === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setActiveTab(t.key)}
                      style={{
                        padding: "6px 20px", borderRadius: 6, border: "none",
                        background: isActive ? "#fff" : "transparent",
                        color: isActive ? "#e03131" : "#6c757d",
                        fontWeight: isActive ? 600 : 400,
                        fontSize: 14,
                        boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
                        transition: "all 0.15s", cursor: "pointer", whiteSpace: "nowrap",
                      }}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ══ Tab: Overview ══════════════════════════════════════════════ */}
            {activeTab === "overview" && (
              <div>
                <div className="card border mb-3">
                  <div className="card-body p-0">
                    <div className="px-4 py-3 border-bottom">
                      <h6 className="fw-semibold fs-15 mb-0">Party Information</h6>
                    </div>
                    <div className="row g-0 pt-2 pb-1">
                      <div className="col-md-6">
                        <InfoRow
                          label="Name"
                          value={<span className="text-primary">{user.party_name ?? user.name}</span>}
                        />
                        {user.party_type && (
                          <InfoRow
                            label="Type"
                            value={
                              <span
                                className={`badge fs-12 ${
                                  user.party_type === "individual"
                                    ? "badge-soft-secondary"
                                    : "badge-soft-primary"
                                }`}
                              >
                                {user.party_type === "individual" ? "Customer" : "Business"}
                              </span>
                            }
                          />
                        )}
                        <InfoRow
                          label="Email"
                          value={
                            user.email ? (
                              <a href={`mailto:${user.email}`} className="text-primary text-decoration-none">
                                {user.email}
                              </a>
                            ) : (
                              <span className="text-muted">—</span>
                            )
                          }
                        />
                        <InfoRow label="Phone" value={fmt(user.mobile)} />
                      </div>
                      <div className="col-md-6">
                        {user.party_code && <InfoRow label="Party ID" value={user.party_code} />}
                        <InfoRow label="Contact Person" value={fmt(user.name)} />
                        {user.category_name && (
                          <InfoRow label="Distribution Category" value={user.category_name} />
                        )}
                        <InfoRow
                          label="Portal Status"
                          value={
                            <span className="badge badge-soft-success fs-12 d-inline-flex align-items-center gap-1">
                              <span
                                style={{
                                  width: 7, height: 7, borderRadius: "50%",
                                  background: "#12b76a", display: "inline-block",
                                }}
                              />
                              Enabled
                            </span>
                          }
                        />
                        <InfoRow
                          label="Status"
                          value={
                            <span className="badge badge-soft-success fs-12 d-inline-flex align-items-center gap-1">
                              <span
                                style={{
                                  width: 7, height: 7, borderRadius: "50%",
                                  background: "#12b76a", display: "inline-block",
                                }}
                              />
                              Active
                            </span>
                          }
                        />
                      </div>
                    </div>

                    {user.last_login_at && (
                      <div
                        className="d-flex align-items-center px-4 py-3 border-top"
                        style={{ background: "#fafafa", borderRadius: "0 0 8px 8px" }}
                      >
                        <span className="text-muted fs-14 flex-shrink-0" style={{ width: "22.5%" }}>
                          Last Login
                        </span>
                        <span className="fs-14 fw-medium">
                          {(() => {
                            const d = new Date(user.last_login_at!);
                            return (
                              d.toLocaleDateString("en-IN", {
                                day: "2-digit", month: "long", year: "numeric",
                              }) +
                              ", " +
                              d.toLocaleTimeString("en-IN", {
                                hour: "2-digit", minute: "2-digit", hour12: true,
                              })
                            );
                          })()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Locations summary */}
                {user.locations.length > 0 && (
                  <div className="card border mb-3">
                    <div className="card-body p-0">
                      <div className="px-4 py-3 border-bottom d-flex align-items-center">
                        <h6 className="fw-semibold fs-15 mb-0">
                          Assigned Locations
                          <span className="badge badge-soft-primary fs-11 ms-2">
                            {user.locations.length}
                          </span>
                        </h6>
                      </div>
                      <div className="px-3 py-3">
                        <div className="table-responsive">
                          <table className="table table-sm mb-0" style={{ fontSize: 13 }}>
                            <thead>
                              <tr style={{ background: "#f8f9fa" }}>
                                <th className="fw-medium text-muted border-0 py-2 ps-3">Name</th>
                                <th className="fw-medium text-muted border-0 py-2">Type</th>
                                <th className="fw-medium text-muted border-0 py-2">Primary</th>
                              </tr>
                            </thead>
                            <tbody>
                              {user.locations.map((loc) => (
                                <tr key={loc.id}>
                                  <td className="py-2 ps-3 fw-medium">{loc.org_name ?? loc.name}</td>
                                  <td className="py-2 text-muted text-capitalize">{loc.type ?? "—"}</td>
                                  <td className="py-2">
                                    {loc.is_primary ? (
                                      <span className="badge badge-soft-success fs-11">Primary</span>
                                    ) : (
                                      <span className="badge badge-soft-secondary fs-11">Secondary</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══ Tab: Address ══════════════════════════════════════════════ */}
            {activeTab === "address" && (
              <div>
                {user.locations.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="ti ti-map-pin fs-40 d-block mb-3 opacity-50" />
                    <h6 className="fw-semibold mb-1">No Locations</h6>
                    <p className="fs-14 mb-0">No locations have been assigned to your account yet.</p>
                  </div>
                ) : (
                  user.locations.map((loc) => (
                    <div key={loc.id} className="card border mb-3">
                      <div className="card-body p-0">
                        <div className="px-4 py-3 border-bottom d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center gap-2">
                            <h6 className="fw-semibold fs-15 mb-0">{loc.org_name ?? loc.name}</h6>
                            {loc.org_name && (
                              <span className="text-muted fs-13">({loc.name})</span>
                            )}
                          </div>
                          {loc.is_primary && (
                            <span className="badge badge-soft-success fs-11">Primary</span>
                          )}
                        </div>
                        <div className="row g-0 pt-3 pb-3">
                          <div className="col-md-6 px-4" style={{ borderRight: "1px solid #f1f3f5" }}>
                            <AddressBlock label="Billing Address" address={loc.address} />
                          </div>
                          <div className="col-md-6 px-4">
                            <AddressBlock label="Shipping Address" address={loc.shipping_address} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ══ Tab: Banking Details ══════════════════════════════════════ */}
            {activeTab === "banking" && (
              <div className="card border mb-3">
                <div className="card-body p-0">
                  <div className="px-4 py-3 border-bottom">
                    <h6 className="fw-semibold fs-15 mb-0">Banking Details</h6>
                  </div>
                  <div className="row g-0 pt-2 pb-1">
                    <div className="col-md-6">
                      <InfoRow label="Account Number" value={fmt(user.account_number)} />
                      <InfoRow label="IFSC Code"      value={fmt(user.ifsc_code)} />
                      <InfoRow label="UPI Number"     value={fmt(user.upi_number)} />
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default PartyProfile;
