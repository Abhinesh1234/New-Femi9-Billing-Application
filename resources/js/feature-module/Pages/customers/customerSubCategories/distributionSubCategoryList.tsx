import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Footer from "../../../../components/footer/footer";
import PageHeader from "../../../../components/page-header/pageHeader";
import { all_routes } from "../../../../routes/all_routes";
import { getDistributionSubCategories, bustDistributionSubCategories, type DistributionSubCategory } from "../../../../core/cache/distributionSubCategoryCache";
import { destroyDistributionSubCategory } from "../../../../core/services/distributionSubCategoryApi";
import { onMutation } from "../../../../core/cache/mutationEvents";

const route = all_routes;

const DistributionSubCategoryList = () => {
  const navigate = useNavigate();

  const [items,       setItems]       = useState<DistributionSubCategory[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [loadError,   setLoadError]   = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; record: DistributionSubCategory | null; deleting: boolean }>({ show: false, record: null, deleting: false });

  const loadFresh = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      bustDistributionSubCategories();
      const data = await getDistributionSubCategories();
      setItems(data);
    } catch (e: any) {
      setLoadError(e.message ?? "Failed to load distribution sub-categories.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    getDistributionSubCategories()
      .then(data => { setItems(data); setLoading(false); })
      .catch((e: any) => { setLoadError(e.message ?? "Failed to load."); setLoading(false); });
  }, []);

  useEffect(() => onMutation("distribution-sub-categories:mutated", loadFresh), [loadFresh]);

  const handleDelete = async () => {
    const { record } = deleteModal;
    if (!record) return;
    setDeleteModal(m => ({ ...m, deleting: true }));
    const res = await destroyDistributionSubCategory(record.id);
    if (res.success) {
      setItems(prev => prev.filter(c => c.id !== record.id));
      bustDistributionSubCategories();
      setDeleteModal({ show: false, record: null, deleting: false });
    } else {
      setDeleteModal(m => ({ ...m, deleting: false }));
    }
  };

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <PageHeader
            title="Distribution Sub Categories"
            badgeCount={items.length}
            showModuleTile={false}
            showExport={false}
            onRefresh={loadFresh}
          />

          <div className="card mb-0">
            <div className="card-body p-0">
              <div className="p-4">
                <div className="border-bottom mb-3 pb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <h5 className="mb-0 fs-17">Distribution Sub Categories</h5>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => navigate(route.addDistributionSubCategory)}
                  >
                    <i className="ti ti-square-rounded-plus-filled me-1" />
                    Add New Sub Category
                  </button>
                </div>

                {loading && (
                  <div className="d-flex align-items-center gap-2 py-4 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary" role="status" />
                    <span>Loading…</span>
                  </div>
                )}

                {!loading && loadError && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3">
                    <i className="ti ti-alert-circle fs-16 flex-shrink-0" />
                    <span className="flex-grow-1">{loadError}</span>
                    <button type="button" className="btn btn-sm btn-outline-danger ms-auto" onClick={loadFresh}>Retry</button>
                  </div>
                )}

                {!loading && !loadError && items.length === 0 && (
                  <div className="text-muted text-center py-5">
                    <i className="ti ti-category-2 fs-32 d-block mb-2 opacity-50" />
                    No distribution sub-categories yet. Click <strong>Add New Sub Category</strong> to create one.
                  </div>
                )}

                {!loading && !loadError && items.length > 0 && (
                  <div className="table-responsive" style={{ overflow: "visible" }}>
                    <table className="table table-nowrap">
                      <thead className="table-light">
                        <tr>
                          <th>Name</th>
                          <th>Code</th>
                          <th>Parent Sub Category</th>
                          <th>Level</th>
                          <th style={{ width: "1%", whiteSpace: "nowrap" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map(cat => (
                          <tr key={cat.id}>
                            <td>
                              <span
                                className="text-primary"
                                style={{ cursor: "pointer" }}
                                onClick={() => navigate(route.editDistributionSubCategory.replace(":id", String(cat.id)))}
                              >
                                {cat.name}
                              </span>
                            </td>
                            <td>{cat.code ?? <span className="text-muted">—</span>}</td>
                            <td>{cat.parent?.name ?? <span className="text-muted">—</span>}</td>
                            <td>{cat.level}</td>
                            <td style={{ width: "1%", whiteSpace: "nowrap" }}>
                              <div className="dropdown">
                                <button
                                  type="button"
                                  className="btn btn-outline-light d-flex align-items-center justify-content-center"
                                  style={{ width: 38, height: 38 }}
                                  data-bs-toggle="dropdown"
                                >
                                  <i className="ti ti-dots-vertical fs-14 text-muted" />
                                </button>
                                <div className="dropdown-menu dropdown-menu-right dropmenu-hover-primary">
                                  <button
                                    className="dropdown-item d-flex align-items-center gap-2 fs-13"
                                    onClick={() => navigate(route.editDistributionSubCategory.replace(":id", String(cat.id)))}
                                  >
                                    <i className="ti ti-edit fs-13" /> Edit
                                  </button>
                                  <hr className="dropdown-divider m-1" />
                                  <button
                                    className="dropdown-item d-flex align-items-center gap-2 fs-13 text-danger"
                                    onClick={() => setDeleteModal({ show: true, record: cat, deleting: false })}
                                  >
                                    <i className="ti ti-trash fs-13" /> Delete
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>

      {deleteModal.show && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 1060, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.45)", backdropFilter: "blur(2px)" }}
          onClick={e => { if (e.target === e.currentTarget && !deleteModal.deleting) setDeleteModal(m => ({ ...m, show: false })); }}
        >
          <div style={{ background: "#fff", borderRadius: 14, padding: "32px 28px 24px", width: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <i className="ti ti-trash" style={{ fontSize: 24, color: "#ef4444" }} />
            </div>
            <p style={{ margin: "0 0 6px", fontWeight: 600, fontSize: 16, color: "#0f172a", textAlign: "center" }}>
              Delete "{deleteModal.record?.name}"?
            </p>
            <p style={{ margin: "0 0 24px", fontSize: 13.5, color: "#64748b", textAlign: "center", lineHeight: 1.55 }}>
              This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10, width: "100%" }}>
              <button
                className="btn btn-light flex-grow-1"
                style={{ fontWeight: 500, fontSize: 14, height: 44 }}
                onClick={() => setDeleteModal(m => ({ ...m, show: false }))}
                disabled={deleteModal.deleting}
              >
                Cancel
              </button>
              <button
                className="btn flex-grow-1"
                style={{ background: "#ef4444", color: "#fff", fontWeight: 500, fontSize: 14, border: "none", height: 44 }}
                onClick={handleDelete}
                disabled={deleteModal.deleting}
              >
                {deleteModal.deleting
                  ? <><span className="spinner-border spinner-border-sm me-2" style={{ width: 14, height: 14, borderWidth: 2 }} />Deleting…</>
                  : "Delete"
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DistributionSubCategoryList;
