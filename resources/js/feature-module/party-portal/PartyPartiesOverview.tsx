import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useSelector } from "react-redux";
import { Toast } from "react-bootstrap";
import ConfirmDialog, { type ConfirmConfig } from "../../components/confirm-dialog/ConfirmDialog";
import {
  getPartyPage, getPartyFullDetail, readPartyFullDetail,
  getPartyAuditLogs, readPartyAuditLogs,
  bustParty, bustAllPartyCache,
  type PartyListItem, type PartyDetail,
} from "../../core/cache/partyCache";
import { emitMutation, onMutation } from "../../core/cache/mutationEvents";
import { destroyParty, togglePartyStatus, restoreParty } from "../../core/services/partyApi";
import { type AuditLogEntry } from "../../core/services/auditLogApi";
import { fetchDistributionCategories } from "../../core/services/distributionCategoryApi";
import type { RootState } from "../../core/redux/store";

type Tab = "overview" | "history";

const PANEL_PER_PAGE = 50;

const PAYMENT_LABELS: Record<string, string> = {
  due_on_receipt: "Due on Receipt",
  net_15: "Net 15", net_30: "Net 30",
  net_45: "Net 45", net_60: "Net 60", net_90: "Net 90",
};

const LANG_LABELS: Record<string, string> = {
  english: "English", hindi: "Hindi", tamil: "Tamil", telugu: "Telugu",
};

function storageSrc(path: string | null | undefined): string | null {
  if (!path) return null;
  return path.startsWith("http") || path.startsWith("/") ? path : `/storage/${path}`;
}

function fmt(val: any): string {
  return val === null || val === undefined || val === "" ? "—" : String(val);
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const utc = iso.replace(" ", "T").replace(/Z$|[+-]\d{2}:\d{2}$/, "");
  const d = new Date(utc);
  return (
    d.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) +
    ", " +
    d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="d-flex align-items-center px-4 py-2">
      <span className="text-muted fs-14 flex-shrink-0" style={{ width: "45%" }}>{label}</span>
      <span className="fs-14 fw-medium">{value}</span>
    </div>
  );
}

function AddressLines({ address }: { address: PartyDetail["billing_address"] }) {
  const lines = address
    ? [
        address.attention,
        address.street1,
        address.street2,
        [address.city, address.pin_code].filter(Boolean).join(", ") || null,
        address.state,
        address.country?.name ?? null,
        address.phone
          ? `Phone: ${address.phone_code ? address.phone_code + " " : ""}${address.phone}`
          : null,
      ].filter(Boolean) as string[]
    : [];

  if (lines.length === 0) return <span className="fs-14 text-muted">—</span>;
  return (
    <div className="fs-14 text-muted" style={{ lineHeight: 1.9 }}>
      {lines.map((l, i) => <div key={i}>{l}</div>)}
    </div>
  );
}

