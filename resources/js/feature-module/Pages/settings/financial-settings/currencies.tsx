import { useState } from "react";
import { Link } from "react-router";
import { Country } from "country-state-city";
import Select from "react-select";
import type { StylesConfig } from "react-select";
import PageHeader from "../../../../components/page-header/pageHeader";
import SettingsTopbar from "../settings-topbar/settingsTopbar";
import { all_routes } from "../../../../routes/all_routes";

interface WorldCurrencyOption {
  value:  string; // ISO code e.g. "INR"
  label:  string; // "INR - Indian Rupee (₹)"
  name:   string;
  symbol: string;
}

// Built once from the bundled country-state-city package — no network, no loading state
const CURRENCY_OPTIONS: WorldCurrencyOption[] = (() => {
  const map = new Map<string, { name: string; symbol: string }>();
  for (const c of Country.getAllCountries()) {
    if (c.currency && !map.has(c.currency)) {
      map.set(c.currency, { name: c.currencyName, symbol: c.currencySymbol });
    }
  }
  return Array.from(map.entries())
    .map(([code, { name, symbol }]) => ({
      value:  code,
      label:  symbol && symbol !== code ? `${code} - ${name} (${symbol})` : `${code} - ${name}`,
      name,
      symbol: symbol ?? "",
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
})();

const selectStyles: StylesConfig<WorldCurrencyOption> = {
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? "#E41F07" : "white",
    color: state.isSelected ? "#fff" : state.isFocused ? "#E41F07" : "#707070",
    cursor: "pointer",
    "&:hover": { backgroundColor: "#E41F07", color: "#fff" },
  }),
  menu:       (base) => ({ ...base, zIndex: 9999 }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

const Currencies = () => {
  // Add modal controlled state
  const [addSelected, setAddSelected]   = useState<WorldCurrencyOption | null>(null);
  const [addRate, setAddRate]           = useState("");
  const [addCode, setAddCode]           = useState("");
  const [addSymbol, setAddSymbol]       = useState("");
  const [addIsDefault, setAddIsDefault] = useState(false);

  const handleAddSelect = (opt: WorldCurrencyOption | null) => {
    setAddSelected(opt);
    setAddCode(opt?.value ?? "");
    setAddSymbol(opt?.symbol ?? "");
  };

  const resetAddModal = () => {
    setAddSelected(null);
    setAddRate("");
    setAddCode("");
    setAddSymbol("");
    setAddIsDefault(false);
  };

  return (
    <>
      {/* ========================
			Start Page Content
		========================= */}
      <div className="page-wrapper">
        {/* Start Content */}
        <div className="content">
          {/* Page Header */}
          <PageHeader
            title="Settings"
            badgeCount={false}
            showModuleTile={false}
            showExport={false}
          />
          {/* End Page Header */}
          {/* Settings Menu */}
          <SettingsTopbar />
          {/* end card */}
          {/* /Settings Menu */}
          {/* start row */}
          <div className="row">
            <div className="col-xl-3 col-lg-12 theiaStickySidebar">
              {/* Settings Sidebar */}
              <div className="card  filemanager-left-sidebar">
                <div className="card-body">
                  <div className="settings-sidebar">
                    <h4 className="fw-bold mb-3 fs-17">Financial Settings</h4>
                    <div className="list-group list-group-flush settings-sidebar">
                      <Link
                        to={all_routes.paymentGateways}
                        className="d-block p-2 fw-medium "
                      >
                        Payment Gateways
                      </Link>
                      <Link
                        to={all_routes.bankAccount}
                        className="d-block p-2 fw-medium "
                      >
                        Bank Accounts
                      </Link>
                      <Link
                        to={all_routes.taxRates}
                        className="d-block p-2 fw-medium "
                      >
                        Tax Rates
                      </Link>
                      <Link
                        to={all_routes.currencies}
                        className="d-block p-2 fw-medium active"
                      >
                        Currencies
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              {/* /Settings Sidebar */}
            </div>
            <div className="col-xl-9 col-lg-12">
              {/* Settings Info */}
              <div className="card mb-0">
                <div className="card-body">
                  <div className="border-bottom mb-3 pb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <h4 className="fs-17 mb-0">Currencies</h4>
                    <Link
                      to="javascript:void(0)"
                      className="btn btn-primary btn-sm"
                      data-bs-toggle="modal"
                      data-bs-target="#add_currency"
                      onClick={resetAddModal}
                    >
                      <i className="ti ti-square-rounded-plus-filled me-1" />
                      Add New Currency
                    </Link>
                  </div>
                  {/* Start Table */}
                  <div className="table-responsive custom-table">
                    <table className="table table-nowrap">
                      <thead className="table-light">
                        <tr>
                          <th>Currency</th>
                          <th>Code</th>
                          <th>Symbol</th>
                          <th>Exchange Rate</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            Dollar
                            <Link
                              to="#"
                              className="badge badge-tag badge-soft-info ms-2"
                              data-bs-toggle="modal"
                              data-bs-target="#default"
                            >
                              Default
                            </Link>
                          </td>
                          <td>USD</td>
                          <td>$</td>
                          <td>01</td>
                          <td>
                            <span className="badge bg-success">Active</span>
                          </td>
                          <td>
                            <div className="dropdown table-action">
                              <Link
                                to="#"
                                className="action-icon btn btn-xs shadow btn-icon btn-outline-light "
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                <i className="ti ti-dots-vertical" />
                              </Link>
                              <div className="dropdown-menu dropdown-menu-right">
                                <Link
                                  className="dropdown-item"
                                  to="#"
                                  data-bs-toggle="modal"
                                  data-bs-target="#edit_currency"
                                >
                                  <i className="ti ti-edit text-blue me-1" />
                                  Edit
                                </Link>
                                <Link
                                  className="dropdown-item"
                                  to="#"
                                  data-bs-toggle="modal"
                                  data-bs-target="#delete_currency"
                                >
                                  <i className="ti ti-trash text-blue me-1" />
                                  Delete
                                </Link>
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>Rupee</td>
                          <td>INR</td>
                          <td>₹</td>
                          <td>86.62</td>
                          <td>
                            <span className="badge bg-success">Active</span>
                          </td>
                          <td>
                            <div className="dropdown table-action">
                              <Link
                                to="#"
                                className="action-icon btn btn-xs shadow btn-icon btn-outline-light "
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                <i className="ti ti-dots-vertical" />
                              </Link>
                              <div className="dropdown-menu dropdown-menu-right">
                                <Link
                                  className="dropdown-item"
                                  to="#"
                                  data-bs-toggle="modal"
                                  data-bs-target="#edit_currency"
                                >
                                  <i className="ti ti-edit text-blue me-1" />
                                  Edit
                                </Link>
                                <Link
                                  className="dropdown-item"
                                  to="#"
                                  data-bs-toggle="modal"
                                  data-bs-target="#delete_currency"
                                >
                                  <i className="ti ti-trash text-blue me-1" />
                                  Delete
                                </Link>
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>Pound</td>
                          <td>GBP</td>
                          <td>£</td>
                          <td>0.81</td>
                          <td>
                            <span className="badge bg-success">Active</span>
                          </td>
                          <td>
                            <div className="dropdown table-action">
                              <Link
                                to="#"
                                className="action-icon btn btn-xs shadow btn-icon btn-outline-light "
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                <i className="ti ti-dots-vertical" />
                              </Link>
                              <div className="dropdown-menu dropdown-menu-right">
                                <Link
                                  className="dropdown-item"
                                  to="#"
                                  data-bs-toggle="modal"
                                  data-bs-target="#edit_currency"
                                >
                                  <i className="ti ti-edit text-blue me-1" />
                                  Edit
                                </Link>
                                <Link
                                  className="dropdown-item"
                                  to="#"
                                  data-bs-toggle="modal"
                                  data-bs-target="#delete_currency"
                                >
                                  <i className="ti ti-trash text-blue me-1" />
                                  Delete
                                </Link>
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>Euro</td>
                          <td>EUR</td>
                          <td>€</td>
                          <td>0.96</td>
                          <td>
                            <span className="badge bg-success">Active</span>
                          </td>
                          <td>
                            <div className="dropdown table-action">
                              <Link
                                to="#"
                                className="action-icon btn btn-xs shadow btn-icon btn-outline-light "
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                <i className="ti ti-dots-vertical" />
                              </Link>
                              <div className="dropdown-menu dropdown-menu-right">
                                <Link
                                  className="dropdown-item"
                                  to="#"
                                  data-bs-toggle="modal"
                                  data-bs-target="#edit_currency"
                                >
                                  <i className="ti ti-edit text-blue me-1" />
                                  Edit
                                </Link>
                                <Link
                                  className="dropdown-item"
                                  to="#"
                                  data-bs-toggle="modal"
                                  data-bs-target="#delete_currency"
                                >
                                  <i className="ti ti-trash text-blue me-1" />
                                  Delete
                                </Link>
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>Dhirams</td>
                          <td>AED</td>
                          <td>د.إ</td>
                          <td>3.67</td>
                          <td>
                            <span className="badge bg-success">Active</span>
                          </td>
                          <td>
                            <div className="dropdown table-action">
                              <Link
                                to="#"
                                className="action-icon btn btn-xs shadow btn-icon btn-outline-light "
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                <i className="ti ti-dots-vertical" />
                              </Link>
                              <div className="dropdown-menu dropdown-menu-right">
                                <Link
                                  className="dropdown-item"
                                  to="#"
                                  data-bs-toggle="modal"
                                  data-bs-target="#edit_currency"
                                >
                                  <i className="ti ti-edit text-blue me-1" />
                                  Edit
                                </Link>
                                <Link
                                  className="dropdown-item"
                                  to="#"
                                  data-bs-toggle="modal"
                                  data-bs-target="#delete_currency"
                                >
                                  <i className="ti ti-trash text-blue me-1" />
                                  Delete
                                </Link>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  {/* End Table */}
                </div>
              </div>
              {/* /Settings Info */}
            </div>
          </div>
          {/* end row */}
        </div>
        {/* End Content */}
        {/* Start Footer */}
        <footer className="footer d-block d-md-flex justify-content-between text-md-start text-center">
          <p className="mb-md-0 mb-1">
            Copyright ©{" "}
            <Link
              to="#"
              className="link-primary text-decoration-underline"
            >
              CRMS
            </Link>
          </p>
          <div className="d-flex align-items-center gap-2 footer-links justify-content-center justify-content-md-end">
            <Link to="#">About</Link>
            <Link to="#">Terms</Link>
            <Link to="#">Contact Us</Link>
          </div>
        </footer>
        {/* End Footer */}
      </div>
      {/* ========================
			End Page Content
		========================= */}

      {/* Add Currency */}
      <div className="modal fade" id="add_currency" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add Currency</h5>
              <button
                type="button"
                className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <form>
              <div className="modal-body">

                {/* Currency select — populated from restcountries.com */}
                <div className="mb-3">
                  <label className="form-label text-danger">
                    Currency <span>*</span>
                  </label>
                  <div className="common-select">
                    <Select
                      options={CURRENCY_OPTIONS}
                      value={addSelected}
                      onChange={handleAddSelect}
                      isSearchable
                      isClearable
                      menuPortalTarget={document.body}
                      placeholder="Search currency…"
                      styles={selectStyles}
                      components={{ IndicatorSeparator: () => null }}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label text-danger">
                    Exchange Rate <span>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={addRate}
                    onChange={e => setAddRate(e.target.value)}
                  />
                </div>

                <div className="d-flex flex-lg-row flex-column align-items-center justify-content-between gap-3 mb-3">
                  <div className="w-100">
                    <label className="form-label text-danger">
                      Code <span>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={addCode}
                      onChange={e => setAddCode(e.target.value.toUpperCase())}
                    />
                  </div>
                  <div className="w-100">
                    <label className="form-label text-danger">
                      Symbol <span>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={addSymbol}
                      onChange={e => setAddSymbol(e.target.value)}
                    />
                  </div>
                </div>

                <div className="d-flex align-items-center justify-content-between">
                  <label className="form-label mb-0">Make as Default</label>
                  <div className="form-check form-switch p-0">
                    <label className="form-check-label d-flex align-items-center gap-2 w-100">
                      <input
                        className="form-check-input switchCheckDefault ms-auto"
                        type="checkbox"
                        role="switch"
                        checked={addIsDefault}
                        onChange={e => setAddIsDefault(e.target.checked)}
                      />
                    </label>
                  </div>
                </div>

              </div>
              <div className="modal-footer">
                <div className="d-flex align-items-center justify-content-end m-0">
                  <Link
                    to="#"
                    className="btn btn-sm btn-light me-2"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </Link>
                  <button type="submit" className="btn btn-sm btn-primary">
                    Create New
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Add Currency */}

      {/* Edit Currency */}
      <div className="modal fade" id="edit_currency" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Currency</h5>
              <button
                type="button"
                className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <form>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label text-danger">
                    Currency Name<span>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue="Rupee"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label text-danger">
                    Exchange Rate<span>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue="86.62"
                  />
                </div>
                <div className="d-flex flex-lg-row flex-column align-items-center justify-content-between gap-3 mb-3">
                  <div className="w-100">
                    <label className="form-label text-danger">
                      Code<span>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      defaultValue="INR"
                    />
                  </div>
                  <div className="w-100">
                    <label className="form-label text-danger">
                      Symbol<span>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      defaultValue="₹"
                    />
                  </div>
                </div>
                <div className="d-flex align-items-center justify-content-between">
                  <label className="form-label mb-0">Make as Default</label>
                  <div className="form-check form-switch p-0">
                    <label className="form-check-label d-flex align-items-center gap-2 w-100">
                      <input
                        className="form-check-input switchCheckDefault ms-auto"
                        type="checkbox"
                        role="switch"
                        defaultChecked
                      />
                    </label>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <div className="d-flex align-items-center justify-content-end m-0">
                  <Link
                    to="#"
                    className="btn btn-sm btn-light me-2"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </Link>
                  <button type="submit" className="btn btn-sm btn-primary">
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Edit Currency */}

      {/* Delete modal */}
      <div className="modal fade" id="delete_currency">
        <div className="modal-dialog modal-dialog-centered modal-sm rounded-0">
          <div className="modal-content rounded-0">
            <div className="modal-body p-4 text-center position-relative">
              <div className="mb-3 position-relative z-1">
                <span className="avatar avatar-xl badge-soft-danger border-0 text-danger rounded-circle">
                  <i className="ti ti-trash fs-24" />
                </span>
              </div>
              <h5 className="mb-1">Delete Confirmation</h5>
              <p className="mb-3">
                Are you sure you want to remove currency you selected.
              </p>
              <div className="d-flex justify-content-center">
                <Link
                  to="#"
                  className="btn btn-sm btn-light position-relative z-1 me-2 w-100"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </Link>
                <Link
                  to="#"
                  className="btn btn-sm btn-primary position-relative z-1 w-100"
                  data-bs-dismiss="modal"
                >
                  Yes, Delete
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Delete modal */}
    </>
  );
};

export default Currencies;
