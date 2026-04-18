import { Link } from "react-router";
import ImageWithBasePath from "../../../../components/imageWithBasePath";
import { all_routes } from "../../../../routes/all_routes";
import Footer from "../../../../components/footer/footer";
import PageHeader from "../../../../components/page-header/pageHeader";
import ModalContacts from "./modals/modalContacts";

const Contacts = () => {
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
            title="Contacts"
            badgeCount={125}
            showModuleTile={false}
            showExport={false}
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
                            data-bs-toggle="collapse"
                            data-bs-target="#collapseTwo"
                            aria-expanded="true"
                            aria-controls="collapseTwo"
                          >
                            Name
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
                            data-bs-target="#owner"
                            aria-expanded="false"
                            aria-controls="owner"
                          >
                            Owner
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
                                  Hendry Milner
                                </label>
                              </li>
                              <li className="mb-1">
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Guilory Berggren
                                </label>
                              </li>
                              <li className="mb-1">
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Jami Carlile
                                </label>
                              </li>
                              <li className="mb-1">
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Theresa Nelson
                                </label>
                              </li>
                              <li className="mb-1">
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Smith Cooper
                                </label>
                              </li>
                              <li>
                                <Link
                                  to="#"
                                  className="link-primary text-decoration-underline p-2 pt-0 d-flex"
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
                        to={all_routes.contactList}
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
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search"
                />
              </div>
            </div>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <div className="d-flex align-items-center shadow p-1 rounded border bg-white view-icons">
                <Link
                  to={all_routes.contactList}
                  className="btn btn-sm p-1 border-0 fs-14"
                >
                  <i className="ti ti-list-tree" />
                </Link>
                <Link
                  to={all_routes.contactGrid}
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
                Add Contacts
              </Link>
            </div>
          </div>
          {/* table header */}
          {/* Contact Grid */}
          <div className="row">
            <div className="col-xxl-3 col-xl-4 col-md-6">
              <div className="card border shadow">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center">
                      <Link
                        to={all_routes.contactDetails}
                        className="avatar avatar-md flex-shrink-0 me-2"
                      >
                        <ImageWithBasePath
                          src="assets/img/profiles/avatar-19.jpg"
                          alt="img"
                          className="rounded-circle"
                        />
                      </Link>
                      <div>
                        <h6 className="fs-14">
                          <Link
                            to={all_routes.contactDetails}
                            className="fw-medium"
                          >
                            Darlee Robertson
                          </Link>
                        </h6>
                        <p className="text-default mb-0">Facility Manager</p>
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
                        <Link
                          className="dropdown-item"
                          to={all_routes.contactDetails}
                        >
                          <i className="ti ti-eye text-blue-light" /> Preview
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="d-block">
                    <div className="d-flex flex-column">
                      <p className="text-default d-inline-flex align-items-center mb-2">
                        <i className="ti ti-mail text-dark me-1" />
                        robertson@example.com
                      </p>
                      <p className="text-default d-inline-flex align-items-center mb-2">
                        <i className="ti ti-phone text-dark me-1" />
                        1234567890
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
                        VIP
                      </span>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
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
                    <div className="d-flex align-items-center">
                      <Link
                        to="#"
                        className="avatar avatar-xs"
                      >
                        <ImageWithBasePath
                          src="assets/img/profiles/avatar-12.jpg"
                          alt="img"
                          className="rounded-circle"
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-3 col-xl-4 col-md-6">
              <div className="card border shadow">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center">
                      <Link
                        to={all_routes.contactDetails}
                        className="avatar avatar-md flex-shrink-0 me-2"
                      >
                        <ImageWithBasePath
                          src="assets/img/profiles/avatar-20.jpg"
                          alt="img"
                          className="rounded-circle"
                        />
                      </Link>
                      <div>
                        <h6 className="fs-14">
                          <Link
                            to={all_routes.contactDetails}
                            className="fw-medium"
                          >
                            Sharon Roy
                          </Link>
                        </h6>
                        <p className="text-default mb-0">Installer</p>
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
                        <Link
                          className="dropdown-item"
                          to={all_routes.contactDetails}
                        >
                          <i className="ti ti-eye text-blue-light" /> Preview
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="d-block">
                    <div className="d-flex flex-column">
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
                        +1 989757485
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
                  <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
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
                    <div className="d-flex align-items-center">
                      <Link
                        to="#"
                        className="avatar avatar-xs"
                      >
                        <ImageWithBasePath
                          src="assets/img/profiles/avatar-08.jpg"
                          alt="img"
                          className="rounded-circle"
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-3 col-xl-4 col-md-6">
              <div className="card border shadow">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center">
                      <Link
                        to={all_routes.contactDetails}
                        className="avatar avatar-md flex-shrink-0 me-2"
                      >
                        <ImageWithBasePath
                          src="assets/img/profiles/avatar-21.jpg"
                          alt="img"
                          className="rounded-circle"
                        />
                      </Link>
                      <div>
                        <h6 className="fs-14">
                          <Link
                            to={all_routes.contactDetails}
                            className="fw-medium"
                          >
                            Vaughan Lewis
                          </Link>
                        </h6>
                        <p className="text-default mb-0">Senior Manager</p>
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
                        <Link
                          className="dropdown-item"
                          to={all_routes.contactDetails}
                        >
                          <i className="ti ti-eye text-blue-light" /> Preview
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="d-block">
                    <div className="d-flex flex-column">
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
                  <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
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
                    <div className="d-flex align-items-center">
                      <Link
                        to="#"
                        className="avatar avatar-xs"
                      >
                        <ImageWithBasePath
                          src="assets/img/profiles/avatar-09.jpg"
                          alt="img"
                          className="rounded-circle"
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-3 col-xl-4 col-md-6">
              <div className="card border shadow">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center">
                      <Link
                        to={all_routes.contactDetails}
                        className="avatar avatar-md flex-shrink-0 me-2"
                      >
                        <ImageWithBasePath
                          src="assets/img/profiles/avatar-23.jpg"
                          alt="img"
                          className="rounded-circle"
                        />
                      </Link>
                      <div>
                        <h6 className="fs-14">
                          <Link
                            to={all_routes.contactDetails}
                            className="fw-medium"
                          >
                            Jessica Louise
                          </Link>
                        </h6>
                        <p className="text-default mb-0">Test Engineer</p>
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
                        <Link
                          className="dropdown-item"
                          to={all_routes.contactDetails}
                        >
                          <i className="ti ti-eye text-blue-light" /> Preview
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="d-block">
                    <div className="d-flex flex-column">
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
                  <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
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
                    <div className="d-flex align-items-center">
                      <Link
                        to="#"
                        className="avatar avatar-xs"
                      >
                        <ImageWithBasePath
                          src="assets/img/profiles/avatar-10.jpg"
                          alt="img"
                          className="rounded-circle"
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-3 col-xl-4 col-md-6">
              <div className="card border shadow">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center">
                      <Link
                        to={all_routes.contactDetails}
                        className="avatar avatar-md flex-shrink-0 me-2"
                      >
                        <ImageWithBasePath
                          src="assets/img/profiles/avatar-16.jpg"
                          alt="img"
                          className="rounded-circle"
                        />
                      </Link>
                      <div>
                        <h6 className="fs-14">
                          <Link
                            to={all_routes.contactDetails}
                            className="fw-medium"
                          >
                            Carol Thomas
                          </Link>
                        </h6>
                        <p className="text-default mb-0">UI /UX Designer</p>
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
                        <Link
                          className="dropdown-item"
                          to={all_routes.contactDetails}
                        >
                          <i className="ti ti-eye text-blue-light" /> Preview
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="d-block">
                    <div className="d-flex flex-column">
                      <p className="text-default d-inline-flex align-items-center mb-2">
                        <i className="ti ti-mail text-dark me-1" />
                        caroltho3@example.com
                      </p>
                      <p className="text-default d-inline-flex align-items-center mb-2">
                        <i className="ti ti-phone text-dark me-1" />
                        +1 124547845
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
                  <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
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
                    <div className="d-flex align-items-center">
                      <Link
                        to="#"
                        className="avatar avatar-xs"
                      >
                        <ImageWithBasePath
                          src="assets/img/profiles/avatar-01.jpg"
                          alt="img"
                          className="rounded-circle"
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-3 col-xl-4 col-md-6">
              <div className="card border shadow">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center">
                      <Link
                        to={all_routes.contactDetails}
                        className="avatar avatar-md flex-shrink-0 me-2"
                      >
                        <ImageWithBasePath
                          src="assets/img/profiles/avatar-22.jpg"
                          alt="img"
                          className="rounded-circle"
                        />
                      </Link>
                      <div>
                        <h6 className="fs-14">
                          <Link
                            to={all_routes.contactDetails}
                            className="fw-medium"
                          >
                            Dawn Mercha
                          </Link>
                        </h6>
                        <p className="text-default mb-0">Technician</p>
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
                        <Link
                          className="dropdown-item"
                          to={all_routes.contactDetails}
                        >
                          <i className="ti ti-eye text-blue-light" /> Preview
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="d-block">
                    <div className="d-flex flex-column">
                      <p className="text-default d-inline-flex align-items-center mb-2">
                        <i className="ti ti-mail text-dark me-1" />
                        dawnmercha@example.com
                      </p>
                      <p className="text-default d-inline-flex align-items-center mb-2">
                        <i className="ti ti-phone text-dark me-1" />
                        +1 478845447
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
                  <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
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
                    <div className="d-flex align-items-center">
                      <Link
                        to="#"
                        className="avatar avatar-xs"
                      >
                        <ImageWithBasePath
                          src="assets/img/profiles/avatar-02.jpg"
                          alt="img"
                          className="rounded-circle"
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-3 col-xl-4 col-md-6">
              <div className="card border shadow">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center">
                      <Link
                        to={all_routes.contactDetails}
                        className="avatar avatar-md flex-shrink-0 me-2"
                      >
                        <ImageWithBasePath
                          src="assets/img/profiles/avatar-24.jpg"
                          alt="img"
                          className="rounded-circle"
                        />
                      </Link>
                      <div>
                        <h6 className="fs-14">
                          <Link
                            to={all_routes.contactDetails}
                            className="fw-medium"
                          >
                            Rachel Hampton
                          </Link>
                        </h6>
                        <p className="text-default mb-0">Software Developer</p>
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
                        <Link
                          className="dropdown-item"
                          to={all_routes.contactDetails}
                        >
                          <i className="ti ti-eye text-blue-light" /> Preview
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="d-block">
                    <div className="d-flex flex-column">
                      <p className="text-default d-inline-flex align-items-center mb-2">
                        <i className="ti ti-mail text-dark me-1" />
                        rachel@example.com
                      </p>
                      <p className="text-default d-inline-flex align-items-center mb-2">
                        <i className="ti ti-phone text-dark me-1" />
                        +1 215544845
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
                  <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
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
                    <div className="d-flex align-items-center">
                      <Link
                        to="#"
                        className="avatar avatar-xs"
                      >
                        <ImageWithBasePath
                          src="assets/img/profiles/avatar-03.jpg"
                          alt="img"
                          className="rounded-circle"
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-3 col-xl-4 col-md-6">
              <div className="card border shadow">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center">
                      <Link
                        to={all_routes.contactDetails}
                        className="avatar avatar-md flex-shrink-0 me-2"
                      >
                        <ImageWithBasePath
                          src="assets/img/profiles/avatar-25.jpg"
                          alt="img"
                          className="rounded-circle"
                        />
                      </Link>
                      <div>
                        <h6 className="fs-14">
                          <Link
                            to={all_routes.contactDetails}
                            className="fw-medium"
                          >
                            Jonelle Curtiss
                          </Link>
                        </h6>
                        <p className="text-default mb-0">Supervisor</p>
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
                        <Link
                          className="dropdown-item"
                          to={all_routes.contactDetails}
                        >
                          <i className="ti ti-eye text-blue-light" /> Preview
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="d-block">
                    <div className="d-flex flex-column">
                      <p className="text-default d-inline-flex align-items-center mb-2">
                        <i className="ti ti-mail text-dark me-1" />
                        jonelle@example.com
                      </p>
                      <p className="text-default d-inline-flex align-items-center mb-2">
                        <i className="ti ti-phone text-dark me-1" />
                        +1 121145471
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
                  <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
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
                    <div className="d-flex align-items-center">
                      <Link
                        to="#"
                        className="avatar avatar-xs"
                      >
                        <ImageWithBasePath
                          src="assets/img/profiles/avatar-04.jpg"
                          alt="img"
                          className="rounded-circle"
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-3 col-xl-4 col-md-6">
              <div className="card border shadow">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center">
                      <Link
                        to={all_routes.contactDetails}
                        className="avatar avatar-md flex-shrink-0 me-2"
                      >
                        <ImageWithBasePath
                          src="assets/img/profiles/avatar-26.jpg"
                          alt="img"
                          className="rounded-circle"
                        />
                      </Link>
                      <div>
                        <h6 className="fs-14">
                          <Link
                            to={all_routes.contactDetails}
                            className="fw-medium"
                          >
                            Jonathan Smith
                          </Link>
                        </h6>
                        <p className="text-default mb-0">Team Lead Dev</p>
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
                        <Link
                          className="dropdown-item"
                          to={all_routes.contactDetails}
                        >
                          <i className="ti ti-eye text-blue-light" /> Preview
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="d-block">
                    <div className="d-flex flex-column">
                      <p className="text-default d-inline-flex align-items-center mb-2">
                        <i className="ti ti-mail text-dark me-1" />
                        jonathan@example.com
                      </p>
                      <p className="text-default d-inline-flex align-items-center mb-2">
                        <i className="ti ti-phone text-dark me-1" />
                        +1 321454789
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
                  <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
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
                    <div className="d-flex align-items-center">
                      <Link
                        to="#"
                        className="avatar avatar-xs"
                      >
                        <ImageWithBasePath
                          src="assets/img/profiles/avatar-05.jpg"
                          alt="img"
                          className="rounded-circle"
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-3 col-xl-4 col-md-6">
              <div className="card border shadow">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center">
                      <Link
                        to={all_routes.contactDetails}
                        className="avatar avatar-md flex-shrink-0 me-2"
                      >
                        <ImageWithBasePath
                          src="assets/img/profiles/avatar-01.jpg"
                          alt="img"
                          className="rounded-circle"
                        />
                      </Link>
                      <div>
                        <h6 className="fs-14">
                          <Link
                            to={all_routes.contactDetails}
                            className="fw-medium"
                          >
                            Brook Carter
                          </Link>
                        </h6>
                        <p className="text-default mb-0">Team Lead Dev</p>
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
                        <Link
                          className="dropdown-item"
                          to={all_routes.contactDetails}
                        >
                          <i className="ti ti-eye text-blue-light" /> Preview
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="d-block">
                    <div className="d-flex flex-column">
                      <p className="text-default d-inline-flex align-items-center mb-2">
                        <i className="ti ti-mail text-dark me-1" />
                        brook@example.com
                      </p>
                      <p className="text-default d-inline-flex align-items-center mb-2">
                        <i className="ti ti-phone text-dark me-1" />
                        +1 278907145
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
                  <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
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
                    <div className="d-flex align-items-center">
                      <Link
                        to="#"
                        className="avatar avatar-xs"
                      >
                        <ImageWithBasePath
                          src="assets/img/profiles/avatar-06.jpg"
                          alt="img"
                          className="rounded-circle"
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-3 col-xl-4 col-md-6">
              <div className="card border shadow">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center">
                      <Link
                        to={all_routes.contactDetails}
                        className="avatar avatar-md flex-shrink-0 me-2"
                      >
                        <ImageWithBasePath
                          src="assets/img/profiles/avatar-06.jpg"
                          alt="img"
                          className="rounded-circle"
                        />
                      </Link>
                      <div>
                        <h6 className="fs-14">
                          <Link
                            to={all_routes.contactDetails}
                            className="fw-medium"
                          >
                            Eric Adams
                          </Link>
                        </h6>
                        <p className="text-default mb-0">HR Manager</p>
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
                        <Link
                          className="dropdown-item"
                          to={all_routes.contactDetails}
                        >
                          <i className="ti ti-eye text-blue-light" /> Preview
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="d-block">
                    <div className="d-flex flex-column">
                      <p className="text-default d-inline-flex align-items-center mb-2">
                        <i className="ti ti-mail text-dark me-1" />
                        ericadams@example.com
                      </p>
                      <p className="text-default d-inline-flex align-items-center mb-2">
                        <i className="ti ti-phone text-dark me-1" />
                        +1 19023-78104
                      </p>
                      <p className="text-default d-inline-flex align-items-center">
                        <i className="ti ti-map-pin-pin text-dark me-1" />
                        France
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
                  <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
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
                    <div className="d-flex align-items-center">
                      <Link
                        to="#"
                        className="avatar avatar-xs"
                      >
                        <ImageWithBasePath
                          src="assets/img/profiles/avatar-06.jpg"
                          alt="img"
                          className="rounded-circle"
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-3 col-xl-4 col-md-6">
              <div className="card border shadow">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center">
                      <Link
                        to={all_routes.contactDetails}
                        className="avatar avatar-md flex-shrink-0 me-2"
                      >
                        <ImageWithBasePath
                          src="assets/img/profiles/avatar-05.jpg"
                          alt="img"
                          className="rounded-circle"
                        />
                      </Link>
                      <div>
                        <h6 className="fs-14">
                          <Link
                            to={all_routes.contactDetails}
                            className="fw-medium"
                          >
                            Richard Cooper
                          </Link>
                        </h6>
                        <p className="text-default mb-0">Devops Engineer</p>
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
                        <Link
                          className="dropdown-item"
                          to={all_routes.contactDetails}
                        >
                          <i className="ti ti-eye text-blue-light" /> Preview
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="d-block">
                    <div className="d-flex flex-column">
                      <p className="text-default d-inline-flex align-items-center mb-2">
                        <i className="ti ti-mail text-dark me-1" />
                        richard@example.com
                      </p>
                      <p className="text-default d-inline-flex align-items-center mb-2">
                        <i className="ti ti-phone text-dark me-1" />
                        +1 18902-63904
                      </p>
                      <p className="text-default d-inline-flex align-items-center">
                        <i className="ti ti-map-pin-pin text-dark me-1" />
                        Belgium
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
                  <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
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
                    <div className="d-flex align-items-center">
                      <Link
                        to="#"
                        className="avatar avatar-xs"
                      >
                        <ImageWithBasePath
                          src="assets/img/profiles/avatar-07.jpg"
                          alt="img"
                          className="rounded-circle"
                        />
                      </Link>
                    </div>
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
        <Footer />
        {/* End Footer */}
      </div>
      {/* ========================
			End Page Content
		========================= */}
  <ModalContacts/>
    </>
  );
};

export default Contacts;
