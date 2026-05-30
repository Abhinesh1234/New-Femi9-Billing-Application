import React, { useCallback, useEffect, useMemo, useRef, useState, type ThHTMLAttributes } from "react";
import { Link } from "react-router";
import { Toast } from "react-bootstrap";
import dayjs from "dayjs";
import { useDispatch } from "react-redux";
import Footer from "../../../components/footer/footer";
import PageHeader from "../../../components/page-header/pageHeader";
import Datatable from "../../../components/dataTable";
import SearchInput from "../../../components/dataTable/dataTableSearch";
import CommonSelect from "../../../components/common-select/commonSelect";
import CommonDatePicker from "../../../components/common-datePicker/commonDatePicker";
import { startLoading, stopLoading } from "../../../core/redux/loaderSlice";
import { getLocationList } from "../../../core/cache/locationCache";
import type { LocationListItem } from "../../../core/services/locationApi";
import { fetchInventorySummary, type InventorySummaryRow } from "../../../core/services/inventoryApi";
import { exportToExcelFile, exportToPdfPrint } from "../../../core/utils/exportUtils";

// ─── Column widths ────────────────────────────────────────────────────────────
const DEFAULT_COL_WIDTHS: Record<string, number> = {
  name:              260,
  sku:               140,
  unit:              100,
  stock_on_hand:     170,
  committed:         150,
  // available_for_sale fills remaining space (last col — no fixed width)
};
const COL_WIDTHS_LS_KEY = "femi9_inventory_col_widths";

// ─── Column resize ────────────────────────────────────────────────────────────
interface ResizableTitleProps extends ThHTMLAttributes<HTMLTableCellElement> {
  onResize?:    (key: string, width: number) => void;
  colKey?:      string;
  currentWidth?: number;
  handleSide?:  "left" | "right";
}

