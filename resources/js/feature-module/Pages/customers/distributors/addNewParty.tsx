import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../../core/redux/store";
import { startLoading, stopLoading } from "../../../../core/redux/loaderSlice";
import { Toast } from "react-bootstrap";
import { useNavigate, useParams } from "react-router";
import CreatableSelect from "react-select/creatable";
import PageHeader from "../../../../components/page-header/pageHeader";
import Footer from "../../../../components/footer/footer";
import CommonSelect, { Option } from "../../../../components/common-select/commonSelect";
import CustomFieldsPanel, { type CustomFieldsPanelHandle } from "../../../../components/custom-fields/CustomFieldsPanel";
import { getDistributionCategories, bustDistributionCategories, type DistributionCategory } from "../../../../core/cache/distributionCategoryCache";
import { getDistributionSubCategories, bustDistributionSubCategories, type DistributionSubCategory } from "../../../../core/cache/distributionSubCategoryCache";
import { getNodeList } from "../../../../core/cache/distributionLocationCache";
import type { DistributionLocationNode } from "../../../../core/services/distributionLocationApi";
import { sanitizePhone, phonePlaceholder, getPhoneMaxLength } from "../../../../utils/phoneUtils";
import { DEFAULT_PHONE_CODES, DEFAULT_COUNTRIES, getCachedPhoneCodes, getCachedCountries, getStatesForCountry, type CountryOption as PhoneUtilCountryOption } from "../../../../utils/phoneCodesUtils";
import { Country } from "country-state-city";
import { storeParty, updateParty, fetchPartyDetail, uploadPartyImage, uploadPartyDocument, fetchTakenLocations, checkPartyDisplayNameExists } from "../../../../core/services/partyApi";
import { bustPartyList, bustParty } from "../../../../core/cache/partyCache";
import { emitMutation } from "../../../../core/cache/mutationEvents";
import { getSettings } from "../../../../core/cache/settingCache";
import type { CustomerConfiguration } from "../../../../core/services/settingApi";
import { getRoleList, getRoleDetail, type RoleListItem } from "../../../../core/cache/roleCache";
import {
  PermissionsTable,
  type ModuleRow, type RowPerms, type PermMap,
  BLANK_ITEMS, BLANK_INVENTORY, BLANK_SALES, BLANK_OTHERS,
  applyPerms,
} from "../../user-management/roles-permissions/PermissionsTable";
import type { ExtraPermsValue } from "../../user-management/roles-permissions/PartiesExtraPermsModal";

type CustomerType = "business" | "individual";
type CountryOption = PhoneUtilCountryOption;
type TabKey = "other" | "address" | "location" | "contacts" | "custom" | "tags" | "remarks";

interface ContactPerson {
  id: string;
  salutation: Option | null;
  name: string;
  emailAddress: string;
  mobileCode: Option;
  mobile: string;
}

function createEmptyContact(): ContactPerson {
  return {
    id: Math.random().toString(36).slice(2),
    salutation: null,
    name: "",
    emailAddress: "",
    mobileCode: { value: "+91", label: "+91" },
    mobile: "",
  };
}

const salutationOptions: Option[] = [
  { value: "Mr.", label: "Mr." },
  { value: "Mrs.", label: "Mrs." },
  { value: "Ms.", label: "Ms." },
  { value: "Dr.", label: "Dr." },
  { value: "Prof.", label: "Prof." },
];


const languageOptions: Option[] = [
  { value: "english", label: "English" },
  { value: "hindi", label: "Hindi" },
  { value: "tamil", label: "Tamil" },
  { value: "telugu", label: "Telugu" },
];

