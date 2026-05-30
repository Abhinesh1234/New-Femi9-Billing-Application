import { useState, FormEvent } from "react";
import { Navigate, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import ImageWithBasePath from "../../../components/imageWithBasePath";
import { all_routes } from "../../../routes/all_routes";
import { login } from "../../../core/services/authApi";
import { partyLogin, partySelect } from "../../../core/services/partyAuthApi";
import type { PartyCategoryOption } from "../../../core/services/partyAuthApi";
import { setAuth } from "../../../core/redux/authSlice";
import type { AuthUser } from "../../../core/redux/authSlice";
import type { RootState, AppDispatch } from "../../../core/redux/store";

/** Stores token + user type and dispatches setAuth for either admin or party. */
function saveSession(
  dispatch: AppDispatch,
  token: string,
  user: AuthUser,
  userType: "admin" | "party"
) {
  localStorage.setItem("auth_token", token);
  localStorage.setItem("auth_user_type", userType);
  dispatch(setAuth({ user, token }));
}

const Login = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [phone,    setPhone]    = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  // Category picker (party_pending flow)
  const [pendingCategories, setPendingCategories] = useState<PartyCategoryOption[] | null>(null);
  const [selectedId,        setSelectedId]        = useState<number | null>(null);
  const [selectLoading,     setSelectLoading]     = useState(false);
  const [selectError,       setSelectError]       = useState<string | null>(null);

  if (isAuthenticated) return <Navigate to={all_routes.dealsDashboard} replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone.trim()) { setError("Phone number is required."); return; }
    if (!password)     { setError("Password is required.");     return; }

    setLoading(true);

    // ── 1. Try admin login ────────────────────────────────────────────────
    const adminResult = await login(phone.trim(), password);
    if (adminResult.success) {
      saveSession(dispatch, adminResult.token, adminResult.user, "admin");
      setLoading(false);
      return;
    }

    // ── 2. Try party login (skip if rate-limited) ─────────────────────────
    const isLockout = (adminResult.message ?? "").toLowerCase().includes("too many");
    if (!isLockout) {
      const partyResult = await partyLogin(phone.trim(), password);

      if (partyResult.success) {
        if (partyResult.user_type === "party_pending") {
          setLoading(false);
          setPendingCategories(partyResult.categories);
          setSelectedId(partyResult.categories[0]?.party_user_id ?? null);
          return;
        }
        // Direct party login success
        saveSession(dispatch, partyResult.token, partyResult.user as unknown as AuthUser, "party");
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    setError(adminResult.message);
  };

  const handleSelectCategory = async () => {
    if (!selectedId) return;
    setSelectError(null);
    setSelectLoading(true);
    const result = await partySelect(phone.trim(), password, selectedId);
    setSelectLoading(false);

    if (!result.success) { setSelectError(result.message); return; }

    saveSession(dispatch, result.token, result.user as unknown as AuthUser, "party");
  };

  const handleBackToLogin = () => {
    setPendingCategories(null);
    setSelectedId(null);
    setSelectError(null);
    setPassword("");
  };

  // ── Category picker ─────────────────────────────────────────────────────────
  if (pendingCategories) {
    return (
      <div className="overflow-hidden p-3 acc-vh">
        <div className="row vh-100 w-100 g-0">
          <div className="col-lg-6 vh-100 overflow-y-auto overflow-x-hidden">
            <div className="row">
              <div className="col-md-10 mx-auto">
                <div className="vh-100 d-flex justify-content-between flex-column p-4 pb-0">
                  <div className="text-center mb-4 auth-logo">
                    <ImageWithBasePath src="assets/img/logo.svg" className="img-fluid" alt="Logo" />
                  </div>

                  <div>
                    <div className="mb-4">
                      <h3 className="mb-2">Select Account</h3>
                      <p className="mb-0 text-muted">
                        Your login is linked to multiple accounts. Select the one you want to access.
                      </p>
                    </div>

                    {selectError && (
                      <div className="alert alert-danger py-2 mb-3" role="alert">
                        <i className="ti ti-alert-circle me-2" />{selectError}
                      </div>
                    )}

                    <div className="d-flex flex-column gap-2 mb-4">
                      {pendingCategories.map((cat) => {
                        const isSel = selectedId === cat.party_user_id;
                        return (
                          <button
                            key={cat.party_user_id}
                            type="button"
                            onClick={() => setSelectedId(cat.party_user_id)}
                            className="text-start w-100"
                            style={{
                              border: `2px solid ${isSel ? "#E41F07" : "#dee2e6"}`,
                              borderRadius: 8, padding: "14px 16px",
                              background: isSel ? "#fff8f7" : "#fff",
                              cursor: "pointer", transition: "border-color 0.15s, background 0.15s",
                            }}
                          >
                            <div className="d-flex align-items-center gap-3">
                              <div style={{
                                width: 36, height: 36, borderRadius: "50%",
                                background: isSel ? "#E41F07" : "#f1f3f5",
                                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                              }}>
                                <i className="ti ti-building-store"
                                  style={{ fontSize: 18, color: isSel ? "#fff" : "#6c757d" }} />
                              </div>
                              <div>
                                <div className="fw-semibold fs-14"
                                  style={{ color: isSel ? "#E41F07" : "#212529" }}>
                                  {cat.party_name ?? "—"}
                                </div>
                                {cat.category_name && (
                                  <div className="fs-13 text-muted">{cat.category_name}</div>
                                )}
                                {cat.last_login_at && (
                                  <div className="fs-12 text-muted mt-1">
                                    Last used: {new Date(cat.last_login_at).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                              {isSel && (
                                <i className="ti ti-circle-check-filled ms-auto"
                                  style={{ color: "#E41F07", fontSize: 20 }} />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary w-100 mb-2"
                      disabled={!selectedId || selectLoading}
                      onClick={handleSelectCategory}
                    >
                      {selectLoading
                        ? <><span className="spinner-border spinner-border-sm me-2" role="status" />Signing in…</>
                        : "Continue"
                      }
                    </button>
                    <button type="button" className="btn btn-outline-secondary w-100"
                      onClick={handleBackToLogin} disabled={selectLoading}>
                      Back
                    </button>
                  </div>

                  <div className="text-center pb-4">
                    <p className="text-dark mb-0">Copyright © 2025 - Femi9</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-6 account-bg-01" />
        </div>
      </div>
    );
  }

  // ── Login form ──────────────────────────────────────────────────────────────
  return (
    <div className="overflow-hidden p-3 acc-vh">
      <div className="row vh-100 w-100 g-0">
        <div className="col-lg-6 vh-100 overflow-y-auto overflow-x-hidden">
          <div className="row">
            <div className="col-md-10 mx-auto">
              <form
                className="vh-100 d-flex justify-content-between flex-column p-4 pb-0"
                onSubmit={handleSubmit}
                noValidate
              >
                <div className="text-center mb-4 auth-logo">
                  <ImageWithBasePath src="assets/img/logo.svg" className="img-fluid" alt="Logo" />
                </div>

                <div>
                  <div className="mb-3">
                    <h3 className="mb-2">Sign In</h3>
                    <p className="mb-0">Access the panel using your phone number and password.</p>
                  </div>

                  {error && (
                    <div className="alert alert-danger py-2 mb-3" role="alert">
                      <i className="ti ti-alert-circle me-2" />{error}
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">Phone Number</label>
                    <div className="input-group input-group-flat">
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="Enter your phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        autoComplete="username"
                        autoFocus
                      />
                      <span className="input-group-text"><i className="ti ti-phone" /></span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <div className="input-group input-group-flat pass-group">
                      <input
                        type={showPass ? "text" : "password"}
                        className="form-control pass-input"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                      />
                      <span
                        className={`ti input-group-text toggle-password ${showPass ? "ti-eye" : "ti-eye-off"}`}
                        style={{ cursor: "pointer" }}
                        onClick={() => setShowPass((v) => !v)}
                      />
                    </div>
                  </div>

                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="form-check form-check-md d-flex align-items-center">
                      <input
                        className="form-check-input mt-0"
                        type="checkbox"
                        id="remember-me"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                      />
                      <label className="form-check-label text-dark ms-1" htmlFor="remember-me">
                        Remember Me
                      </label>
                    </div>
                  </div>

                  <div className="mb-3">
                    <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                      {loading ? (
                        <><span className="spinner-border spinner-border-sm me-2" role="status" />Signing in…</>
                      ) : "Sign In"}
                    </button>
                  </div>
                </div>

                <div className="text-center pb-4">
                  <p className="text-dark mb-0">Copyright © 2025 - Femi9</p>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="col-lg-6 account-bg-01" />
      </div>
    </div>
  );
};

export default Login;
