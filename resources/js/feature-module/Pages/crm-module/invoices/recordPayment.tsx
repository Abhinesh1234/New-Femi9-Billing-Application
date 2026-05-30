import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "../../../../core/redux/loaderSlice";
import { useNavigate, useParams, useLocation } from "react-router";
import { Toast } from "react-bootstrap";
import dayjs from "dayjs";
import Footer from "../../../../components/footer/footer";
import CustomFieldsPanel, { type CustomFieldsPanelHandle } from "../../../../components/custom-fields/CustomFieldsPanel";
import PageHeader from "../../../../components/page-header/pageHeader";
import CommonSelect, { type Option } from "../../../../components/common-select/commonSelect";
import CommonDatePicker from "../../../../components/common-datePicker/commonDatePicker";
import {
  fetchInvoice,
  recordInvoicePayment,
  uploadPaymentAttachment,
  type InvoiceDetail,
} from "../../../../core/services/invoiceApi";
import { emitMutation } from "../../../../core/cache/mutationEvents";
import { PAYMENT_MODE_OPTIONS } from "../../../../core/data/paymentModeOptions";
import { compressPickedFiles } from "../../../../core/utils/imageCompression";

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileIcon = (file: File): { icon: string; color: string } => {
  if (file.type.startsWith("image/")) return { icon: "ti-photo", color: "#3b82f6" };
  if (file.type === "application/pdf") return { icon: "ti-file-type-pdf", color: "#ef4444" };
  if (file.type.includes("word")) return { icon: "ti-file-type-doc", color: "#2563eb" };
  if (file.type.includes("sheet") || file.type.includes("excel")) return { icon: "ti-file-type-xls", color: "#16a34a" };
  return { icon: "ti-paperclip", color: "#6b7280" };
};

const pmtModeOptions = PAYMENT_MODE_OPTIONS;

