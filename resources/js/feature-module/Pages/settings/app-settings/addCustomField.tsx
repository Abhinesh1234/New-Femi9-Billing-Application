import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { OverlayTrigger, Toast, Tooltip } from "react-bootstrap";
import type { Dayjs } from "dayjs";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import PageHeader from "../../../../components/page-header/pageHeader";
import Footer from "../../../../components/footer/footer";
import CommonDatePicker from "../../../../components/common-datePicker/commonDatePicker";
import CommonSelect from "../../../../components/common-select/commonSelect";
import { all_routes } from "../../../../routes/all_routes";
import {
  storeCustomField,
  type CustomFieldConfig,
} from "../../../../core/services/customFieldApi";

// ─── Shared sortable row shell (drag handle + children) ───────────────────────
function SortableShell({ id, opacity, children }: { id: number; opacity?: number; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : (opacity ?? 1),
      }}
      className="d-flex align-items-center gap-2 mb-2"
    >
      <span
        {...attributes}
        {...listeners}
        style={{ cursor: "grab", touchAction: "none", flexShrink: 0 }}
        className="text-muted"
      >
        <i className="ti ti-grip-vertical fs-16" />
      </span>
      {children}
    </div>
  );
}

const dataTypeOptions = [
  { value: "text_single", label: "Text Box (Single Line)" },
  { value: "text_multi",  label: "Text Box (Multi-line)" },
  { value: "email",       label: "Email" },
  { value: "url",         label: "URL" },
  { value: "phone",       label: "Phone" },
  { value: "number",      label: "Number" },
  { value: "decimal",     label: "Decimal" },
  { value: "amount",      label: "Amount" },
  { value: "percent",     label: "Percent" },
  { value: "date",        label: "Date" },
  { value: "datetime",   label: "Date and Time" },
  { value: "checkbox",     label: "Check Box" },
  { value: "auto_generate",  label: "Auto-Generate Number" },
  { value: "dropdown",      label: "Dropdown" },
  { value: "multiselect",   label: "Multi-select" },
  { value: "lookup",        label: "Lookup" },
  { value: "attachment",    label: "Attachment" },
  { value: "image",         label: "Image" },
];

const relativeDateOptions = [
  { value: "today",                      label: "Today" },
  { value: "tomorrow",                   label: "Tomorrow" },
  { value: "yesterday",                  label: "Yesterday" },
  { value: "start_of_week",              label: "Starting Date of Week" },
  { value: "end_of_week",                label: "Ending Date of Week" },
  { value: "start_of_next_week",         label: "Starting Date of Next Week" },
  { value: "end_of_next_week",           label: "Ending Date of Next Week" },
  { value: "start_of_prev_week",         label: "Starting Date of Previous Week" },
  { value: "end_of_prev_week",           label: "Ending Date of Previous Week" },
  { value: "start_of_month",             label: "Starting Date of Month" },
  { value: "end_of_month",               label: "Ending Date of Month" },
  { value: "start_of_next_month",        label: "Starting Date of Next Month" },
  { value: "end_of_next_month",          label: "Ending Date of Next Month" },
  { value: "start_of_prev_month",        label: "Starting Date of Previous Month" },
  { value: "end_of_prev_month",          label: "Ending Date of Previous Month" },
  { value: "start_of_fiscal_year",       label: "Starting Date of Fiscal Year" },
  { value: "end_of_fiscal_year",         label: "Ending Date of Fiscal Year" },
];

const DROPDOWN_PRESET_COLORS = [
  "#e53935", "#1e88e5", "#fb8c00", "#43a047", "#8e24aa",
  "#212121", "#d81b60", "#00acc1", "#1565c0", "#2e7d32",
  "#e57373", "#fdd835", "#7b1fa2", "#78909c", "#ff8f00",
  "#283593", "#ce93d8", "#1976d2", "#6a1b9a", "#00897b",
];

const lookupModuleOptions = [
  "Invoice", "Sales Order", "Purchase Order", "Customers", "Items", "Users",
  "Vendors", "Bill", "Locations", "Transfer Order", "Sales Receipt",
  "Retainer Invoice", "Package", "Shipment Order", "Picklist",
  "Purchase Receive", "Sales Return", "Inventory Adjustment",
  "Delivery Challan", "Customer Payment", "Credit Note", "Vendor Payment",
  "Account", "Sales Person", "Category", "Assemblies",
];

const inputFormatOptions = [
  {
    value: "numbers",
    label: "Numbers",
    desc: "This format ensures that the custom field accepts only a combination of the numbers 0-9.",
  },
  {
    value: "alphanumeric_no_spaces",
    label: "Alphanumeric Characters Without Spaces",
    desc: "This format ensures that the custom field accepts only a combination of lowercase letters (a-z), uppercase letters (A-Z), and numbers (0-9).",
  },
  {
    value: "alphanumeric_with_spaces",
    label: "Alphanumberic Characters With Spaces",
    desc: "This format ensures that the custom field accepts only a combination of lowercase letters (a-z), uppercase letters (A-Z), numbers (0-9), and spaces.",
  },
  {
    value: "alphanumeric_hyphens_underscores",
    label: "Alphanumberic Characters With Hyphens and Underscores",
    desc: "This format ensures that the custom field accepts only a combination of lowercase letters (a-z), uppercase letters (A-Z), numbers (0-9), hyphens (-), and underscores (_).",
  },
  {
    value: "alphabets_no_spaces",
    label: "Alphabets Without Spaces",
    desc: "This format ensures that the custom field accepts only a combination of lowercase (a-z) and uppercase (A-Z) letters.",
  },
  {
    value: "alphabets_with_spaces",
    label: "Alphabets With Spaces",
    desc: "This format ensures that the custom field accepts only a combination of lowercase (a-z) and uppercase (A-Z) letters and spaces.",
  },
];

const includeModuleOptions = [
  { group: "SALES",     value: "invoice",          label: "Invoice" },
  { group: "SALES",     value: "credit_note",       label: "Credit Note" },
  { group: "SALES",     value: "sales_order",       label: "Sales Order" },
  { group: "SALES",     value: "delivery_challan",  label: "Delivery Challan" },
  { group: "PURCHASES", value: "vendor_credits",    label: "Vendor Credits" },
  { group: "PURCHASES", value: "purchase_order",    label: "Purchase Order" },
  { group: "PURCHASES", value: "purchase_receive",  label: "Purchase Receive" },
  { group: "PURCHASES", value: "bill",              label: "Bill" },
];

