import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Footer from "../../../../components/footer/footer";
import PageHeader from "../../../../components/page-header/pageHeader";
import { updateRole } from "../../../../core/services/roleApi";
import { getRoleDetail, bustAllRoleCache } from "../../../../core/cache/roleCache";
import { all_routes } from "../../../../routes/all_routes";
import PartiesExtraPermsModal, { type ExtraPermsValue } from "./PartiesExtraPermsModal";

const route = all_routes;

// ─── Types ────────────────────────────────────────────────────────────────────

interface RowPerms {
  full:   boolean;
  view:   boolean;
  create: boolean;
  edit:   boolean;
  delete: boolean;
  others: boolean;
}

interface ModuleRow {
  key:           string;
  label:         string;
  perms:         RowPerms;
  permKeys?:     PermKey[];
  hasMorePerms?: boolean;
  extraPerms?:   ExtraPermsValue;
}

type PermKey = "full" | "view" | "create" | "edit" | "delete" | "others";
const PERM_KEYS:   PermKey[]               = ["full", "view", "create", "edit", "delete", "others"];
const PERM_LABELS: Record<PermKey, string> = { full: "Full", view: "View", create: "Create", edit: "Edit", delete: "Delete", others: "Others" };

const BLANK_EXTRA: ExtraPermsValue = { party_category_ids: [] };

// ─── Row factory ─────────────────────────────────────────────────────────────

const makeRow = (key: string, label: string, permKeys?: PermKey[]): ModuleRow => ({
  key,
  label,
  perms: { full: false, view: false, create: false, edit: false, delete: false, others: false },
  ...(permKeys ? { permKeys } : {}),
});

const BLANK_ITEMS: ModuleRow[] = [
  makeRow("items",           "Items"),
  makeRow("composite_items", "Composite Items"),
  makeRow("price_list",      "Price List"),
];

const BLANK_INVENTORY: ModuleRow[] = [
  makeRow("inventory",             "Inventory",             ["full", "view"]),
  makeRow("assemblies",            "Assemblies"),
  makeRow("inventory_adjustments", "Inventory Adjustments"),
  makeRow("transfer_orders",       "Transfer Orders"),
];

const BLANK_SALES: ModuleRow[] = [
  { ...makeRow("parties",  "Parties"),  hasMorePerms: true, extraPerms: { ...BLANK_EXTRA } },
  { ...makeRow("invoices", "Invoices"), hasMorePerms: true, extraPerms: { ...BLANK_EXTRA } },
  makeRow("payments",     "Payments"),
  makeRow("credit_notes", "Credit Notes"),
];

