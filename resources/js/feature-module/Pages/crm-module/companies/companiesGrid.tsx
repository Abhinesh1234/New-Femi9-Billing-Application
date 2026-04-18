import { Link } from "react-router"
import ImageWithBasePath from "../../../../components/imageWithBasePath"
import { all_routes } from "../../../../routes/all_routes"
import PageHeader from "../../../../components/page-header/pageHeader"
import ModalCompanies from "./modal/modalCompanies"


const CompaniesGrid = () => {
  return (
    <>
  {/* ========================
			Start Page Content
		========================= */}
  <div className="page-wrapper">
    {/* Start Content */}
    <div className="content">
      {/* Page Header */}
     <PageHeader title="Companies" badgeCount={125} showModuleTile={false} showExport={true} />

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
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseTwo"
                        aria-expanded="true"
                        aria-controls="collapseTwo"
                      >
                        Owner
                      </Link>
                    </div>
                    <div
                      className="filter-set-contents accordion-collapse collapse show"
                      id="collapseTwo"
                      data-bs-parent="#accordionExample"
                    >
                      <div className="filter-content-list bg-light rounded border p-2 shadow mt-2">
                        <div className="mb-2">
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
                              <span className="avatar avatar-xs rounded-circle me-2">
                                <ImageWithBasePath
                                  src="assets/img/users/user-06.jpg"
                                  className="flex-shrink-0 rounded-circle"
                                  alt="img"
                                />
                              </span>
                              Elizabeth Morgan
                            </label>
                          </li>
                          <li className="mb-1">
                            <label className="dropdown-item px-2 d-flex align-items-center">
                              <input
                                className="form-check-input m-0 me-1"
                                type="checkbox"
                              />
                              <span className="avatar avatar-xs rounded-circle me-2">
                                <ImageWithBasePath
                                  src="assets/img/users/user-40.jpg"
                                  className="flex-shrink-0 rounded-circle"
                                  alt="img"
                                />
                              </span>
                              Katherine Brooks
                            </label>
                          </li>
                          <li className="mb-1">
                            <label className="dropdown-item px-2 d-flex align-items-center">
                              <input
                                className="form-check-input m-0 me-1"
                                type="checkbox"
                              />
                              <span className="avatar avatar-xs rounded-circle me-2">
                                <ImageWithBasePath
                                  src="assets/img/users/user-05.jpg"
                                  className="flex-shrink-0 rounded-circle"
                                  alt="img"
                                />
                              </span>
                              Sophia Lopez
                            </label>
                          </li>
                          <li className="mb-1">
                            <label className="dropdown-item px-2 d-flex align-items-center">
                              <input
                                className="form-check-input m-0 me-1"
                                type="checkbox"
                              />
                              <span className="avatar avatar-xs rounded-circle me-2">
                                <ImageWithBasePath
                                  src="assets/img/users/user-10.jpg"
                                  className="flex-shrink-0 rounded-circle"
                                  alt="img"
                                />
                              </span>
                              John Michael
                            </label>
                          </li>
                          <li className="mb-1">
                            <label className="dropdown-item px-2 d-flex align-items-center">
                              <input
                                className="form-check-input m-0 me-1"
                                type="checkbox"
                              />
                              <span className="avatar avatar-xs rounded-circle me-2">
                                <ImageWithBasePath
                                  src="assets/img/users/user-15.jpg"
                                  className="flex-shrink-0 rounded-circle"
                                  alt="img"
                                />
                              </span>
                              Natalie Brooks
                            </label>
                          </li>
                          <li className="mb-1">
                            <label className="dropdown-item px-2 d-flex align-items-center">
                              <input
                                className="form-check-input m-0 me-1"
                                type="checkbox"
                              />
                              <span className="avatar avatar-xs rounded-circle me-2">
                                <ImageWithBasePath
                                  src="assets/img/users/user-01.jpg"
                                  className="flex-shrink-0 rounded-circle"
                                  alt="img"
                                />
                              </span>
                              William Turner
                            </label>
                          </li>
                          <li className="mb-1">
                            <label className="dropdown-item px-2 d-flex align-items-center">
                              <input
                                className="form-check-input m-0 me-1"
                                type="checkbox"
                              />
                              <span className="avatar avatar-xs rounded-circle me-2">
                                <ImageWithBasePath
                                  src="assets/img/users/user-13.jpg"
                                  className="flex-shrink-0 rounded-circle"
                                  alt="img"
                                />
                              </span>
                              Ava Martinez
                            </label>
                          </li>
                          <li className="mb-1">
                            <label className="dropdown-item px-2 d-flex align-items-center">
                              <input
                                className="form-check-input m-0 me-1"
                                type="checkbox"
                              />
                              <span className="avatar avatar-xs rounded-circle me-2">
                                <ImageWithBasePath
                                  src="assets/img/users/user-12.jpg"
                                  className="flex-shrink-0 rounded-circle"
                                  alt="img"
                                />
                              </span>
                              Nathan Reed
                            </label>
                          </li>
                          <li className="mb-1">
                            <label className="dropdown-item px-2 d-flex align-items-center">
                              <input
                                className="form-check-input m-0 me-1"
                                type="checkbox"
                              />
                              <span className="avatar avatar-xs rounded-circle me-2">
                                <ImageWithBasePath
                                  src="assets/img/users/user-03.jpg"
                                  className="flex-shrink-0 rounded-circle"
                                  alt="img"
                                />
                              </span>
                              Lily Anderson
                            </label>
                          </li>
                          <li className="mb-1">
                            <label className="dropdown-item px-2 d-flex align-items-center">
                              <input
                                className="form-check-input m-0 me-1"
                                type="checkbox"
                              />
                              <span className="avatar avatar-xs rounded-circle me-2">
                                <ImageWithBasePath
                                  src="assets/img/users/user-18.jpg"
                                  className="flex-shrink-0 rounded-circle"
                                  alt="img"
                                />
                              </span>
                              Ryan Coleman
                            </label>
                          </li>
                          <li>
                            <Link
                              to="#"
                              className="link-primary text-decoration-underline p-2 d-flex"
                            >
                              Load More
                            </Link>
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
                        data-bs-target="#collapseThree"
                        aria-expanded="false"
                        aria-controls="collapseThree"
                      >
                        Tags
                      </Link>
                    </div>
                    <div
                      className="filter-set-contents accordion-collapse collapse"
                      id="collapseThree"
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
                              Collab
                            </label>
                          </li>
                          <li>
                            <label className="dropdown-item px-2 d-flex align-items-center">
                              <input
                                className="form-check-input m-0 me-1"
                                type="checkbox"
                              />
                              Promotion
                            </label>
                          </li>
                          <li>
                            <label className="dropdown-item px-2 d-flex align-items-center">
                              <input
                                className="form-check-input m-0 me-1"
                                type="checkbox"
                              />
                              VIP
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
                        Location
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
                                  src="assets/img/flags/us.svg"
                                  className="flex-shrink-0 rounded-circle"
                                  alt="img"
                                />
                              </span>
                              USA
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
                                  src="assets/img/flags/ae.svg"
                                  className="flex-shrink-0 rounded-circle"
                                  alt="img"
                                />
                              </span>
                              UAE
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
                                  src="assets/img/flags/de.svg"
                                  className="flex-shrink-0 rounded-circle"
                                  alt="img"
                                />
                              </span>
                              Germany
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
                                  src="assets/img/flags/fr.svg"
                                  className="flex-shrink-0 rounded-circle"
                                  alt="img"
                                />
                              </span>
                              France
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
                        data-bs-target="#collapseOne"
                        aria-expanded="false"
                        aria-controls="collapseOne"
                      >
                        Rating
                      </Link>
                    </div>
                    <div
                      className="filter-set-contents accordion-collapse collapse"
                      id="collapseOne"
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
                              <span className="rating">
                                <i className="ti ti-star-filled text-warning" />
                                <i className="ti ti-star-filled text-warning" />
                                <i className="ti ti-star-filled text-warning" />
                                <i className="ti ti-star-filled text-warning" />
                                <i className="ti ti-star-filled text-warning" />
                                <span className="ms-1">5.0</span>
                              </span>
                            </label>
                          </li>
                          <li>
                            <label className="dropdown-item px-2 d-flex align-items-center">
                              <input
                                className="form-check-input m-0 me-1"
                                type="checkbox"
                              />
                              <span className="rating">
                                <i className="ti ti-star-filled text-warning" />
                                <i className="ti ti-star-filled text-warning" />
                                <i className="ti ti-star-filled text-warning" />
                                <i className="ti ti-star-filled text-warning" />
                                <i className="ti ti-star-filled" />
                                <span className="ms-1">4.0</span>
                              </span>
                            </label>
                          </li>
                          <li>
                            <label className="dropdown-item px-2 d-flex align-items-center">
                              <input
                                className="form-check-input m-0 me-1"
                                type="checkbox"
                              />
                              <span className="rating">
                                <i className="ti ti-star-filled text-warning" />
                                <i className="ti ti-star-filled text-warning" />
                                <i className="ti ti-star-filled text-warning" />
                                <i className="ti ti-star-filled" />
                                <i className="ti ti-star-filled" />
                                <span className="ms-1">3.0</span>
                              </span>
                            </label>
                          </li>
                          <li>
                            <label className="dropdown-item px-2 d-flex align-items-center">
                              <input
                                className="form-check-input m-0 me-1"
                                type="checkbox"
                              />
                              <span className="rating">
                                <i className="ti ti-star-filled text-warning" />
                                <i className="ti ti-star-filled text-warning" />
                                <i className="ti ti-star-filled" />
                                <i className="ti ti-star-filled" />
                                <i className="ti ti-star-filled" />
                                <span className="ms-1">2.0</span>
                              </span>
                            </label>
                          </li>
                          <li>
                            <label className="dropdown-item px-2 d-flex align-items-center">
                              <input
                                className="form-check-input m-0 me-1"
                                type="checkbox"
                              />
                              <span className="rating">
                                <i className="ti ti-star-filled text-warning" />
                                <i className="ti ti-star-filled" />
                                <i className="ti ti-star-filled" />
                                <i className="ti ti-star-filled" />
                                <i className="ti ti-star-filled" />
                                <span className="ms-1">1.0</span>
                              </span>
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
                        Status
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
                              Active
                            </label>
                          </li>
                          <li>
                            <label className="dropdown-item px-2 d-flex align-items-center">
                              <input
                                className="form-check-input m-0 me-1"
                                type="checkbox"
                              />
                              Inactive
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
                    to={all_routes.companiesList}
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
          <div className="d-flex align-items-center shadow p-1 rounded border view-icons bg-white">
            <Link
              to={all_routes.companiesList}
              className="btn btn-sm p-1 border-0 fs-14"
            >
              <i className="ti ti-list-tree" />
            </Link>
            <Link
              to={all_routes.companiesGrid}
              className="flex-shrink-0 btn btn-sm p-1 border-0 ms-1 fs-14 active"
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
            Add Company
          </Link>
        </div>
      </div>
      {/* table header */}
      {/* Company Grid */}
      <div className="row">
        <div className="col-xxl-3 col-xl-4 col-md-6">
          <div className="card border shadow">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2 mb-3 border-bottom pb-3">
                <div className="d-flex align-items-center">
                  <Link
                    to={all_routes.companiesDetails}
                    className="avatar border rounded-circle flex-shrink-0 me-2"
                  >
                    <ImageWithBasePath
                      src="assets/img/icons/company-icon-01.svg"
                      className="w-auto h-auto"
                      alt="img"
                    />
                  </Link>
                  <div>
                    <h6 className="fs-14">
                      <Link to={all_routes.companiesDetails} className="fw-medium">
                        NovaWave LLC
                      </Link>
                    </h6>
                    <div className="set-star text-default">
                      <i className="ti ti-star-filled me-1 text-warning" />
                      4.2
                    </div>
                  </div>
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
                      <i className="ti ti-edit text-blue" /> Edit
                    </Link>
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_contact"
                    >
                      <i className="ti ti-trash" /> Delete
                    </Link>
                    <Link className="dropdown-item" to={all_routes.companiesDetails}>
                      <i className="ti ti-eye text-blue-light" /> Preview
                    </Link>
                  </div>
                </div>
              </div>
              <div className="d-block">
                <div className="d-flex flex-column mb-0">
                  <p className="text-default d-inline-flex align-items-center mb-2">
                    <i className="ti ti-mail text-dark me-1" />
                    robertson@example.com
                  </p>
                  <p className="text-default d-inline-flex align-items-center mb-2">
                    <i className="ti ti-phone text-dark me-1" />
                    +1 875455453
                  </p>
                  <p className="text-default d-inline-flex align-items-center">
                    <i className="ti ti-map-pin-pin text-dark me-1" />
                    Germany
                  </p>
                </div>
                <div className="d-flex align-items-center">
                  <span className="badge badge-tag badge-soft-success me-2">
                    Collab
                  </span>
                  <span className="badge badge-tag badge-soft-warning">
                    Rated
                  </span>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center flex-wrap row-gap-2 border-top pt-3 mt-3">
                <div className="d-flex align-items-center grid-social-links">
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle me-1"
                  >
                    <i className="ti ti-mail fs-14" />
                  </Link>
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle me-1"
                  >
                    <i className="ti ti-phone-check fs-14" />
                  </Link>
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle me-1"
                  >
                    <i className="ti ti-message-circle-share fs-14" />
                  </Link>
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle"
                  >
                    <i className="ti ti-brand-facebook fs-14" />
                  </Link>
                </div>
                <div>
                  <span className="avatar avatar-xs border-0">
                    <ImageWithBasePath
                      src="assets/img/profiles/avatar-01.jpg"
                      className="rounded-circle"
                      alt="img"
                    />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xxl-3 col-xl-4 col-md-6">
          <div className="card border shadow">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2 mb-3 border-bottom pb-3">
                <div className="d-flex align-items-center">
                  <Link
                    to={all_routes.companiesDetails}
                    className="avatar border rounded-circle flex-shrink-0 me-2"
                  >
                    <ImageWithBasePath
                      src="assets/img/icons/company-icon-02.svg"
                      className="w-auto h-auto"
                      alt="img"
                    />
                  </Link>
                  <div>
                    <h6 className="fs-14">
                      <Link to={all_routes.companiesDetails} className="fw-medium">
                        BlueSky Industries
                      </Link>
                    </h6>
                    <div className="set-star text-default">
                      <i className="ti ti-star-filled me-1 text-warning" />
                      5.0
                    </div>
                  </div>
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
                      <i className="ti ti-edit text-blue" /> Edit
                    </Link>
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_contact"
                    >
                      <i className="ti ti-trash" /> Delete
                    </Link>
                    <Link className="dropdown-item" to={all_routes.companiesDetails}>
                      <i className="ti ti-eye text-blue-light" /> Preview
                    </Link>
                  </div>
                </div>
              </div>
              <div className="d-block">
                <div className="d-flex flex-column mb-0">
                  <p className="text-default d-inline-flex align-items-center mb-2">
                    <i className="ti ti-mail text-dark me-1" />
                    sharon@example.com
                  </p>
                  <p className="text-default d-inline-flex align-items-center mb-2">
                    <i className="ti ti-phone text-dark me-1" />
                    +1 989757485
                  </p>
                  <p className="text-default d-inline-flex align-items-center">
                    <i className="ti ti-map-pin-pin text-dark me-1" />
                    USA
                  </p>
                </div>
                <div className="d-flex align-items-center">
                  <span className="badge badge-tag badge-soft-success me-2">
                    Collab
                  </span>
                  <span className="badge badge-tag badge-soft-warning">
                    Rated
                  </span>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center flex-wrap row-gap-2 border-top pt-3 mt-3">
                <div className="d-flex align-items-center grid-social-links">
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle me-1"
                  >
                    <i className="ti ti-mail fs-14" />
                  </Link>
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle me-1"
                  >
                    <i className="ti ti-phone-check fs-14" />
                  </Link>
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle me-1"
                  >
                    <i className="ti ti-message-circle-share fs-14" />
                  </Link>
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle"
                  >
                    <i className="ti ti-brand-facebook fs-14" />
                  </Link>
                </div>
                <div>
                  <span className="avatar avatar-xs border-0">
                    <ImageWithBasePath
                      src="assets/img/profiles/avatar-02.jpg"
                      className="rounded-circle"
                      alt="img"
                    />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xxl-3 col-xl-4 col-md-6">
          <div className="card border shadow">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2 mb-3 border-bottom pb-3">
                <div className="d-flex align-items-center">
                  <Link
                    to={all_routes.companiesDetails}
                    className="avatar border rounded-circle flex-shrink-0 me-2"
                  >
                    <ImageWithBasePath
                      src="assets/img/icons/company-icon-03.svg"
                      className="w-auto h-auto"
                      alt="img"
                    />
                  </Link>
                  <div>
                    <h6 className="fs-14">
                      <Link to={all_routes.companiesDetails} className="fw-medium">
                        Summit Peak
                      </Link>
                    </h6>
                    <div className="set-star text-default">
                      <i className="ti ti-star-filled me-1 text-warning" />
                      4.5
                    </div>
                  </div>
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
                      <i className="ti ti-edit text-blue" /> Edit
                    </Link>
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_contact"
                    >
                      <i className="ti ti-trash" /> Delete
                    </Link>
                    <Link className="dropdown-item" to={all_routes.companiesDetails}>
                      <i className="ti ti-eye text-blue-light" /> Preview
                    </Link>
                  </div>
                </div>
              </div>
              <div className="d-block">
                <div className="d-flex flex-column mb-0">
                  <p className="text-default d-inline-flex align-items-center mb-2">
                    <i className="ti ti-mail text-dark me-1" />
                    jessica13@gmail.com
                  </p>
                  <p className="text-default d-inline-flex align-items-center mb-2">
                    <i className="ti ti-phone text-dark me-1" />
                    +1 89316-83167
                  </p>
                  <p className="text-default d-inline-flex align-items-center">
                    <i className="ti ti-map-pin-pin text-dark me-1" />
                    India
                  </p>
                </div>
                <div className="d-flex align-items-center">
                  <span className="badge badge-tag badge-soft-success me-2">
                    Collab
                  </span>
                  <span className="badge badge-tag badge-soft-warning">
                    Rated
                  </span>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center flex-wrap row-gap-2 border-top pt-3 mt-3">
                <div className="d-flex align-items-center grid-social-links">
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle me-1"
                  >
                    <i className="ti ti-mail fs-14" />
                  </Link>
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle me-1"
                  >
                    <i className="ti ti-phone-check fs-14" />
                  </Link>
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle me-1"
                  >
                    <i className="ti ti-message-circle-share fs-14" />
                  </Link>
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle"
                  >
                    <i className="ti ti-brand-facebook fs-14" />
                  </Link>
                </div>
                <div>
                  <span className="avatar avatar-xs border-0">
                    <ImageWithBasePath
                      src="assets/img/profiles/avatar-03.jpg"
                      className="rounded-circle"
                      alt="img"
                    />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xxl-3 col-xl-4 col-md-6">
          <div className="card border shadow">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2 mb-3 border-bottom pb-3">
                <div className="d-flex align-items-center">
                  <Link
                    to={all_routes.companiesDetails}
                    className="avatar border rounded-circle flex-shrink-0 me-2"
                  >
                    <ImageWithBasePath
                      src="assets/img/icons/company-icon-04.svg"
                      className="w-auto h-auto"
                      alt="img"
                    />
                  </Link>
                  <div>
                    <h6 className="fs-14">
                      <Link to={all_routes.companiesDetails} className="fw-medium">
                        Summit Peak
                      </Link>
                    </h6>
                    <div className="set-star text-default">
                      <i className="ti ti-star-filled me-1 text-warning" />
                      4.5
                    </div>
                  </div>
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
                      <i className="ti ti-edit text-blue" /> Edit
                    </Link>
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_contact"
                    >
                      <i className="ti ti-trash" /> Delete
                    </Link>
                    <Link className="dropdown-item" to={all_routes.companiesDetails}>
                      <i className="ti ti-eye text-blue-light" /> Preview
                    </Link>
                  </div>
                </div>
              </div>
              <div className="d-block">
                <div className="d-flex flex-column mb-0">
                  <p className="text-default d-inline-flex align-items-center mb-2">
                    <i className="ti ti-mail text-dark me-1" />
                    jessica13@gmail.com
                  </p>
                  <p className="text-default d-inline-flex align-items-center mb-2">
                    <i className="ti ti-phone text-dark me-1" />
                    +1 89316-83167
                  </p>
                  <p className="text-default d-inline-flex align-items-center">
                    <i className="ti ti-map-pin-pin text-dark me-1" />
                    India
                  </p>
                </div>
                <div className="d-flex align-items-center">
                  <span className="badge badge-tag badge-soft-success me-2">
                    Collab
                  </span>
                  <span className="badge badge-tag badge-soft-warning">
                    Rated
                  </span>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center flex-wrap row-gap-2 border-top pt-3 mt-3">
                <div className="d-flex align-items-center grid-social-links">
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle me-1"
                  >
                    <i className="ti ti-mail fs-14" />
                  </Link>
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle me-1"
                  >
                    <i className="ti ti-phone-check fs-14" />
                  </Link>
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle me-1"
                  >
                    <i className="ti ti-message-circle-share fs-14" />
                  </Link>
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle"
                  >
                    <i className="ti ti-brand-facebook fs-14" />
                  </Link>
                </div>
                <div>
                  <span className="avatar avatar-xs border-0">
                    <ImageWithBasePath
                      src="assets/img/profiles/avatar-04.jpg"
                      className="rounded-circle"
                      alt="img"
                    />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xxl-3 col-xl-4 col-md-6">
          <div className="card border shadow">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2 mb-3 border-bottom pb-3">
                <div className="d-flex align-items-center">
                  <Link
                    to={all_routes.companiesDetails}
                    className="avatar border rounded-circle flex-shrink-0 me-2"
                  >
                    <ImageWithBasePath
                      src="assets/img/icons/company-icon-05.svg"
                      className="w-auto h-auto"
                      alt="img"
                    />
                  </Link>
                  <div>
                    <h6 className="fs-14">
                      <Link to={all_routes.companiesDetails} className="fw-medium">
                        RiverStone Ventur
                      </Link>
                    </h6>
                    <div className="set-star text-default">
                      <i className="ti ti-star-filled me-1 text-warning" />
                      4.7
                    </div>
                  </div>
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
                      className="dropdown-item "
                      to="#"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#offcanvas_edit"
                    >
                      <i className="ti ti-edit text-blue" /> Edit
                    </Link>
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_contact"
                    >
                      <i className="ti ti-trash" /> Delete
                    </Link>
                    <Link className="dropdown-item" to={all_routes.companiesDetails}>
                      <i className="ti ti-eye text-blue-light" /> Preview
                    </Link>
                  </div>
                </div>
              </div>
              <div className="d-block">
                <div className="d-flex flex-column mb-0">
                  <p className="text-default d-inline-flex align-items-center mb-2">
                    <i className="ti ti-mail text-dark me-1" />
                    carolTho3@gmail.com
                  </p>
                  <p className="text-default d-inline-flex align-items-center mb-2">
                    <i className="ti ti-phone text-dark me-1" />
                    +1 84295-01629
                  </p>
                  <p className="text-default d-inline-flex align-items-center">
                    <i className="ti ti-map-pin-pin text-dark me-1" />
                    China
                  </p>
                </div>
                <div className="d-flex align-items-center">
                  <span className="badge badge-tag badge-soft-success me-2">
                    Collab
                  </span>
                  <span className="badge badge-tag badge-soft-warning">
                    Rated
                  </span>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center flex-wrap row-gap-2 border-top pt-3 mt-3">
                <div className="d-flex align-items-center grid-social-links">
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle me-1"
                  >
                    <i className="ti ti-mail fs-14" />
                  </Link>
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle me-1"
                  >
                    <i className="ti ti-phone-check fs-14" />
                  </Link>
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle me-1"
                  >
                    <i className="ti ti-message-circle-share fs-14" />
                  </Link>
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle"
                  >
                    <i className="ti ti-brand-facebook fs-14" />
                  </Link>
                </div>
                <div>
                  <span className="avatar avatar-xs border-0">
                    <ImageWithBasePath
                      src="assets/img/profiles/avatar-06.jpg"
                      className="rounded-circle"
                      alt="img"
                    />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xxl-3 col-xl-4 col-md-6">
          <div className="card border shadow">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2 mb-3 border-bottom pb-3">
                <div className="d-flex align-items-center">
                  <Link
                    to={all_routes.companiesDetails}
                    className="avatar border rounded-circle flex-shrink-0 me-2"
                  >
                    <ImageWithBasePath
                      src="assets/img/icons/company-icon-06.svg"
                      className="w-auto h-auto"
                      alt="img"
                    />
                  </Link>
                  <div>
                    <h6 className="fs-14">
                      <Link to={all_routes.companiesDetails} className="fw-medium">
                        Bright Bridge Grp
                      </Link>
                    </h6>
                    <div className="set-star text-default">
                      <i className="ti ti-star-filled me-1 text-warning" />
                      5.0
                    </div>
                  </div>
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
                      className="dropdown-item "
                      to="#"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#offcanvas_edit"
                    >
                      <i className="ti ti-edit text-blue" /> Edit
                    </Link>
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_contact"
                    >
                      <i className="ti ti-trash" /> Delete
                    </Link>
                    <Link className="dropdown-item" to={all_routes.companiesDetails}>
                      <i className="ti ti-eye text-blue-light" /> Preview
                    </Link>
                  </div>
                </div>
              </div>
              <div className="d-block">
                <div className="d-flex flex-column mb-0">
                  <p className="text-default d-inline-flex align-items-center mb-2">
                    <i className="ti ti-mail text-dark me-1" />
                    dawnmercha@gmail.com
                  </p>
                  <p className="text-default d-inline-flex align-items-center mb-2">
                    <i className="ti ti-phone text-dark me-1" />
                    +1 79253-01692
                  </p>
                  <p className="text-default d-inline-flex align-items-center">
                    <i className="ti ti-map-pin-pin text-dark me-1" />
                    Martin Lewis
                  </p>
                </div>
                <div className="d-flex align-items-center">
                  <span className="badge badge-tag badge-soft-success me-2">
                    Collab
                  </span>
                  <span className="badge badge-tag badge-soft-warning">
                    Rated
                  </span>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center flex-wrap row-gap-2 border-top pt-3 mt-3">
                <div className="d-flex align-items-center grid-social-links">
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle me-1"
                  >
                    <i className="ti ti-mail fs-14" />
                  </Link>
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle me-1"
                  >
                    <i className="ti ti-phone-check fs-14" />
                  </Link>
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle me-1"
                  >
                    <i className="ti ti-message-circle-share fs-14" />
                  </Link>
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle"
                  >
                    <i className="ti ti-brand-facebook fs-14" />
                  </Link>
                </div>
                <div>
                  <span className="avatar avatar-xs border-0">
                    <ImageWithBasePath
                      src="assets/img/profiles/avatar-07.jpg"
                      className="rounded-circle"
                      alt="img"
                    />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xxl-3 col-xl-4 col-md-6">
          <div className="card border shadow">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2 mb-3 border-bottom pb-3">
                <div className="d-flex align-items-center">
                  <Link
                    to={all_routes.companiesDetails}
                    className="avatar border rounded-circle flex-shrink-0 me-2"
                  >
                    <ImageWithBasePath
                      src="assets/img/icons/company-icon-07.svg"
                      className="w-auto h-auto"
                      alt="img"
                    />
                  </Link>
                  <div>
                    <h6 className="fs-14">
                      <Link to={all_routes.companiesDetails} className="fw-medium">
                        CoastalStar Co.
                      </Link>
                    </h6>
                    <div className="set-star text-default">
                      <i className="ti ti-star-filled me-1 text-warning" />
                      3.1
                    </div>
                  </div>
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
                      className="dropdown-item "
                      to="#"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#offcanvas_edit"
                    >
                      <i className="ti ti-edit text-blue" /> Edit
                    </Link>
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_contact"
                    >
                      <i className="ti ti-trash" /> Delete
                    </Link>
                    <Link className="dropdown-item" to={all_routes.companiesDetails}>
                      <i className="ti ti-eye text-blue-light" /> Preview
                    </Link>
                  </div>
                </div>
              </div>
              <div className="d-block">
                <div className="d-flex flex-column mb-0">
                  <p className="text-default d-inline-flex align-items-center mb-2">
                    <i className="ti ti-mail text-dark me-1" />
                    rachel@gmail.com
                  </p>
                  <p className="text-default d-inline-flex align-items-center mb-2">
                    <i className="ti ti-phone text-dark me-1" />
                    +1 52804-89153
                  </p>
                  <p className="text-default d-inline-flex align-items-center">
                    <i className="ti ti-map-pin-pin text-dark me-1" />
                    Indonesia
                  </p>
                </div>
                <div className="d-flex align-items-center">
                  <span className="badge badge-tag badge-soft-success me-2">
                    Collab
                  </span>
                  <span className="badge badge-tag badge-soft-warning">
                    Rated
                  </span>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center flex-wrap row-gap-2 border-top pt-3 mt-3">
                <div className="d-flex align-items-center grid-social-links">
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle me-1"
                  >
                    <i className="ti ti-mail fs-14" />
                  </Link>
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle me-1"
                  >
                    <i className="ti ti-phone-check fs-14" />
                  </Link>
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle me-1"
                  >
                    <i className="ti ti-message-circle-share fs-14" />
                  </Link>
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle"
                  >
                    <i className="ti ti-brand-facebook fs-14" />
                  </Link>
                </div>
                <div>
                  <span className="avatar avatar-xs border-0">
                    <ImageWithBasePath
                      src="assets/img/profiles/avatar-08.jpg"
                      className="rounded-circle"
                      alt="img"
                    />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xxl-3 col-xl-4 col-md-6">
          <div className="card border shadow">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2 mb-3 border-bottom pb-3">
                <div className="d-flex align-items-center">
                  <Link
                    to={all_routes.companiesDetails}
                    className="avatar border rounded-circle flex-shrink-0 me-2"
                  >
                    <ImageWithBasePath
                      src="assets/img/icons/company-icon-08.svg"
                      className="w-auto h-auto"
                      alt="img"
                    />
                  </Link>
                  <div>
                    <h6 className="fs-14">
                      <Link to={all_routes.companiesDetails} className="fw-medium">
                        HarborView
                      </Link>
                    </h6>
                    <div className="set-star text-default">
                      <i className="ti ti-star-filled me-1 text-warning" />
                      5.0
                    </div>
                  </div>
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
                      className="dropdown-item "
                      to="#"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#offcanvas_edit"
                    >
                      <i className="ti ti-edit text-blue" /> Edit
                    </Link>
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_contact"
                    >
                      <i className="ti ti-trash" /> Delete
                    </Link>
                    <Link className="dropdown-item" to={all_routes.companiesDetails}>
                      <i className="ti ti-eye text-blue-light" /> Preview
                    </Link>
                  </div>
                </div>
              </div>
              <div className="d-block">
                <div className="d-flex flex-column mb-0">
                  <p className="text-default d-inline-flex align-items-center mb-2">
                    <i className="ti ti-mail text-dark me-1" />
                    jonelle@gmail.com
                  </p>
                  <p className="text-default d-inline-flex align-items-center mb-2">
                    <i className="ti ti-phone text-dark me-1" />
                    +1 60364-91683
                  </p>
                  <p className="text-default d-inline-flex align-items-center">
                    <i className="ti ti-map-pin-pin text-dark me-1" />
                    Cuba
                  </p>
                </div>
                <div className="d-flex align-items-center">
                  <span className="badge badge-tag badge-soft-success me-2">
                    Collab
                  </span>
                  <span className="badge badge-tag badge-soft-warning">
                    Rated
                  </span>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center flex-wrap row-gap-2 border-top pt-3 mt-3">
                <div className="d-flex align-items-center grid-social-links">
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle me-1"
                  >
                    <i className="ti ti-mail fs-14" />
                  </Link>
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle me-1"
                  >
                    <i className="ti ti-phone-check fs-14" />
                  </Link>
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle me-1"
                  >
                    <i className="ti ti-message-circle-share fs-14" />
                  </Link>
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle"
                  >
                    <i className="ti ti-brand-facebook fs-14" />
                  </Link>
                </div>
                <div>
                  <span className="avatar avatar-xs border-0">
                    <ImageWithBasePath
                      src="assets/img/profiles/avatar-09.jpg"
                      className="rounded-circle"
                      alt="img"
                    />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xxl-3 col-xl-4 col-md-6">
          <div className="card border shadow">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2 mb-3 border-bottom pb-3">
                <div className="d-flex align-items-center">
                  <Link
                    to={all_routes.companiesDetails}
                    className="avatar border rounded-circle flex-shrink-0 me-2"
                  >
                    <ImageWithBasePath
                      src="assets/img/icons/company-icon-09.svg"
                      className="w-auto h-auto"
                      alt="img"
                    />
                  </Link>
                  <div>
                    <h6 className="fs-14">
                      <Link to={all_routes.companiesDetails} className="fw-medium">
                        Golden Gate Ltd
                      </Link>
                    </h6>
                    <div className="set-star text-default">
                      <i className="ti ti-star-filled me-1 text-warning" />
                      2.7
                    </div>
                  </div>
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
                      className="dropdown-item "
                      to="#"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#offcanvas_edit"
                    >
                      <i className="ti ti-edit text-blue" /> Edit
                    </Link>
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_contact"
                    >
                      <i className="ti ti-trash" /> Delete
                    </Link>
                    <Link className="dropdown-item" to={all_routes.companiesDetails}>
                      <i className="ti ti-eye text-blue-light" /> Preview
                    </Link>
                  </div>
                </div>
              </div>
              <div className="d-block">
                <div className="d-flex flex-column mb-0">
                  <p className="text-default d-inline-flex align-items-center mb-2">
                    <i className="ti ti-mail text-dark me-1" />
                    jonathan@gmail.com
                  </p>
                  <p className="text-default d-inline-flex align-items-center mb-2">
                    <i className="ti ti-phone text-dark me-1" />
                    +1 69023-95179
                  </p>
                  <p className="text-default d-inline-flex align-items-center">
                    <i className="ti ti-map-pin-pin text-dark me-1" />
                    Isreal
                  </p>
                </div>
                <div className="d-flex align-items-center">
                  <span className="badge badge-tag badge-soft-success me-2">
                    Collab
                  </span>
                  <span className="badge badge-tag badge-soft-warning">
                    Rated
                  </span>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center flex-wrap row-gap-2 border-top pt-3 mt-3">
                <div className="d-flex align-items-center grid-social-links">
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle me-1"
                  >
                    <i className="ti ti-mail fs-14" />
                  </Link>
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle me-1"
                  >
                    <i className="ti ti-phone-check fs-14" />
                  </Link>
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle me-1"
                  >
                    <i className="ti ti-message-circle-share fs-14" />
                  </Link>
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle"
                  >
                    <i className="ti ti-brand-facebook fs-14" />
                  </Link>
                </div>
                <div>
                  <span className="avatar avatar-xs border-0">
                    <ImageWithBasePath
                      src="assets/img/profiles/avatar-10.jpg"
                      className="rounded-circle"
                      alt="img"
                    />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xxl-3 col-xl-4 col-md-6">
          <div className="card border shadow">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2 mb-3 border-bottom pb-3">
                <div className="d-flex align-items-center">
                  <Link
                    to={all_routes.companiesDetails}
                    className="avatar border rounded-circle flex-shrink-0 me-2"
                  >
                    <ImageWithBasePath
                      src="assets/img/icons/company-icon-10.svg"
                      className="w-auto h-auto"
                      alt="img"
                    />
                  </Link>
                  <div>
                    <h6 className="fs-14">
                      <Link to={all_routes.companiesDetails} className="fw-medium">
                        Redwood Inc
                      </Link>
                    </h6>
                    <div className="set-star text-default">
                      <i className="ti ti-star-filled me-1 text-warning" />
                      3.0
                    </div>
                  </div>
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
                      className="dropdown-item "
                      to="#"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#offcanvas_edit"
                    >
                      <i className="ti ti-edit text-blue" /> Edit
                    </Link>
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_contact"
                    >
                      <i className="ti ti-trash" /> Delete
                    </Link>
                    <Link className="dropdown-item" to={all_routes.companiesDetails}>
                      <i className="ti ti-eye text-blue-light" /> Preview
                    </Link>
                  </div>
                </div>
              </div>
              <div className="d-block">
                <div className="d-flex flex-column mb-0">
                  <p className="text-default d-inline-flex align-items-center mb-2">
                    <i className="ti ti-mail text-dark me-1" />
                    brook@gmail.com
                  </p>
                  <p className="text-default d-inline-flex align-items-center mb-2">
                    <i className="ti ti-phone text-dark me-1" />
                    +1 49815-90142
                  </p>
                  <p className="text-default d-inline-flex align-items-center">
                    <i className="ti ti-map-pin-pin text-dark me-1" />
                    Colombia
                  </p>
                </div>
                <div className="d-flex align-items-center">
                  <span className="badge badge-tag badge-soft-success me-2">
                    Collab
                  </span>
                  <span className="badge badge-tag badge-soft-warning">
                    Rated
                  </span>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center flex-wrap row-gap-2 border-top pt-3 mt-3">
                <div className="d-flex align-items-center grid-social-links">
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle me-1"
                  >
                    <i className="ti ti-mail fs-14" />
                  </Link>
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle me-1"
                  >
                    <i className="ti ti-phone-check fs-14" />
                  </Link>
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle me-1"
                  >
                    <i className="ti ti-message-circle-share fs-14" />
                  </Link>
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle"
                  >
                    <i className="ti ti-brand-facebook fs-14" />
                  </Link>
                </div>
                <div>
                  <span className="avatar avatar-xs border-0">
                    <ImageWithBasePath
                      src="assets/img/profiles/avatar-11.jpg"
                      className="rounded-circle"
                      alt="img"
                    />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xxl-3 col-xl-4 col-md-6">
          <div className="card border shadow">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2 mb-3 border-bottom pb-3">
                <div className="d-flex align-items-center">
                  <Link
                    to={all_routes.companiesDetails}
                    className="avatar border rounded-circle flex-shrink-0 me-2"
                  >
                    <ImageWithBasePath
                      src="assets/img/icons/company-icon-03.svg"
                      className="w-auto h-auto"
                      alt="img"
                    />
                  </Link>
                  <div>
                    <h6 className="fs-14">
                      <Link to={all_routes.companiesDetails} className="fw-medium">
                        SilverHawk
                      </Link>
                    </h6>
                    <div className="set-star text-default">
                      <i className="ti ti-star-filled me-1 text-warning" />
                      3.0
                    </div>
                  </div>
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
                      className="dropdown-item "
                      to="#"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#offcanvas_edit"
                    >
                      <i className="ti ti-edit text-blue" /> Edit
                    </Link>
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_contact"
                    >
                      <i className="ti ti-trash" /> Delete
                    </Link>
                    <Link className="dropdown-item" to={all_routes.companiesDetails}>
                      <i className="ti ti-eye text-blue-light" /> Preview
                    </Link>
                  </div>
                </div>
              </div>
              <div className="d-block">
                <div className="d-flex flex-column mb-0">
                  <p className="text-default d-inline-flex align-items-center mb-2">
                    <i className="ti ti-mail text-dark me-1" />
                    vaughan12@example.com
                  </p>
                  <p className="text-default d-inline-flex align-items-center mb-2">
                    <i className="ti ti-phone text-dark me-1" />
                    +1 546555455
                  </p>
                  <p className="text-default d-inline-flex align-items-center">
                    <i className="ti ti-map-pin-pin text-dark me-1" />
                    Canada
                  </p>
                </div>
                <div className="d-flex align-items-center">
                  <span className="badge badge-tag badge-soft-success me-2">
                    Collab
                  </span>
                  <span className="badge badge-tag badge-soft-warning">
                    Rated
                  </span>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center flex-wrap row-gap-2 border-top pt-3 mt-3">
                <div className="d-flex align-items-center grid-social-links">
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle me-1"
                  >
                    <i className="ti ti-mail fs-14" />
                  </Link>
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle me-1"
                  >
                    <i className="ti ti-phone-check fs-14" />
                  </Link>
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle me-1"
                  >
                    <i className="ti ti-message-circle-share fs-14" />
                  </Link>
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle"
                  >
                    <i className="ti ti-brand-facebook fs-14" />
                  </Link>
                </div>
                <div>
                  <span className="avatar avatar-xs border-0">
                    <ImageWithBasePath
                      src="assets/img/profiles/avatar-12.jpg"
                      className="rounded-circle"
                      alt="img"
                    />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xxl-3 col-xl-4 col-md-6">
          <div className="card border shadow">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2 mb-3 border-bottom pb-3">
                <div className="d-flex align-items-center">
                  <Link
                    to={all_routes.companiesDetails}
                    className="avatar border rounded-circle flex-shrink-0 me-2"
                  >
                    <ImageWithBasePath
                      src="assets/img/icons/company-icon-04.svg"
                      className="w-auto h-auto"
                      alt="img"
                    />
                  </Link>
                  <div>
                    <h6 className="fs-14">
                      <Link to={all_routes.companiesDetails} className="fw-medium">
                        SummitPeak
                      </Link>
                    </h6>
                    <div className="set-star text-default">
                      <i className="ti ti-star-filled me-1 text-warning" />
                      3.0
                    </div>
                  </div>
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
                      className="dropdown-item "
                      to="#"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#offcanvas_edit"
                    >
                      <i className="ti ti-edit text-blue" /> Edit
                    </Link>
                    <Link
                      className="dropdown-item"
                      to="#"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_contact"
                    >
                      <i className="ti ti-trash" /> Delete
                    </Link>
                    <Link className="dropdown-item" to={all_routes.companiesDetails}>
                      <i className="ti ti-eye text-blue-light" /> Preview
                    </Link>
                  </div>
                </div>
              </div>
              <div className="d-block">
                <div className="d-flex flex-column mb-0">
                  <p className="text-default d-inline-flex align-items-center mb-2">
                    <i className="ti ti-mail text-dark me-1" />
                    jessica13@example.com
                  </p>
                  <p className="text-default d-inline-flex align-items-center mb-2">
                    <i className="ti ti-phone text-dark me-1" />
                    +1 454478787
                  </p>
                  <p className="text-default d-inline-flex align-items-center">
                    <i className="ti ti-map-pin-pin text-dark me-1" />
                    India
                  </p>
                </div>
                <div className="d-flex align-items-center">
                  <span className="badge badge-tag badge-soft-success me-2">
                    Collab
                  </span>
                  <span className="badge badge-tag badge-soft-warning">
                    Rated
                  </span>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center flex-wrap row-gap-2 border-top pt-3 mt-3">
                <div className="d-flex align-items-center grid-social-links">
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle me-1"
                  >
                    <i className="ti ti-mail fs-14" />
                  </Link>
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle me-1"
                  >
                    <i className="ti ti-phone-check fs-14" />
                  </Link>
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle me-1"
                  >
                    <i className="ti ti-message-circle-share fs-14" />
                  </Link>
                  <Link
                    to="#"
                    className="avatar avatar-xs text-dark rounded-circle"
                  >
                    <i className="ti ti-brand-facebook fs-14" />
                  </Link>
                </div>
                <div>
                  <span className="avatar avatar-xs border-0">
                    <ImageWithBasePath
                      src="assets/img/profiles/avatar-13.jpg"
                      className="rounded-circle"
                      alt="img"
                    />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Company Grid */}
      <div className="load-btn text-center">
        <Link to="#" className="btn btn-primary">
          <i className="ti ti-loader me-1" /> Load More
        </Link>
      </div>
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
    <ModalCompanies/>
</>

  )
}

export default CompaniesGrid