const AddCustomField = () => {
  const navigate = useNavigate();

  const inputFormatRef  = useRef<HTMLDivElement>(null);
  const modulesRef      = useRef<HTMLDivElement>(null);
  const dateDefaultRef  = useRef<HTMLDivElement>(null);
  const dropdownColorPickerRef   = useRef<HTMLDivElement>(null);
  const dropdownMoreMenuRef      = useRef<HTMLDivElement>(null);
  const dropdownNextId           = useRef(5);
  const multiselectMoreMenuRef   = useRef<HTMLDivElement>(null);
  const multiselectNextId        = useRef(8);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const handleDropdownDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setDropdownOptions((prev) => {
        const oldIndex = prev.findIndex((o) => o.id === active.id);
        const newIndex = prev.findIndex((o) => o.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };
  const handleMultiselectDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setMultiselectOptions((prev) => {
        const oldIndex = prev.findIndex((o) => o.id === active.id);
        const newIndex = prev.findIndex((o) => o.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };
  const lookupModuleRef          = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (inputFormatRef.current && !inputFormatRef.current.contains(e.target as Node)) {
        setInputFormatOpen(false);
      }
      if (modulesRef.current && !modulesRef.current.contains(e.target as Node)) {
        setModulesOpen(false);
      }
      if (dateDefaultRef.current && !dateDefaultRef.current.contains(e.target as Node)) {
        setDateDefaultOpen(false);
      }
      if (dropdownColorPickerRef.current && !dropdownColorPickerRef.current.contains(e.target as Node)) {
        setDropdownColorPickerOpen(null);
        setDropdownCustomColorMode(false);
      }
      if (dropdownMoreMenuRef.current && !dropdownMoreMenuRef.current.contains(e.target as Node)) {
        setDropdownMoreMenuOpen(null);
      }
      if (multiselectMoreMenuRef.current && !multiselectMoreMenuRef.current.contains(e.target as Node)) {
        setMultiselectMoreMenuOpen(null);
      }
      if (lookupModuleRef.current && !lookupModuleRef.current.contains(e.target as Node)) {
        setLookupModuleOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const [label, setLabel]                         = useState("");
  const [richTextEditor, setRichTextEditor]       = useState(false);
  const [dataType, setDataType]                   = useState("");
  const [helpText, setHelpText]                   = useState("");
  const [pii, setPii]                             = useState(false);
  const [ephi, setEphi]                           = useState(false);
  const [encryptData, setEncryptData]             = useState(true);
  const [inputFormat, setInputFormat]             = useState("");
  const [customFormat, setCustomFormat]           = useState(false);
  const [customFormatText, setCustomFormatText]   = useState("");
  const [inputFormatOpen, setInputFormatOpen]     = useState(false);
  const [inputFormatSearch, setInputFormatSearch] = useState("");
  const [defaultValue, setDefaultValue]           = useState("");
  const [mandatory, setMandatory]                 = useState(false);
  const [showInTx, setShowInTx]                   = useState(false);
  const [includeModules, setIncludeModules]       = useState<string[]>([]);
  const [modulesOpen, setModulesOpen]             = useState(false);
  const [modulesSearch, setModulesSearch]         = useState("");
  const [showInPdfs, setShowInPdfs]               = useState(false);
  const [hyperlinkLabel, setHyperlinkLabel]       = useState("");
  const [dateDefaultOpen, setDateDefaultOpen]     = useState(false);
  const [dateDefaultSearch, setDateDefaultSearch] = useState("");
  const [dateDefaultValue, setDateDefaultValue]   = useState("");
  const [dateCustomMode, setDateCustomMode]       = useState(false);
  const [dateCustomValue, setDateCustomValue]         = useState<Dayjs | null>(null);
  const [datetimeDefaultValue, setDatetimeDefaultValue] = useState<Dayjs | null>(null);
  const [checkboxDefault, setCheckboxDefault]           = useState(false);
  const [dropdownOptions, setDropdownOptions] = useState([
    { id: 1, label: "", color: "#e53935", active: true },
    { id: 2, label: "", color: "#1e88e5", active: true },
    { id: 3, label: "", color: "#fb8c00", active: true },
    { id: 4, label: "", color: "#43a047", active: true },
  ]);
  const [dropdownAddColor, setDropdownAddColor]               = useState(false);
  const [dropdownColorPlacement, setDropdownColorPlacement]   = useState<"next" | "wrap">("next");
  const [dropdownDefault, setDropdownDefault]                 = useState("");
  const [dropdownColorPickerOpen, setDropdownColorPickerOpen] = useState<number | null>(null);
  const [dropdownCustomColorMode, setDropdownCustomColorMode] = useState(false);
  const [dropdownCustomColorText, setDropdownCustomColorText] = useState("");
  const [dropdownMoreMenuOpen, setDropdownMoreMenuOpen]       = useState<number | null>(null);
  const [dropdownSelected, setDropdownSelected]               = useState<number[]>([]);
  const [multiselectOptions, setMultiselectOptions] = useState([
    { id: 1, label: "", active: true },
    { id: 2, label: "", active: true },
    { id: 3, label: "", active: true },
    { id: 4, label: "", active: true },
  ]);
  const [multiselectMoreMenuOpen, setMultiselectMoreMenuOpen] = useState<number | null>(null);
  const [multiselectDefault, setMultiselectDefault]           = useState("");
  const [multiselectSelected, setMultiselectSelected]         = useState<number[]>([]);
  const [autoPrefix, setAutoPrefix]                     = useState("");
  const [autoStartingNumber, setAutoStartingNumber]     = useState("");
  const [autoSuffix, setAutoSuffix]                     = useState("");
  const [autoAddToExisting, setAutoAddToExisting]       = useState(true);
  const [attachmentFileImage, setAttachmentFileImage]       = useState(true);
  const [attachmentFileDocument, setAttachmentFileDocument] = useState(true);
  const [attachmentFilePDF, setAttachmentFilePDF]           = useState(true);
  const [attachmentFileAllFiles, setAttachmentFileAllFiles] = useState(true);
  const [lookupModule, setLookupModule]                     = useState("");
  const [lookupModuleOpen, setLookupModuleOpen]         = useState(false);
  const [lookupModuleSearch, setLookupModuleSearch]     = useState("");

  // ── Save state ───────────────────────────────────────────────────────────
  const [saving, setSaving]   = useState(false);
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [toast, setToast]     = useState<{ show: boolean; type: "success" | "danger"; message: string }>({
    show: false, type: "success", message: "",
  });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Data types that cannot appear in transactions (no "Show when creating transactions" field)
  const supportsShowInTx =
    dataType !== "" &&
    dataType !== "auto_generate" &&
    dataType !== "attachment" &&
    dataType !== "image" &&
    dataType !== "text_multi" &&
    dataType !== "multiselect" &&
    ((!pii && !ephi) || (pii && !encryptData && !ephi));

  const showToast = (type: "success" | "danger", message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, type, message });
    toastTimerRef.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 4000);
  };
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  const addDropdownOption = () => {
    setDropdownOptions((prev) => [
      ...prev,
      { id: dropdownNextId.current++, label: "", color: DROPDOWN_PRESET_COLORS[prev.length % DROPDOWN_PRESET_COLORS.length], active: true },
    ]);
  };
  const addDropdownOptionAfter = (id: number) => {
    setDropdownOptions((prev) => {
      const idx = prev.findIndex((o) => o.id === id);
      const newOpt = { id: dropdownNextId.current++, label: "", color: DROPDOWN_PRESET_COLORS[prev.length % DROPDOWN_PRESET_COLORS.length], active: true };
      return [...prev.slice(0, idx + 1), newOpt, ...prev.slice(idx + 1)];
    });
  };
  const updateDropdownOptionLabel = (id: number, label: string) => {
    setDropdownOptions((prev) => prev.map((o) => (o.id === id ? { ...o, label } : o)));
  };
  const updateDropdownColor = (id: number, color: string) => {
    setDropdownOptions((prev) => prev.map((o) => (o.id === id ? { ...o, color } : o)));
  };
  const toggleDropdownOptionActive = (id: number) => {
    setDropdownOptions((prev) => prev.map((o) => (o.id === id ? { ...o, active: !o.active } : o)));
  };
  const deleteDropdownOption = (id: number) => {
    setDropdownOptions((prev) => prev.filter((o) => o.id !== id));
  };

  const reorderDropdownOptions = (fromId: number, toId: number) => {
    setDropdownOptions((prev) => {
      const arr = [...prev];
      const fromIdx = arr.findIndex((o) => o.id === fromId);
      const toIdx   = arr.findIndex((o) => o.id === toId);
      if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return prev;
      const [item] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, item);
      return arr;
    });
  };

  const addMultiselectOption = () => {
    setMultiselectOptions((prev) => [...prev, { id: multiselectNextId.current++, label: "", active: true }]);
  };
  const addMultiselectOptionAfter = (id: number) => {
    setMultiselectOptions((prev) => {
      const idx = prev.findIndex((o) => o.id === id);
      return [...prev.slice(0, idx + 1), { id: multiselectNextId.current++, label: "", active: true }, ...prev.slice(idx + 1)];
    });
  };
  const updateMultiselectOptionLabel = (id: number, lbl: string) => {
    setMultiselectOptions((prev) => prev.map((o) => (o.id === id ? { ...o, label: lbl } : o)));
  };
  const toggleMultiselectOptionActive = (id: number) => {
    setMultiselectOptions((prev) => prev.map((o) => (o.id === id ? { ...o, active: !o.active } : o)));
  };
  const deleteMultiselectOption = (id: number) => {
    setMultiselectOptions((prev) => prev.filter((o) => o.id !== id));
  };

  const reorderMultiselectOptions = (fromId: number, toId: number) => {
    setMultiselectOptions((prev) => {
      const arr = [...prev];
      const fromIdx = arr.findIndex((o) => o.id === fromId);
      const toIdx   = arr.findIndex((o) => o.id === toId);
      if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return prev;
      const [item] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, item);
      return arr;
    });
  };

  const goBack = () => navigate(all_routes.projectSettings + "?tab=field");

  // ── Build field_key from label ────────────────────────────────────────────
  const labelToFieldKey = (lbl: string): string => {
    const key = lbl.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    return /^[a-z]/.test(key) ? key : `f_${key}`;
  };

  // ── Build config payload from all state ──────────────────────────────────
  const buildConfig = (): CustomFieldConfig => {
    let type_config: Record<string, unknown> = {};

    if (dataType === "text_single") {
      type_config = { input_format: customFormat ? null : (inputFormat || null), custom_input_format: customFormat ? customFormatText : null };
    } else if (dataType === "text_multi") {
      type_config = { input_format: customFormat ? null : (inputFormat || null), custom_input_format: customFormat ? customFormatText : null, rich_text_editor: richTextEditor };
    } else if (dataType === "url") {
      type_config = { hyperlink_label: hyperlinkLabel || null };
    } else if (dataType === "auto_generate") {
      type_config = { prefix: autoPrefix || null, starting_number: parseInt(autoStartingNumber, 10), suffix: autoSuffix || null, add_to_existing: autoAddToExisting };
    } else if (dataType === "dropdown") {
      type_config = {
        add_color: dropdownAddColor,
        color_placement: dropdownColorPlacement,
        options: dropdownOptions.map((o, i) => ({ id: o.id, label: o.label, color: o.color, is_active: o.active, sort_order: i + 1 })),
      };
    } else if (dataType === "multiselect") {
      type_config = {
        options: multiselectOptions.map((o, i) => ({ id: o.id, label: o.label, is_active: o.active, sort_order: i + 1 })),
      };
    } else if (dataType === "attachment") {
      const fileTypes: string[] = [];
      if (attachmentFileImage) fileTypes.push("image");
      if (attachmentFileDocument) fileTypes.push("document");
      if (attachmentFilePDF) fileTypes.push("pdf");
      if (attachmentFileAllFiles) fileTypes.push("all_files");
      type_config = { allowed_file_types: fileTypes };
    } else if (dataType === "lookup") {
      type_config = { lookup_module: lookupModule };
    }

    let default_value: string | null = null;
    if (dataType === "date") {
      default_value = dateCustomMode ? (dateCustomValue?.format("YYYY-MM-DD") ?? null) : (dateDefaultValue || null);
    } else if (dataType === "datetime") {
      default_value = datetimeDefaultValue?.format("YYYY-MM-DDTHH:mm:00") ?? null;
    } else if (dataType === "checkbox") {
      default_value = checkboxDefault ? "1" : "0";
    } else if (dataType === "dropdown") {
      default_value = dropdownDefault || null;
    } else if (dataType === "multiselect") {
      default_value = multiselectDefault || null;
    } else {
      default_value = defaultValue || null;
    }

    return {
      label:                label.trim(),
      field_key:            labelToFieldKey(label),
      data_type:            dataType,
      is_mandatory:         mandatory,
      is_active:            true,
      is_system:            false,
      sort_order:           0,
      help_text:            helpText || null,
      show_in_transactions: showInTx,
      show_in_all_pdfs:     showInPdfs,
      include_in_modules:   includeModules,
      default_value,
      privacy: { is_pii: pii, is_ephi: ephi, encrypt_data: encryptData },
      type_config,
    };
  };

  // ── Frontend validation ───────────────────────────────────────────────────
  const validate = (config: CustomFieldConfig): Record<string, string> => {
    const errs: Record<string, string> = {};

    if (!config.label) {
      errs.label = "Label Name is required.";
    }
    if (!config.data_type) {
      errs.data_type = "Data Type is required.";
    }
    if (config.data_type === "lookup" && !lookupModule) {
      errs.lookup_module = "Module is required for Lookup fields.";
    }
    if (config.data_type === "auto_generate" && !autoStartingNumber) {
      errs.starting_number = "Starting Number is required.";
    }
    if (config.data_type === "attachment") {
      const types = (config.type_config as { allowed_file_types: string[] }).allowed_file_types;
      if (!types || types.length === 0) {
        errs.allowed_file_types = "At least one file type must be selected.";
      }
    }
    if (config.show_in_transactions && config.include_in_modules.length === 0) {
      errs.include_in_modules = "Select at least one module.";
    }

    return errs;
  };

  // ── Save handler ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    const config = buildConfig();
    const validationErrors = validate(config);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const errCount = Object.keys(validationErrors).length;
      showToast("danger", errCount === 1 ? Object.values(validationErrors)[0] : "Please fix the highlighted fields before saving.");
      return;
    }

    setErrors({});
    setSaving(true);

    const res = await storeCustomField("products", config);

    if (res.success) {
      showToast("success", "Custom field created successfully.");
      setSaving(false);
      setTimeout(() => goBack(), 1500);
    } else {
      const serverErrors: Record<string, string> = {};
      if (res.errors) {
        Object.entries(res.errors).forEach(([key, msgs]) => {
          serverErrors[key.replace("config.", "")] = msgs[0];
        });
      }
      setErrors(serverErrors);
      setSaving(false);
      showToast("danger", res.message);
    }
  };

  const hasConditionalFields = dataType === "text_single" || dataType === "text_multi" || dataType === "email" || dataType === "url" || dataType === "phone" || dataType === "number" || dataType === "decimal" || dataType === "amount" || dataType === "percent" || dataType === "date" || dataType === "datetime" || dataType === "checkbox" || dataType === "auto_generate" || dataType === "dropdown" || dataType === "multiselect" || dataType === "lookup" || dataType === "attachment" || dataType === "image";

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <PageHeader
            title="New Custom Field - Items"
            badgeCount={false}
            showModuleTile={false}
            showExport={false}
          />

          <div className="row">
            <div className="col-12">
              <div className="card mb-0">
                <div className="card-body p-4">

                  {/* Label Name */}
                  <div className="row mb-3 align-items-center">
                    <label className="col-sm-4 col-form-label text-danger fw-medium fs-14">
                      Label Name <span>*</span>
                    </label>
                    <div className="col-sm-8">
                      <input
                        type="text"
                        className={`form-control ${errors.label ? "is-invalid" : ""}`}
                        value={label}
                        onChange={(e) => { setLabel(e.target.value); setErrors((p) => ({ ...p, label: "" })); }}
                      />
                      {errors.label && <div className="invalid-feedback">{errors.label}</div>}
                    </div>
                  </div>

                  {/* Data Type */}
                  <div className="row mb-3 align-items-start">
                    <label className="col-sm-4 col-form-label text-danger fw-medium fs-14">
                      Data Type <span>*</span>
                    </label>
                    <div className="col-sm-8">
                      <CommonSelect
                        className={`select ${errors.data_type ? "is-invalid" : ""}`}
                        options={dataTypeOptions}
                        value={dataTypeOptions.find((o) => o.value === dataType) ?? null}
                        placeholder="Select data type"
                        onChange={(opt) => { setDataType(opt?.value ?? ""); setErrors((p) => ({ ...p, data_type: "" })); }}
                      />
                      {errors.data_type && <div className="invalid-feedback d-block">{errors.data_type}</div>}
                    </div>
                  </div>

                  {/* Conditional fields */}
                  {hasConditionalFields && (
                    <>
                      {/* Display rich-text editor — text_multi only */}
                      {dataType === "text_multi" && (
                        <div className="row mb-3 align-items-center">
                          <div className="col-sm-8 offset-sm-4">
                            <div className="form-check mb-0">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="rich_text_editor"
                                checked={richTextEditor}
                                onChange={(e) => setRichTextEditor(e.target.checked)}
                              />
                              <label className="form-check-label fs-14" htmlFor="rich_text_editor">
                                Display rich-text editor
                              </label>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Hyperlink Label — URL only */}
                      {dataType === "url" && (
                        <div className="row mb-3 align-items-center">
                          <label className="col-sm-4 col-form-label fw-medium fs-14">
                            Hyperlink Label
                            <OverlayTrigger placement="right" overlay={<Tooltip>The text displayed as the clickable link</Tooltip>}>
                              <i className="ti ti-help-circle text-muted ms-1" />
                            </OverlayTrigger>
                          </label>
                          <div className="col-sm-8">
                            <input
                              type="text"
                              className="form-control"
                              value={hyperlinkLabel}
                              onChange={(e) => setHyperlinkLabel(e.target.value)}
                            />
                          </div>
                        </div>
                      )}

                      {/* Help Text */}
                      <div className="row mb-3 align-items-start">
                        <label className="col-sm-4 col-form-label fw-medium fs-14">Help Text</label>
                        <div className="col-sm-8">
                          <input
                            type="text"
                            className="form-control"
                            value={helpText}
                            onChange={(e) => setHelpText(e.target.value)}
                          />
                          <small className="text-muted d-block mt-1">
                            Enter some text to help users understand the purpose of this custom field.
                          </small>
                        </div>
                      </div>

                      {/* Lookup Module — Lookup only */}
                      {dataType === "lookup" && (
                        <div className="row mb-3 align-items-start">
                          <label className="col-sm-4 col-form-label text-danger fw-medium fs-14">
                            Module*
                            <OverlayTrigger placement="right" overlay={<Tooltip>Select the module this field will look up from</Tooltip>}>
                              <i className="ti ti-help-circle text-muted ms-1" />
                            </OverlayTrigger>
                          </label>
                          <div className="col-sm-8">
                            <div style={{ position: "relative" }} ref={lookupModuleRef}>
                              <div
                                className="form-select"
                                style={{ cursor: "pointer", userSelect: "none", minHeight: "38px", display: "flex", alignItems: "center" }}
                                onClick={() => { setLookupModuleOpen((o) => !o); setLookupModuleSearch(""); }}
                              >
                                {lookupModule ? lookupModule : <span>&nbsp;</span>}
                              </div>
                              {lookupModuleOpen && (
                                <div
                                  className="position-absolute w-100 bg-white border rounded shadow"
                                  style={{ zIndex: 1050, top: "calc(100% + 2px)", left: 0 }}
                                >
                                  <div className="p-2 border-bottom">
                                    <div className="input-group">
                                      <span className="input-group-text bg-white border-end-0">
                                        <i className="ti ti-search text-muted" />
                                      </span>
                                      <input
                                        autoFocus
                                        type="text"
                                        className="form-control border-start-0 ps-0"
                                        placeholder="Search"
                                        value={lookupModuleSearch}
                                        onChange={(e) => setLookupModuleSearch(e.target.value)}
                                      />
                                    </div>
                                  </div>
                                  <div style={{ maxHeight: 240, overflowY: "auto" }}>
                                    {lookupModuleOptions
                                      .filter((m) => m.toLowerCase().includes(lookupModuleSearch.toLowerCase()))
                                      .map((m) => {
                                        const selected = lookupModule === m;
                                        return (
                                          <div
                                            key={m}
                                            className={`input-format-option px-3 py-2${selected ? " is-selected" : ""}`}
                                            onClick={() => { setLookupModule(m); setLookupModuleOpen(false); setLookupModuleSearch(""); }}
                                          >
                                            {m}
                                          </div>
                                        );
                                      })}
                                  </div>
                                </div>
                              )}
                            </div>
                            {errors.lookup_module && <div className="text-danger small mt-1">{errors.lookup_module}</div>}
                          </div>
                        </div>
                      )}

                      {/* Data Privacy — not shown for number/decimal/amount/percent/checkbox/auto_generate/lookup/attachment */}
                      {dataType !== "number" && dataType !== "decimal" && dataType !== "amount" && dataType !== "percent" && dataType !== "checkbox" && dataType !== "auto_generate" && dataType !== "dropdown" && dataType !== "multiselect" && dataType !== "lookup" && dataType !== "attachment" && dataType !== "image" && <div className="row mb-3 align-items-start">
                        <label className="col-sm-4 col-form-label fw-medium fs-14">Data Privacy</label>
                        <div className="col-sm-8">
                          <div className="d-flex align-items-center gap-3 mb-2">
                            <div className="form-check mb-0">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="add_pii"
                                checked={pii || ephi}
                                disabled={ephi}
                                onChange={(e) => { setPii(e.target.checked); setEncryptData(true); }}
                              />
                              <label className="form-check-label" htmlFor="add_pii">PII</label>
                            </div>
                            <div className="form-check mb-0">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="add_ephi"
                                checked={ephi}
                                onChange={(e) => { setEphi(e.target.checked); if (e.target.checked) setPii(true); setEncryptData(true); }}
                              />
                              <label className="form-check-label" htmlFor="add_ephi">ePHI</label>
                            </div>
                          </div>

                          {!pii && !ephi && (
                            <small className="text-muted d-block">
                              Data will be stored without encryption and will be visible to all users.
                            </small>
                          )}

                          {pii && !ephi && (
                            <div>
                              <div className="form-check mb-2">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="add_encrypt"
                                  id="add_encrypt_yes"
                                  checked={encryptData}
                                  onChange={() => setEncryptData(true)}
                                />
                                <label className="form-check-label fw-medium" htmlFor="add_encrypt_yes">
                                  Sensitive data. Encrypt and store it.
                                </label>
                                {encryptData && (
                                  <small className="text-muted d-block mt-1">
                                    Only users with access to protected data will be able to view the details, and this field cannot be used to perform an advanced search.
                                  </small>
                                )}
                              </div>
                              <div className="form-check mb-0">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="add_encrypt"
                                  id="add_encrypt_no"
                                  checked={!encryptData}
                                  onChange={() => setEncryptData(false)}
                                />
                                <label className="form-check-label fw-medium" htmlFor="add_encrypt_no">
                                  Not sensitive data. Store it without encryption.
                                </label>
                                {!encryptData && (
                                  <small className="text-muted d-block mt-1">
                                    Only users with access to protected data will be able to view the details, but this field can be used to perform an advanced search.
                                  </small>
                                )}
                              </div>
                            </div>
                          )}

                          {(pii && ephi) || (!pii && ephi) ? (
                            <small className="text-muted d-block">
                              Data is sensitive and will be stored with encryption. Only users with access to protected data will be able to view it.
                            </small>
                          ) : null}
                        </div>
                      </div>}

                      {/* Attachment-specific fields */}
                      {dataType === "attachment" && (
                        <div className="row mb-3 align-items-start">
                          <label className="col-sm-4 col-form-label text-danger fw-medium fs-14">File Type*</label>
                          <div className="col-sm-8">
                            <div className="row g-2">
                              <div className="col-6">
                                <div className="form-check mb-0">
                                  <input className="form-check-input" type="checkbox" id="att_image"
                                    checked={attachmentFileImage} onChange={(e) => { setAttachmentFileImage(e.target.checked); setErrors((p) => ({ ...p, allowed_file_types: "" })); }} />
                                  <label className="form-check-label" htmlFor="att_image">Image</label>
                                </div>
                              </div>
                              <div className="col-6">
                                <div className="form-check mb-0">
                                  <input className="form-check-input" type="checkbox" id="att_document"
                                    checked={attachmentFileDocument} onChange={(e) => { setAttachmentFileDocument(e.target.checked); setErrors((p) => ({ ...p, allowed_file_types: "" })); }} />
                                  <label className="form-check-label" htmlFor="att_document">Document</label>
                                </div>
                              </div>
                              <div className="col-6">
                                <div className="form-check mb-0">
                                  <input className="form-check-input" type="checkbox" id="att_pdf"
                                    checked={attachmentFilePDF} onChange={(e) => { setAttachmentFilePDF(e.target.checked); setErrors((p) => ({ ...p, allowed_file_types: "" })); }} />
                                  <label className="form-check-label" htmlFor="att_pdf">PDF</label>
                                </div>
                              </div>
                              <div className="col-6">
                                <div className="form-check mb-0">
                                  <input className="form-check-input" type="checkbox" id="att_all"
                                    checked={attachmentFileAllFiles} onChange={(e) => { setAttachmentFileAllFiles(e.target.checked); setErrors((p) => ({ ...p, allowed_file_types: "" })); }} />
                                  <label className="form-check-label" htmlFor="att_all">All Files</label>
                                </div>
                              </div>
                            </div>
                            {errors.allowed_file_types && <div className="text-danger small mt-1">{errors.allowed_file_types}</div>}
                          </div>
                        </div>
                      )}

                      {/* Input Format — not shown for date/datetime/checkbox/auto_generate/lookup/attachment */}
                      {dataType !== "date" && dataType !== "datetime" && dataType !== "checkbox" && dataType !== "auto_generate" && dataType !== "dropdown" && dataType !== "multiselect" && dataType !== "lookup" && dataType !== "attachment" && dataType !== "image" && <div className="row mb-3 align-items-start">
                        <label className="col-sm-4 col-form-label fw-medium fs-14">Input Format</label>
                        <div className="col-sm-8">
                          {dataType === "email" || dataType === "url" || dataType === "phone" || dataType === "number" || dataType === "decimal" || dataType === "amount" || dataType === "percent" ? (
                            <input
                              type="text"
                              className="form-control"
                              value={inputFormat}
                              onChange={(e) => setInputFormat(e.target.value)}
                            />
                          ) : customFormat ? (
                            <div className="d-flex align-items-center gap-2">
                              <input
                                type="text"
                                className="form-control"
                                value={customFormatText}
                                onChange={(e) => setCustomFormatText(e.target.value)}
                                placeholder="Enter custom format"
                              />
                              <Link
                                to="#"
                                className="text-primary text-nowrap fs-13"
                                onClick={(e) => { e.preventDefault(); setCustomFormat(false); setCustomFormatText(""); }}
                              >
                                Use Standard Formats
                              </Link>
                            </div>
                          ) : (
                            <div className="d-flex align-items-center gap-2">
                              <div className="position-relative flex-grow-1" ref={inputFormatRef}>
                                <div
                                  className="form-select"
                                  style={{ cursor: "pointer", userSelect: "none", minHeight: "38px", display: "flex", alignItems: "center" }}
                                  onClick={() => { setInputFormatOpen((o) => !o); setInputFormatSearch(""); }}
                                >
                                  {inputFormat
                                    ? inputFormatOptions.find((o) => o.value === inputFormat)?.label
                                    : <span>&nbsp;</span>}
                                </div>
                                {inputFormatOpen && (
                                  <div
                                    className="position-absolute w-100 bg-white border rounded shadow"
                                    style={{ zIndex: 1050, top: "calc(100% + 2px)", left: 0, minWidth: 320 }}
                                  >
                                    <div className="p-2 border-bottom">
                                      <div className="input-group">
                                        <span className="input-group-text bg-white border-end-0">
                                          <i className="ti ti-search text-muted" />
                                        </span>
                                        <input
                                          autoFocus
                                          type="text"
                                          className="form-control border-start-0 ps-0"
                                          placeholder="Search"
                                          value={inputFormatSearch}
                                          onChange={(e) => setInputFormatSearch(e.target.value)}
                                        />
                                      </div>
                                    </div>
                                    <div style={{ maxHeight: 260, overflowY: "auto" }}>
                                      {inputFormatOptions
                                        .filter((o) => o.label.toLowerCase().includes(inputFormatSearch.toLowerCase()))
                                        .map((o) => {
                                          const selected = inputFormat === o.value;
                                          return (
                                            <div
                                              key={o.value}
                                              className={`input-format-option px-3 py-2${selected ? " is-selected" : ""}`}
                                              onClick={() => {
                                                setInputFormat(o.value);
                                                setInputFormatOpen(false);
                                                setInputFormatSearch("");
                                              }}
                                            >
                                              <div className="input-format-option-label fw-medium">{o.label}</div>
                                              <div className="input-format-option-desc mt-1 text-muted fs-12">{o.desc}</div>
                                            </div>
                                          );
                                        })}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <Link
                                to="#"
                                className="text-primary text-nowrap fs-13"
                                onClick={(e) => { e.preventDefault(); setCustomFormat(true); setInputFormatOpen(false); }}
                              >
                                Configure Custom Format
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>}

                      {/* Dropdown-specific fields */}
                      {dataType === "dropdown" && (
                        <>
                          <div className="mb-4">
                            <h6 className="fw-semibold fs-14 mb-3">Dropdown Options :</h6>
                            <div className="border rounded p-3">
                              <div className="d-flex align-items-center justify-content-between mb-3">
                                {dropdownSelected.length > 0 ? (
                                  <>
                                    <div className="d-flex align-items-center gap-2">
                                      <span className="fw-medium fs-14">Selected : {dropdownSelected.length}</span>
                                      <button type="button" className="p-0 border-0 bg-transparent text-muted" onClick={() => setDropdownSelected([])}>
                                        <i className="ti ti-x fs-14" />
                                      </button>
                                    </div>
                                    <button type="button" className="p-0 border-0 bg-transparent text-danger"
                                      onClick={() => { setDropdownOptions((prev) => prev.filter((o) => !dropdownSelected.includes(o.id))); setDropdownSelected([]); }}>
                                      <i className="ti ti-trash fs-16" />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <span className="fw-medium fs-14">Options Count : {dropdownOptions.filter((o) => o.active).length}</span>
                                    <div className="d-flex align-items-center gap-3">
                                      <div className="form-check mb-0">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          id="dd_add_color"
                                          checked={dropdownAddColor}
                                          onChange={(e) => setDropdownAddColor(e.target.checked)}
                                        />
                                        <label className="form-check-label fs-13" htmlFor="dd_add_color">Add color to options</label>
                                      </div>
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                                        onClick={addDropdownOption}
                                      >
                                        <i className="ti ti-circle-plus" />
                                        Add Options
                                        <i className="ti ti-chevron-down" />
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>

                              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDropdownDragEnd}>
                                <SortableContext items={dropdownOptions.map((o) => o.id)} strategy={verticalListSortingStrategy}>
                              {dropdownOptions.map((opt) => (
                                <SortableShell key={opt.id} id={opt.id} opacity={opt.active ? 1 : 0.45}>
                                  <input
                                    type="checkbox"
                                    className="form-check-input flex-shrink-0"
                                    style={{ marginTop: 0 }}
                                    checked={dropdownSelected.includes(opt.id)}
                                    onChange={(e) => setDropdownSelected((prev) => e.target.checked ? [...prev, opt.id] : prev.filter((id) => id !== opt.id))}
                                  />

                                  {dropdownAddColor && (
                                    <div
                                      style={{ position: "relative", flexShrink: 0 }}
                                      ref={dropdownColorPickerOpen === opt.id ? dropdownColorPickerRef : undefined}
                                    >
                                      <button
                                        type="button"
                                        className="btn p-0 d-flex align-items-center gap-1 border-0"
                                        style={{ background: "none" }}
                                        onClick={() => {
                                          if (dropdownColorPickerOpen === opt.id) {
                                            setDropdownColorPickerOpen(null);
                                          } else {
                                            setDropdownColorPickerOpen(opt.id);
                                            setDropdownCustomColorMode(false);
                                            setDropdownCustomColorText(opt.color);
                                          }
                                        }}
                                      >
                                        <span style={{ display: "block", width: 22, height: 22, borderRadius: "50%", background: opt.color }} />
                                        <i className="ti ti-chevron-down text-muted" style={{ fontSize: 11 }} />
                                      </button>

                                      {dropdownColorPickerOpen === opt.id && (
                                        <div
                                          className="bg-white border rounded shadow p-2"
                                          style={{ position: "absolute", zIndex: 1050, top: "calc(100% + 4px)", left: 0, minWidth: 190 }}
                                        >
                                          {!dropdownCustomColorMode ? (
                                            <>
                                              <div className="d-flex justify-content-end mb-1">
                                                <button
                                                  type="button"
                                                  className="btn-close"
                                                  style={{ fontSize: 10 }}
                                                  onClick={() => setDropdownColorPickerOpen(null)}
                                                />
                                              </div>
                                              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4 }}>
                                                {DROPDOWN_PRESET_COLORS.map((c) => (
                                                  <button
                                                    key={c}
                                                    type="button"
                                                    className="border-0 p-0 d-flex align-items-center justify-content-center flex-shrink-0"
                                                    style={{ width: 28, height: 28, borderRadius: "50%", background: c, cursor: "pointer" }}
                                                    onClick={() => { updateDropdownColor(opt.id, c); setDropdownColorPickerOpen(null); }}
                                                  >
                                                    {opt.color === c && <i className="ti ti-check text-white" style={{ fontSize: 12 }} />}
                                                  </button>
                                                ))}
                                              </div>
                                              <div className="mt-2 pt-2 border-top">
                                                <Link
                                                  to="#"
                                                  className="text-primary fs-13"
                                                  onClick={(e) => { e.preventDefault(); setDropdownCustomColorMode(true); setDropdownCustomColorText(opt.color); }}
                                                >
                                                  Choose Custom Color &rsaquo;
                                                </Link>
                                              </div>
                                            </>
                                          ) : (
                                            <>
                                              <div className="d-flex align-items-center gap-2 mb-2">
                                                <input
                                                  type="text"
                                                  className="form-control form-control-sm"
                                                  style={{ flex: 1 }}
                                                  value={dropdownCustomColorText}
                                                  onChange={(e) => setDropdownCustomColorText(e.target.value)}
                                                />
                                                <input
                                                  type="color"
                                                  className="border rounded"
                                                  style={{ width: 32, height: 32, cursor: "pointer", padding: 2 }}
                                                  value={dropdownCustomColorText}
                                                  onChange={(e) => setDropdownCustomColorText(e.target.value)}
                                                />
                                              </div>
                                              <div className="d-flex gap-2">
                                                <button
                                                  type="button"
                                                  className="btn btn-primary btn-sm"
                                                  onClick={() => { updateDropdownColor(opt.id, dropdownCustomColorText); setDropdownColorPickerOpen(null); setDropdownCustomColorMode(false); }}
                                                >
                                                  OK
                                                </button>
                                                <button
                                                  type="button"
                                                  className="btn btn-cancel btn-sm"
                                                  onClick={() => setDropdownCustomColorMode(false)}
                                                >
                                                  Cancel
                                                </button>
                                              </div>
                                            </>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  <input
                                    type="text"
                                    className="form-control flex-grow-1"
                                    value={opt.label}
                                    onChange={(e) => updateDropdownOptionLabel(opt.id, e.target.value)}
                                  />

                                  <div className="d-flex align-items-center gap-1 flex-shrink-0">
                                      <button
                                        type="button"
                                        className="p-0 border-0 bg-transparent text-muted"
                                        title="Add Option"
                                        onClick={() => addDropdownOptionAfter(opt.id)}
                                      >
                                        <i className="ti ti-square-rounded-plus fs-16" />
                                      </button>
                                      <div
                                        style={{ position: "relative" }}
                                        ref={dropdownMoreMenuOpen === opt.id ? dropdownMoreMenuRef : undefined}
                                      >
                                        <button
                                          type="button"
                                          className="p-0 border-0 bg-transparent text-muted"
                                          onClick={() => setDropdownMoreMenuOpen(dropdownMoreMenuOpen === opt.id ? null : opt.id)}
                                        >
                                          <i className="ti ti-dots-vertical fs-16" />
                                        </button>
                                        {dropdownMoreMenuOpen === opt.id && (
                                          <div
                                            className="bg-white border rounded shadow py-1"
                                            style={{ position: "absolute", zIndex: 1050, right: 0, top: "100%", minWidth: 160 }}
                                          >
                                            <button
                                              type="button"
                                              className="btn btn-sm w-100 text-start px-3 py-2"
                                              onClick={() => { toggleDropdownOptionActive(opt.id); setDropdownMoreMenuOpen(null); }}
                                            >
                                              {opt.active ? "Mark as Inactive" : "Mark as Active"}
                                            </button>
                                            <button
                                              type="button"
                                              className="btn btn-sm w-100 text-start px-3 py-2 text-danger"
                                              onClick={() => { deleteDropdownOption(opt.id); setDropdownMoreMenuOpen(null); }}
                                            >
                                              Delete
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                </SortableShell>
                              ))}
                                </SortableContext>
                              </DndContext>
                            </div>
                          </div>

                          {dropdownAddColor && (
                            <div className="row mb-3 align-items-center">
                              <label className="col-sm-4 col-form-label fw-medium fs-14">Color Placement</label>
                              <div className="col-sm-8">
                                <div className="d-flex align-items-center gap-4">
                                  <div className="form-check mb-0 d-flex align-items-center gap-2">
                                    <input
                                      className="form-check-input"
                                      type="radio"
                                      name="dd_color_placement"
                                      id="dd_cp_next"
                                      checked={dropdownColorPlacement === "next"}
                                      onChange={() => setDropdownColorPlacement("next")}
                                    />
                                    <label className="form-check-label d-flex align-items-center gap-1" htmlFor="dd_cp_next">
                                      <span style={{ display: "inline-block", width: 14, height: 14, background: "#fb8c00", borderRadius: 2 }} />
                                      Next to Option
                                    </label>
                                  </div>
                                  <div className="form-check mb-0 d-flex align-items-center gap-2">
                                    <input
                                      className="form-check-input"
                                      type="radio"
                                      name="dd_color_placement"
                                      id="dd_cp_wrap"
                                      checked={dropdownColorPlacement === "wrap"}
                                      onChange={() => setDropdownColorPlacement("wrap")}
                                    />
                                    <label className="form-check-label" htmlFor="dd_cp_wrap">
                                      <span style={{ display: "inline-block", background: "#fb8c00", color: "white", padding: "2px 10px", borderRadius: 4, fontSize: 13 }}>
                                        Wrap Option
                                      </span>
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Multiselect-specific fields */}
                      {dataType === "multiselect" && (
                        <div className="mb-4">
                          <h6 className="fw-semibold fs-14 mb-3">Multiselect Options :</h6>
                          <div className="border rounded p-3">
                            {/* Header */}
                            <div className="d-flex align-items-center justify-content-between mb-3">
                              {multiselectSelected.length > 0 ? (
                                <>
                                  <div className="d-flex align-items-center gap-2">
                                    <span className="fw-medium fs-14">Selected : {multiselectSelected.length}</span>
                                    <button type="button" className="p-0 border-0 bg-transparent text-muted" onClick={() => setMultiselectSelected([])}>
                                      <i className="ti ti-x fs-14" />
                                    </button>
                                  </div>
                                  <button type="button" className="p-0 border-0 bg-transparent text-danger"
                                    onClick={() => { setMultiselectOptions((prev) => prev.filter((o) => !multiselectSelected.includes(o.id))); setMultiselectSelected([]); }}>
                                    <i className="ti ti-trash fs-16" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <span className="fw-medium fs-14">Options Count : {multiselectOptions.filter((o) => o.active).length}</span>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                                    onClick={addMultiselectOption}
                                  >
                                    <i className="ti ti-circle-plus" />
                                    Add Options
                                    <i className="ti ti-chevron-down" />
                                  </button>
                                </>
                              )}
                            </div>

                            {/* Option rows */}
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleMultiselectDragEnd}>
                              <SortableContext items={multiselectOptions.map((o) => o.id)} strategy={verticalListSortingStrategy}>
                            {multiselectOptions.map((opt) => (
                              <SortableShell key={opt.id} id={opt.id} opacity={opt.active ? 1 : 0.45}>
                                <input
                                  type="checkbox"
                                  className="form-check-input flex-shrink-0"
                                  style={{ marginTop: 0 }}
                                  checked={multiselectSelected.includes(opt.id)}
                                  onChange={(e) => setMultiselectSelected((prev) => e.target.checked ? [...prev, opt.id] : prev.filter((id) => id !== opt.id))}
                                />
                                <input
                                  type="text"
                                  className="form-control flex-grow-1"
                                  value={opt.label}
                                  onChange={(e) => updateMultiselectOptionLabel(opt.id, e.target.value)}
                                />
                                <div className="d-flex align-items-center gap-1 flex-shrink-0">
                                  <button
                                    type="button"
                                    className="p-0 border-0 bg-transparent text-muted"
                                    title="Add Option"
                                    onClick={() => addMultiselectOptionAfter(opt.id)}
                                  >
                                    <i className="ti ti-square-rounded-plus fs-16" />
                                  </button>
                                  <div
                                    style={{ position: "relative" }}
                                    ref={multiselectMoreMenuOpen === opt.id ? multiselectMoreMenuRef : undefined}
                                  >
                                    <button
                                      type="button"
                                      className="p-0 border-0 bg-transparent text-muted"
                                      onClick={() => setMultiselectMoreMenuOpen(multiselectMoreMenuOpen === opt.id ? null : opt.id)}
                                    >
                                      <i className="ti ti-dots-vertical fs-16" />
                                    </button>
                                    {multiselectMoreMenuOpen === opt.id && (
                                      <div
                                        className="bg-white border rounded shadow py-1"
                                        style={{ position: "absolute", zIndex: 1050, right: 0, top: "100%", minWidth: 160 }}
                                      >
                                        <button
                                          type="button"
                                          className="btn btn-sm w-100 text-start px-3 py-2"
                                          onClick={() => { toggleMultiselectOptionActive(opt.id); setMultiselectMoreMenuOpen(null); }}
                                        >
                                          {opt.active ? "Mark as Inactive" : "Mark as Active"}
                                        </button>
                                        <button
                                          type="button"
                                          className="btn btn-sm w-100 text-start px-3 py-2 text-danger"
                                          onClick={() => { deleteMultiselectOption(opt.id); setMultiselectMoreMenuOpen(null); }}
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </SortableShell>
                            ))}
                              </SortableContext>
                            </DndContext>

                          </div>
                        </div>
                      )}

                      {/* Auto-Generate Number specific fields */}
                      {dataType === "auto_generate" && (
                        <>
                          {/* Prefix */}
                          <div className="row mb-3 align-items-center">
                            <label className="col-sm-4 col-form-label fw-medium fs-14">Prefix</label>
                            <div className="col-sm-8">
                              <input
                                type="text"
                                className="form-control"
                                value={autoPrefix}
                                onChange={(e) => setAutoPrefix(e.target.value)}
                              />
                            </div>
                          </div>

                          {/* Starting Number */}
                          <div className="row mb-3 align-items-center">
                            <label className="col-sm-4 col-form-label text-danger fw-medium fs-14">
                              Starting Number <span>*</span>
                            </label>
                            <div className="col-sm-8">
                              <input
                                type="number"
                                className={`form-control ${errors.starting_number ? "is-invalid" : ""}`}
                                value={autoStartingNumber}
                                onChange={(e) => { setAutoStartingNumber(e.target.value); setErrors((p) => ({ ...p, starting_number: "" })); }}
                              />
                              {errors.starting_number && <div className="invalid-feedback">{errors.starting_number}</div>}
                            </div>
                          </div>

                          {/* Suffix */}
                          <div className="row mb-3 align-items-center">
                            <label className="col-sm-4 col-form-label fw-medium fs-14">Suffix</label>
                            <div className="col-sm-8">
                              <input
                                type="text"
                                className="form-control"
                                value={autoSuffix}
                                onChange={(e) => setAutoSuffix(e.target.value)}
                              />
                            </div>
                          </div>

                          {/* Add to existing items */}
                          <div className="row mb-3 align-items-start">
                            <label className="col-sm-4 col-form-label fw-medium fs-14">Add to existing items</label>
                            <div className="col-sm-8">
                              <div className="p-3 rounded" style={{ backgroundColor: "#fffde7", border: "1px solid #fff9c4" }}>
                                <div className="form-check mb-2">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="auto_add_existing"
                                    checked={autoAddToExisting}
                                    onChange={(e) => setAutoAddToExisting(e.target.checked)}
                                  />
                                  <label className="form-check-label" htmlFor="auto_add_existing">
                                    Add this custom field to all the existing items and auto-generate the number in all of them.
                                  </label>
                                </div>
                                <div className="d-flex align-items-start gap-2">
                                  <i className="ti ti-alert-circle text-warning mt-1 flex-shrink-0" />
                                  <small className="text-muted">
                                    This is a one-time setup and you cannot edit this setting later.
                                  </small>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Default Value — hidden when PII/ePHI or auto_generate/lookup */}
                      {(dataType === "attachment" || dataType === "image" || (!pii && !ephi && dataType !== "auto_generate" && dataType !== "lookup")) && (
                        <div className="row mb-3 align-items-center">
                          <label className="col-sm-4 col-form-label fw-medium fs-14">Default Value</label>
                          <div className="col-sm-8">
                            {(dataType === "attachment" || dataType === "image") ? (
                              <div>
                                <button type="button" className="btn btn-outline-primary d-flex align-items-center gap-2">
                                  <i className="ti ti-upload" />
                                  Upload File
                                </button>
                                <small className="text-muted d-block mt-1">You can upload a file that is 10MB or lesser</small>
                              </div>
                            ) : dataType === "email" ? (
                              <div className="input-group">
                                <span className="input-group-text bg-white">
                                  <i className="ti ti-mail text-muted" />
                                </span>
                                <input
                                  type="email"
                                  className="form-control border-start-0"
                                  value={defaultValue}
                                  onChange={(e) => setDefaultValue(e.target.value)}
                                  placeholder="Enter default email"
                                />
                              </div>
                            ) : dataType === "url" ? (
                              <div className="input-group">
                                <span className="input-group-text bg-white">
                                  <i className="ti ti-world text-muted" />
                                </span>
                                <input
                                  type="url"
                                  className="form-control border-start-0"
                                  value={defaultValue}
                                  onChange={(e) => setDefaultValue(e.target.value)}
                                  placeholder="Enter default URL"
                                />
                              </div>
                            ) : dataType === "phone" ? (
                              <div className="input-group">
                                <span className="input-group-text bg-white">
                                  <i className="ti ti-phone text-muted" />
                                </span>
                                <input
                                  type="tel"
                                  className="form-control border-start-0"
                                  value={defaultValue}
                                  onChange={(e) => setDefaultValue(e.target.value)}
                                  placeholder="Enter default phone"
                                />
                              </div>
                            ) : dataType === "amount" ? (
                              <div className="input-group">
                                <span className="input-group-text bg-white">INR</span>
                                <input
                                  type="number"
                                  className="form-control border-start-0"
                                  value={defaultValue}
                                  onChange={(e) => setDefaultValue(e.target.value)}
                                  placeholder="0.00"
                                />
                              </div>
                            ) : dataType === "percent" ? (
                              <div className="input-group">
                                <input
                                  type="number"
                                  className="form-control border-end-0"
                                  value={defaultValue}
                                  onChange={(e) => setDefaultValue(e.target.value)}
                                />
                                <span className="input-group-text bg-white">%</span>
                              </div>
                            ) : dataType === "dropdown" ? (
                              <select
                                className="form-select"
                                value={dropdownDefault}
                                onChange={(e) => setDropdownDefault(e.target.value)}
                              >
                                <option value=""></option>
                                {dropdownOptions.filter((o) => o.active && o.label).map((o) => (
                                  <option key={o.id} value={o.label}>{o.label}</option>
                                ))}
                              </select>
                            ) : dataType === "multiselect" ? (
                              <select
                                className="form-select"
                                value={multiselectDefault}
                                onChange={(e) => setMultiselectDefault(e.target.value)}
                              >
                                <option value=""></option>
                                {multiselectOptions.filter((o) => o.active && o.label).map((o) => (
                                  <option key={o.id} value={o.label}>{o.label}</option>
                                ))}
                              </select>
                            ) : dataType === "checkbox" ? (
                              <div className="form-check mb-0">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="checkbox_default"
                                  checked={checkboxDefault}
                                  onChange={(e) => setCheckboxDefault(e.target.checked)}
                                />
                                <label className="form-check-label" htmlFor="checkbox_default">
                                  Ticked by default
                                </label>
                              </div>
                            ) : dataType === "datetime" ? (
                              <CommonDatePicker
                                value={datetimeDefaultValue}
                                onChange={(date) => setDatetimeDefaultValue(date ?? null)}
                                showTime={{ format: "HH:mm", minuteStep: 30 }}
                                format="DD/MM/YYYY HH:mm"
                              />
                            ) : dataType === "date" ? (
                              <div>
                                {dateCustomMode ? (
                                  <div>
                                    <CommonDatePicker
                                      value={dateCustomValue}
                                      onChange={(date) => setDateCustomValue(date ?? null)}
                                      format="DD/MM/YYYY"
                                    />
                                    <Link
                                      to="#"
                                      className="text-primary fs-13 d-block mt-1"
                                      onClick={(e) => { e.preventDefault(); setDateCustomMode(false); setDateCustomValue(null); }}
                                    >
                                      Select Relative Date
                                    </Link>
                                  </div>
                                ) : (
                                  <div ref={dateDefaultRef} style={{ position: "relative" }}>
                                    <div
                                      className="form-select"
                                      style={{ cursor: "pointer", userSelect: "none", minHeight: "38px", display: "flex", alignItems: "center" }}
                                      onClick={() => { setDateDefaultOpen((o) => !o); setDateDefaultSearch(""); }}
                                    >
                                      {dateDefaultValue
                                        ? relativeDateOptions.find((o) => o.value === dateDefaultValue)?.label
                                        : <span>&nbsp;</span>}
                                    </div>
                                    {dateDefaultOpen && (
                                      <div
                                        className="position-absolute bg-white border rounded shadow"
                                        style={{ zIndex: 1050, top: "calc(100% + 2px)", left: 0, minWidth: 280 }}
                                      >
                                        <div className="p-2 border-bottom">
                                          <div className="input-group">
                                            <span className="input-group-text bg-white border-end-0">
                                              <i className="ti ti-search text-muted" />
                                            </span>
                                            <input
                                              autoFocus
                                              type="text"
                                              className="form-control border-start-0 ps-0"
                                              placeholder="Search"
                                              value={dateDefaultSearch}
                                              onChange={(e) => setDateDefaultSearch(e.target.value)}
                                            />
                                          </div>
                                        </div>
                                        <div style={{ maxHeight: 220, overflowY: "auto" }}>
                                          {relativeDateOptions
                                            .filter((o) => o.label.toLowerCase().includes(dateDefaultSearch.toLowerCase()))
                                            .map((o) => {
                                              const selected = dateDefaultValue === o.value;
                                              return (
                                                <div
                                                  key={o.value}
                                                  className={`input-format-option px-3 py-2${selected ? " is-selected" : ""}`}
                                                  onClick={() => {
                                                    setDateDefaultValue(o.value);
                                                    setDateDefaultOpen(false);
                                                    setDateDefaultSearch("");
                                                  }}
                                                >
                                                  {o.label}
                                                </div>
                                              );
                                            })}
                                        </div>
                                      </div>
                                    )}
                                    <Link
                                      to="#"
                                      className="text-primary fs-13 d-block mt-1"
                                      onClick={(e) => { e.preventDefault(); setDateCustomMode(true); setDateDefaultOpen(false); }}
                                    >
                                      Select Custom Date
                                    </Link>
                                  </div>
                                )}
                              </div>
                            ) : dataType === "text_multi" ? (
                              <textarea
                                className="form-control"
                                rows={3}
                                value={defaultValue}
                                onChange={(e) => setDefaultValue(e.target.value)}
                              />
                            ) : (
                              <input
                                type="text"
                                className="form-control"
                                value={defaultValue}
                                onChange={(e) => setDefaultValue(e.target.value)}
                              />
                            )}
                          </div>
                        </div>
                      )}

                      {/* Show when creating transactions — not shown for auto_generate/attachment/text_multi/multiselect */}
                      {supportsShowInTx ? (
                        <div className="row mb-3 align-items-center">
                          <label className="col-sm-4 col-form-label fw-medium fs-14">Show when creating transactions</label>
                          <div className="col-sm-8">
                            <div className="d-flex align-items-center gap-3">
                              <div className="form-check mb-0">
                                <input className="form-check-input" type="radio" name="add_show_tx" id="add_show_tx_yes"
                                  checked={showInTx === true} onChange={() => setShowInTx(true)} />
                                <label className="form-check-label" htmlFor="add_show_tx_yes">Yes</label>
                              </div>
                              <div className="form-check mb-0">
                                <input className="form-check-input" type="radio" name="add_show_tx" id="add_show_tx_no"
                                  checked={showInTx === false} onChange={() => setShowInTx(false)} />
                                <label className="form-check-label" htmlFor="add_show_tx_no">No</label>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {/* Include in Modules — shown when Show in transactions = Yes AND dataType supports it */}
                      {showInTx && supportsShowInTx && (
                        <div className="row mb-3 align-items-start">
                          <label className="col-sm-4 col-form-label fw-medium fs-14 text-danger">
                            Include in Modules*
                            <OverlayTrigger placement="right" overlay={<Tooltip>Select the transaction modules where this field should appear</Tooltip>}>
                              <i className="ti ti-help-circle text-muted ms-1" />
                            </OverlayTrigger>
                          </label>
                          <div className="col-sm-8">
                            <div className="position-relative" ref={modulesRef}>
                              <div
                                className="form-select"
                                style={{ cursor: "pointer", userSelect: "none", minHeight: "38px", display: "flex", alignItems: "center" }}
                                onClick={() => { setModulesOpen((o) => !o); setModulesSearch(""); }}
                              >
                                {includeModules.length === 0
                                  ? <span className="text-muted">None</span>
                                  : includeModules.length === includeModuleOptions.length
                                    ? "All"
                                    : includeModuleOptions.filter((o) => includeModules.includes(o.value)).map((o) => o.label).join(", ")}
                              </div>
                              {modulesOpen && (
                                <div
                                  className="position-absolute w-100 bg-white border rounded shadow"
                                  style={{ zIndex: 1050, bottom: "calc(100% + 2px)", left: 0 }}
                                >
                                  <div className="p-2 border-bottom">
                                    <div className="input-group">
                                      <span className="input-group-text bg-white border-end-0">
                                        <i className="ti ti-search text-muted" />
                                      </span>
                                      <input
                                        autoFocus
                                        type="text"
                                        className="form-control border-start-0 ps-0"
                                        placeholder="Search"
                                        value={modulesSearch}
                                        onChange={(e) => setModulesSearch(e.target.value)}
                                      />
                                    </div>
                                  </div>
                                  <div className="px-3 py-2 border-bottom">
                                    <div className="form-check mb-0">
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="mod_all"
                                        checked={includeModules.length === includeModuleOptions.length}
                                        onChange={(e) => setIncludeModules(e.target.checked ? includeModuleOptions.map((o) => o.value) : [])}
                                      />
                                      <label className="form-check-label fw-medium" htmlFor="mod_all">All</label>
                                    </div>
                                  </div>
                                  <div style={{ maxHeight: 260, overflowY: "auto" }}>
                                    {(["SALES", "PURCHASES"] as const).map((group) => {
                                      const filtered = includeModuleOptions.filter(
                                        (o) => o.group === group && o.label.toLowerCase().includes(modulesSearch.toLowerCase())
                                      );
                                      if (filtered.length === 0) return null;
                                      return (
                                        <div key={group}>
                                          <div className="px-3 py-1 text-muted fw-semibold" style={{ fontSize: "11px", letterSpacing: "0.05em" }}>{group}</div>
                                          {filtered.map((o) => (
                                            <div key={o.value} className="px-3 py-2">
                                              <div className="form-check mb-0">
                                                <input
                                                  className="form-check-input"
                                                  type="checkbox"
                                                  id={`mod_${o.value}`}
                                                  checked={includeModules.includes(o.value)}
                                                  onChange={(e) => {
                                                    setIncludeModules((prev) =>
                                                      e.target.checked ? [...prev, o.value] : prev.filter((v) => v !== o.value)
                                                    );
                                                  }}
                                                />
                                                <label className="form-check-label" htmlFor={`mod_${o.value}`}>{o.label}</label>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                            {errors.include_in_modules && <div className="text-danger small mt-1">{errors.include_in_modules}</div>}
                          </div>
                        </div>
                      )}

                      {/* Show in All PDFs — not shown for auto_generate/text_multi/dropdown/multiselect/lookup/attachment */}
                      {dataType !== "auto_generate" && dataType !== "text_multi" && dataType !== "dropdown" && dataType !== "multiselect" && dataType !== "lookup" && dataType !== "attachment" && dataType !== "image" && <div className="row mb-3 align-items-center">
                        <label className="col-sm-4 col-form-label fw-medium fs-14">Show in All PDFs</label>
                        <div className="col-sm-8">
                          <div className="d-flex align-items-center gap-3">
                            <div className="form-check mb-0">
                              <input className="form-check-input" type="radio" name="add_show_pdfs" id="add_show_pdfs_yes"
                                checked={showInPdfs === true} onChange={() => setShowInPdfs(true)} />
                              <label className="form-check-label" htmlFor="add_show_pdfs_yes">Yes</label>
                            </div>
                            <div className="form-check mb-0">
                              <input className="form-check-input" type="radio" name="add_show_pdfs" id="add_show_pdfs_no"
                                checked={showInPdfs === false} onChange={() => setShowInPdfs(false)} />
                              <label className="form-check-label" htmlFor="add_show_pdfs_no">No</label>
                            </div>
                          </div>
                        </div>
                      </div>}

                      {/* Is Mandatory */}
                      <div className="row mb-3 align-items-center">
                        <label className="col-sm-4 col-form-label fw-medium fs-14">Is Mandatory</label>
                        <div className="col-sm-8">
                          <div className="d-flex align-items-center gap-3">
                            <div className="form-check mb-0">
                              <input className="form-check-input" type="radio" name="add_mandatory" id="add_mandatory_yes"
                                checked={mandatory === true} onChange={() => setMandatory(true)} />
                              <label className="form-check-label" htmlFor="add_mandatory_yes">Yes</label>
                            </div>
                            <div className="form-check mb-0">
                              <input className="form-check-input" type="radio" name="add_mandatory" id="add_mandatory_no"
                                checked={mandatory === false} onChange={() => setMandatory(false)} />
                              <label className="form-check-label" htmlFor="add_mandatory_no">No</label>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Preview — not shown for number/decimal/amount/percent/date/datetime/checkbox/auto_generate/dropdown/multiselect/lookup/attachment */}
                      {dataType !== "number" && dataType !== "decimal" && dataType !== "amount" && dataType !== "percent" && dataType !== "date" && dataType !== "datetime" && dataType !== "checkbox" && dataType !== "auto_generate" && dataType !== "dropdown" && dataType !== "multiselect" && dataType !== "lookup" && dataType !== "attachment" && dataType !== "image" && <div className="row mb-3 align-items-start">
                        <label className="col-sm-4 col-form-label fw-medium fs-14">Preview</label>
                        <div className="col-sm-8">
                          <div className="border rounded p-3">
                            <div className="row align-items-center">
                              <label className="col-sm-5 col-form-label fs-14">
                                {label || <span className="text-muted">Label</span>}
                              </label>
                              <div className="col-sm-7">
                                {dataType === "email" ? (
                                  <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0">
                                      <i className="ti ti-mail text-muted" />
                                    </span>
                                    <input type="email" className="form-control border-start-0" disabled />
                                  </div>
                                ) : dataType === "url" ? (
                                  <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0">
                                      <i className="ti ti-world text-muted" />
                                    </span>
                                    <input type="url" className="form-control border-start-0" disabled />
                                  </div>
                                ) : dataType === "phone" ? (
                                  <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0">
                                      <i className="ti ti-phone text-muted" />
                                    </span>
                                    <input type="tel" className="form-control border-start-0" disabled />
                                  </div>
                                ) : dataType === "text_multi" ? (
                                  <textarea className="form-control" rows={2} disabled />
                                ) : (
                                  <input type="text" className="form-control" disabled />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>}
                    </>
                  )}

                  {/* Is Mandatory — shown when no data type selected yet */}
                  {!dataType && (
                    <div className="row mb-3 align-items-center">
                      <label className="col-sm-4 col-form-label fw-medium fs-14">Is Mandatory</label>
                      <div className="col-sm-8">
                        <div className="d-flex align-items-center gap-3">
                          <div className="form-check mb-0">
                            <input className="form-check-input" type="radio" name="add_mandatory_init" id="add_mandatory_init_yes"
                              checked={mandatory === true} onChange={() => setMandatory(true)} />
                            <label className="form-check-label" htmlFor="add_mandatory_init_yes">Yes</label>
                          </div>
                          <div className="form-check mb-0">
                            <input className="form-check-input" type="radio" name="add_mandatory_init" id="add_mandatory_init_no"
                              checked={mandatory === false} onChange={() => setMandatory(false)} />
                            <label className="form-check-label" htmlFor="add_mandatory_init_no">No</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Save / Cancel */}
                  <div className="d-flex align-items-center justify-content-start gap-2 pt-2">
                    <button type="button" className="btn btn-sm btn-primary" onClick={handleSave} disabled={saving}>
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" role="status" />
                          Saving…
                        </>
                      ) : "Save"}
                    </button>
                    <button type="button" className="btn btn-cancel btn-sm" onClick={goBack} disabled={saving}>
                      Cancel
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>

        </div>
        <Footer />
      </div>

      {/* Toast */}
      <div className="position-fixed top-0 start-50 translate-middle-x pt-4" style={{ zIndex: 9999, pointerEvents: "none" }}>
        <Toast
          show={toast.show}
          onClose={() => setToast((t) => ({ ...t, show: false }))}
          style={{ pointerEvents: "auto", borderRadius: "12px", boxShadow: "0 4px 24px rgba(0,0,0,0.10)", border: "none", minWidth: "320px", background: "#fff" }}
        >
          <Toast.Body className="d-flex align-items-center gap-3 px-4 py-3">
            <span
              className={`d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 ${toast.type === "success" ? "bg-success" : "bg-danger"}`}
              style={{ width: "36px", height: "36px" }}
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

export default AddCustomField;