const BLANK_OTHERS: ModuleRow[] = [
  makeRow("distribution_locations", "Distribution Locations"),
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

type PermMap = Map<string, { can_view: boolean; can_create: boolean; can_edit: boolean; can_delete: boolean; can_others: boolean; others_data?: Record<string, unknown> | null }>;

function applyPerms(rows: ModuleRow[], permsMap: PermMap): ModuleRow[] {
  return rows.map(row => {
    const p = permsMap.get(row.key);
    if (!p) return row;
    const rowKeys = row.permKeys ?? PERM_KEYS;
    const view   = p.can_view;
    const create = p.can_create;
    const edit   = p.can_edit;
    const del    = p.can_delete;
    const others = p.can_others;
    const vals: Record<string, boolean> = { view, create, edit, delete: del, others };
    const full = rowKeys.filter(k => k !== "full").every(k => vals[k] ?? false);
    const updated: ModuleRow = { ...row, perms: { full, view, create, edit, delete: del, others } };
    if (row.extraPerms !== undefined) {
      const od = p.others_data as { party_category_ids?: number[] | null } | null | undefined;
      updated.extraPerms = { party_category_ids: od?.party_category_ids ?? [] };
    }
    return updated;
  });
}

// ─── Checkbox ─────────────────────────────────────────────────────────────────

function Chk({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <input
      type="checkbox"
      className="form-check-input"
      checked={checked}
      onChange={onChange}
      style={{ width: 18, height: 18, cursor: "pointer" }}
    />
  );
}

// ─── Permissions table ────────────────────────────────────────────────────────

interface PermTableProps {
  title:        string;
  rows:         ModuleRow[];
  onRowChange:  (rowKey: string, updated: RowPerms) => void;
  onExtraSave?: (rowKey: string, val: ExtraPermsValue) => void;
}

function PermissionsTable({ title, rows, onRowChange, onExtraSave }: PermTableProps) {
  const [modalRowKey, setModalRowKey] = useState<string | null>(null);
  const modalRow = rows.find(r => r.key === modalRowKey) ?? null;

  const togglePerm = (row: ModuleRow, perm: PermKey) => {
    const rowKeys = row.permKeys ?? PERM_KEYS;
    const p = { ...row.perms };
    if (perm === "full") {
      const next = !p.full;
      p.full = next;
      rowKeys.filter(k => k !== "full").forEach(k => { (p as any)[k] = next; });
    } else {
      (p as any)[perm] = !(p as any)[perm];
      p.full = rowKeys.filter(k => k !== "full").every(k => (p as any)[k]);
    }
    onRowChange(row.key, p);
  };

  return (
    <>
      <div className="mt-4" style={{ border: "1px solid #dee2e6", borderRadius: 8, overflow: "hidden" }}>

        {/* Section header */}
        <div style={{ background: "#fff0f2", padding: "12px 16px", borderBottom: "1px solid #dee2e6" }}>
          <div className="d-flex align-items-center gap-2">
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#E41F07", display: "inline-block", flexShrink: 0 }} />
            <span className="fw-semibold fs-14">{title}</span>
          </div>
        </div>

        <table className="table mb-0" style={{ width: "100%", tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "40%" }} />
            {PERM_KEYS.map(k => <col key={k} style={{ width: "10%" }} />)}
          </colgroup>
          <thead>
            <tr>
              <th className="text-uppercase fs-12 fw-semibold text-muted" style={{ padding: "10px 16px", borderBottom: "1px solid #dee2e6" }}>
                Particulars
              </th>
              {PERM_KEYS.map(k => (
                <th key={k} className="text-uppercase fs-12 fw-semibold text-muted text-center" style={{ padding: "10px 16px", borderBottom: "1px solid #dee2e6" }}>
                  {PERM_LABELS[k]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => {
              const rowKeys = row.permKeys ?? PERM_KEYS.filter(k => k !== "others");
              return (
                <tr key={row.key} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td className="fs-14" style={{ padding: "12px 16px", verticalAlign: "middle" }}>{row.label}</td>
                  {PERM_KEYS.map(k => (
                    <td key={k} className="fs-14 text-center" style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                      {k === "others" ? (
                        row.hasMorePerms ? (
                          <button
                            type="button"
                            className="btn btn-link btn-sm p-0 fs-13"
                            style={{ color: "#E41F07", textDecoration: "none", whiteSpace: "nowrap" }}
                            onClick={() => setModalRowKey(row.key)}
                          >
                            Permissions
                            <i className="ti ti-external-link ms-1" style={{ fontSize: 11 }} />
                          </button>
                        ) : null
                      ) : (
                        rowKeys.includes(k)
                          ? <Chk checked={(row.perms as any)[k]} onChange={() => togglePerm(row, k)} />
                          : null
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modalRow && (
        <PartiesExtraPermsModal
          show={!!modalRowKey}
          onHide={() => setModalRowKey(null)}
          value={modalRow.extraPerms ?? BLANK_EXTRA}
          onSave={val => onExtraSave?.(modalRow.key, val)}
          title={modalRow.key === "invoices" ? "Invoices — Customer Category Access" : "Parties — Extra Permissions"}
        />
      )}
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const EditRole = () => {
  const navigate  = useNavigate();
  const { id }    = useParams<{ id: string }>();
  const roleId    = Number(id);

  const [loading,     setLoading]     = useState(true);
  const [isSystem,    setIsSystem]    = useState(false);
  const [roleName,    setRoleName]    = useState("");
  const [description, setDescription] = useState("");
  const [errors,      setErrors]      = useState<{ roleName?: string }>({});
  const [saving,      setSaving]      = useState(false);

  const [itemsRows,     setItemsRows]     = useState<ModuleRow[]>(BLANK_ITEMS);
  const [inventoryRows, setInventoryRows] = useState<ModuleRow[]>(BLANK_INVENTORY);
  const [salesRows,     setSalesRows]     = useState<ModuleRow[]>(BLANK_SALES);
  const [othersRows,    setOthersRows]    = useState<ModuleRow[]>(BLANK_OTHERS);

  useEffect(() => {
    if (!roleId) return;
    setLoading(true);
    getRoleDetail(roleId)
      .then(detail => {
        setRoleName(detail.name);
        setDescription(detail.description ?? "");
        setIsSystem(detail.is_system ?? false);
        const pm: PermMap = new Map(detail.permissions.map(p => [p.module, p as any]));
        setItemsRows(applyPerms(BLANK_ITEMS, pm));
        setInventoryRows(applyPerms(BLANK_INVENTORY, pm));
        setSalesRows(applyPerms(BLANK_SALES, pm));
        setOthersRows(applyPerms(BLANK_OTHERS, pm));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [roleId]);

  const makeHandler = (setter: React.Dispatch<React.SetStateAction<ModuleRow[]>>) =>
    (rowKey: string, updated: RowPerms) =>
      setter(prev => prev.map(r => r.key === rowKey ? { ...r, perms: updated } : r));

  const makeExtraSaveHandler = (setter: React.Dispatch<React.SetStateAction<ModuleRow[]>>) =>
    (rowKey: string, val: ExtraPermsValue) =>
      setter(prev => prev.map(r => r.key === rowKey ? { ...r, extraPerms: val } : r));

  const handleSave = async () => {
    if (!roleName.trim()) {
      setErrors({ roleName: "Role name is required." });
      return;
    }

    const allRows = [...itemsRows, ...inventoryRows, ...salesRows, ...othersRows];
    const permissions = allRows
      .filter(r => r.perms.view || r.perms.create || r.perms.edit || r.perms.delete)
      .map(r => ({
        module:      r.key,
        can_view:    r.perms.view,
        can_create:  r.perms.create,
        can_edit:    r.perms.edit,
        can_delete:  r.perms.delete,
        can_others:  false,
        others_data: r.extraPerms
          ? { party_category_ids: r.extraPerms.party_category_ids.length ? r.extraPerms.party_category_ids : null }
          : null,
      }));

    setSaving(true);
    try {
      await updateRole(roleId, { name: roleName.trim(), description: description.trim() || null, permissions });
      bustAllRoleCache();
      navigate(route.roleOverview.replace(":id", String(roleId)));
    } catch (e: any) {
      setErrors({ roleName: e?.response?.data?.message ?? e?.message ?? "Failed to update role." });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="content d-flex align-items-center justify-content-center" style={{ minHeight: 300 }}>
          <span className="spinner-border text-danger" role="status" />
        </div>
      </div>
    );
  }

  if (isSystem) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <PageHeader
            title="Edit Role"
            showModuleTile={true}
            moduleTitle="Roles & Permissions"
            showExport={false}
            showClose
            onClose={() => window.history.length > 1 ? navigate(-1) : navigate("/")}
          />
          <div className="card mb-4">
            <div className="card-body p-4">
              <div
                className="d-flex align-items-center gap-3 p-3"
                style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8 }}
              >
                <i className="ti ti-lock" style={{ fontSize: 28, color: "#d97706", flexShrink: 0 }} />
                <div>
                  <div className="fw-semibold fs-14" style={{ color: "#92400e" }}>System Role — Read Only</div>
                  <div className="fs-13 text-muted mt-1">
                    The <strong>{roleName}</strong> role is a system role and cannot be edited or deleted.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="content">

        <PageHeader
          title="Edit Role"
          showModuleTile={true}
          moduleTitle="Roles & Permissions"
          showExport={false}
          showClose
          onClose={() => window.history.length > 1 ? navigate(-1) : navigate("/")}
        />

        <div className="card mb-4">
          <div className="card-body p-4">

            {/* Role Name */}
            <div className="row mb-3 align-items-center">
              <label className="col-sm-2 col-form-label text-danger fw-medium fs-14">
                Role Name <span>*</span>
              </label>
              <div className="col-sm-4">
                <input
                  type="text"
                  className={`form-control${errors.roleName ? " is-invalid" : ""}`}
                  placeholder="Enter role name"
                  value={roleName}
                  onChange={e => { setRoleName(e.target.value); setErrors({}); }}
                />
                {errors.roleName && <div className="invalid-feedback">{errors.roleName}</div>}
              </div>
            </div>

            {/* Description */}
            <div className="row mb-3 align-items-start">
              <label className="col-sm-2 col-form-label fw-medium fs-14">Description</label>
              <div className="col-sm-4">
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Max. 500 characters"
                  maxLength={500}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
            </div>

            <hr className="my-4" />

            <PermissionsTable title="Items"     rows={itemsRows}     onRowChange={makeHandler(setItemsRows)} />
            <PermissionsTable title="Inventory" rows={inventoryRows} onRowChange={makeHandler(setInventoryRows)} />
            <PermissionsTable title="Sales"     rows={salesRows}     onRowChange={makeHandler(setSalesRows)} onExtraSave={makeExtraSaveHandler(setSalesRows)} />
            <PermissionsTable title="Others"    rows={othersRows}    onRowChange={makeHandler(setOthersRows)} />

          </div>
        </div>

      </div>

      <div className="bg-white border-top d-flex align-items-center gap-2 px-4" style={{ position: "sticky", bottom: 0, zIndex: 100, height: 60 }}>
        <button type="button" className="btn btn-danger me-2" onClick={handleSave} disabled={saving}>
          {saving ? <><span className="spinner-border spinner-border-sm me-1" role="status" />Saving…</> : "Save"}
        </button>
        <button type="button" className="btn btn-outline-light" onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/")} disabled={saving}>
          Cancel
        </button>
      </div>

      <Footer />
    </div>
  );
};

export default EditRole;
