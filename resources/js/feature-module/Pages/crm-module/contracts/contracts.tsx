import { Link } from "react-router"
import Footer from "../../../../components/footer/footer"
import PageHeader from "../../../../components/page-header/pageHeader"
import ImageWithBasePath from "../../../../components/imageWithBasePath"
import { all_routes } from "../../../../routes/all_routes"
import ModalContracts from "./modal/modalContracts"

const Contracts = () => {
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
                  title="Contracts"
                  badgeCount={125}
                  showModuleTile={false}
                  showExport={true}
                />
      {/* End Page Header */}
      {/* table header */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="dropdown">
            <Link
              to="#"
              className="btn btn-outline-light shadow px-2"
              data-bs-toggle="dropdown"
              data-bs-auto-close="outside"
            >
              <i className="ti ti-filter me-2" />
              Filter
              <i className="ti ti-chevron-down ms-2" />
            </Link>
            <div className="filter-dropdown-menu dropdown-menu dropdown-menu-lg p-0">
              <div className="filter-header d-flex align-items-center justify-content-between border-bottom">
                <h6 className="mb-0">
                  <i className="ti ti-filter me-1" />
                  Filter
                </h6>
                <button
                  type="button"
                  className="btn-close close-filter-btn"
                  data-bs-dismiss="dropdown-menu"
                  aria-label="Close"
                />
              </div>
              <div className="filter-set-view p-3">
                <div className="accordion" id="accordionExample">
                  <div className="filter-set-content">
                    <div className="filter-set-content-head">
                      <Link
                        to="#"
                        className="collapsed"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseThree"
                        aria-expanded="false"
                        aria-controls="collapseThree"
                      >
                        Contracts Id
                      </Link>
                    </div>
                    <div
                      className="filter-set-contents accordion-collapse collapse"
                      id="collapseThree"
                      data-bs-parent="#accordionExample"
                    >
                      <div className="filter-content-list bg-light rounded border p-2 shadow mt-2">
                        <div className="mb-1">
                          <div className="input-icon-start input-icon position-relative">
                            <span className="input-icon-addon fs-12">
                              <i className="ti ti-search" />
                            </span>
                            <input
                              type="text"
                              className="form-control form-control-md"
                              placeholder="Search"
                            />
                          </div>
                        </div>
                        <ul>
                          <li>
                            <label className="dropdown-item px-2 d-flex align-items-center">
                              <input
                                className="form-check-input m-0 me-1"
                                type="checkbox"
                              />
                              #274729
                            </label>
                          </li>
                          <li>
                            <label className="dropdown-item px-2 d-flex align-items-center">
                              <input
                                className="form-check-input m-0 me-1"
                                type="checkbox"
                              />
                              #274730
                            </label>
                          </li>
                          <li>
                            <label className="dropdown-item px-2 d-flex align-items-center">
                              <input
                                className="form-check-input m-0 me-1"
                                type="checkbox"
                              />
                              #274731
                            </label>
                          </li>
                          <li>
                            <label className="dropdown-item px-2 d-flex align-items-center">
                              <input
                                className="form-check-input m-0 me-1"
                                type="checkbox"
                              />
                              #274732
                            </label>
                          </li>
                          <li>
                            <label className="dropdown-item px-2 d-flex align-items-center">
                              <input
                                className="form-check-input m-0 me-1"
                                type="checkbox"
                              />
                              #274733
                            </label>
                          </li>
                          <li>
                            <label className="dropdown-item px-2 d-flex align-items-center">
                              <input
                                className="form-check-input m-0 me-1"
                                type="checkbox"
                              />
                              #274734
                            </label>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="filter-set-content">
                    <div className="filter-set-content-head">
                      <Link
                        to="#"
                        className="collapsed"
                        data-bs-toggle="collapse"
                        data-bs-target="#owner"
                        aria-expanded="false"
                        aria-controls="owner"
                      >
                        Subject
                      </Link>
                    </div>
                    <div
                      className="filter-set-contents accordion-collapse collapse"
                      id="owner"
                      data-bs-parent="#accordionExample"
                    >
                      <div className="filter-content-list bg-light rounded border p-2 shadow mt-2">
                        <div className="mb-1">
                          <div className="input-icon-start input-icon position-relative">
                            <span className="input-icon-addon fs-12">
                              <i className="ti ti-search" />
                            </span>
                            <input
                              type="text"
                              className="form-control form-control-md"
                              placeholder="Search"
                            />
                          </div>
                        </div>
                        <ul className="mb-0">
                          <li className="mb-1">
                            <label className="dropdown-item px-2 d-flex align-items-center">
                              <input
                                className="form-check-input m-0 me-1"
                                type="checkbox"
                              />
                              SEO Proposal
                            </label>
                          </li>
                          <li className="mb-1">
                            <label className="dropdown-item px-2 d-flex align-items-center">
                              <input
                                className="form-check-input m-0 me-1"
                                type="checkbox"
                              />
                              Web Design
                            </label>
                          </li>
                          <li className="mb-1">
                            <label className="dropdown-item px-2 d-flex align-items-center">
                              <input
                                className="form-check-input m-0 me-1"
                                type="checkbox"
                              />
                              Logo &amp; Branding
                            </label>
                          </li>
                          <li className="mb-1">
                            <label className="dropdown-item px-2 d-flex align-items-center">
                              <input
                                className="form-check-input m-0 me-1"
                                type="checkbox"
                              />
                              Development
                            </label>
                          </li>
                          <li className="mb-1">
                            <label className="dropdown-item px-2 d-flex align-items-center">
                              <input
                                className="form-check-input m-0 me-1"
                                type="checkbox"
                              />
                              Business Card Design
                            </label>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="filter-set-content">
                    <div className="filter-set-content-head">
                      <Link
                        to="#"
                        className="collapsed"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseFive"
                        aria-expanded="false"
                        aria-controls="collapseFive"
                      >
                        Customer
                      </Link>
                    </div>
                    <div
                      className="filter-set-contents accordion-collapse collapse"
                      id="collapseFive"
                      data-bs-parent="#accordionExample"
                    >
                      <div className="filter-content-list bg-light rounded border p-2 shadow mt-2">
                        <div className="mb-1">
                          <div className="input-icon-start input-icon position-relative">
                            <span className="input-icon-addon fs-12">
                              <i className="ti ti-search" />
                            </span>
                            <input
                              type="text"
                              className="form-control form-control-md"
                              placeholder="Search"
                            />
                          </div>
                        </div>
                        <ul className="mb-0">
                          <li className="mb-1">
                            <label className="dropdown-item px-2 d-flex align-items-center">
                              <input
                                className="form-check-input m-0 me-1"
                                type="checkbox"
                              />
                              <span className="avatar avatar-xss rounded-circle me-1">
                                <ImageWithBasePath
                                  src="assets/img/company/company-01.svg"
                                  className="flex-shrink-0 rounded-circle"
                                  alt="img"
                                />
                              </span>
                              NovaWave LLC
                            </label>
                          </li>
                          <li className="mb-1">
                            <label className="dropdown-item px-2 d-flex align-items-center">
                              <input
                                className="form-check-input m-0 me-1"
                                type="checkbox"
                              />
                              <span className="avatar avatar-xss rounded-circle me-1">
                                <ImageWithBasePath
                                  src="assets/img/company/company-02.svg"
                                  className="flex-shrink-0 rounded-circle"
                                  alt="img"
                                />
                              </span>
                              BlueSky Industries
                            </label>
                          </li>
                          <li className="mb-1">
                            <label className="dropdown-item px-2 d-flex align-items-center">
                              <input
                                className="form-check-input m-0 me-1"
                                type="checkbox"
                              />
                              <span className="avatar avatar-xss rounded-circle me-1">
                                <ImageWithBasePath
                                  src="assets/img/company/company-03.svg"
                                  className="flex-shrink-0 rounded-circle"
                                  alt="img"
                                />
                              </span>
                              Silver Hawk
                            </label>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="filter-set-content">
                    <div className="filter-set-content-head">
                      <Link
                        to="#"
                        className="collapsed"
                        data-bs-toggle="collapse"
                        data-bs-target="#Status"
                        aria-expanded="false"
                        aria-controls="Status"
                      >
                        Contract Type
                      </Link>
                    </div>
                    <div
                      className="filter-set-contents accordion-collapse collapse"
                      id="Status"
                      data-bs-parent="#accordionExample"
                    >
                      <div className="filter-content-list bg-light rounded border p-2 shadow mt-2">
                        <ul>
                          <li>
                            <label className="dropdown-item px-2 d-flex align-items-center">
                              <input
                                className="form-check-input m-0 me-1"
                                type="checkbox"
                              />
                              Contract Under Seal
                            </label>
                          </li>
                          <li>
                            <label className="dropdown-item px-2 d-flex align-items-center">
                              <input
                                className="form-check-input m-0 me-1"
                                type="checkbox"
                              />
                              Executory Contracts
                            </label>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Link
                    to="#"
                    className="btn btn-outline-light w-100"
                  >
                    Reset
                  </Link>
                  <Link
                    to={all_routes.ContractsList}
                    className="btn btn-primary w-100"
                  >
                    Filter
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="input-icon input-icon-start position-relative">
            <span className="input-icon-addon text-dark">
              <i className="ti ti-search" />
            </span>
            <input type="text" className="form-control" placeholder="Search" />
          </div>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="d-flex align-items-center shadow p-1 rounded border bg-white view-icons">
            <Link
              to={all_routes.ContractsList}
              className="btn btn-sm p-1 border-0 fs-14"
            >
              <i className="ti ti-list-tree" />
            </Link>
            <Link
              to={all_routes.ContractsGrid}
              className="flex-shrink-0 btn btn-sm active p-1 border-0 ms-1 fs-14"
            >
              <i className="ti ti-grid-dots" />
            </Link>
          </div>
          <Link
            to="#"
            className="btn btn-primary"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvas_add"
          >
            <i className="ti ti-square-rounded-plus-filled me-1" />
            Add New Contract
          </Link>
        </div>
      </div>
      {/* table header */}
      {/* Contact Grid */}
      <div className="row">
        <div className="col-xxl-3 col-xl-4 col-md-6">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <span className="badge badge-soft-info">274729</span>
                </div>
                <div className="dropdown table-action">
                  <Link
                    to="#"
                    className="action-icon btn btn-icon btn-sm btn-outline-light shadow"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="ti ti-dots-vertical" />
                  </Link>
                  <div className="dropdown-menu dropdown-menu-right">
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#offcanvas_edit"
                    >
                      <i className="ti ti-edit" /> Edit
                    </Link>
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_contracts"
                    >
                      <i className="ti ti-trash" /> Delete
                    </Link>
                    <Link className="dropdown-item" to="#">
                      <i className="ti ti-copy" /> Clone
                    </Link>
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#offcanvas_view"
                    >
                      <i className="ti ti-clipboard-copy" /> View Contract
                    </Link>
                    <Link className="dropdown-item" to="#">
                      <i className="ti ti-checks" /> Mark as Signed
                    </Link>
                    <Link className="dropdown-item" to="#">
                      <i className="ti ti-printer" /> Print
                    </Link>
                  </div>
                </div>
              </div>
              <div className="d-block">
                <div className="mb-3">
                  <h6 className="fs-14 mb-1 fw-semibold">SEO Contracts</h6>
                  <p>Category : Contracts under Seal</p>
                </div>
                <div className="mb-3">
                  <p className="d-flex align-items-center mb-2">
                    <span className="text-dark me-1">
                      <i className="ti ti-calendar-event fs-16" />
                    </span>
                    Date : <span className="text-dark ms-1">23 Nov 2025</span>
                  </p>
                  <p className="d-flex align-items-center">
                    <span className="text-dark me-1">
                      <i className="ti ti-calendar-stats fs-16" />
                    </span>
                    Open till :{" "}
                    <span className="text-dark ms-1">17 Dec 2025</span>
                  </p>
                </div>
                <div className="bg-light border rounded d-flex align-items-center p-2 mb-3">
                  <Link
                    to="#"
                    className="avatar rounded-circle border bg-white me-2"
                  >
                    <ImageWithBasePath
                      src="assets/img/company/company-01.svg"
                      className="w-auto h-auto"
                      alt="img"
                    />
                  </Link>
                  <div className="d-flex flex-column">
                    <Link
                      to="#"
                      className="text-dark fw-medium"
                    >
                      NovaWave LLC
                    </Link>
                    <span className="d-block">Customer</span>
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-between pt-3 border-top">
                <div>
                  <span className="badge badge-soft-info border-0">
                    {" "}
                    <i className="ti ti-moneybag me-1" />
                    Value : $2,04,214
                  </span>
                </div>
                <Link
                  to="#"
                  className="avatar avatar-xs bg-light text-dark rounded-circle"
                >
                  {" "}
                  <i className="ti ti-file-dots fs-12" />{" "}
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xxl-3 col-xl-4 col-md-6">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <span className="badge badge-soft-info">274730</span>
                </div>
                <div className="dropdown table-action">
                  <Link
                    to="#"
                    className="action-icon btn btn-icon btn-sm btn-outline-light shadow"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="ti ti-dots-vertical" />
                  </Link>
                  <div className="dropdown-menu dropdown-menu-right">
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#offcanvas_edit"
                    >
                      <i className="ti ti-edit" /> Edit
                    </Link>
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_contracts"
                    >
                      <i className="ti ti-trash" /> Delete
                    </Link>
                    <Link className="dropdown-item" to="#">
                      <i className="ti ti-copy" /> Clone
                    </Link>
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#offcanvas_view"
                    >
                      <i className="ti ti-clipboard-copy" /> View Contract
                    </Link>
                    <Link className="dropdown-item" to="#">
                      <i className="ti ti-checks" /> Mark as Signed
                    </Link>
                    <Link className="dropdown-item" to="#">
                      <i className="ti ti-printer" /> Print
                    </Link>
                  </div>
                </div>
              </div>
              <div className="d-block">
                <div className="mb-3">
                  <h6 className="fs-14 mb-1 fw-semibold">Web Design</h6>
                  <p>Category : Executory Contracts</p>
                </div>
                <div className="mb-3">
                  <p className="d-flex align-items-center mb-2">
                    <span className="text-dark me-1">
                      <i className="ti ti-calendar-event fs-16" />
                    </span>
                    Date : <span className="text-dark ms-1">07 Nov 2025</span>
                  </p>
                  <p className="d-flex align-items-center">
                    <span className="text-dark me-1">
                      <i className="ti ti-calendar-stats fs-16" />
                    </span>
                    Open till :{" "}
                    <span className="text-dark ms-1">11 Dec 2025</span>
                  </p>
                </div>
                <div className="bg-light border rounded d-flex align-items-center p-2 mb-3">
                  <Link
                    to="#"
                    className="avatar rounded-circle border bg-white me-2"
                  >
                    <ImageWithBasePath
                      src="assets/img/company/company-02.svg"
                      className="w-auto h-auto"
                      alt="img"
                    />
                  </Link>
                  <div className="d-flex flex-column">
                    <Link
                      to="#"
                      className="text-dark fw-medium"
                    >
                      BlueSky Industries
                    </Link>
                    <span className="d-block">Customer</span>
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-between pt-3 border-top">
                <div>
                  <span className="badge badge-soft-info border-0">
                    {" "}
                    <i className="ti ti-moneybag me-1" />
                    Value: $1,45,000
                  </span>
                </div>
                <Link
                  to="#"
                  className="avatar avatar-xs bg-light text-dark rounded-circle"
                >
                  {" "}
                  <i className="ti ti-file-dots fs-12" />{" "}
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xxl-3 col-xl-4 col-md-6">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <span className="badge badge-soft-info">274731</span>
                </div>
                <div className="dropdown table-action">
                  <Link
                    to="#"
                    className="action-icon btn btn-icon btn-sm btn-outline-light shadow"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="ti ti-dots-vertical" />
                  </Link>
                  <div className="dropdown-menu dropdown-menu-right">
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#offcanvas_edit"
                    >
                      <i className="ti ti-edit" /> Edit
                    </Link>
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_contracts"
                    >
                      <i className="ti ti-trash" /> Delete
                    </Link>
                    <Link className="dropdown-item" to="#">
                      <i className="ti ti-copy" /> Clone
                    </Link>
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#offcanvas_view"
                    >
                      <i className="ti ti-clipboard-copy" /> View Contract
                    </Link>
                    <Link className="dropdown-item" to="#">
                      <i className="ti ti-checks" /> Mark as Signed
                    </Link>
                    <Link className="dropdown-item" to="#">
                      <i className="ti ti-printer" /> Print
                    </Link>
                  </div>
                </div>
              </div>
              <div className="d-block">
                <div className="mb-3">
                  <h6 className="fs-14 mb-1 fw-semibold">
                    Logo &amp; Branding
                  </h6>
                  <p>Category : Express Contracts</p>
                </div>
                <div className="mb-3">
                  <p className="d-flex align-items-center mb-2">
                    <span className="text-dark me-1">
                      <i className="ti ti-calendar-event fs-16" />
                    </span>
                    Date : <span className="text-dark ms-1">15 Oct 2025</span>
                  </p>
                  <p className="d-flex align-items-center">
                    <span className="text-dark me-1">
                      <i className="ti ti-calendar-stats fs-16" />
                    </span>
                    Open till :{" "}
                    <span className="text-dark ms-1">23 Nov 2025</span>
                  </p>
                </div>
                <div className="bg-light border rounded d-flex align-items-center p-2 mb-3">
                  <Link
                    to="#"
                    className="avatar rounded-circle border bg-white me-2"
                  >
                    <ImageWithBasePath
                      src="assets/img/company/company-03.svg"
                      className="w-auto h-auto"
                      alt="img"
                    />
                  </Link>
                  <div className="d-flex flex-column">
                    <Link
                      to="#"
                      className="text-dark fw-medium"
                    >
                      Sliver Hawk
                    </Link>
                    <span className="d-block">Customer</span>
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-between pt-3 border-top">
                <div>
                  <span className="badge badge-soft-info border-0">
                    {" "}
                    <i className="ti ti-moneybag me-1" />
                    Value: $2,15,000
                  </span>
                </div>
                <Link
                  to="#"
                  className="avatar avatar-xs bg-light text-dark rounded-circle"
                >
                  {" "}
                  <i className="ti ti-file-dots fs-12" />{" "}
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xxl-3 col-xl-4 col-md-6">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <span className="badge badge-soft-info">274732</span>
                </div>
                <div className="dropdown table-action">
                  <Link
                    to="#"
                    className="action-icon btn btn-icon btn-sm btn-outline-light shadow"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="ti ti-dots-vertical" />
                  </Link>
                  <div className="dropdown-menu dropdown-menu-right">
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#offcanvas_edit"
                    >
                      <i className="ti ti-edit" /> Edit
                    </Link>
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_contracts"
                    >
                      <i className="ti ti-trash" /> Delete
                    </Link>
                    <Link className="dropdown-item" to="#">
                      <i className="ti ti-copy" /> Clone
                    </Link>
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#offcanvas_view"
                    >
                      <i className="ti ti-clipboard-copy" /> View Contract
                    </Link>
                    <Link className="dropdown-item" to="#">
                      <i className="ti ti-checks" /> Mark as Signed
                    </Link>
                    <Link className="dropdown-item" to="#">
                      <i className="ti ti-printer" /> Print
                    </Link>
                  </div>
                </div>
              </div>
              <div className="d-block">
                <div className="mb-3">
                  <h6 className="fs-14 mb-1 fw-semibold">Development</h6>
                  <p>Category : Implied Contracts</p>
                </div>
                <div className="mb-3">
                  <p className="d-flex align-items-center mb-2">
                    <span className="text-dark me-1">
                      <i className="ti ti-calendar-event fs-16" />
                    </span>
                    Date : <span className="text-dark ms-1">28 Sep 2025</span>
                  </p>
                  <p className="d-flex align-items-center">
                    <span className="text-dark me-1">
                      <i className="ti ti-calendar-stats fs-16" />
                    </span>
                    Open till :{" "}
                    <span className="text-dark ms-1">12 Nov 2025</span>
                  </p>
                </div>
                <div className="bg-light border rounded d-flex align-items-center p-2 mb-3">
                  <Link
                    to="#"
                    className="avatar rounded-circle border bg-white me-2"
                  >
                    <ImageWithBasePath
                      src="assets/img/company/company-04.svg"
                      className="w-auto h-auto"
                      alt="img"
                    />
                  </Link>
                  <div className="d-flex flex-column">
                    <Link
                      to="#"
                      className="text-dark fw-medium"
                    >
                      Summit Peak
                    </Link>
                    <span className="d-block">Customer</span>
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-between pt-3 border-top">
                <div>
                  <span className="badge badge-soft-info border-0">
                    {" "}
                    <i className="ti ti-moneybag me-1" />
                    Value: $4,80,380
                  </span>
                </div>
                <Link
                  to="#"
                  className="avatar avatar-xs bg-light text-dark rounded-circle"
                >
                  {" "}
                  <i className="ti ti-file-dots fs-12" />{" "}
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xxl-3 col-xl-4 col-md-6">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <span className="badge badge-soft-info">274733</span>
                </div>
                <div className="dropdown table-action">
                  <Link
                    to="#"
                    className="action-icon btn btn-icon btn-sm btn-outline-light shadow"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="ti ti-dots-vertical" />
                  </Link>
                  <div className="dropdown-menu dropdown-menu-right">
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#offcanvas_edit"
                    >
                      <i className="ti ti-edit" /> Edit
                    </Link>
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_contracts"
                    >
                      <i className="ti ti-trash" /> Delete
                    </Link>
                    <Link className="dropdown-item" to="#">
                      <i className="ti ti-copy" /> Clone
                    </Link>
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#offcanvas_view"
                    >
                      <i className="ti ti-clipboard-copy" /> View Contract
                    </Link>
                    <Link className="dropdown-item" to="#">
                      <i className="ti ti-checks" /> Mark as Signed
                    </Link>
                    <Link className="dropdown-item" to="#">
                      <i className="ti ti-printer" /> Print
                    </Link>
                  </div>
                </div>
              </div>
              <div className="d-block">
                <div className="mb-3">
                  <h6 className="fs-14 mb-1 fw-semibold">
                    Business Card Design
                  </h6>
                  <p>Category : Unconscionable </p>
                </div>
                <div className="mb-3">
                  <p className="d-flex align-items-center mb-2">
                    <span className="text-dark me-1">
                      <i className="ti ti-calendar-event fs-16" />
                    </span>
                    Date : <span className="text-dark ms-1">25 Sep 2025</span>
                  </p>
                  <p className="d-flex align-items-center">
                    <span className="text-dark me-1">
                      <i className="ti ti-calendar-stats fs-16" />
                    </span>
                    Open till :{" "}
                    <span className="text-dark ms-1">07 Nov 2025</span>
                  </p>
                </div>
                <div className="bg-light border rounded d-flex align-items-center p-2 mb-3">
                  <Link
                    to="#"
                    className="avatar rounded-circle border bg-white me-2"
                  >
                    <ImageWithBasePath
                      src="assets/img/company/company-05.svg"
                      className="w-auto h-auto"
                      alt="img"
                    />
                  </Link>
                  <div className="d-flex flex-column">
                    <Link
                      to="#"
                      className="text-dark fw-medium"
                    >
                      RiverStone Ltd
                    </Link>
                    <span className="d-block">Customer</span>
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-between pt-3 border-top">
                <div>
                  <span className="badge badge-soft-info border-0">
                    {" "}
                    <i className="ti ti-moneybag me-1" />
                    Value: $4,80,380
                  </span>
                </div>
                <Link
                  to="#"
                  className="avatar avatar-xs bg-light text-dark rounded-circle"
                >
                  {" "}
                  <i className="ti ti-file-dots fs-12" />{" "}
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xxl-3 col-xl-4 col-md-6">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <span className="badge badge-soft-info">274734</span>
                </div>
                <div className="dropdown table-action">
                  <Link
                    to="#"
                    className="action-icon btn btn-icon btn-sm btn-outline-light shadow"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="ti ti-dots-vertical" />
                  </Link>
                  <div className="dropdown-menu dropdown-menu-right">
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#offcanvas_edit"
                    >
                      <i className="ti ti-edit" /> Edit
                    </Link>
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_contracts"
                    >
                      <i className="ti ti-trash" /> Delete
                    </Link>
                    <Link className="dropdown-item" to="#">
                      <i className="ti ti-copy" /> Clone
                    </Link>
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#offcanvas_view"
                    >
                      <i className="ti ti-clipboard-copy" /> View Contract
                    </Link>
                    <Link className="dropdown-item" to="#">
                      <i className="ti ti-checks" /> Mark as Signed
                    </Link>
                    <Link className="dropdown-item" to="#">
                      <i className="ti ti-printer" /> Print
                    </Link>
                  </div>
                </div>
              </div>
              <div className="d-block">
                <div className="mb-3">
                  <h6 className="fs-14 mb-1 fw-semibold">Technical SEO</h6>
                  <p>Category : Fixed Price Contract </p>
                </div>
                <div className="mb-3">
                  <p className="d-flex align-items-center mb-2">
                    <span className="text-dark me-1">
                      <i className="ti ti-calendar-event fs-16" />
                    </span>
                    Date : <span className="text-dark ms-1">12 Sep 2025</span>
                  </p>
                  <p className="d-flex align-items-center">
                    <span className="text-dark me-1">
                      <i className="ti ti-calendar-stats fs-16" />
                    </span>
                    Open till :{" "}
                    <span className="text-dark ms-1">27 Oct 2025</span>
                  </p>
                </div>
                <div className="bg-light border rounded d-flex align-items-center p-2 mb-3">
                  <Link
                    to="#"
                    className="avatar rounded-circle border bg-white me-2"
                  >
                    <ImageWithBasePath
                      src="assets/img/company/company-06.svg"
                      className="w-auto h-auto"
                      alt="img"
                    />
                  </Link>
                  <div className="d-flex flex-column">
                    <Link
                      to="#"
                      className="text-dark fw-medium"
                    >
                      Bright Bridge Grp
                    </Link>
                    <span className="d-block">Customer</span>
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-between pt-3 border-top">
                <div>
                  <span className="badge badge-soft-info border-0">
                    {" "}
                    <i className="ti ti-moneybag me-1" />
                    Value: $3,50,000
                  </span>
                </div>
                <Link
                  to="#"
                  className="avatar avatar-xs bg-light text-dark rounded-circle"
                >
                  {" "}
                  <i className="ti ti-file-dots fs-12" />{" "}
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xxl-3 col-xl-4 col-md-6">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <span className="badge badge-soft-info">274735</span>
                </div>
                <div className="dropdown table-action">
                  <Link
                    to="#"
                    className="action-icon btn btn-icon btn-sm btn-outline-light shadow"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="ti ti-dots-vertical" />
                  </Link>
                  <div className="dropdown-menu dropdown-menu-right">
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#offcanvas_edit"
                    >
                      <i className="ti ti-edit" /> Edit
                    </Link>
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_contracts"
                    >
                      <i className="ti ti-trash" /> Delete
                    </Link>
                    <Link className="dropdown-item" to="#">
                      <i className="ti ti-copy" /> Clone
                    </Link>
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#offcanvas_view"
                    >
                      <i className="ti ti-clipboard-copy" /> View Contract
                    </Link>
                    <Link className="dropdown-item" to="#">
                      <i className="ti ti-checks" /> Mark as Signed
                    </Link>
                    <Link className="dropdown-item" to="#">
                      <i className="ti ti-printer" /> Print
                    </Link>
                  </div>
                </div>
              </div>
              <div className="d-block">
                <div className="mb-3">
                  <h6 className="fs-14 mb-1 fw-semibold">
                    Social Media profile Branding
                  </h6>
                  <p>Category : Cost Plus Contract </p>
                </div>
                <div className="mb-3">
                  <p className="d-flex align-items-center mb-2">
                    <span className="text-dark me-1">
                      <i className="ti ti-calendar-event fs-16" />
                    </span>
                    Date : <span className="text-dark ms-1">17 Aug 2025</span>
                  </p>
                  <p className="d-flex align-items-center">
                    <span className="text-dark me-1">
                      <i className="ti ti-calendar-stats fs-16" />
                    </span>
                    Open till :{" "}
                    <span className="text-dark ms-1">15 Oct 2025</span>
                  </p>
                </div>
                <div className="bg-light border rounded d-flex align-items-center p-2 mb-3">
                  <Link
                    to="#"
                    className="avatar rounded-circle border bg-white me-2"
                  >
                    <ImageWithBasePath
                      src="assets/img/company/company-07.svg"
                      className="w-auto h-auto"
                      alt="img"
                    />
                  </Link>
                  <div className="d-flex flex-column">
                    <Link
                      to="#"
                      className="text-dark fw-medium"
                    >
                      CoastalStar.Co.
                    </Link>
                    <span className="d-block">Customer</span>
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-between pt-3 border-top">
                <div>
                  <span className="badge badge-soft-info border-0">
                    {" "}
                    <i className="ti ti-moneybag me-1" />
                    Value: $1,23,000
                  </span>
                </div>
                <Link
                  to="#"
                  className="avatar avatar-xs bg-light text-dark rounded-circle"
                >
                  {" "}
                  <i className="ti ti-file-dots fs-12" />{" "}
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xxl-3 col-xl-4 col-md-6">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <span className="badge badge-soft-info">274736</span>
                </div>
                <div className="dropdown table-action">
                  <Link
                    to="#"
                    className="action-icon btn btn-icon btn-sm btn-outline-light shadow"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="ti ti-dots-vertical" />
                  </Link>
                  <div className="dropdown-menu dropdown-menu-right">
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#offcanvas_edit"
                    >
                      <i className="ti ti-edit" /> Edit
                    </Link>
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_contracts"
                    >
                      <i className="ti ti-trash" /> Delete
                    </Link>
                    <Link className="dropdown-item" to="#">
                      <i className="ti ti-copy" /> Clone
                    </Link>
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#offcanvas_view"
                    >
                      <i className="ti ti-clipboard-copy" /> View Contract
                    </Link>
                    <Link className="dropdown-item" to="#">
                      <i className="ti ti-checks" /> Mark as Signed
                    </Link>
                    <Link className="dropdown-item" to="#">
                      <i className="ti ti-printer" /> Print
                    </Link>
                  </div>
                </div>
              </div>
              <div className="d-block">
                <div className="mb-3">
                  <h6 className="fs-14 mb-1 fw-semibold">Portfolio Site</h6>
                  <p>Category : Service Level Agreement </p>
                </div>
                <div className="mb-3">
                  <p className="d-flex align-items-center mb-2">
                    <span className="text-dark me-1">
                      <i className="ti ti-calendar-event fs-16" />
                    </span>
                    Date : <span className="text-dark ms-1">11 Jun 2025</span>
                  </p>
                  <p className="d-flex align-items-center">
                    <span className="text-dark me-1">
                      <i className="ti ti-calendar-stats fs-16" />
                    </span>
                    Open till :{" "}
                    <span className="text-dark ms-1">04 Oct 2025</span>
                  </p>
                </div>
                <div className="bg-light border rounded d-flex align-items-center p-2 mb-3">
                  <Link
                    to="#"
                    className="avatar rounded-circle border bg-white me-2"
                  >
                    <ImageWithBasePath
                      src="assets/img/company/company-08.svg"
                      className="w-auto h-auto"
                      alt="img"
                    />
                  </Link>
                  <div className="d-flex flex-column">
                    <Link
                      to="#"
                      className="text-dark fw-medium"
                    >
                      HarborView
                    </Link>
                    <span className="d-block">Customer</span>
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-between pt-3 border-top">
                <div>
                  <span className="badge badge-soft-info border-0">
                    {" "}
                    <i className="ti ti-moneybag me-1" />
                    Value: $3,12,500
                  </span>
                </div>
                <Link
                  to="#"
                  className="avatar avatar-xs bg-light text-dark rounded-circle"
                >
                  {" "}
                  <i className="ti ti-file-dots fs-12" />{" "}
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xxl-3 col-xl-4 col-md-6">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <span className="badge badge-soft-info">274737</span>
                </div>
                <div className="dropdown table-action">
                  <Link
                    to="#"
                    className="action-icon btn btn-icon btn-sm btn-outline-light shadow"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="ti ti-dots-vertical" />
                  </Link>
                  <div className="dropdown-menu dropdown-menu-right">
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#offcanvas_edit"
                    >
                      <i className="ti ti-edit" /> Edit
                    </Link>
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_contracts"
                    >
                      <i className="ti ti-trash" /> Delete
                    </Link>
                    <Link className="dropdown-item" to="#">
                      <i className="ti ti-copy" /> Clone
                    </Link>
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#offcanvas_view"
                    >
                      <i className="ti ti-clipboard-copy" /> View Contract
                    </Link>
                    <Link className="dropdown-item" to="#">
                      <i className="ti ti-checks" /> Mark as Signed
                    </Link>
                    <Link className="dropdown-item" to="#">
                      <i className="ti ti-printer" /> Print
                    </Link>
                  </div>
                </div>
              </div>
              <div className="d-block">
                <div className="mb-3">
                  <h6 className="fs-14 mb-1 fw-semibold">Logo Design</h6>
                  <p>Category : Partnership Contract </p>
                </div>
                <div className="mb-3">
                  <p className="d-flex align-items-center mb-2">
                    <span className="text-dark me-1">
                      <i className="ti ti-calendar-event fs-16" />
                    </span>
                    Date : <span className="text-dark ms-1">11 Mar 2025</span>
                  </p>
                  <p className="d-flex align-items-center">
                    <span className="text-dark me-1">
                      <i className="ti ti-calendar-stats fs-16" />
                    </span>
                    Open till :{" "}
                    <span className="text-dark ms-1">29 Sep 2025</span>
                  </p>
                </div>
                <div className="bg-light border rounded d-flex align-items-center p-2 mb-3">
                  <Link
                    to="#"
                    className="avatar rounded-circle border bg-white me-2"
                  >
                    <ImageWithBasePath
                      src="assets/img/company/company-09.svg"
                      className="w-auto h-auto"
                      alt="img"
                    />
                  </Link>
                  <div className="d-flex flex-column">
                    <Link
                      to="#"
                      className="text-dark fw-medium"
                    >
                      Golden Gate Ltd
                    </Link>
                    <span className="d-block">Customer</span>
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-between pt-3 border-top">
                <div>
                  <span className="badge badge-soft-info border-0">
                    {" "}
                    <i className="ti ti-moneybag me-1" />
                    Value: $4,18,000
                  </span>
                </div>
                <Link
                  to="#"
                  className="avatar avatar-xs bg-light text-dark rounded-circle"
                >
                  {" "}
                  <i className="ti ti-file-dots fs-12" />{" "}
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xxl-3 col-xl-4 col-md-6">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <span className="badge badge-soft-info">274738</span>
                </div>
                <div className="dropdown table-action">
                  <Link
                    to="#"
                    className="action-icon btn btn-icon btn-sm btn-outline-light shadow"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="ti ti-dots-vertical" />
                  </Link>
                  <div className="dropdown-menu dropdown-menu-right">
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#offcanvas_edit"
                    >
                      <i className="ti ti-edit" /> Edit
                    </Link>
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_contracts"
                    >
                      <i className="ti ti-trash" /> Delete
                    </Link>
                    <Link className="dropdown-item" to="#">
                      <i className="ti ti-copy" /> Clone
                    </Link>
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#offcanvas_view"
                    >
                      <i className="ti ti-clipboard-copy" /> View Contract
                    </Link>
                    <Link className="dropdown-item" to="#">
                      <i className="ti ti-checks" /> Mark as Signed
                    </Link>
                    <Link className="dropdown-item" to="#">
                      <i className="ti ti-printer" /> Print
                    </Link>
                  </div>
                </div>
              </div>
              <div className="d-block">
                <div className="mb-3">
                  <h6 className="fs-14 mb-1 fw-semibold">Web Design</h6>
                  <p>Category : Executory Contracts</p>
                </div>
                <div className="mb-3">
                  <p className="d-flex align-items-center mb-2">
                    <span className="text-dark me-1">
                      <i className="ti ti-calendar-event fs-16" />
                    </span>
                    Date : <span className="text-dark ms-1">27 Jan 2025</span>
                  </p>
                  <p className="d-flex align-items-center">
                    <span className="text-dark me-1">
                      <i className="ti ti-calendar-stats fs-16" />
                    </span>
                    Open till :{" "}
                    <span className="text-dark ms-1">25 Sep 2025</span>
                  </p>
                </div>
                <div className="bg-light border rounded d-flex align-items-center p-2 mb-3">
                  <Link
                    to="#"
                    className="avatar rounded-circle border bg-white me-2"
                  >
                    <ImageWithBasePath
                      src="assets/img/company/company-10.svg"
                      className="w-auto h-auto"
                      alt="img"
                    />
                  </Link>
                  <div className="d-flex flex-column">
                    <Link
                      to="#"
                      className="text-dark fw-medium"
                    >
                      BlueSky Industries
                    </Link>
                    <span className="d-block">Customer</span>
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-between pt-3 border-top">
                <div>
                  <span className="badge badge-soft-info border-0">
                    {" "}
                    <i className="ti ti-moneybag me-1" />
                    Value: $1,45,000
                  </span>
                </div>
                <Link
                  to="#"
                  className="avatar avatar-xs bg-light text-dark rounded-circle"
                >
                  {" "}
                  <i className="ti ti-file-dots fs-12" />{" "}
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xxl-3 col-xl-4 col-md-6">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <span className="badge badge-soft-info">274739</span>
                </div>
                <div className="dropdown table-action">
                  <Link
                    to="#"
                    className="action-icon btn btn-icon btn-sm btn-outline-light shadow"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="ti ti-dots-vertical" />
                  </Link>
                  <div className="dropdown-menu dropdown-menu-right">
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#offcanvas_edit"
                    >
                      <i className="ti ti-edit" /> Edit
                    </Link>
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_contracts"
                    >
                      <i className="ti ti-trash" /> Delete
                    </Link>
                    <Link className="dropdown-item" to="#">
                      <i className="ti ti-copy" /> Clone
                    </Link>
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#offcanvas_view"
                    >
                      <i className="ti ti-clipboard-copy" /> View Contract
                    </Link>
                    <Link className="dropdown-item" to="#">
                      <i className="ti ti-checks" /> Mark as Signed
                    </Link>
                    <Link className="dropdown-item" to="#">
                      <i className="ti ti-printer" /> Print
                    </Link>
                  </div>
                </div>
              </div>
              <div className="d-block">
                <div className="mb-3">
                  <h6 className="fs-14 mb-1 fw-semibold">HarborView</h6>
                  <p>Category : Implied Contracts </p>
                </div>
                <div className="mb-3">
                  <p className="d-flex align-items-center mb-2">
                    <span className="text-dark me-1">
                      <i className="ti ti-calendar-event fs-16" />
                    </span>
                    Date : <span className="text-dark ms-1">17 Dec 2025</span>
                  </p>
                  <p className="d-flex align-items-center">
                    <span className="text-dark me-1">
                      <i className="ti ti-calendar-stats fs-16" />
                    </span>
                    Open till :{" "}
                    <span className="text-dark ms-1">18 Oct 2026</span>
                  </p>
                </div>
                <div className="bg-light border rounded d-flex align-items-center p-2 mb-3">
                  <Link
                    to="#"
                    className="avatar rounded-circle border bg-white me-2"
                  >
                    <ImageWithBasePath
                      src="assets/img/company/company-07.svg"
                      className="w-auto h-auto"
                      alt="img"
                    />
                  </Link>
                  <div className="d-flex flex-column">
                    <Link
                      to="#"
                      className="text-dark fw-medium"
                    >
                      RiverStone Ltd
                    </Link>
                    <span className="d-block">Customer</span>
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-between pt-3 border-top">
                <div>
                  <span className="badge badge-soft-info border-0">
                    {" "}
                    <i className="ti ti-moneybag me-1" />
                    Value: $4,18,000
                  </span>
                </div>
                <Link
                  to="#"
                  className="avatar avatar-xs bg-light text-dark rounded-circle"
                >
                  {" "}
                  <i className="ti ti-file-dots fs-12" />{" "}
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xxl-3 col-xl-4 col-md-6">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <span className="badge badge-soft-info">274740</span>
                </div>
                <div className="dropdown table-action">
                  <Link
                    to="#"
                    className="action-icon btn btn-icon btn-sm btn-outline-light shadow"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="ti ti-dots-vertical" />
                  </Link>
                  <div className="dropdown-menu dropdown-menu-right">
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#offcanvas_edit"
                    >
                      <i className="ti ti-edit" /> Edit
                    </Link>
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_contracts"
                    >
                      <i className="ti ti-trash" /> Delete
                    </Link>
                    <Link className="dropdown-item" to="#">
                      <i className="ti ti-copy" /> Clone
                    </Link>
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#offcanvas_view"
                    >
                      <i className="ti ti-clipboard-copy" /> View Contract
                    </Link>
                    <Link className="dropdown-item" to="#">
                      <i className="ti ti-checks" /> Mark as Signed
                    </Link>
                    <Link className="dropdown-item" to="#">
                      <i className="ti ti-printer" /> Print
                    </Link>
                  </div>
                </div>
              </div>
              <div className="d-block">
                <div className="mb-3">
                  <h6 className="fs-14 mb-1 fw-semibold">
                    Business Card Design
                  </h6>
                  <p>Category : Partnership Contract </p>
                </div>
                <div className="mb-3">
                  <p className="d-flex align-items-center mb-2">
                    <span className="text-dark me-1">
                      <i className="ti ti-calendar-event fs-16" />
                    </span>
                    Date : <span className="text-dark ms-1">18 Dec 2025</span>
                  </p>
                  <p className="d-flex align-items-center">
                    <span className="text-dark me-1">
                      <i className="ti ti-calendar-stats fs-16" />
                    </span>
                    Open till :{" "}
                    <span className="text-dark ms-1">19 Oct 2026</span>
                  </p>
                </div>
                <div className="bg-light border rounded d-flex align-items-center p-2 mb-3">
                  <Link
                    to="#"
                    className="avatar rounded-circle border bg-white me-2"
                  >
                    <ImageWithBasePath
                      src="assets/img/company/company-08.svg"
                      className="w-auto h-auto"
                      alt="img"
                    />
                  </Link>
                  <div className="d-flex flex-column">
                    <Link
                      to="#"
                      className="text-dark fw-medium"
                    >
                      RiverStone Ltd
                    </Link>
                    <span className="d-block">Customer</span>
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-between pt-3 border-top">
                <div>
                  <span className="badge badge-soft-info border-0">
                    {" "}
                    <i className="ti ti-moneybag me-1" />
                    Value: $4,80,380
                  </span>
                </div>
                <Link
                  to="#"
                  className="avatar avatar-xs bg-light text-dark rounded-circle"
                >
                  {" "}
                  <i className="ti ti-file-dots fs-12" />{" "}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Contact Grid */}
      <div className="load-btn text-center">
        <Link to="#" className="btn btn-primary">
          <i className="ti ti-loader me-1" /> Load More
        </Link>
      </div>
    </div>
    {/* End Content */}
    {/* Start Footer */}
   <Footer/>
    {/* End Footer */}
  </div>
  {/* ========================
			End Page Content
		========================= */}
        <ModalContracts/>
</>

  )
}

export default Contracts