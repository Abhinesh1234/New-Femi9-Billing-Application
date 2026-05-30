import { useEffect, useState } from "react";
import { fetchPriceLists, type PriceListRecord } from "../../core/services/priceListApi";

const TXN_LABELS: Record<string, string> = {
  sales:    "Sales",
  purchase: "Purchase",
  both:     "Both",
};

const PartyPriceList = () => {
  const [lists,   setLists]   = useState<PriceListRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");

  useEffect(() => {
    fetchPriceLists({ per_page: 500 } as any).then(res => {
      if (res.success) setLists(res.data.data);
      setLoading(false);
    });
  }, []);

  const matchesSearch = (l: PriceListRecord) =>
    l.name.toLowerCase().includes(search.toLowerCase());
  const enabled  = lists.filter(l => !l.is_company_list && matchesSearch(l));
  const locked   = lists.filter(l =>  l.is_company_list && matchesSearch(l));
  const filtered = [...enabled, ...locked];

  return (
    <div style={{ background: "#fff", borderRadius: 8, border: "1px solid #dee2e6", overflow: "hidden" }}>

      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #dee2e6", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h6 className="fw-semibold fs-16 mb-0">Price List</h6>
          <p className="text-muted fs-13 mb-0">{filtered.length} list(s)</p>
        </div>
        <div className="input-group input-group-sm" style={{ maxWidth: 260 }}>
          <span className="input-group-text bg-white border-end-0">
            <i className="ti ti-search fs-13 text-muted" />
          </span>
          <input
            type="text"
            className="form-control border-start-0 fs-13"
            placeholder="Search price lists…"
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
          <i className="ti ti-tag fs-32 d-block mb-2" />
          <p className="fs-14 mb-0">No price lists found.</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <table className="table mb-0" style={{ minWidth: 520, width: "100%" }}>
            <thead>
              <tr>
                {["Name", "Type", "Applies To", "Category", "Status"].map(h => (
                  <th key={h} className="text-uppercase fs-12 fw-semibold text-muted"
                    style={{ padding: "10px 16px", borderBottom: "1px solid #dee2e6", whiteSpace: "nowrap", background: "#fafafa" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(list => (
                <tr
                  key={list.id}
                  style={{
                    borderBottom: "1px solid #f5f5f5",
                    opacity: list.is_company_list ? 0.65 : 1,
                    background: list.is_company_list ? "#fafafa" : undefined,
                  }}
                >
                  <td className="fs-14 fw-medium" style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                    <span className="d-flex align-items-center gap-2">
                      {list.is_company_list && (
                        <i className="ti ti-lock fs-13 text-muted" title="Company price list — view only" />
                      )}
                      {list.name}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                    <span className="badge badge-soft-secondary fs-12">
                      {TXN_LABELS[list.transaction_type] ?? list.transaction_type}
                    </span>
                  </td>
                  <td className="fs-13 text-muted" style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                    {list.price_list_type === "all_items" ? "All Items" : "Individual Items"}
                  </td>
                  <td className="fs-13 text-muted" style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                    {list.customer_category_name ?? "—"}
                  </td>
                  <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                    <span className={`badge ${list.is_active ? "badge-soft-success" : "badge-soft-secondary"}`}>
                      {list.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PartyPriceList;
