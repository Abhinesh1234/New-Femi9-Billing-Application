import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import ReactQuill from "react-quill-new";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import CommonDatePicker from "../../../../components/common-datePicker/commonDatePicker";
import { useNavigate, useParams } from "react-router";
import { Modal, OverlayTrigger, Toast, Tooltip } from "react-bootstrap";
import Footer from "../../../../components/footer/footer";
import PageHeader from "../../../../components/page-header/pageHeader";
import CommonSelect, { Option } from "../../../../components/common-select/commonSelect";
import { fetchCustomFields, fetchAutoGeneratePreview, type CustomField } from "../../../../core/services/customFieldApi";
import { fetchSettings, type ProductConfiguration } from "../../../../core/services/settingApi";
import { fetchBrands, storeBrand, updateBrand as apiBrandUpdate, destroyBrand, type Brand } from "../../../../core/services/brandApi";
import { fetchCategories, storeCategory, updateCategory as apiCategoryUpdate, destroyCategory, type Category } from "../../../../core/services/categoryApi";
import { fetchHsnCodes, storeHsnCode, updateHsnCode as apiHsnUpdate, destroyHsnCode, type HsnCode } from "../../../../core/services/hsnCodeApi";
import { fetchGstRates, storeGstRate, updateGstRate as apiGstUpdate, destroyGstRate, type GstRate } from "../../../../core/services/gstRateApi";
import { fetchAccounts, storeAccount, updateAccount as apiAccountUpdate, destroyAccount, type Account } from "../../../../core/services/accountApi";
import { storeItem, updateItem, fetchItem, uploadItemImage, uploadCustomFieldFile, fetchItems, type ItemPayload, type ItemRefs } from "../../../../core/services/itemApi";

const toOpt = (v: string): Option | null => (v ? { value: v, label: v } : null);
const stringsToOpts = (arr: string[]): Option[] => arr.filter(Boolean).map((s) => ({ value: s, label: s }));

type ItemType      = "goods" | "service";
type FormItemType  = "single" | "variants";
type DimensionUnit = "cm" | "m" | "in" | "ft";
type WeightUnit    = "kg" | "g" | "lb" | "oz";

interface BrandEntry { id: number; name: string; }
interface CategoryEntry { id: number; name: string; parentId: number | null; }

const getCategoryPath = (cat: CategoryEntry, all: CategoryEntry[]): string => {
  if (!cat.parentId) return cat.name;
  const parent = all.find((c) => c.id === cat.parentId);
  return parent ? `${getCategoryPath(parent, all)} > ${cat.name}` : cat.name;
};

const unitOptions             = ["Nos","Kg","g","Litre","ml","Metre","cm","Feet","Inch","Box","Pack","Pcs","Set","Pair","Roll","Sheet","Hours","Days","Months","Years"];
const attributeOptions        = ["Color","Size","Material","Style","Weight","Finish","Flavor","Scent","Storage","Connectivity"];

const toItems = (arr: string[]): BrandEntry[] => arr.map((name, i) => ({ id: i + 1, name }));

interface VariationRow { id: number; attribute: string; options: string[]; inputValue: string; }
interface VariantRowData { name?: string; sku: string; costPrice: string; sellingPrice: string; }
const cartesian = (arrays: string[][]): string[][] => {
  if (arrays.length === 0) return [[]];
  const [first, ...rest] = arrays;
  return first.flatMap((item) => cartesian(rest).map((combo) => [item, ...combo]));
};
let _nextVarId          = 2;
let _nextAttributeId    = attributeOptions.length + 1;
let _nextSKURowId       = 100;

interface SKUConfigRow {
  id: number;
  attribute: string;
  showMode: "First" | "Last";
  showCount: number;
  letterCase: "Upper Case" | "Lower Case" | "";
  separator: string;
  customText: string;
}

const SKU_SEPARATORS = ["-", "/", ":", ".", "#", "×"];

const valuationMethodOptions  = ["FIFO","Average Cost","LIFO"];
const vendorOptions           = ["","ABC Suppliers","XYZ Traders","Global Imports"];
const productTagOptions       = ["None","Electronics","Stationery","Furniture","Services"];

// ─── Generic Manage-Items Modal (shared by Brand & Manufacturer) ──────────────
interface ManageItemsModalProps {
  show: boolean;
  onHide: () => void;
  title: string;       // "Manage Brands"
  singular: string;    // "Brand"
  plural: string;      // "Brands"
  items: BrandEntry[];
  onSave: (name: string) => Promise<BrandEntry | null>;
  onUpdate: (id: number, name: string) => Promise<boolean>;
  onDelete?: (id: number) => Promise<boolean>;
  onSaveAndSelect: (entry: BrandEntry) => void;
}

