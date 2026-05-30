import { useEffect, useState } from "react";
import { fetchCompositeItems, type CompositeItemRecord } from "../../core/services/compositeItemApi";
import { fetchStockTotals } from "../../core/services/itemApi";

const fmt2 = (v: string | number | null) =>
  v == null ? "—" : Number(v).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const PartyCompositeItemsList = () => {
  const [items,    setItems]    = useState<CompositeItemRecord[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [stockMap, setStockMap] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCompositeItems({ per_page: 500 }).then(res => {
      if (res.success) {
        const data = res.data.data;
        setItems(data);
        const trackedIds = data.filter(i => i.track_inventory).map(i => i.id);
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

  return (
    <div style={{ background: "#fff", borderRadius: 8, border: "1px solid #dee2e6", overflow: "hidden" }}>

      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #dee2e6", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h6 className="fw-semibold fs-16 mb-0">Composite Items</h6>
          <p className="text-muted fs-13 mb-0">{filtered.length} item(s)</p>
        </div>
        <div className="input-group input-group-sm" style={{ maxWidth: 260 }}>
          <span className="input-group-text bg-white border-end-0">
            <i className="ti ti-search fs-13 text-muted" />
          </span>
          <input
            type="text"
            className="form-control border-start-0 fs-13"
            placeholder="Search composite items…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ boxShadow: "none" }}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-5 text-muted">
          <span className="spinner-border spinner-border-sm text-primary me-2" />
          <span className="fs-14">Loading…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="ti ti-building-factory-2 fs-32 d-block mb-2" />
          <p className="fs-14 mb-0">No composite items found.</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <table className="table mb-0" style={{ minWidth: 720, width: "100%" }}>
            <thead>
              <tr>
                {["Name", "SKU", "Type", "Selling Price", "Stock on Hand", "Reorder Level", "Components"].map(h => (
                  <th key={h} className="text-uppercase fs-12 fw-semibold text-muted"
                    style={{ padding: "10px 16px", borderBottom: "1px solid #dee2e6", whiteSpace: "nowrap", background: "#fafafa" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const stockVal = item.track_inventory ? stockMap[String(item.id)] : undefined;
                return (
                  <tr key={item.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                    <td className="fs-14 fw-medium" style={{ padding: "12px 16px", verticalAlign: "middle" }}>{item.name}</td>
                    <td className="fs-13 text-muted" style={{ padding: "12px 16px", verticalAlign: "middle" }}>{item.sku ?? "—"}</td>
                    <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                      <span className={`badge ${item.composite_type === "assembly" ? "badge-soft-primary" : "badge-soft-success"}`}>
                        {item.composite_type === "assembly" ? "Assembly" : "Kit"}
                      </span>
                    </td>
                    <td className="fs-14" style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                      {item.selling_price ? `₹${fmt2(item.selling_price)}` : "—"}
                    </td>
                    <td className="fs-13" style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                      {!item.track_inventory
                        ? <span className="text-muted">Not tracked</span>
                        : stockVal !== undefined
                          ? <span className="fw-medium">{fmt2(stockVal)}</span>
                          : <span className="text-muted">—</span>
                      }
                    </td>
                    <td className="fs-13" style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                      {item.reorder_point != null
                        ? <span className="fw-medium">{item.reorder_point}</span>
                        : <span className="text-muted">—</span>
                      }
                    </td>
                    <td className="fs-13 text-muted" style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                      {item.components?.length ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PartyCompositeItemsList;
