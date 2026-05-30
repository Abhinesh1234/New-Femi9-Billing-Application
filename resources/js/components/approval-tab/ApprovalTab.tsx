import axios from "axios";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { getApprovalSettings, updateApprovalSettings } from "../../core/cache/approvalCache";
import type { ApprovalModule, ApprovalUser } from "../../core/services/approvalApi";

// ── Types ────────────────────────────────────────────────────────────────────

type ApprovalType = "no_approval" | "simple_approval" | "multi_level";

export interface ApprovalTabHandle {
  /** Performs the save and resolves when done (whether success or failure). */
  save: () => Promise<void>;
}

interface Props {
  module: ApprovalModule;
  entityLabel: string;
  onToast: (type: "success" | "danger", message: string) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

const ApprovalTab = forwardRef<ApprovalTabHandle, Props>(
  ({ module, entityLabel, onToast }, ref) => {
    const [loading, setLoading]     = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const [approvalType, setApprovalType]   = useState<ApprovalType>("no_approval");
    const [notifySubmit, setNotifySubmit]   = useState(false);
    const [notifyWho, setNotifyWho]         = useState<"non_approver" | "all" | "specific_email">("non_approver");
    const [notifyEmail, setNotifyEmail]     = useState("");
    const [notifySubmitter, setNotifySubmitter] = useState(false);
    const [selectedApprovers, setSelectedApprovers] = useState<ApprovalUser[]>([]);
    const [hierarchyLevels, setHierarchyLevels]     = useState<{ id: number; approver: ApprovalUser | null }[]>([{ id: 1, approver: null }]);

    // Users list
    const [users, setUsers]               = useState<ApprovalUser[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);

    // Approver dropdown
    const [showApproverDrop, setShowApproverDrop] = useState(false);
    const [approverSearch, setApproverSearch]     = useState("");
    const [approverDropDir, setApproverDropDir]   = useState<"down" | "up">("down");
    const approverDropRef = useRef<HTMLDivElement>(null);

    // Level dropdown
    const [openLevelDrop, setOpenLevelDrop] = useState<number | null>(null);
    const [levelSearch, setLevelSearch]     = useState("");
    const [levelDropDir, setLevelDropDir]   = useState<"down" | "up">("down");
    const levelDropRef = useRef<HTMLDivElement>(null);

    // Drag-to-reorder
    const [dragIndex, setDragIndex]       = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    // ── Close dropdowns on outside click ─────────────────────────────────────

    useEffect(() => {
      if (!showApproverDrop) return;
      const handler = (e: MouseEvent) => {
        if (approverDropRef.current && !approverDropRef.current.contains(e.target as Node)) {
          setShowApproverDrop(false);
        }
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, [showApproverDrop]);

    useEffect(() => {
      if (openLevelDrop === null) return;
      const handler = (e: MouseEvent) => {
        if (levelDropRef.current && !levelDropRef.current.contains(e.target as Node)) {
          setOpenLevelDrop(null);
        }
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, [openLevelDrop]);

    // ── Fetch users ───────────────────────────────────────────────────────────

    useEffect(() => {
      setUsersLoading(true);
      axios
        .get<{ data: ApprovalUser[] }>("/api/users")
        .then(({ data }) => setUsers(data.data ?? []))
        .catch(() => setUsers([]))
        .finally(() => setUsersLoading(false));
    }, []);

    // ── Fetch saved approval settings (cache-first) ───────────────────────────

    const loadSettings = () => {
      setLoading(true);
      setFetchError(null);
      getApprovalSettings(module)
        .then((d) => {
          setApprovalType(d.approval_type);
          setNotifySubmit(d.notify_on_submit);
          setNotifyWho(d.notify_who ?? "non_approver");
          setNotifyEmail(d.notify_email ?? "");
          setNotifySubmitter(d.notify_submitter);
          setSelectedApprovers(d.approvers);
          setHierarchyLevels(
            d.hierarchy.length > 0
              ? d.hierarchy.map((h, i) => ({ id: h.id ?? i + 1, approver: h.user }))
              : [{ id: 1, approver: null }]
          );
        })
        .catch((e: unknown) =>
          setFetchError(e instanceof Error ? e.message : "Failed to load approval settings.")
        )
        .finally(() => setLoading(false));
    };

    useEffect(() => { loadSettings(); }, [module]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Save ──────────────────────────────────────────────────────────────────

    const save = async (): Promise<void> => {
      const res = await updateApprovalSettings(module, {
        approval_type:    approvalType,
        notify_on_submit: notifySubmit,
        notify_who:       notifySubmit ? notifyWho : null,
        notify_email:     notifyWho === "specific_email" ? notifyEmail : null,
        notify_submitter: notifySubmitter,
        approver_ids:     selectedApprovers.map((u) => u.id),
        hierarchy:        hierarchyLevels.map((l) => ({ user_id: l.approver?.id ?? null })),
      });
      if (res.success) {
        onToast("success", "Approval settings saved successfully.");
      } else {
        onToast("danger", res.message ?? "Failed to save approval settings.");
      }
    };

    useImperativeHandle(ref, () => ({ save }));

    // ── Approval type card labels ─────────────────────────────────────────────

    const CARD_INFO: Record<ApprovalType, { title: string; desc: string }> = {
      no_approval:     { title: "No Approval",          desc: `Create ${entityLabel} and perform further actions without approval.` },
      simple_approval: { title: "Simple Approval",      desc: `Any user with approve permission can approve the ${entityLabel}.` },
      multi_level:     { title: "Multi-Level Approval", desc: `Set many levels of approval. The ${entityLabel} will be approved only when all the approvers approve.` },
    };

    // ── Render ────────────────────────────────────────────────────────────────

    if (loading) {
      return (
        <div className="d-flex align-items-center gap-2 py-4 text-muted">
          <div className="spinner-border spinner-border-sm text-primary" role="status" />
          <span>Loading approval settings…</span>
        </div>
      );
    }

    if (fetchError) {
      return (
        <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-0">
          <i className="ti ti-alert-circle fs-16 flex-shrink-0" />
          <span className="flex-grow-1">{fetchError}</span>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger ms-auto"
            onClick={loadSettings}
          >
            Retry
          </button>
        </div>
      );
    }

    return (
      <>
        {/* Approval Type cards */}
        <div className="border-bottom pb-4 mb-4">
          <h6 className="fw-semibold mb-3" style={{ fontSize: 15 }}>Approval Type</h6>
          <div className="row g-3">
            {(["no_approval", "simple_approval", "multi_level"] as ApprovalType[]).map((type) => {
              const info = CARD_INFO[type];
              const isSelected = approvalType === type;
              return (
                <div key={type} className="col-12 col-sm-4">
                  <div
                    onClick={() => setApprovalType(type)}
                    style={{
                      height: "100%",
                      border: `2px solid ${isSelected ? "var(--bs-danger, #dc3545)" : "#dee2e6"}`,
                      borderRadius: 8,
                      padding: "12px 16px",
                      cursor: "pointer",
                      background: isSelected ? "rgba(220,53,69,0.04)" : "#fff",
                      transition: "all .15s",
                    }}
                  >
                    <div className="d-flex align-items-start gap-2">
                      <span
                        className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                        style={{
                          width: 20, height: 20, marginTop: 2,
                          background: isSelected ? "var(--bs-danger, #dc3545)" : "#dee2e6",
                          transition: "background .15s",
                        }}
                      >
                        <i className="ti ti-check text-white" style={{ fontSize: 11 }} />
                      </span>
                      <div>
                        <div className="fw-semibold fs-14" style={{ color: isSelected ? "var(--bs-danger, #dc3545)" : "#495057" }}>
                          {info.title}
                        </div>
                        <div className="text-muted fs-12 mt-1">{info.desc}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Simple Approval: Approvers */}
        {approvalType === "simple_approval" && (
          <div className="border-bottom pb-4 mb-4">
            <h6 className="fw-semibold mb-3" style={{ fontSize: 15 }}>Approvers</h6>

            {selectedApprovers.map((user) => (
              <div
                key={user.id}
                className="d-flex align-items-center gap-3 py-2 px-3 rounded border mb-2"
                style={{ maxWidth: 420, background: "#f8f9fa" }}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="rounded-circle flex-shrink-0"
                    style={{ width: 38, height: 38, objectFit: "cover" }}
                  />
                ) : (
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                    style={{ width: 38, height: 38, fontSize: 14, fontWeight: 600, background: "#e9ecef", color: "#495057" }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div className="fw-medium" style={{ fontSize: 14 }}>{user.name}</div>
                  <div className="text-muted" style={{ fontSize: 12.5 }}>{user.email}</div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  style={{ fontSize: 10 }}
                  onClick={() => setSelectedApprovers((prev) => prev.filter((a) => a.id !== user.id))}
                />
              </div>
            ))}

            {/* Add Approver dropdown */}
            <div
              className="position-relative mt-1"
              ref={approverDropRef}
              style={{ maxWidth: 420, ...(showApproverDrop ? { zIndex: 10 } : {}) }}
            >
              <button
                type="button"
                className="btn btn-light border d-flex align-items-center gap-2"
                style={{ fontSize: 13.5 }}
                onClick={() => {
                  if (!showApproverDrop && approverDropRef.current) {
                    const rect = approverDropRef.current.getBoundingClientRect();
                    setApproverDropDir(window.innerHeight - rect.bottom < 280 ? "up" : "down");
                  }
                  setShowApproverDrop((v) => !v);
                  setApproverSearch("");
                }}
              >
                <i className="ti ti-plus fs-14" />
                Add Approver
                <i className={`ti ti-chevron-${showApproverDrop ? "up" : "down"} fs-13`} />
              </button>

              {showApproverDrop && (
                <div
                  className="position-absolute bg-white border rounded shadow"
                  style={{
                    ...(approverDropDir === "up" ? { bottom: "calc(100% + 2px)" } : { top: "calc(100% + 2px)" }),
                    left: 0, right: 0, zIndex: 1050,
                  }}
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
                        placeholder="Search users"
                        value={approverSearch}
                        onChange={(e) => setApproverSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <div style={{ maxHeight: 240, overflowY: "auto" }}>
                    {usersLoading ? (
                      <div className="d-flex align-items-center gap-2 px-3 py-3 text-muted">
                        <div className="spinner-border spinner-border-sm" role="status" />
                        <span style={{ fontSize: 13 }}>Loading users…</span>
                      </div>
                    ) : (
                      users
                        .filter(
                          (u) =>
                            u.name.toLowerCase().includes(approverSearch.toLowerCase()) ||
                            u.email.toLowerCase().includes(approverSearch.toLowerCase())
                        )
                        .map((user) => {
                          const isSel = selectedApprovers.some((a) => a.id === user.id);
                          return (
                            <div
                              key={user.id}
                              className={`input-format-option px-3 py-2 ${isSel ? "is-selected" : ""}`}
                              onClick={() =>
                                setSelectedApprovers((prev) =>
                                  isSel ? prev.filter((a) => a.id !== user.id) : [...prev, user]
                                )
                              }
                            >
                              <div className="d-flex align-items-center gap-2">
                                {user.avatar ? (
                                  <img
                                    src={user.avatar}
                                    className="rounded-circle flex-shrink-0"
                                    style={{ width: 28, height: 28, objectFit: "cover" }}
                                  />
                                ) : (
                                  <div
                                    className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                                    style={{
                                      width: 28, height: 28, fontSize: 12, fontWeight: 600,
                                      background: isSel ? "rgba(255,255,255,0.25)" : "#e9ecef",
                                      color: isSel ? "#fff" : "#495057",
                                    }}
                                  >
                                    {user.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <div className="input-format-option-label fw-medium" style={{ fontSize: 13.5 }}>{user.name}</div>
                                  <div className="input-format-option-desc" style={{ fontSize: 12 }}>{user.email}</div>
                                </div>
                                {isSel && <i className="ti ti-check ms-auto" style={{ fontSize: 13 }} />}
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Multi-Level: Hierarchy */}
        {approvalType === "multi_level" && (
          <div className="border-bottom pb-4 mb-4">
            <p className="text-muted fw-semibold mb-2" style={{ fontSize: 11, letterSpacing: "0.07em" }}>
              SET THE APPROVAL HIERARCHY
            </p>
            <div className="border" style={{ maxWidth: 640, borderRadius: 8 }}>
              {/* Header */}
              <div className="row g-0 border-bottom" style={{ background: "#f8f9fa", borderRadius: "7px 7px 0 0" }}>
                <div className="col-5 px-3 py-2 text-muted fw-semibold" style={{ fontSize: 12, letterSpacing: "0.05em", borderRadius: "7px 0 0 0" }}>
                  PRIORITY
                </div>
                <div className="col-7 px-3 py-2 text-muted fw-semibold border-start" style={{ fontSize: 12, letterSpacing: "0.05em", borderRadius: "0 7px 0 0" }}>
                  APPROVER NAME
                </div>
              </div>

              {/* Level rows */}
              {hierarchyLevels.map((level, idx) => {
                const isOpen = openLevelDrop === level.id;
                const filtered = users.filter(
                  (u) =>
                    u.name.toLowerCase().includes(levelSearch.toLowerCase()) ||
                    u.email.toLowerCase().includes(levelSearch.toLowerCase())
                );
                const isDragging  = dragIndex === idx;
                const isDragOver  = dragOverIndex === idx && dragIndex !== null && dragIndex !== idx;
                return (
                  <div
                    key={level.id}
                    className="row g-0 border-bottom align-items-center"
                    draggable
                    onDragStart={() => {
                      setDragIndex(idx);
                      setOpenLevelDrop(null);
                    }}
                    onDragOver={(e) => { e.preventDefault(); setDragOverIndex(idx); }}
                    onDrop={() => {
                      if (dragIndex === null || dragIndex === idx) return;
                      setHierarchyLevels((prev) => {
                        const next = [...prev];
                        const [moved] = next.splice(dragIndex, 1);
                        next.splice(idx, 0, moved);
                        return next;
                      });
                      setDragIndex(null);
                      setDragOverIndex(null);
                    }}
                    onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
                    style={{
                      opacity:    isDragging  ? 0.4 : 1,
                      background: isDragOver  ? "#f0f4ff" : undefined,
                      transition: "background 0.1s",
                    }}
                  >
                    <div className="col-5 px-3 py-2 d-flex align-items-center gap-2">
                      <i className="ti ti-grip-vertical text-muted" style={{ fontSize: 14, cursor: "grab" }} />
                      <span style={{ fontSize: 14 }}>Level {idx + 1} : Approver</span>
                    </div>
                    <div className="col-7 px-2 py-2 border-start">
                      <div className="position-relative" ref={isOpen ? levelDropRef : null} style={isOpen ? { zIndex: 10 } : undefined}>
                        <button
                          type="button"
                          className="btn btn-light border d-flex align-items-center gap-2 w-100"
                          style={{ fontSize: 13, justifyContent: "space-between" }}
                          onClick={(e) => {
                            if (!isOpen) {
                              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                              setLevelDropDir(window.innerHeight - rect.bottom < 280 ? "up" : "down");
                            }
                            setOpenLevelDrop(isOpen ? null : level.id);
                            setLevelSearch("");
                          }}
                        >
                          {level.approver ? (
                            <span className="d-flex align-items-center gap-2">
                              <div
                                className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                                style={{ width: 22, height: 22, fontSize: 11, fontWeight: 600, background: "#e9ecef", color: "#495057" }}
                              >
                                {level.approver.name.charAt(0).toUpperCase()}
                              </div>
                              {level.approver.name}
                            </span>
                          ) : (
                            <span className="text-muted">Select approver</span>
                          )}
                          <i className={`ti ti-chevron-${isOpen ? "up" : "down"} fs-13`} />
                        </button>

                        {isOpen && (
                          <div
                            className="position-absolute bg-white border rounded shadow"
                            style={{
                            ...(levelDropDir === "up" ? { bottom: "calc(100% + 2px)" } : { top: "calc(100% + 2px)" }),
                            left: 0, right: 0, zIndex: 1050,
                          }}
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
                                  placeholder="Search users"
                                  value={levelSearch}
                                  onChange={(e) => setLevelSearch(e.target.value)}
                                />
                              </div>
                            </div>
                            <div style={{ maxHeight: 200, overflowY: "auto" }}>
                              <div
                                className="input-format-option px-3 py-2"
                                onClick={() => {
                                  setHierarchyLevels((prev) =>
                                    prev.map((l) => (l.id === level.id ? { ...l, approver: null } : l))
                                  );
                                  setOpenLevelDrop(null);
                                }}
                              >
                                <span className="text-muted" style={{ fontSize: 13 }}>— None —</span>
                              </div>
                              {filtered.map((user) => (
                                <div
                                  key={user.id}
                                  className={`input-format-option px-3 py-2 ${level.approver?.id === user.id ? "is-selected" : ""}`}
                                  onClick={() => {
                                    setHierarchyLevels((prev) =>
                                      prev.map((l) => (l.id === level.id ? { ...l, approver: user } : l))
                                    );
                                    setOpenLevelDrop(null);
                                  }}
                                >
                                  <div className="d-flex align-items-center gap-2">
                                    {user.avatar ? (
                                      <img src={user.avatar} className="rounded-circle flex-shrink-0" style={{ width: 24, height: 24 }} />
                                    ) : (
                                      <div
                                        className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                                        style={{ width: 24, height: 24, fontSize: 11, fontWeight: 600, background: "#e9ecef", color: "#495057" }}
                                      >
                                        {user.name.charAt(0).toUpperCase()}
                                      </div>
                                    )}
                                    <div>
                                      <div className="input-format-option-label fw-medium" style={{ fontSize: 13 }}>{user.name}</div>
                                      <div className="input-format-option-desc" style={{ fontSize: 11.5 }}>{user.email}</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add / Remove Level */}
              <div className="px-3 py-2 d-flex align-items-center gap-2" style={{ borderRadius: "0 0 7px 7px" }}>
                <button
                  type="button"
                  className="btn btn-sm btn-light border"
                  style={{ fontSize: 13 }}
                  onClick={() =>
                    setHierarchyLevels((prev) => [...prev, { id: Date.now(), approver: null }])
                  }
                >
                  <i className="ti ti-plus me-1" />
                  Add New Level
                </button>
                {hierarchyLevels.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-sm btn-light border text-danger"
                    style={{ fontSize: 13 }}
                    onClick={() => setHierarchyLevels((prev) => prev.slice(0, -1))}
                  >
                    <i className="ti ti-trash me-1" />
                    Remove Last
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Notification Preferences */}
        {approvalType !== "no_approval" && (
          <div className="border-bottom pb-4 mb-4">
            <h6 className="fw-semibold mb-3" style={{ fontSize: 15 }}>Notification Preferences</h6>

            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id={`${module}_notify_submit`}
                checked={notifySubmit}
                onChange={(e) => setNotifySubmit(e.target.checked)}
              />
              <label className="form-check-label" htmlFor={`${module}_notify_submit`} style={{ fontSize: 14 }}>
                Send email and in-app notifications when transactions are submitted for approval
              </label>
            </div>

            {notifySubmit && (
              <div className="ms-4 mb-3 ps-3" style={{ borderLeft: "2px solid #e9ecef" }}>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="radio"
                    name={`${module}_notify_who`}
                    id={`${module}_notify_non_approver`}
                    checked={notifyWho === "non_approver"}
                    onChange={() => setNotifyWho("non_approver")}
                  />
                  <label className="form-check-label" htmlFor={`${module}_notify_non_approver`} style={{ fontSize: 14 }}>
                    Notify all approvers when a non-approver submits a transaction
                  </label>
                </div>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="radio"
                    name={`${module}_notify_who`}
                    id={`${module}_notify_all`}
                    checked={notifyWho === "all"}
                    onChange={() => setNotifyWho("all")}
                  />
                  <label className="form-check-label" htmlFor={`${module}_notify_all`} style={{ fontSize: 14 }}>
                    Notify all approvers when an approver/non-approver submits a transaction
                  </label>
                </div>
                <div className="form-check mb-0">
                  <input
                    className="form-check-input"
                    type="radio"
                    name={`${module}_notify_who`}
                    id={`${module}_notify_specific`}
                    checked={notifyWho === "specific_email"}
                    onChange={() => setNotifyWho("specific_email")}
                  />
                  <label className="form-check-label" htmlFor={`${module}_notify_specific`} style={{ fontSize: 14 }}>
                    Notify a specific email address
                  </label>
                </div>
                {notifyWho === "specific_email" && (
                  <div className="ms-4 mt-2">
                    <input
                      type="email"
                      className="form-control"
                      placeholder="abc@example.com"
                      value={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.value)}
                      style={{ maxWidth: 300, fontSize: 14 }}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="form-check mb-0">
              <input
                className="form-check-input"
                type="checkbox"
                id={`${module}_notify_submitter`}
                checked={notifySubmitter}
                onChange={(e) => setNotifySubmitter(e.target.checked)}
              />
              <label className="form-check-label" htmlFor={`${module}_notify_submitter`} style={{ fontSize: 14 }}>
                Notify the submitter when a transaction is approved or rejected
              </label>
            </div>
          </div>
        )}
      </>
    );
  }
);

ApprovalTab.displayName = "ApprovalTab";
export default ApprovalTab;