const PartyPartiesOverview = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const partyAuthUser = useSelector((state: RootState) => state.partyAuth.user);

  // ── Tab state ───────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // ── Left panel state ────────────────────────────────────────────────────────
  const [panelItems,    setPanelItems]    = useState<PartyListItem[]>([]);
  const [panelPage,     setPanelPage]     = useState(1);
  const [panelHasMore,  setPanelHasMore]  = useState(false);
  const [panelLoading,  setPanelLoading]  = useState(false);
  const [listSearch,    setListSearch]    = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [listFilter,     setListFilter]     = useState<"active" | "deleted">("active");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [categoryOpts,   setCategoryOpts]   = useState<{ value: string; label: string }[]>();
  const searchTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelScrollRef = useRef<HTMLDivElement>(null);
  const activeItemRef  = useRef<HTMLDivElement>(null);

  // ── Right panel state ───────────────────────────────────────────────────────
  const [party,   setParty]   = useState<PartyDetail | null>(() => {
    const n = Number(id);
    return !id || isNaN(n) ? null : readPartyFullDetail(n) ?? null;
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const detailFetchRef = useRef(0);

  // ── Audit log state ─────────────────────────────────────────────────────────
  const [auditLogs,     setAuditLogs]     = useState<AuditLogEntry[]>([]);
  const [auditLoading,  setAuditLoading]  = useState(false);
  const [auditPage,     setAuditPage]     = useState(1);
  const [auditLastPage, setAuditLastPage] = useState(1);
  const [auditTotal,    setAuditTotal]    = useState(0);
  const [lightboxSrc,   setLightboxSrc]   = useState<string | null>(null);

  // ── Actions state ───────────────────────────────────────────────────────────
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);
  const [refreshing,    setRefreshing]    = useState(false);
  const refreshingRef = useRef(false);

  // ── Toast ───────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<{ show: boolean; type: "success" | "danger"; message: string }>({
    show: false, type: "success", message: "",
  });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (type: "success" | "danger", message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, type, message });
    toastTimerRef.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 4000);
  };
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  // ── Load category options (restricted to party user's allowed categories) ──
  useEffect(() => {
    fetchDistributionCategories().then(r => {
      if (!r.success) return;
      let opts = r.data.map(c => ({ value: String(c.id), label: c.name }));
      const permIds = partyAuthUser?.permissions?.parties?.others_data?.party_category_ids;
      let allowed: number[] | null;
      if (Array.isArray(permIds) && permIds.length > 0) {
        allowed = permIds;
      } else {
        const catIds = [
          partyAuthUser?.category_id,
          ...(partyAuthUser?.categories ?? []).map((c: any) => c.category_id),
        ].filter((id): id is number => id !== null && id !== undefined);
        allowed = catIds.length > 0 ? [...new Set(catIds)] : null;
      }
      if (allowed) opts = opts.filter(o => allowed!.includes(Number(o.value)));
      setCategoryOpts(opts);
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Load panel page ─────────────────────────────────────────────────────────
  const loadPanelPage = useCallback(async (
    filter: "active" | "deleted", page: number, search: string, append: boolean, catId: string | null = null,
  ) => {
    setPanelLoading(true);
    try {
      const result = await getPartyPage(
        filter === "deleted", page, PANEL_PER_PAGE, search.trim(), "display_name", "asc",
        catId ? Number(catId) : undefined,
      );
      setPanelItems(prev => append ? [...prev, ...result.data] : result.data);
      setPanelHasMore(result.meta.current_page < result.meta.last_page);
      setPanelPage(result.meta.current_page);
    } catch {}
    setPanelLoading(false);
  }, []);

  // ── Debounce search ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearchDebounced(listSearch), 400);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [listSearch]);

  // ── Reload panel when filter/search/category changes ───────────────────────
  useEffect(() => {
    setPanelItems([]);
    setPanelPage(1);
    loadPanelPage(listFilter, 1, searchDebounced, false, categoryFilter);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listFilter, searchDebounced, categoryFilter, loadPanelPage]);

  // ── Infinite scroll ─────────────────────────────────────────────────────────
  const handlePanelScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 120 && panelHasMore && !panelLoading) {
      loadPanelPage(listFilter, panelPage + 1, searchDebounced, true, categoryFilter);
    }
  }, [panelHasMore, panelLoading, panelPage, listFilter, searchDebounced, categoryFilter, loadPanelPage]);

  // ── Scroll active item into view ────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => activeItemRef.current?.scrollIntoView({ block: "center", behavior: "instant" }), 50);
    return () => clearTimeout(t);
  }, [id, panelItems]);

  // ── Load party detail ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) { setParty(null); setLoading(false); setError(null); return; }
    const numId = Number(id);
    if (isNaN(numId)) return;

    setActiveTab("overview");
    setAuditPage(1);

    const token = ++detailFetchRef.current;
    const cached = readPartyFullDetail(numId);
    if (cached) { setParty(cached); setLoading(false); return; }

    setLoading(true);
    setError(null);
    getPartyFullDetail(numId)
      .then(detail => {
        if (token !== detailFetchRef.current) return;
        setParty(detail);
        setLoading(false);
      })
      .catch(err => {
        if (token !== detailFetchRef.current) return;
        setError(err?.message ?? "Failed to load party details.");
        setLoading(false);
      });
  }, [id]);

  // ── Load audit logs when history tab is open ────────────────────────────────
  useEffect(() => {
    if (activeTab !== "history" || !id) return;
    const numId = Number(id);
    const cached = readPartyAuditLogs(numId, auditPage);
    if (cached) {
      setAuditLogs(cached.logs);
      setAuditLastPage(cached.lastPage);
      setAuditTotal(cached.total);
      return;
    }
    setAuditLoading(true);
    getPartyAuditLogs(numId, auditPage)
      .then(entry => {
        setAuditLogs(entry.logs);
        setAuditLastPage(entry.lastPage);
        setAuditTotal(entry.total);
        setAuditLoading(false);
      })
      .catch(() => setAuditLoading(false));
  }, [activeTab, id, auditPage]);

  // ── Refresh ─────────────────────────────────────────────────────────────────
  const handleRefresh = useCallback(async () => {
    if (!id || refreshingRef.current) return;
    refreshingRef.current = true;
    setRefreshing(true);
    const numId = Number(id);
    try {
      bustAllPartyCache();
      const tasks: Promise<unknown>[] = [
        loadPanelPage(listFilter, 1, searchDebounced, false, categoryFilter),
        getPartyFullDetail(numId)
          .then(detail => { setParty(detail); setError(null); })
          .catch(() => showToast("danger", "Failed to reload party.")),
      ];
      if (activeTab === "history") {
        tasks.push(
          getPartyAuditLogs(numId, auditPage)
            .then(entry => { setAuditLogs(entry.logs); setAuditLastPage(entry.lastPage); setAuditTotal(entry.total); })
            .catch(() => showToast("danger", "Failed to reload activity history."))
        );
      }
      await Promise.all(tasks);
    } catch {}
    finally { refreshingRef.current = false; setRefreshing(false); }
  }, [id, listFilter, searchDebounced, categoryFilter, activeTab, auditPage, loadPanelPage]);

  useEffect(() => onMutation("parties:mutated", handleRefresh), [handleRefresh]);

  // ── Toggle status ───────────────────────────────────────────────────────────
  const handleToggleStatus = () => {
    if (!party) return;
    const activating = !party.is_active;
    setConfirmConfig({
      icon: activating ? "ti-circle-check" : "ti-circle-x",
      iconColor: activating ? "#2f9e44" : "#e67700",
      iconBg:    activating ? "#ebfbee"  : "#fff8eb",
      title:   activating ? "Mark as Active?" : "Mark as Inactive?",
      message: activating
        ? `"${party.display_name}" will be marked as Active.`
        : `"${party.display_name}" will be marked as Inactive.`,
      confirmLabel: activating ? "Mark as Active" : "Mark as Inactive",
      confirmColor: activating ? "#2f9e44" : "#e67700",
      onConfirm: async () => {
        const res = await togglePartyStatus(Number(id));
        if (!res.success) { showToast("danger", (res as any).message ?? "Failed to update status."); return; }
        bustParty(Number(id));
        setParty(prev => prev ? { ...prev, is_active: (res as any).is_active } : prev);
        emitMutation("parties:mutated");
        showToast("success", (res as any).is_active ? "Party activated." : "Party deactivated.");
      },
    });
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const executeDelete = async (targetId: number) => {
    const res = await destroyParty(targetId);
    if (!res.success) { showToast("danger", (res as any).message ?? "Failed to delete."); return; }
    bustParty(targetId);
    setPanelItems(prev => prev.filter(p => p.id !== targetId));
    emitMutation("parties:mutated");
    showToast("success", "Party deleted.");
    if (Number(id) === targetId) {
      const fallback = panelItems.find(p => p.id !== targetId);
      setTimeout(() => navigate(fallback ? `/party/parties/${fallback.id}` : "/party/parties"), 600);
    }
  };

  const handleDelete = () => {
    if (!party) return;
    setConfirmConfig({
      icon: "ti-trash", iconColor: "#e03131", iconBg: "#fff0f0",
      title: "Delete Party?",
      message: `"${party.display_name}" will be soft-deleted and can be restored later.`,
      confirmLabel: "Delete", confirmColor: "#e03131",
      onConfirm: () => executeDelete(Number(id)),
    });
  };

  // ── Restore ──────────────────────────────────────────────────────────────────
  const executeRestore = async (targetId: number) => {
    const res = await restoreParty(targetId);
    if (!res.success) { showToast("danger", (res as any).message ?? "Failed to restore."); return; }
    bustParty(targetId);
    const remaining = panelItems.filter(p => p.id !== targetId);
    setPanelItems(remaining);
    emitMutation("parties:mutated");
    showToast("success", "Party restored.");
    if (listFilter === "deleted" && remaining.length === 0) {
      bustAllPartyCache();
      setListFilter("active");
    }
    navigate(`/party/parties/${targetId}`);
  };

  const handleRestore = (targetId: number) => {
    const target = panelItems.find(p => p.id === targetId) ?? party;
    setConfirmConfig({
      icon: "ti-refresh", iconColor: "#2f9e44", iconBg: "#ebfbee",
      title: "Restore Party?",
      message: `"${target?.display_name ?? "This party"}" will be restored and made active again.`,
      confirmLabel: "Restore", confirmColor: "#2f9e44",
      onConfirm: () => executeRestore(targetId),
    });
  };

  const canEdit   = !!(partyAuthUser?.permissions?.parties?.edit);
  const canDelete = !!(partyAuthUser?.permissions?.parties?.delete);

  const isDeleted  = Boolean(party?.deleted_at);
  const isInactive = !isDeleted && !party?.is_active;

  // ── Audit log helpers ───────────────────────────────────────────────────────
  const parseIfStr = (v: any): any => {
    if (typeof v === "string") { try { return JSON.parse(v); } catch { return v; } }
    return v;
  };

  const fieldLabel: Record<string, string> = {
    party_id:                    "Party ID",
    party_type:                  "Party Type",
    salutation:                  "Salutation",
    first_name:                  "First Name",
    last_name:                   "Last Name",
    company_name:                "Company Name",
    display_name:                "Display Name",
    email:                       "Email",
    mobile_code:                 "Phone Code",
    mobile:                      "Phone",
    language:                    "Language",
    distribution_category_id:    "Distribution Category",
    distribution_sub_category_id:"Distribution Sub Category",
    pan:                         "PAN",
    gst:                         "GST Number",
    account_number:              "Account Number",
    ifsc_code:                   "IFSC Code",
    upi_number:                  "UPI Number",
    currency:                    "Currency",
    payment_terms:               "Payment Terms",
    enable_portal:               "Portal Access",
    is_active:                   "Status",
    party_image:                 "Party Image",
    remarks:                     "Remarks",
    billing_address:             "Billing Address",
    shipping_address:            "Shipping Address",
  };

  const boolFields = new Set(["enable_portal"]);
  const enumMap: Record<string, Record<string, string>> = {
    party_type:    { individual: "Individual", business: "Business" },
    payment_terms: PAYMENT_LABELS,
    language:      LANG_LABELS,
    is_active:     { "1": "Active", "0": "Inactive", "true": "Active", "false": "Inactive" },
  };

  const fmtVal = (v: any, key: string): string => {
    if (v === null || v === undefined || v === "") return "—";
    const lk = key.split(".").at(-1) ?? key;
    if (boolFields.has(lk)) return (v === true || v === 1 || v === "1") ? "Yes" : "No";
    if (enumMap[lk]) return enumMap[lk][String(v)] ?? String(v);
    if (typeof v === "boolean") return v ? "Yes" : "No";
    return String(v);
  };

  type DiffRow = { key: string; label: string; oldVal: any; newVal: any };

  const buildDiffRows = (log: AuditLogEntry): DiffRow[] => {
    const SKIP_FIELDS = new Set(["updated_at", "created_at", "deleted_at"]);
    const changedFields = Object.keys({ ...(log.old_values ?? {}), ...(log.new_values ?? {}) })
      .filter(f => !SKIP_FIELDS.has(f));

    return changedFields.flatMap((field): DiffRow[] => {
      if (field === "refs") {
        const rawOld = parseIfStr(log.old_values?.refs);
        const rawNew = parseIfStr(log.new_values?.refs);
        const oldS = (rawOld && typeof rawOld === "object" && !Array.isArray(rawOld)) ? rawOld : {};
        const newS = (rawNew && typeof rawNew === "object" && !Array.isArray(rawNew)) ? rawNew : {};
        const subLabels: Record<string, string> = {
          distribution_category_id:     "Distribution Category",
          distribution_sub_category_id: "Distribution Sub Category",
        };
        const changed = Object.keys({ ...oldS, ...newS }).filter(
          (k) => String(oldS[k] ?? "") !== String(newS[k] ?? "")
        );
        if (changed.length === 0) return [];
        return changed.map((k) => ({
          key: `refs.${k}`, label: subLabels[k] ?? k,
          oldVal: oldS[k] ?? null, newVal: newS[k] ?? null,
        }));
      }
      if (field === "billing_address" || field === "shipping_address") {
        const rawOld = parseIfStr(log.old_values?.[field]);
        const rawNew = parseIfStr(log.new_values?.[field]);
        if (JSON.stringify(rawOld ?? {}) === JSON.stringify(rawNew ?? {})) return [];
        return [{ key: field, label: fieldLabel[field] ?? field, oldVal: null, newVal: "__address_updated" }];
      }
      const oldScalar = parseIfStr(log.old_values?.[field]);
      const newScalar = parseIfStr(log.new_values?.[field]);
      if (String(oldScalar ?? "") === String(newScalar ?? "")) return [];
      return [{ key: field, label: fieldLabel[field] ?? field, oldVal: oldScalar, newVal: newScalar }];
    });
  };

  return (
    <>
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

        {/* ── Left panel ─────────────────────────────────────────────────────── */}
        <div
          className="d-none d-xl-flex"
          style={{ width: 340, minWidth: 340, flexDirection: "column", borderRight: "1px solid #dee2e6", background: "#fff", overflow: "hidden" }}
        >
          {/* Search + filter */}
          <div className="px-3 py-3" style={{ borderBottom: "1px solid #dee2e6", flexShrink: 0 }}>
            <div className="d-flex align-items-center gap-2">
              <div className="input-group flex-grow-1">
                <span className="input-group-text border-end-0 bg-white">
                  <i className="ti ti-search text-muted fs-13" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Search by name, phone…"
                  value={listSearch}
                  onChange={e => setListSearch(e.target.value)}
                />
                {listSearch && (
                  <button type="button" className="btn btn-sm btn-outline-light border-start-0" onClick={() => setListSearch("")}>
                    <i className="ti ti-x fs-12 text-muted" />
                  </button>
                )}
              </div>

              <div className="dropdown flex-shrink-0">
                <button
                  type="button"
                  className="btn btn-outline-light d-flex align-items-center justify-content-center"
                  style={{ width: 38, height: 38, position: "relative" }}
                  data-bs-toggle="dropdown"
                  title="Filter"
                >
                  <i className="ti ti-filter fs-14 text-muted" />
                  {(listFilter === "deleted" || categoryFilter !== null) && (
                    <span style={{ position: "absolute", top: 5, right: 5, width: 7, height: 7, borderRadius: "50%", background: "#e03131", border: "1.5px solid #fff" }} />
                  )}
                </button>
                <div className="dropdown-menu dropdown-menu-end dropmenu-hover-primary" style={{ minWidth: 200 }}>
                  <ul>
                    <li>
                      <button
                        className={`dropdown-item d-flex align-items-center gap-2 fs-13${listFilter !== "deleted" && categoryFilter === null ? " active" : ""}`}
                        onClick={() => { setListFilter("active"); setCategoryFilter(null); }}
                      >
                        <i className="ti ti-layout-list fs-14" />All Parties
                        {listFilter !== "deleted" && categoryFilter === null && <i className="ti ti-check ms-auto fs-12" style={{ color: "#e03131" }} />}
                      </button>
                    </li>
                    {(categoryOpts ?? []).length > 0 && (
                      <>
                        <li><hr className="dropdown-divider" /></li>
                        {(categoryOpts ?? []).map(opt => (
                          <li key={opt.value}>
                            <button
                              className={`dropdown-item d-flex align-items-center gap-2 fs-13${categoryFilter === opt.value ? " active" : ""}`}
                              onClick={() => { setListFilter("active"); setCategoryFilter(opt.value); }}
                            >
                              <i className="ti ti-tag fs-14" />{opt.label}
                              {categoryFilter === opt.value && <i className="ti ti-check ms-auto fs-12" style={{ color: "#e03131" }} />}
                            </button>
                          </li>
                        ))}
                      </>
                    )}
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button
                        className={`dropdown-item d-flex align-items-center gap-2 fs-13${listFilter === "deleted" ? " active" : ""}`}
                        onClick={() => { setListFilter("deleted"); setCategoryFilter(null); }}
                      >
                        <i className="ti ti-trash fs-14" />Deleted
                        {listFilter === "deleted" && <i className="ti ti-check ms-auto fs-12" style={{ color: "#e03131" }} />}
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* List */}
          <div style={{ overflowY: "auto", flex: 1 }} onScroll={handlePanelScroll} ref={panelScrollRef}>
            {panelLoading && panelItems.length === 0 ? (
              <div className="text-center py-4 text-muted fs-13">
                <span className="spinner-border spinner-border-sm me-2" />Loading…
              </div>
            ) : panelItems.length === 0 ? (
              <div className="text-center py-4 text-muted fs-13">
                <i className={`ti ${listFilter === "deleted" ? "ti-trash" : "ti-mood-empty"} d-block fs-24 mb-1`} />
                {listFilter === "deleted" ? "No deleted parties" : "No parties found"}
              </div>
            ) : (
              panelItems.map(p => {
                const isActive = String(p.id) === id;
                return (
                  <div
                    key={p.id}
                    ref={isActive ? activeItemRef : undefined}
                    className="d-flex align-items-center gap-2 px-3"
                    style={{
                      paddingTop: 11, paddingBottom: 11,
                      borderBottom: "1px solid #f5f5f5",
                      cursor: "pointer",
                      background: isActive ? "#fff1f0" : "transparent",
                    }}
                    onClick={() => navigate(`/party/parties/${p.id}`)}
                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "#f8f9fa"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = isActive ? "#fff1f0" : "transparent"; }}
                  >
                    <div
                      className="rounded border d-flex align-items-center justify-content-center flex-shrink-0 overflow-hidden"
                      style={{ width: 28, height: 28, background: "#f5f5f5", opacity: listFilter === "deleted" ? 0.5 : 1 }}
                    >
                      {storageSrc(p.party_image)
                        ? <img src={storageSrc(p.party_image)!} alt={p.display_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <i className="ti ti-user text-muted" style={{ fontSize: 13 }} />
                      }
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="d-flex align-items-center gap-1">
                        <span
                          className="d-block text-truncate"
                          style={{ fontSize: 14, fontWeight: isActive ? 600 : 400, color: isActive ? "#e03131" : "#212529" }}
                        >
                          {p.display_name}
                        </span>
                        {listFilter === "deleted" && (
                          <span className="badge badge-soft-danger d-inline-flex align-items-center gap-1 flex-shrink-0" style={{ fontSize: 10 }}>
                            <i className="ti ti-trash" style={{ fontSize: 9 }} />Deleted
                          </span>
                        )}
                      </div>
                      {p.mobile && (
                        <span className="d-block text-truncate fs-12 text-muted">
                          {p.mobile_code ? `${p.mobile_code} ` : ""}{p.mobile}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            {panelLoading && panelItems.length > 0 && (
              <div className="text-center py-3 text-muted fs-13">
                <span className="spinner-border spinner-border-sm me-2" />Loading…
              </div>
            )}
          </div>
        </div>

        {/* ── Right panel ────────────────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "visible" }}>

          {/* No selection */}
          {!id && (
            <div className="d-flex flex-column align-items-center justify-content-center text-muted" style={{ height: "100%" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <i className="ti ti-users" style={{ fontSize: 28, color: "#d1d5db" }} />
              </div>
              <p className="fw-semibold fs-15 mb-1" style={{ color: "#374151" }}>Select a Party</p>
              <p className="fs-14 mb-0" style={{ color: "#9ca3af" }}>Choose a party from the list to view its details.</p>
            </div>
          )}

          {/* Loading */}
          {id && loading && (
            <div className="d-flex align-items-center justify-content-center text-muted" style={{ height: "100%" }}>
              <span className="spinner-border spinner-border-sm me-2 text-danger" />
              <span className="fs-14">Loading…</span>
            </div>
          )}

          {/* Error */}
          {id && !loading && (error || !party) && (
            <div style={{ padding: "1.25rem" }}>
              <div className="alert alert-danger">{error ?? "Party not found."}</div>
            </div>
          )}

          {/* Party detail */}
          {id && !loading && !error && party && (
            <div style={{ padding: "1.25rem" }}>

              {/* Header */}
              <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
                <div className="d-flex align-items-start gap-3">
                  <div
                    className="rounded border d-flex align-items-center justify-content-center flex-shrink-0 overflow-hidden"
                    style={{ width: 56, height: 56, background: "#f5f5f5" }}
                  >
                    {storageSrc(party.party_image)
                      ? <img src={storageSrc(party.party_image)!} alt={party.display_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <i className="ti ti-user fs-24 text-muted" />
                    }
                  </div>
                  <div>
                    <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                      <h4 className="fw-bold mb-0 lh-sm">{party.display_name}</h4>
                      {isDeleted ? (
                        <span className="badge badge-soft-danger d-inline-flex align-items-center gap-1 fs-12">
                          <i className="ti ti-trash" style={{ fontSize: 10 }} />Deleted
                        </span>
                      ) : isInactive ? (
                        <span className="badge badge-soft-warning d-inline-flex align-items-center gap-1 fs-12">
                          <span style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: "#e67700", display: "inline-block" }} />
                          Inactive
                        </span>
                      ) : (
                        <span className="badge badge-soft-success d-inline-flex align-items-center gap-1 fs-12">
                          <span style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: "#12b76a", display: "inline-block" }} />
                          Active
                        </span>
                      )}
                    </div>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      {party.distribution_category && (
                        <span className="badge fs-12" style={{ background: "#f1f3f5", color: "#6c757d" }}>
                          {party.distribution_category.name}
                        </span>
                      )}
                      {party.distribution_sub_category && (
                        <span className="badge fs-12" style={{ background: "#f1f3f5", color: "#6c757d" }}>
                          {party.distribution_sub_category.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="d-flex align-items-center gap-2">
                  {isDeleted ? (
                    <button
                      type="button"
                      className="btn btn-outline-light shadow d-flex align-items-center gap-1"
                      style={{ height: 36 }}
                      onClick={() => handleRestore(Number(id))}
                    >
                      <i className="ti ti-refresh" style={{ fontSize: 14 }} />Restore
                    </button>
                  ) : (canEdit || canDelete) ? (
                    <div className="dropdown">
                      <button
                        type="button"
                        className="btn btn-outline-light dropdown-toggle shadow d-flex align-items-center gap-1"
                        style={{ height: 36 }}
                        data-bs-toggle="dropdown"
                        data-bs-boundary="viewport"
                      >
                        Actions
                      </button>
                      <div className="dropdown-menu dropdown-menu-end dropmenu-hover-primary">
                        <ul>
                          {canEdit && (
                            <li>
                              <button className="dropdown-item" onClick={() => navigate(`/party/parties/${id}/edit`)}>
                                <i className="ti ti-pencil me-2" />Edit
                              </button>
                            </li>
                          )}
                          {canEdit && canDelete && <li><hr className="dropdown-divider m-1" /></li>}
                          {canDelete && (
                            <li>
                              <button className="dropdown-item text-danger" onClick={handleDelete}>
                                <i className="ti ti-trash me-2" />Delete
                              </button>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  ) : null}
                  <button
                    type="button"
                    className="btn btn-outline-light d-flex align-items-center justify-content-center shadow"
                    style={{ height: 36, width: 36 }}
                    onClick={handleRefresh}
                    disabled={refreshing}
                    title="Refresh"
                  >
                    <i className={`ti ti-refresh${refreshing ? " spin-animation" : ""}`} style={{ fontSize: 16 }} />
                  </button>
                </div>
              </div>

              {/* Tab nav */}
              <div className="mb-4 scrollbar-hidden" style={{ overflowX: "auto" }}>
                <div className="d-inline-flex rounded" style={{ background: "#f1f3f5", padding: 4, gap: 2 }}>
                  {([ { key: "overview", label: "Overview" }, { key: "history", label: "History" } ] as { key: Tab; label: string }[]).map(t => {
                    const isAct = activeTab === t.key;
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setActiveTab(t.key)}
                        style={{
                          padding: "6px 20px", borderRadius: 6, border: "none",
                          background: isAct ? "#fff" : "transparent",
                          color: isAct ? "#e03131" : "#6c757d",
                          fontWeight: isAct ? 600 : 400,
                          fontSize: 14,
                          boxShadow: isAct ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
                          transition: "all 0.15s", cursor: "pointer", whiteSpace: "nowrap",
                        }}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ══ Tab: Overview ═══════════════════════════════════════════════ */}
              {activeTab === "overview" && (
                <>
                  {/* Party Information card */}
                  <div className="card border mb-3">
                    <div className="card-body p-0">
                      <div className="px-4 py-3 border-bottom">
                        <h6 className="fw-semibold fs-15 mb-0">Party Information</h6>
                      </div>
                      <div className="row g-0 pt-2 pb-1">
                        <div className="col-md-6">
                          <InfoRow label="Name"  value={<span className="text-primary">{party.display_name}</span>} />
                          <InfoRow label="Type"  value={
                            <span className={`badge fs-12 ${party.party_type === "individual" ? "badge-soft-secondary" : "badge-soft-primary"}`}>
                              {party.party_type === "individual" ? "Customer" : "Business"}
                            </span>
                          } />
                          <InfoRow label="Email" value={
                            party.email
                              ? <a href={`mailto:${party.email}`} className="text-primary text-decoration-none">{party.email}</a>
                              : <span className="text-muted">—</span>
                          } />
                          <InfoRow label="Phone" value={
                            party.mobile
                              ? `${party.mobile_code ? party.mobile_code + " " : ""}${party.mobile}`
                              : "—"
                          } />
                        </div>
                        <div className="col-md-6">
                          <InfoRow label="Party ID" value={fmt(party.party_id)} />
                          <InfoRow label="Distribution Category" value={party.distribution_category?.name ?? "—"} />
                          <InfoRow label="Sub Category"          value={party.distribution_sub_category?.name ?? "—"} />
                          <InfoRow label="Payment Terms"         value={PAYMENT_LABELS[party.payment_terms ?? ""] ?? fmt(party.payment_terms)} />
                          <InfoRow label="Status" value={
                            isDeleted
                              ? <span className="badge badge-soft-danger fs-12">Deleted</span>
                              : isInactive
                              ? <span className="badge badge-soft-warning fs-12">Inactive</span>
                              : <span className="badge badge-soft-success fs-12">Active</span>
                          } />
                        </div>
                      </div>
                      <div className="d-flex align-items-center flex-wrap px-4 py-3 border-top gap-4" style={{ background: "#fafafa", borderRadius: "0 0 8px 8px" }}>
                        <div className="d-flex align-items-center gap-2">
                          <span className="text-muted fs-14">Created On</span>
                          <span className="fs-14 fw-medium">{formatDate(party.created_at)}</span>
                        </div>
                        {(party.created_by?.name ?? party.parent?.display_name) && (
                          <div className="d-flex align-items-center gap-2">
                            <span className="text-muted fs-14">Created By</span>
                            <span className="fs-14 fw-medium">{party.created_by?.name ?? party.parent?.display_name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Address card */}
                  <div className="card border mb-3">
                    <div className="card-body p-0">
                      <div className="px-4 py-3 border-bottom">
                        <h6 className="fw-semibold fs-15 mb-0">Address</h6>
                      </div>
                      <div className="row g-0 pt-3 pb-3">
                        <div className="col-md-6 px-4" style={{ borderRight: "1px solid #f1f3f5" }}>
                          <div className="fs-13 fw-semibold text-uppercase mb-2" style={{ color: "#6c757d", letterSpacing: "0.04em" }}>
                            Billing Address
                          </div>
                          <AddressLines address={party.billing_address} />
                        </div>
                        <div className="col-md-6 px-4">
                          <div className="fs-13 fw-semibold text-uppercase mb-2" style={{ color: "#6c757d", letterSpacing: "0.04em" }}>
                            Shipping Address
                          </div>
                          <AddressLines address={party.shipping_address} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Last updated */}
                  <div className="d-inline-flex align-items-center gap-2 mt-2 px-3 py-2 rounded"
                    style={{ background: "#f8f9fa", border: "1px solid #e9ecef" }}>
                    <i className="ti ti-clock text-muted fs-14" />
                    <span className="fs-14 text-muted">
                      Last updated on{" "}
                      <span className="fw-semibold" style={{ color: "#495057" }}>
                        {formatDate(party.updated_at ?? party.created_at)}
                      </span>
                    </span>
                  </div>
                </>
              )}

              {/* ══ Tab: History ════════════════════════════════════════════════ */}
              {activeTab === "history" && (
                <div>
                  {/* Header */}
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <div>
                      <h6 className="fw-semibold mb-0 fs-15">Activity History</h6>
                      {!auditLoading && (
                        <span className="fs-13 text-muted">{auditTotal} {auditTotal === 1 ? "record" : "records"}</span>
                      )}
                    </div>
                    {!auditLoading && auditLastPage > 1 && (
                      <div className="d-flex align-items-center gap-2">
                        <span className="fs-13 text-muted">Page {auditPage} of {auditLastPage}</span>
                        <button type="button" className="btn btn-sm btn-outline-light shadow"
                          disabled={auditPage <= 1} onClick={() => setAuditPage(p => p - 1)}
                          style={{ width: 30, height: 30, padding: 0 }}>
                          <i className="ti ti-chevron-left fs-14" />
                        </button>
                        <button type="button" className="btn btn-sm btn-outline-light shadow"
                          disabled={auditPage >= auditLastPage} onClick={() => setAuditPage(p => p + 1)}
                          style={{ width: 30, height: 30, padding: 0 }}>
                          <i className="ti ti-chevron-right fs-14" />
                        </button>
                      </div>
                    )}
                  </div>

                  {auditLoading ? (
                    <div className="text-center py-5 text-muted">
                      <span className="spinner-border spinner-border-sm text-danger me-2" />
                      <span className="fs-14">Loading history…</span>
                    </div>
                  ) : auditLogs.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <i className="ti ti-history fs-36 d-block mb-2" />
                      <p className="fs-14 mb-0">No activity recorded yet.</p>
                    </div>
                  ) : (
                    <div style={{ position: "relative", paddingLeft: 52 }}>
                      {/* Spine */}
                      <div style={{ position: "absolute", left: 17, top: 0, bottom: 0, width: 2, background: "#e9ecef", zIndex: 0 }} />

                      {auditLogs.map((log, idx) => {
                        const eventIcon: Record<string, string> = {
                          created:  "ti-plus",
                          updated:  "ti-pencil",
                          deleted:  "ti-trash",
                          restored: "ti-refresh",
                        };
                        const iconClass = eventIcon[log.event] ?? "ti-activity";
                        const diffRows  = buildDiffRows(log);

                        if (log.event === "updated" && diffRows.length === 0) return null;

                        const actor  = log.user?.name ?? log.party_user?.name ?? log.user?.email ?? log.party_user?.email ?? "System";
                        const rawTs  = log.created_at;
                        const utcTs  = rawTs.replace(" ", "T").replace(/Z$|[+-]\d{2}:\d{2}$/, "");
                        const dateObj = new Date(utcTs);
                        const dateStr = dateObj.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
                        const timeStr = dateObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

                        const eventMessages: Record<string, string> = {
                          created:  "Created party",
                          deleted:  "Deleted party",
                          restored: "Restored party",
                        };
                        let message = eventMessages[log.event];
                        if (!message && log.event === "updated") {
                          message = diffRows.length === 1
                            ? `Changed ${diffRows[0].label.toLowerCase()}`
                            : `Updated ${diffRows.length} fields`;
                        }
                        message = message ?? log.event.replace(/_/g, " ");

                        const isLast = idx === auditLogs.filter(Boolean).length - 1;

                        return (
                          <div key={log.id} style={{ position: "relative", marginBottom: isLast ? 0 : 20 }}>
                            {/* Icon circle */}
                            <div style={{
                              position: "absolute", left: -52,
                              top: "50%", transform: "translateY(-50%)",
                              width: 36, height: 36, borderRadius: "50%",
                              background: "#fff4f4", border: "1.5px solid #e03131",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              zIndex: 1,
                            }}>
                              <i className={`ti ${iconClass}`} style={{ fontSize: 14, color: "#e03131" }} />
                            </div>

                            {/* Card */}
                            <div className="card border" style={{ borderRadius: 10 }}>
                              <div className="card-body" style={{ padding: "18px 20px" }}>
                                {/* Title + date */}
                                <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                                  <span className="fw-semibold fs-15" style={{ color: "#212529" }}>{message}</span>
                                  <div className="text-end flex-shrink-0">
                                    <div className="fs-13 fw-medium" style={{ color: "#495057" }}>{dateStr}</div>
                                    <div className="fs-12 text-muted">{timeStr}</div>
                                  </div>
                                </div>

                                {/* Diff rows */}
                                {log.event === "updated" && diffRows.length > 0 && (
                                  <div className="rounded mb-3 overflow-hidden" style={{ border: "1px solid #e9ecef" }}>
                                    {diffRows.map((row, ri) => {
                                      const rowBg = {
                                        padding: "10px 14px",
                                        background: ri % 2 === 0 ? "#fff" : "#fafafa",
                                        borderTop: ri > 0 ? "1px solid #f1f3f5" : "none",
                                      };

                                      if (row.key === "party_image") {
                                        const toSrc = (v: any) => {
                                          if (!v) return null;
                                          const s = String(v);
                                          return s.startsWith("http") || s.startsWith("/") ? s : `/storage/${s}`;
                                        };
                                        const oldSrc = toSrc(row.oldVal);
                                        const newSrc = toSrc(row.newVal);
                                        return (
                                          <div key={row.key} className="d-flex align-items-center gap-3" style={{ ...rowBg, paddingTop: 12, paddingBottom: 12 }}>
                                            <span className="text-muted fs-13 flex-shrink-0" style={{ width: 150 }}>Party Image</span>
                                            {oldSrc
                                              ? <button type="button" onClick={() => setLightboxSrc(oldSrc)}
                                                  style={{ padding: 0, border: "none", background: "none", cursor: "zoom-in", borderRadius: 6, position: "relative", flexShrink: 0 }}>
                                                  <img src={oldSrc} alt="Previous" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6, border: "1px solid #dee2e6", opacity: 0.65, display: "block" }} />
                                                  <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6, background: "rgba(0,0,0,0.18)" }}>
                                                    <i className="ti ti-zoom-in" style={{ color: "#fff", fontSize: 16 }} />
                                                  </span>
                                                </button>
                                              : <span className="fs-13 text-muted">—</span>
                                            }
                                            <i className="ti ti-arrow-right flex-shrink-0" style={{ fontSize: 12, color: "#adb5bd" }} />
                                            {newSrc
                                              ? <button type="button" onClick={() => setLightboxSrc(newSrc)}
                                                  style={{ padding: 0, border: "none", background: "none", cursor: "zoom-in", borderRadius: 6, position: "relative", flexShrink: 0 }}>
                                                  <img src={newSrc} alt="New" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6, border: "1.5px solid #e03131", display: "block" }} />
                                                  <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6, background: "rgba(0,0,0,0.18)" }}>
                                                    <i className="ti ti-zoom-in" style={{ color: "#fff", fontSize: 16 }} />
                                                  </span>
                                                </button>
                                              : <span className="fs-13 text-muted">—</span>
                                            }
                                          </div>
                                        );
                                      }

                                      if (row.newVal === "__address_updated") {
                                        return (
                                          <div key={row.key} className="d-flex align-items-center gap-3" style={rowBg}>
                                            <span className="text-muted fs-13 flex-shrink-0" style={{ width: 150 }}>{row.label}</span>
                                            <span className="fs-13 fw-semibold px-2 py-1 rounded" style={{ background: "#fff4f4", color: "#e03131" }}>Updated</span>
                                          </div>
                                        );
                                      }

                                      return (
                                        <div key={row.key} className="d-flex align-items-center gap-3" style={rowBg}>
                                          <span className="text-muted fs-13 flex-shrink-0" style={{ width: 150 }}>{row.label}</span>
                                          <span className="fs-13 px-2 py-1 rounded text-decoration-line-through flex-shrink-0" style={{ background: "#f1f3f5", color: "#9ca3af" }}>{fmtVal(row.oldVal, row.key)}</span>
                                          <i className="ti ti-arrow-right flex-shrink-0" style={{ fontSize: 12, color: "#adb5bd" }} />
                                          <span className="fs-13 fw-semibold px-2 py-1 rounded" style={{ background: "#fff4f4", color: "#e03131" }}>{fmtVal(row.newVal, row.key)}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* Actor */}
                                <div className="d-flex align-items-center gap-2 border-top pt-3">
                                  <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 fw-semibold"
                                    style={{ width: 24, height: 24, background: "#f1f3f5", fontSize: 11, color: "#6c757d" }}>
                                    {actor.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="fs-13 text-muted">{actor}</span>
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
          )}
        </div>

      </div>
    </div>

    {/* ── Toast ── */}
    <div className="position-fixed top-0 start-50 translate-middle-x pt-4" style={{ zIndex: 9999, pointerEvents: "none" }}>
      <Toast
        show={toast.show}
        onClose={() => setToast(t => ({ ...t, show: false }))}
        role="alert" aria-live="assertive" aria-atomic="true"
        style={{ pointerEvents: "auto", borderRadius: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.10)", border: "none", minWidth: 320, background: "#fff" }}
      >
        <Toast.Body className="d-flex align-items-center gap-3 px-4 py-3">
          <span
            className={`d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 ${toast.type === "success" ? "bg-success" : "bg-danger"}`}
            style={{ width: 36, height: 36 }}
          >
            <i className={`ti fs-16 text-white ${toast.type === "success" ? "ti-check" : "ti-x"}`} />
          </span>
          <span className="fw-medium fs-14">{toast.message}</span>
        </Toast.Body>
      </Toast>
    </div>

    <ConfirmDialog config={confirmConfig} onClose={() => setConfirmConfig(null)} />

    {/* ── History image lightbox ── */}
    {lightboxSrc && (
      <div
        onClick={() => setLightboxSrc(null)}
        style={{
          position: "fixed", inset: 0, zIndex: 10000,
          background: "rgba(0,0,0,0.82)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "zoom-out",
        }}
      >
        <img
          src={lightboxSrc}
          alt="History image"
          style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain", borderRadius: 8 }}
          onClick={(e) => e.stopPropagation()}
        />
        <button
          type="button"
          onClick={() => setLightboxSrc(null)}
          style={{
            position: "absolute", top: 20, right: 24,
            background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%",
            width: 40, height: 40, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <i className="ti ti-x text-white fs-18" />
        </button>
      </div>
    )}
    </>
  );
};

export default PartyPartiesOverview;
