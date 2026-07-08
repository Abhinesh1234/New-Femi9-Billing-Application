import { useState, useEffect } from "react";
import type { ReactNode, MouseEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../../core/redux/store";
import { setUser } from "../../../core/redux/authSlice";
import type { AuthUser } from "../../../core/redux/authSlice";
import { nameInitial, nameToColor } from "../../../core/utils/avatarUtils";
import {
  partyUpdateBanking, partyUpdateOrganisation,
  partyUpdateLocationLogo, partyRemoveLocationLogo,
  partyUpdateLocationAddress, partyUpdateLocationOrgName, type AddressPayload,
  partyChangePassword,
} from "../../../core/services/partyAuthApi";
import { changePassword } from "../../../core/services/authApi";
import PageHeader from "../../../components/page-header/pageHeader";
import Footer from "../../../components/footer/footer";
import CommonSelect, { Option } from "../../../components/common-select/commonSelect";
import CreatableSelect from "react-select/creatable";
import { sanitizePhone, phonePlaceholder, getPhoneMaxLength } from "../../../utils/phoneUtils";
import { getCachedPhoneCodes, getCachedCountries, DEFAULT_COUNTRIES, getStatesForCountry, type CountryOption } from "../../../utils/phoneCodesUtils";

type Tab = "details" | "organisation" | "security";

const ALL_TABS: { key: Tab; label: string; partyOnly?: boolean }[] = [
  { key: "details",      label: "Details"      },
  { key: "organisation", label: "Organisation", partyOnly: true },
  { key: "security",     label: "Security"     },
];


const commonSelectStyles = {
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected ? "#E41F07" : "white",
    color: state.isSelected ? "#fff" : state.isFocused ? "#E41F07" : "#707070",
    cursor: "pointer",
    "&:hover": { backgroundColor: "#E41F07", color: "#fff" },
  }),
  menu: (base: any) => ({ ...base, zIndex: 999 }),
};

// ── Helper components ─────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="d-flex align-items-center px-4 py-2">
      <span className="text-muted fs-14 flex-shrink-0" style={{ width: "45%" }}>{label}</span>
      <span className="fs-14 fw-medium">{value ?? "—"}</span>
    </div>
  );
}

function fmt(v: string | null | undefined): ReactNode {
  return v ?? "—";
}

function AddressDisplay({ address }: { address: Record<string, string | null> | null | undefined }) {
  if (!address || !Object.values(address).some(Boolean)) {
    return <p className="fs-14 text-muted mb-0">No address on file.</p>;
  }
  const { attention, street1, street2, city, state, pin_code, country, phone_code, phone, fax } = address;
  return (
    <div className="fs-14 d-flex flex-column gap-1">
      {attention && <div className="fw-medium">{attention}</div>}
      {street1   && <div>{street1}</div>}
      {street2   && <div>{street2}</div>}
      {(city || state || pin_code) && (
        <div className="text-muted">{[city, state, pin_code].filter(Boolean).join(", ")}</div>
      )}
      {country && <div className="text-muted">{country}</div>}
      {phone   && <div className="text-muted">{phone_code ? `${phone_code} ${phone}` : phone}</div>}
      {fax     && <div className="text-muted">Fax: {fax}</div>}
    </div>
  );
}

interface AddressFormProps {
  form: AddressPayload;
  onChange: (f: AddressPayload) => void;
  countryList: CountryOption[];
  countriesLoading: boolean;
  phoneMaxLengths: Record<string, number>;
  stateOptions: Option[];
  statesLoading: boolean;
  onCountryChange: (opt: CountryOption | null) => void;
}

