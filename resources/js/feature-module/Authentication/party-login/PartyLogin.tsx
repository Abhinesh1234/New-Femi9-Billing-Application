import { useState, FormEvent } from "react";
import { Navigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import ImageWithBasePath from "../../../components/imageWithBasePath";
import { all_routes } from "../../../routes/all_routes";
import { partyLogin, partySelect } from "../../../core/services/partyAuthApi";
import type { PartyCategoryOption } from "../../../core/services/partyAuthApi";
import { setPartyAuth } from "../../../core/redux/partyAuthSlice";
import type { RootState, AppDispatch } from "../../../core/redux/store";

const PartyLogin = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.partyAuth);

  const [loginVal,  setLoginVal]  = useState("");
  const [password,  setPassword]  = useState("");
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  // Category picker state (party_pending flow)
  const [pendingCategories, setPendingCategories] = useState<PartyCategoryOption[] | null>(null);
  const [selectedId,        setSelectedId]        = useState<number | null>(null);
  const [selectLoading,     setSelectLoading]     = useState(false);
  const [selectError,       setSelectError]       = useState<string | null>(null);

  if (isAuthenticated) {
    return <Navigate to={all_routes.partyDashboard} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!loginVal.trim()) { setError("Mobile number or email is required."); return; }
    if (!password)        { setError("Password is required.");               return; }

    setLoading(true);
    const result = await partyLogin(loginVal.trim(), password);
    setLoading(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    if (result.user_type === "party_pending") {
      // Multiple categories found — show picker
      setPendingCategories(result.categories);
      // Default selection: last used (first in sorted list)
      setSelectedId(result.categories[0]?.party_user_id ?? null);
      return;
    }

    // Single match — direct login
    const { token, user } = result;
    localStorage.setItem("party_auth_token", token);
    dispatch(setPartyAuth({ user, token }));
  };

  const handleSelectCategory = async () => {
    if (!selectedId) return;
    setSelectError(null);
    setSelectLoading(true);
    const result = await partySelect(loginVal.trim(), password, selectedId);
    setSelectLoading(false);

    if (!result.success) {
      setSelectError(result.message);
      return;
    }

    const { token, user } = result;
    localStorage.setItem("party_auth_token", token);
    dispatch(setPartyAuth({ user, token }));
  };

  const handleBackToLogin = () => {
    setPendingCategories(null);
    setSelectedId(null);
    setSelectError(null);
    setPassword("");
  };

  return (
    <div className="overflow-hidden p-3 acc-vh">
      <div className="row vh-100 w-100 g-0">
        <div className="col-lg-6 vh-100 overflow-y-auto overflow-x-hidden">
          <div className="row">
            <div className="col-md-10 mx-auto">

              {/* ── Category picker (party_pending flow) ── */}
              {pendingCategories ? (
                <div className="vh-100 d-flex justify-content-between flex-column p-4 pb-0">
                  <div className="text-center mb-4 auth-logo">
                    <ImageWithBasePath
                      src="assets/img/logo.svg"
                      className="img-fluid"
                      alt="Logo"
                    />
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
                        <i className="ti ti-alert-circle me-2" />
                        {selectError}
                      </div>
                    )}

                    <div className="d-flex flex-column gap-2 mb-4">
                      {pendingCategories.map((cat) => {
                        const isSelected = selectedId === cat.party_user_id;
                        return (
                          <button
                            key={cat.party_user_id}
                            type="button"
                            onClick={() => setSelectedId(cat.party_user_id)}
                            className="text-start w-100"
                            style={{
                              border: `2px solid ${isSelected ? "#E41F07" : "#dee2e6"}`,
                              borderRadius: 8,
                              padding: "14px 16px",
                              background: isSelected ? "#fff8f7" : "#fff",
                              cursor: "pointer",
                              transition: "border-color 0.15s, background 0.15s",
                            }}
                          >
                            <div className="d-flex align-items-center gap-3">
                              <div
                                style={{
                                  width: 36, height: 36, borderRadius: "50%",
                                  background: isSelected ? "#E41F07" : "#f1f3f5",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                <i
                                  className="ti ti-building-store"
                                  style={{ fontSize: 18, color: isSelected ? "#fff" : "#6c757d" }}
                                />
                              </div>
                              <div>
                                <div className="fw-semibold fs-14" style={{ color: isSelected ? "#E41F07" : "#212529" }}>
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
                              {isSelected && (
                                <i className="ti ti-circle-check-filled ms-auto" style={{ color: "#E41F07", fontSize: 20 }} />
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
                      {selectLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                          Signing in…
                        </>
                      ) : (
                        "Continue"
                      )}
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-secondary w-100"
                      onClick={handleBackToLogin}
                      disabled={selectLoading}
                    >
                      Back
                    </button>
                  </div>

                  <div className="text-center pb-4">
                    <p className="text-dark mb-0">Copyright © 2025 - Femi9</p>
                  </div>
                </div>
              ) : (

              /* ── Login form ── */
              <form
                className="vh-100 d-flex justify-content-between flex-column p-4 pb-0"
                onSubmit={handleSubmit}
                noValidate
              >
                <div className="text-center mb-4 auth-logo">
                  <ImageWithBasePath
                    src="assets/img/logo.svg"
                    className="img-fluid"
                    alt="Logo"
                  />
                </div>

                <div>
                  <div className="mb-3">
                    <h3 className="mb-2">Party Portal Sign In</h3>
                    <p className="mb-0">
                      Sign in using your registered mobile number or email.
                    </p>
                  </div>

                  {error && (
                    <div className="alert alert-danger py-2 mb-3" role="alert">
                      <i className="ti ti-alert-circle me-2" />
                      {error}
                    </div>
                  )}

                  {/* Mobile / Email */}
                  <div className="mb-3">
                    <label className="form-label">Mobile Number / Email</label>
                    <div className="input-group input-group-flat">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter your mobile or email"
                        value={loginVal}
                        onChange={(e) => setLoginVal(e.target.value)}
                        autoComplete="username"
                        autoFocus
                      />
                      <span className="input-group-text">
                        <i className="ti ti-user" />
                      </span>
                    </div>
                  </div>

                  {/* Password */}
                  <div className="mb-4">
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

                  {/* Submit */}
                  <div className="mb-3">
                    <button
                      type="submit"
                      className="btn btn-primary w-100"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                          Signing in…
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </button>
                  </div>
                </div>

                <div className="text-center pb-4">
                  <p className="text-dark mb-0">Copyright © 2025 - Femi9</p>
                </div>
              </form>
              )}

            </div>
          </div>
        </div>
        <div className="col-lg-6 account-bg-01" />
      </div>
    </div>
  );
};

export default PartyLogin;
