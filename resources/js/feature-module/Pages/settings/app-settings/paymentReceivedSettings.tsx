import { useCallback, useRef, useState } from "react";
import { Toast } from "react-bootstrap";
import Footer from "../../../../components/footer/footer";
import PageHeader from "../../../../components/page-header/pageHeader";
import FieldCustomizationTab from "../../../../components/field-customization/FieldCustomizationTab";
import { all_routes } from "../../../../routes/all_routes";

const PaymentReceivedSettings = () => {
  const [cfRefreshKey, setCfRefreshKey] = useState(0);
  const cfRefreshResolveRef = useRef<(() => void) | null>(null);

  const [toast, setToast] = useState<{ show: boolean; type: "success" | "danger" | "warning"; message: string }>({
    show: false, type: "success", message: "",
  });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (type: "success" | "danger" | "warning", message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, type, message });
    toastTimerRef.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 4000);
  };

  const handleRefresh = useCallback((): Promise<void> => {
    return new Promise<void>((resolve) => {
      cfRefreshResolveRef.current = resolve;
      setCfRefreshKey((k) => k + 1);
    });
  }, []);

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <PageHeader
            title="Payments Received Settings"
            badgeCount={false}
            showModuleTile={false}
            showExport={false}
            onRefresh={handleRefresh}
          />

          <div className="row">
            <div className="col-12">
              <div className="card mb-0">
                <div className="card-body p-0">

                  {/* Tab header */}
                  <div className="px-4 pt-3 pb-3">
                    <div className="d-inline-flex rounded" style={{ background: "#f1f3f5", padding: 4, gap: 2 }}>
                      <button
                        type="button"
                        style={{
                          padding: "9px 20px", borderRadius: 6, border: "none",
                          background: "#fff",
                          color: "#e03131",
                          fontWeight: 600,
                          fontSize: 14,
                          boxShadow: "0 1px 4px rgba(0,0,0,0.10)",
                          transition: "all 0.15s", cursor: "pointer", whiteSpace: "nowrap",
                        }}
                      >
                        Field Customization
                      </button>
                    </div>
                  </div>

                  <FieldCustomizationTab
                    module="payments"
                    addRoute={all_routes.paymentCustomField + "?module=payments"}
                    editRoute={all_routes.paymentCustomFieldEdit}
                    refreshKey={cfRefreshKey}
                    onRefreshDone={() => { cfRefreshResolveRef.current?.(); cfRefreshResolveRef.current = null; }}
                    onToast={showToast}
                  />

                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>

      <div role="region" aria-live="polite" className="position-fixed top-0 start-50 translate-middle-x pt-4" style={{ zIndex: 9999, pointerEvents: "none" }}>
        <Toast
          show={toast.show}
          onClose={() => setToast((t) => ({ ...t, show: false }))}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          style={{ pointerEvents: "auto", borderRadius: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.10)", border: "none", minWidth: 320, background: "#fff" }}
        >
          <Toast.Body className="d-flex align-items-center gap-3 px-4 py-3">
            <span
              className={`d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 ${
                toast.type === "success" ? "bg-success" : toast.type === "danger" ? "bg-danger" : "bg-warning"
              }`}
              style={{ width: 36, height: 36 }}
            >
              <i className={`ti fs-16 text-white ${toast.type === "success" ? "ti-check" : toast.type === "danger" ? "ti-x" : "ti-alert-triangle"}`} />
            </span>
            <span className="fw-medium fs-14">{toast.message}</span>
          </Toast.Body>
        </Toast>
      </div>
    </>
  );
};

export default PaymentReceivedSettings;
