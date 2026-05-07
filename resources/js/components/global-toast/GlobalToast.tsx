import { useEffect, useRef, useState } from "react";
import { Toast } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../core/redux/store";
import { clearFlash } from "../../core/redux/flashSlice";

const GlobalToast = () => {
  const dispatch                  = useDispatch();
  const { message, type }         = useSelector((state: RootState) => state.flash);
  const [show, setShow]           = useState(false);
  const timerRef                  = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!message) return;
    setShow(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setShow(false);
      dispatch(clearFlash());
    }, 4000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [message, type]);

  if (!message || !type) return null;

  return (
    <div
      className="position-fixed top-0 start-50 translate-middle-x pt-4"
      style={{ zIndex: 9999, pointerEvents: "none" }}
    >
      <Toast
        show={show}
        onClose={() => { setShow(false); dispatch(clearFlash()); }}
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
            className={`d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 ${
              type === "success" ? "bg-success" : type === "danger" ? "bg-danger" : "bg-warning"
            }`}
            style={{ width: "36px", height: "36px" }}
          >
            <i
              className={`ti fs-16 text-white ${
                type === "success" ? "ti-check" : type === "danger" ? "ti-x" : "ti-alert-triangle"
              }`}
            />
          </span>
          <span className="fw-medium fs-14">{message}</span>
        </Toast.Body>
      </Toast>
    </div>
  );
};

export default GlobalToast;
