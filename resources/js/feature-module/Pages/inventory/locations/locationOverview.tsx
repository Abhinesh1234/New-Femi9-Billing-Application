import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Toast } from "react-bootstrap";
import Footer from "../../../../components/footer/footer";
import {
  fetchLocation,
  destroyLocation,
} from "../../../../core/services/locationApi";
import { all_routes } from "../../../../routes/all_routes";

const route = all_routes;

// ── Main component ─────────────────────────────────────────────────────────────
const LocationOverview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [location, setLocation] = useState<Record<string, any> | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  // ── Toast ──
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

  // Fetch location detail
  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const res = await fetchLocation(Number(id));
      if (res.success) {
        setLocation((res as any).data);
      } else {
        setError((res as any).message);
      }
      setLoading(false);
    })();
  }, [id]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="content d-flex align-items-center justify-content-center" style={{ minHeight: 300 }}>
          <span className="spinner-border spinner-border-sm me-2 text-primary" />
          <span className="text-muted">Loading location…</span>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Error ──
  if (error || !location) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="alert alert-danger">{error ?? "Location not found."}</div>
          <Link to={route.locations} className="btn btn-outline-light">
            <i className="ti ti-arrow-left me-1" /> Back to Locations
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="content">
        {/* ═══ Page header ════════════════════════════════════════════════════════ */}
        <div className="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
          <div>
            <h4 className="mb-1">{location.name}</h4>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0 p-0">
                <li className="breadcrumb-item"><Link to={route.dealsDashboard}>Home</Link></li>
                <li className="breadcrumb-item"><Link to={route.locations}>Locations</Link></li>
                <li className="breadcrumb-item active" aria-current="page">{location.name}</li>
              </ol>
            </nav>
          </div>
          <Link to={route.addLocation} className="btn btn-primary">
            <i className="ti ti-square-rounded-plus-filled me-1" />
            New Location
          </Link>
        </div>

        {/* ═══ Content (build here) ════════════════════════════════════════════════ */}
        <div>
        </div>
      </div>

      <Footer />

      {/* ── Toast ── */}
      <div className="position-fixed top-0 start-50 translate-middle-x pt-4" style={{ zIndex: 9999, pointerEvents: "none" }}>
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
              className={`d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 ${toast.type === "success" ? "bg-success" : "bg-danger"}`}
              style={{ width: 36, height: 36 }}
            >
              <i className={`ti fs-16 text-white ${toast.type === "success" ? "ti-check" : "ti-x"}`} />
            </span>
            <span className="fw-medium fs-14">{toast.message}</span>
          </Toast.Body>
        </Toast>
      </div>

    </div>
  );
};

export default LocationOverview;
