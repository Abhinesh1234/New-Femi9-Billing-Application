import React, { useEffect, useRef, useState } from "react";
import PartiesExtraPermsModal, { type ExtraPermsValue } from "../roles-permissions/PartiesExtraPermsModal";
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import Footer from "../../../../components/footer/footer";
import PageHeader from "../../../../components/page-header/pageHeader";
import CommonSelect, { type Option } from "../../../../components/common-select/commonSelect";
import { getRoleList, getRoleDetail, type RoleListItem } from "../../../../core/cache/roleCache";
import { getUserDetail, bustUserCache } from "../../../../core/cache/userCache";
import { updateUser } from "../../../../core/services/userApi";
import { me } from "../../../../core/services/authApi";
import { setUser } from "../../../../core/redux/authSlice";
import type { AppDispatch, RootState } from "../../../../core/redux/store";
import { sanitizePhone, phonePlaceholder, getPhoneMaxLength } from "../../../../utils/phoneUtils";
import { DEFAULT_PHONE_CODES, getCachedPhoneCodes } from "../../../../utils/phoneCodesUtils";

// ─── Password helpers ─────────────────────────────────────────────────────────

const PASSWORD_RULES = [
  { label: "At least 8 characters",       test: (v: string) => v.length >= 8 },
  { label: "One uppercase letter (A–Z)",   test: (v: string) => /[A-Z]/.test(v) },
  { label: "One lowercase letter (a–z)",   test: (v: string) => /[a-z]/.test(v) },
  { label: "One number (0–9)",             test: (v: string) => /[0-9]/.test(v) },
  { label: "One special character (!@#…)", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

function passwordStrength(v: string): { score: number; label: string; color: string } {
  const passed = PASSWORD_RULES.filter(r => r.test(v)).length;
  if (passed <= 1) return { score: passed, label: "Very weak",  color: "#dc3545" };
  if (passed === 2) return { score: passed, label: "Weak",       color: "#fd7e14" };
  if (passed === 3) return { score: passed, label: "Fair",       color: "#ffc107" };
  if (passed === 4) return { score: passed, label: "Strong",     color: "#198754" };
  return              { score: passed, label: "Very strong", color: "#146c43" };
}

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

function Chk({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <input
      type="checkbox"
      className="form-check-input"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      style={{ width: 18, height: 18, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.6 : 1 }}
    />
  );
}

// ─── Permissions table ────────────────────────────────────────────────────────

interface PermTableProps {
  title:        string;
  rows:         ModuleRow[];
  onRowChange:  (rowKey: string, updated: RowPerms) => void;
  onExtraSave?: (rowKey: string, val: ExtraPermsValue) => void;
  readOnly?:    boolean;
}

function PermissionsTable({ title, rows, onRowChange, onExtraSave, readOnly }: PermTableProps) {
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
                            style={{ color: readOnly ? "#adb5bd" : "#E41F07", textDecoration: "none", whiteSpace: "nowrap", pointerEvents: readOnly ? "none" : "auto" }}
                            onClick={() => !readOnly && setModalRowKey(row.key)}
                            disabled={readOnly}
                          >
                            Permissions
                            <i className="ti ti-external-link ms-1" style={{ fontSize: 11 }} />
                          </button>
                        ) : null
                      ) : (
                        rowKeys.includes(k)
                          ? <Chk checked={(row.perms as any)[k]} onChange={() => togglePerm(row, k)} disabled={readOnly} />
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

const EditUser = () => {
  const { id }      = useParams<{ id: string }>();
  const navigate    = useNavigate();
  const dispatch    = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [loadError, setLoadError] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [phone,   setPhone]   = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState<Option | null>({ value: "+91", label: "+91" });
  const [phoneCodeOptions,  setPhoneCodeOptions]  = useState<Option[]>(DEFAULT_PHONE_CODES);
  const [phoneMaxLengths,   setPhoneMaxLengths]   = useState<Record<string, number>>({});
  const [phoneCodesLoading, setPhoneCodesLoading] = useState(true);
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isActive,  setIsActive]  = useState(true);
  const [userType,  setUserType]  = useState<string>("");
  const [roleId,    setRoleId]    = useState("");
  const [errors,    setErrors]    = useState<{ name?: string; email?: string; phone?: string; password?: string; roleId?: string }>({});
  const [saving,    setSaving]    = useState(false);

  const [roles,        setRoles]        = useState<RoleListItem[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [roleDetailLoading, setRoleDetailLoading] = useState(false);
  const [roleLoadedForId, setRoleLoadedForId] = useState<string>("");

  const [itemsRows,     setItemsRows]     = useState<ModuleRow[]>(BLANK_ITEMS);
  const [inventoryRows, setInventoryRows] = useState<ModuleRow[]>(BLANK_INVENTORY);
  const [salesRows,     setSalesRows]     = useState<ModuleRow[]>(BLANK_SALES);
  const [othersRows,    setOthersRows]    = useState<ModuleRow[]>(BLANK_OTHERS);

  const [useIndividualPerms, setUseIndividualPerms] = useState(false);
  const rolePermMapRef        = useRef<PermMap>(new Map());
  const useIndividualPermsRef = useRef(false);

  useEffect(() => { useIndividualPermsRef.current = useIndividualPerms; }, [useIndividualPerms]);

  // Load roles and phone codes
  useEffect(() => {
    getRoleList()
      .then(res => setRoles(res.data))
      .catch(() => {})
      .finally(() => setRolesLoading(false));
  }, []);

  useEffect(() => {
    getCachedPhoneCodes()
      .then(({ options, maxLengths }) => { setPhoneCodeOptions(options); setPhoneMaxLengths(maxLengths); })
      .catch(() => {})
      .finally(() => setPhoneCodesLoading(false));
  }, []);

  // Load user data
  useEffect(() => {
    if (!id) return;
    const numId = Number(id);
    if (isNaN(numId)) { setLoadError("Invalid user ID."); setDataLoading(false); return; }

    setDataLoading(true);
    getUserDetail(numId)
      .then(user => {
        setName(user.name);
        setEmail(user.email ?? "");
        setPhone(user.phone);
        setIsActive(user.is_active);
        setUserType(user.user_type ?? "");
        if (user.role_id) setRoleId(String(user.role_id));

        // Store role perm map for read-only preview and toggle baseline
        const rolepm: PermMap = new Map(
          (user.role_permissions ?? []).map((p: any) => [p.module, p])
        );
        rolePermMapRef.current = rolepm;

        if (user.has_individual_permissions) {
          const pm: PermMap = new Map(
            (user.permissions ?? []).map((p: any) => [p.module, p])
          );
          setItemsRows(applyPerms(BLANK_ITEMS, pm));
          setInventoryRows(applyPerms(BLANK_INVENTORY, pm));
          setSalesRows(applyPerms(BLANK_SALES, pm));
          setOthersRows(applyPerms(BLANK_OTHERS, pm));
          setUseIndividualPerms(true);
        } else {
          setItemsRows(applyPerms(BLANK_ITEMS, rolepm));
          setInventoryRows(applyPerms(BLANK_INVENTORY, rolepm));
          setSalesRows(applyPerms(BLANK_SALES, rolepm));
          setOthersRows(applyPerms(BLANK_OTHERS, rolepm));
          setUseIndividualPerms(false);
        }
        if (user.role_id) setRoleLoadedForId(String(user.role_id));
      })
      .catch(() => setLoadError("Failed to load user details."))
      .finally(() => setDataLoading(false));
  }, [id]);

  // When role changes (after initial load), reload role permissions
  useEffect(() => {
    if (!roleId || roleId === roleLoadedForId || dataLoading) return;
    setRoleDetailLoading(true);
    getRoleDetail(Number(roleId))
      .then(detail => {
        const rp: PermMap = new Map(detail.permissions.map(p => [p.module, p as any]));
        rolePermMapRef.current = rp;
        if (!useIndividualPermsRef.current) {
          setItemsRows(applyPerms(BLANK_ITEMS, rp));
          setInventoryRows(applyPerms(BLANK_INVENTORY, rp));
          setSalesRows(applyPerms(BLANK_SALES, rp));
          setOthersRows(applyPerms(BLANK_OTHERS, rp));
        }
      })
      .catch(() => {})
      .finally(() => setRoleDetailLoading(false));
  }, [roleId]);

  const makeHandler = (setter: React.Dispatch<React.SetStateAction<ModuleRow[]>>) =>
    (rowKey: string, updated: RowPerms) =>
      setter(prev => prev.map(r => r.key === rowKey ? { ...r, perms: updated } : r));

  const makeExtraSaveHandler = (setter: React.Dispatch<React.SetStateAction<ModuleRow[]>>) =>
    (rowKey: string, val: ExtraPermsValue) =>
      setter(prev => prev.map(r => r.key === rowKey ? { ...r, extraPerms: val } : r));

  const handleToggleOverride = (override: boolean) => {
    setUseIndividualPerms(override);
    if (!override) {
      setItemsRows(applyPerms(BLANK_ITEMS, rolePermMapRef.current));
      setInventoryRows(applyPerms(BLANK_INVENTORY, rolePermMapRef.current));
      setSalesRows(applyPerms(BLANK_SALES, rolePermMapRef.current));
      setOthersRows(applyPerms(BLANK_OTHERS, rolePermMapRef.current));
    }
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = "Name is required.";
    if (!email.trim()) e.email = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = "Enter a valid email address.";
    if (!phone.trim()) e.phone = "Phone number is required.";
    else {
      const maxLen = getPhoneMaxLength(phoneCountryCode?.value ?? "+91", phoneMaxLengths);
      if (phone.length < 4 || phone.length > maxLen) e.phone = "Enter a valid phone number.";
    }
    if (password) {
      if (PASSWORD_RULES.some(r => !r.test(password))) {
        e.password = "Password does not meet the requirements below.";
      }
    }
    if (!roleId) e.roleId = "Role is required.";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const allRows = [...itemsRows, ...inventoryRows, ...salesRows, ...othersRows];
      // Super admin always gets empty permissions (clears any stale individual rows → falls back to null = full access)
      const permissions = (userType === "super_admin" || !useIndividualPerms)
        ? []
        : allRows
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

      const payload: any = {
        name,
        email:       email.trim() || null,
        phone,
        role_id:     Number(roleId),
        is_active:   isActive,
        permissions,
      };
      if (password) payload.password = password;

      await updateUser(Number(id), payload);
      bustUserCache();
      // If editing the currently logged-in user, refresh their auth state immediately
      // so permission changes take effect without requiring a page reload.
      if (currentUser && currentUser.id === Number(id)) {
        const result = await me();
        if (result.success) dispatch(setUser(result.user));
      }
      navigate(-1);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Failed to save user.";
      setErrors({ name: msg });
    } finally {
      setSaving(false);
    }
  };

  const strength = password ? passwordStrength(password) : null;

  if (dataLoading) {
    return (
      <div className="page-wrapper">
        <div className="content text-center py-5 text-muted">
          <span className="spinner-border spinner-border-sm me-2" />
          Loading user…
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="alert alert-danger m-4">{loadError}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="content">

        <PageHeader
          title="Edit User"
          showModuleTile={false}
          showExport={false}
          showClose
          onClose={() => window.history.length > 1 ? navigate(-1) : navigate("/")}
        />

        {/* User details card */}
        <div className="card mb-4">
          <div className="card-body p-4">
            <div className="row g-4">

              {/* Left column */}
              <div className="col-md-6">

                {/* Name */}
                <div className="row mb-3 align-items-center">
                  <label className="col-sm-4 col-form-label text-danger fw-medium fs-14">
                    Name <span>*</span>
                  </label>
                  <div className="col-sm-8">
                    <input
                      type="text"
                      className={`form-control${errors.name ? " is-invalid" : ""}`}
                      placeholder="Enter full name"
                      value={name}
                      onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: undefined })); }}
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                  </div>
                </div>

                {/* Phone Number */}
                <div className="row mb-3 align-items-center">
                  <label className="col-sm-4 col-form-label text-danger fw-medium fs-14">
                    Phone Number <span>*</span>
                  </label>
                  <div className="col-sm-8">
                    <div className="d-flex gap-1">
                      <div style={{ width: 110, flexShrink: 0 }}>
                        <CommonSelect
                          options={phoneCodeOptions}
                          value={phoneCountryCode}
                          onChange={(opt: Option | null) => {
                            setPhoneCountryCode(opt);
                            if (opt) setPhone(p => p.slice(0, getPhoneMaxLength(opt.value, phoneMaxLengths)));
                            setErrors(prev => ({ ...prev, phone: undefined }));
                          }}
                          formatOptionLabel={(opt, { context }) =>
                            context === "value" ? opt.value : opt.label
                          }
                        />
                      </div>
                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className={`form-control${errors.phone ? " is-invalid" : ""}`}
                        placeholder={phonePlaceholder(phoneCountryCode?.value ?? "+91", phoneMaxLengths)}
                        maxLength={getPhoneMaxLength(phoneCountryCode?.value ?? "+91", phoneMaxLengths)}
                        value={phone}
                        onChange={e => {
                          setPhone(sanitizePhone(e.target.value, phoneCountryCode?.value ?? "+91", phoneMaxLengths));
                          setErrors(p => ({ ...p, phone: undefined }));
                        }}
                      />
                    </div>
                    {errors.phone && <div className="text-danger fs-12 mt-1">{errors.phone}</div>}
                  </div>
                </div>

                {/* Role */}
                <div className="row mb-3 align-items-center">
                  <label className="col-sm-4 col-form-label text-danger fw-medium fs-14">
                    Role <span>*</span>
                  </label>
                  <div className="col-sm-8">
                    <CommonSelect
                      className={`select${errors.roleId ? " is-invalid" : ""}`}
                      options={roles.map(r => ({ value: String(r.id), label: r.name }))}
                      value={roleId ? { value: roleId, label: roles.find(r => String(r.id) === roleId)?.name ?? "" } : null}
                      onChange={(opt: Option | null) => { setRoleId(opt?.value ?? ""); setErrors(p => ({ ...p, roleId: undefined })); }}
                      placeholder={rolesLoading ? "Loading roles…" : "Select role"}
                      isDisabled={rolesLoading}
                    />
                    {errors.roleId && <div className="invalid-feedback d-block">{errors.roleId}</div>}
                  </div>
                </div>

                {/* Status */}
                <div className="row mb-3 align-items-center">
                  <label className="col-sm-4 col-form-label fw-medium fs-14">Status</label>
                  <div className="col-sm-8">
                    <div className="d-flex align-items-center gap-3">
                      <div className="form-check form-check-inline mb-0">
                        <input
                          className="form-check-input"
                          type="radio"
                          id="status_active"
                          checked={isActive}
                          onChange={() => setIsActive(true)}
                        />
                        <label className="form-check-label fs-14" htmlFor="status_active">Active</label>
                      </div>
                      <div className="form-check form-check-inline mb-0">
                        <input
                          className="form-check-input"
                          type="radio"
                          id="status_inactive"
                          checked={!isActive}
                          onChange={() => setIsActive(false)}
                        />
                        <label className="form-check-label fs-14" htmlFor="status_inactive">Inactive</label>
                      </div>
                    </div>
                  </div>
                </div>

              </div>{/* left col */}

              {/* Right column */}
              <div className="col-md-6">

                {/* Email Address */}
                <div className="row mb-3 align-items-center">
                  <label className="col-sm-4 col-form-label text-danger fw-medium fs-14">
                    Email Address <span>*</span>
                  </label>
                  <div className="col-sm-8">
                    <input
                      type="email"
                      className={`form-control${errors.email ? " is-invalid" : ""}`}
                      placeholder="Enter email address"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>
                </div>

                {/* Password — optional on edit */}
                <div className="row mb-1 align-items-start">
                  <label className="col-sm-4 col-form-label fw-medium fs-14" style={{ paddingTop: 7 }}>
                    New Password
                    <div className="fs-11 text-muted fw-normal">Leave blank to keep current</div>
                  </label>
                  <div className="col-sm-8">
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`form-control${errors.password ? " is-invalid" : ""}`}
                        placeholder="Enter new password (optional)"
                        value={password}
                        autoComplete="new-password"
                        onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        tabIndex={-1}
                        onClick={() => setShowPassword(v => !v)}
                        style={{ borderLeft: 0, zIndex: 0 }}
                      >
                        <i className={`ti ${showPassword ? "ti-eye-off" : "ti-eye"}`} />
                      </button>
                      {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                    </div>

                    {/* Strength bar */}
                    {password && strength && (
                      <div className="mt-2">
                        <div className="d-flex gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map(i => (
                            <div
                              key={i}
                              style={{
                                flex: 1, height: 4, borderRadius: 2,
                                backgroundColor: i <= strength.score ? strength.color : "#e9ecef",
                                transition: "background-color 0.2s",
                              }}
                            />
                          ))}
                        </div>
                        <div className="fs-13" style={{ color: strength.color }}>{strength.label}</div>
                      </div>
                    )}

                    {/* Requirements checklist */}
                    {password && (
                      <ul className="list-unstyled mb-0 mt-2" style={{ fontSize: 13 }}>
                        {PASSWORD_RULES.map(r => {
                          const ok = r.test(password);
                          return (
                            <li key={r.label} className="d-flex align-items-center gap-1" style={{ color: ok ? "#198754" : "#6c757d" }}>
                              <i className={`ti ${ok ? "ti-check" : "ti-x"}`} style={{ fontSize: 13 }} />
                              {r.label}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>

              </div>{/* right col */}

            </div>{/* row g-4 */}
          </div>
        </div>

        {/* Permissions card */}
        <div className="card mb-4">
          <div className="card-body p-4">
            {userType === "super_admin" ? (
              <>
                <h6 className="fw-semibold fs-14 mb-3">Permissions</h6>
                <div
                  className="d-flex align-items-center gap-3 p-3"
                  style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8 }}
                >
                  <i className="ti ti-shield-check" style={{ fontSize: 28, color: "#16a34a", flexShrink: 0 }} />
                  <div>
                    <div className="fw-semibold fs-14" style={{ color: "#15803d" }}>Full System Access</div>
                    <div className="fs-13 text-muted mt-1">
                      Super Admin users have unrestricted access to all modules. Individual permissions cannot be configured for this account type.
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="d-flex align-items-center justify-content-between mb-0">
                  <div className="d-flex align-items-center gap-2">
                    <h6 className="fw-semibold fs-14 mb-0">
                      {useIndividualPerms ? "Individual Permissions" : "Role Permissions"}
                    </h6>
                    {roleDetailLoading && (
                      <span className="spinner-border spinner-border-sm text-danger" role="status" />
                    )}
                  </div>
                  {roleId && (
                    <div className="d-flex align-items-center gap-2">
                      <span className="fs-13 text-muted">Override role</span>
                      <div className="form-check form-switch mb-0">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          checked={useIndividualPerms}
                          onChange={e => handleToggleOverride(e.target.checked)}
                          style={{ cursor: "pointer", width: 40, height: 22 }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                {!useIndividualPerms && roleId && (
                  <p className="fs-12 text-muted mb-0 mt-1">
                    <i className="ti ti-info-circle me-1" />
                    Showing role permissions (read-only). Toggle "Override role" to set custom permissions for this user.
                  </p>
                )}
                {!roleId && (
                  <p className="fs-12 text-muted mb-0 mt-1">
                    <i className="ti ti-info-circle me-1" />
                    Assign a role to preview its permissions or toggle override to set individual permissions.
                  </p>
                )}
                <PermissionsTable title="Items"     rows={itemsRows}     onRowChange={makeHandler(setItemsRows)}     readOnly={!useIndividualPerms} />
                <PermissionsTable title="Inventory" rows={inventoryRows} onRowChange={makeHandler(setInventoryRows)} readOnly={!useIndividualPerms} />
                <PermissionsTable title="Sales"     rows={salesRows}     onRowChange={makeHandler(setSalesRows)}     onExtraSave={makeExtraSaveHandler(setSalesRows)} readOnly={!useIndividualPerms} />
                <PermissionsTable title="Others"    rows={othersRows}    onRowChange={makeHandler(setOthersRows)}    readOnly={!useIndividualPerms} />
              </>
            )}
          </div>
        </div>

      </div>{/* content */}

      {/* Sticky Save / Cancel bar */}
      <div
        className="bg-white border-top d-flex align-items-center gap-2 px-4"
        style={{ position: "sticky", bottom: 0, zIndex: 100, height: 60 }}
      >
        <button type="button" className="btn btn-danger me-2" onClick={handleSave} disabled={saving}>
          {saving ? <><span className="spinner-border spinner-border-sm me-1" role="status" />Saving…</> : "Save"}
        </button>
        <button
          type="button"
          className="btn btn-outline-light"
          onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/")}
          disabled={saving}
        >
          Cancel
        </button>
      </div>

      <Footer />
    </div>
  );
};

export default EditUser;