// Built once from bundled country-state-city data — no network, no loading state
const CURRENCY_OPTIONS: Option[] = (() => {
  const map = new Map<string, { name: string; symbol: string }>();
  for (const c of Country.getAllCountries()) {
    if (c.currency && !map.has(c.currency)) {
      map.set(c.currency, { name: c.currencyName ?? "", symbol: c.currencySymbol ?? "" });
    }
  }
  return Array.from(map.entries())
    .map(([code, { name, symbol }]) => {
      let label = code;
      if (name) label += ` - ${name}`;
      if (symbol && symbol !== code) label += ` (${symbol})`;
      return { value: code, label };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
})();


const paymentTermsOptions: Option[] = [
  { value: "due_on_receipt", label: "Due on Receipt" },
  { value: "net_15", label: "Net 15" },
  { value: "net_30", label: "Net 30" },
  { value: "net_45", label: "Net 45" },
  { value: "net_60", label: "Net 60" },
];

// ── GST character-by-character validation ─────────────────────────────────────
// Format: [0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]
const GST_CHAR_RULES: RegExp[] = [
  /^[0-9]$/, /^[0-9]$/,                              // 0-1:  state code (digits)
  /^[A-Z]$/, /^[A-Z]$/, /^[A-Z]$/, /^[A-Z]$/, /^[A-Z]$/, // 2-6: PAN letters
  /^[0-9]$/, /^[0-9]$/, /^[0-9]$/, /^[0-9]$/,       // 7-10: PAN digits
  /^[A-Z]$/,                                          // 11:   PAN last letter
  /^[1-9A-Z]$/,                                       // 12:   entity number
  /^Z$/,                                              // 13:   always Z
  /^[0-9A-Z]$/,                                       // 14:   checksum
];
const GST_PLACEHOLDER = "99AAAAA9999A9Z9";
const GST_GROUP_LABELS = [
  { end: 1,  label: "State" },
  { end: 6,  label: "PAN" },
  { end: 10, label: "" },
  { end: 11, label: "" },
  { end: 12, label: "Entity" },
  { end: 13, label: "Z" },
  { end: 14, label: "Chk" },
];

const tabs: { key: TabKey; label: string }[] = [
  { key: "other", label: "Other Details" },
  { key: "address", label: "Address" },
  { key: "location", label: "Location" },
  { key: "contacts", label: "Contact Persons" },
  { key: "custom", label: "Custom Fields" },
  { key: "tags", label: "Role" },
  { key: "remarks", label: "Remarks" },
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
  menuPortal: (base: any) => ({ ...base, zIndex: 999 }),
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const getFileIcon = (file: File): { icon: string; color: string } => {
  if (file.type.startsWith("image/")) return { icon: "ti-photo", color: "#3b82f6" };
  if (file.type === "application/pdf") return { icon: "ti-file-type-pdf", color: "#ef4444" };
  if (file.type.includes("word")) return { icon: "ti-file-type-doc", color: "#2563eb" };
  if (file.type.includes("sheet") || file.type.includes("excel")) return { icon: "ti-file-type-xls", color: "#16a34a" };
  return { icon: "ti-paperclip", color: "#6b7280" };
};

// ── Location Node Picker ──────────────────────────────────────────────────────

interface NavFrame {
  nodeId: number | null;
  nodeName: string | null;
  nodes: DistributionLocationNode[];
}

interface LocationNodePickerProps {
  countryId: number;
  startParentId: number | null;
  assignedDepth: number | null;
  value: Option[];
  onChange: (opts: Option[]) => void;
  takenNodeIds?: number[];
}

const CLEAR_SVG_PATH = "M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z";
const CHEVRON_SVG_PATH = "M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z";

const LocationNodePicker: React.FC<LocationNodePickerProps> = ({
  countryId, startParentId, assignedDepth, value, onChange, takenNodeIds = [],
}) => {
  const [open, setOpen] = useState(false);
  const [dropDir, setDropDir] = useState<"down" | "up">("down");
  const [stack, setStack] = useState<NavFrame[]>([]);
  const [panelLoading, setPanelLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStack([]);
    setPanelLoading(true);
    getNodeList(countryId, startParentId)
      .then((nodes) => {
        const active = nodes.filter((n) => n.is_active);
        setStack([{ nodeId: startParentId, nodeName: null, nodes: active }]);
      })
      .catch(() => setStack([{ nodeId: startParentId, nodeName: null, nodes: [] }]))
      .finally(() => setPanelLoading(false));
  }, [countryId, startParentId]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const current = stack[stack.length - 1];

  const navigateInto = async (node: DistributionLocationNode) => {
    // Hard guard: never navigate at or past the assigned depth
    if (assignedDepth !== null && Number(node.depth) >= Number(assignedDepth)) return;
    setPanelLoading(true);
    try {
      const children = await getNodeList(countryId, node.id);
      setStack((prev) => [
        ...prev,
        { nodeId: node.id, nodeName: node.name, nodes: children.filter((n) => n.is_active) },
      ]);
    } catch { /* ignore */ }
    finally { setPanelLoading(false); }
  };

  const toggleSelect = (node: DistributionLocationNode) => {
    const opt: Option = { value: String(node.id), label: node.name };
    const exists = value.some((v) => v.value === opt.value);
    onChange(exists ? value.filter((v) => v.value !== opt.value) : [...value, opt]);
  };

  return (
    <div ref={wrapperRef} className="position-relative" style={open ? { zIndex: 10 } : undefined}>
      {/* ── Control ── */}
      <div
        className="d-flex align-items-center"
        style={{
          border: "1px solid var(--border-color)", borderRadius: 6,
          minHeight: 38, background: "#fff", cursor: "pointer", userSelect: "none",
        }}
        onClick={() => {
          if (!open && wrapperRef.current) {
            const rect = wrapperRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            setDropDir(spaceBelow >= 280 || spaceBelow >= spaceAbove ? "down" : "up");
          }
          setOpen((o) => !o);
        }}
      >
        {/* Value / placeholder */}
        {value.length === 0 ? (
          <div style={{ flex: 1, padding: "6px 12px", fontSize: 14, color: "#aaa" }}>
            Select location…
          </div>
        ) : (
          <div style={{ flex: 1, padding: "4px 8px", display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
            {value.map((v) => (
              <span key={v.value} style={{
                display: "inline-flex", alignItems: "center",
                background: "hsl(0,0%,90%)", borderRadius: 2, margin: 2,
                fontSize: "85%", color: "hsl(0,0%,20%)",
              }}>
                <span style={{ padding: "3px 3px 3px 6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {v.label}
                </span>
                <span
                  onClick={(e) => { e.stopPropagation(); onChange(value.filter((x) => x.value !== v.value)); }}
                  style={{ cursor: "pointer", display: "flex", alignItems: "center", padding: "0 4px", color: "hsl(0,0%,40%)", borderRadius: 2 }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "hsl(0,0%,80%)"; (e.currentTarget as HTMLElement).style.color = "hsl(0,0%,20%)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "hsl(0,0%,40%)"; }}
                >
                  <svg height="14" width="14" viewBox="0 0 20 20" fill="currentColor">
                    <path d={CLEAR_SVG_PATH} />
                  </svg>
                </span>
              </span>
            ))}
          </div>
        )}

        {/* Indicators */}
        <div className="d-flex align-items-center">
          {value.length > 0 && (
            <span
              style={{ padding: "0 4px", color: "hsl(0,0%,70%)", display: "flex", alignItems: "center", cursor: "pointer" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "hsl(0,0%,45%)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "hsl(0,0%,70%)"; }}
              onClick={(e) => { e.stopPropagation(); onChange([]); }}
            >
              <svg height="20" width="20" viewBox="0 0 20 20" fill="currentColor">
                <path d={CLEAR_SVG_PATH} />
              </svg>
            </span>
          )}
          <span
            style={{ padding: "0 8px", color: "hsl(0,0%,70%)", display: "flex", alignItems: "center" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "hsl(0,0%,45%)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "hsl(0,0%,70%)"; }}
          >
            <svg height="20" width="20" viewBox="0 0 20 20" fill="currentColor"
              style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 200ms" }}>
              <path d={CHEVRON_SVG_PATH} />
            </svg>
          </span>
        </div>
      </div>

      {/* ── Dropdown panel ── */}
      {open && (
        <div
          className="position-absolute bg-white border rounded shadow-sm"
          style={{
            ...(dropDir === "down" ? { top: "calc(100% + 4px)" } : { bottom: "calc(100% + 4px)" }),
            left: 0, right: 0, zIndex: 1050, maxHeight: 280, overflowY: "auto",
          }}
        >
          {/* Back header: parent node name (non-selectable breadcrumb) */}
          {stack.length > 1 && current?.nodeName && (
            <div
              className="d-flex align-items-center gap-2 px-3 py-2 border-bottom"
              style={{ cursor: "pointer", background: "#f8f9fa", position: "sticky", top: 0 }}
              onClick={() => setStack((prev) => prev.slice(0, -1))}
            >
              <i className="ti ti-arrow-left fs-13" style={{ color: "#707070" }} />
              <span className="fs-15 fw-medium" style={{ color: "#707070" }}>{current.nodeName}</span>
            </div>
          )}

          {/* Rows */}
          {panelLoading ? (
            <div className="px-3 py-3 d-flex align-items-center gap-2 text-muted fs-14">
              <span className="spinner-border spinner-border-sm" />
              Loading…
            </div>
          ) : !current || current.nodes.length === 0 ? (
            <div className="px-3 py-3 text-center fs-15" style={{ color: "#707070" }}>No locations found</div>
          ) : (
            current.nodes.map((node) => {
              const isSelectable = assignedDepth !== null && Number(node.depth) === Number(assignedDepth);
              const isTaken     = isSelectable && takenNodeIds.includes(node.id);
              const isSelected  = isSelectable && !isTaken && value.some((v) => v.value === String(node.id));
              return isSelectable ? (
                isTaken ? (
                  <div
                    key={node.id}
                    className="d-flex align-items-center justify-content-between px-3 py-2 fs-15"
                    style={{ cursor: "not-allowed", color: "#ccc", background: "#fafafa" }}
                    title="Already assigned to another party"
                  >
                    <span className="flex-grow-1">{node.name}</span>
                    <i className="ti ti-lock fs-13" style={{ color: "#ccc", flexShrink: 0 }} />
                  </div>
                ) : (
                <div
                  key={node.id}
                  className="d-flex align-items-center justify-content-between px-3 py-2 fs-15"
                  style={{ cursor: "pointer", background: isSelected ? "#E41F07" : "transparent", color: isSelected ? "#fff" : "#707070" }}
                  onClick={() => toggleSelect(node)}
                  onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.color = "#E41F07"; }}
                  onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.color = "#707070"; }}
                >
                  <span className="flex-grow-1">{node.name}</span>
                  {isSelected && <i className="ti ti-check fs-14" style={{ color: "#fff", flexShrink: 0 }} />}
                </div>
                )
              ) : (
                <div
                  key={node.id}
                  className="d-flex align-items-center justify-content-between px-3 py-2 fs-15"
                  style={{ cursor: "pointer", color: "#707070" }}
                  onClick={() => navigateInto(node)}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#E41F07"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#707070"; }}
                >
                  <span className="flex-grow-1">{node.name}</span>
                  <i className="ti ti-chevron-right fs-14" style={{ color: "inherit", flexShrink: 0 }} />
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

interface AddNewPartyProps {
  modalMode?: boolean;
  onModalClose?: () => void;
  onModalSaved?: (id: number, name: string) => void;
  prefillQuery?: string;
}

const AddNewParty = ({ modalMode = false, onModalClose, onModalSaved, prefillQuery }: AddNewPartyProps = {}) => {
  const navigate   = useNavigate();
  const dispatch   = useDispatch();
  const authUser   = useSelector((state: RootState) => state.auth.user);
  // null permissions = super_admin (full access); empty/null party_category_ids = no restriction
  const allowedCatIds = (() => {
    const ids = authUser?.permissions?.parties?.others_data?.party_category_ids;
    return Array.isArray(ids) && ids.length > 0 ? ids.map(Number) : null;
  })();
  const { id }     = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const editId     = id ? parseInt(id, 10) : null;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const docDropdownRef = useRef<HTMLDivElement>(null);
  const docTriggerRef = useRef<HTMLDivElement>(null);
  const cfPanelRef = useRef<CustomFieldsPanelHandle>(null);
  const isDirtyRef              = useRef(false);
  const allowDuplicateNamesRef  = useRef<boolean>(true);   // permissive until settings load
  const originalDisplayNameRef  = useRef<string | null>(null); // captured in edit prefill
  const [docDropPos, setDocDropPos] = useState<"top" | "bottom">("bottom");
  const [nameCheckLoading, setNameCheckLoading] = useState(false);

  // ── Role tab state (company users only) ──────────────────────────────────────
  const isCompanyUser = authUser?.user_type !== "party";
  const [roles,            setRoles]            = useState<RoleListItem[]>([]);
  const [rolesLoading,     setRolesLoading]      = useState(true);
  const [overrideRoleId,   setOverrideRoleId]    = useState("");
  const [roleDetailLoading, setRoleDetailLoading] = useState(false);
  const [isSystemRole,      setIsSystemRole]      = useState(false);
  const [itemsRows,     setItemsRows]     = useState<ModuleRow[]>(BLANK_ITEMS);
  const [inventoryRows, setInventoryRows] = useState<ModuleRow[]>(BLANK_INVENTORY);
  const [salesRows,     setSalesRows]     = useState<ModuleRow[]>(BLANK_SALES);
  const [othersRows,    setOthersRows]    = useState<ModuleRow[]>(BLANK_OTHERS);

  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
    show: false, message: "", type: "success",
  });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, message, type });
    toastTimerRef.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 4000);
  };

  const [customerType, setCustomerType] = useState<CustomerType>("business");
  const [salutation, setSalutation] = useState<Option | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [displayName, setDisplayName] = useState<Option | null>(null);
  const [email, setEmail] = useState("");
  const [mobileCountryCode, setMobileCountryCode] = useState<Option | null>({ value: "+91", label: "+91" });
  const [mobile, setMobile] = useState("");
  const [language, setLanguage] = useState<Option | null>({ value: "english", label: "English" });

  const [pan, setPan] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [upiNumber, setUpiNumber] = useState("");
  const [gst, setGst] = useState("");
  const [currencyOptions] = useState<Option[]>(CURRENCY_OPTIONS);
  const [currency, setCurrency] = useState<Option | null>(CURRENCY_OPTIONS.find(o => o.value === "INR") ?? null);
  const [paymentTerms, setPaymentTerms] = useState<Option | null>({ value: "due_on_receipt", label: "Due on Receipt" });
  const [enablePortal, setEnablePortal] = useState(false);
  const [documents, setDocuments] = useState<File[]>([]);
  const [showDocList, setShowDocList] = useState(false);

  const [activeTab, setActiveTab] = useState<TabKey>("other");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [allDistCategories, setAllDistCategories] = useState<DistributionCategory[]>([]);
  const [distCategoryOptions, setDistCategoryOptions] = useState<Option[]>([]);
  const [indivCategoryOptions, setIndivCategoryOptions] = useState<Option[]>([]);
  const [distCategory, setDistCategory] = useState<Option | null>(null);
  const [indivCategory, setIndivCategory] = useState<Option | null>(null);
  const [allSubCategories, setAllSubCategories] = useState<DistributionSubCategory[]>([]);
  const [distSubCategoryOptions, setDistSubCategoryOptions] = useState<Option[]>([]);
  const [distSubCategory, setDistSubCategory] = useState<Option | null>(null);
  const [locationCountryId, setLocationCountryId] = useState<number | null>(null);
  const [locationStartParentId, setLocationStartParentId] = useState<number | null>(null);
  const [locationAssignedDepth, setLocationAssignedDepth] = useState<number | null>(null);
  const [locationConfigured, setLocationConfigured] = useState<boolean | null>(null);
  const [takenLocationIds, setTakenLocationIds] = useState<number[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<Option[]>([]);
  const [locationIsUnified, setLocationIsUnified] = useState<boolean>(false);

  const [countryList, setCountryList] = useState<CountryOption[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(true);

  const [billingAttention, setBillingAttention] = useState("");
  const [billingCountry, setBillingCountry] = useState<CountryOption | null>(null);
  const [billingStateOptions, setBillingStateOptions] = useState<Option[]>(getStatesForCountry("IN"));
  const [billingStreet1, setBillingStreet1] = useState("");
  const [billingStreet2, setBillingStreet2] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingState, setBillingState] = useState<Option | null>(null);
  const [billingPinCode, setBillingPinCode] = useState("");
  const [billingCountryCode, setBillingCountryCode] = useState("+91");
  const [billingPhone, setBillingPhone] = useState("");
  const [billingFax, setBillingFax] = useState("");

  const [shippingAttention, setShippingAttention] = useState("");
  const [shippingCountry, setShippingCountry] = useState<CountryOption | null>(null);
  const [shippingStateOptions, setShippingStateOptions] = useState<Option[]>(getStatesForCountry("IN"));
  const [shippingStreet1, setShippingStreet1] = useState("");
  const [shippingStreet2, setShippingStreet2] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingState, setShippingState] = useState<Option | null>(null);
  const [shippingPinCode, setShippingPinCode] = useState("");
  const [shippingCountryCode, setShippingCountryCode] = useState("+91");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingFax, setShippingFax] = useState("");

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImagePath, setExistingImagePath] = useState<string | null>(null);
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);

  const pendingSubCatIdRef    = useRef<string | null>(null);
  const pendingLocationsRef   = useRef<Option[]>([]);
  const ownLocationNodeIdsRef = useRef<number[]>([]);
  const skipRoleDefaultsRef   = useRef(false);
  const [contactPersons, setContactPersons] = useState<ContactPerson[]>([createEmptyContact()]);
  const [phoneCodeOptions, setPhoneCodeOptions] = useState<Option[]>(DEFAULT_PHONE_CODES);
  const [phoneMaxLengths, setPhoneMaxLengths] = useState<Record<string, number>>({});
  const [phoneCodesLoading, setPhoneCodesLoading] = useState(true);

  const updateContact = (id: string, patch: Partial<ContactPerson>) =>
    setContactPersons((prev) => prev.map((cp) => (cp.id === id ? { ...cp, ...patch } : cp)));
  const removeContact = (id: string) =>
    setContactPersons((prev) => prev.filter((cp) => cp.id !== id));
  const addContact = () =>
    setContactPersons((prev) => [...prev, createEmptyContact()]);

  const handleDisplayNameBlur = async () => {
    if (allowDuplicateNamesRef.current || !displayName?.value) return;
    const name = displayName.value.trim();
    if (!name) return;
    const nameChanged = !isEditMode || name !== originalDisplayNameRef.current;
    if (!nameChanged) return;
    const excludeId = isEditMode && editId ? Number(editId) : undefined;
    setNameCheckLoading(true);
    try {
      const exists = await checkPartyDisplayNameExists(name, excludeId);
      if (exists) setErrors((prev) => ({ ...prev, displayName: `A party named "${name}" already exists.` }));
    } finally {
      setNameCheckLoading(false);
    }
  };

  // Load customer settings: apply default_customer_type for new parties;
  // capture allow_duplicate_names for use at save time.
  useEffect(() => {
    getSettings<CustomerConfiguration>("customers")
      .then((cfg) => {
        allowDuplicateNamesRef.current = cfg.allow_duplicate_names ?? true;
        if (!isEditMode) setCustomerType(cfg.default_customer_type ?? "business");
      })
      .catch(() => { /* keep defaults */ });
  }, [isEditMode]);

  useEffect(() => {
    if (!isCompanyUser) { setRolesLoading(false); return; }
    getRoleList()
      .then(res => setRoles(res.data))
      .catch(() => {})
      .finally(() => setRolesLoading(false));
  }, [isCompanyUser]);

  useEffect(() => {
    if (!overrideRoleId) {
      setIsSystemRole(false);
      setItemsRows(BLANK_ITEMS);
      setInventoryRows(BLANK_INVENTORY);
      setSalesRows(BLANK_SALES);
      setOthersRows(BLANK_OTHERS);
      return;
    }
    // Edit prefill sets this flag so we don't overwrite party-specific permissions with role defaults
    if (skipRoleDefaultsRef.current) {
      skipRoleDefaultsRef.current = false;
      return;
    }
    setRoleDetailLoading(true);
    getRoleDetail(Number(overrideRoleId))
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
  }, [overrideRoleId]);

  useEffect(() => {
    getCachedPhoneCodes()
      .then(({ options, maxLengths }) => {
        setPhoneCodeOptions(options);
        setPhoneMaxLengths(maxLengths);
      })
      .catch(() => {})
      .finally(() => setPhoneCodesLoading(false));
  }, []);

  useEffect(() => {
    setCountryList(DEFAULT_COUNTRIES);
    const indiaDefault = DEFAULT_COUNTRIES.find((c) => c.value === "India") ?? null;
    setBillingCountry(indiaDefault);
    setShippingCountry(indiaDefault);
    setBillingCountryCode(indiaDefault?.phoneCode ?? "+91");
    setShippingCountryCode(indiaDefault?.phoneCode ?? "+91");

    getCachedCountries()
      .then((countries) => {
        setCountryList(countries);
        const india = countries.find((c) => c.value === "India") ?? null;
        setBillingCountry((prev) => prev ?? india);
        setShippingCountry((prev) => prev ?? india);
      })
      .catch(() => {})
      .finally(() => setCountriesLoading(false));
  }, []);

  useEffect(() => {
    getDistributionCategories().then((cats) => {
      setAllDistCategories(cats);
      let distOpts = cats.filter(c => c.party_type !== "individual").map((c) => ({ value: String(c.id), label: c.name }));
      if (allowedCatIds) distOpts = distOpts.filter(o => allowedCatIds.includes(Number(o.value)));
      setDistCategoryOptions(distOpts);
      let indivOpts = cats.filter(c => c.party_type === "individual").map((c) => ({ value: String(c.id), label: c.name }));
      if (allowedCatIds) indivOpts = indivOpts.filter(o => allowedCatIds.includes(Number(o.value)));
      setIndivCategoryOptions(indivOpts);
    }).catch(() => {});
    getDistributionSubCategories().then(setAllSubCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (!distCategory) {
      setDistSubCategoryOptions([]);
      setDistSubCategory(null);
      if (!isEditMode) setEnablePortal(false);
      return;
    }
    const filtered = allSubCategories.filter((s) => String(s.distribution_category_id) === distCategory.value);
    const opts = filtered.map((s) => ({ value: String(s.id), label: s.name }));
    setDistSubCategoryOptions(opts);
    if (pendingSubCatIdRef.current) {
      const match = opts.find((o) => o.value === pendingSubCatIdRef.current);
      setDistSubCategory(match ?? null);
      pendingSubCatIdRef.current = null;
    } else {
      setDistSubCategory(null);
    }
    const cat = allDistCategories.find((c) => String(c.id) === distCategory.value);
    if (!isEditMode) setEnablePortal(cat?.portal_access ?? false);
  }, [distCategory, allSubCategories, allDistCategories]);

  useEffect(() => {
    // Consume any pending prefill locations before resetting
    const pending = pendingLocationsRef.current;
    pendingLocationsRef.current = [];

    setSelectedLocations(pending.length ? pending : []);
    setLocationCountryId(null);
    setLocationStartParentId(null);
    setLocationAssignedDepth(null);
    setLocationConfigured(null);
    setTakenLocationIds([]);

    if (!distCategory) {
      if (isCompanyUser && !isEditMode) setOverrideRoleId("");
      return;
    }
    const cat = allDistCategories.find((c) => String(c.id) === distCategory.value);

    // Auto-fill role dropdown with category's default role in create mode
    if (isCompanyUser && !isEditMode) {
      setOverrideRoleId(cat?.role_id ? String(cat.role_id) : "");
    }

    if (!cat?.linked_location_country_id || !cat.linked_location_depth) { setLocationConfigured(false); return; }

    setLocationCountryId(cat.linked_location_country_id);
    setLocationStartParentId(cat.linked_location_node_id ?? null);
    setLocationAssignedDepth(cat.linked_location_depth);
    setLocationConfigured(true);

    fetchTakenLocations(Number(distCategory.value)).then((res) => {
      if (res.success) setTakenLocationIds(res.data.filter((n) => !ownLocationNodeIdsRef.current.includes(n)));
    });
  }, [distCategory, allDistCategories]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (docDropdownRef.current && !docDropdownRef.current.contains(e.target as Node)) {
        setShowDocList(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Unsaved-changes guard — warn on browser back/refresh when form is dirty
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  useEffect(() => {
    if (!showDocList || !docTriggerRef.current) return;
    const rect = docTriggerRef.current.getBoundingClientRect();
    const dropdownHeight = documents.length * 52 + 16;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    setDocDropPos(spaceBelow >= dropdownHeight || spaceBelow >= spaceAbove ? "bottom" : "top");
  }, [documents.length, showDocList]);

  const markDirty = () => { isDirtyRef.current = true; };
  const clr = (key: string) => setErrors((p) => { const n = { ...p }; delete n[key]; return n; });
  const handleClose = () => {
    if (modalMode) { onModalClose?.(); }
    else { navigate(-1 as any); }
  };

  // ── Modal: pre-fill from search query ────────────────────────────────────
  useEffect(() => {
    if (!modalMode || !prefillQuery?.trim()) return;
    const q = prefillQuery.trim();
    const isPhone = /^[+\d\s\-().]+$/.test(q) && /\d/.test(q);
    if (isPhone) {
      setMobile(q.replace(/\D/g, ""));
    } else {
      setFirstName(q);
      setDisplayName({ value: q, label: q });
    }
  }, [prefillQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Edit mode: prefill form once all option lists are ready ──────────────
  useEffect(() => {
    if (!isEditMode || !editId) return;
    if (!countryList.length || !currencyOptions.length || !allDistCategories.length) return;

    dispatch(startLoading("edit-party"));
    let cancelled = false;
    fetchPartyDetail(editId).then((res) => {
      if (cancelled || !res.success) { dispatch(stopLoading("edit-party")); return; }
      const d = res.data;

      setCustomerType(d.party_type ?? "business");
      if (d.salutation) setSalutation(salutationOptions.find((o) => o.value === d.salutation) ?? null);
      setFirstName(d.first_name ?? "");
      setLastName(d.last_name ?? "");
      setCompanyName(d.company_name ?? "");
      setDisplayName(d.display_name ? { value: d.display_name, label: d.display_name } : null);
      originalDisplayNameRef.current = d.display_name ?? null;
      setEmail(d.email ?? "");
      if (d.mobile_code) setMobileCountryCode({ value: d.mobile_code, label: d.mobile_code });
      setMobile(d.mobile ?? "");
      if (d.language) setLanguage(languageOptions.find((o) => o.value === d.language) ?? null);

      // Distribution category + subcategory
      if (d.party_type === "individual") {
        const cat = allDistCategories.find((c) => c.id === d.distribution_category_id);
        if (cat) setIndivCategory({ value: String(cat.id), label: cat.name });
      } else if (d.distribution_category_id) {
        if (d.distribution_sub_category_id) {
          pendingSubCatIdRef.current = String(d.distribution_sub_category_id);
        }
        const cat = allDistCategories.find((c) => c.id === d.distribution_category_id);
        if (cat) setDistCategory({ value: String(cat.id), label: cat.name });
      }



      // Currency
      const currOpt = currencyOptions.find((o) => o.value === (d.currency ?? "INR"));
      if (currOpt) setCurrency(currOpt);

      if (d.payment_terms) setPaymentTerms(paymentTermsOptions.find((o) => o.value === d.payment_terms) ?? null);
      setEnablePortal(d.enable_portal ?? false);

      setPan(d.pan ?? "");
      setGst(d.gst ?? "");
      setAccountNumber(d.account_number ?? "");
      setIfscCode(d.ifsc_code ?? "");
      setUpiNumber(d.upi_number ?? "");
      setRemarks(d.remarks ?? "");

      // Image
      if (d.party_image) {
        setExistingImagePath(d.party_image);
        setImagePreview(d.party_image.startsWith("http") || d.party_image.startsWith("/") ? d.party_image : `/storage/${d.party_image}`);
      }

      // Billing address
      if (d.billing_address) {
        const ba = d.billing_address;
        setBillingAttention(ba.attention ?? "");
        setBillingStreet1(ba.street1 ?? "");
        setBillingStreet2(ba.street2 ?? "");
        setBillingCity(ba.city ?? "");
        setBillingPinCode(ba.pin_code ?? "");
        setBillingCountryCode(ba.phone_code ?? "+91");
        setBillingPhone(ba.phone ?? "");
        setBillingFax(ba.fax ?? "");
        if (ba.state) setBillingState({ value: ba.state, label: ba.state });
        const bCountry = countryList.find((c) => c.value === (ba.country ?? ""));
        if (bCountry) {
          setBillingCountry(bCountry);
          setBillingCountryCode(bCountry.phoneCode || "");
          const bStates = getStatesForCountry(bCountry.isoCode);
          setBillingStateOptions(bStates);
          if (ba.state) setBillingState({ value: ba.state, label: ba.state });
        }
      }

      // Shipping address
      if (d.shipping_address) {
        const sa = d.shipping_address;
        setShippingAttention(sa.attention ?? "");
        setShippingStreet1(sa.street1 ?? "");
        setShippingStreet2(sa.street2 ?? "");
        setShippingCity(sa.city ?? "");
        setShippingPinCode(sa.pin_code ?? "");
        setShippingCountryCode(sa.phone_code ?? "+91");
        setShippingPhone(sa.phone ?? "");
        setShippingFax(sa.fax ?? "");
        if (sa.state) setShippingState({ value: sa.state, label: sa.state });
        const sCountry = countryList.find((c) => c.value === (sa.country ?? ""));
        if (sCountry) {
          setShippingCountry(sCountry);
          setShippingCountryCode(sCountry.phoneCode || "");
          const sStates = getStatesForCountry(sCountry.isoCode);
          setShippingStateOptions(sStates);
          if (sa.state) setShippingState({ value: sa.state, label: sa.state });
        }
      }

      // Contact persons
      if (d.contact_persons && d.contact_persons.length > 0) {
        setContactPersons(d.contact_persons.map((cp) => ({
          id: Math.random().toString(36).slice(2),
          salutation: cp.salutation ? (salutationOptions.find((o) => o.value === cp.salutation) ?? null) : null,
          name: cp.name,
          emailAddress: cp.email ?? "",
          mobileCode: cp.mobile_code ? { value: cp.mobile_code, label: cp.mobile_code } : { value: "+91", label: "+91" },
          mobile: cp.mobile ?? "",
        })));
      }

      // Locations — use a ref so the distCategory useEffect doesn't wipe them
      if (d.locations && d.locations.length > 0) {
        const locs = d.locations.map((l) => ({ value: String(l.location_node_id), label: l.location_node?.name ?? String(l.location_node_id) }));
        pendingLocationsRef.current = locs;
        ownLocationNodeIdsRef.current = d.locations.map((l) => l.location_node_id);
      }
      setLocationIsUnified(d.location_type === "unified");

      // Role prefill (company users only)
      if (isCompanyUser && d.role_id) {
        skipRoleDefaultsRef.current = true; // prevent overrideRoleId effect from wiping party-specific perms
        setOverrideRoleId(String(d.role_id));
        if (d.permissions && d.permissions.length > 0) {
          const pm: PermMap = new Map(d.permissions.map(p => [p.module, {
            can_view: p.can_view, can_create: p.can_create, can_edit: p.can_edit,
            can_delete: p.can_delete, can_others: p.can_others, others_data: p.others_data,
          }]));
          setItemsRows(applyPerms(BLANK_ITEMS, pm));
          setInventoryRows(applyPerms(BLANK_INVENTORY, pm));
          setSalesRows(applyPerms(BLANK_SALES, pm));
          setOthersRows(applyPerms(BLANK_OTHERS, pm));
        }
      }

      dispatch(stopLoading("edit-party"));
    }).catch(() => dispatch(stopLoading("edit-party")));

    return () => { cancelled = true; dispatch(stopLoading("edit-party")); };
  }, [isEditMode, editId, countryList.length, currencyOptions.length, allDistCategories.length]);

  const makeRowHandler = (setter: React.Dispatch<React.SetStateAction<ModuleRow[]>>) =>
    (rowKey: string, updated: RowPerms) =>
      setter(prev => prev.map(r => r.key === rowKey ? { ...r, perms: updated } : r));

  const makeExtraSaveHandler = (setter: React.Dispatch<React.SetStateAction<ModuleRow[]>>) =>
    (rowKey: string, val: ExtraPermsValue) =>
      setter(prev => prev.map(r => r.key === rowKey ? { ...r, extraPerms: val } : r));

  const handleBillingCountryChange = (opt: CountryOption | null) => {
    setBillingCountry(opt);
    setBillingState(null);
    setBillingCountryCode(opt?.phoneCode ?? "");
    setBillingStateOptions(opt ? getStatesForCountry(opt.isoCode) : []);
  };

  const handleShippingCountryChange = (opt: CountryOption | null) => {
    setShippingCountry(opt);
    setShippingState(null);
    setShippingCountryCode(opt?.phoneCode ?? "");
    setShippingStateOptions(opt ? getStatesForCountry(opt.isoCode) : []);
  };

  const handleRefresh = async () => {
    // 1. Bust caches so re-fetch hits the server
    bustDistributionCategories();
    bustDistributionSubCategories();

    // 2. Re-fetch all DB-driven option lists in parallel
    const [newCats, newSubs] = await Promise.all([
      getDistributionCategories().catch(() => [] as DistributionCategory[]),
      getDistributionSubCategories().catch(() => [] as DistributionSubCategory[]),
    ]);

    // 3. Push fresh option lists into state
    setAllDistCategories(newCats);
    let newCatOpts = newCats.filter(c => c.party_type !== "individual").map((c) => ({ value: String(c.id), label: c.name }));
    if (allowedCatIds) newCatOpts = newCatOpts.filter(o => allowedCatIds.includes(Number(o.value)));
    setDistCategoryOptions(newCatOpts);
    let newIndivOpts = newCats.filter(c => c.party_type === "individual").map((c) => ({ value: String(c.id), label: c.name }));
    if (allowedCatIds) newIndivOpts = newIndivOpts.filter(o => allowedCatIds.includes(Number(o.value)));
    setIndivCategoryOptions(newIndivOpts);
    setAllSubCategories(newSubs);

    // 4. Validate distCategory — hard-clear if deleted, update label if renamed
    if (distCategory) {
      const catMatch = newCats.find((c) => String(c.id) === distCategory.value);
      if (!catMatch) {
        // Category was deleted: clear it and all dependent state
        setDistCategory(null);
        setDistSubCategory(null);
        setDistSubCategoryOptions([]);
        setSelectedLocations([]);
        setLocationCountryId(null);
        setLocationStartParentId(null);
        setLocationAssignedDepth(null);
        setLocationConfigured(null);
        setEnablePortal(false);
      } else {
        if (catMatch.name !== distCategory.label)
          setDistCategory({ value: distCategory.value, label: catMatch.name });
        // Re-derive sub-category options for this category
        const newSubOpts = newSubs
          .filter((s) => String(s.distribution_category_id) === distCategory.value)
          .map((s) => ({ value: String(s.id), label: s.name }));
        setDistSubCategoryOptions(newSubOpts);
        // Validate distSubCategory
        if (distSubCategory) {
          const subMatch = newSubOpts.find((o) => o.value === distSubCategory.value);
          if (!subMatch)
            setDistSubCategory(null);
          else if (subMatch.label !== distSubCategory.label)
            setDistSubCategory({ value: distSubCategory.value, label: subMatch.label });
        }
      }
    }

    setErrors({});
  };

  const handleSave = async () => {
    // ── 1. Client-side validation ──────────────────────────────────────────────
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!displayName) newErrors.displayName = "Display name is required";
    if (!mobile.trim()) newErrors.mobile = "Mobile number is required";

    if (customerType === "business") {
      if (!distCategory) newErrors.distCategory = "Distribution category is required";
      if (distCategory && !distSubCategory) newErrors.distSubCategory = "Distribution sub category is required";
    }
    if (customerType === "individual") {
      if (!indivCategory) newErrors.indivCategory = "Please select a type (Customer or Shop)";
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Contact persons: filter out rows that are entirely empty; require name on non-empty rows
    const filledContacts = contactPersons.filter(
      (cp) => cp.name.trim() || cp.emailAddress.trim() || cp.mobile.trim()
    );
    const missingNames = filledContacts.filter((cp) => !cp.name.trim());
    if (missingNames.length > 0) {
      newErrors.contacts = "Each contact person must have a name";
    }

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      showToast("Please fill in all required fields before saving.", "error");
      return;
    }

    // ── 2. Location validation ─────────────────────────────────────────────────
    if (locationCountryId !== null && selectedLocations.length === 0) {
      setErrors({ location: "Please select at least one location." });
      setActiveTab("location");
      showToast("Please select at least one location.", "error");
      return;
    }

    // ── 3. Custom fields validation ────────────────────────────────────────────
    const cfValid = cfPanelRef.current?.validate() ?? true;
    if (!cfValid) { setActiveTab("custom"); return; }

    // ── 3. File size check (10 MB per file) ───────────────────────────────────
    const MAX_FILE = 10 * 1024 * 1024;
    const oversized = documents.filter((f) => f.size > MAX_FILE);
    if (oversized.length > 0) {
      setErrors({ documents: `Files exceed 10 MB: ${oversized.map((f) => f.name).join(", ")}` });
      setActiveTab("other");
      return;
    }

    // ── 3b. Duplicate display-name check (when duplicates are not allowed) ────
    if (!allowDuplicateNamesRef.current && displayName) {
      const nameChanged = !isEditMode || displayName.value !== originalDisplayNameRef.current;
      if (nameChanged) {
        const excludeId = isEditMode && editId ? Number(editId) : undefined;
        const nameExists = await checkPartyDisplayNameExists(displayName.value, excludeId);
        if (nameExists) {
          setErrors({ displayName: `A party named "${displayName.value}" already exists.` });
          showToast(`A party named "${displayName.value}" already exists.`, "error");
          return;
        }
      }
    }

    setSaving(true);
    try {
      // ── 4. Upload party image ────────────────────────────────────────────────
      let partyImagePath: string | null = isEditMode ? existingImagePath : null;
      if (imageFile) {
        const imgRes = await uploadPartyImage(imageFile);
        if (!imgRes.success) {
          setErrors({ image: (imgRes as any).message ?? "Image upload failed" });
          return;
        }
        partyImagePath = (imgRes as any).path ?? null;
      }

      // ── 5. Upload documents ──────────────────────────────────────────────────
      const uploadedDocs: { file_name: string; file_path: string; file_size: number; mime_type: string }[] = [];
      for (const doc of documents) {
        const docRes = await uploadPartyDocument(doc);
        if (!docRes.success) {
          setErrors({ documents: `Failed to upload: ${doc.name}` });
          return;
        }
        uploadedDocs.push({
          file_name: (docRes as any).file_name ?? doc.name,
          file_path: (docRes as any).path,
          file_size: doc.size,
          mime_type: doc.type || "application/octet-stream",
        });
      }

      // ── 6. Build payload ─────────────────────────────────────────────────────
      const customFieldValues = cfPanelRef.current?.getValues() ?? {};

      const payload = {
        party_type:                    customerType,
        salutation:                    salutation?.value ?? null,
        first_name:                    firstName || null,
        last_name:                     lastName || null,
        company_name:                  companyName || null,
        display_name:                  displayName!.value,
        email:                         email || null,
        mobile_code:                   mobileCountryCode?.value ?? null,
        mobile:                        mobile || null,
        language:                      language?.value ?? "english",
        distribution_category_id:      customerType === "individual"
          ? (indivCategory ? Number(indivCategory.value) : null)
          : (distCategory ? Number(distCategory.value) : null),
        distribution_sub_category_id:  customerType === "individual" ? null : (distSubCategory ? Number(distSubCategory.value) : null),
        pan:                           pan || null,
        gst:                           gst || null,
        account_number:                accountNumber || null,
        ifsc_code:                     ifscCode || null,
        upi_number:                    upiNumber || null,
        currency:                      currency?.value ?? "INR",
        payment_terms:                 paymentTerms?.value ?? "due_on_receipt",
        enable_portal:                 enablePortal,
        party_image:                   partyImagePath,
        remarks:                       remarks || null,
        contact_persons:               filledContacts.map((cp) => ({
          salutation:  cp.salutation?.value ?? null,
          name:        cp.name,
          email:       cp.emailAddress || null,
          mobile_code: cp.mobileCode.value,
          mobile:      cp.mobile || null,
        })),
        custom_fields:                 customFieldValues,
        documents:                     uploadedDocs,
        billing_address: {
          attention:  billingAttention || null,
          country:    billingCountry?.value ?? null,
          street1:    billingStreet1 || null,
          street2:    billingStreet2 || null,
          city:       billingCity || null,
          state:      billingState?.value ?? null,
          pin_code:   billingPinCode || null,
          phone_code: billingCountryCode || null,
          phone:      billingPhone || null,
          fax:        billingFax || null,
        },
        shipping_address: {
          attention:  shippingAttention || null,
          country:    shippingCountry?.value ?? null,
          street1:    shippingStreet1 || null,
          street2:    shippingStreet2 || null,
          city:       shippingCity || null,
          state:      shippingState?.value ?? null,
          pin_code:   shippingPinCode || null,
          phone_code: shippingCountryCode || null,
          phone:      shippingPhone || null,
          fax:        shippingFax || null,
        },
        location_node_ids: selectedLocations.map((l) => Number(l.value)),
        location_type: selectedLocations.length > 0 ? (locationIsUnified ? "unified" : "separate") : null,
        ...(isCompanyUser && overrideRoleId ? {
          role_id: Number(overrideRoleId),
          permissions: isSystemRole ? [] : [...itemsRows, ...inventoryRows, ...salesRows, ...othersRows]
            .filter(r => r.perms.view || r.perms.create || r.perms.edit || r.perms.delete)
            .map(r => ({
              module:      r.key,
              can_view:    r.perms.view,
              can_create:  r.perms.create,
              can_edit:    r.perms.edit,
              can_delete:  r.perms.delete,
              can_others:  r.perms.others,
              others_data: r.extraPerms
                ? { party_category_ids: r.extraPerms.party_category_ids.length ? r.extraPerms.party_category_ids : null }
                : null,
            })),
        } : { role_id: null, permissions: null }),
      };

      // ── 7. POST / PUT to API ─────────────────────────────────────────────────
      const res = isEditMode && editId
        ? await updateParty(editId, payload)
        : await storeParty(payload);

      if (!res.success) {
        if ((res as any).errors) {
          const mapped: Record<string, string> = {};
          for (const [key, msgs] of Object.entries((res as any).errors as Record<string, string[]>)) {
            mapped[key] = Array.isArray(msgs) ? msgs[0] : msgs;
          }
          setErrors(mapped);
          showToast("Please fix the highlighted errors before saving.", "error");
        } else {
          const msg = (res as any).message ?? "Failed to save party.";
          setErrors({ _form: msg });
          showToast(msg, "error");
        }
        return;
      }

      // ── 8. Success: bust cache, show toast, navigate ────────────────────────
      isDirtyRef.current = false;
      if (isEditMode && editId) {
        bustParty(editId);
      } else {
        bustPartyList();
      }
      emitMutation("parties:mutated");
      if (modalMode) {
        showToast("Party saved successfully.");
        const saved = (res as any).data as { id: number; display_name: string };
        setTimeout(() => { onModalSaved?.(saved.id, saved.display_name); }, 900);
      } else {
        showToast(isEditMode ? "Party updated successfully." : "Party saved successfully.");
        setTimeout(() => navigate(isEditMode && editId ? `/distributors/${editId}` : -1 as any, { replace: true }), 1500);
      }

    } catch {
      setErrors({ _form: "An unexpected error occurred. Please try again." });
      showToast("An unexpected error occurred. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setDocuments((prev) => [...prev, ...files].slice(0, 10));
    e.target.value = "";
  };

  return (
    <>
    <div className="page-wrapper" style={modalMode ? { marginLeft: 0 } : undefined}>

      <div className="content">

        {!modalMode && (
          <PageHeader
            title={isEditMode ? "Edit Party" : "Add New Party"}
            showModuleTile={false}
            showExport={false}
            showClose
            onClose={handleClose}
            onRefresh={handleRefresh}
          />
        )}

        <div className="card mb-0">
          <div className="card-body p-4">

            {/* ══ Top: form fields (left) + image (right) ══ */}
            <div className="row g-4 mb-4">

              {/* Left — form fields */}
              <div className="col-lg-6">

                {/* ── Customer Type ───────────────────────── */}
                <div className="row mb-3 align-items-center">
                  <label className="col-sm-4 col-form-label fw-medium fs-14">Party Type</label>
                  <div className="col-sm-8">
                    <div className="d-flex align-items-center gap-4">
                      {(["business", "individual"] as CustomerType[]).map((type) => (
                        <div key={type} className="form-check mb-0 d-flex align-items-center gap-2">
                          <input
                            className="form-check-input mt-0"
                            type="radio"
                            id={`ctype-${type}`}
                            checked={customerType === type}
                            onChange={() => {
                              setCustomerType(type);
                              markDirty();
                              if (type === "individual") {
                                setDistCategory(null);
                              } else {
                                setIndivCategory(null);
                              }
                            }}
                            style={{ accentColor: "#E41F07", width: 16, height: 16, cursor: "pointer" }}
                          />
                          <label className="form-check-label fw-medium fs-14" htmlFor={`ctype-${type}`} style={{ cursor: "pointer" }}>
                            {type === "business" ? "Business" : "Individual"}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── Name (required) ──────────────────────── */}
                <div className="row mb-3 align-items-center">
                  <label className="col-sm-4 col-form-label fw-medium fs-14 text-danger">
                    Name <span>*</span>
                  </label>
                  <div className="col-sm-8">
                    <div className="row g-2">
                      <div className="col-4">
                        <CommonSelect
                          options={salutationOptions}
                          value={salutation}
                          placeholder="Salutation"
                          onChange={setSalutation}
                        />
                      </div>
                      <div className="col-4">
                        <input
                          type="text"
                          className={`form-control${errors.firstName ? " is-invalid" : ""}`}
                          placeholder="First Name"
                          value={firstName}
                          onChange={(e) => { setFirstName(e.target.value); markDirty(); clr("firstName"); }}
                        />
                      </div>
                      <div className="col-4">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Last Name"
                          value={lastName}
                          onChange={(e) => { setLastName(e.target.value); markDirty(); }}
                        />
                      </div>
                    </div>
                    {errors.firstName && <div className="text-danger fs-12 mt-1">{errors.firstName}</div>}
                  </div>
                </div>

                {/* ── Company Name ─────────────────────────── */}
                <div className="row mb-3 align-items-center">
                  <label className="col-sm-4 col-form-label fw-medium fs-14">Company Name</label>
                  <div className="col-sm-8">
                    <input
                      type="text"
                      className="form-control"
                      value={companyName}
                      onChange={(e) => { setCompanyName(e.target.value); markDirty(); }}
                    />
                  </div>
                </div>

                {/* ── Display Name (required) ──────────────── */}
                <div className="row mb-3 align-items-center">
                  <label className="col-sm-4 col-form-label fw-medium fs-14 text-danger">
                    Display Name <span>*</span>
                  </label>
                  <div className="col-sm-8">
                    <div className="common-select">
                      <CreatableSelect
                        classNamePrefix="react-select"
                        isClearable
                        placeholder="Select or type to add"
                        value={displayName}
                        onChange={(opt) => { setDisplayName(opt); clr("displayName"); markDirty(); }}
                        options={(() => {
                          const opts: Option[] = [];
                          const full = `${firstName} ${lastName}`.trim();
                          if (salutation && full) opts.push({ value: `${salutation.value} ${full}`, label: `${salutation.value} ${full}` });
                          if (full) opts.push({ value: full, label: full });
                          if (firstName && lastName) opts.push({ value: `${lastName}, ${firstName}`, label: `${lastName}, ${firstName}` });
                          if (companyName) opts.push({ value: companyName, label: companyName });
                          return opts;
                        })()}
                        styles={commonSelectStyles}
                        components={{ IndicatorSeparator: () => null }}
                        onBlur={handleDisplayNameBlur}
                      />
                    </div>
                    {nameCheckLoading && (
                      <div className="fs-12 mt-1" style={{ color: "#707070" }}>
                        <span className="spinner-border spinner-border-sm me-1" style={{ width: 10, height: 10, borderWidth: 2 }} />
                        Checking name…
                      </div>
                    )}
                    {!nameCheckLoading && errors.displayName && <div className="text-danger fs-12 mt-1">{errors.displayName}</div>}
                  </div>
                </div>

                {/* ── Individual Type (Individual only) ── */}
                {customerType === "individual" && (
                  <div className="row mb-3 align-items-center">
                    <label className="col-sm-4 col-form-label fw-medium fs-14 text-danger">
                      Type <span>*</span>
                    </label>
                    <div className="col-sm-8">
                      <CommonSelect
                        options={indivCategoryOptions}
                        value={indivCategory}
                        placeholder="Select type"
                        onChange={(opt) => { setIndivCategory(opt); clr("indivCategory"); }}
                      />
                      {errors.indivCategory && <div className="text-danger fs-12 mt-1">{errors.indivCategory}</div>}
                    </div>
                  </div>
                )}

                {/* ── Distribution Category (Business only) ── */}
                {customerType === "business" && (
                  <div className="row mb-3 align-items-center">
                    <label className="col-sm-4 col-form-label fw-medium fs-14 text-danger">
                      Distribution Category <span>*</span>
                    </label>
                    <div className="col-sm-8">
                      <CommonSelect
                        options={distCategoryOptions}
                        value={distCategory}
                        isClearable
                        placeholder="Select category"
                        onChange={(opt) => { setDistCategory(opt); clr("distCategory"); }}
                      />
                      {errors.distCategory && <div className="text-danger fs-12 mt-1">{errors.distCategory}</div>}
                    </div>
                  </div>
                )}

                {/* ── Distribution Sub Category (shown after category is picked) ── */}
                {customerType === "business" && distCategory && (
                  <div className="row mb-3 align-items-center">
                    <label className="col-sm-4 col-form-label fw-medium fs-14 text-danger">
                      Distribution Sub Category <span>*</span>
                    </label>
                    <div className="col-sm-8">
                      <CommonSelect
                        options={distSubCategoryOptions}
                        value={distSubCategory}
                        isClearable
                        placeholder="Select sub category"
                        onChange={(opt) => { setDistSubCategory(opt); clr("distSubCategory"); }}
                      />
                      {errors.distSubCategory && <div className="text-danger fs-12 mt-1">{errors.distSubCategory}</div>}
                    </div>
                  </div>
                )}


                {/* ── Email Address ────────────────────────── */}
                <div className="row mb-3 align-items-center">
                  <label className="col-sm-4 col-form-label fw-medium fs-14">Email Address</label>
                  <div className="col-sm-8">
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <i className="ti ti-mail text-muted fs-14" />
                      </span>
                      <input
                        type="email"
                        className={`form-control border-start-0${errors.email ? " is-invalid" : ""}`}
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); clr("email"); markDirty(); }}
                        onBlur={(e) => {
                          const v = e.target.value;
                          if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
                            setErrors((p) => ({ ...p, email: "Please enter a valid email address" }));
                        }}
                      />
                    </div>
                    {errors.email && <div className="text-danger fs-12 mt-1">{errors.email}</div>}
                  </div>
                </div>

                {/* ── Mobile ───────────────────────────────── */}
                <div className="row mb-3 align-items-center">
                  <label className="col-sm-4 col-form-label fw-medium fs-14 text-danger">
                    Mobile <span>*</span>
                  </label>
                  <div className="col-sm-8">
                    <div className="d-flex gap-1">
                      <div style={{ width: 110, flexShrink: 0 }}>
                        <CommonSelect
                          options={phoneCodeOptions}
                          value={mobileCountryCode}
                          onChange={(opt) => {
                            setMobileCountryCode(opt);
                            if (opt) setMobile((p) => p.slice(0, getPhoneMaxLength(opt.value, phoneMaxLengths)));
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
                        className={`form-control${errors.mobile ? " is-invalid" : ""}`}
                        placeholder={phonePlaceholder(mobileCountryCode?.value ?? "+91", phoneMaxLengths)}
                        maxLength={getPhoneMaxLength(mobileCountryCode?.value ?? "+91", phoneMaxLengths)}
                        value={mobile}
                        onChange={(e) => { setMobile(sanitizePhone(e.target.value, mobileCountryCode?.value ?? "+91", phoneMaxLengths)); clr("mobile"); }}
                      />
                    </div>
                    {errors.mobile && <div className="text-danger fs-12 mt-1">{errors.mobile}</div>}
                  </div>
                </div>

                {/* ── Customer Language ────────────────────── */}
                <div className="row mb-3 align-items-center">
                  <label className="col-sm-4 col-form-label fw-medium fs-14">Customer Language</label>
                  <div className="col-sm-8">
                    <CommonSelect
                      options={languageOptions}
                      value={language}
                      onChange={setLanguage}
                    />
                  </div>
                </div>

              </div>{/* col-lg-6 left */}

              {/* Right — image upload */}
              <div className="col-lg-6 d-flex flex-column">
                <label
                  htmlFor="distributor_image_input"
                  className="border rounded d-flex flex-column align-items-center justify-content-center text-center position-relative overflow-hidden"
                  style={{ cursor: "pointer", background: "#fafafa", height: 200 }}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Party preview"
                      className="rounded"
                      style={{ height: "100%", width: "100%", objectFit: "contain", padding: 8 }}
                    />
                  ) : (
                    <>
                      <i className="ti ti-photo-up text-primary fs-32 mb-2" />
                      <span className="fw-semibold fs-14">Party Image</span>
                      <small className="text-muted mt-1">Click to upload — PNG, JPG up to 10 MB</small>
                    </>
                  )}
                  {imagePreview && (
                    <button
                      type="button"
                      className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 p-1 lh-1"
                      style={{ fontSize: 12 }}
                      onClick={(e) => { e.preventDefault(); setImagePreview(null); setImageFile(null); }}
                    >
                      <i className="ti ti-x" />
                    </button>
                  )}
                </label>
                <input
                  id="distributor_image_input"
                  type="file"
                  accept="image/*"
                  className="d-none"
                  onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
                  }}
                />
              </div>{/* col-lg-6 right */}

            </div>{/* row g-4 mb-4 */}

            {/* ── Tabs ──────────────────────────────────────── */}
            <div className="mb-4 scrollbar-hidden" style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              <div className="d-inline-flex rounded flex-nowrap" style={{ background: "#f1f3f5", padding: 4, gap: 2, minWidth: "max-content" }}>
                {tabs.filter(tab => tab.key !== "tags" || isCompanyUser).map((tab) => {
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      style={{
                        padding: "10px 20px", borderRadius: 6, border: "none",
                        background: isActive ? "#fff" : "transparent",
                        color: isActive ? "#e03131" : "#6c757d",
                        fontWeight: isActive ? 600 : 400,
                        fontSize: 14,
                        boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
                        transition: "all 0.15s", cursor: "pointer", whiteSpace: "nowrap",
                      }}
                    >
                      {tab.label}
                      {tab.key === "location" && errors.location && (
                        <span className="ms-1 text-danger" style={{ fontSize: 10, lineHeight: 1 }}>●</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Form-level error banner ───────────────────── */}
            {errors._form && (
              <div className="alert alert-danger d-flex align-items-center gap-2 mb-3 py-2 px-3 fs-14" role="alert">
                <i className="ti ti-alert-circle fs-16 flex-shrink-0" />
                {errors._form}
              </div>
            )}

            {/* ── Tab: Other Details ────────────────────────── */}
            {activeTab === "other" && (
              <div>

                {/* PAN */}
                <div className="row mb-3 align-items-center">
                  <label className="col-sm-3 col-form-label fw-medium fs-14">PAN</label>
                  <div className="col-sm-9 col-lg-5">
                    <input
                      type="text"
                      className="form-control"
                      value={pan}
                      onChange={(e) => setPan(e.target.value.toUpperCase())}
                      maxLength={10}
                    />
                  </div>
                </div>

                {/* Account Details (Business only) */}
                {customerType === "business" && (
                  <>
                    <div className="row mb-3 align-items-center">
                      <label className="col-sm-3 col-form-label fw-medium fs-14">Account Number</label>
                      <div className="col-sm-9 col-lg-5">
                        <input
                          type="text"
                          className="form-control"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="row mb-3 align-items-center">
                      <label className="col-sm-3 col-form-label fw-medium fs-14">IFSC Code</label>
                      <div className="col-sm-9 col-lg-5">
                        <input
                          type="text"
                          className="form-control"
                          value={ifscCode}
                          onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                          maxLength={11}
                        />
                      </div>
                    </div>

                    <div className="row mb-3 align-items-center">
                      <label className="col-sm-3 col-form-label fw-medium fs-14">UPI Number</label>
                      <div className="col-sm-9 col-lg-5">
                        <input
                          type="text"
                          className="form-control"
                          value={upiNumber}
                          onChange={(e) => setUpiNumber(e.target.value)}
                        />
                      </div>
                    </div>

                    {(() => {
                      const gstIsValid = gst.length === 15 && GST_CHAR_RULES.every((r, i) => r.test(gst[i]));
                      const gstBorderClass = gst.length === 0 ? "" : gstIsValid ? " is-valid" : gst.length === 15 ? " is-invalid" : "";
                      return (
                        <div className="row mb-3 align-items-start">
                          <label className="col-sm-3 col-form-label fw-medium fs-14 pt-2">GST</label>
                          <div className="col-sm-9 col-lg-5">
                            <input
                              type="text"
                              className={`form-control${gstBorderClass}${errors.gst ? " is-invalid" : ""}`}
                              value={gst}
                              placeholder="e.g. 29AAAAA1234A1Z5"
                              onChange={(e) => {
                                const v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                                setGst(v);
                                clr("gst");
                                markDirty();
                              }}
                              maxLength={15}
                            />

                            {/* Character-by-character indicator */}
                            {gst.length > 0 && (
                              <div className="mt-2">
                                <div className="d-flex gap-1">
                                  {GST_CHAR_RULES.map((rule, i) => {
                                    const char   = gst[i];
                                    const empty  = char === undefined;
                                    const valid  = !empty && rule.test(char);
                                    const invalid = !empty && !valid;
                                    return (
                                      <div
                                        key={i}
                                        title={`Position ${i + 1}: ${GST_PLACEHOLDER[i]}`}
                                        style={{
                                          width: 22, height: 26, borderRadius: 4, flexShrink: 0,
                                          display: "flex", alignItems: "center", justifyContent: "center",
                                          fontSize: 12, fontWeight: 700, fontFamily: "monospace",
                                          background: empty ? "#f1f3f5" : valid ? "#d1fae5" : "#fee2e2",
                                          color:      empty ? "#9ca3af"  : valid ? "#065f46" : "#dc2626",
                                          border:     `1px solid ${empty ? "#dee2e6" : valid ? "#6ee7b7" : "#fca5a5"}`,
                                          transition: "background 0.15s, color 0.15s",
                                        }}
                                      >
                                        {empty ? GST_PLACEHOLDER[i] : char}
                                      </div>
                                    );
                                  })}
                                </div>
                                <div className="fs-12 mt-1" style={{ color: gst.length === 15 ? (gstIsValid ? "#065f46" : "#dc2626") : "#6b7280" }}>
                                  {gst.length < 15
                                    ? `${gst.length}/15 characters — format: ${GST_PLACEHOLDER}`
                                    : gstIsValid
                                      ? "✓ Valid GSTIN"
                                      : "✗ Invalid format — check highlighted characters"}
                                </div>
                              </div>
                            )}

                            {errors.gst && <div className="text-danger fs-12 mt-1">{errors.gst}</div>}
                          </div>
                        </div>
                      );
                    })()}
                  </>
                )}

                {/* Currency */}
                <div className="row mb-3 align-items-center">
                  <label className="col-sm-3 col-form-label fw-medium fs-14">Currency</label>
                  <div className="col-sm-9 col-lg-5">
                    <CommonSelect
                      options={currencyOptions}
                      placeholder="Select currency"
                      value={currency}
                      onChange={setCurrency}
                    />
                  </div>
                </div>

                {/* Payment Terms */}
                <div className="row mb-3 align-items-center">
                  <label className="col-sm-3 col-form-label fw-medium fs-14">Payment Terms</label>
                  <div className="col-sm-9 col-lg-5">
                    <CommonSelect
                      options={paymentTermsOptions}
                      value={paymentTerms}
                      onChange={setPaymentTerms}
                    />
                  </div>
                </div>

                {/* Enable Portal */}
                <div className="row mb-3 align-items-center">
                  <label className="col-sm-3 col-form-label fw-medium fs-14">Enable Portal?</label>
                  <div className="col-sm-9 d-flex align-items-center" style={{ minHeight: 38 }}>
                    <div className="form-check mb-0 d-flex align-items-center gap-2">
                      <input
                        className="form-check-input mt-0"
                        type="checkbox"
                        id="enablePortal"
                        checked={enablePortal}
                        onChange={(e) => setEnablePortal(e.target.checked)}
                        style={{ accentColor: "#E41F07", width: 16, height: 16, cursor: "pointer" }}
                      />
                      <label className="form-check-label fs-14" htmlFor="enablePortal" style={{ cursor: "pointer" }}>
                        Allow portal access for this customer
                      </label>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="row mb-3 align-items-start">
                  <label className="col-sm-3 col-form-label fw-medium fs-14">Documents</label>
                  <div className="col-sm-9">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="d-none"
                      onChange={handleFileChange}
                      accept="*/*"
                    />

                    {/* Upload button + count badge + dropdown */}
                    <div className="d-flex align-items-center position-relative" ref={docDropdownRef}>
                      <div
                        ref={docTriggerRef}
                        className="d-flex overflow-hidden"
                        style={{ border: "1px solid #e8e8e8", borderRadius: 6, boxShadow: "0px 4px 4px 0px rgba(219,219,219,0.25)" }}
                      >
                        <button
                          type="button"
                          className="btn d-flex align-items-center gap-2 bg-white border-0 fs-14 px-3"
                          style={{ color: "#707070", height: 38, borderRadius: 0 }}
                          onClick={() => fileInputRef.current?.click()}
                          disabled={documents.length >= 10}
                        >
                          <i className="ti ti-upload fs-14" style={{ color: "#707070" }} />
                          Upload File
                        </button>
                        {documents.length > 0 && (
                          <button
                            type="button"
                            className="btn border-0 border-start d-flex align-items-center gap-1 px-3"
                            style={{ background: "#E41F07", color: "#fff", borderRadius: 0, height: 38, borderLeft: "1px solid #e8e8e8" }}
                            onClick={() => {
                              if (!showDocList && docTriggerRef.current) {
                                const rect = docTriggerRef.current.getBoundingClientRect();
                                const itemHeight = 52;
                                const dropdownHeight = documents.length * itemHeight + 16;
                                const spaceBelow = window.innerHeight - rect.bottom;
                                const spaceAbove = rect.top;
                                setDocDropPos(spaceBelow >= dropdownHeight || spaceBelow >= spaceAbove ? "bottom" : "top");
                              }
                              setShowDocList((p) => !p);
                            }}
                          >
                            <i className="ti ti-paperclip fs-13" />
                            <span className="fw-semibold fs-13">{documents.length}</span>
                          </button>
                        )}
                      </div>

                      {/* Dropdown file list */}
                      {showDocList && documents.length > 0 && (
                        <div
                          className="position-absolute bg-white"
                          style={{
                            ...(docDropPos === "bottom"
                              ? { top: "calc(100% + 6px)" }
                              : { bottom: "calc(100% + 6px)" }),
                            left: 0, minWidth: 300, zIndex: 200,
                            border: "1px solid #e8e8e8", borderRadius: 6,
                            boxShadow: "0px 4px 4px 0px rgba(219,219,219,0.25)",
                            padding: 4,
                          }}
                        >
                          {documents.map((f, i) => {
                            const { icon, color } = getFileIcon(f);
                            return (
                              <div
                                key={i}
                                className="d-flex align-items-center gap-3 rounded"
                                style={{ padding: "7px 14px", cursor: "default", transition: "background 0.12s" }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "#fff5f5")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                              >
                                <i className={`ti ${icon} fs-20 flex-shrink-0`} style={{ color }} />
                                <div className="flex-grow-1 overflow-hidden">
                                  <div className="fw-medium text-truncate" style={{ fontSize: 14, color: "#333" }}>{f.name}</div>
                                  <div style={{ fontSize: 12, color: "#707070" }}>{formatFileSize(f.size)}</div>
                                </div>
                                <button
                                  type="button"
                                  className="btn p-0 border-0 bg-transparent flex-shrink-0"
                                  style={{ color: "#E41F07" }}
                                  onClick={() => {
                                    setDocuments((prev) => prev.filter((_, idx) => idx !== i));
                                    if (documents.length === 1) setShowDocList(false);
                                  }}
                                >
                                  <i className="ti ti-trash fs-14" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {errors.documents && <div className="text-danger fs-12 mt-1">{errors.documents}</div>}
                    <p className="text-muted fs-12 mt-1 mb-0">You can upload a maximum of 10 files, 10MB each</p>
                  </div>
                </div>

              </div>
            )}

            {/* ── Tab: Address ──────────────────────────────── */}
            {activeTab === "address" && (
              <div className="row g-4">

                {/* Billing Address */}
                <div className="col-lg-6">
                  <h6 className="fw-semibold mb-3" style={{ fontSize: 15, color: "#333" }}>Billing Address</h6>

                  <div className="row mb-3 align-items-center">
                    <label className="col-sm-4 col-form-label fw-medium fs-14">Attention</label>
                    <div className="col-sm-8">
                      <input type="text" className="form-control" value={billingAttention} onChange={(e) => setBillingAttention(e.target.value)} />
                    </div>
                  </div>

                  <div className="row mb-3 align-items-center">
                    <label className="col-sm-4 col-form-label fw-medium fs-14">Country / Region</label>
                    <div className="col-sm-8">
                      <CommonSelect
                        options={countryList as Option[]}
                        value={billingCountry}
                        isDisabled={countriesLoading}
                        placeholder={countriesLoading ? "Loading countries…" : "Select country"}
                        onChange={(opt) => handleBillingCountryChange(opt as CountryOption | null)}
                      />
                    </div>
                  </div>

                  <div className="row mb-3 align-items-start">
                    <label className="col-sm-4 col-form-label fw-medium fs-14">Address</label>
                    <div className="col-sm-8 d-flex flex-column gap-2">
                      <textarea className="form-control" rows={2} placeholder="Street 1" value={billingStreet1} onChange={(e) => setBillingStreet1(e.target.value)} style={{ resize: "vertical" }} />
                      <textarea className="form-control" rows={2} placeholder="Street 2" value={billingStreet2} onChange={(e) => setBillingStreet2(e.target.value)} style={{ resize: "vertical" }} />
                    </div>
                  </div>

                  <div className="row mb-3 align-items-center">
                    <label className="col-sm-4 col-form-label fw-medium fs-14">City</label>
                    <div className="col-sm-8">
                      <input type="text" className="form-control" value={billingCity} onChange={(e) => setBillingCity(e.target.value)} />
                    </div>
                  </div>

                  <div className="row mb-3 align-items-center">
                    <label className="col-sm-4 col-form-label fw-medium fs-14">State</label>
                    <div className="col-sm-8">
                      <div className="common-select">
                        <CreatableSelect classNamePrefix="react-select" isClearable
                          placeholder="Select or type to add"
                          value={billingState} onChange={setBillingState}
                          options={billingStateOptions} styles={commonSelectStyles}
                          noOptionsMessage={() => "Type to add a custom state / region"}
                          components={{ IndicatorSeparator: () => null }} />
                      </div>
                    </div>
                  </div>

                  <div className="row mb-3 align-items-center">
                    <label className="col-sm-4 col-form-label fw-medium fs-14">Pin Code</label>
                    <div className="col-sm-8">
                      <input type="text" className="form-control" value={billingPinCode} onChange={(e) => setBillingPinCode(e.target.value)} maxLength={10} />
                    </div>
                  </div>

                  <div className="row mb-3 align-items-center">
                    <label className="col-sm-4 col-form-label fw-medium fs-14">Phone</label>
                    <div className="col-sm-8">
                      <div className="d-flex gap-1">
                        <input
                          type="text"
                          className="form-control text-center"
                          value={billingCountryCode}
                          readOnly
                          style={{ width: 72, flexShrink: 0, background: "#f8f9fa", color: "#495057", cursor: "default" }}
                        />
                        <input
                          type="tel"
                          className="form-control"
                          placeholder={phonePlaceholder(billingCountryCode, phoneMaxLengths)}
                          maxLength={getPhoneMaxLength(billingCountryCode, phoneMaxLengths)}
                          value={billingPhone}
                          onChange={(e) => setBillingPhone(sanitizePhone(e.target.value, billingCountryCode, phoneMaxLengths))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row mb-3 align-items-center">
                    <label className="col-sm-4 col-form-label fw-medium fs-14">Fax Number</label>
                    <div className="col-sm-8">
                      <input type="text" className="form-control" value={billingFax} onChange={(e) => setBillingFax(e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="col-lg-6">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <h6 className="fw-semibold mb-0" style={{ fontSize: 15, color: "#333" }}>Shipping Address</h6>
                    <button
                      type="button"
                      className="btn btn-link p-0 fs-13 d-flex align-items-center gap-1"
                      style={{ textDecoration: "none", color: "#E41F07" }}
                      onClick={() => {
                        setShippingAttention(billingAttention);
                        setShippingCountry(billingCountry);
                        setShippingStateOptions(billingStateOptions);
                        setShippingStreet1(billingStreet1);
                        setShippingStreet2(billingStreet2);
                        setShippingCity(billingCity);
                        setShippingState(billingState);
                        setShippingPinCode(billingPinCode);
                        setShippingCountryCode(billingCountryCode);
                        setShippingPhone(billingPhone);
                        setShippingFax(billingFax);
                      }}
                    >
                      <i className="ti ti-copy fs-14" />
                      Copy billing address
                    </button>
                  </div>

                  <div className="row mb-3 align-items-center">
                    <label className="col-sm-4 col-form-label fw-medium fs-14">Attention</label>
                    <div className="col-sm-8">
                      <input type="text" className="form-control" value={shippingAttention} onChange={(e) => setShippingAttention(e.target.value)} />
                    </div>
                  </div>

                  <div className="row mb-3 align-items-center">
                    <label className="col-sm-4 col-form-label fw-medium fs-14">Country / Region</label>
                    <div className="col-sm-8">
                      <CommonSelect
                        options={countryList as Option[]}
                        value={shippingCountry}
                        isDisabled={countriesLoading}
                        placeholder={countriesLoading ? "Loading countries…" : "Select country"}
                        onChange={(opt) => handleShippingCountryChange(opt as CountryOption | null)}
                      />
                    </div>
                  </div>

                  <div className="row mb-3 align-items-start">
                    <label className="col-sm-4 col-form-label fw-medium fs-14">Address</label>
                    <div className="col-sm-8 d-flex flex-column gap-2">
                      <textarea className="form-control" rows={2} placeholder="Street 1" value={shippingStreet1} onChange={(e) => setShippingStreet1(e.target.value)} style={{ resize: "vertical" }} />
                      <textarea className="form-control" rows={2} placeholder="Street 2" value={shippingStreet2} onChange={(e) => setShippingStreet2(e.target.value)} style={{ resize: "vertical" }} />
                    </div>
                  </div>

                  <div className="row mb-3 align-items-center">
                    <label className="col-sm-4 col-form-label fw-medium fs-14">City</label>
                    <div className="col-sm-8">
                      <input type="text" className="form-control" value={shippingCity} onChange={(e) => setShippingCity(e.target.value)} />
                    </div>
                  </div>

                  <div className="row mb-3 align-items-center">
                    <label className="col-sm-4 col-form-label fw-medium fs-14">State</label>
                    <div className="col-sm-8">
                      <div className="common-select">
                        <CreatableSelect classNamePrefix="react-select" isClearable
                          placeholder="Select or type to add"
                          value={shippingState} onChange={setShippingState}
                          options={shippingStateOptions} styles={commonSelectStyles}
                          noOptionsMessage={() => "Type to add a custom state / region"}
                          components={{ IndicatorSeparator: () => null }} />
                      </div>
                    </div>
                  </div>

                  <div className="row mb-3 align-items-center">
                    <label className="col-sm-4 col-form-label fw-medium fs-14">Pin Code</label>
                    <div className="col-sm-8">
                      <input type="text" className="form-control" value={shippingPinCode} onChange={(e) => setShippingPinCode(e.target.value)} maxLength={10} />
                    </div>
                  </div>

                  <div className="row mb-3 align-items-center">
                    <label className="col-sm-4 col-form-label fw-medium fs-14">Phone</label>
                    <div className="col-sm-8">
                      <div className="d-flex gap-1">
                        <input
                          type="text"
                          className="form-control text-center"
                          value={shippingCountryCode}
                          readOnly
                          style={{ width: 72, flexShrink: 0, background: "#f8f9fa", color: "#495057", cursor: "default" }}
                        />
                        <input
                          type="tel"
                          className="form-control"
                          placeholder={phonePlaceholder(shippingCountryCode, phoneMaxLengths)}
                          maxLength={getPhoneMaxLength(shippingCountryCode, phoneMaxLengths)}
                          value={shippingPhone}
                          onChange={(e) => setShippingPhone(sanitizePhone(e.target.value, shippingCountryCode, phoneMaxLengths))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row mb-3 align-items-center">
                    <label className="col-sm-4 col-form-label fw-medium fs-14">Fax Number</label>
                    <div className="col-sm-8">
                      <input type="text" className="form-control" value={shippingFax} onChange={(e) => setShippingFax(e.target.value)} />
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ── Tab: Location ─────────────────────────────── */}
            {activeTab === "location" && (
              <div>
                {!distCategory ? (
                  <div className="d-flex flex-column align-items-center justify-content-center py-5 text-center">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle mb-3"
                      style={{ width: 64, height: 64, background: "#fff0ee" }}
                    >
                      <i className="ti ti-map-pin fs-28" style={{ color: "#E41F07" }} />
                    </div>
                    <p className="fw-semibold mb-1" style={{ fontSize: 15, color: "#333" }}>
                      No location loaded
                    </p>
                    <p className="mb-0 fs-13" style={{ color: "#707070", maxWidth: 320 }}>
                      Select a <span className="fw-medium" style={{ color: "#E41F07" }}>Distribution Category</span> in the top section to load the available location options here.
                    </p>
                  </div>
                ) : locationConfigured === false ? (
                  <div className="d-flex flex-column align-items-center justify-content-center py-5 text-center">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle mb-3"
                      style={{ width: 64, height: 64, background: "#f0f4ff" }}
                    >
                      <i className="ti ti-map-pin-off fs-28" style={{ color: "#6c7fd8" }} />
                    </div>
                    <p className="fw-semibold mb-1" style={{ fontSize: 15, color: "#333" }}>No location configured</p>
                    <p className="mb-0 fs-13" style={{ color: "#707070", maxWidth: 340 }}>
                      The selected{" "}
                      <span className="fw-medium" style={{ color: "#E41F07" }}>Distribution Category</span>{" "}
                      does not have a location layer linked to it. Ask your admin to configure one.
                    </p>
                  </div>
                ) : locationCountryId !== null && (
                  <>
                    <div className="row mb-3 align-items-start">
                      <label className="col-sm-3 col-form-label fw-medium fs-14 text-danger">
                        Location <span>*</span>
                      </label>
                      <div className="col-sm-9 col-lg-5">
                        <LocationNodePicker
                          key={`${locationCountryId}-${locationStartParentId}-${locationAssignedDepth}`}
                          countryId={locationCountryId}
                          startParentId={locationStartParentId}
                          assignedDepth={locationAssignedDepth}
                          value={selectedLocations}
                          onChange={(val) => { setSelectedLocations(val); clr("location"); }}
                          takenNodeIds={takenLocationIds}
                        />
                        {errors.location && (
                          <div className="text-danger fs-12 mt-1">{errors.location}</div>
                        )}
                      </div>
                    </div>
                    <div className="row mb-3 align-items-start">
                      <label className="col-sm-3 col-form-label fw-medium fs-14">
                        Location Type
                      </label>
                      <div className="col-sm-9 col-lg-5 d-flex align-items-center" style={{ minHeight: 38 }}>
                        <label className="d-flex align-items-center gap-2 mb-0" style={{ cursor: "pointer", userSelect: "none" }}>
                          <input
                            type="checkbox"
                            className="form-check-input mt-0"
                            checked={locationIsUnified}
                            onChange={(e) => setLocationIsUnified(e.target.checked)}
                            style={{ width: 16, height: 16, accentColor: "#E41F07", cursor: "pointer" }}
                          />
                          <span className="fs-14">
                            <span className="fw-medium">{locationIsUnified ? "Unified" : "Separate"}</span>
                            <span className="text-muted ms-2 fs-13">
                              {locationIsUnified
                                ? "Stock and orders are pooled across all assigned locations."
                                : "Each location is tracked independently."}
                            </span>
                          </span>
                        </label>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── Tab: Contact Persons ──────────────────────── */}
            {activeTab === "contacts" && (
              <div>
                <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" as any }}>
                  <div className="border rounded overflow-hidden" style={{ minWidth: 760 }}>

                    {/* Header */}
                    <div
                      className="d-flex align-items-center px-3 py-2 border-bottom"
                      style={{ background: "#f8f9fa", gap: 8 }}
                    >
                      <div style={{ width: 100, flexShrink: 0 }}>
                        <span className="fw-semibold fs-12 text-uppercase text-muted">Salutation</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 130 }}>
                        <span className="fw-semibold fs-12 text-uppercase text-muted">Name</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 140 }}>
                        <span className="fw-semibold fs-12 text-uppercase text-muted">Email Address</span>
                      </div>
                      <div style={{ width: 250, flexShrink: 0 }}>
                        <span className="fw-semibold fs-12 text-uppercase text-muted">Mobile</span>
                      </div>
                      <div style={{ width: 52, flexShrink: 0 }} />
                    </div>

                    {/* Rows */}
                    {contactPersons.map((cp) => (
                      <div
                        key={cp.id}
                        className="d-flex align-items-center px-3 py-2 border-bottom"
                        style={{ gap: 8 }}
                      >
                        {/* Salutation */}
                        <div style={{ width: 100, flexShrink: 0 }}>
                          <CommonSelect
                            options={salutationOptions}
                            value={cp.salutation}
                            placeholder=""
                            onChange={(opt) => updateContact(cp.id, { salutation: opt })}
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            menuPlacement="auto"
                          />
                        </div>

                        {/* Name */}
                        <div style={{ flex: 1, minWidth: 130 }}>
                          <input
                            type="text"
                            className="form-control"
                            value={cp.name}
                            onChange={(e) => updateContact(cp.id, { name: e.target.value })}
                          />
                        </div>

                        {/* Email Address */}
                        <div style={{ flex: 1, minWidth: 140 }}>
                          <input
                            type="email"
                            className="form-control"
                            value={cp.emailAddress}
                            onChange={(e) => updateContact(cp.id, { emailAddress: e.target.value })}
                          />
                        </div>

                        {/* Mobile */}
                        <div style={{ width: 250, flexShrink: 0 }}>
                          <div className="d-flex gap-1">
                            <div style={{ width: 110, flexShrink: 0 }}>
                              <CommonSelect
                                options={phoneCodeOptions}
                                value={cp.mobileCode}
                                onChange={(opt) => {
                                  if (!opt) return;
                                  updateContact(cp.id, {
                                    mobileCode: opt,
                                    mobile: cp.mobile.slice(0, getPhoneMaxLength(opt.value, phoneMaxLengths)),
                                  });
                                }}
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                menuPlacement="auto"
                                formatOptionLabel={(opt, { context }) =>
                                  context === "value" ? opt.value : opt.label
                                }
                              />
                            </div>
                            <input
                              type="tel"
                              className="form-control"
                              placeholder={phonePlaceholder(cp.mobileCode.value, phoneMaxLengths)}
                              maxLength={getPhoneMaxLength(cp.mobileCode.value, phoneMaxLengths)}
                              value={cp.mobile}
                              onChange={(e) => updateContact(cp.id, { mobile: sanitizePhone(e.target.value, cp.mobileCode.value, phoneMaxLengths) })}
                            />
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="d-flex align-items-center" style={{ width: 52, flexShrink: 0 }}>
                          <button
                            type="button"
                            className="btn p-0 border-0 bg-transparent text-danger"
                            title="Remove"
                            onClick={() => removeContact(cp.id)}
                          >
                            <i className="ti ti-circle-x fs-18" />
                          </button>
                        </div>
                      </div>
                    ))}

                  </div>
                </div>

                {errors.contacts && (
                  <div className="text-danger fs-12 mt-2">{errors.contacts}</div>
                )}

                {/* Add Contact Person */}
                <button
                  type="button"
                  className="btn btn-link p-0 text-primary fs-13 d-flex align-items-center gap-1 mt-3"
                  style={{ textDecoration: "none" }}
                  onClick={addContact}
                >
                  <i className="ti ti-plus fs-13" />
                  Add Contact Person
                </button>
              </div>
            )}

            {/* ── Tab: Custom Fields ───────────────────────── */}
            {activeTab === "custom" && (
              <CustomFieldsPanel ref={cfPanelRef} module="customers" />
            )}

            {/* ── Tab: Role ─────────────────────────────────── */}
            {activeTab === "tags" && (() => {
              if (!isCompanyUser) return null;

              const selectedCat = distCategory
                ? allDistCategories.find(c => String(c.id) === distCategory.value) ?? null
                : null;
              const catRole = selectedCat?.role ?? null;

              return (
                <div>
                  {/* Category default role info banner */}
                  <div
                    className="d-flex align-items-center gap-3 p-3 mb-4 rounded"
                    style={{ background: catRole ? "#fff0f2" : "#f8f9fa", border: `1px solid ${catRole ? "#ffd6d2" : "#dee2e6"}` }}
                  >
                    <i
                      className={`ti ${catRole ? "ti-shield-check" : "ti-shield-off"} fs-22`}
                      style={{ color: catRole ? "#E41F07" : "#adb5bd", flexShrink: 0 }}
                    />
                    <div>
                      <div className="fw-semibold fs-14" style={{ color: "#333" }}>
                        {catRole
                          ? <>Category Default Role: <span style={{ color: "#E41F07" }}>{catRole.name}</span></>
                          : "No role assigned to the distribution category"}
                      </div>
                      <div className="fs-13 text-muted mt-1">
                        {catRole
                          ? "Party portal users for this party will use this role by default. You can adjust permissions below."
                          : distCategory
                            ? "The selected distribution category has no role linked. Assign a role below to set custom permissions."
                            : "Select a distribution category first to see the default role."}
                      </div>
                    </div>
                  </div>

                  {/* Role display (read-only) */}
                  <div className="row mb-3 align-items-center">
                    <label className="col-sm-3 col-form-label fw-medium fs-14">Role</label>
                    <div className="col-sm-9 col-lg-5">
                      <div
                        className="form-control-plaintext fs-14"
                        style={{ paddingLeft: 2 }}
                      >
                        {rolesLoading
                          ? <span className="text-muted fs-13">Loading…</span>
                          : overrideRoleId
                            ? <span className="fw-medium" style={{ color: "#E41F07" }}>
                                {roles.find(r => String(r.id) === overrideRoleId)?.name ?? "—"}
                              </span>
                            : <span className="text-muted fs-13">No role assigned</span>
                        }
                      </div>
                    </div>
                  </div>

                  {overrideRoleId && (
                    <div className="mt-2">
                      {isSystemRole ? (
                        <div
                          className="d-flex align-items-center gap-3 p-3"
                          style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8 }}
                        >
                          <i className="ti ti-shield-check" style={{ fontSize: 24, color: "#16a34a", flexShrink: 0 }} />
                          <div>
                            <div className="fw-semibold fs-14" style={{ color: "#15803d" }}>Full System Access</div>
                            <div className="fs-13 text-muted mt-1">
                              This role grants full access to all modules. Individual permissions cannot be overridden for system roles.
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h6 className="fw-semibold fs-14 mb-0">
                            Role Permissions
                            {roleDetailLoading && (
                              <span className="spinner-border spinner-border-sm text-danger ms-2" role="status" />
                            )}
                          </h6>
                          <PermissionsTable title="Items"     rows={itemsRows}     onRowChange={makeRowHandler(setItemsRows)} />
                          <PermissionsTable title="Inventory" rows={inventoryRows} onRowChange={makeRowHandler(setInventoryRows)} />
                          <PermissionsTable title="Sales"     rows={salesRows}     onRowChange={makeRowHandler(setSalesRows)} onExtraSave={makeExtraSaveHandler(setSalesRows)} />
                          <PermissionsTable title="Others"    rows={othersRows}    onRowChange={makeRowHandler(setOthersRows)} />
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ── Tab: Remarks ─────────────────────────────── */}
            {activeTab === "remarks" && (
              <div>
                <div className="row mb-3 align-items-start">
                  <label className="col-sm-3 col-form-label fw-medium fs-14">
                    Remarks
                    <span className="ms-1 text-muted fw-normal fs-12">(For Internal Use)</span>
                  </label>
                  <div className="col-sm-9">
                    <textarea
                      className="form-control"
                      rows={5}
                      placeholder="Add any internal remarks or notes here…"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

          </div>{/* card-body */}
        </div>{/* card */}

      </div>{/* content */}

      {/* ── Sticky Save / Cancel bar ──────────────────────── */}
      <div
        className="bg-white border-top d-flex align-items-center gap-2 px-4"
        style={{ position: "sticky", bottom: 0, zIndex: 100, height: 60 }}
      >
        <button
          type="button"
          className="btn btn-danger me-2"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <span className="spinner-border spinner-border-sm me-1" role="status" />
              Saving…
            </>
          ) : isEditMode ? "Update" : "Save"}
        </button>
        <button
          type="button"
          className="btn btn-outline-light"
          onClick={handleClose}
          disabled={saving}
        >
          Cancel
        </button>
      </div>

      {!modalMode && <Footer />}
    </div>

      {/* ── Toast Notifications ─────────────────────────────────────────── */}
      <div className="position-fixed top-0 start-50 translate-middle-x pt-4" style={{ zIndex: 9999, pointerEvents: "none" }}>
        <Toast
          show={toast.show}
          onClose={() => setToast(t => ({ ...t, show: false }))}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          style={{ pointerEvents: "auto", borderRadius: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.10)", border: "none", minWidth: 320, background: "#fff" }}
        >
          <Toast.Body className="d-flex align-items-center gap-3 px-4 py-3">
            <span
              className={`d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 ${toast.type === "success" ? "bg-success" : "bg-danger"}`}
              style={{ width: 36, height: 36 }}
            >
              <i className={`ti fs-16 text-white ${toast.type === "success" ? "ti-check" : "ti-x"}`} />
            </span>
            <span className="fw-medium fs-14">{toast.message}</span>
          </Toast.Body>
        </Toast>
      </div>
    </>
  );
};

export default AddNewParty;