function ResizableTitle({ onResize, colKey, currentWidth, handleSide = "right", ...restProps }: ResizableTitleProps) {
  const thRef      = useRef<HTMLTableCellElement>(null);
  const [handleVisible, setHandleVisible] = useState(false);
  const isDragging = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!onResize || !colKey) return;
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = handleSide === "left"
      ? (currentWidth ?? 130)
      : (thRef.current?.offsetWidth ?? currentWidth ?? 130);
    isDragging.current = true;
    setHandleVisible(true);
    const onMouseMove = (ev: MouseEvent) => {
      if (!isDragging.current) return;
      onResize(colKey, Math.max(60, startWidth + ev.clientX - startX));
    };
    const onMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor     = "";
      document.body.style.userSelect = "";
      setHandleVisible(false);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.body.style.cursor     = "col-resize";
    document.body.style.userSelect = "none";
  };

  const canResize  = !!onResize && !!colKey;
  const handleEdge = handleSide === "left"
    ? { left: 0, right: "auto" as const }
    : { right: 0, left: "auto" as const };

  return (
    <th ref={thRef} {...restProps} style={{ ...restProps.style, position: "relative", userSelect: "none" }}>
      {restProps.children}
      {canResize && (
        <span
          onMouseDown={handleMouseDown}
          onMouseEnter={() => setHandleVisible(true)}
          onMouseLeave={() => !isDragging.current && setHandleVisible(false)}
          style={{ position: "absolute", top: 0, ...handleEdge, bottom: 0, width: 8, cursor: "col-resize", zIndex: 3, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <span style={{ width: 2, height: handleVisible ? "55%" : 0, background: "var(--bs-primary, #0d6efd)", borderRadius: 2, transition: "height 0.15s ease", pointerEvents: "none", opacity: handleVisible ? 0.7 : 0 }} />
        </span>
      )}
    </th>
  );
}

const TABLE_COMPONENTS = { header: { cell: ResizableTitle } };

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtQty = (n: number) =>
  n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─── Main component ───────────────────────────────────────────────────────────
const InventoryList = () => {
  const dispatch = useDispatch();

  // ── Filter state ──
  const [locationId, setLocationId] = useState<number | null>(null);
  const [asOfDate,   setAsOfDate]   = useState(dayjs().format("YYYY-MM-DD"));

  // ── Data state ──
  const [rows,       setRows]       = useState<InventorySummaryRow[]>([]);
  const [locations,  setLocations]  = useState<LocationListItem[]>([]);
  const [loadError,  setLoadError]  = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");

  // ── Toast ──
  const [toast, setToast] = useState<{ show: boolean; type: "success" | "danger"; message: string }>({ show: false, type: "success", message: "" });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (type: "success" | "danger", message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, type, message });
    toastTimerRef.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 4000);
  };
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  // ── Column widths ──
  const [colWidths, setColWidths] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(COL_WIDTHS_LS_KEY);
      return saved ? { ...DEFAULT_COL_WIDTHS, ...JSON.parse(saved) } : { ...DEFAULT_COL_WIDTHS };
    } catch { return { ...DEFAULT_COL_WIDTHS }; }
  });
  const handleResize = useCallback((key: string, width: number) => {
    setColWidths(prev => {
      const next = { ...prev, [key]: width };
      localStorage.setItem(COL_WIDTHS_LS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // ── Load locations once ──
  useEffect(() => {
    getLocationList().then(setLocations).catch(() => {});
  }, []);

  // ── Load inventory data ──
  const loadData = useCallback(async () => {
    setLoadError(null);
    dispatch(startLoading("inventory-list"));
    try {
      const res = await fetchInventorySummary({
        ...(locationId ? { location_id: locationId } : {}),
        as_of_date: asOfDate,
      });
      if (res.success) setRows(res.data);
      else setLoadError(res.message ?? "Failed to load inventory.");
    } catch (e: any) {
      setLoadError(e?.response?.data?.message ?? e.message ?? "Failed to load inventory.");
    } finally {
      dispatch(stopLoading("inventory-list"));
    }
  }, [locationId, asOfDate, dispatch]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Export helpers ──
  const exportHeaders = ["Item Name", "SKU", "Unit", "Stock on Hand", "Committed", "Available for Sale"];
  const buildExportRows = () =>
    filtered.map(r => [
      r.item_name,
      r.sku  || "—",
      r.unit || "—",
      fmtQty(r.stock_on_hand),
      fmtQty(r.committed),
      fmtQty(r.available_for_sale),
    ]);

  const handleExportPdf = () => {
    try { exportToPdfPrint("Inventory", exportHeaders, buildExportRows()); }
    catch (e: any) { showToast("danger", e.message ?? "PDF export failed."); }
  };

  const handleExportExcel = () => {
    exportToExcelFile("Inventory", [
      { header: "Item Name",          key: "item_name",          width: 30 },
      { header: "SKU",                key: "sku",                width: 16 },
      { header: "Unit",               key: "unit",               width: 12 },
      { header: "Stock on Hand",      key: "stock_on_hand",      width: 18 },
      { header: "Committed",          key: "committed",          width: 16 },
      { header: "Available for Sale", key: "available_for_sale", width: 20 },
    ], filtered.map(r => ({
      item_name:          r.item_name,
      sku:                r.sku  || "—",
      unit:               r.unit || "—",
      stock_on_hand:      fmtQty(r.stock_on_hand),
      committed:          fmtQty(r.committed),
      available_for_sale: fmtQty(r.available_for_sale),
    }))).catch(() => showToast("danger", "Excel export failed."));
  };

  // ── Filter + search ──
  const filtered = useMemo(() => {
    if (!searchText.trim()) return rows;
    const q = searchText.toLowerCase();
    return rows.filter(r =>
      r.item_name.toLowerCase().includes(q) ||
      (r.sku ?? "").toLowerCase().includes(q) ||
      (r.unit ?? "").toLowerCase().includes(q),
    );
  }, [rows, searchText]);

  // ── Location options for CommonSelect ──
  const locationOptions = useMemo(() => [
    { value: "", label: "All Locations" },
    ...locations.map(l => ({ value: String(l.id), label: l.name })),
  ], [locations]);

  // ── Table columns ──
  const columns = useMemo(() => {
    const resizeCell = (key: string) => () => ({
      colKey:       key,
      onResize:     handleResize,
      currentWidth: colWidths[key] ?? DEFAULT_COL_WIDTHS[key] ?? 160,
    });

    const cols: object[] = [
      {
        title: "Item Name",
        key:   "item_name",
        dataIndex: "item_name",
        width: colWidths["name"] ?? DEFAULT_COL_WIDTHS["name"],
        onHeaderCell: resizeCell("name"),
        render: (_: string, record: InventorySummaryRow) => {
          const img = record.image ? `/storage/${record.image}` : null;
          return (
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded border d-flex align-items-center justify-content-center flex-shrink-0 overflow-hidden"
                style={{ width: 36, height: 36, background: "#f5f5f5" }}
              >
                {img
                  ? <img src={img} alt={record.item_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <i className="ti ti-photo text-muted fs-16" />
                }
              </div>
              <Link to={`/items/${record.item_id}`} className="title-name fw-medium">
                {record.item_name}
              </Link>
            </div>
          );
        },
      },
      {
        title: "SKU",
        key: "sku",
        dataIndex: "sku",
        width: colWidths["sku"] ?? DEFAULT_COL_WIDTHS["sku"],
        onHeaderCell: resizeCell("sku"),
        render: (val: string | null) => <span className="text-muted">{val || "—"}</span>,
      },
      {
        title: "Unit",
        key: "unit",
        dataIndex: "unit",
        width: colWidths["unit"] ?? DEFAULT_COL_WIDTHS["unit"],
        onHeaderCell: resizeCell("unit"),
        render: (val: string | null) => val ? val : <span className="text-muted">—</span>,
      },
      {
        title: "Stock on Hand",
        key: "stock_on_hand",
        dataIndex: "stock_on_hand",
        width: colWidths["stock_on_hand"] ?? DEFAULT_COL_WIDTHS["stock_on_hand"],
        onHeaderCell: resizeCell("stock_on_hand"),
        render: (val: number) => (
          <span className="badge badge-soft-primary fs-13 fw-medium px-2 py-1">
            {fmtQty(val)}
          </span>
        ),
      },
      {
        title: "Committed",
        key: "committed",
        dataIndex: "committed",
        width: colWidths["committed"] ?? DEFAULT_COL_WIDTHS["committed"],
        onHeaderCell: resizeCell("committed"),
        render: (val: number) =>
          val > 0
            ? <span className="badge badge-soft-warning fs-13 fw-medium px-2 py-1">{fmtQty(val)}</span>
            : <span className="text-muted">—</span>,
      },
      {
        title: "Available for Sale",
        key: "available_for_sale",
        dataIndex: "available_for_sale",
        onHeaderCell: () => ({
          colKey:       "committed",
          onResize:     handleResize,
          currentWidth: colWidths["committed"] ?? DEFAULT_COL_WIDTHS["committed"] ?? 150,
          handleSide:   "left",
        }),
        render: (val: number) => (
          <span className={`badge fs-13 fw-medium px-2 py-1 ${val > 0 ? "badge-soft-success" : val < 0 ? "badge-soft-danger" : "badge-soft-secondary"}`}>
            {fmtQty(val)}
          </span>
        ),
      },
    ];

    return cols;
  }, [colWidths, handleResize]);

  return (
    <>
      <div className="page-wrapper">
        <div className="content">

          <PageHeader
            title="Inventory"
            badgeCount={filtered.length}
            showModuleTile={false}
            showExport={rows.length > 0}
            onRefresh={loadData}
            onExportPdf={handleExportPdf}
            onExportExcel={handleExportExcel}
          />

          <div className="card border-0 rounded-0">
            <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">

              {/* Search */}
              <div className="input-icon input-icon-start position-relative">
                <span className="input-icon-addon text-dark">
                  <i className="ti ti-search" />
                </span>
                <SearchInput value={searchText} onChange={setSearchText} />
              </div>

              {/* Filters: Location + Date */}
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <div style={{ minWidth: 200 }}>
                  <CommonSelect
                    className="select"
                    options={locationOptions}
                    value={locationOptions.find(o => o.value === (locationId ? String(locationId) : "")) ?? locationOptions[0]}
                    onChange={opt => setLocationId(opt?.value ? Number(opt.value) : null)}
                    placeholder="All Locations"
                  />
                </div>
                <div style={{ minWidth: 160 }}>
                  <CommonDatePicker
                    value={asOfDate ? dayjs(asOfDate) : null}
                    onChange={date => setAsOfDate(date ? date.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"))}
                    format="DD/MM/YYYY"
                    placeholder="As of date"
                  />
                </div>
              </div>

            </div>

            <div className="card-body">

              {loadError ? (
                <div className="alert alert-danger d-flex align-items-center gap-2">
                  <i className="ti ti-alert-circle" />
                  {loadError}
                  <button type="button" className="btn btn-sm btn-outline-danger ms-auto" onClick={loadData}>
                    Retry
                  </button>
                </div>
              ) : (
                <div className="items-custom-table custom-table table-nowrap">
                  <Datatable
                    columns={columns}
                    dataSource={filtered}
                    Selection={false}
                    searchText={searchText}
                    components={TABLE_COMPONENTS}
                    scroll={{ x: "max-content" }}
                    rowKey="item_id"
                  />
                </div>
              )}

            </div>
          </div>

        </div>
        <Footer />
      </div>

      {/* ── Toast ──────────────────────────────────────────────────────────── */}
      <div className="position-fixed top-0 start-50 translate-middle-x pt-4" style={{ zIndex: 9999, pointerEvents: "none" }}>
        <Toast
          show={toast.show}
          onClose={() => setToast(t => ({ ...t, show: false }))}
          style={{ pointerEvents: "auto", borderRadius: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.10)", border: "none", minWidth: 320, background: "#fff" }}
        >
          <Toast.Body className="d-flex align-items-center gap-3 px-4 py-3">
            <span
              className={`d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 ${toast.type === "success" ? "bg-success" : "bg-danger"}`}
              style={{ width: 36, height: 36 }}
            >
              <i className={`ti fs-16 text-white ${toast.type === "success" ? "ti-check" : "ti-x"}`} />
            </span>
            <span className="fs-14 fw-medium text-dark">{toast.message}</span>
          </Toast.Body>
        </Toast>
      </div>
    </>
  );
};

export default InventoryList;
