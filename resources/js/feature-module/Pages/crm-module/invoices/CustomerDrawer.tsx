import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import { fetchPartyDetail, type PartyDetail } from "../../../../core/services/partyApi";
import { fetchInvoices, type InvoiceListItem } from "../../../../core/services/invoiceApi";

function storageSrc(path: string | null | undefined): string | null {
  if (!path) return null;
  return path.startsWith("http") || path.startsWith("/") ? path : `/storage/${path}`;
}

// ── Types ──────────────────────────────────────────────────────────────────────

type DrawerTab = "overview" | "transactions" | "activity";

interface ActivityLogEntry {
  id:           number;
  event_type:   string;
  subject_type: string;
  subject_id:   number;
  related_type: string | null;
  related_id:   number | null;
  amount:       string | null;
  metadata:     Record<string, unknown> | null;
  performed_by: number | null;
  created_at:   string;
  performer:    { id: number; name: string } | null;
}

// ── Activity helpers ──────────────────────────────────────────────────────────

const fmtAmt = (v: unknown) =>
  typeof v === "number" ? `₹${v.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "";

function activityMessage(entry: ActivityLogEntry): string {
  const m = entry.metadata ?? {};
  switch (entry.event_type) {
    case "invoice_created":
      return `Invoice ${m.invoice_number} of ${fmtAmt(m.grand_total)} created`;
    case "invoice_updated":
      return `Invoice ${m.invoice_number} updated`;
    case "invoice_voided":
      return `Invoice ${m.invoice_number} voided`;
    case "invoice_sent":
      return `Invoice ${m.invoice_number} marked as Sent`;
    case "invoice_paid":
      return `Invoice ${m.invoice_number} fully paid`;
    case "invoice_partially_paid":
      return `Invoice ${m.invoice_number} partially paid — ${fmtAmt(m.total_paid)} received, ${fmtAmt(m.balance_amount)} remaining`;
    case "payment_received":
      return `Payment ${m.payment_number} of ${fmtAmt(m.amount)} received via ${String(m.payment_mode ?? "").replace("_", " ")}`;
    case "payment_deleted":
      return `Payment ${m.payment_number} of ${fmtAmt(m.amount)} deleted`;
    case "payment_applied":
      return `Payment ${m.payment_number} of ${fmtAmt(m.applied_amount)} applied to ${m.invoice_number}`;
    case "payment_unapplied":
      return `Payment ${m.payment_number} unapplied from ${m.invoice_number}`;
    default:
      return entry.event_type.replace(/_/g, " ");
  }
}

function activityIcon(eventType: string): { icon: string; color: string; bg: string } {
  switch (eventType) {
    case "invoice_created":    return { icon: "ti-plus",         color: "#6c757d", bg: "#f1f3f5" };
    case "invoice_updated":    return { icon: "ti-pencil",        color: "#6c757d", bg: "#f1f3f5" };
    case "invoice_sent":       return { icon: "ti-send",          color: "#1971c2", bg: "#e7f5ff" };
    case "invoice_paid":       return { icon: "ti-circle-check",  color: "#2f9e44", bg: "#ebfbee" };
    case "invoice_partially_paid": return { icon: "ti-coin",     color: "#e67700", bg: "#fff3bf" };
    case "invoice_voided":     return { icon: "ti-ban",           color: "#c92a2a", bg: "#fff0f0" };
    case "payment_received":   return { icon: "ti-cash",          color: "#2f9e44", bg: "#ebfbee" };
    case "payment_deleted":    return { icon: "ti-trash",         color: "#c92a2a", bg: "#fff0f0" };
    case "payment_applied":    return { icon: "ti-arrow-right",   color: "#1971c2", bg: "#e7f5ff" };
    case "payment_unapplied":  return { icon: "ti-arrow-back",    color: "#e67700", bg: "#fff3bf" };
    default:                   return { icon: "ti-activity",      color: "#6c757d", bg: "#f1f3f5" };
  }
}

function fmtDate(iso: string): { dateStr: string; timeStr: string } {
  const d = new Date(iso);
  const dateStr = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }).toUpperCase();
  return { dateStr, timeStr };
}

function statusBadge(status: string): { label: string; cls: string } {
  switch (status) {
    case "paid":           return { label: "Paid",           cls: "badge-soft-success" };
    case "partially_paid": return { label: "Partially Paid", cls: "badge-soft-warning" };
    case "sent":           return { label: "Sent",           cls: "badge-soft-danger"  };
    case "draft":          return { label: "Draft",          cls: "badge-soft-secondary" };
    case "overdue":        return { label: "Overdue",        cls: "badge-soft-danger"  };
    default:               return { label: status,           cls: "badge-soft-secondary" };
  }
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS: { key: DrawerTab; label: string }[] = [
  { key: "overview",     label: "Overview"        },
  { key: "transactions", label: "Unpaid Invoices"  },
  { key: "activity",     label: "Activity"         },
];

// ── Props ─────────────────────────────────────────────────────────────────────

interface CustomerDrawerProps {
  customerId:   number;
  customerName: string;
  onClose:      () => void;
}

// ── Main component ────────────────────────────────────────────────────────────

const CustomerDrawer = ({ customerId, customerName, onClose }: CustomerDrawerProps) => {
  const navigate = useNavigate();

  const [visible,   setVisible]   = useState(false);
  const [detail,    setDetail]    = useState<PartyDetail | null>(null);
  const [activeTab, setActiveTab] = useState<DrawerTab>("overview");
  const closingRef = useRef(false);

  // Unpaid invoices
  const [invoices,        setInvoices]        = useState<InvoiceListItem[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);

  // Activity
  const [activity,        setActivity]        = useState<ActivityLogEntry[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  // Animate in
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  // Fetch party detail
  useEffect(() => {
    fetchPartyDetail(customerId).then((res) => {
      if (res.success) setDetail(res.data);
    });
  }, [customerId]);

  // Fetch unpaid invoices on mount (used by both overview and transactions tab)
  useEffect(() => {
    setInvoicesLoading(true);
    fetchInvoices({ customer_id: customerId, per_page: 100 }).then((res) => {
      if (res.success) {
        setInvoices(res.data.data.filter((inv) => parseFloat(inv.balance_amount) > 0));
      }
    }).finally(() => setInvoicesLoading(false));
  }, [customerId]);

  // Fetch activity when tab opens
  // Filter out derived/redundant events that are always a side-effect of another logged event:
  //   payment_applied      → always paired with payment_received
  //   invoice_partially_paid / invoice_paid → always paired with payment_applied
  const HIDDEN_EVENTS = new Set(["payment_applied", "invoice_partially_paid", "invoice_paid"]);

  useEffect(() => {
    if (activeTab !== "activity") return;
    setActivityLoading(true);
    axios.get<{ success: boolean; data: { data: ActivityLogEntry[] } }>(
      `/api/parties/${customerId}/activity`,
      { params: { per_page: 100 } }
    ).then((res) => {
      if (res.data.success) {
        setActivity(res.data.data.data.filter(e => !HIDDEN_EVENTS.has(e.event_type)));
      }
    }).catch(() => {}).finally(() => setActivityLoading(false));
  }, [activeTab, customerId]);

  const handleClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setVisible(false);
    setTimeout(onClose, 260);
  }, [onClose]);

  // ESC key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [handleClose]);

  const imgSrc = storageSrc(detail?.party_image);
  const phone  = detail?.mobile
    ? `${detail.mobile_code ? detail.mobile_code + " " : ""}${detail.mobile}`
    : detail?.work_phone
      ? `${detail.work_phone_code ? detail.work_phone_code + " " : ""}${detail.work_phone}`
      : null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)",
          zIndex: 1040, opacity: visible ? 1 : 0, transition: "opacity 0.25s ease",
        }}
      />

      {/* Panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: "min(420px, 100vw)", background: "#fff", zIndex: 1050,
        display: "flex", flexDirection: "column",
        transform: visible ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.26s ease",
        boxShadow: "-4px 0 24px rgba(0,0,0,0.10)",
      }}>

        {/* ── Header ── */}
        <div style={{ padding: "1.25rem", borderBottom: "1px solid #dee2e6", flexShrink: 0 }}>
          <div className="d-flex align-items-start gap-3">
            <div
              className="rounded border d-flex align-items-center justify-content-center flex-shrink-0 overflow-hidden"
              style={{ width: 56, height: 56, background: "#f5f5f5" }}
            >
              {imgSrc
                ? <img src={imgSrc} alt={customerName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <i className="ti ti-user fs-24 text-muted" />
              }
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <h4
                className="fw-bold mb-1 lh-sm text-truncate"
                style={{ cursor: "pointer", color: "#212529", transition: "color 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#E41F07")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#212529")}
                onClick={() => { setVisible(false); setTimeout(() => { onClose(); navigate(`/distributors/${customerId}`); }, 260); }}
              >
                {customerName}
              </h4>
              <div className="d-flex align-items-center gap-2 fs-14 text-muted">
                <i className="ti ti-phone fs-14 flex-shrink-0" />
                <span>{phone ?? "—"}</span>
              </div>
              {detail?.distribution_category && (
                <div className="d-flex align-items-center gap-2 fs-14 text-muted mt-1">
                  <i className="ti ti-tag fs-14 flex-shrink-0" />
                  <span className="text-truncate">
                    {detail.distribution_category.name}
                    {detail.distribution_sub_category ? ` · ${detail.distribution_sub_category.name}` : ""}
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              className="btn btn-outline-light d-flex align-items-center justify-content-center shadow flex-shrink-0"
              style={{ height: 36, width: 36 }}
              onClick={handleClose}
              title="Close"
            >
              <i className="ti ti-x" style={{ fontSize: 16 }} />
            </button>
          </div>
        </div>

        {/* ── Tab switcher ── */}
        <div style={{ padding: "1rem 1.25rem", flexShrink: 0 }}>
          <div className="d-flex rounded" style={{ background: "#f1f3f5", padding: 4, gap: 2 }}>
            {TABS.map((t) => {
              const isActive = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setActiveTab(t.key)}
                  style={{
                    flex: 1, padding: "6px 12px", borderRadius: 6, border: "none",
                    background: isActive ? "#fff" : "transparent",
                    color: isActive ? "#e03131" : "#6c757d",
                    fontWeight: isActive ? 600 : 400, fontSize: 14,
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

        {/* ── Tab content ── */}
        <div style={{ flex: 1, overflowY: "auto" }}>

          {/* ── Overview ── */}
          {activeTab === "overview" && (
            <div style={{ padding: "1.25rem" }}>

              {/* Receivables card */}
              <div style={{ border: "1px solid #dee2e6", borderRadius: 8, overflow: "hidden", display: "flex" }}>
                <div className="d-flex flex-column align-items-center justify-content-center text-center"
                  style={{ flex: 1, padding: "20px 16px" }}>
                  <i className="ti ti-alert-triangle mb-2" style={{ fontSize: 28, color: "#f79009" }} />
                  <span className="fs-13 text-muted mb-1">Pending Payment</span>
                  <span className="fw-bold" style={{ fontSize: 20, color: "#212529" }}>
                    {detail
                      ? `₹${invoices.reduce((s, i) => s + parseFloat(i.balance_amount), 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                      : "₹0.00"}
                  </span>
                </div>
                <div style={{ width: 1, background: "#dee2e6", flexShrink: 0 }} />
                <div className="d-flex flex-column align-items-center justify-content-center text-center"
                  style={{ flex: 1, padding: "20px 16px" }}>
                  <i className="ti ti-circle-check mb-2" style={{ fontSize: 28, color: "#12b76a" }} />
                  <span className="fs-13 text-muted mb-1">Unused Credits</span>
                  <span className="fw-bold" style={{ fontSize: 20, color: "#212529" }}>₹0.00</span>
                </div>
              </div>

              {/* Contact Persons */}
              {detail && (
                <div style={{ border: "1px solid #dee2e6", borderRadius: 8, overflow: "hidden", marginTop: 16 }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid #dee2e6", background: "#fafafa" }}>
                    <div className="d-flex align-items-center gap-2">
                      <span className="fw-semibold fs-14">Contact Persons</span>
                      {(detail.contact_persons?.length ?? 0) > 0 && (
                        <span className="badge rounded-pill" style={{ background: "#e9ecef", color: "#495057", fontSize: 11 }}>
                          {detail.contact_persons!.length}
                        </span>
                      )}
                    </div>
                  </div>
                  {!detail.contact_persons || detail.contact_persons.length === 0 ? (
                    <div className="d-flex flex-column align-items-center justify-content-center text-muted"
                      style={{ padding: "24px 16px", gap: 6 }}>
                      <i className="ti ti-users fs-22" />
                      <span className="fs-13">No contact persons</span>
                    </div>
                  ) : detail.contact_persons.map((cp, i) => {
                    const cpPhone = cp.mobile
                      ? `${cp.mobile_code ? cp.mobile_code + " " : ""}${cp.mobile}` : null;
                    return (
                      <div key={i} className="d-flex align-items-center gap-3"
                        style={{ padding: "12px 16px", borderTop: i > 0 ? "1px solid #f1f3f5" : undefined }}>
                        <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{ width: 36, height: 36, background: "#f1f3f5", color: "#495057", fontWeight: 600, fontSize: 14 }}>
                          {(cp.name ?? "?").charAt(0).toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div className="fs-14 fw-medium text-truncate">{cp.name}</div>
                          {cpPhone && (
                            <div className="d-flex align-items-center gap-1 text-muted fs-13 mt-1">
                              <i className="ti ti-phone fs-12" /><span>{cpPhone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Address cards */}
              {detail && (
                <div className="d-flex flex-column gap-3 mt-3">
                  {([
                    { label: "Billing Address",  address: detail.billing_address,  icon: "ti-file-invoice" },
                    { label: "Shipping Address", address: detail.shipping_address, icon: "ti-truck" },
                  ] as const).map(({ label, address, icon }) => {
                    const lines = address ? [
                      address.attention, address.street1, address.street2,
                      [address.city, address.pin_code].filter(Boolean).join(", ") || null,
                      address.state, address.country?.name ?? null,
                    ].filter(Boolean) as string[] : [];
                    return (
                      <div key={label} style={{ border: "1px solid #dee2e6", borderRadius: 8, overflow: "hidden" }}>
                        <div style={{ padding: "10px 14px", borderBottom: "1px solid #dee2e6", background: "#fafafa" }}>
                          <div className="d-flex align-items-center gap-2">
                            <i className={`ti ${icon} fs-14 text-muted`} />
                            <span className="fw-semibold fs-13">{label}</span>
                          </div>
                        </div>
                        <div style={{ padding: "12px 14px" }}>
                          {lines.length > 0 ? (
                            <div className="fs-13 text-muted" style={{ lineHeight: 1.8 }}>
                              {lines.map((l, i) => <div key={i}>{l}</div>)}
                            </div>
                          ) : (
                            <div className="d-flex flex-column align-items-center justify-content-center text-muted"
                              style={{ padding: "12px 0", gap: 6 }}>
                              <i className="ti ti-map-pin fs-22" />
                              <span className="fs-13">No address</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Unpaid Invoices ── */}
          {activeTab === "transactions" && (
            <div style={{ padding: "1.25rem" }}>
              <div className="mb-3">
                <h6 className="fw-semibold mb-0 fs-15">Unpaid Invoices</h6>
                {!invoicesLoading && (
                  <span className="fs-13 text-muted">{invoices.length} record{invoices.length !== 1 ? "s" : ""}</span>
                )}
              </div>

              {invoicesLoading ? (
                <div className="d-flex justify-content-center py-5">
                  <span className="spinner-border text-danger" role="status" />
                </div>
              ) : invoices.length === 0 ? (
                <div className="d-flex flex-column align-items-center justify-content-center text-muted" style={{ padding: "48px 0", gap: 8 }}>
                  <i className="ti ti-circle-check fs-36" style={{ color: "#2f9e44" }} />
                  <span className="fs-14" style={{ color: "#2f9e44" }}>No unpaid invoices</span>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {invoices.map((inv) => {
                    const badge = statusBadge(inv.status);
                    return (
                      <div key={inv.id} className="card border" style={{ borderRadius: 10 }}>
                        <div className="card-body" style={{ padding: "16px 18px" }}>
                          <div className="d-flex align-items-start justify-content-between gap-3 mb-2">
                            <span className="fw-semibold fs-15" style={{ color: "#212529" }}>{inv.invoice_number}</span>
                            <div className="text-end flex-shrink-0">
                              <div className="fs-13 fw-medium" style={{ color: "#495057" }}>
                                {inv.invoice_date
                                  ? new Date(inv.invoice_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                                  : "—"}
                              </div>
                              {inv.due_date && (
                                <div className="fs-12 text-muted">
                                  Due: {new Date(inv.due_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="d-flex align-items-center justify-content-between">
                            <div>
                              <div className="fs-13 text-muted">Balance Due</div>
                              <div className="fw-bold fs-16" style={{ color: "#c92a2a" }}>
                                ₹{parseFloat(inv.balance_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                              </div>
                            </div>
                            <span className={`badge ${badge.cls} fs-12`}>{badge.label}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Activity ── */}
          {activeTab === "activity" && (
            <div style={{ padding: "1.25rem" }}>
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                  <h6 className="fw-semibold mb-0 fs-15">Activity History</h6>
                  {!activityLoading && (
                    <span className="fs-13 text-muted">{activity.length} {activity.length === 1 ? "record" : "records"}</span>
                  )}
                </div>
              </div>

              {activityLoading ? (
                <div className="text-center py-5 text-muted">
                  <span className="spinner-border spinner-border-sm text-primary me-2" />
                  <span className="fs-14">Loading history…</span>
                </div>
              ) : activity.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="ti ti-history fs-36 d-block mb-2" />
                  <p className="fs-14 mb-0">No activity recorded yet.</p>
                </div>
              ) : (
                <div style={{ position: "relative", paddingLeft: 52 }}>
                  {/* Continuous spine */}
                  <div style={{ position: "absolute", left: 17, top: 0, bottom: 0, width: 2, background: "#e9ecef", zIndex: 0 }} />

                  {activity.map((log, idx) => {
                    const { icon } = activityIcon(log.event_type);
                    const { dateStr, timeStr } = fmtDate(log.created_at);
                    const actorName = log.performer?.name ?? "System";
                    const isLast = idx === activity.length - 1;
                    return (
                      <div key={log.id} style={{ position: "relative", marginBottom: isLast ? 0 : 20 }}>

                        {/* Red icon circle */}
                        <div style={{
                          position: "absolute", left: -52,
                          top: "50%", transform: "translateY(-50%)",
                          width: 36, height: 36, borderRadius: "50%",
                          background: "#fff4f4", border: "1.5px solid #e03131",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          zIndex: 1,
                        }}>
                          <i className={`ti ${icon}`} style={{ fontSize: 14, color: "#e03131" }} />
                        </div>

                        {/* Card */}
                        <div className="card border" style={{ borderRadius: 10 }}>
                          <div className="card-body" style={{ padding: "18px 20px" }}>

                            {/* Title + date */}
                            <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                              <span className="fw-semibold fs-15" style={{ color: "#212529" }}>{activityMessage(log)}</span>
                              <div className="text-end flex-shrink-0">
                                <div className="fs-13 fw-medium" style={{ color: "#495057" }}>{dateStr}</div>
                                <div className="fs-12 text-muted">{timeStr}</div>
                              </div>
                            </div>

                            {/* Actor */}
                            <div className="d-flex align-items-center gap-2 border-top pt-3">
                              <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 fw-semibold"
                                style={{ width: 24, height: 24, background: "#f1f3f5", fontSize: 11, color: "#6c757d" }}>
                                {actorName.charAt(0).toUpperCase()}
                              </div>
                              <span className="fs-13 text-muted">{actorName}</span>
                            </div>

                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>,
    document.body
  );
};

export default CustomerDrawer;
