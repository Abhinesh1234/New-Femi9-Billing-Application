import React, { useState } from "react";
import PartiesExtraPermsModal, { type ExtraPermsValue } from "./PartiesExtraPermsModal";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RowPerms {
  full:   boolean;
  view:   boolean;
  create: boolean;
  edit:   boolean;
  delete: boolean;
  others: boolean;
}

export interface ModuleRow {
  key:           string;
  label:         string;
  perms:         RowPerms;
  permKeys?:     PermKey[];
  hasMorePerms?: boolean;
  extraPerms?:   ExtraPermsValue;
}

export type PermKey = "full" | "view" | "create" | "edit" | "delete" | "others";
export const PERM_KEYS:   PermKey[]               = ["full", "view", "create", "edit", "delete", "others"];
export const PERM_LABELS: Record<PermKey, string> = { full: "Full", view: "View", create: "Create", edit: "Edit", delete: "Delete", others: "Others" };

export const BLANK_EXTRA: ExtraPermsValue = { party_category_ids: [] };

// ─── Row factory & blank sets ─────────────────────────────────────────────────

export const makeRow = (key: string, label: string, permKeys?: PermKey[]): ModuleRow => ({
  key,
  label,
  perms: { full: false, view: false, create: false, edit: false, delete: false, others: false },
  ...(permKeys ? { permKeys } : {}),
});

export const BLANK_ITEMS: ModuleRow[] = [
  makeRow("items",           "Items"),
  makeRow("composite_items", "Composite Items"),
  makeRow("price_list",      "Price List"),
];

export const BLANK_INVENTORY: ModuleRow[] = [
  makeRow("inventory",             "Inventory",             ["full", "view"]),
  makeRow("assemblies",            "Assemblies"),
  makeRow("inventory_adjustments", "Inventory Adjustments"),
  makeRow("transfer_orders",       "Transfer Orders"),
];

export const BLANK_SALES: ModuleRow[] = [
  { ...makeRow("parties",  "Parties"),  hasMorePerms: true, extraPerms: { ...BLANK_EXTRA } },
  makeRow("invoices", "Invoices"),
  makeRow("payments",     "Payments"),
  makeRow("credit_notes", "Credit Notes"),
];

export const BLANK_OTHERS: ModuleRow[] = [
  makeRow("distribution_locations", "Distribution Locations"),
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export type PermMap = Map<string, {
  can_view:     boolean;
  can_create:   boolean;
  can_edit:     boolean;
  can_delete:   boolean;
  can_others:   boolean;
  others_data?: Record<string, unknown> | null;
}>;

export function applyPerms(rows: ModuleRow[], permsMap: PermMap): ModuleRow[] {
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

// ─── PermissionsTable ─────────────────────────────────────────────────────────

interface PermTableProps {
  title:        string;
  rows:         ModuleRow[];
  onRowChange:  (rowKey: string, updated: RowPerms) => void;
  onExtraSave?: (rowKey: string, val: ExtraPermsValue) => void;
}

export function PermissionsTable({ title, rows, onRowChange, onExtraSave }: PermTableProps) {
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
          onSave={val => { onExtraSave?.(modalRow.key, val); setModalRowKey(null); }}
        />
      )}
    </>
  );
}