function AddressForm({ form, onChange, countryList, countriesLoading, phoneMaxLengths, stateOptions, statesLoading, onCountryChange }: AddressFormProps) {
  const set = (key: keyof AddressPayload, val: string) =>
    onChange({ ...form, [key]: val || null });

  const selectedCountry = countryList.find((c) => c.value === form.country) ?? null;

  return (
    <div>
      {/* Attention */}
      <div className="row mb-3 align-items-center">
        <label className="col-sm-4 col-form-label fw-medium fs-14">Attention</label>
        <div className="col-sm-8">
          <input type="text" className="form-control" value={form.attention ?? ""}
            onChange={(e) => set("attention", e.target.value)} />
        </div>
      </div>

      {/* Country */}
      <div className="row mb-3 align-items-center">
        <label className="col-sm-4 col-form-label fw-medium fs-14">Country / Region</label>
        <div className="col-sm-8">
          <CommonSelect
            options={countryList as Option[]}
            value={selectedCountry}
            isDisabled={countriesLoading}
            placeholder={countriesLoading ? "Loading countries…" : "Select country"}
            onChange={(opt) => onCountryChange(opt as CountryOption | null)}
          />
        </div>
      </div>

      {/* Address */}
      <div className="row mb-3 align-items-start">
        <label className="col-sm-4 col-form-label fw-medium fs-14">Address</label>
        <div className="col-sm-8 d-flex flex-column gap-2">
          <textarea className="form-control" rows={2} placeholder="Street 1"
            value={form.street1 ?? ""} onChange={(e) => set("street1", e.target.value)}
            style={{ resize: "vertical" }} />
          <textarea className="form-control" rows={2} placeholder="Street 2"
            value={form.street2 ?? ""} onChange={(e) => set("street2", e.target.value)}
            style={{ resize: "vertical" }} />
        </div>
      </div>

      {/* City */}
      <div className="row mb-3 align-items-center">
        <label className="col-sm-4 col-form-label fw-medium fs-14">City</label>
        <div className="col-sm-8">
          <input type="text" className="form-control" value={form.city ?? ""}
            onChange={(e) => set("city", e.target.value)} />
        </div>
      </div>

      {/* State */}
      <div className="row mb-3 align-items-center">
        <label className="col-sm-4 col-form-label fw-medium fs-14">State</label>
        <div className="col-sm-8">
          <div className="common-select">
            <CreatableSelect
              classNamePrefix="react-select"
              isClearable
              placeholder={statesLoading ? "Loading states…" : "Select or type to add"}
              isDisabled={statesLoading}
              value={form.state ? { value: form.state, label: form.state } : null}
              onChange={(opt) => set("state", opt?.value ?? "")}
              options={stateOptions}
              styles={commonSelectStyles}
              noOptionsMessage={() => "Type to add a custom state / region"}
              components={{ IndicatorSeparator: () => null }}
            />
          </div>
        </div>
      </div>

      {/* Pin Code */}
      <div className="row mb-3 align-items-center">
        <label className="col-sm-4 col-form-label fw-medium fs-14">Pin Code</label>
        <div className="col-sm-8">
          <input type="text" className="form-control" maxLength={10}
            value={form.pin_code ?? ""} onChange={(e) => set("pin_code", e.target.value)} />
        </div>
      </div>

      {/* Phone */}
      <div className="row mb-3 align-items-center">
        <label className="col-sm-4 col-form-label fw-medium fs-14">Phone</label>
        <div className="col-sm-8">
          <div className="d-flex gap-1">
            <input
              type="text"
              className="form-control text-center"
              value={form.phone_code ?? ""}
              readOnly
              style={{ width: 72, flexShrink: 0, background: "#f8f9fa", color: "#495057", cursor: "default" }}
            />
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              className="form-control"
              placeholder={phonePlaceholder(form.phone_code ?? "+91", phoneMaxLengths)}
              maxLength={getPhoneMaxLength(form.phone_code ?? "+91", phoneMaxLengths)}
              value={form.phone ?? ""}
              onChange={(e) => set("phone", sanitizePhone(e.target.value, form.phone_code ?? "+91", phoneMaxLengths))}
            />
          </div>
        </div>
      </div>

      {/* Fax */}
      <div className="row mb-0 align-items-center">
        <label className="col-sm-4 col-form-label fw-medium fs-14">Fax Number</label>
        <div className="col-sm-8">
          <input type="text" className="form-control" value={form.fax ?? ""}
            onChange={(e) => set("fax", e.target.value)} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const Profile = () => {
  const user     = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState<Tab>("details");

  // ── Banking edit state ──
  const [bankingEdit,   setBankingEdit]   = useState(false);
  const [bankingSaving, setBankingSaving] = useState(false);
  const [bankingError,  setBankingError]  = useState<string | null>(null);
  const [bankingForm,   setBankingForm]   = useState({
    account_number: user?.account_number ?? "",
    ifsc_code:      user?.ifsc_code      ?? "",
    upi_number:     user?.upi_number     ?? "",
  });

  const handleBankingEdit = () => {
    setBankingForm({
      account_number: user?.account_number ?? "",
      ifsc_code:      user?.ifsc_code      ?? "",
      upi_number:     user?.upi_number     ?? "",
    });
    setBankingError(null);
    setBankingEdit(true);
  };

  // ── Location state ──
  const locations  = user?.locations ?? [];
  const isSeparate = user?.location_type === "separate";
  const [selectedLoc, setSelectedLoc] = useState<typeof locations[0] | null>(
    locations.length > 0 ? locations[0] : null
  );

  // Sync selectedLoc when locations arrive (e.g. after session restoration)
  useEffect(() => {
    if (selectedLoc === null && locations.length > 0) {
      setSelectedLoc(locations[0]);
    }
  }, [locations.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Location logo state (tied to selectedLoc) ──
  const [logoPreview,    setLogoPreview]    = useState<string | null>(selectedLoc?.logo_url ?? null);
  const [logoUploading,  setLogoUploading]  = useState(false);
  const [logoError,      setLogoError]      = useState<string | null>(null);

  // Sync logo preview whenever selectedLoc changes
  useEffect(() => {
    setLogoPreview(selectedLoc?.logo_url ?? null);
    setLogoError(null);
  }, [selectedLoc?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogoChange = async (file: File) => {
    if (!selectedLoc) return;
    const blobUrl = URL.createObjectURL(file);
    const prev = logoPreview;
    setLogoPreview(blobUrl);
    setLogoUploading(true);
    setLogoError(null);
    const res = await partyUpdateLocationLogo(selectedLoc.id, file);
    setLogoUploading(false);
    if (!res.success) {
      setLogoPreview(prev);
      setLogoError((res as any).message ?? "Failed to upload image.");
      return;
    }
    const updated = (res as any).user as AuthUser;
    dispatch(setUser(updated));
    const newLoc = updated.locations?.find((l) => l.id === selectedLoc.id) ?? null;
    setSelectedLoc(newLoc);
    // Keep blobUrl as preview — server URL may differ from APP_URL on dev
  };

  const handleLogoRemove = async (e: MouseEvent) => {
    e.preventDefault();
    if (!selectedLoc) return;
    const prev = logoPreview;
    setLogoPreview(null);
    setLogoUploading(true);
    setLogoError(null);
    const res = await partyRemoveLocationLogo(selectedLoc.id);
    setLogoUploading(false);
    if (!res.success) {
      setLogoPreview(prev);
      setLogoError((res as any).message ?? "Failed to remove image.");
      return;
    }
    const updated = (res as any).user as AuthUser;
    dispatch(setUser(updated));
    const newLoc = updated.locations?.find((l) => l.id === selectedLoc.id) ?? null;
    setSelectedLoc(newLoc);
    setLogoPreview(null);
  };

  // ── Country + phone max lengths ──
  const [countryList,      setCountryList]      = useState<CountryOption[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [phoneMaxLengths,  setPhoneMaxLengths]  = useState<Record<string, number>>({});

  // ── Per-address state options ──
  const [billingStateOptions,  setBillingStateOptions]  = useState<Option[]>([]);
  const [shippingStateOptions, setShippingStateOptions] = useState<Option[]>([]);

  useEffect(() => {
    setCountryList(DEFAULT_COUNTRIES);
    getCachedCountries()
      .then((countries) => setCountryList(countries))
      .catch(() => {})
      .finally(() => setCountriesLoading(false));
    getCachedPhoneCodes()
      .then(({ maxLengths }) => setPhoneMaxLengths(maxLengths))
      .catch(() => {});
  }, []);

  // ── Address state ──
  const addrToForm = (a: Record<string, string | null> | null | undefined): AddressPayload => ({
    attention: a?.attention ?? null,
    country:   a?.country   ?? null,
    street1:   a?.street1   ?? null,
    street2:   a?.street2   ?? null,
    city:      a?.city      ?? null,
    state:     a?.state     ?? null,
    pin_code:  a?.pin_code  ?? null,
    phone_code: a?.phone_code ?? null,
    phone:     a?.phone     ?? null,
    fax:       a?.fax       ?? null,
  });

  const [billingEdit,    setBillingEdit]    = useState(false);
  const [billingSaving,  setBillingSaving]  = useState(false);
  const [billingError,   setBillingError]   = useState<string | null>(null);
  const [billingForm,    setBillingForm]    = useState<AddressPayload>(addrToForm(null));

  const [shippingEdit,   setShippingEdit]   = useState(false);
  const [shippingSaving, setShippingSaving] = useState(false);
  const [shippingError,  setShippingError]  = useState<string | null>(null);
  const [shippingForm,   setShippingForm]   = useState<AddressPayload>(addrToForm(null));

  const handleBillingEdit = () => {
    const form = addrToForm(selectedLoc?.address);
    setBillingForm(form);
    setBillingError(null);
    if (form.country) {
      const match = countryList.find((c) => c.value === form.country);
      setBillingStateOptions(match ? getStatesForCountry(match.isoCode) : []);
    } else {
      setBillingStateOptions([]);
    }
    setBillingEdit(true);
  };

  const handleShippingEdit = () => {
    const form = addrToForm(selectedLoc?.shipping_address);
    setShippingForm(form);
    setShippingError(null);
    if (form.country) {
      const match = countryList.find((c) => c.value === form.country);
      setShippingStateOptions(match ? getStatesForCountry(match.isoCode) : []);
    } else {
      setShippingStateOptions([]);
    }
    setShippingEdit(true);
  };

  const handleBillingCountryChange = (opt: CountryOption | null) => {
    setBillingForm((f) => ({ ...f, country: opt?.value ?? null, state: null, phone_code: opt?.phoneCode || null }));
    setBillingStateOptions(opt ? getStatesForCountry(opt.isoCode) : []);
  };

  const handleShippingCountryChange = (opt: CountryOption | null) => {
    setShippingForm((f) => ({ ...f, country: opt?.value ?? null, state: null, phone_code: opt?.phoneCode || null }));
    setShippingStateOptions(opt ? getStatesForCountry(opt.isoCode) : []);
  };

  const handleAddressSave = async (type: "billing" | "shipping") => {
    if (!selectedLoc) return;
    const isBilling = type === "billing";
    if (isBilling) setBillingSaving(true); else setShippingSaving(true);

    const payload = isBilling ? billingForm : shippingForm;
    const res = await partyUpdateLocationAddress(
      selectedLoc.id,
      isBilling ? payload : undefined,
      isBilling ? undefined : payload,
    );

    if (isBilling) setBillingSaving(false); else setShippingSaving(false);

    if (!res.success) {
      const msg = (res as any).message ?? "Failed to save.";
      if (isBilling) setBillingError(msg); else setShippingError(msg);
      return;
    }
    const updated = (res as any).user as AuthUser;
    dispatch(setUser(updated));
    const newLoc = updated.locations?.find((l) => l.id === selectedLoc.id) ?? null;
    setSelectedLoc(newLoc);
    if (isBilling) setBillingEdit(false); else setShippingEdit(false);
  };

  // ── Org name state (always per-location — never touches parties.display_name) ──
  const orgNameCurrent = selectedLoc?.org_name ?? "";

  const [orgNameEdit,   setOrgNameEdit]   = useState(false);
  const [orgNameValue,  setOrgNameValue]  = useState(orgNameCurrent);
  const [orgNameSaving, setOrgNameSaving] = useState(false);
  const [orgNameError,  setOrgNameError]  = useState<string | null>(null);

  // Reset when selected location changes
  useEffect(() => {
    setOrgNameEdit(false);
    setOrgNameError(null);
    setOrgNameValue(selectedLoc?.org_name ?? "");
  }, [selectedLoc?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOrgNameEdit = () => {
    setOrgNameValue(selectedLoc?.org_name ?? "");
    setOrgNameError(null);
    setOrgNameEdit(true);
  };

  const handleOrgNameSave = async () => {
    if (!selectedLoc) return;
    setOrgNameSaving(true);
    setOrgNameError(null);
    const res = await partyUpdateLocationOrgName(selectedLoc.id, orgNameValue.trim() || null);
    setOrgNameSaving(false);
    if (!res.success) { setOrgNameError((res as any).message ?? "Failed to save."); return; }
    const updated = (res as any).user as AuthUser;
    dispatch(setUser(updated));
    const newLoc = updated.locations?.find((l) => l.id === selectedLoc.id) ?? null;
    setSelectedLoc(newLoc);
    setOrgNameEdit(false);
  };

  // ── Change password state ──
  const [pwForm,    setPwForm]    = useState({ current: "", newPw: "", confirm: "" });
  const [pwSaving,  setPwSaving]  = useState(false);
  const [pwError,   setPwError]   = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [showPw,    setShowPw]    = useState({ current: false, newPw: false, confirm: false });

  const handlePasswordSave = async () => {
    setPwError(null);
    setPwSuccess(false);
    if (!pwForm.current) { setPwError("Current password is required."); return; }
    if (!pwForm.newPw)   { setPwError("New password is required."); return; }
    if (pwForm.newPw !== pwForm.confirm) { setPwError("New passwords do not match."); return; }
    setPwSaving(true);
    const res = isParty
      ? await partyChangePassword(pwForm.current, pwForm.newPw, pwForm.confirm)
      : await changePassword(pwForm.current, pwForm.newPw, pwForm.confirm);
    setPwSaving(false);
    if (!res.success) { setPwError((res as any).message ?? "Failed to change password."); return; }
    setPwSuccess(true);
    setPwForm({ current: "", newPw: "", confirm: "" });
    setShowPw({ current: false, newPw: false, confirm: false });
  };

  const handleBankingSave = async () => {
    setBankingSaving(true);
    setBankingError(null);
    const res = await partyUpdateBanking({
      account_number: bankingForm.account_number || null,
      ifsc_code:      bankingForm.ifsc_code      || null,
      upi_number:     bankingForm.upi_number     || null,
    });
    setBankingSaving(false);
    if (!res.success) {
      setBankingError((res as any).message ?? "Failed to save.");
      return;
    }
    dispatch(setUser((res as any).user as AuthUser));
    setBankingEdit(false);
  };

  const isParty = user?.user_type === "party";
  const TABS    = ALL_TABS.filter((t) => !t.partyOnly || isParty);
  const roleLabel = isParty
    ? (user?.category_name ?? user?.party_name ?? "Party")
    : (user?.user_type?.replace(/_/g, " ") ?? "");

  const contact = user?.email ?? (isParty ? user?.mobile : null);

  return (
    <div className="page-wrapper">
      <div className="content">

        <PageHeader
          title="Profile Settings"
          showModuleTile={false}
          showExport={false}
        />

        {/* Profile card */}
        <div className="card mb-4">
          <div className="card-body p-4">

            {/* User info row */}
            <div className="d-flex align-items-start justify-content-between flex-wrap gap-3 mb-4">

              {/* Left — avatar + info */}
              <div className="d-flex align-items-start gap-3">

                {/* Avatar box */}
                <div
                  className="rounded border d-flex align-items-center justify-content-center flex-shrink-0 overflow-hidden"
                  style={{ width: 56, height: 56, background: "#f5f5f5" }}
                >
                  {isParty && user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{
                      width: "100%", height: "100%",
                      background: nameToColor(user?.name ?? "U") + "22",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{
                        fontSize: 22, fontWeight: 700,
                        color: nameToColor(user?.name ?? "U"),
                        userSelect: "none",
                      }}>
                        {nameInitial(user?.name ?? "U")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div>
                  <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                    <h4 className="fw-bold mb-0 lh-sm">{user?.name ?? "—"}</h4>
                    <span className="badge badge-soft-success d-inline-flex align-items-center gap-1 fs-12">
                      <span style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: "#12b76a", display: "inline-block" }} />
                      Active
                    </span>
                  </div>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    {roleLabel && (
                      <span className="badge fs-12" style={{ background: "#f1f3f5", color: "#6c757d" }}>
                        {roleLabel}
                      </span>
                    )}
                    {contact && (
                      <span className="badge fs-12" style={{ background: "#f1f3f5", color: "#6c757d" }}>
                        {contact}
                      </span>
                    )}
                    {isParty && user?.party_code && (
                      <span className="badge fs-12" style={{ background: "#f1f3f5", color: "#6c757d" }}>
                        {user.party_code}
                      </span>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Tab switcher */}
            <div className="scrollbar-hidden" style={{ overflowX: "auto" }}>
              <div className="d-inline-flex rounded" style={{ background: "#f1f3f5", padding: 4, gap: 2 }}>
                {TABS.map((t) => {
                  const isActive = activeTab === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setActiveTab(t.key)}
                      style={{
                        padding: "6px 20px", borderRadius: 6, border: "none",
                        background: isActive ? "#fff" : "transparent",
                        color: isActive ? "#E41F07" : "#6c757d",
                        fontWeight: isActive ? 600 : 400,
                        fontSize: 14,
                        boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
                        transition: "all 0.15s", cursor: "pointer", whiteSpace: "nowrap",
                      }}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Tab content */}
          <div className="border-top px-4 py-4">

            {/* ── Details tab ── */}
            {activeTab === "details" && (
              <div className="card border mb-0">
                <div className="card-body p-0">

                  <div className="px-4 py-3 border-bottom">
                    <h6 className="fw-semibold fs-15 mb-0">Personal Information</h6>
                  </div>

                  <div className="row g-0 pt-2 pb-1">
                    <div className="col-md-6">
                      <InfoRow label={isParty ? "Contact Name" : "Full Name"} value={fmt(user?.name)} />
                      <InfoRow label="Email" value={fmt(user?.email)} />
                      <InfoRow
                        label={isParty ? "Mobile" : "Phone"}
                        value={fmt(isParty ? user?.mobile : user?.phone)}
                      />
                      <InfoRow label="Status" value={
                        <span className="badge badge-soft-success fs-12">Active</span>
                      } />
                    </div>
                    <div className="col-md-6">
                      <InfoRow label="Role" value={
                        <span className="text-capitalize">
                          {user?.role_name ?? (user?.user_type === "super_admin" ? "Super Admin" : "—")}
                        </span>
                      } />
                      {isParty && (
                        <>
                          <InfoRow label="Party Name"  value={fmt(user?.party_name)} />
                          <InfoRow label="Party ID"    value={fmt(user?.party_code)} />
                          <InfoRow label="Category"    value={fmt(user?.category_name)} />
                        </>
                      )}
                    </div>
                  </div>

                  {user?.last_login_at && (
                    <div
                      className="d-flex align-items-center px-4 py-3 border-top"
                      style={{ background: "#fafafa", borderRadius: "0 0 8px 8px" }}
                    >
                      <span className="text-muted fs-14 flex-shrink-0" style={{ width: "22.5%" }}>Last Login</span>
                      <span className="fs-14 fw-medium">
                        {new Date(user.last_login_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                        {", "}
                        {new Date(user.last_login_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                      </span>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* ── Banking Details (party only) ── */}
            {activeTab === "details" && isParty && (
              <>
                <hr className="my-4" />

                <div className="card border mb-0">
                  <div className="card-body p-0">

                    <div className="px-4 py-3 border-bottom d-flex align-items-center justify-content-between">
                      <h6 className="fw-semibold fs-15 mb-0">Banking Details</h6>
                      {!bankingEdit && (
                        <button
                          type="button"
                          className="btn btn-outline-light shadow d-flex align-items-center gap-1"
                          style={{ height: 38 }}
                          onClick={handleBankingEdit}
                        >
                          <i className="ti ti-pencil" style={{ fontSize: 13 }} />
                          Edit
                        </button>
                      )}
                    </div>

                    {bankingEdit ? (
                      <div className="px-4 py-3">
                        {bankingError && (
                          <div className="alert alert-danger py-2 fs-13 mb-3">{bankingError}</div>
                        )}
                        <div className="row g-3">
                          {[
                            { key: "account_number", label: "Account Number", placeholder: "Enter account number" },
                            { key: "ifsc_code",      label: "IFSC Code",      placeholder: "Enter IFSC code"      },
                            { key: "upi_number",     label: "UPI Number",     placeholder: "Enter UPI ID"         },
                          ].map(({ key, label, placeholder }) => (
                            <div className="col-md-4" key={key}>
                              <label className="form-label fs-14 text-muted mb-1">{label}</label>
                              <input
                                type="text"
                                className="form-control fs-14"
                                placeholder={placeholder}
                                value={(bankingForm as any)[key]}
                                onChange={(e) => setBankingForm((f) => ({ ...f, [key]: e.target.value }))}
                              />
                            </div>
                          ))}
                        </div>
                        <div className="d-flex align-items-center gap-2 mt-3">
                          <button
                            type="button"
                            className="btn btn-primary d-flex align-items-center gap-1"
                            style={{ height: 38 }}
                            onClick={handleBankingSave}
                            disabled={bankingSaving}
                          >
                            {bankingSaving
                              ? <span className="spinner-border spinner-border-sm" />
                              : <i className="ti ti-device-floppy" style={{ fontSize: 14 }} />}
                            Save
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-light shadow"
                            style={{ height: 38 }}
                            onClick={() => { setBankingEdit(false); setBankingError(null); }}
                            disabled={bankingSaving}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="row g-0 pt-2 pb-1">
                        <div className="col-md-6">
                          <InfoRow label="Account Number" value={fmt(user?.account_number)} />
                          <InfoRow label="IFSC Code"      value={fmt(user?.ifsc_code)}      />
                        </div>
                        <div className="col-md-6">
                          <InfoRow label="UPI Number" value={fmt(user?.upi_number)} />
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </>
            )}

            {activeTab === "organisation" && (
              <div>

                {/* ── Location selector strip (separate mode only) ── */}
                {(isSeparate && locations.length > 1) || locations.length === 1 ? (
                  <div className="d-flex align-items-center justify-content-between mb-3 px-1">
                    <span className="fs-14 fw-medium text-muted">
                      {isSeparate ? "Viewing location:" : "Location:"}
                    </span>
                    {isSeparate && locations.length > 1 ? (
                      <div className="dropdown">
                        <button
                          type="button"
                          className="btn btn-outline-light shadow d-flex align-items-center gap-1 dropdown-toggle"
                          style={{ height: 36 }}
                          data-bs-toggle="dropdown"
                        >
                          <i className="ti ti-map-pin fs-14" />
                          {selectedLoc?.name ?? "Select Location"}
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                          {locations.map((loc) => (
                            <li key={loc.id}>
                              <button
                                type="button"
                                className={`dropdown-item d-flex align-items-center gap-2 fs-13${selectedLoc?.id === loc.id ? " active" : ""}`}
                                onClick={() => {
                                  setSelectedLoc(loc);
                                  setBillingEdit(false);
                                  setBillingError(null);
                                  setShippingEdit(false);
                                  setShippingError(null);
                                }}
                              >
                                {loc.name}
                                {loc.is_primary && (
                                  <span className="ms-auto badge fs-11" style={{ background: "#ffd6d2", color: "#E41F07" }}>Primary</span>
                                )}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <span className="badge fs-12" style={{ background: "#f1f3f5", color: "#6c757d" }}>
                        {locations[0].name}
                      </span>
                    )}
                  </div>
                ) : null}

                {/* ── Logo + Org Name cards (side by side) ── */}
                <div className="row g-3 mb-3">

                  {/* Location Image */}
                  <div className="col-md-6">
                    <div className="card border h-100">
                      <div className="card-body p-0">
                        <div className="px-4 py-3 border-bottom">
                          <h6 className="fw-semibold fs-15 mb-0">Location Image</h6>
                        </div>
                        <div className="px-4 py-4 d-flex flex-column align-items-center">
                          {logoError && <div className="alert alert-danger py-2 fs-13 mb-3 w-100">{logoError}</div>}
                          <label
                            htmlFor="org_image_input"
                            className="border rounded d-flex flex-column align-items-center justify-content-center text-center position-relative overflow-hidden"
                            style={{ cursor: logoUploading ? "wait" : "pointer", background: "#fafafa", height: 180, width: "100%", maxWidth: 260 }}
                          >
                            {logoPreview ? (
                              <img src={logoPreview} alt="Location" style={{ height: "100%", width: "100%", objectFit: "contain", padding: 8 }} />
                            ) : (
                              <>
                                <i className="ti ti-photo-up text-primary fs-28 mb-1" />
                                <span className="fw-semibold fs-13">Upload Image</span>
                                <small className="text-muted mt-1" style={{ fontSize: 11 }}>PNG, JPG up to 5 MB</small>
                              </>
                            )}
                            {logoUploading && (
                              <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: "rgba(255,255,255,0.75)" }}>
                                <span className="spinner-border spinner-border-sm text-primary" />
                              </div>
                            )}
                            {logoPreview && !logoUploading && (
                              <button type="button" className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 p-1 lh-1"
                                style={{ fontSize: 11, zIndex: 1 }} onClick={handleLogoRemove}>
                                <i className="ti ti-x" />
                              </button>
                            )}
                          </label>
                          <input id="org_image_input" type="file" accept="image/*" className="d-none"
                            onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoChange(f); }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Organisation Name */}
                  <div className="col-md-6">
                    <div className="card border h-100">
                      <div className="card-body p-0">
                        <div className="px-4 py-3 border-bottom d-flex align-items-center justify-content-between">
                          <h6 className="fw-semibold fs-15 mb-0">Organisation Name</h6>
                          {!orgNameEdit && (
                            <button type="button" className="btn btn-outline-light shadow d-flex align-items-center gap-1"
                              style={{ height: 36 }} onClick={handleOrgNameEdit}>
                              <i className="ti ti-pencil" style={{ fontSize: 13 }} />Edit
                            </button>
                          )}
                        </div>
                        <div className="px-4 py-4">
                          {orgNameEdit ? (
                            <>
                              {orgNameError && <div className="text-danger fs-13 mb-1">{orgNameError}</div>}
                              <input type="text" className="form-control fs-14 mb-3" placeholder="Enter organisation name"
                                value={orgNameValue} onChange={(e) => { setOrgNameValue(e.target.value); setOrgNameError(null); }} />
                              <div className="d-flex align-items-center gap-2">
                                <button type="button" className="btn btn-primary d-flex align-items-center gap-1" style={{ height: 38 }}
                                  onClick={handleOrgNameSave} disabled={orgNameSaving}>
                                  {orgNameSaving ? <span className="spinner-border spinner-border-sm" /> : <i className="ti ti-device-floppy" style={{ fontSize: 14 }} />}
                                  Save
                                </button>
                                <button type="button" className="btn btn-outline-light shadow" style={{ height: 38 }}
                                  onClick={() => { setOrgNameEdit(false); setOrgNameError(null); }} disabled={orgNameSaving}>
                                  Cancel
                                </button>
                              </div>
                            </>
                          ) : (
                            <p className="fs-14 fw-medium mb-0">
                              {orgNameCurrent || "—"}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* ── Address cards ── */}
                {selectedLoc && (
                  <div className="row g-3">

                    {/* Billing Address */}
                    <div className="col-md-6">
                      <div className="card border h-100">
                        <div className="card-body p-0">
                          <div className="px-4 py-3 border-bottom d-flex align-items-center justify-content-between">
                            <h6 className="fw-semibold fs-15 mb-0">Billing Address</h6>
                            {!billingEdit && (
                              <button type="button" className="btn btn-outline-light shadow d-flex align-items-center gap-1"
                                style={{ height: 36 }} onClick={handleBillingEdit}>
                                <i className="ti ti-pencil" style={{ fontSize: 13 }} />Edit
                              </button>
                            )}
                          </div>
                          <div className="px-4 py-3">
                            {billingEdit ? (
                              <>
                                {billingError && <div className="alert alert-danger py-2 fs-13 mb-3">{billingError}</div>}
                                <AddressForm
                                  form={billingForm}
                                  onChange={setBillingForm}
                                  countryList={countryList}
                                  countriesLoading={countriesLoading}
                                  phoneMaxLengths={phoneMaxLengths}
                                  stateOptions={billingStateOptions}
                                  statesLoading={false}
                                  onCountryChange={handleBillingCountryChange}
                                />
                                <div className="d-flex gap-2 mt-3">
                                  <button type="button" className="btn btn-primary d-flex align-items-center gap-1" style={{ height: 36 }}
                                    onClick={() => handleAddressSave("billing")} disabled={billingSaving}>
                                    {billingSaving ? <span className="spinner-border spinner-border-sm" /> : <i className="ti ti-device-floppy" style={{ fontSize: 13 }} />}Save
                                  </button>
                                  <button type="button" className="btn btn-outline-light shadow" style={{ height: 36 }}
                                    onClick={() => { setBillingEdit(false); setBillingError(null); }} disabled={billingSaving}>Cancel</button>
                                </div>
                              </>
                            ) : (
                              <AddressDisplay address={selectedLoc.address} />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="col-md-6">
                      <div className="card border h-100">
                        <div className="card-body p-0">
                          <div className="px-4 py-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
                            <div className="d-flex align-items-center gap-2">
                              <h6 className="fw-semibold fs-15 mb-0">Shipping Address</h6>
                              {shippingEdit && (
                                <button type="button"
                                  className="btn btn-link p-0 fs-13 d-flex align-items-center gap-1"
                                  style={{ textDecoration: "none", color: "#E41F07" }}
                                  onClick={() => {
                                    setShippingForm({ ...billingForm });
                                    setShippingStateOptions(billingStateOptions);
                                  }}>
                                  <i className="ti ti-copy fs-14" />Copy billing address
                                </button>
                              )}
                            </div>
                            {!shippingEdit && (
                              <button type="button" className="btn btn-outline-light shadow d-flex align-items-center gap-1"
                                style={{ height: 36 }} onClick={handleShippingEdit}>
                                <i className="ti ti-pencil" style={{ fontSize: 13 }} />Edit
                              </button>
                            )}
                          </div>
                          <div className="px-4 py-3">
                            {shippingEdit ? (
                              <>
                                {shippingError && <div className="alert alert-danger py-2 fs-13 mb-3">{shippingError}</div>}
                                <AddressForm
                                  form={shippingForm}
                                  onChange={setShippingForm}
                                  countryList={countryList}
                                  countriesLoading={countriesLoading}
                                  phoneMaxLengths={phoneMaxLengths}
                                  stateOptions={shippingStateOptions}
                                  statesLoading={false}
                                  onCountryChange={handleShippingCountryChange}
                                />
                                <div className="d-flex gap-2 mt-3">
                                  <button type="button" className="btn btn-primary d-flex align-items-center gap-1" style={{ height: 36 }}
                                    onClick={() => handleAddressSave("shipping")} disabled={shippingSaving}>
                                    {shippingSaving ? <span className="spinner-border spinner-border-sm" /> : <i className="ti ti-device-floppy" style={{ fontSize: 13 }} />}Save
                                  </button>
                                  <button type="button" className="btn btn-outline-light shadow" style={{ height: 36 }}
                                    onClick={() => { setShippingEdit(false); setShippingError(null); }} disabled={shippingSaving}>Cancel</button>
                                </div>
                              </>
                            ) : (
                              <AddressDisplay address={selectedLoc.shipping_address} />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            )}
            {activeTab === "security" && (
              <div className="card border mb-0">
                <div className="card-body p-0">

                  <div className="px-4 py-3 border-bottom">
                    <h6 className="fw-semibold fs-15 mb-0">Change Password</h6>
                  </div>

                  <div className="px-4 py-4" style={{ maxWidth: 520 }}>

                    {pwSuccess && (
                      <div className="alert alert-success py-2 fs-13 mb-4 d-flex align-items-center gap-2">
                        <i className="ti ti-circle-check fs-16" />
                        Password changed successfully.
                      </div>
                    )}
                    {pwError && (
                      <div className="alert alert-danger py-2 fs-13 mb-4">{pwError}</div>
                    )}

                    {/* Current Password */}
                    <div className="row mb-3 align-items-center">
                      <label className="col-sm-4 col-form-label fw-medium fs-14">Current Password</label>
                      <div className="col-sm-8">
                        <div className="input-group">
                          <input
                            type={showPw.current ? "text" : "password"}
                            className="form-control fs-14"
                            autoComplete="new-password"
                            placeholder="Enter current password"
                            value={pwForm.current}
                            onChange={(e) => { setPwForm((f) => ({ ...f, current: e.target.value })); setPwError(null); setPwSuccess(false); }}
                          />
                          <button type="button" className="btn btn-outline-danger"
                            onClick={() => setShowPw((s) => ({ ...s, current: !s.current }))}>
                            <i className={`ti ${showPw.current ? "ti-eye-off" : "ti-eye"}`} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* New Password */}
                    <div className="row mb-3 align-items-center">
                      <label className="col-sm-4 col-form-label fw-medium fs-14">New Password</label>
                      <div className="col-sm-8">
                        <div className="input-group">
                          <input
                            type={showPw.newPw ? "text" : "password"}
                            className="form-control fs-14"
                            autoComplete="new-password"
                            placeholder="Enter new password"
                            value={pwForm.newPw}
                            onChange={(e) => { setPwForm((f) => ({ ...f, newPw: e.target.value })); setPwError(null); setPwSuccess(false); }}
                          />
                          <button type="button" className="btn btn-outline-danger"
                            onClick={() => setShowPw((s) => ({ ...s, newPw: !s.newPw }))}>
                            <i className={`ti ${showPw.newPw ? "ti-eye-off" : "ti-eye"}`} />
                          </button>
                        </div>
                        <small className="text-muted mt-1 d-block" style={{ fontSize: 11 }}>
                          Min 8 characters · uppercase · number · special character
                        </small>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="row mb-4 align-items-center">
                      <label className="col-sm-4 col-form-label fw-medium fs-14">Confirm Password</label>
                      <div className="col-sm-8">
                        <div className="input-group">
                          <input
                            type={showPw.confirm ? "text" : "password"}
                            className="form-control fs-14"
                            autoComplete="new-password"
                            placeholder="Re-enter new password"
                            value={pwForm.confirm}
                            onChange={(e) => { setPwForm((f) => ({ ...f, confirm: e.target.value })); setPwError(null); setPwSuccess(false); }}
                          />
                          <button type="button" className="btn btn-outline-danger"
                            onClick={() => setShowPw((s) => ({ ...s, confirm: !s.confirm }))}>
                            <i className={`ti ${showPw.confirm ? "ti-eye-off" : "ti-eye"}`} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary d-flex align-items-center gap-2"
                      style={{ height: 44 }}
                      onClick={handlePasswordSave}
                      disabled={pwSaving}
                    >
                      {pwSaving
                        ? <span className="spinner-border spinner-border-sm" />
                        : <i className="ti ti-lock-check" style={{ fontSize: 15 }} />}
                      Update Password
                    </button>

                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
};

export default Profile;