const RecordPayment = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const locationState = useLocation().state as { suggestedAmount?: number; maxAmount?: number } | null;
  const suggestedAmount = locationState?.suggestedAmount ?? null;
  const maxAmount       = locationState?.maxAmount       ?? null;

  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [pmtAmount, setPmtAmount]           = useState("");
  const [pmtBankCharges, setPmtBankCharges] = useState("");
  const [pmtTaxDeducted, setPmtTaxDeducted] = useState(false);
  const [pmtDate, setPmtDate]               = useState("");
  const [pmtMode, setPmtMode]               = useState("cash");
  const [pmtRef, setPmtRef]                 = useState("");
  const [pmtNotes, setPmtNotes]             = useState("");
  const [attachments, setAttachments]       = useState<File[]>([]);
  const attachFileRef                       = useRef<HTMLInputElement>(null);
  const cfPanelRef                          = useRef<CustomFieldsPanelHandle>(null);
  const [saving, setSaving]                 = useState(false);
  const [errors, setErrors]                 = useState<Record<string, string>>({});

  const [toast, setToast] = useState<{ show: boolean; type: "success" | "danger"; message: string }>({
    show: false, type: "success", message: "",
  });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (type: "success" | "danger", message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, type, message });
    toastTimerRef.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 4000);
  };
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  useEffect(() => {
    if (!id) return;
    const numId = Number(id);
    if (isNaN(numId)) return;
    setLoading(true);
    dispatch(startLoading("record-payment"));
    fetchInvoice(numId)
      .then((res) => {
        if (res.success) {
          setInvoice(res.data);
          const bal = parseFloat(res.data.balance_amount ?? "0");
          const prefill = suggestedAmount !== null && suggestedAmount >= 0 && suggestedAmount <= bal
            ? suggestedAmount
            : bal;
          setPmtAmount(prefill > 0 ? prefill.toFixed(2) : "");
          setPmtDate(new Date().toISOString().split("T")[0]);
        }
      })
      .catch(() => {})
      .finally(() => { setLoading(false); dispatch(stopLoading("record-payment")); });
  }, [id]);

  const handleRefresh = useCallback(async () => {
    if (!id) return;
    const numId = Number(id);
    if (isNaN(numId)) return;
    setLoading(true);
    fetchInvoice(numId)
      .then((res) => { if (res.success) setInvoice(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const clrErr = (key: string) =>
    setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!pmtDate) errs.pmtDate = "Payment date is required.";
    const amt = parseFloat(pmtAmount);
    const balance = parseFloat(invoice?.balance_amount ?? "0");
    const effectiveMax = maxAmount !== null ? Math.min(maxAmount, balance) : balance;
    if (isNaN(amt) || amt <= 0) {
      errs.pmtAmount = "Enter a valid amount greater than zero.";
    } else if (amt > effectiveMax + 0.005) {
      if (maxAmount !== null && maxAmount < balance) {
        errs.pmtAmount = `Amount cannot exceed ₹${effectiveMax.toFixed(2)} (extra charges only — product cost should be covered by advance payment).`;
      } else {
        errs.pmtAmount = `Amount cannot exceed the outstanding balance of ₹${balance.toFixed(2)}.`;
      }
    }
    if (!invoice?.customer?.id) errs.general = "Invoice has no customer assigned.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!invoice) return;
    if (!validate()) return;
    if (cfPanelRef.current && !cfPanelRef.current.validate()) return;
    setSaving(true);
    const amt      = parseFloat(pmtAmount);
    const charges  = pmtBankCharges ? parseFloat(pmtBankCharges) : null;
    try {
      const res = await recordInvoicePayment({
        customer_id:      invoice.customer!.id,
        location_id:      invoice.location?.id ?? null,
        payment_date:     pmtDate,
        amount:           amt,
        bank_charges:     charges,
        tax_deducted:     pmtTaxDeducted,
        payment_mode:     pmtMode,
        reference_number: pmtRef.trim() || null,
        notes:            pmtNotes.trim() || null,
        invoice_id:       invoice.id,
        applied_amount:   amt,
      });
      if (res.success) {
        // Upload attachments sequentially after payment is created
        if (attachments.length > 0) {
          for (const file of attachments) {
            await uploadPaymentAttachment(res.data.id as number, file);
          }
        }
        showToast("success", "Payment recorded successfully.");
        emitMutation("invoices:mutated");
        setTimeout(() => navigate(`/payments/${res.data.id as number}`), 1200);
      } else {
        showToast("danger", (res as any).message ?? "Failed to record payment.");
      }
    } catch {
      showToast("danger", "Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="page-wrapper">
        <div className="content">

          <PageHeader
            title="Record Payment"
            showModuleTile={false}
            showExport={false}
            showClose
            onRefresh={handleRefresh}
            onClose={() => navigate(-1)}
          />

          {/* Loading */}
          {!invoice ? (
            <div className="alert alert-danger mx-4">Invoice not found.</div>
          ) : (
            <div className="card mb-0">
              <div className="card-body p-4">

                {errors.general && (
                  <div className="alert alert-danger py-2 px-3 fs-13 mb-4">{errors.general}</div>
                )}

                {/* ══ Invoice Info ═════════════════════════════════════════════ */}
                <div className="mb-4">
                  <h6 className="fw-semibold fs-15 mb-3">
                    Payment for{" "}<span className="text-danger">{invoice.invoice_number}</span>
                  </h6>

                  <div className="row mb-3 align-items-center">
                    <label className="col-sm-2 col-form-label text-danger fw-medium fs-14">
                      Customer Name{" "}<span>*</span>
                    </label>
                    <div className="col-sm-4">
                      <input
                        className="form-control bg-light text-muted fst-italic"
                        value={invoice.customer?.display_name ?? "—"}
                        readOnly
                      />
                    </div>
                    <label className="col-sm-2 col-form-label fw-medium fs-14 text-sm-end">
                      Payment #
                    </label>
                    <div className="col-sm-4">
                      <input
                        className="form-control bg-light text-muted fst-italic"
                        value="Auto-generated"
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="row mb-3 align-items-center">
                    <label className="col-sm-2 col-form-label fw-medium fs-14">Location</label>
                    <div className="col-sm-4">
                      <input
                        className="form-control bg-light text-muted fst-italic"
                        value={invoice.location?.name ?? "—"}
                        readOnly
                      />
                    </div>
                    <label className="col-sm-2 col-form-label fw-medium fs-14 text-sm-end">
                      Balance Due
                    </label>
                    <div className="col-sm-4">
                      <div className="input-group">
                        <span className="input-group-text bg-white fs-13">INR</span>
                        <input
                          className="form-control border-start-0 fw-semibold text-danger bg-light"
                          value={parseFloat(invoice.balance_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ══ Amount Details ═══════════════════════════════════════════ */}
                <div className="border-top pt-4 mb-4">
                  <h6 className="fw-semibold fs-15 mb-3">Amount Details</h6>
                  {maxAmount !== null && maxAmount < parseFloat(invoice.balance_amount) && (
                    <div className="alert d-flex align-items-start gap-2 mb-3 py-2 px-3" style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 8 }}>
                      <i className="ti ti-info-circle fs-16 mt-1 flex-shrink-0" style={{ color: "#f59e0b" }} />
                      <span className="fs-13 text-dark">
                        The product cost of <strong>₹{(parseFloat(invoice.balance_amount) - maxAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong> should be settled via advance payment. Record only the extra charges (<strong>₹{maxAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>) here.
                      </span>
                    </div>
                  )}

                  <div className="row mb-3 align-items-start">
                    <label className="col-sm-2 col-form-label text-danger fw-medium fs-14">
                      Amount Received{" "}<span>*</span>
                    </label>
                    <div className="col-sm-4">
                      <div className="input-group">
                        <span className="input-group-text bg-white fs-13">INR</span>
                        <input
                          type="number"
                          className={`form-control border-start-0${errors.pmtAmount ? " is-invalid" : ""}`}
                          placeholder="0.00"
                          min="0.01"
                          step="0.01"
                          max={(() => {
                            const bal = parseFloat(invoice.balance_amount);
                            return maxAmount !== null ? Math.min(maxAmount, bal).toFixed(2) : bal.toFixed(2);
                          })()}
                          value={pmtAmount}
                          onChange={(e) => {
                            const bal = parseFloat(invoice.balance_amount);
                            const cap = maxAmount !== null ? Math.min(maxAmount, bal) : bal;
                            const raw = e.target.value;
                            const val = raw !== "" && parseFloat(raw) > cap
                              ? cap.toFixed(2)
                              : raw;
                            setPmtAmount(val);
                            clrErr("pmtAmount");
                          }}
                        />
                        {errors.pmtAmount && <div className="invalid-feedback">{errors.pmtAmount}</div>}
                      </div>
                    </div>
                    <label className="col-sm-2 col-form-label fw-medium fs-14 text-sm-end">
                      Bank Charges (if any)
                    </label>
                    <div className="col-sm-4">
                      <div className="input-group">
                        <span className="input-group-text bg-white fs-13">INR</span>
                        <input
                          type="number"
                          className="form-control border-start-0"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          value={pmtBankCharges}
                          onChange={(e) => setPmtBankCharges(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row align-items-center mb-3">
                    <label className="col-sm-2 col-form-label fw-medium fs-14">Tax Deducted?</label>
                    <div className="col-sm-10">
                      <div className="d-flex align-items-center gap-4">
                        <div className="form-check mb-0">
                          <input
                            className="form-check-input"
                            type="radio"
                            id="ptaxNo"
                            name="pmtTax"
                            checked={!pmtTaxDeducted}
                            onChange={() => setPmtTaxDeducted(false)}
                          />
                          <label className="form-check-label" htmlFor="ptaxNo">No Tax Deducted</label>
                        </div>
                        <div className="form-check mb-0">
                          <input
                            className="form-check-input"
                            type="radio"
                            id="ptaxYes"
                            name="pmtTax"
                            checked={pmtTaxDeducted}
                            onChange={() => setPmtTaxDeducted(true)}
                          />
                          <label className="form-check-label" htmlFor="ptaxYes">Yes, TDS (Income Tax)</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ══ Payment Details ══════════════════════════════════════════ */}
                <div className="border-top pt-4 mb-4">
                  <h6 className="fw-semibold fs-15 mb-3">Payment Details</h6>

                  <div className="row mb-3 align-items-center">
                    <label className="col-sm-2 col-form-label text-danger fw-medium fs-14">
                      Payment Date{" "}<span>*</span>
                    </label>
                    <div className="col-sm-4">
                      <CommonDatePicker
                        value={pmtDate ? dayjs(pmtDate) : null}
                        onChange={(date) => { setPmtDate(date ? date.format("YYYY-MM-DD") : ""); clrErr("pmtDate"); }}
                        format="DD/MM/YYYY"
                        placeholder="DD/MM/YYYY"
                      />
                      {errors.pmtDate && <div className="invalid-feedback d-block">{errors.pmtDate}</div>}
                    </div>
                    <label className="col-sm-2 col-form-label fw-medium fs-14 text-sm-end">
                      Payment Mode
                    </label>
                    <div className="col-sm-4">
                      <CommonSelect
                        className="select"
                        options={pmtModeOptions}
                        value={pmtModeOptions.find(o => o.value === pmtMode) ?? null}
                        onChange={(opt) => setPmtMode(opt?.value ?? "cash")}
                      />
                    </div>
                  </div>

                  <div className="row mb-3 align-items-center">
                    <label className="col-sm-2 col-form-label fw-medium fs-14">Reference #</label>
                    <div className="col-sm-4">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="UTR / Cheque no."
                        value={pmtRef}
                        onChange={(e) => setPmtRef(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="row mb-3 align-items-start">
                    <label className="col-sm-2 col-form-label fw-medium fs-14">Notes</label>
                    <div className="col-sm-10">
                      <textarea
                        className="form-control"
                        rows={3}
                        value={pmtNotes}
                        onChange={(e) => setPmtNotes(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* ══ Attachments ══════════════════════════════════════════════ */}
                <div className="border-top pt-4 mb-4">
                  <p className="form-label fw-medium fs-14 mb-2">Attach File(s) to Payment</p>

                  {/* Clickable attach box */}
                  <label
                    htmlFor="record_pmt_attach_input"
                    className="border rounded d-flex align-items-center gap-3 px-3 position-relative w-100"
                    style={{ cursor: "pointer", background: "#fafafa", minHeight: 56 }}
                  >
                    <i className="ti ti-paperclip fs-20 text-muted flex-shrink-0" />
                    {attachments.length > 0 ? (
                      <div className="d-flex flex-column py-2">
                        <span className="fw-medium fs-13">
                          {attachments.length} file{attachments.length > 1 ? "s" : ""} attached
                        </span>
                        <small className="text-muted">Click to add more</small>
                      </div>
                    ) : (
                      <div className="d-flex flex-column py-2">
                        <span className="fw-medium fs-13">Click to attach files</span>
                        <small className="text-muted">All files — up to 10 files, 10 MB each</small>
                      </div>
                    )}
                  </label>

                  <input
                    id="record_pmt_attach_input"
                    ref={attachFileRef}
                    type="file"
                    multiple
                    className="d-none"
                    onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
                    onChange={async (e) => {
                      const picked = Array.from(e.target.files ?? []);
                      const compressed = await compressPickedFiles(picked);
                      setAttachments((prev) => [...prev, ...compressed].slice(0, 10));
                    }}
                  />

                  {/* Attached files list */}
                  {attachments.length > 0 && (
                    <div className="mt-2 border rounded" style={{ background: "#fff" }}>
                      {attachments.map((file, idx) => {
                        const { icon, color } = getFileIcon(file);
                        return (
                          <div
                            key={idx}
                            className={`d-flex align-items-center gap-2 px-3 py-2${idx < attachments.length - 1 ? " border-bottom" : ""}`}
                            style={{ fontSize: 13 }}
                          >
                            <i className={`ti ${icon} fs-18 flex-shrink-0`} style={{ color }} />
                            <div className="flex-grow-1 overflow-hidden">
                              <div className="fw-medium text-truncate">{file.name}</div>
                              <div className="text-muted" style={{ fontSize: 11 }}>{formatFileSize(file.size)}</div>
                            </div>
                            <button
                              type="button"
                              className="btn btn-sm btn-link text-danger text-decoration-none ms-auto p-0 flex-shrink-0"
                              onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                            >
                              <i className="ti ti-x fs-16" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ── Additional Fields ──────────────────────────────────── */}
                <div className="border-top pt-4 mb-4">
                  <p className="form-label fw-medium fs-14 mb-3">Additional Fields</p>
                  <CustomFieldsPanel ref={cfPanelRef} module="payments" />
                </div>

              </div>
            </div>
          )}
        </div>

        {/* ══ Sticky Save / Cancel bar ════════════════════════════════════ */}
        {!loading && invoice && (
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
              ) : "Save"}
            </button>
            <button
              type="button"
              className="btn btn-outline-light"
              onClick={() => navigate(-1)}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        )}

        <Footer />
      </div>

      {/* Toast */}
      <div
        role="region"
        aria-live="polite"
        className="position-fixed top-0 start-50 translate-middle-x pt-4"
        style={{ zIndex: 9999, pointerEvents: "none" }}
      >
        <Toast
          show={toast.show}
          onClose={() => setToast((t) => ({ ...t, show: false }))}
          style={{
            pointerEvents: "auto",
            borderRadius: 12,
            boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
            border: "none",
            minWidth: 320,
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
            <span className="fs-14 fw-medium text-dark">{toast.message}</span>
          </Toast.Body>
        </Toast>
      </div>
    </>
  );
};

export default RecordPayment;
