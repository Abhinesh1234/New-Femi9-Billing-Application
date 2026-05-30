import React from "react";

export interface ConfirmConfig {
  icon:         string;
  iconColor:    string;
  iconBg:       string;
  title:        string;
  message:      string;
  confirmLabel: string;
  confirmColor: string;
  onConfirm:    () => Promise<void>;
}

interface Props {
  config:  ConfirmConfig | null;
  onClose: () => void;
}

function ConfirmDialog({ config, onClose }: Props) {
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => { setBusy(false); }, [config]);

  if (!config) return null;

  const handleConfirm = async () => {
    setBusy(true);
    try { await config.onConfirm(); } finally { setBusy(false); }
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      style={{
        position: "fixed", inset: 0, zIndex: 1060,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(15,23,42,0.45)", backdropFilter: "blur(2px)",
      }}
      onClick={e => { if (e.target === e.currentTarget && !busy) onClose(); }}
    >
      <div
        style={{
          background: "#fff", borderRadius: 14, padding: "32px 28px 24px",
          width: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 0,
        }}
      >
        <div style={{
          width: 56, height: 56, borderRadius: "50%", background: config.iconBg,
          display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
        }}>
          <i className={`ti ${config.icon}`} style={{ fontSize: 24, color: config.iconColor }} />
        </div>
        <p id="confirm-dialog-title" style={{ margin: "0 0 6px", fontWeight: 600, fontSize: 16, color: "#0f172a", textAlign: "center" }}>
          {config.title}
        </p>
        <p style={{ margin: "0 0 24px", fontSize: 13.5, color: "#64748b", textAlign: "center", lineHeight: 1.55 }}>
          {config.message}
        </p>
        <div style={{ display: "flex", gap: 10, width: "100%" }}>
          <button
            className="btn btn-light flex-grow-1"
            style={{ fontWeight: 500, fontSize: 14, height: 44 }}
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            className="btn flex-grow-1"
            style={{ background: config.confirmColor, color: "#fff", fontWeight: 500, fontSize: 14, border: "none", height: 44 }}
            onClick={handleConfirm}
            disabled={busy}
          >
            {busy
              ? <><span className="spinner-border spinner-border-sm me-2" style={{ width: 14, height: 14, borderWidth: 2 }} />{config.confirmLabel}…</>
              : config.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
