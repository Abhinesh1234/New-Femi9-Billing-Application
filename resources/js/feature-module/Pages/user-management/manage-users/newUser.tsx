import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Footer from "../../../../components/footer/footer";
import PageHeader from "../../../../components/page-header/pageHeader";
import CommonSelect, { type Option } from "../../../../components/common-select/commonSelect";
import { getRoleList, getRoleDetail, type RoleListItem } from "../../../../core/cache/roleCache";
import { createUser } from "../../../../core/services/userApi";
import { sanitizePhone, phonePlaceholder, getPhoneMaxLength } from "../../../../utils/phoneUtils";
import { DEFAULT_PHONE_CODES, getCachedPhoneCodes } from "../../../../utils/phoneCodesUtils";
import {
  PermissionsTable,
  type ModuleRow, type RowPerms, type PermMap,
  BLANK_ITEMS, BLANK_INVENTORY, BLANK_SALES, BLANK_OTHERS,
  applyPerms,
} from "../roles-permissions/PermissionsTable";
import type { ExtraPermsValue } from "../roles-permissions/PartiesExtraPermsModal";

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

// ─── Main page ────────────────────────────────────────────────────────────────

const NewUser = () => {
  const navigate = useNavigate();

  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [phone,   setPhone]   = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState<Option | null>({ value: "+91", label: "+91" });
  const [phoneCodeOptions,  setPhoneCodeOptions]  = useState<Option[]>(DEFAULT_PHONE_CODES);
  const [phoneMaxLengths,   setPhoneMaxLengths]   = useState<Record<string, number>>({});
  const [phoneCodesLoading, setPhoneCodesLoading] = useState(true);
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [roleId,  setRoleId]  = useState("");
  const [errors,  setErrors]  = useState<{ name?: string; email?: string; phone?: string; password?: string; roleId?: string }>({});
  const [saving,  setSaving]  = useState(false);

  const [roles,        setRoles]        = useState<RoleListItem[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [roleDetailLoading, setRoleDetailLoading] = useState(false);
  const [isSystemRole,      setIsSystemRole]       = useState(false);

  const [itemsRows,     setItemsRows]     = useState<ModuleRow[]>(BLANK_ITEMS);
  const [inventoryRows, setInventoryRows] = useState<ModuleRow[]>(BLANK_INVENTORY);
  const [salesRows,     setSalesRows]     = useState<ModuleRow[]>(BLANK_SALES);
  const [othersRows,    setOthersRows]    = useState<ModuleRow[]>(BLANK_OTHERS);

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

  useEffect(() => {
    if (!roleId) {
      setIsSystemRole(false);
      setItemsRows(BLANK_ITEMS);
      setInventoryRows(BLANK_INVENTORY);
      setSalesRows(BLANK_SALES);
      setOthersRows(BLANK_OTHERS);
      return;
    }
    setRoleDetailLoading(true);
    getRoleDetail(Number(roleId))
      .then(detail => {
        setIsSystemRole(detail.is_system ?? false);
        const pm: PermMap = new Map(detail.permissions.map(p => [p.module, p as any]));
        setItemsRows(applyPerms(BLANK_ITEMS, pm));
        setInventoryRows(applyPerms(BLANK_INVENTORY, pm));
        setSalesRows(applyPerms(BLANK_SALES, pm));
        setOthersRows(applyPerms(BLANK_OTHERS, pm));
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

  const validate = () => {
    const e: typeof errors = {};
    if (!name.trim())  e.name  = "Name is required.";
    if (!email.trim()) e.email = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = "Enter a valid email address.";
    if (!phone.trim()) e.phone = "Phone number is required.";
    else {
      const maxLen = getPhoneMaxLength(phoneCountryCode?.value ?? "+91", phoneMaxLengths);
      if (phone.length < 4 || phone.length > maxLen) e.phone = "Enter a valid phone number.";
    }
    if (!password) {
      e.password = "Password is required.";
    } else if (PASSWORD_RULES.some(r => !r.test(password))) {
      e.password = "Password does not meet the requirements below.";
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
      const permissions = isSystemRole
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
      await createUser({
        name,
        email:       email.trim() || null,
        phone,
        password,
        role_id:     Number(roleId),
        permissions,
      });
      navigate(-1);
    } catch (err: any) {
      setErrors({ name: err?.response?.data?.message ?? err?.message ?? "Failed to save user." });
    } finally {
      setSaving(false);
    }
  };

  const strength = password ? passwordStrength(password) : null;

  return (
    <div className="page-wrapper">
      <div className="content">

        <PageHeader
          title="New User"
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

                {/* Password */}
                <div className="row mb-1 align-items-start">
                  <label className="col-sm-4 col-form-label text-danger fw-medium fs-14" style={{ paddingTop: 7 }}>
                    Password <span>*</span>
                  </label>
                  <div className="col-sm-8">
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`form-control${errors.password ? " is-invalid" : ""}`}
                        placeholder="Enter password"
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
                                flex: 1,
                                height: 4,
                                borderRadius: 2,
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

        {/* Permissions card — only after a role is selected */}
        {roleId && (
          <div className="card mb-4">
            <div className="card-body p-4">
              {isSystemRole ? (
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
                        The selected role grants full access to all modules. Individual permissions cannot be configured for system roles.
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h6 className="fw-semibold fs-14 mb-0">
                    Role Permissions
                    {roleDetailLoading && (
                      <span className="spinner-border spinner-border-sm text-danger ms-2" role="status" />
                    )}
                  </h6>
                  <PermissionsTable title="Items"     rows={itemsRows}     onRowChange={makeHandler(setItemsRows)} />
                  <PermissionsTable title="Inventory" rows={inventoryRows} onRowChange={makeHandler(setInventoryRows)} />
                  <PermissionsTable title="Sales"     rows={salesRows}     onRowChange={makeHandler(setSalesRows)} onExtraSave={makeExtraSaveHandler(setSalesRows)} />
                  <PermissionsTable title="Others"    rows={othersRows}    onRowChange={makeHandler(setOthersRows)} />
                </>
              )}
            </div>
          </div>
        )}

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

export default NewUser;
