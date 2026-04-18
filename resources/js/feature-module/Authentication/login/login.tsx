import { useState, FormEvent } from "react";
import { Navigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import ImageWithBasePath from "../../../components/imageWithBasePath";
import { all_routes } from "../../../routes/all_routes";
import { login } from "../../../core/services/authApi";
import { setAuth } from "../../../core/redux/authSlice";
import type { RootState, AppDispatch } from "../../../core/redux/store";

const Login = () => {
  const dispatch   = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [phone,    setPhone]    = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  // Already authenticated — navigate via React Router render cycle
  // (avoids the race condition where navigate() fires before ProtectedRoute
  //  sees the updated Redux state)
  if (isAuthenticated) {
    return <Navigate to={all_routes.dealsDashboard} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone.trim()) { setError("Phone number is required."); return; }
    if (!password)     { setError("Password is required.");     return; }

    setLoading(true);
    const result = await login(phone.trim(), password);
    setLoading(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    const { token, user } = result;

    // Always persist token; session-only behaviour can be layered later
    localStorage.setItem("auth_token", token);

    // Dispatch → triggers re-render → isAuthenticated becomes true
    // → the guard above returns <Navigate> in the next render cycle
    dispatch(setAuth({ user, token }));
  };

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
                  <ImageWithBasePath
                    src="assets/img/logo.svg"
                    className="img-fluid"
                    alt="Logo"
                  />
                </div>

                <div>
                  <div className="mb-3">
                    <h3 className="mb-2">Sign In</h3>
                    <p className="mb-0">
                      Access the panel using your phone number and password.
                    </p>
                  </div>

                  {/* Error banner */}
                  {error && (
                    <div className="alert alert-danger py-2 mb-3" role="alert">
                      <i className="ti ti-alert-circle me-2" />
                      {error}
                    </div>
                  )}

                  {/* Phone */}
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
                      <span className="input-group-text">
                        <i className="ti ti-phone" />
                      </span>
                    </div>
                  </div>

                  {/* Password */}
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
                        className={`ti input-group-text toggle-password ${
                          showPass ? "ti-eye" : "ti-eye-off"
                        }`}
                        style={{ cursor: "pointer" }}
                        onClick={() => setShowPass((v) => !v)}
                      />
                    </div>
                  </div>

                  {/* Remember Me */}
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

                  {/* Submit */}
                  <div className="mb-3">
                    <button
                      type="submit"
                      className="btn btn-primary w-100"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          />
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
            </div>
          </div>
        </div>
        <div className="col-lg-6 account-bg-01" />
      </div>
    </div>
  );
};

export default Login;
