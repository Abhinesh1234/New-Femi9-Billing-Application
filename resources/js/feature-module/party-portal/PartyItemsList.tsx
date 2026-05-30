import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { fetchItems, fetchStockTotals, type ItemListRecord } from "../../core/services/itemApi";
import { fetchItemStock, type ItemStockRow } from "../../core/services/openingStockApi";
import { fetchItemTransactions, type TransactionRow, type TransactionMeta } from "../../core/services/itemTransactionsApi";

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt2 = (v: number | string) =>
  Number(v).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmt4 = (v: number | string) =>
  Number(v).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 4 });

type Tab = "locations" | "transactions";

// ── Right panel ───────────────────────────────────────────────────────────────

const ItemDetail = ({ item }: { item: ItemListRecord }) => {
  const [activeTab,      setActiveTab]      = useState<Tab>("locations");
  const [stockMap,       setStockMap]       = useState<Record<number, ItemStockRow>>({});
  const [stockRows,      setStockRows]      = useState<ItemStockRow[]>([]);
  const [stockLoading,   setStockLoading]   = useState(false);
  const [txnRows,        setTxnRows]        = useState<TransactionRow[]>([]);
  const [txnMeta,        setTxnMeta]        = useState<TransactionMeta | null>(null);
  const [txnLoading,     setTxnLoading]     = useState(false);
  const [txnPage,        setTxnPage]        = useState(1);
  const prevId = useRef<number | null>(null);

  // Reset when item changes
  useEffect(() => {
    if (prevId.current !== item.id) {
      prevId.current = item.id;
      setActiveTab("locations");
      setStockMap({});
      setStockRows([]);
      setTxnRows([]);
      setTxnMeta(null);
      setTxnPage(1);
    }
  }, [item.id]);

  // Fetch stock when locations tab is active
  useEffect(() => {
    if (activeTab !== "locations") return;
    let cancelled = false;
    setStockLoading(true);
    fetchItemStock(item.id).then(res => {
      if (cancelled) return;
      if (res.success) {
        const map: Record<number, ItemStockRow> = {};
        res.data.forEach(r => { map[r.location_id] = r; });
        setStockMap(map);
        setStockRows(res.data);
      }
      setStockLoading(false);
    });
    return () => { cancelled = true; };
  }, [activeTab, item.id]);

  // Fetch transactions when transactions tab is active
  useEffect(() => {
    if (activeTab !== "transactions") return;
    let cancelled = false;
    setTxnLoading(true);
    fetchItemTransactions(item.id, { page: txnPage, per_page: 50 }).then(res => {
      if (cancelled) return;
      if (res.success) { setTxnRows(res.data); setTxnMeta(res.meta); }
      setTxnLoading(false);
    });
    return () => { cancelled = true; };
  }, [activeTab, item.id, txnPage]);

  const TXN_STATUS_LABELS: Record<string, string> = {
    draft: "Draft", sent: "Sent", paid: "Paid",
    partially_paid: "Partially Paid", overdue: "Overdue", void: "Void",
  };
  const TXN_STATUS_BADGE: Record<string, string> = {
    draft: "badge-soft-secondary", sent: "badge-soft-info",
    paid: "badge-soft-success", partially_paid: "badge-soft-warning",
    overdue: "badge-soft-danger", void: "badge-soft-secondary",
  };

  return (
    <div>
      {/* Item header */}
      <div className="mb-3">
        <h6 className="fw-semibold fs-16 mb-1">{item.name}</h6>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {item.sku && <span className="fs-12 text-muted">SKU: {item.sku}</span>}
          {item.unit && <span className="fs-12 text-muted">· {item.unit}</span>}
          {item.selling_price && (
            <span className="fs-12 text-muted">· ₹{fmt2(item.selling_price)}</span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="d-flex gap-0 mb-3 border-bottom">
        {(["locations", "transactions"] as Tab[]).map(t => (
          <button
            key={t}
            type="button"
            className="btn btn-link p-0 me-4 pb-2 fs-14 fw-medium text-decoration-none"
            style={{
              color:       activeTab === t ? "#E41F07" : "#6c757d",
              borderBottom: activeTab === t ? "2px solid #E41F07" : "2px solid transparent",
              borderRadius: 0,
            }}
            onClick={() => setActiveTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Locations tab ── */}
      {activeTab === "locations" && (
        stockLoading ? (
          <div className="text-center py-5 text-muted">
            <span className="spinner-border spinner-border-sm text-primary me-2" />
            <span className="fs-14">Loading…</span>
          </div>
        ) : stockRows.length === 0 ? (
          <div className="text-center py-5 text-muted border rounded">
            <i className="ti ti-building-warehouse fs-32 d-block mb-2" />
            <p className="fs-14 mb-0">No stock locations found.</p>
          </div>
        ) : (
          <div style={{ border: "1px solid #dee2e6", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ background: "#fff0f2", padding: "12px 16px", borderBottom: "1px solid #dee2e6" }}>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#E41F07", display: "inline-block", flexShrink: 0 }} />
                <span className="fw-semibold fs-14">{stockRows.length} location(s)</span>
              </div>
              <p className="text-muted fs-13 mb-0">Stock levels across your active locations.</p>
            </div>
            <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              <table className="table mb-0" style={{ minWidth: 440, width: "100%" }}>
                <thead>
                  <tr>
                    {["Location Name", "Stock on Hand", "Committed", "Available"].map(h => (
                      <th key={h} className="text-uppercase fs-12 fw-semibold text-muted"
                        style={{ padding: "10px 16px", borderBottom: "1px solid #dee2e6", whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stockRows.map(r => (
                    <tr key={r.location_id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                      <td className="fs-14" style={{ padding: "12px 16px", verticalAlign: "middle" }}>{r.location_name}</td>
                      <td className="fs-14" style={{ padding: "12px 16px", verticalAlign: "middle" }}>{fmt4(r.stock_on_hand)}</td>
                      <td className="fs-14" style={{ padding: "12px 16px", verticalAlign: "middle" }}>{fmt4(r.committed_stock)}</td>
                      <td className="fs-14" style={{ padding: "12px 16px", verticalAlign: "middle" }}>{fmt4(r.available_for_sale)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* ── Transactions tab ── */}
      {activeTab === "transactions" && (
        txnLoading ? (
          <div className="text-center py-5 text-muted">
            <span className="spinner-border spinner-border-sm text-primary me-2" />
            <span className="fs-14">Loading…</span>
          </div>
        ) : (
          <div style={{ border: "1px solid #dee2e6", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ background: "#fff0f2", padding: "12px 16px", borderBottom: "1px solid #dee2e6" }}>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#E41F07", display: "inline-block", flexShrink: 0 }} />
                <span className="fw-semibold fs-14">{txnMeta?.total ?? 0} transaction(s)</span>
              </div>
              <p className="text-muted fs-13 mb-0">Invoice transactions for this item.</p>
            </div>

            {txnRows.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="ti ti-receipt fs-32 d-block mb-2" />
                <p className="fs-14 mb-0">No transactions found for this item.</p>
              </div>
            ) : (
              <>
                <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                  <table className="table mb-0" style={{ minWidth: 620, width: "100%" }}>
                    <thead>
                      <tr>
                        {["Date", "Invoice #", "Customer", "Qty", "Unit Price", "Total", "Status"].map(h => (
                          <th key={h} className="text-uppercase fs-12 fw-semibold text-muted"
                            style={{ padding: "10px 16px", borderBottom: "1px solid #dee2e6", whiteSpace: "nowrap" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {txnRows.map((row, i) => (
                        <tr key={`${row.invoice_id}-${i}`} style={{ borderBottom: "1px solid #f5f5f5" }}>
                          <td className="fs-14" style={{ padding: "12px 16px", verticalAlign: "middle", whiteSpace: "nowrap" }}>
                            {new Date(row.invoice_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </td>
                          <td className="fs-14 fw-medium" style={{ padding: "12px 16px", verticalAlign: "middle", whiteSpace: "nowrap" }}>
                            {row.invoice_number}
                          </td>
                          <td className="fs-14" style={{ padding: "12px 16px", verticalAlign: "middle" }}>{row.customer_name}</td>
                          <td className="fs-14" style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                            {fmt4(row.quantity)}
                          </td>
                          <td className="fs-14" style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                            ₹{fmt2(row.unit_price)}
                          </td>
                          <td className="fs-14 fw-semibold" style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                            ₹{fmt2(row.total)}
                          </td>
                          <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                            <span className={`badge ${TXN_STATUS_BADGE[row.status] ?? "badge-soft-secondary"}`}>
                              {TXN_STATUS_LABELS[row.status] ?? row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {txnMeta && txnMeta.last_page > 1 && (
                  <div className="d-flex align-items-center justify-content-between px-3 py-2 border-top" style={{ background: "#fafafa" }}>
                    <span className="fs-12 text-muted">
                      Showing {((txnMeta.current_page - 1) * txnMeta.per_page) + 1}–{Math.min(txnMeta.current_page * txnMeta.per_page, txnMeta.total)} of {txnMeta.total}
                    </span>
                    <div className="d-flex gap-1">
                      <button className="btn btn-sm btn-outline-light" disabled={txnMeta.current_page <= 1} onClick={() => setTxnPage(p => p - 1)}>
                        <i className="ti ti-chevron-left fs-13" />
                      </button>
                      <button className="btn btn-sm btn-outline-light" disabled={txnMeta.current_page >= txnMeta.last_page} onClick={() => setTxnPage(p => p + 1)}>
                        <i className="ti ti-chevron-right fs-13" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )
      )}
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────

const PartyItemsList = () => {
  const { id }     = useParams<{ id?: string }>();
  const navigate   = useNavigate();
  const [items,    setItems]    = useState<ItemListRecord[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [stockMap, setStockMap] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchItems({ active_only: true, per_page: 500 } as any).then(res => {
      if (res.success) {
        const data = res.data.data;
        setItems(data);
        const trackedIds = data.filter((i: ItemListRecord) => i.track_inventory).map((i: ItemListRecord) => i.id);
        if (trackedIds.length > 0) {
          fetchStockTotals(trackedIds).then(r => {
            if (r.success) setStockMap(r.data);
          }).catch(() => {});
        }
      }
      setLoading(false);
    });
  }, []);

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    (i.sku ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const selectedId = id ? Number(id) : (filtered[0]?.id ?? null);
  const selectedItem = items.find(i => i.id === selectedId) ?? null;

  return (
    <div style={{ display: "flex", gap: 0, height: "calc(100vh - 108px)", background: "#fff", borderRadius: 8, border: "1px solid #dee2e6", overflow: "hidden" }}>

      {/* ── Left panel: items list ── */}
      <div style={{ width: 280, flexShrink: 0, borderRight: "1px solid #dee2e6", display: "flex", flexDirection: "column", background: "#fafafa" }}>
        {/* Search */}
        <div style={{ padding: "12px 12px 8px" }}>
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-white border-end-0">
              <i className="ti ti-search fs-13 text-muted" />
            </span>
            <input
              type="text"
              className="form-control border-start-0 fs-13"
              placeholder="Search items…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ boxShadow: "none" }}
            />
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading ? (
            <div className="text-center py-5 text-muted">
              <span className="spinner-border spinner-border-sm text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-5 text-muted fs-13">No items found.</div>
          ) : (
            filtered.map(item => {
              const isActive  = item.id === selectedId;
              const stockVal  = item.track_inventory ? stockMap[String(item.id)] : undefined;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(`/party/items/${item.id}`)}
                  className="w-100 text-start border-0 bg-transparent px-3 py-2"
                  style={{
                    borderBottom: "1px solid #f0f0f0",
                    background: isActive ? "#E41F07" : "transparent",
                    color:      isActive ? "#fff" : "#212529",
                    cursor:     "pointer",
                  }}
                >
                  <div className="fs-13 fw-medium" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.name}
                  </div>
                  {item.sku && (
                    <div className="fs-11" style={{ opacity: 0.7, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.sku}
                    </div>
                  )}
                  <div className="fs-11 d-flex gap-2 mt-1" style={{ opacity: isActive ? 0.85 : 0.65 }}>
                    <span>
                      Stock: {!item.track_inventory
                        ? "N/A"
                        : stockVal !== undefined
                          ? fmt2(stockVal)
                          : "—"}
                    </span>
                    {item.reorder_point != null && (
                      <span>· Reorder: {item.reorder_point}</span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Right panel: item detail ── */}
      <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
        {!selectedItem ? (
          <div className="text-center py-5 text-muted">
            <i className="ti ti-box fs-32 d-block mb-2" />
            <p className="fs-14 mb-0">Select an item to view details.</p>
          </div>
        ) : (
          <ItemDetail key={selectedItem.id} item={selectedItem} />
        )}
      </div>
    </div>
  );
};

export default PartyItemsList;