const ManageItemsModal = ({
  show, onHide, title, singular, plural, items,
  onSave, onUpdate, onDelete, onSaveAndSelect,
}: ManageItemsModalProps) => {
  const [hoveredId, setHoveredId]     = useState<number | null>(null);
  const [editingId, setEditingId]     = useState<number | null>(null);
  const [editName, setEditName]       = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName]         = useState("");
  const [modalSaving, setModalSaving] = useState(false);

  useEffect(() => {
    if (!show) {
      setHoveredId(null); setEditingId(null); setEditName("");
      setShowNewForm(false); setNewName(""); setModalSaving(false);
    }
  }, [show]);

  const startEdit = (item: BrandEntry) => {
    setEditingId(item.id);
    setEditName(item.name);
    setShowNewForm(false);
  };

  const commitEdit = async () => {
    if (editingId !== null && editName.trim()) {
      setModalSaving(true);
      const ok = await onUpdate(editingId, editName.trim());
      setModalSaving(false);
      if (ok) setEditingId(null);
    }
  };

  const handleSaveAndSelect = async () => {
    if (!newName.trim()) return;
    setModalSaving(true);
    const entry = await onSave(newName.trim());
    setModalSaving(false);
    if (entry) {
      onSaveAndSelect(entry);
      onHide();
    }
  };

  const handleDelete = async (id: number) => {
    if (!onDelete) return;
    setModalSaving(true);
    await onDelete(id);
    setModalSaving(false);
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton className="px-4 py-3">
        <Modal.Title className="fs-18 fw-semibold">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        {/* + New button */}
        {!showNewForm && (
          <div className="px-4 pt-3 pb-3 border-bottom">
            <button
              type="button"
              className="btn btn-outline-light d-flex align-items-center gap-2"
              style={{ textDecoration: "none" }}
              onClick={() => { setShowNewForm(true); setEditingId(null); }}
            >
              <i className="ti ti-plus fs-16" />
              <span className="fs-14 fw-medium">New {singular}</span>
            </button>
          </div>
        )}

        {/* New item inline form */}
        {showNewForm && (
          <div className="px-4 pt-3 pb-3 border-bottom">
            <label className="form-label fw-medium fs-14 mb-1">
              {singular} Name <span className="text-danger">*</span>
            </label>
            <input
              autoFocus
              type="text"
              className="form-control mb-3"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveAndSelect();
                if (e.key === "Escape") { setShowNewForm(false); setNewName(""); }
              }}
            />
            <div className="d-flex gap-2">
              <button type="button" className="btn btn-danger me-2" onClick={handleSaveAndSelect} disabled={modalSaving}>
                {modalSaving ? <><span className="spinner-border spinner-border-sm me-1" />Saving…</> : "Save and Select"}
              </button>
              <button
                type="button"
                className="btn btn-outline-light"
                style={{ textDecoration: "none" }}
                onClick={() => { setShowNewForm(false); setNewName(""); }}
                disabled={modalSaving}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* List */}
        <div className="px-4 pt-3 pb-2">
          <p className="text-uppercase text-muted fw-semibold fs-12 mb-2" style={{ letterSpacing: "0.06em" }}>
            {plural}
          </p>
          {items.length === 0 && (
            <p className="text-muted fs-14 text-center py-3">No {plural.toLowerCase()} yet.</p>
          )}
          {items.map((item) => (
            <div key={item.id}>
              {editingId === item.id ? (
                <div className="py-3 border-bottom">
                  <label className="form-label fw-medium fs-14 mb-1">
                    {singular} Name <span className="text-danger">*</span>
                  </label>
                  <input
                    autoFocus
                    type="text"
                    className="form-control mb-3"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitEdit();
                      if (e.key === "Escape") setEditingId(null);
                    }}
                  />
                  <div className="d-flex gap-2">
                    <button type="button" className="btn btn-danger me-2" onClick={commitEdit} disabled={modalSaving}>
                      {modalSaving ? <><span className="spinner-border spinner-border-sm me-1" />Saving…</> : "Save"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-light"
                      style={{ textDecoration: "none" }}
                      onClick={() => setEditingId(null)}
                      disabled={modalSaving}
                    >Cancel</button>
                  </div>
                </div>
              ) : (
                <div
                  className="d-flex align-items-center justify-content-between py-2 px-2 rounded"
                  style={{ cursor: "default", background: hoveredId === item.id ? "#f5f5f5" : "transparent" }}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <span className="fs-15">{item.name}</span>
                  <div className="d-flex gap-2" style={{ visibility: hoveredId === item.id ? "visible" : "hidden" }}>
                    <button
                      type="button"
                      title="Edit"
                      className="btn btn-outline-light"
                      style={{ width: 34, height: 34, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}
                      onClick={() => startEdit(item)}
                    >
                      <i className="ti ti-pencil fs-15" />
                    </button>
                    {onDelete && (
                      <button
                        type="button"
                        title="Delete"
                        className="btn btn-outline-danger"
                        style={{ width: 34, height: 34, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}
                        onClick={() => handleDelete(item.id)}
                      >
                        <i className="ti ti-trash fs-15" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Modal.Body>
    </Modal>
  );
};

// ─── Custom dropdown field (Brand / Manufacturer) ────────────────────────────
interface EntityFieldProps {
  label: string;
  value: string;
  onChange: (name: string, id: number) => void;
  items: BrandEntry[];
  onManage?: () => void;
}

const EntityField = ({ label, value, onChange, items, onManage }: EntityFieldProps) => {
  const [open, setOpen]       = useState(false);
  const [dropUp, setDropUp]   = useState(false);
  const [search, setSearch]   = useState("");
  const wrapRef               = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = () => {
    if (!open && wrapRef.current) {
      const rect = wrapRef.current.getBoundingClientRect();
      setDropUp(window.innerHeight - rect.bottom < 280);
    }
    setOpen((o) => !o);
    setSearch("");
  };

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const select = (item: BrandEntry) => {
    onChange(item.name, item.id);
    setOpen(false);
    setSearch("");
  };

  return (
    <div ref={wrapRef} className="position-relative" style={open ? { zIndex: 10 } : undefined}>
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder={`Select or Add ${label}`}
          value={value}
          readOnly
          style={{ cursor: "pointer" }}
          onClick={toggle}
        />
        <button
          type="button"
          className="btn btn-outline-light"
          onClick={toggle}
        >
          <i className={`ti ti-chevron-${open ? "up" : "down"}`} />
        </button>
      </div>

      {open && (
        <div
          className="position-absolute bg-white border rounded shadow-sm"
          style={{
            ...(dropUp
              ? { bottom: "calc(100% + 4px)", top: "auto" }
              : { top: "calc(100% + 4px)", bottom: "auto" }),
            left: 0, right: 0, zIndex: 1050, minWidth: 220,
          }}
        >
          {/* Search */}
          <div className="p-2 border-bottom">
            <input
              autoFocus
              type="text"
              className="form-control fs-14"
              style={{ height: 42 }}
              placeholder={`Search ${label}…`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Items list */}
          <div style={{ maxHeight: 180, overflowY: "auto" }}>
            {filtered.length === 0 ? (
              <p className="text-muted fs-13 text-center py-2 mb-0">No results</p>
            ) : (
              filtered.map((item) => (
                <div
                  key={item.id}
                  className="px-3 py-2 fs-15"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                  onClick={() => select(item)}
                >
                  {item.name}
                </div>
              ))
            )}
          </div>

          {/* Manage link */}
          {onManage && (
            <div className="border-top px-3 py-2">
              <button
                type="button"
                className="btn btn-link p-0 fs-14 text-primary fw-medium"
                style={{ textDecoration: "none" }}
                onClick={() => { setOpen(false); setSearch(""); onManage(); }}
              >
                Manage {label}s
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Generate SKU Modal ───────────────────────────────────────────────────────
interface GenerateSKUModalProps {
  show: boolean;
  onHide: () => void;
  itemName: string;
  filledVariations: VariationRow[];
  variantRows: Array<{ key: string; combo: string[] }>;
  onApply: (skuMap: Record<string, string>) => void;
}

const GenerateSKUModal = ({ show, onHide, itemName, filledVariations, variantRows, onApply }: GenerateSKUModalProps) => {
  const [rows, setRows] = useState<SKUConfigRow[]>([]);

  useEffect(() => {
    if (show) {
      setRows([
        { id: _nextSKURowId++, attribute: "Item Name", showMode: "First", showCount: 3, letterCase: "Upper Case", separator: "-", customText: "" },
        ...filledVariations.map((v) => ({
          id: _nextSKURowId++,
          attribute: v.attribute,
          showMode: "First" as const,
          showCount: 3,
          letterCase: "Upper Case" as const,
          separator: "-",
          customText: "",
        })),
      ]);
    }
  }, [show]);

  const availableAttributes = ["Item Name", ...filledVariations.map((v) => v.attribute), "Custom Text"];

  const computeSegment = (row: SKUConfigRow, combo: string[]): string => {
    let raw = "";
    if (row.attribute === "Item Name") {
      raw = itemName || "ITEM";
    } else if (row.attribute === "Custom Text") {
      raw = row.customText;
    } else {
      const idx = filledVariations.findIndex((v) => v.attribute === row.attribute);
      if (idx !== -1) raw = combo[idx] ?? "";
    }
    if (row.attribute !== "Custom Text") {
      raw = row.showMode === "First" ? raw.slice(0, row.showCount) : raw.slice(-row.showCount);
    }
    if (row.letterCase === "Upper Case") raw = raw.toUpperCase();
    else if (row.letterCase === "Lower Case") raw = raw.toLowerCase();
    return raw + (row.separator || "");
  };

  const previewCombo = filledVariations.map((v) => v.options[0] ?? "");
  const previewSKU = rows.map((r) => computeSegment(r, previewCombo)).join("");

  const updateRow = (id: number, changes: Partial<SKUConfigRow>) =>
    setRows((p) => p.map((r) => (r.id === id ? { ...r, ...changes } : r)));

  const removeRow = (id: number) => setRows((p) => p.filter((r) => r.id !== id));

  const addRow = () =>
    setRows((p) => [
      ...p,
      { id: _nextSKURowId++, attribute: "Custom Text", showMode: "First", showCount: 3, letterCase: "Upper Case", separator: "-", customText: "" },
    ]);

  const handleApply = () => {
    const skuMap: Record<string, string> = {};
    variantRows.forEach(({ key, combo }) => {
      skuMap[key] = rows.map((r) => computeSegment(r, combo)).join("");
    });
    onApply(skuMap);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton className="px-4 py-3">
        <Modal.Title className="fs-18 fw-semibold">
          Generate SKU{itemName ? ` - ${itemName}` : ""}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4 pt-3 pb-2">
        <p className="fs-14 text-muted mb-3 d-flex align-items-center gap-1">
          Select attributes that you would like to generate the SKU from
          <OverlayTrigger placement="right" overlay={<Tooltip>Each attribute segment is combined to form the SKU</Tooltip>}>
            <i className="ti ti-help-circle text-muted fs-14" />
          </OverlayTrigger>
        </p>

        {/* Column headers */}
        <div className="row mb-2" style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: "#888", letterSpacing: "0.05em" }}>
          <div className="col-4">Select Attribute</div>
          <div className="col-3">Show</div>
          <div className="col-2">Letter Case</div>
          <div className="col-2">Separator</div>
          <div className="col-1" />
        </div>

        {/* Config rows */}
        {rows.map((row) => (
          <div key={row.id} className="row mb-2 align-items-center g-2">
            {/* Attribute dropdown */}
            <div className="col-4">
              <select
                className="form-select fs-14"
                value={row.attribute}
                onChange={(e) => updateRow(row.id, { attribute: e.target.value })}
              >
                {availableAttributes.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            {/* Show: First/Last + count OR custom text input */}
            <div className="col-3">
              {row.attribute === "Custom Text" ? (
                <input
                  type="text"
                  className="form-control fs-14"
                  placeholder="Enter the custom text"
                  value={row.customText}
                  onChange={(e) => updateRow(row.id, { customText: e.target.value })}
                />
              ) : (
                <div className="d-flex gap-1">
                  <select
                    className="form-select fs-14"
                    style={{ width: 90, flexShrink: 0 }}
                    value={row.showMode}
                    onChange={(e) => updateRow(row.id, { showMode: e.target.value as "First" | "Last" })}
                  >
                    <option value="First">First</option>
                    <option value="Last">Last</option>
                  </select>
                  <input
                    type="number"
                    className="form-control fs-14"
                    style={{ width: 60 }}
                    min={1}
                    max={20}
                    value={row.showCount}
                    onChange={(e) => updateRow(row.id, { showCount: Math.max(1, parseInt(e.target.value) || 1) })}
                  />
                </div>
              )}
            </div>

            {/* Letter Case with clear */}
            <div className="col-2">
              <div className="input-group input-group-sm">
                <select
                  className="form-select fs-13"
                  value={row.letterCase}
                  onChange={(e) => updateRow(row.id, { letterCase: e.target.value as SKUConfigRow["letterCase"] })}
                >
                  <option value="">—</option>
                  <option value="Upper Case">Upper Case</option>
                  <option value="Lower Case">Lower Case</option>
                </select>
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  style={{ padding: "0 6px" }}
                  tabIndex={-1}
                  onClick={() => updateRow(row.id, { letterCase: "" })}
                >
                  <i className="ti ti-x fs-11" />
                </button>
              </div>
            </div>

            {/* Separator with clear */}
            <div className="col-2">
              <div className="input-group input-group-sm">
                <select
                  className="form-select fs-13"
                  value={row.separator}
                  onChange={(e) => updateRow(row.id, { separator: e.target.value })}
                >
                  <option value="">None</option>
                  {SKU_SEPARATORS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  style={{ padding: "0 6px" }}
                  tabIndex={-1}
                  onClick={() => updateRow(row.id, { separator: "" })}
                >
                  <i className="ti ti-x fs-11" />
                </button>
              </div>
            </div>

            {/* Remove row */}
            <div className="col-1 d-flex justify-content-center">
              <button
                type="button"
                className="btn p-0 border-0 bg-transparent text-danger"
                onClick={() => removeRow(row.id)}
              >
                <i className="ti ti-circle-x fs-20" />
              </button>
            </div>
          </div>
        ))}

        {/* Add Attribute */}
        <button
          type="button"
          className="btn btn-link p-0 text-primary fs-13 d-flex align-items-center gap-1 mt-2 mb-4"
          style={{ textDecoration: "none" }}
          onClick={addRow}
        >
          <i className="ti ti-circle-plus fs-14" />
          Add Attribute
        </button>

        {/* SKU Preview */}
        <p className="fw-semibold fs-14 mb-2">SKU Preview</p>
        <div
          className="d-flex align-items-center justify-content-center rounded"
          style={{ border: "2px dashed #e8c97a", background: "#fffbf0", minHeight: 80, padding: "16px 24px" }}
        >
          <span className="fw-bold fs-20" style={{ color: "#555", letterSpacing: 1 }}>
            {previewSKU || "—"}
          </span>
        </div>
      </Modal.Body>
      <Modal.Footer className="px-4 py-3 justify-content-start">
        <button type="button" className="btn btn-danger me-2" onClick={handleApply}>
          Generate SKU
        </button>
        <button type="button" className="btn btn-outline-light" style={{ textDecoration: "none" }} onClick={onHide}>
          Cancel
        </button>
      </Modal.Footer>
    </Modal>
  );
};

// ─── Manage Categories Modal ──────────────────────────────────────────────────
interface ManageCategoriesModalProps {
  show: boolean;
  onHide: () => void;
  categories: CategoryEntry[];
  onAdd: (name: string, parentId: number | null) => Promise<CategoryEntry | null>;
  onUpdate: (id: number, name: string, parentId: number | null) => Promise<boolean>;
  onDelete: (id: number) => Promise<boolean>;
  onSaveAndSelect: (entry: CategoryEntry) => void;
}

const ManageCategoriesModal = ({
  show, onHide, categories, onAdd, onUpdate, onDelete, onSaveAndSelect,
}: ManageCategoriesModalProps) => {
  const [hoveredId, setHoveredId]   = useState<number | null>(null);
  const [editingId, setEditingId]   = useState<number | null>(null);
  const [editName, setEditName]     = useState("");
  const [editParent, setEditParent] = useState<number | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName]         = useState("");
  const [newParent, setNewParent]     = useState<number | null>(null);
  const [modalSaving, setModalSaving] = useState(false);

  useEffect(() => {
    if (!show) {
      setHoveredId(null); setEditingId(null); setEditName(""); setEditParent(null);
      setShowNewForm(false); setNewName(""); setNewParent(null); setModalSaving(false);
    }
  }, [show]);

  const parentOpts = (excludeId?: number): Option[] =>
    categories
      .filter((c) => c.id !== excludeId)
      .map((c) => ({ value: String(c.id), label: getCategoryPath(c, categories) }));

  const startEdit = (cat: CategoryEntry) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditParent(cat.parentId);
    setShowNewForm(false);
  };

  const commitEdit = async () => {
    if (editingId !== null && editName.trim()) {
      setModalSaving(true);
      const ok = await onUpdate(editingId, editName.trim(), editParent);
      setModalSaving(false);
      if (ok) setEditingId(null);
    }
  };

  const handleSaveAndSelect = async () => {
    if (!newName.trim()) return;
    setModalSaving(true);
    const entry = await onAdd(newName.trim(), newParent);
    setModalSaving(false);
    if (entry) {
      onSaveAndSelect(entry);
      onHide();
    }
  };

  const handleDelete = async (id: number) => {
    setModalSaving(true);
    await onDelete(id);
    setModalSaving(false);
  };

  const CatForm = ({
    name, onNameChange, parentId, onParentChange, excludeId,
    onSave, saveLabel, onCancel,
  }: {
    name: string; onNameChange: (v: string) => void;
    parentId: number | null; onParentChange: (v: number | null) => void;
    excludeId?: number; onSave: () => void; saveLabel: string; onCancel: () => void;
  }) => (
    <div className="py-3 border-bottom">
      <label className="form-label fw-medium fs-14 mb-1">
        Category Name <span className="text-danger">*</span>
      </label>
      <input
        autoFocus
        type="text"
        className="form-control mb-3"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") onSave(); if (e.key === "Escape") onCancel(); }}
      />
      <label className="form-label fw-medium fs-14 mb-1">Parent Category</label>
      <div className="mb-3">
        <CommonSelect
          className="select"
          isClearable
          options={parentOpts(excludeId)}
          value={parentId !== null ? (parentOpts(excludeId).find((o) => o.value === String(parentId)) ?? null) : null}
          onChange={(opt) => onParentChange(opt ? parseInt(opt.value) : null)}
          menuPortalTarget={document.body}
          menuPosition="fixed"
        />
      </div>
      <div className="d-flex gap-2">
        <button type="button" className="btn btn-danger me-2" onClick={onSave}>{saveLabel}</button>
        <button
          type="button"
          className="btn btn-outline-light"
          style={{ textDecoration: "none" }}
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton className="px-4 py-3">
        <Modal.Title className="fs-18 fw-semibold">Manage Categories</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        {/* + New button */}
        {!showNewForm && (
          <div className="px-4 pt-3 pb-3 border-bottom">
            <button
              type="button"
              className="btn btn-outline-light d-flex align-items-center gap-2"
              style={{ textDecoration: "none" }}
              onClick={() => { setShowNewForm(true); setEditingId(null); }}
            >
              <i className="ti ti-plus fs-16" />
              <span className="fs-14 fw-medium">New Category</span>
            </button>
          </div>
        )}

        {/* New category inline form */}
        {showNewForm && (
          <div className="px-4 pt-3">
            <CatForm
              name={newName} onNameChange={setNewName}
              parentId={newParent} onParentChange={setNewParent}
              onSave={handleSaveAndSelect} saveLabel="Save and Select"
              onCancel={() => { setShowNewForm(false); setNewName(""); setNewParent(null); }}
            />
          </div>
        )}

        {/* List */}
        <div className="px-4 pt-3 pb-2">
          <p className="text-uppercase text-muted fw-semibold fs-12 mb-2" style={{ letterSpacing: "0.06em" }}>
            Categories
          </p>
          {categories.length === 0 && (
            <p className="text-muted fs-14 text-center py-3">No categories yet.</p>
          )}
          {categories.map((cat) => (
            <div key={cat.id}>
              {editingId === cat.id ? (
                <div className="ps-2">
                  <CatForm
                    name={editName} onNameChange={setEditName}
                    parentId={editParent} onParentChange={setEditParent}
                    excludeId={cat.id}
                    onSave={commitEdit} saveLabel="Save"
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              ) : (
                <div
                  className="d-flex align-items-center justify-content-between py-2 px-2 rounded"
                  style={{ cursor: "default", background: hoveredId === cat.id ? "#f5f5f5" : "transparent" }}
                  onMouseEnter={() => setHoveredId(cat.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div className="d-flex align-items-center gap-2">
                    <i className="ti ti-folder text-warning fs-18" />
                    <span className="fs-15">
                      {cat.name}
                      {cat.parentId !== null && (
                        <span className="text-muted ms-1 fs-13">
                          ({categories.find((c) => c.id === cat.parentId)?.name ?? ""})
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="d-flex gap-2" style={{ visibility: hoveredId === cat.id ? "visible" : "hidden" }}>
                    <button
                      type="button"
                      title="Edit"
                      className="btn btn-outline-light"
                      style={{ width: 34, height: 34, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}
                      onClick={() => startEdit(cat)}
                    >
                      <i className="ti ti-pencil fs-15" />
                    </button>
                    <button
                      type="button"
                      title="Delete"
                      className="btn btn-outline-danger"
                      style={{ width: 34, height: 34, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}
                      onClick={() => handleDelete(cat.id)}
                    >
                      <i className="ti ti-trash fs-15" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Modal.Body>
    </Modal>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const NewItem = () => {
  const navigate    = useNavigate();
  const { id }      = useParams<{ id: string }>();
  const isEditMode  = Boolean(id);
  const editId      = id ? parseInt(id, 10) : null;

  // ── Toast state ──────────────────────────────────────────────────────────
  const [toast, setToast] = useState<{ show: boolean; type: "success" | "danger"; message: string }>({ show: false, type: "success", message: "" });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (type: "success" | "danger", message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, type, message });
    toastTimerRef.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 4000);
  };
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  // ── Field state ──────────────────────────────────────────────────────────
  const [name, setName]                 = useState("");
  const [itemType, setItemType]         = useState<ItemType>("goods");
  const [brand, setBrand]               = useState("");
  const [brandId, setBrandId]           = useState<number | null>(null);
  const [category, setCategory]         = useState("");
  const [categoryId, setCategoryId]     = useState<number | null>(null);
  const [formItemType, setFormItemType] = useState<FormItemType>("single");
  const [unit, setUnit]                 = useState("");
  const [sku, setSku]                   = useState("");
  const [description, setDescription]   = useState("");

  const [hasSalesInfo, setHasSalesInfo]   = useState(true);
  const [sellingPrice, setSellingPrice]   = useState("");
  const [salesAccount, setSalesAccount]   = useState("");
  const [salesAccountId, setSalesAccountId] = useState<number | null>(null);
  const [salesDesc, setSalesDesc]         = useState("");

  const [hasPurchaseInfo, setHasPurchaseInfo] = useState(true);
  const [costPrice, setCostPrice]             = useState("");
  const [purchaseAccount, setPurchaseAccount] = useState("");
  const [purchaseAccountId, setPurchaseAccountId] = useState<number | null>(null);
  const [purchaseDesc, setPurchaseDesc]       = useState("");
  const [preferredVendor, setPreferredVendor] = useState("");

  const [trackInventory, setTrackInventory]     = useState(true);
  const [inventoryAccount, setInventoryAccount] = useState("");
  const [inventoryAccountId, setInventoryAccountId] = useState<number | null>(null);
  const [valuationMethod, setValuationMethod]   = useState("");
  const [reorderPoint, setReorderPoint]         = useState("");

  const [isReturnable, setIsReturnable] = useState(true);
  const [dimLength, setDimLength]       = useState("");
  const [dimWidth, setDimWidth]         = useState("");
  const [dimHeight, setDimHeight]       = useState("");
  const [dimUnit, setDimUnit]           = useState<DimensionUnit>("cm");
  const [weight, setWeight]             = useState("");
  const [weightUnit, setWeightUnit]     = useState<WeightUnit>("kg");
  const [productTag, setProductTag]     = useState("None");
  const [hsnCode, setHsnCode]           = useState("");
  const [hsnCodeId, setHsnCodeId]       = useState<number | null>(null);
  const [gstValue, setGstValue]         = useState("");
  const [gstRateId, setGstRateId]       = useState<number | null>(null);

  const [variations, setVariations] = useState<VariationRow[]>([{ id: 1, attribute: "", options: [], inputValue: "" }]);
  const addVariation    = () => setVariations((p) => [...p, { id: _nextVarId++, attribute: "", options: [], inputValue: "" }]);
  const removeVariation = (id: number) => setVariations((p) => p.filter((r) => r.id !== id));
  const updateVariationAttr = (id: number, value: string) =>
    setVariations((p) => p.map((r) => (r.id === id ? { ...r, attribute: value } : r)));
  const addOptionTag = (id: number, raw: string) => {
    const tag = raw.trim();
    if (!tag) return;
    setVariations((p) => p.map((r) =>
      r.id === id ? { ...r, options: r.options.includes(tag) ? r.options : [...r.options, tag], inputValue: "" } : r
    ));
  };
  const removeOptionTag = (id: number, idx: number) =>
    setVariations((p) => p.map((r) => r.id === id ? { ...r, options: r.options.filter((_, i) => i !== idx) } : r));
  const updateOptionInput = (id: number, value: string) => {
    if (value.endsWith(",")) { addOptionTag(id, value.slice(0, -1)); return; }
    setVariations((p) => p.map((r) => r.id === id ? { ...r, inputValue: value } : r));
  };

  const [variantData, setVariantData] = useState<Record<string, VariantRowData>>({});
  const updateVariantField = (key: string, field: keyof VariantRowData, value: string) =>
    setVariantData((p) => ({ ...p, [key]: { ...(p[key] ?? { sku: "", costPrice: "", sellingPrice: "" }), [field]: value } }));

  const getVariantRows = () => {
    const filled = variations.filter((r) => r.attribute && r.options.length > 0);
    if (filled.length === 0) return [];
    return cartesian(filled.map((r) => r.options)).map((combo) => {
      const key  = combo.join("-");
      const auto = combo.join("-");
      const data = variantData[key];
      return { key, combo, displayName: data?.name ?? auto, sku: data?.sku ?? "", costPrice: data?.costPrice ?? "", sellingPrice: data?.sellingPrice ?? "" };
    });
  };
  const copyToAll = (field: "costPrice" | "sellingPrice") => {
    const rows = getVariantRows();
    if (rows.length === 0) return;
    const val = variantData[rows[0].key]?.[field] ?? "";
    setVariantData((p) => {
      const next = { ...p };
      rows.forEach((vr) => { next[vr.key] = { ...(next[vr.key] ?? { sku: "", costPrice: "", sellingPrice: "" }), [field]: val }; });
      return next;
    });
  };

  const [showGenerateSKUModal, setShowGenerateSKUModal] = useState(false);
  const applyGeneratedSKUs = (skuMap: Record<string, string>) => {
    setVariantData((p) => {
      const next = { ...p };
      Object.entries(skuMap).forEach(([key, sku]) => {
        next[key] = { ...(next[key] ?? { costPrice: "", sellingPrice: "" }), sku };
      });
      return next;
    });
  };

  const [attributeItems, setAttributeItems]     = useState<BrandEntry[]>(() => toItems(attributeOptions));
  const [showAttributeModal, setShowAttributeModal] = useState(false);
  const addAttribute    = (name: string): BrandEntry => { const e = { id: _nextAttributeId++, name }; setAttributeItems((p) => [...p, e]); return e; };
  const updateAttribute = (id: number, name: string) => setAttributeItems((p) => p.map((a) => (a.id === id ? { ...a, name } : a)));
  const deleteAttribute = (id: number) => {
    const name = attributeItems.find((a) => a.id === id)?.name ?? "";
    setAttributeItems((p) => p.filter((a) => a.id !== id));
    setVariations((p) => p.map((r) => r.attribute === name ? { ...r, attribute: "" } : r));
  };

  const [showIdentifiers, setShowIdentifiers] = useState(false);
  const [upc, setUpc]   = useState("");
  const [mpn, setMpn]   = useState("");
  const [ean, setEan]   = useState("");
  const [isbn, setIsbn] = useState("");

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile]       = useState<File | null>(null);
  const [variantImageFiles, setVariantImageFiles] = useState<Record<string, { file: File; preview: string }>>({});
  const [saving, setSaving]             = useState(false);
  const [errors, setErrors]             = useState<Record<string, string>>({});
  const [editLoading, setEditLoading]               = useState(isEditMode);
  const [existingImagePath, setExistingImagePath]   = useState<string | null>(null);

  // ── Brand / Category lists ────────────────────────────────────────────────
  const [brands, setBrands]             = useState<BrandEntry[]>([]);
  const [categories, setCategories]     = useState<CategoryEntry[]>([]);
  const [showBrandModal, setShowBrandModal]       = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // ── HSN / GST lists ───────────────────────────────────────────────────────
  const [hsnCodes, setHsnCodes]         = useState<BrandEntry[]>([]);
  const [gstValues, setGstValues]       = useState<BrandEntry[]>([]);
  const [showHsnModal, setShowHsnModal] = useState(false);
  const [showGstModal, setShowGstModal] = useState(false);

  // ── Custom fields (from settings) ─────────────────────────────────────────
  const [customFields, setCustomFields]       = useState<CustomField[]>([]);
  const [cfValues, setCfValues]               = useState<Record<string, string>>({});
  const [cfErrors, setCfErrors]               = useState<Record<string, string>>({});
  const [cfFiles, setCfFiles]                 = useState<Record<string, File | null>>({});
  const [cfPreviews, setCfPreviews]           = useState<Record<string, string>>({});
  const [autoGenPreviews, setAutoGenPreviews] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      const [cfRes, agpRes, settingsRes, brandsRes, catsRes, hsnRes, gstRes,
             salesAccRes, purchaseAccRes, inventoryAccRes] = await Promise.all([
        fetchCustomFields("products"),
        fetchAutoGeneratePreview("items"),
        fetchSettings<ProductConfiguration>("products"),
        fetchBrands(),
        fetchCategories(),
        fetchHsnCodes(),
        fetchGstRates(),
        fetchAccounts("sales"),
        fetchAccounts("purchase"),
        fetchAccounts("inventory"),
      ]);

      // ── Custom fields ──────────────────────────────────────────────────────
      const activeFields = cfRes.success ? cfRes.data.filter((f) => f.config.is_active) : [];
      setCustomFields(activeFields);

      // ── Auto-generate previews (only needed for new items) ─────────────────
      if (!isEditMode && agpRes.success) setAutoGenPreviews(agpRes.data);

      // ── Settings ───────────────────────────────────────────────────────────
      if (settingsRes.success && settingsRes.configuration) {
        if (settingsRes.configuration.dimension_unit) setDimUnit(settingsRes.configuration.dimension_unit as DimensionUnit);
        if (settingsRes.configuration.weight_unit)    setWeightUnit(settingsRes.configuration.weight_unit as WeightUnit);
      }

      // ── Reference lists ────────────────────────────────────────────────────
      const brandsData: BrandEntry[]    = brandsRes.success    ? (brandsRes.data as Brand[]).map((b) => ({ id: b.id, name: b.name }))             : [];
      const catsData: CategoryEntry[]   = catsRes.success      ? (catsRes.data as Category[]).map((c) => ({ id: c.id, name: c.name, parentId: c.parent_id })) : [];
      const hsnData: BrandEntry[]       = hsnRes.success       ? (hsnRes.data as HsnCode[]).map((h) => ({ id: h.id, name: h.code }))              : [];
      const gstData: BrandEntry[]       = gstRes.success       ? (gstRes.data as GstRate[]).map((g) => ({ id: g.id, name: g.label }))             : [];
      const salesAccData: BrandEntry[]  = salesAccRes.success  ? (salesAccRes.data as Account[]).map((a) => ({ id: a.id, name: a.name }))         : [];
      const purchAccData: BrandEntry[]  = purchaseAccRes.success ? (purchaseAccRes.data as Account[]).map((a) => ({ id: a.id, name: a.name }))    : [];
      const invAccData: BrandEntry[]    = inventoryAccRes.success ? (inventoryAccRes.data as Account[]).map((a) => ({ id: a.id, name: a.name }))  : [];

      setBrands(brandsData);
      setCategories(catsData);
      setHsnCodes(hsnData);
      setGstValues(gstData);
      setSalesAccounts(salesAccData);
      setPurchaseAccounts(purchAccData);
      setInventoryAccounts(invAccData);

      // ── Edit mode: fetch item and pre-populate form ────────────────────────
      if (isEditMode && editId) {
        const itemRes = await fetchItem(editId);
        if (itemRes.success) {
          const d    = itemRes.data as Record<string, any>;
          const refs = (d.refs ?? {}) as ItemRefs;

          setName(d.name ?? "");
          setItemType((d.item_type ?? "goods") as ItemType);
          setFormItemType((d.form_type ?? "single") as FormItemType);
          setUnit(d.unit ?? "");
          setSku(d.sku ?? "");
          setDescription(d.description ?? "");
          setProductTag(d.product_tag ?? "None");
          setIsReturnable(d.is_returnable ?? true);

          if (d.image) {
            setExistingImagePath(d.image as string);
            setImagePreview(`/storage/${d.image}`);
          }

          setHasSalesInfo(d.has_sales_info ?? true);
          setSellingPrice(d.selling_price != null ? String(d.selling_price) : "");
          setSalesDesc(d.sales_description ?? "");

          setHasPurchaseInfo(d.has_purchase_info ?? true);
          setCostPrice(d.cost_price != null ? String(d.cost_price) : "");
          setPurchaseDesc(d.purchase_description ?? "");
          setPreferredVendor(d.preferred_vendor ?? "");

          setTrackInventory(d.track_inventory ?? true);
          setReorderPoint(d.reorder_point != null ? String(d.reorder_point) : "");
          const vm = d.valuation_method ?? "";
          setValuationMethod(vm === "fifo" ? "FIFO" : vm === "average" ? "Average Cost" : vm === "lifo" ? "LIFO" : "");

          const dim = (d.dimensions ?? {}) as Record<string, any>;
          setDimLength(dim.length != null ? String(dim.length) : "");
          setDimWidth(dim.width  != null ? String(dim.width)  : "");
          setDimHeight(dim.height != null ? String(dim.height) : "");
          if (dim.unit) setDimUnit(dim.unit as DimensionUnit);

          const wt = (d.weight ?? {}) as Record<string, any>;
          setWeight(wt.value != null ? String(wt.value) : "");
          if (wt.unit) setWeightUnit(wt.unit as WeightUnit);

          const idents = (d.identifiers ?? {}) as Record<string, string>;
          if (idents.upc || idents.mpn || idents.ean || idents.isbn) {
            setShowIdentifiers(true);
            setUpc(idents.upc ?? "");
            setMpn(idents.mpn ?? "");
            setEan(idents.ean ?? "");
            setIsbn(idents.isbn ?? "");
          }

          // Refs → look up display names from the just-loaded lists
          if (refs.brand_id) {
            const found = brandsData.find((b) => b.id === refs.brand_id);
            if (found) { setBrand(found.name); setBrandId(refs.brand_id!); }
          }
          if (refs.category_id) {
            const found = catsData.find((c) => c.id === refs.category_id);
            if (found) { setCategory(found.name); setCategoryId(refs.category_id!); }
          }
          if (refs.hsn_code_id) {
            const found = hsnData.find((h) => h.id === refs.hsn_code_id);
            if (found) { setHsnCode(found.name); setHsnCodeId(refs.hsn_code_id!); }
          }
          if (refs.gst_rate_id) {
            const found = gstData.find((g) => g.id === refs.gst_rate_id);
            if (found) { setGstValue(found.name); setGstRateId(refs.gst_rate_id!); }
          }
          if (refs.sales_account_id) {
            const found = salesAccData.find((a) => a.id === refs.sales_account_id);
            if (found) { setSalesAccount(found.name); setSalesAccountId(refs.sales_account_id!); }
          }
          if (refs.purchase_account_id) {
            const found = purchAccData.find((a) => a.id === refs.purchase_account_id);
            if (found) { setPurchaseAccount(found.name); setPurchaseAccountId(refs.purchase_account_id!); }
          }
          if (refs.inventory_account_id) {
            const found = invAccData.find((a) => a.id === refs.inventory_account_id);
            if (found) { setInventoryAccount(found.name); setInventoryAccountId(refs.inventory_account_id!); }
          }

          // Custom fields: use stored values from the item
          if (d.custom_fields && typeof d.custom_fields === "object") {
            setCfValues(d.custom_fields as Record<string, string>);
          }

          // Variants
          if (d.form_type === "variants" && d.variation_config) {
            setVariations(
              (d.variation_config as { attribute: string; options: string[] }[]).map((vc, i) => ({
                id: i + 1, attribute: vc.attribute, options: vc.options, inputValue: "",
              }))
            );
            if (Array.isArray(d.variants)) {
              const vd: Record<string, VariantRowData> = {};
              for (const v of d.variants as Record<string, any>[]) {
                vd[v.combo_key] = {
                  name:          v.name ?? undefined,
                  sku:           v.sku ?? "",
                  costPrice:     v.cost_price  != null ? String(v.cost_price)  : "",
                  sellingPrice:  v.selling_price != null ? String(v.selling_price) : "",
                };
              }
              setVariantData(vd);
            }
          }
        }
        setEditLoading(false);
      } else {
        // New item: apply custom field defaults
        const defaults: Record<string, string> = {};
        for (const f of activeFields) {
          if (f.config.default_value != null) defaults[f.config.field_key] = f.config.default_value;
        }
        setCfValues(defaults);
      }
    };

    load();
  }, []);

  const setCfValue = (key: string, val: string) =>
    setCfValues((prev) => ({ ...prev, [key]: val }));

  // ── Custom field format patterns ──────────────────────────────────────────
  const CF_FORMAT_PATTERNS: Record<string, { regex: RegExp; message: string }> = {
    numbers:                          { regex: /^[0-9]*$/,            message: "Only numbers are allowed." },
    alphanumeric_no_spaces:           { regex: /^[a-zA-Z0-9]*$/,     message: "Only letters and numbers are allowed (no spaces)." },
    alphanumeric_with_spaces:         { regex: /^[a-zA-Z0-9 ]*$/,    message: "Only letters, numbers, and spaces are allowed." },
    alphanumeric_hyphens_underscores: { regex: /^[a-zA-Z0-9\-_]*$/,  message: "Only letters, numbers, hyphens, and underscores are allowed." },
    alphabets_no_spaces:              { regex: /^[a-zA-Z]*$/,         message: "Only letters are allowed (no spaces)." },
    alphabets_with_spaces:            { regex: /^[a-zA-Z ]*$/,        message: "Only letters and spaces are allowed." },
  };

  const validateCfField = (field: CustomField, value: string): string => {
    const { is_mandatory, data_type, type_config, label } = field.config;
    const tc = type_config as Record<string, unknown>;

    if (data_type === "checkbox") {
      if (is_mandatory && value !== "1") return `${label} must be checked.`;
      return "";
    }

    const plainValue = data_type === "text_multi" && (type_config as Record<string, unknown>).rich_text_editor
      ? value.replace(/<[^>]*>/g, "").trim()
      : value.trim();
    if (is_mandatory && !plainValue) return `${label} is required.`;

    if (data_type === "dropdown" && is_mandatory && !value) return `${label} is required.`;
    if (data_type === "multiselect" && is_mandatory && !value) return `${label} is required.`;
    if (data_type === "lookup"     && is_mandatory && !value) return `${label} is required.`;
    if (data_type === "image"      && is_mandatory && !value) return `${label} is required.`;
    if (data_type === "attachment" && is_mandatory && !value) return `${label} is required.`;

    if (data_type === "number" && value.trim()) {
      if (!/^-?[0-9]+$/.test(value.trim())) return "Please enter a valid whole number.";
    }

    if (data_type === "decimal" && value.trim()) {
      if (isNaN(Number(value.trim()))) return "Please enter a valid decimal number.";
    }

    if (data_type === "amount" && value.trim()) {
      if (isNaN(Number(value.trim())) || Number(value.trim()) < 0) return "Please enter a valid positive amount.";
    }

    if (data_type === "percent" && value.trim()) {
      const n = Number(value.trim());
      if (isNaN(n) || n < 0 || n > 100) return "Percentage must be between 0 and 100.";
    }

    if (data_type === "email" && value.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return "Please enter a valid email address.";
    }

    if (data_type === "url" && value.trim()) {
      try { new URL(value.trim()); } catch { return "Please enter a valid URL (e.g. https://example.com)."; }
    }

    if (data_type === "phone" && value.trim()) {
      if (!/^\+?[0-9\s\-().]{7,20}$/.test(value.trim())) return "Please enter a valid phone number.";
    }

    if ((data_type === "text_single" || data_type === "text_multi") && value.trim()) {
      const customFmt = tc.custom_input_format as string | null;
      const fmt       = tc.input_format as string | null;

      if (customFmt) {
        try {
          if (!new RegExp(customFmt).test(value)) return "Input does not match the required format.";
        } catch { /* invalid regex — skip */ }
      } else if (fmt && CF_FORMAT_PATTERNS[fmt]) {
        const { regex, message } = CF_FORMAT_PATTERNS[fmt];
        if (!regex.test(value)) return message;
      }
    }

    return "";
  };

  const validateAllCfFields = (): boolean => {
    const errs: Record<string, string> = {};
    for (const field of customFields) {
      // auto_generate values are assigned by the backend — skip client-side validation
      if (field.config.data_type === "auto_generate") continue;
      const key = field.config.field_key;
      const err = validateCfField(field, cfValues[key] ?? "");
      if (err) errs[key] = err;
    }
    setCfErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const renderCfInput = (field: CustomField, value: string, onChange: (v: string) => void) => {
    const { data_type, type_config } = field.config;
    const tc = type_config as Record<string, unknown>;
    switch (data_type) {
      case "text_single": {
        const key   = field.config.field_key;
        const error = cfErrors[key] ?? "";
        return (
          <>
            <input
              type="text"
              className={`form-control${error ? " is-invalid" : ""}`}
              value={value}
              placeholder=""
              onChange={(e) => {
                onChange(e.target.value);
                if (error) setCfErrors((prev) => ({ ...prev, [key]: "" }));
              }}
              onBlur={() => {
                const err = validateCfField(field, value);
                setCfErrors((prev) => ({ ...prev, [key]: err }));
              }}
            />
            {error && <div className="invalid-feedback d-block">{error}</div>}
          </>
        );
      }
      case "email":
      case "url":
      case "phone": {
        const key     = field.config.field_key;
        const error   = cfErrors[key] ?? "";
        const iconMap = { email: "ti-mail", url: "ti-world", phone: "ti-phone" } as const;
        const typeMap = { email: "email", url: "url", phone: "tel" } as const;
        const icon    = iconMap[data_type as keyof typeof iconMap];
        const inpType = typeMap[data_type as keyof typeof typeMap];
        return (
          <>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className={`ti ${icon} text-muted`} />
              </span>
              <input
                type={inpType}
                className={`form-control border-start-0${error ? " is-invalid" : ""}`}
                value={value}
                onChange={(e) => {
                  onChange(e.target.value);
                  if (error) setCfErrors((prev) => ({ ...prev, [key]: "" }));
                }}
                onBlur={() => {
                  const err = validateCfField(field, value);
                  setCfErrors((prev) => ({ ...prev, [key]: err }));
                }}
              />
            </div>
            {error && <div className="invalid-feedback d-block">{error}</div>}
          </>
        );
      }
      case "text_multi": {
        const key       = field.config.field_key;
        const error     = cfErrors[key] ?? "";
        const useRich   = !!(tc.rich_text_editor as boolean | undefined);

        if (useRich) {
          return (
            <>
              <div className={error ? "border border-danger rounded" : ""}>
                <ReactQuill
                  theme="snow"
                  value={value}
                  onChange={(html) => {
                    onChange(html);
                    if (error) setCfErrors((prev) => ({ ...prev, [key]: "" }));
                  }}
                  onBlur={() => {
                    // strip tags to check if truly empty
                    const text = value.replace(/<[^>]*>/g, "").trim();
                    const err = validateCfField(field, text ? value : "");
                    setCfErrors((prev) => ({ ...prev, [key]: err }));
                  }}
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, 3, false] }],
                      ["bold", "italic", "underline", "strike"],
                      [{ list: "ordered" }, { list: "bullet" }],
                      ["link"],
                      ["clean"],
                    ],
                  }}
                />
              </div>
              {error && <div className="text-danger fs-13 mt-1">{error}</div>}
            </>
          );
        }

        return (
          <>
            <textarea
              className={`form-control${error ? " is-invalid" : ""}`}
              rows={3}
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
                if (error) setCfErrors((prev) => ({ ...prev, [key]: "" }));
              }}
              onBlur={() => {
                const err = validateCfField(field, value);
                setCfErrors((prev) => ({ ...prev, [key]: err }));
              }}
            />
            {error && <div className="invalid-feedback d-block">{error}</div>}
          </>
        );
      }
      case "number":
      case "decimal":
      case "amount":
      case "percent": {
        const key   = field.config.field_key;
        const error = cfErrors[key] ?? "";
        const handleChange = (v: string) => {
          onChange(v);
          if (error) setCfErrors((prev) => ({ ...prev, [key]: "" }));
        };
        const handleBlur = () => {
          const err = validateCfField(field, value);
          setCfErrors((prev) => ({ ...prev, [key]: err }));
        };
        const inputClass = `form-control${error ? " is-invalid" : ""}`;

        let input: React.ReactNode;
        if (data_type === "amount") {
          input = (
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">₹</span>
              <input type="number" min="0" step="0.01" className={`${inputClass} border-start-0`}
                value={value} onChange={(e) => handleChange(e.target.value)} onBlur={handleBlur} />
            </div>
          );
        } else if (data_type === "percent") {
          input = (
            <div className="input-group">
              <input type="number" min="0" max="100" step="0.01" className={`${inputClass} border-end-0`}
                value={value} onChange={(e) => handleChange(e.target.value)} onBlur={handleBlur} />
              <span className="input-group-text bg-white border-start-0">%</span>
            </div>
          );
        } else if (data_type === "decimal") {
          input = <input type="number" step="any" className={inputClass}
            value={value} onChange={(e) => handleChange(e.target.value)} onBlur={handleBlur} />;
        } else {
          input = <input type="number" step="1" className={inputClass}
            value={value} onChange={(e) => handleChange(e.target.value)} onBlur={handleBlur} />;
        }

        return (
          <>
            {input}
            {error && <div className="invalid-feedback d-block">{error}</div>}
          </>
        );
      }
      case "date": {
        const key   = field.config.field_key;
        const error = cfErrors[key] ?? "";
        return (
          <>
            <CommonDatePicker
              value={value ? dayjs(value) : null}
              onChange={(date) => {
                const newVal = date ? date.format("YYYY-MM-DD") : "";
                onChange(newVal);
                const err = validateCfField(field, newVal);
                setCfErrors((prev) => ({ ...prev, [key]: err }));
              }}
              className={error ? "is-invalid" : ""}
              format="DD/MM/YYYY"
              placeholder="DD/MM/YYYY"
            />
            {error && <div className="invalid-feedback d-block">{error}</div>}
          </>
        );
      }
      case "datetime": {
        const key   = field.config.field_key;
        const error = cfErrors[key] ?? "";
        return (
          <>
            <CommonDatePicker
              value={value ? dayjs(value) : null}
              onChange={(date) => {
                const newVal = date ? date.format("YYYY-MM-DDTHH:mm:00") : "";
                onChange(newVal);
                const err = validateCfField(field, newVal);
                setCfErrors((prev) => ({ ...prev, [key]: err }));
              }}
              className={error ? "is-invalid" : ""}
              showTime={{ format: "HH:mm", minuteStep: 30 }}
              format="DD/MM/YYYY HH:mm"
              placeholder="DD/MM/YYYY HH:mm"
            />
            {error && <div className="invalid-feedback d-block">{error}</div>}
          </>
        );
      }
      case "checkbox": {
        const key     = field.config.field_key;
        const error   = cfErrors[key] ?? "";
        const checked = value === "1";
        return (
          <>
            <div className="form-check form-switch mb-0 mt-1">
              <input
                className={`form-check-input${error ? " is-invalid" : ""}`}
                type="checkbox"
                role="switch"
                id={`cf_checkbox_${key}`}
                checked={checked}
                onChange={(e) => {
                  onChange(e.target.checked ? "1" : "0");
                  if (error) setCfErrors((prev) => ({ ...prev, [key]: "" }));
                }}
              />
              <label className="form-check-label text-muted fs-13" htmlFor={`cf_checkbox_${key}`}>
                {checked ? "Yes" : "No"}
              </label>
            </div>
            {error && <div className="invalid-feedback d-block">{error}</div>}
          </>
        );
      }
      case "dropdown":
      case "multiselect": {
        const key       = field.config.field_key;
        const error     = cfErrors[key] ?? "";
        const addColor  = !!(tc.add_color as boolean | undefined);
        const placement = (tc.color_placement as string | undefined) ?? "next";
        const rawOpts   = (tc.options as { label: string; color?: string; is_active: boolean }[]) ?? [];
        const opts      = rawOpts
          .filter((o) => o.is_active)
          .map((o) => ({ value: o.label, label: o.label, color: o.color ?? "#cccccc" }));

        const selectStyles = {
          option: (base: object, state: { isSelected: boolean; isFocused: boolean }) => ({
            ...base,
            backgroundColor: state.isSelected ? "#E41F07" : state.isFocused ? "white" : "white",
            color: state.isSelected ? "#fff" : state.isFocused ? "#E41F07" : "#707070",
            cursor: "pointer",
            "&:hover": { backgroundColor: "#E41F07", color: "#fff" },
          }),
          control: (base: object) => ({
            ...base,
            borderColor: error ? "#dc3545" : (base as { borderColor: string }).borderColor,
            "&:hover": { borderColor: error ? "#dc3545" : "#E41F07" },
          }),
        };

        const formatOptionLabel = (opt: { value: string; label: string; color: string }) => {
          if (!addColor) return <span>{opt.label}</span>;
          if (placement === "wrap") {
            return (
              <span style={{ background: opt.color, color: "#fff", padding: "2px 8px", borderRadius: 4, fontSize: 13 }}>
                {opt.label}
              </span>
            );
          }
          return (
            <span className="d-flex align-items-center gap-2">
              <span style={{ width: 12, height: 12, borderRadius: "50%", background: opt.color, flexShrink: 0, display: "inline-block" }} />
              {opt.label}
            </span>
          );
        };

        if (data_type === "dropdown") {
          const selected = value ? opts.find((o) => o.value === value) ?? null : null;
          return (
            <>
              <Select
                classNamePrefix="react-select"
                options={opts}
                value={selected}
                styles={selectStyles}
                formatOptionLabel={formatOptionLabel}
                isClearable
                menuPlacement="top"
                placeholder="Select"
                components={{ IndicatorSeparator: () => null }}
                onChange={(opt) => {
                  onChange(opt?.value ?? "");
                  if (error) setCfErrors((prev) => ({ ...prev, [key]: "" }));
                }}
                onBlur={() => {
                  const err = validateCfField(field, value);
                  setCfErrors((prev) => ({ ...prev, [key]: err }));
                }}
              />
              {error && <div className="invalid-feedback d-block">{error}</div>}
            </>
          );
        }

        // multiselect
        const selected = value
          ? value.split(",").map((v) => opts.find((o) => o.value === v) ?? { value: v, label: v, color: "#ccc" })
          : [];
        return (
          <>
            <Select
              classNamePrefix="react-select"
              isMulti
              options={opts}
              value={selected}
              styles={selectStyles}
              formatOptionLabel={formatOptionLabel}
              menuPlacement="top"
              placeholder="Select"
              components={{ IndicatorSeparator: () => null }}
              onChange={(sel) => {
                onChange(sel.map((o) => o.value).join(","));
                if (error) setCfErrors((prev) => ({ ...prev, [key]: "" }));
              }}
              onBlur={() => {
                const err = validateCfField(field, value);
                setCfErrors((prev) => ({ ...prev, [key]: err }));
              }}
            />
            {error && <div className="invalid-feedback d-block">{error}</div>}
          </>
        );
      }
      case "lookup": {
        const key           = field.config.field_key;
        const error         = cfErrors[key] ?? "";
        const lookupModule  = (tc.lookup_module as string) ?? "";

        // Parse stored value "id|label" → { value, label }
        const parseStored = (v: string) => {
          if (!v) return null;
          const idx = v.indexOf("|");
          if (idx === -1) return { value: v, label: v };
          return { value: v, label: v.slice(idx + 1) };
        };
        const selectedOpt = parseStored(value);

        const selectStyles = {
          option: (base: object, state: { isSelected: boolean; isFocused: boolean }) => ({
            ...base,
            backgroundColor: state.isSelected ? "#E41F07" : state.isFocused ? "white" : "white",
            color: state.isSelected ? "#fff" : state.isFocused ? "#E41F07" : "#707070",
            cursor: "pointer",
            "&:hover": { backgroundColor: "#E41F07", color: "#fff" },
          }),
          control: (base: object) => ({
            ...base,
            borderColor: error ? "#dc3545" : (base as { borderColor: string }).borderColor,
            "&:hover": { borderColor: error ? "#dc3545" : "#E41F07" },
          }),
        };

        // Fetch options based on the lookup module
        const loadOptions = async (inputValue: string): Promise<{ value: string; label: string }[]> => {
          const q = inputValue.toLowerCase();
          if (lookupModule === "Items") {
            const res = await fetchItems({ search: inputValue, per_page: 30 });
            if (!res.success) return [];
            return res.data.data.map((it) => ({ value: `${it.id}|${it.name}`, label: it.name }));
          }
          if (lookupModule === "Account") {
            const res = await fetchAccounts();
            if (!res.success) return [];
            return res.data
              .filter((a) => a.name.toLowerCase().includes(q))
              .map((a) => ({ value: `${a.id}|${a.name}`, label: a.name }));
          }
          if (lookupModule === "Category") {
            const res = await fetchCategories();
            if (!res.success) return [];
            return res.data
              .filter((c) => c.name.toLowerCase().includes(q))
              .map((c) => ({ value: `${c.id}|${c.name}`, label: c.name }));
          }
          return [];
        };

        const isSupported = ["Items", "Account", "Category"].includes(lookupModule);

        if (!isSupported) {
          return (
            <div className="input-group">
              <input
                type="text"
                className="form-control bg-light text-muted fst-italic"
                readOnly
                value=""
                placeholder={`${lookupModule} — not connected yet`}
              />
              <span className="input-group-text bg-light border-start-0 text-muted">
                <i className="ti ti-link fs-15" />
              </span>
            </div>
          );
        }

        return (
          <>
            <AsyncSelect
              classNamePrefix="react-select"
              cacheOptions
              defaultOptions
              loadOptions={loadOptions}
              value={selectedOpt}
              styles={selectStyles}
              isClearable
              menuPlacement="top"
              placeholder={`Search ${lookupModule}…`}
              components={{ IndicatorSeparator: () => null }}
              noOptionsMessage={({ inputValue }) =>
                inputValue ? `No ${lookupModule} found` : `Type to search ${lookupModule}`
              }
              onChange={(opt) => {
                onChange(opt?.value ?? "");
                if (error) setCfErrors((prev) => ({ ...prev, [key]: "" }));
              }}
              onBlur={() => {
                const err = validateCfField(field, value);
                setCfErrors((prev) => ({ ...prev, [key]: err }));
              }}
            />
            {error && <div className="invalid-feedback d-block">{error}</div>}
          </>
        );
      }
      case "auto_generate": {
        const fieldKey = field.config.field_key;
        const preview  = cfValues[fieldKey] || autoGenPreviews[fieldKey] || "—";
        return (
          <div className="input-group">
            <input
              type="text"
              className="form-control bg-light text-muted fst-italic"
              readOnly
              value={preview}
            />
            <span className="input-group-text bg-light border-start-0 text-muted">
              <i className="ti ti-wand fs-15" title="Auto-generated" />
            </span>
          </div>
        );
      }
      case "image": {
        const key      = field.config.field_key;
        const error    = cfErrors[key] ?? "";
        const preview  = cfPreviews[key] ?? "";
        const inputId  = `cf_image_${key}`;
        return (
          <>
            <label
              htmlFor={inputId}
              className={`border rounded d-flex flex-column align-items-center justify-content-center text-center position-relative overflow-hidden w-100${error ? " border-danger" : ""}`}
              style={{ cursor: "pointer", background: "#fafafa", height: 140 }}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="preview"
                  style={{ height: "100%", width: "100%", objectFit: "contain", padding: 8 }}
                />
              ) : (
                <>
                  <i className="ti ti-photo-up text-primary fs-28 mb-1" />
                  <span className="fw-semibold fs-13">{field.config.label}</span>
                  <small className="text-muted">Click to upload — PNG, JPG up to 10 MB</small>
                </>
              )}
              {preview && (
                <button
                  type="button"
                  className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 p-1 lh-1"
                  style={{ fontSize: 11 }}
                  onClick={(e) => {
                    e.preventDefault();
                    setCfPreviews((p) => ({ ...p, [key]: "" }));
                    setCfFiles((p) => ({ ...p, [key]: null }));
                    onChange("");
                  }}
                >
                  <i className="ti ti-x" />
                </button>
              )}
            </label>
            <input
              id={inputId}
              type="file"
              accept="image/*"
              className="d-none"
              onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setCfFiles((p) => ({ ...p, [key]: file }));
                setCfPreviews((p) => ({ ...p, [key]: URL.createObjectURL(file) }));
                onChange(file.name);
                if (error) setCfErrors((p) => ({ ...p, [key]: "" }));
              }}
            />
            {error && <div className="invalid-feedback d-block">{error}</div>}
          </>
        );
      }
      case "attachment": {
        const key      = field.config.field_key;
        const error    = cfErrors[key] ?? "";
        const file     = cfFiles[key] ?? null;
        const inputId  = `cf_attach_${key}`;

        // Build accept string from allowed_file_types config
        const allowedTypes = (tc.allowed_file_types as string[] | undefined) ?? ["all_files"];
        const acceptMap: Record<string, string> = {
          image:     "image/*",
          document:  ".doc,.docx,.xls,.xlsx,.csv,.txt,.rtf",
          pdf:       ".pdf",
          all_files: "*",
        };
        const accept = allowedTypes.includes("all_files")
          ? "*"
          : allowedTypes.map((t) => acceptMap[t] ?? "").filter(Boolean).join(",");

        const typeLabels: Record<string, string> = {
          image: "Images", document: "Documents", pdf: "PDF", all_files: "All files",
        };
        const hint = allowedTypes.map((t) => typeLabels[t] ?? t).join(", ");

        const formatSize = (bytes: number) => {
          if (bytes < 1024) return `${bytes} B`;
          if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
          return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        };

        return (
          <>
            <label
              htmlFor={inputId}
              className={`border rounded d-flex align-items-center gap-3 px-3 position-relative${error ? " border-danger" : ""}`}
              style={{ cursor: "pointer", background: "#fafafa", minHeight: 56 }}
            >
              <i className="ti ti-paperclip fs-20 text-muted flex-shrink-0" />
              {file ? (
                <div className="d-flex flex-column overflow-hidden py-2">
                  <span className="fw-medium fs-13 text-truncate">{file.name}</span>
                  <small className="text-muted">{formatSize(file.size)}</small>
                </div>
              ) : (
                <div className="d-flex flex-column py-2">
                  <span className="fw-medium fs-13">Click to attach a file</span>
                  <small className="text-muted">{hint}</small>
                </div>
              )}
              {file && (
                <button
                  type="button"
                  className="btn btn-sm btn-link text-danger text-decoration-none ms-auto p-0 flex-shrink-0"
                  onClick={(e) => {
                    e.preventDefault();
                    setCfFiles((p) => ({ ...p, [key]: null }));
                    onChange("");
                  }}
                >
                  <i className="ti ti-x fs-16" />
                </button>
              )}
            </label>
            <input
              id={inputId}
              type="file"
              accept={accept}
              className="d-none"
              onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setCfFiles((p) => ({ ...p, [key]: f }));
                onChange(f.name);
                if (error) setCfErrors((p) => ({ ...p, [key]: "" }));
              }}
            />
            {error && <div className="invalid-feedback d-block">{error}</div>}
          </>
        );
      }
      default:
        return <input type="text" className="form-control" value={value} onChange={(e) => onChange(e.target.value)} />;
    }
  };

  // ── Account lists ─────────────────────────────────────────────────────────
  const [salesAccounts, setSalesAccounts]         = useState<BrandEntry[]>([]);
  const [purchaseAccounts, setPurchaseAccounts]   = useState<BrandEntry[]>([]);
  const [inventoryAccounts, setInventoryAccounts] = useState<BrandEntry[]>([]);
  const [showSalesAccModal, setShowSalesAccModal]         = useState(false);
  const [showPurchaseAccModal, setShowPurchaseAccModal]   = useState(false);
  const [showInventoryAccModal, setShowInventoryAccModal] = useState(false);

  // ── Brand API handlers ────────────────────────────────────────────────────
  const addBrand = async (name: string): Promise<BrandEntry | null> => {
    const res = await storeBrand(name);
    if (!res.success) { showToast("danger", res.message); return null; }
    const entry: BrandEntry = { id: (res.data as Brand).id, name: (res.data as Brand).name };
    setBrands((p) => [...p, entry]);
    return entry;
  };
  const editBrand = async (id: number, name: string): Promise<boolean> => {
    const res = await apiBrandUpdate(id, name);
    if (!res.success) { showToast("danger", res.message); return false; }
    setBrands((p) => p.map((b) => (b.id === id ? { ...b, name } : b)));
    if (brandId === id) setBrand(name);
    return true;
  };
  const removeBrand = async (id: number): Promise<boolean> => {
    const res = await destroyBrand(id);
    if (!res.success) { showToast("danger", res.message); return false; }
    setBrands((p) => p.filter((b) => b.id !== id));
    if (brandId === id) { setBrand(""); setBrandId(null); }
    return true;
  };

  // ── Category API handlers ─────────────────────────────────────────────────
  const addCategory = async (name: string, parentId: number | null): Promise<CategoryEntry | null> => {
    const res = await storeCategory(name, parentId);
    if (!res.success) { showToast("danger", res.message); return null; }
    const entry: CategoryEntry = { id: (res.data as Category).id, name: (res.data as Category).name, parentId: (res.data as Category).parent_id };
    setCategories((p) => [...p, entry]);
    return entry;
  };
  const editCategory = async (id: number, name: string, parentId: number | null): Promise<boolean> => {
    const res = await apiCategoryUpdate(id, name, parentId);
    if (!res.success) { showToast("danger", res.message); return false; }
    setCategories((p) => p.map((c) => (c.id === id ? { ...c, name, parentId } : c)));
    if (categoryId === id) setCategory(name);
    return true;
  };
  const removeCategory = async (id: number): Promise<boolean> => {
    const res = await destroyCategory(id);
    if (!res.success) { showToast("danger", res.message); return false; }
    setCategories((p) => p.filter((c) => c.id !== id));
    if (categoryId === id) { setCategory(""); setCategoryId(null); }
    return true;
  };

  // ── HSN API handlers ──────────────────────────────────────────────────────
  const addHsn = async (code: string): Promise<BrandEntry | null> => {
    const res = await storeHsnCode(code);
    if (!res.success) { showToast("danger", res.message); return null; }
    const entry: BrandEntry = { id: (res.data as HsnCode).id, name: (res.data as HsnCode).code };
    setHsnCodes((p) => [...p, entry]);
    return entry;
  };
  const editHsn = async (id: number, code: string): Promise<boolean> => {
    const res = await apiHsnUpdate(id, code);
    if (!res.success) { showToast("danger", res.message); return false; }
    setHsnCodes((p) => p.map((h) => (h.id === id ? { ...h, name: code } : h)));
    if (hsnCodeId === id) setHsnCode(code);
    return true;
  };
  const removeHsn = async (id: number): Promise<boolean> => {
    const res = await destroyHsnCode(id);
    if (!res.success) { showToast("danger", res.message); return false; }
    setHsnCodes((p) => p.filter((h) => h.id !== id));
    if (hsnCodeId === id) { setHsnCode(""); setHsnCodeId(null); }
    return true;
  };

  // ── GST API handlers ──────────────────────────────────────────────────────
  const addGst = async (label: string): Promise<BrandEntry | null> => {
    const rateNum = parseFloat(label.replace("%", "").trim());
    if (isNaN(rateNum)) { showToast("danger", "Invalid GST rate. Enter a number like \"18\" or \"18%\"."); return null; }
    const res = await storeGstRate(label, rateNum);
    if (!res.success) { showToast("danger", res.message); return null; }
    const entry: BrandEntry = { id: (res.data as GstRate).id, name: (res.data as GstRate).label };
    setGstValues((p) => [...p, entry]);
    return entry;
  };
  const editGst = async (id: number, label: string): Promise<boolean> => {
    const rateNum = parseFloat(label.replace("%", "").trim());
    if (isNaN(rateNum)) { showToast("danger", "Invalid GST rate."); return false; }
    const res = await apiGstUpdate(id, label, rateNum);
    if (!res.success) { showToast("danger", res.message); return false; }
    setGstValues((p) => p.map((g) => (g.id === id ? { ...g, name: label } : g)));
    if (gstRateId === id) setGstValue(label);
    return true;
  };
  const removeGst = async (id: number): Promise<boolean> => {
    const res = await destroyGstRate(id);
    if (!res.success) { showToast("danger", res.message); return false; }
    setGstValues((p) => p.filter((g) => g.id !== id));
    if (gstRateId === id) { setGstValue(""); setGstRateId(null); }
    return true;
  };

  // ── Account API handlers ──────────────────────────────────────────────────
  const addSalesAcc = async (name: string): Promise<BrandEntry | null> => {
    const res = await storeAccount(name, "sales");
    if (!res.success) { showToast("danger", res.message); return null; }
    const entry: BrandEntry = { id: (res.data as Account).id, name: (res.data as Account).name };
    setSalesAccounts((p) => [...p, entry]);
    return entry;
  };
  const editSalesAcc = async (id: number, name: string): Promise<boolean> => {
    const res = await apiAccountUpdate(id, name, "sales");
    if (!res.success) { showToast("danger", res.message); return false; }
    setSalesAccounts((p) => p.map((a) => (a.id === id ? { ...a, name } : a)));
    if (salesAccountId === id) setSalesAccount(name);
    return true;
  };

  const addPurchaseAcc = async (name: string): Promise<BrandEntry | null> => {
    const res = await storeAccount(name, "purchase");
    if (!res.success) { showToast("danger", res.message); return null; }
    const entry: BrandEntry = { id: (res.data as Account).id, name: (res.data as Account).name };
    setPurchaseAccounts((p) => [...p, entry]);
    return entry;
  };
  const editPurchaseAcc = async (id: number, name: string): Promise<boolean> => {
    const res = await apiAccountUpdate(id, name, "purchase");
    if (!res.success) { showToast("danger", res.message); return false; }
    setPurchaseAccounts((p) => p.map((a) => (a.id === id ? { ...a, name } : a)));
    if (purchaseAccountId === id) setPurchaseAccount(name);
    return true;
  };

  const addInventoryAcc = async (name: string): Promise<BrandEntry | null> => {
    const res = await storeAccount(name, "inventory");
    if (!res.success) { showToast("danger", res.message); return null; }
    const entry: BrandEntry = { id: (res.data as Account).id, name: (res.data as Account).name };
    setInventoryAccounts((p) => [...p, entry]);
    return entry;
  };
  const editInventoryAcc = async (id: number, name: string): Promise<boolean> => {
    const res = await apiAccountUpdate(id, name, "inventory");
    if (!res.success) { showToast("danger", res.message); return false; }
    setInventoryAccounts((p) => p.map((a) => (a.id === id ? { ...a, name } : a)));
    if (inventoryAccountId === id) setInventoryAccount(name);
    return true;
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim())      errs.name            = "Name is required.";
    if (!unit)             errs.unit            = "Unit is required.";
    if (hasSalesInfo && formItemType === "single" && !sellingPrice) errs.sellingPrice = "Selling price is required.";
    if (hasSalesInfo && !salesAccountId)     errs.salesAccount    = "Sales account is required.";
    if (hasPurchaseInfo && formItemType === "single" && !costPrice) errs.costPrice    = "Cost price is required.";
    if (hasPurchaseInfo && !purchaseAccountId) errs.purchaseAccount = "Purchase account is required.";
    if (itemType === "goods" && trackInventory && !inventoryAccountId) errs.inventoryAccount = "Inventory account is required.";
    if (itemType === "goods" && trackInventory && !valuationMethod)    errs.valuationMethod  = "Valuation method is required.";
    setErrors(errs);
    const errCount = Object.keys(errs).length;
    if (errCount === 1) {
      showToast("danger", Object.values(errs)[0]);
    } else if (errCount > 1) {
      showToast("danger", "Please fix the highlighted fields before saving.");
    }
    return errCount === 0;
  };

  const handleSave = async () => {
    const coreOk = validate();
    const cfOk   = validateAllCfFields();
    if (!coreOk || !cfOk) {
      if (!cfOk) showToast("danger", "Please fill in all required fields.");
      return;
    }
    setSaving(true);

    // ── Upload main image ─────────────────────────────────────────────────────
    let uploadedImagePath: string | null = null;
    if (imageFile) {
      const uploadRes = await uploadItemImage(imageFile);
      if (!uploadRes.success) {
        setSaving(false);
        showToast("danger", uploadRes.message || "Failed to upload image.");
        return;
      }
      uploadedImagePath = uploadRes.path;
    }

    // ── Upload custom field image/attachment files ────────────────────────────
    const resolvedCfValues = { ...cfValues };
    const cfFileEntries = Object.entries(cfFiles).filter(([, f]) => f != null) as [string, File][];
    if (cfFileEntries.length > 0) {
      const cfUploadResults = await Promise.all(
        cfFileEntries.map(async ([key, file]) => {
          const fieldDef = customFields.find((f) => f.config.field_key === key);
          const uploader = fieldDef?.config.data_type === "image" ? uploadItemImage : uploadCustomFieldFile;
          const res = await uploader(file);
          return { key, res };
        })
      );
      for (const { key, res } of cfUploadResults) {
        if (!res.success) {
          setSaving(false);
          showToast("danger", res.message || "Failed to upload file for custom field.");
          return;
        }
        resolvedCfValues[key] = res.path;
      }
    }

    // ── Upload variant images in parallel ─────────────────────────────────────
    const variantImagePaths: Record<string, string> = {};
    if (Object.keys(variantImageFiles).length > 0) {
      const results = await Promise.all(
        Object.entries(variantImageFiles).map(async ([key, { file }]) => {
          const res = await uploadItemImage(file);
          return { key, res };
        })
      );
      for (const { key, res } of results) {
        if (!res.success) {
          setSaving(false);
          showToast("danger", `Failed to upload image for variant.`);
          return;
        }
        variantImagePaths[key] = res.path;
      }
    }

    const filledVariations = variations.filter((r) => r.attribute && r.options.length > 0);
    const variantRows = getVariantRows();

    const payload: ItemPayload = {
      name:         name.trim(),
      item_type:    itemType,
      form_type:    formItemType,
      unit:         unit || null,
      sku:          sku.trim() || null,
      description:  description.trim() || null,
      image:        uploadedImagePath ?? (isEditMode ? existingImagePath : null),
      refs: {
        brand_id:             brandId,
        category_id:          categoryId,
        hsn_code_id:          hsnCodeId,
        gst_rate_id:          gstRateId,
        sales_account_id:     salesAccountId,
        purchase_account_id:  purchaseAccountId,
        inventory_account_id: inventoryAccountId,
      },
      has_sales_info:       hasSalesInfo,
      selling_price:        hasSalesInfo && formItemType === "single" && sellingPrice ? parseFloat(sellingPrice) : null,
      sales_description:    hasSalesInfo && salesDesc.trim() ? salesDesc.trim() : null,
      has_purchase_info:    hasPurchaseInfo,
      cost_price:           hasPurchaseInfo && formItemType === "single" && costPrice ? parseFloat(costPrice) : null,
      purchase_description: hasPurchaseInfo && purchaseDesc.trim() ? purchaseDesc.trim() : null,
      preferred_vendor:     preferredVendor || null,
      track_inventory:      itemType === "goods" ? trackInventory : false,
      valuation_method:     itemType === "goods" && trackInventory && valuationMethod
        ? (valuationMethod.toLowerCase().replace(" ", "_").replace("average_cost", "average") as "fifo" | "average")
        : null,
      reorder_point:        reorderPoint ? parseFloat(reorderPoint) : null,
      is_returnable:        isReturnable,
      dimensions:           itemType === "goods" && (dimLength || dimWidth || dimHeight)
        ? { length: dimLength ? parseFloat(dimLength) : null, width: dimWidth ? parseFloat(dimWidth) : null, height: dimHeight ? parseFloat(dimHeight) : null, unit: dimUnit }
        : null,
      weight:               itemType === "goods" && weight
        ? { value: parseFloat(weight), unit: weightUnit }
        : null,
      identifiers:          (upc || mpn || ean || isbn)
        ? { upc: upc || undefined, mpn: mpn || undefined, ean: ean || undefined, isbn: isbn || undefined }
        : null,
      product_tag:          productTag && productTag !== "None" ? productTag : null,
      variation_config:     formItemType === "variants" && filledVariations.length > 0
        ? filledVariations.map((v) => ({ attribute: v.attribute, options: v.options }))
        : null,
      custom_fields:        Object.keys(resolvedCfValues).length > 0 ? resolvedCfValues : null,
      variants:             formItemType === "variants"
        ? variantRows.map((vr) => ({
            combo_key:     vr.key,
            name:          variantData[vr.key]?.name ?? vr.combo.join("-"),
            sku:           variantData[vr.key]?.sku || undefined,
            cost_price:    variantData[vr.key]?.costPrice ? parseFloat(variantData[vr.key].costPrice) : null,
            selling_price: variantData[vr.key]?.sellingPrice ? parseFloat(variantData[vr.key].sellingPrice) : null,
            image:         variantImagePaths[vr.key] ?? null,
          }))
        : undefined,
    };

    const res = isEditMode && editId
      ? await updateItem(editId, payload)
      : await storeItem(payload);
    setSaving(false);

    if (res.success) {
      showToast("success", res.message || (isEditMode ? "Item updated successfully." : "Item saved successfully."));
      setTimeout(() => navigate(isEditMode ? `/items/${editId}` : "/items", { replace: true }), 1200);
    } else {
      showToast("danger", res.message || "Failed to save item.");
      if ("errors" in res && res.errors) {
        const apiErrs: Record<string, string> = {};
        Object.entries(res.errors).forEach(([k, msgs]) => {
          apiErrs[k.replace("refs.", "")] = msgs[0];
        });
        setErrors((prev) => ({ ...prev, ...apiErrs }));
      }
    }
  };

  const clr = (key: string) => setErrors((p) => { const n = { ...p }; delete n[key]; return n; });

  return (
    <>
      <div className="page-wrapper">
        <div className="content">

          {/* ── Page header — breadcrumbs + close button ─────────── */}
          <PageHeader
            title={isEditMode ? "Edit Item" : "New Item"}
            showModuleTile={false}
            showExport={false}
            showClose
            onClose={() => window.history.length > 1 ? navigate(-1) : navigate("/")}
          />

          {/* ── Edit loading state ──────────────────────────────────── */}
          {editLoading ? (
            <div className="d-flex justify-content-center align-items-center py-5">
              <span className="spinner-border text-danger me-2" />
              <span className="text-muted fs-14">Loading item…</span>
            </div>
          ) : null}

          {/* ── Main Card ───────────────────────────────────────────── */}
          <div className="card mb-0" style={editLoading ? { visibility: "hidden", pointerEvents: "none" } : undefined}>
            <div className="card-body p-4">

              {/* ══ Top: form fields (left) + image (right) ══ */}
              <div className="row g-4 mb-4">

                {/* Left */}
                <div className="col-lg-6">

                  {/* Name */}
                  <div className="row mb-3 align-items-center">
                    <label className="col-sm-4 col-form-label text-danger fw-medium fs-14">
                      Name{"\u00A0"}<span>*</span>
                    </label>
                    <div className="col-sm-8">
                      <input
                        type="text"
                        className={`form-control ${errors.name ? "is-invalid" : ""}`}
                        value={name}
                        onChange={(e) => { setName(e.target.value); clr("name"); }}
                      />
                      {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                    </div>
                  </div>

                  {/* Type */}
                  <div className="row mb-3 align-items-center">
                    <label className="col-sm-4 col-form-label fw-medium fs-14 d-flex align-items-center gap-1">
                      Type
                      <OverlayTrigger placement="right" overlay={<Tooltip>Goods are physical products. Services are non-physical.</Tooltip>}>
                        <i className="ti ti-help-circle text-muted fs-14" />
                      </OverlayTrigger>
                    </label>
                    <div className="col-sm-8">
                      <div className="d-flex align-items-center gap-3">
                        {([
                          { value: "goods",   label: "Goods",   icon: "ti-box" },
                          { value: "service", label: "Service", icon: "ti-briefcase" },
                        ] as { value: ItemType; label: string; icon: string }[]).map((opt) => {
                          const active = itemType === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setItemType(opt.value)}
                              style={{
                                border: `2px solid ${active ? "var(--bs-danger, #dc3545)" : "#dee2e6"}`,
                                borderRadius: 8,
                                padding: "10px 22px",
                                background: active ? "rgba(220,53,69,0.06)" : "#fff",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                transition: "all .15s",
                              }}
                            >
                              <i
                                className={`ti ${opt.icon} fs-18`}
                                style={{ color: active ? "var(--bs-danger, #dc3545)" : "#6c757d" }}
                              />
                              <span
                                className="fw-medium fs-14"
                                style={{ color: active ? "var(--bs-danger, #dc3545)" : "#495057" }}
                              >
                                {opt.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Brand */}
                  <div className="row mb-3 align-items-center">
                    <label className="col-sm-4 col-form-label fw-medium fs-14">Brand</label>
                    <div className="col-sm-8">
                      <EntityField
                        label="Brand"
                        value={brand}
                        onChange={(name, id) => { setBrand(name); setBrandId(id); }}
                        items={brands}
                        onManage={() => setShowBrandModal(true)}
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div className="row mb-3 align-items-center">
                    <label className="col-sm-4 col-form-label fw-medium fs-14">Category</label>
                    <div className="col-sm-8">
                      <EntityField
                        label="Category"
                        value={category}
                        onChange={(name, id) => { setCategory(name); setCategoryId(id); }}
                        items={categories.map((c) => ({ id: c.id, name: getCategoryPath(c, categories) }))}
                        onManage={() => setShowCategoryModal(true)}
                      />
                    </div>
                  </div>
                </div>

                {/* Right: Image Upload */}
                {formItemType === "single" && <div className="col-lg-6 d-flex flex-column">
                  <label
                    htmlFor="item_image_input"
                    className="border rounded d-flex flex-column align-items-center justify-content-center text-center position-relative overflow-hidden"
                    style={{ cursor: "pointer", background: "#fafafa", height: 200 }}
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Item preview"
                        className="rounded"
                        style={{ height: "100%", width: "100%", objectFit: "contain", padding: 8 }}
                      />
                    ) : (
                      <>
                        <i className="ti ti-photo-up text-primary fs-32 mb-2" />
                        <span className="fw-semibold fs-14">Item Image</span>
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
                    id="item_image_input"
                    type="file"
                    accept="image/*"
                    className="d-none"
                    onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
                    }}
                  />
                </div>}
              </div>

              {/* ══ Item Details ══════════════════════════════════════ */}
              <div className="border-top pt-4 mb-4">
                <h6 className="fw-semibold fs-15 mb-3">Item Details</h6>

                {/* Item Type */}
                <div className="row mb-3 align-items-center">
                  <label className="col-sm-2 col-form-label fw-medium fs-14">Item Type</label>
                  <div className="col-sm-10">
                    <div className="d-flex align-items-center gap-3">
                      {([
                        { value: "single",   label: "Single Item",      icon: "ti-cube" },
                        { value: "variants", label: "Contains Variants", icon: "ti-stack-2" },
                      ] as { value: FormItemType; label: string; icon: string }[]).map((opt) => {
                        const active = formItemType === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setFormItemType(opt.value)}
                            style={{
                              border: `2px solid ${active ? "var(--bs-danger, #dc3545)" : "#dee2e6"}`,
                              borderRadius: 8,
                              padding: "10px 22px",
                              background: active ? "rgba(220,53,69,0.06)" : "#fff",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              transition: "all .15s",
                            }}
                          >
                            <i className={`ti ${opt.icon} fs-18`} style={{ color: active ? "var(--bs-danger, #dc3545)" : "#6c757d" }} />
                            <span className="fw-medium fs-14" style={{ color: active ? "var(--bs-danger, #dc3545)" : "#495057" }}>
                              {opt.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Unit + SKU */}
                <div className="row mb-3 align-items-center">
                  <label className="col-sm-2 col-form-label text-danger fw-medium fs-14 d-flex align-items-center gap-1">
                    Unit{"\u00A0"}<span>*</span>
                    <OverlayTrigger placement="right" overlay={<Tooltip>The unit of measurement for this item</Tooltip>}>
                      <i className="ti ti-help-circle text-muted fs-14" />
                    </OverlayTrigger>
                  </label>
                  <div className="col-sm-4">
                    <CommonSelect
                      className={`select ${errors.unit ? "is-invalid" : ""}`}
                      options={stringsToOpts(unitOptions)}
                      value={toOpt(unit)}
                      onChange={(opt) => { setUnit(opt?.value ?? ""); clr("unit"); }}
                    />
                    {errors.unit && <div className="invalid-feedback d-block">{errors.unit}</div>}
                  </div>
                  {formItemType === "single" && (
                    <>
                      <label className="col-sm-2 col-form-label fw-medium fs-14 d-flex align-items-center gap-1">
                        SKU
                        <OverlayTrigger placement="right" overlay={<Tooltip>Stock Keeping Unit — unique identifier for this item</Tooltip>}>
                          <i className="ti ti-help-circle text-muted fs-14" />
                        </OverlayTrigger>
                      </label>
                      <div className="col-sm-4">
                        <input
                          type="text"
                          className="form-control"
                          value={sku}
                          onChange={(e) => setSku(e.target.value)}
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Add Identifier */}
                {formItemType === "single" && !showIdentifiers && (
                  <div className="row mb-1">
                    <div className="col-sm-10 offset-sm-2">
                      <button
                        type="button"
                        className="btn btn-link p-0 text-primary fs-13 d-flex align-items-center gap-1"
                        style={{ textDecoration: "none" }}
                        onClick={() => setShowIdentifiers(true)}
                      >
                        <i className="ti ti-circle-plus" />
                        Add Identifier
                      </button>
                    </div>
                  </div>
                )}

                {formItemType === "single" && showIdentifiers && (
                  <>
                    {/* UPC + MPN */}
                    <div className="row mb-3 align-items-center">
                      <label className="col-sm-2 col-form-label fw-medium fs-14 d-flex align-items-center gap-1">
                        UPC
                        <OverlayTrigger placement="right" overlay={<Tooltip>Universal Product Code</Tooltip>}>
                          <i className="ti ti-help-circle text-muted fs-14" />
                        </OverlayTrigger>
                      </label>
                      <div className="col-sm-4">
                        <input type="text" className="form-control" value={upc} onChange={(e) => setUpc(e.target.value)} />
                      </div>
                      <label className="col-sm-2 col-form-label fw-medium fs-14 d-flex align-items-center gap-1">
                        MPN
                        <OverlayTrigger placement="right" overlay={<Tooltip>Manufacturer Part Number</Tooltip>}>
                          <i className="ti ti-help-circle text-muted fs-14" />
                        </OverlayTrigger>
                      </label>
                      <div className="col-sm-4">
                        <input type="text" className="form-control" value={mpn} onChange={(e) => setMpn(e.target.value)} />
                      </div>
                    </div>

                    {/* EAN + ISBN */}
                    <div className="row mb-3 align-items-center">
                      <label className="col-sm-2 col-form-label fw-medium fs-14 d-flex align-items-center gap-1">
                        EAN
                        <OverlayTrigger placement="right" overlay={<Tooltip>European Article Number</Tooltip>}>
                          <i className="ti ti-help-circle text-muted fs-14" />
                        </OverlayTrigger>
                      </label>
                      <div className="col-sm-4">
                        <input type="text" className="form-control" value={ean} onChange={(e) => setEan(e.target.value)} />
                      </div>
                      <label className="col-sm-2 col-form-label fw-medium fs-14 d-flex align-items-center gap-1">
                        ISBN
                        <OverlayTrigger placement="right" overlay={<Tooltip>International Standard Book Number</Tooltip>}>
                          <i className="ti ti-help-circle text-muted fs-14" />
                        </OverlayTrigger>
                      </label>
                      <div className="col-sm-4">
                        <input type="text" className="form-control" value={isbn} onChange={(e) => setIsbn(e.target.value)} />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* ══ Item Description ══════════════════════════════════ */}
              <div className="border-top pt-4 mb-4">
                <h6 className="fw-semibold fs-15 mb-3">Item Description</h6>
                <div className="row mb-3 align-items-start">
                  <label className="col-sm-2 col-form-label fw-medium fs-14">Description</label>
                  <div className="col-sm-10">
                    <textarea
                      className="form-control"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* ══ Sales Information ══════════════════════════════════ */}
              <div className="border-top pt-4 mb-4">
                <div
                  className="d-flex align-items-center gap-2 mb-3"
                  style={{ cursor: "pointer" }}
                  onClick={() => setHasSalesInfo((v) => !v)}
                >
                  <input
                    className="form-check-input mt-0 flex-shrink-0"
                    type="checkbox"
                    checked={hasSalesInfo}
                    onChange={() => setHasSalesInfo((v) => !v)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <h6 className="mb-0 fw-semibold fs-15 user-select-none">Sales Information</h6>
                </div>

                {hasSalesInfo && (
                  <>
                    {/* Selling Price + Account (single) / Account-only (variants) */}
                    {formItemType === "single" ? (
                      <div className="row mb-3 align-items-center">
                        <label className="col-sm-2 col-form-label text-danger fw-medium fs-14">
                          Selling Price{"\u00A0"}<span>*</span>
                        </label>
                        <div className="col-sm-4">
                          <div className="input-group">
                            <span className="input-group-text bg-white fs-13">INR</span>
                            <input
                              type="number"
                              className={`form-control border-start-0 ${errors.sellingPrice ? "is-invalid" : ""}`}
                              value={sellingPrice}
                              onChange={(e) => { setSellingPrice(e.target.value); clr("sellingPrice"); }}
                            />
                            {errors.sellingPrice && <div className="invalid-feedback">{errors.sellingPrice}</div>}
                          </div>
                        </div>
                        <label className="col-sm-2 col-form-label text-danger fw-medium fs-14 text-sm-end">
                          Account{"\u00A0"}<span>*</span>
                        </label>
                        <div className={`col-sm-4 ${errors.salesAccount ? "is-invalid" : ""}`}>
                          <EntityField
                            label="Account"
                            value={salesAccount}
                            onChange={(n, id) => { setSalesAccount(n); setSalesAccountId(id); clr("salesAccount"); }}
                            items={salesAccounts}
                            onManage={() => setShowSalesAccModal(true)}
                          />
                          {errors.salesAccount && <div className="invalid-feedback d-block">{errors.salesAccount}</div>}
                        </div>
                      </div>
                    ) : (
                      <div className="row mb-3 align-items-center">
                        <label className="col-sm-2 col-form-label text-danger fw-medium fs-14">
                          Account{"\u00A0"}<span>*</span>
                        </label>
                        <div className={`col-sm-4 ${errors.salesAccount ? "is-invalid" : ""}`}>
                          <EntityField
                            label="Account"
                            value={salesAccount}
                            onChange={(n, id) => { setSalesAccount(n); setSalesAccountId(id); clr("salesAccount"); }}
                            items={salesAccounts}
                            onManage={() => setShowSalesAccModal(true)}
                          />
                          {errors.salesAccount && <div className="invalid-feedback d-block">{errors.salesAccount}</div>}
                        </div>
                      </div>
                    )}
                    {/* Sales Description */}
                    <div className="row mb-3 align-items-start">
                      <label className="col-sm-2 col-form-label fw-medium fs-14">Description</label>
                      <div className="col-sm-10">
                        <textarea className="form-control" rows={2}
                          value={salesDesc} onChange={(e) => setSalesDesc(e.target.value)} />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* ══ Purchase Information ══════════════════════════════ */}
              <div className="border-top pt-4 mb-4">
                <div
                  className="d-flex align-items-center gap-2 mb-3"
                  style={{ cursor: "pointer" }}
                  onClick={() => setHasPurchaseInfo((v) => !v)}
                >
                  <input
                    className="form-check-input mt-0 flex-shrink-0"
                    type="checkbox"
                    checked={hasPurchaseInfo}
                    onChange={() => setHasPurchaseInfo((v) => !v)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <h6 className="mb-0 fw-semibold fs-15 user-select-none">Purchase Information</h6>
                </div>

                {hasPurchaseInfo && (
                  <>
                    {/* Cost Price + Account (single) / Account-only (variants) */}
                    {formItemType === "single" ? (
                      <div className="row mb-3 align-items-center">
                        <label className="col-sm-2 col-form-label text-danger fw-medium fs-14">
                          Cost Price{"\u00A0"}<span>*</span>
                        </label>
                        <div className="col-sm-4">
                          <div className="input-group">
                            <span className="input-group-text bg-white fs-13">INR</span>
                            <input
                              type="number"
                              className={`form-control border-start-0 ${errors.costPrice ? "is-invalid" : ""}`}
                              value={costPrice}
                              onChange={(e) => { setCostPrice(e.target.value); clr("costPrice"); }}
                            />
                            {errors.costPrice && <div className="invalid-feedback">{errors.costPrice}</div>}
                          </div>
                        </div>
                        <label className="col-sm-2 col-form-label text-danger fw-medium fs-14 text-sm-end">
                          Account{"\u00A0"}<span>*</span>
                        </label>
                        <div className={`col-sm-4 ${errors.purchaseAccount ? "is-invalid" : ""}`}>
                          <EntityField
                            label="Account"
                            value={purchaseAccount}
                            onChange={(n, id) => { setPurchaseAccount(n); setPurchaseAccountId(id); clr("purchaseAccount"); }}
                            items={purchaseAccounts}
                            onManage={() => setShowPurchaseAccModal(true)}
                          />
                          {errors.purchaseAccount && <div className="invalid-feedback d-block">{errors.purchaseAccount}</div>}
                        </div>
                      </div>
                    ) : (
                      <div className="row mb-3 align-items-center">
                        <label className="col-sm-2 col-form-label text-danger fw-medium fs-14">
                          Account{"\u00A0"}<span>*</span>
                        </label>
                        <div className={`col-sm-4 ${errors.purchaseAccount ? "is-invalid" : ""}`}>
                          <EntityField
                            label="Account"
                            value={purchaseAccount}
                            onChange={(n, id) => { setPurchaseAccount(n); setPurchaseAccountId(id); clr("purchaseAccount"); }}
                            items={purchaseAccounts}
                            onManage={() => setShowPurchaseAccModal(true)}
                          />
                          {errors.purchaseAccount && <div className="invalid-feedback d-block">{errors.purchaseAccount}</div>}
                        </div>
                      </div>
                    )}
                    {/* Purchase Description */}
                    <div className="row mb-3 align-items-start">
                      <label className="col-sm-2 col-form-label fw-medium fs-14">Description</label>
                      <div className="col-sm-10">
                        <textarea className="form-control" rows={2}
                          value={purchaseDesc} onChange={(e) => setPurchaseDesc(e.target.value)} />
                      </div>
                    </div>
                    {/* Preferred Vendor */}
                    <div className="row mb-3 align-items-center">
                      <label className="col-sm-2 col-form-label fw-medium fs-14">Preferred Vendor</label>
                      <div className="col-sm-4">
                        <CommonSelect
                          className="select"
                          options={stringsToOpts(vendorOptions)}
                          value={toOpt(preferredVendor)}
                          onChange={(opt) => setPreferredVendor(opt?.value ?? "")}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* ══ Variations (variants mode only) ══════════════════ */}
              {formItemType === "variants" && (
                <div className="border-top pt-4 mb-4">
                  <h6 className="fw-semibold fs-15 mb-3">Variations</h6>
                  <div className="border rounded p-3">
                    {/* Column headers */}
                    <div className="row mb-2">
                      <div className="col-5">
                        <span className="fw-medium fs-14 text-danger">Attribute <span>*</span></span>
                      </div>
                      <div className="col-6">
                        <span className="fw-medium fs-14 text-danger">Options <span>*</span></span>
                      </div>
                    </div>

                    {/* Variation rows */}
                    {variations.map((row) => (
                      <div key={row.id} className="row mb-2 align-items-center">
                        <div className="col-5">
                          <EntityField
                            label="Attribute"
                            value={row.attribute}
                            onChange={(name) => updateVariationAttr(row.id, name)}
                            items={attributeItems}
                            onManage={() => setShowAttributeModal(true)}
                          />
                        </div>
                        {/* Tag input for options */}
                        <div className="col-6">
                          <div
                            className="form-control d-flex flex-wrap align-items-center gap-1"
                            style={{ minHeight: 38, height: "auto", cursor: "text" }}
                            onClick={() => (document.getElementById(`opt-input-${row.id}`) as HTMLInputElement)?.focus()}
                          >
                            {row.options.map((tag, idx) => (
                              <span key={idx} className="badge bg-light text-dark border d-inline-flex align-items-center gap-1 fw-normal" style={{ fontSize: 13 }}>
                                {tag}
                                <button type="button" className="btn-close ms-1" style={{ fontSize: 8 }} onClick={(e) => { e.stopPropagation(); removeOptionTag(row.id, idx); }} />
                              </span>
                            ))}
                            <input
                              id={`opt-input-${row.id}`}
                              type="text"
                              className="border-0 flex-grow-1 fs-14"
                              style={{ outline: "none", minWidth: 80, background: "transparent" }}
                              placeholder={row.options.length === 0 ? "Type and press comma…" : ""}
                              value={row.inputValue}
                              onChange={(e) => updateOptionInput(row.id, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") { e.preventDefault(); addOptionTag(row.id, row.inputValue); }
                                if (e.key === "Backspace" && !row.inputValue && row.options.length > 0) removeOptionTag(row.id, row.options.length - 1);
                              }}
                            />
                          </div>
                        </div>
                        <div className="col-1 d-flex justify-content-center">
                          <button
                            type="button"
                            className="btn p-0 border-0 bg-transparent text-danger"
                            onClick={() => removeVariation(row.id)}
                            disabled={variations.length === 1}
                          >
                            <i className="ti ti-trash fs-18" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add more attributes */}
                    <button
                      type="button"
                      className="btn btn-link p-0 text-primary fs-13 d-flex align-items-center gap-1 mt-1"
                      style={{ textDecoration: "none" }}
                      onClick={addVariation}
                    >
                      <i className="ti ti-circle-plus" />
                      Add more attributes
                    </button>
                  </div>

                  {/* ── Variants table ── */}
                  {(() => {
                    const rows = getVariantRows();
                    if (rows.length === 0) return null;
                    return (
                      <div className="mt-3">
                        <h6 className="fw-semibold fs-15 mb-2">Variants</h6>
                        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" as any }}>
                        <div className="border rounded overflow-hidden" style={{ minWidth: 540 }}>
                          {/* Header */}
                          <div className="d-flex align-items-start px-3 py-2 border-bottom" style={{ background: "#f8f9fa", gap: 12 }}>
                            <div className="d-none d-sm-block" style={{ width: 68, flexShrink: 0 }}>
                              <span className="fw-semibold fs-12 text-uppercase">Image</span>
                            </div>
                            <div style={{ flex: 2 }}>
                              <span className="fw-semibold fs-12 text-uppercase">Item Name *</span>
                            </div>
                            <div style={{ flex: 2 }}>
                              <div className="d-flex align-items-center gap-1">
                                <span className="fw-semibold fs-12 text-uppercase">SKU</span>
                                <OverlayTrigger placement="top" overlay={<Tooltip>Stock Keeping Unit</Tooltip>}>
                                  <i className="ti ti-help-circle text-muted fs-12" />
                                </OverlayTrigger>
                              </div>
                              <button type="button" className="btn btn-link p-0 fs-12 text-danger d-inline-flex align-items-center gap-1 mt-1" style={{ textDecoration: "none" }} onClick={() => setShowGenerateSKUModal(true)}>
                                <i className="ti ti-copy fs-12" /> Generate SKU
                              </button>
                            </div>
                            <div style={{ flex: 2 }}>
                              <span className="fw-semibold fs-12 text-uppercase">Cost (₹) *</span>
                              <div>
                                <button type="button" className="btn btn-link p-0 fs-12 text-danger mt-1" style={{ textDecoration: "none" }} onClick={() => copyToAll("costPrice")}>Copy to All</button>
                              </div>
                            </div>
                            <div style={{ flex: 2 }}>
                              <span className="fw-semibold fs-12 text-uppercase">Selling (₹) *</span>
                              <div>
                                <button type="button" className="btn btn-link p-0 fs-12 text-danger mt-1" style={{ textDecoration: "none" }} onClick={() => copyToAll("sellingPrice")}>Copy to All</button>
                              </div>
                            </div>
                            <div style={{ width: 52, flexShrink: 0 }} />
                          </div>

                          {/* Rows */}
                          {rows.map((vr) => (
                            <div key={vr.key} className="d-flex align-items-center px-3 py-3 border-bottom" style={{ gap: 12 }}>
                              {/* Image */}
                              <div className="d-none d-sm-block" style={{ width: 68, flexShrink: 0 }}>
                                <label
                                  htmlFor={`variant_img_${vr.key}`}
                                  className="border rounded d-flex flex-column align-items-center justify-content-center position-relative overflow-hidden"
                                  style={{ width: 64, height: 64, background: "#fafafa", cursor: "pointer" }}
                                >
                                  {variantImageFiles[vr.key] ? (
                                    <>
                                      <img
                                        src={variantImageFiles[vr.key].preview}
                                        alt="variant"
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                      />
                                      <button
                                        type="button"
                                        className="position-absolute top-0 end-0 btn btn-danger p-0 lh-1"
                                        style={{ width: 16, height: 16, fontSize: 9 }}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          setVariantImageFiles((p) => { const n = { ...p }; delete n[vr.key]; return n; });
                                        }}
                                      >
                                        <i className="ti ti-x" />
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <i className="ti ti-photo-up text-primary fs-20" />
                                      <span className="fs-11 mt-1 text-muted">Add</span>
                                    </>
                                  )}
                                </label>
                                <input
                                  id={`variant_img_${vr.key}`}
                                  type="file"
                                  accept="image/*"
                                  className="d-none"
                                  onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setVariantImageFiles((p) => ({
                                        ...p,
                                        [vr.key]: { file, preview: URL.createObjectURL(file) },
                                      }));
                                    }
                                  }}
                                />
                              </div>
                              {/* Item Name */}
                              <div style={{ flex: 2 }}>
                                <input type="text" className="form-control" value={vr.displayName}
                                  onChange={(e) => updateVariantField(vr.key, "name", e.target.value)} />
                              </div>
                              {/* SKU */}
                              <div style={{ flex: 2 }}>
                                <input type="text" className="form-control" placeholder="" value={vr.sku}
                                  onChange={(e) => updateVariantField(vr.key, "sku", e.target.value)} />
                              </div>
                              {/* Cost Price */}
                              <div style={{ flex: 2 }}>
                                <input type="number" className="form-control" placeholder="" value={vr.costPrice}
                                  onChange={(e) => updateVariantField(vr.key, "costPrice", e.target.value)} />
                              </div>
                              {/* Selling Price */}
                              <div style={{ flex: 2 }}>
                                <input type="number" className="form-control" value={vr.sellingPrice}
                                  onChange={(e) => updateVariantField(vr.key, "sellingPrice", e.target.value)} />
                              </div>
                              {/* Actions */}
                              <div className="d-flex gap-2 align-items-center" style={{ width: 52, flexShrink: 0 }}>
                                <button type="button" className="btn p-0 border-0 bg-transparent text-muted" title="Edit">
                                  <i className="ti ti-pencil fs-16" />
                                </button>
                                <button type="button" className="btn p-0 border-0 bg-transparent text-danger" title="Remove"
                                  onClick={() => setVariantData((p) => { const n = { ...p }; delete n[vr.key]; return n; })}>
                                  <i className="ti ti-circle-x fs-18" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        </div>{/* end overflow-x scroll wrapper */}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* ══ Track Inventory (Goods only) ══════════════════════ */}
              {itemType === "goods" && (
                <div className="border-top pt-4 mb-4">
                  <div
                    className="d-flex align-items-center gap-2 mb-1"
                    style={{ cursor: "pointer" }}
                    onClick={() => setTrackInventory((v) => !v)}
                  >
                    <input
                      className="form-check-input mt-0 flex-shrink-0"
                      type="checkbox"
                      checked={trackInventory}
                      onChange={() => setTrackInventory((v) => !v)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <h6 className="mb-0 fw-semibold fs-15 user-select-none">Track Inventory for this item</h6>
                  </div>
                  <p className="text-muted fs-13 mb-3 ps-4">
                    You cannot enable/disable inventory tracking once you've created transactions for this item
                  </p>

                  {trackInventory && (
                    <>
                      {/* Inventory Account + Valuation Method */}
                      <div className="row mb-3 align-items-center">
                        <label className="col-sm-2 col-form-label text-danger fw-medium fs-14">
                          Inventory Account{"\u00A0"}<span>*</span>
                        </label>
                        <div className={`col-sm-4 ${errors.inventoryAccount ? "is-invalid" : ""}`}>
                          <EntityField
                            label="Inventory Account"
                            value={inventoryAccount}
                            onChange={(n, id) => { setInventoryAccount(n); setInventoryAccountId(id); clr("inventoryAccount"); }}
                            items={inventoryAccounts}
                            onManage={() => setShowInventoryAccModal(true)}
                          />
                          {errors.inventoryAccount && <div className="invalid-feedback d-block">{errors.inventoryAccount}</div>}
                        </div>
                        <label className="col-sm-2 col-form-label text-danger fw-medium fs-14 d-flex align-items-center gap-1">
                          Valuation Method{"\u00A0"}<span>*</span>
                          <OverlayTrigger placement="top" overlay={<Tooltip>The method you select here will be used for inventory valuation</Tooltip>}>
                            <i className="ti ti-help-circle text-muted fs-14" />
                          </OverlayTrigger>
                        </label>
                        <div className={`col-sm-4 ${errors.valuationMethod ? "is-invalid" : ""}`}>
                          <CommonSelect
                            className="select"
                            options={stringsToOpts(valuationMethodOptions)}
                            value={toOpt(valuationMethod)}
                            onChange={(opt) => { setValuationMethod(opt?.value ?? ""); clr("valuationMethod"); }}
                          />
                          {errors.valuationMethod && <div className="invalid-feedback d-block">{errors.valuationMethod}</div>}
                        </div>
                      </div>
                      {/* Reorder Point */}
                      <div className="row mb-3 align-items-center">
                        <label className="col-sm-2 col-form-label fw-medium fs-14">Reorder Point</label>
                        <div className="col-sm-4">
                          <input type="number" className="form-control"
                            value={reorderPoint} onChange={(e) => setReorderPoint(e.target.value)} />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ══ Cancellation and Returns ══════════════════════════ */}
              <div className="border-top pt-4 mb-4">
                <h6 className="fw-semibold fs-15 mb-3">Cancellation and Returns</h6>
                <div className="row mb-3 align-items-center">
                  <label className="col-sm-2 col-form-label fw-medium fs-14">Returnable Item</label>
                  <div className="col-sm-10">
                    <div className="d-flex align-items-center gap-4">
                      <div className="form-check mb-0">
                        <input className="form-check-input" type="radio" id="returnable_yes" name="returnable"
                          checked={isReturnable} onChange={() => setIsReturnable(true)} />
                        <label className="form-check-label" htmlFor="returnable_yes">Yes</label>
                      </div>
                      <div className="form-check mb-0">
                        <input className="form-check-input" type="radio" id="returnable_no" name="returnable"
                          checked={!isReturnable} onChange={() => setIsReturnable(false)} />
                        <label className="form-check-label" htmlFor="returnable_no">No</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ══ Fulfilment Details (Goods only) ══════════════════ */}
              {itemType === "goods" && (
                <div className="border-top pt-4 mb-4">
                  <h6 className="fw-semibold fs-15 mb-3">Fulfilment Details</h6>
                  {/* Dimensions + Weight */}
                  <div className="row mb-3 align-items-center">
                    <label className="col-sm-2 col-form-label fw-medium fs-14">Dimensions</label>
                    <div className="col-sm-4">
                      <div className="d-flex align-items-center gap-1">
                        <input type="number" className="form-control" placeholder="L"
                          value={dimLength} onChange={(e) => setDimLength(e.target.value)} />
                        <span className="text-muted flex-shrink-0">×</span>
                        <input type="number" className="form-control" placeholder="W"
                          value={dimWidth} onChange={(e) => setDimWidth(e.target.value)} />
                        <span className="text-muted flex-shrink-0">×</span>
                        <input type="number" className="form-control" placeholder="H"
                          value={dimHeight} onChange={(e) => setDimHeight(e.target.value)} />
                        <select className="form-select flex-shrink-0" style={{ width: 75 }}
                          value={dimUnit} onChange={(e) => setDimUnit(e.target.value as DimensionUnit)}>
                          <option value="cm">cm</option>
                          <option value="mm">mm</option>
                          <option value="in">in</option>
                          <option value="ft">ft</option>
                        </select>
                      </div>
                    </div>
                    <label className="col-sm-2 col-form-label fw-medium fs-14 text-sm-end">Weight</label>
                    <div className="col-sm-4">
                      <div className="input-group">
                        <input type="number" className="form-control"
                          value={weight} onChange={(e) => setWeight(e.target.value)} />
                        <select className="form-select" style={{ maxWidth: 70 }}
                          value={weightUnit} onChange={(e) => setWeightUnit(e.target.value as WeightUnit)}>
                          <option value="kg">kg</option>
                          <option value="g">g</option>
                          <option value="lb">lb</option>
                          <option value="oz">oz</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ══ Associated Tags ═══════════════════════════════════ */}
              <div className="border-top pt-4 mb-4">
                <h6 className="fw-semibold fs-15 mb-3">Associated Tags</h6>
                <div className="row mb-3 align-items-center">
                  <label className="col-sm-2 col-form-label text-danger fw-medium fs-14">
                    Product{"\u00A0"}<span>*</span>
                  </label>
                  <div className="col-sm-4">
                    <CommonSelect
                      className="select"
                      options={stringsToOpts(productTagOptions)}
                      value={toOpt(productTag)}
                      onChange={(opt) => setProductTag(opt?.value ?? "None")}
                    />
                  </div>
                </div>
              </div>

              {/* ══ Additional Information ════════════════════════════ */}
              <div className="border-top pt-4 mb-4">
                <h6 className="fw-semibold fs-15 mb-3">Additional Information</h6>

                {/* HSN Code + GST */}
                <div className="row mb-3 align-items-center">
                  <label className="col-sm-2 col-form-label fw-medium fs-14">HSN Code</label>
                  <div className="col-sm-4">
                    <EntityField
                      label="HSN Code"
                      value={hsnCode}
                      onChange={(name, id) => { setHsnCode(name); setHsnCodeId(id); }}
                      items={hsnCodes}
                      onManage={() => setShowHsnModal(true)}
                    />
                  </div>
                  <label className="col-sm-2 col-form-label fw-medium fs-14 text-sm-end">GST</label>
                  <div className="col-sm-4">
                    <EntityField
                      label="GST"
                      value={gstValue}
                      onChange={(name, id) => { setGstValue(name); setGstRateId(id); }}
                      items={gstValues}
                      onManage={() => setShowGstModal(true)}
                    />
                  </div>
                </div>

                {/* Dynamic custom fields — auto-fetched from Settings → Custom Fields */}
                {(() => {
                  const EXCLUDED_KEYS = new Set([
                    "selling_price", "sellingprice", "sale_price", "saleprice",
                    "purchase_price", "purchaseprice", "cost_price", "costprice",
                    "sku", "item_sku",
                    "image", "item_image", "product_image",
                    "alias_name", "aliasname", "alias",
                  ]);
                  const EXCLUDED_LABELS = new Set([
                    "selling price", "sale price", "purchase price", "cost price",
                    "sku", "image", "alias name", "alias",
                  ]);

                  const visible = customFields.filter((f) => {
                    const key   = f.config.field_key.toLowerCase().replace(/\s+/g, "_");
                    const label = f.config.label.toLowerCase().trim();
                    return !EXCLUDED_KEYS.has(key) && !EXCLUDED_LABELS.has(label);
                  });

                  const FULL_WIDTH_TYPES = new Set(["text_multi", "attachment", "image"]);
                  const rows: React.ReactElement[] = [];
                  let i = 0;

                  while (i < visible.length) {
                    const field = visible[i];
                    const isFullWidth = FULL_WIDTH_TYPES.has(field.config.data_type);
                    const key = field.config.field_key;
                    const val = cfValues[key] ?? "";

                    if (isFullWidth) {
                      rows.push(
                        <div key={field.id} className="row mb-3 align-items-start">
                          <label className={`col-sm-2 col-form-label fw-medium fs-14${field.config.is_mandatory || cfErrors[key] ? " text-danger" : ""}`}>
                            {field.config.label}
                            {field.config.is_mandatory && <span className="ms-1">*</span>}
                          </label>
                          <div className="col-sm-10">
                            {renderCfInput(field, val, (v) => setCfValue(key, v))}
                          </div>
                        </div>
                      );
                      i++;
                    } else {
                      const next = visible[i + 1];
                      const hasPair = next && !FULL_WIDTH_TYPES.has(next.config.data_type);
                      rows.push(
                        <div key={field.id} className="row mb-3 align-items-center">
                          <label className={`col-sm-2 col-form-label fw-medium fs-14${field.config.is_mandatory || cfErrors[key] ? " text-danger" : ""}`}>
                            {field.config.label}
                            {field.config.is_mandatory && <span className="ms-1">*</span>}
                          </label>
                          <div className={hasPair ? "col-sm-4" : "col-sm-10"}>
                            {renderCfInput(field, val, (v) => setCfValue(key, v))}
                          </div>
                          {hasPair && next && (
                            <>
                              <label className={`col-sm-2 col-form-label fw-medium fs-14 text-sm-end${next.config.is_mandatory || cfErrors[next.config.field_key] ? " text-danger" : ""}`}>
                                {next.config.label}
                                {next.config.is_mandatory && <span className="ms-1">*</span>}
                              </label>
                              <div className="col-sm-4">
                                {renderCfInput(next, cfValues[next.config.field_key] ?? "", (v) => setCfValue(next.config.field_key, v))}
                              </div>
                            </>
                          )}
                        </div>
                      );
                      i += hasPair ? 2 : 1;
                    }
                  }

                  return rows;
                })()}
              </div>

              {/* ══ Save / Cancel ════════════════════════════════════ */}
              <div className="border-top pt-3 d-flex align-items-center gap-2">
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
                  onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/")}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>

            </div>{/* card-body */}
          </div>{/* card */}

        </div>{/* content */}
        <Footer />
      </div>

      {/* ── Toast Notifications ─────────────────────────────────── */}
      <div
        className="position-fixed top-0 start-50 translate-middle-x pt-4"
        style={{ zIndex: 9999, pointerEvents: "none" }}
      >
        <Toast
          show={toast.show}
          onClose={() => setToast((t) => ({ ...t, show: false }))}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          style={{
            pointerEvents: "auto",
            borderRadius: "12px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
            border: "none",
            minWidth: "320px",
            background: "#fff",
          }}
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

      {/* ── Generate SKU Modal ──────────────────────────────────── */}
      <GenerateSKUModal
        show={showGenerateSKUModal}
        onHide={() => setShowGenerateSKUModal(false)}
        itemName={name}
        filledVariations={variations.filter((r) => r.attribute && r.options.length > 0)}
        variantRows={getVariantRows()}
        onApply={applyGeneratedSKUs}
      />

      {/* ── Manage Brands Modal ─────────────────────────────────── */}
      <ManageItemsModal
        show={showBrandModal}
        onHide={() => setShowBrandModal(false)}
        title="Manage Brands"
        singular="Brand"
        plural="Brands"
        items={brands}
        onSave={addBrand}
        onUpdate={editBrand}
        onDelete={removeBrand}
        onSaveAndSelect={(entry) => { setBrand(entry.name); setBrandId(entry.id); }}
      />

      {/* ── Manage Categories Modal ──────────────────────────────── */}
      <ManageCategoriesModal
        show={showCategoryModal}
        onHide={() => setShowCategoryModal(false)}
        categories={categories}
        onAdd={addCategory}
        onUpdate={editCategory}
        onDelete={removeCategory}
        onSaveAndSelect={(entry) => { setCategory(getCategoryPath(entry, [...categories, entry])); setCategoryId(entry.id); }}
      />

      {/* ── Manage Attributes Modal ─────────────────────────────── */}
      <ManageItemsModal
        show={showAttributeModal}
        onHide={() => setShowAttributeModal(false)}
        title="Manage Attributes"
        singular="Attribute"
        plural="Attributes"
        items={attributeItems}
        onSave={async (name) => { const e = addAttribute(name); return e; }}
        onUpdate={async (id, name) => { updateAttribute(id, name); return true; }}
        onDelete={async (id) => { deleteAttribute(id); return true; }}
        onSaveAndSelect={(_entry) => {/* selection handled per-row via EntityField onChange */}}
      />

      {/* ── Manage Sales Accounts Modal ─────────────────────────── */}
      <ManageItemsModal
        show={showSalesAccModal}
        onHide={() => setShowSalesAccModal(false)}
        title="Manage Sales Accounts"
        singular="Account"
        plural="Accounts"
        items={salesAccounts}
        onSave={addSalesAcc}
        onUpdate={editSalesAcc}
        onSaveAndSelect={(entry) => { setSalesAccount(entry.name); setSalesAccountId(entry.id); }}
      />

      {/* ── Manage Purchase Accounts Modal ──────────────────────── */}
      <ManageItemsModal
        show={showPurchaseAccModal}
        onHide={() => setShowPurchaseAccModal(false)}
        title="Manage Purchase Accounts"
        singular="Account"
        plural="Accounts"
        items={purchaseAccounts}
        onSave={addPurchaseAcc}
        onUpdate={editPurchaseAcc}
        onSaveAndSelect={(entry) => { setPurchaseAccount(entry.name); setPurchaseAccountId(entry.id); }}
      />

      {/* ── Manage Inventory Accounts Modal ─────────────────────── */}
      <ManageItemsModal
        show={showInventoryAccModal}
        onHide={() => setShowInventoryAccModal(false)}
        title="Manage Inventory Accounts"
        singular="Account"
        plural="Accounts"
        items={inventoryAccounts}
        onSave={addInventoryAcc}
        onUpdate={editInventoryAcc}
        onSaveAndSelect={(entry) => { setInventoryAccount(entry.name); setInventoryAccountId(entry.id); }}
      />

      {/* ── Manage HSN Codes Modal ───────────────────────────────── */}
      <ManageItemsModal
        show={showHsnModal}
        onHide={() => setShowHsnModal(false)}
        title="Manage HSN Codes"
        singular="HSN Code"
        plural="HSN Codes"
        items={hsnCodes}
        onSave={addHsn}
        onUpdate={editHsn}
        onDelete={removeHsn}
        onSaveAndSelect={(entry) => { setHsnCode(entry.name); setHsnCodeId(entry.id); }}
      />

      {/* ── Manage GST Values Modal ──────────────────────────────── */}
      <ManageItemsModal
        show={showGstModal}
        onHide={() => setShowGstModal(false)}
        title="Manage GST Values"
        singular="GST Value"
        plural="GST Values"
        items={gstValues}
        onSave={addGst}
        onUpdate={editGst}
        onDelete={removeGst}
        onSaveAndSelect={(entry) => { setGstValue(entry.name); setGstRateId(entry.id); }}
      />
    </>
  );
};

export default NewItem;
