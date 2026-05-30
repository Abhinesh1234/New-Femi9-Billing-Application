import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "../../../../core/redux/loaderSlice";
import { useNavigate, useParams } from "react-router";
import { Toast } from "react-bootstrap";
import dayjs from "dayjs";
import Footer from "../../../../components/footer/footer";
import PageHeader from "../../../../components/page-header/pageHeader";
import CommonSelect from "../../../../components/common-select/commonSelect";
import CommonDatePicker from "../../../../components/common-datePicker/commonDatePicker";
import { getPaymentDetail, bustPayment } from "../../../../core/cache/paymentCache";
import { createPaymentRefund, updatePaymentRefund, fetchPaymentRefunds } from "../../../../core/services/paymentApi";
import { emitMutation } from "../../../../core/cache/mutationEvents";
import { PAYMENT_MODE_OPTIONS, ADVANCE_PAYMENT_OPTION } from "../../../../core/data/paymentModeOptions";

const pmtModeOptions = PAYMENT_MODE_OPTIONS;

const PaymentRefund = () => {
  const { id, refundId } = useParams<{ id: string; refundId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isEdit = Boolean(refundId);

  const [payment, setPayment]         = useState<any>(null);
  const [loading, setLoading]         = useState(true);
  const [alreadyRefunded, setAlreadyRefunded] = useState(0);

  const [amount, setAmount]       = useState("");
  const [refundedOn, setRefundedOn] = useState(new Date().toISOString().split("T")[0]);
  const [pmtMode, setPmtMode]     = useState("");
  const [refNum, setRefNum]       = useState("");
  const [description, setDescription]     = useState("");

  const [saving, setSaving]   = useState(false);
  const [errors, setErrors]   = useState<Record<string, string>>({});

  const [toast, setToast] = useState<{ show: boolean; type: "success" | "danger"; message: string }>({
    show: false, type: "success", message: "",
  });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (type: "success" | "danger", message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, type, message });
    toastTimerRef.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 4000);
  };
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  useEffect(() => {
    if (!id) return;
    const numId = Number(id);
    if (isNaN(numId)) return;
    setLoading(true);
    dispatch(startLoading("payment-refund"));

    if (isEdit && refundId) {
      const numRefundId = Number(refundId);
      Promise.all([
        getPaymentDetail(numId),
        fetchPaymentRefunds(numId),
      ]).then(([detail, refundsRes]) => {
        setPayment(detail);
        if (refundsRes.success) {
          const existing = (refundsRes as any).data?.find((r: any) => r.id === numRefundId);
          if (existing) {
            setAmount(parseFloat(existing.amount).toFixed(2));
            setRefundedOn(existing.refunded_on ? existing.refunded_on.substring(0, 10) : new Date().toISOString().split("T")[0]);
            setPmtMode(existing.payment_mode ?? "cash");
            setRefNum(existing.reference_number ?? "");
            setDescription(existing.description ?? "");
          }
        }
      }).catch(() => {}).finally(() => { setLoading(false); dispatch(stopLoading("payment-refund")); });
    } else {
      Promise.all([
        getPaymentDetail(numId),
        fetchPaymentRefunds(numId),
      ]).then(([detail, refundsRes]) => {
        setPayment(detail);
        const totalRefunded = refundsRes.success
          ? ((refundsRes as any).data ?? []).reduce((s: number, r: any) => s + parseFloat(r.amount ?? "0"), 0)
          : 0;
        setAlreadyRefunded(totalRefunded);
        const maxRefundable = Math.max(0, parseFloat(detail.amount) - totalRefunded);
        setAmount(maxRefundable.toFixed(2));
        setPmtMode(detail.payment_mode === "advance_payment" ? "advance_payment" : "cash");
      }).catch(() => {}).finally(() => { setLoading(false); dispatch(stopLoading("payment-refund")); });
    }
  }, [id, refundId, isEdit]);

  const handleRefresh = useCallback(async () => {
    if (!id) return;
    const numId = Number(id);
    if (isNaN(numId)) return;
    bustPayment(numId);
    setLoading(true);
    Promise.all([getPaymentDetail(numId), fetchPaymentRefunds(numId)])
      .then(([detail, refundsRes]) => {
        setPayment(detail);
        if (!isEdit) {
          const totalRefunded = refundsRes.success
            ? ((refundsRes as any).data ?? []).reduce((s: number, r: any) => s + parseFloat(r.amount ?? "0"), 0)
            : 0;
          setAlreadyRefunded(totalRefunded);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const clrErr = (key: string) =>
    setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    const amt = parseFloat(amount);
    const maxRefundable = isEdit
      ? parseFloat(payment?.amount ?? "0")
      : Math.max(0, parseFloat(payment?.amount ?? "0") - alreadyRefunded);
    if (isNaN(amt) || amt <= 0) errs.amount = "Enter a valid amount greater than zero.";
    else if (amt > maxRefundable + 0.005) errs.amount = `Amount cannot exceed the refundable balance of ₹${maxRefundable.toFixed(2)}.`;
    if (!refundedOn) errs.refundedOn = "Refund date is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!payment || !validate()) return;
    setSaving(true);
    try {
      const payload = {
        amount:           parseFloat(amount),
        refunded_on:      refundedOn,
        payment_mode:     pmtMode,
        reference_number: refNum.trim() || null,
        description:      description.trim() || null,
      };
      const res = isEdit && refundId
        ? await updatePaymentRefund(payment.id, Number(refundId), payload)
        : await createPaymentRefund(payment.id, payload);
      if (res.success) {
        showToast("success", isEdit ? "Refund updated successfully." : "Refund recorded successfully.");
        emitMutation("payments:mutated");
        setTimeout(() => navigate(`/payments/${id}`, { state: { activeTab: "refunds" } }), 1200);
      } else {
        showToast("danger", (res as any).message ?? (isEdit ? "Failed to update refund." : "Failed to record refund."));
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
            title={isEdit ? "Edit Refund" : "Refund"}
            showModuleTile={false}
            showExport={false}
            showClose
            onRefresh={handleRefresh}
            onClose={() => navigate(-1)}
          />

          {!payment ? (
            <div className="alert alert-danger mx-4">Payment not found.</div>
          ) : (
            <div className="card mb-0">
              <div className="card-body p-4">

                {/* ── Customer Info ── */}
                <div className="d-flex align-items-center gap-3 mb-4 pb-4 border-bottom">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center bg-light border flex-shrink-0"
                    style={{ width: 52, height: 52 }}
                  >
                    <i className="ti ti-user text-muted fs-22" />
                  </div>
                  <div>
                    <div className="text-danger fw-medium fs-13 mb-1">Customer Name</div>
                    <div className="fw-bold fs-15">{payment.customer?.display_name ?? "—"}</div>
                  </div>
                </div>

                {/* ── Total Refund Amount ── */}
                <div className="mb-4 pb-4 border-bottom">
                  <div className="row align-items-center">
                    <label className="col-sm-2 col-form-label fw-medium fs-14">Total Refund Amount</label>
                    <div className="col-sm-4">
                      <div className="input-group">
                        <span className="input-group-text bg-white fs-13">INR</span>
                        <input
                          type="number"
                          className={`form-control border-start-0${errors.amount ? " is-invalid" : ""}`}
                          placeholder="0.00"
                          min="0.01"
                          step="0.01"
                          max={isEdit
                            ? parseFloat(payment?.amount ?? "0").toFixed(2)
                            : Math.max(0, parseFloat(payment?.amount ?? "0") - alreadyRefunded).toFixed(2)}
                          value={amount}
                          onChange={e => { setAmount(e.target.value); clrErr("amount"); }}
                        />
                        {errors.amount && <div className="invalid-feedback">{errors.amount}</div>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Refund Details ── */}
                <div className="row mb-3 align-items-center">
                  <label className="col-sm-2 col-form-label text-danger fw-medium fs-14">
                    Refunded On<span> *</span>
                  </label>
                  <div className="col-sm-4">
                    <CommonDatePicker
                      value={refundedOn ? dayjs(refundedOn) : null}
                      onChange={date => { setRefundedOn(date ? date.format("YYYY-MM-DD") : ""); clrErr("refundedOn"); }}
                      format="DD/MM/YYYY"
                      placeholder="DD/MM/YYYY"
                    />
                    {errors.refundedOn && <div className="invalid-feedback d-block">{errors.refundedOn}</div>}
                  </div>
                  <label className="col-sm-2 col-form-label fw-medium fs-14 text-sm-end">Payment Mode</label>
                  <div className="col-sm-4">
                    {payment?.payment_mode === "advance_payment" ? (
                      <div>
                        <input className="form-control bg-light text-muted fst-italic" value="Advance Payment" readOnly />
                        <small className="text-muted fs-12">Advance payments can only be refunded via advance payment.</small>
                      </div>
                    ) : (
                      <CommonSelect
                        className="select"
                        options={pmtModeOptions}
                        value={pmtModeOptions.find(o => o.value === pmtMode) ?? null}
                        onChange={opt => setPmtMode(opt?.value ?? "cash")}
                      />
                    )}
                  </div>
                </div>

                <div className="row mb-3 align-items-center">
                  <label className="col-sm-2 col-form-label fw-medium fs-14">Reference #</label>
                  <div className="col-sm-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="UTR / Cheque no."
                      value={refNum}
                      onChange={e => setRefNum(e.target.value)}
                    />
                  </div>
                </div>

                <div className="row mb-3 align-items-start">
                  <label className="col-sm-2 col-form-label fw-medium fs-14">Description</label>
                  <div className="col-sm-10">
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Optional notes about this refund…"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                    />
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* ── Sticky Save / Cancel bar ── */}
        {!loading && payment && (
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
                <><span className="spinner-border spinner-border-sm me-1" role="status" />Saving…</>
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
          onClose={() => setToast(t => ({ ...t, show: false }))}
          style={{ pointerEvents: "auto", borderRadius: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.10)", border: "none", minWidth: 320, background: "#fff" }}
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

export default PaymentRefund;
