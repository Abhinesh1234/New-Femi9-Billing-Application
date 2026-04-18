import { Link } from "react-router";
import Footer from "../../../../components/footer/footer";
import PageHeader from "../../../../components/page-header/pageHeader";
import ImageWithBasePath from "../../../../components/imageWithBasePath";
import { all_routes } from "../../../../routes/all_routes";
import ModalProposal from "./modal/modalProposal";
import CommonDatePicker from "../../../../components/common-datePicker/commonDatePicker";

const Proposals = () => {
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
            title="Proposals"
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
                            Subjects
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
                                  SEO Proposals
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Web Design
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Logo &amp; Branding
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Development
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Logo
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
                            Sent to
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
                                  NovaWave LLC
                                </label>
                              </li>
                              <li className="mb-1">
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Redwood Inc
                                </label>
                              </li>
                              <li className="mb-1">
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  HarborVie w
                                </label>
                              </li>
                              <li className="mb-1">
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  CoastalStar Co.
                                </label>
                              </li>
                              <li className="mb-1">
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  RiverStone Ventur
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
                            data-bs-target="#date"
                            aria-expanded="false"
                            aria-controls="date"
                          >
                            Date of Proposals
                          </Link>
                        </div>
                        <div
                          className="filter-set-contents accordion-collapse collapse"
                          id="date"
                          data-bs-parent="#accordionExample"
                        >
                          <div className="filter-content-list bg-light rounded border p-2 shadow mt-2">
                            <div className="input-group w-auto input-group-flat">
                              <div className="input-group w-100 input-group-flat">
                                    <CommonDatePicker placeholder="dd/mm/yyyy" />
                                  </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="filter-set-content">
                        <div className="filter-set-content-head">
                          <Link
                            to="#"
                            className="collapsed"
                            data-bs-toggle="collapse"
                            data-bs-target="#date2"
                            aria-expanded="false"
                            aria-controls="date2"
                          >
                            Create Date
                          </Link>
                        </div>
                        <div
                          className="filter-set-contents accordion-collapse collapse"
                          id="date2"
                          data-bs-parent="#accordionExample"
                        >
                          <div className="filter-content-list bg-light rounded border p-2 shadow mt-2">
                            <div className="input-group w-auto input-group-flat">
                              <div className="input-group w-100 input-group-flat">
                                    <CommonDatePicker placeholder="dd/mm/yyyy" />
                                  </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="filter-set-content">
                        <div className="filter-set-content-head">
                          <Link
                            to="#"
                            className="collapsed"
                            data-bs-toggle="collapse"
                            data-bs-target="#project"
                            aria-expanded="false"
                            aria-controls="project"
                          >
                            Project
                          </Link>
                        </div>
                        <div
                          className="filter-set-contents accordion-collapse collapse"
                          id="project"
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
                                  Truelysell
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Dreamsports
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Best@laundry
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Doccure
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
                      <Link to="#" className="btn btn-outline-light w-100">
                        Reset
                      </Link>
                      <Link to="" className="btn btn-primary w-100">
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
              <div className="d-flex align-items-center shadow p-1 rounded border view-icons bg-white">
                <Link
                  to={all_routes.ProposalsList}
                  className="btn btn-sm p-1 border-0 fs-14"
                >
                  <i className="ti ti-list-tree" />
                </Link>
                <Link
                  to={all_routes.ProposalsGrid}
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
                Add New Proposal
              </Link>
            </div>
          </div>
          {/* table header */}
          {/* Proposal Grid */}
          <div className="row">
            <div className="col-xxl-3 col-xl-4 col-md-6">
              <div className="card border shadow">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
                    <div className="flex-shrink-0">
                      <span className="badge badge-soft-info">#1493016</span>
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
                          data-bs-target="#delete_proposals"
                        >
                          <i className="ti ti-trash" /> Delete
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-clipboard-copy text-green" /> View
                          Proposal
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-checks" /> Mark As Accepted
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-file text-tertiary" /> Mark as
                          Draft
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-sticker text-blue" /> Mark ad
                          Declined
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-subtask text-pink" /> Convert to
                          estimate
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-file-invoice text-tertiary" />
                          Convert to Invoice
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-printer" /> Print
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="d-block">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div>
                        <h4 className="mb-1 fs-14 fw-semibold">SEO Proposal</h4>
                        <p className="fs-13 mb-0">Project : Truelysell</p>
                      </div>
                      <div>
                        <span className="badge bg-success">Accepted</span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="d-flex align-items-center mb-2">
                        <span className="me-2 text-dark">
                          <i className="ti ti-moneybag fs-12" />
                        </span>
                        Total Value : $2,04,214
                      </p>
                      <p className="d-flex align-items-center mb-2">
                        <span className="me-2 text-dark">
                          <i className="ti ti-calendar-event fs-12" />
                        </span>
                        Date : 25 May 2024
                      </p>
                      <p className="d-flex align-items-center">
                        <span className="me-2 text-dark">
                          <i className="ti ti-calendar-stats fs-12" />
                        </span>
                        Open till : 31 Jun 2024
                      </p>
                    </div>
                  </div>
                  <div className="rounded">
                    <div className="d-flex align-items-center">
                      <Link
                        to="#"
                        className="avatar rounded-circle bg-white border me-2"
                      >
                        <ImageWithBasePath
                          src="assets/img/icons/company-icon-01.svg"
                          className="w-auto h-auto"
                          alt="img"
                        />
                      </Link>
                      <div className="d-flex flex-column">
                        <span className="d-block">Sent to</span>
                        <Link to="#" className="text-default">
                          NovaWave LLC
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-3 col-xl-4 col-md-6">
              <div className="card border shadow">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
                    <div className="flex-shrink-0">
                      <span className="badge badge-soft-info">#1493016</span>
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
                          data-bs-target="#delete_proposals"
                        >
                          <i className="ti ti-trash" /> Delete
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-clipboard-copy text-green" /> View
                          Proposal
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-checks" /> Mark As Accepted
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-file text-tertiary" /> Mark as
                          Draft
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-sticker text-blue" /> Mark ad
                          Declined
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-subtask text-pink" /> Convert to
                          estimate
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-file-invoice text-tertiary" />
                          Convert to Invoice
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-printer" /> Print
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="d-block">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div>
                        <h4 className="mb-1 fs-14 fw-semibold">SEO Proposal</h4>
                        <p className="fs-13 mb-0">Project : Truelysell</p>
                      </div>
                      <div>
                        <span className="badge bg-danger">Deleted</span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="d-flex align-items-center mb-2">
                        <span className="me-2 text-dark">
                          <i className="ti ti-moneybag fs-12" />
                        </span>
                        Total Value : $2,04,214
                      </p>
                      <p className="d-flex align-items-center mb-2">
                        <span className="me-2 text-dark">
                          <i className="ti ti-calendar-event fs-12" />
                        </span>
                        Date : 25 May 2024
                      </p>
                      <p className="d-flex align-items-center">
                        <span className="me-2 text-dark">
                          <i className="ti ti-calendar-stats fs-12" />
                        </span>
                        Open till : 31 Jun 2024
                      </p>
                    </div>
                  </div>
                  <div className="rounded">
                    <div className="d-flex align-items-center">
                      <Link
                        to="#"
                        className="avatar rounded-circle bg-white border me-2"
                      >
                         <ImageWithBasePath
                          src="assets/img/icons/company-icon-02.svg"
                          className="w-auto h-auto"
                          alt="img"
                        />
                      </Link>
                      <div className="d-flex flex-column">
                        <span className="d-block">Sent to</span>
                        <Link to="#" className="text-default">
                          Redwood Inc
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-3 col-xl-4 col-md-6">
              <div className="card border shadow">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
                    <div className="flex-shrink-0">
                      <span className="badge badge-soft-info">#1493016</span>
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
                          data-bs-target="#delete_proposals"
                        >
                          <i className="ti ti-trash" /> Delete
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-clipboard-copy text-green" /> View
                          Proposal
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-checks" /> Mark As Accepted
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-file text-tertiary" /> Mark as
                          Draft
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-sticker text-blue" /> Mark ad
                          Declined
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-subtask text-pink" /> Convert to
                          estimate
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-file-invoice text-tertiary" />
                          Convert to Invoice
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-printer" /> Print
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="d-block">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div>
                        <h4 className="mb-1 fs-14 fw-semibold">SEO Proposal</h4>
                        <p className="fs-13 mb-0">Project : Truelysell</p>
                      </div>
                      <div>
                        <span className="badge bg-info">Draft</span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="d-flex align-items-center mb-2">
                        <span className="me-2 text-dark">
                          <i className="ti ti-moneybag fs-12" />
                        </span>
                        Total Value : $2,04,214
                      </p>
                      <p className="d-flex align-items-center mb-2">
                        <span className="me-2 text-dark">
                          <i className="ti ti-calendar-event fs-12" />
                        </span>
                        Date : 25 May 2024
                      </p>
                      <p className="d-flex align-items-center">
                        <span className="me-2 text-dark">
                          <i className="ti ti-calendar-stats fs-12" />
                        </span>
                        Open till : 31 Jun 2024
                      </p>
                    </div>
                  </div>
                  <div className="rounded">
                    <div className="d-flex align-items-center">
                      <Link
                        to="#"
                        className="avatar rounded-circle bg-white border me-2"
                      >
                         <ImageWithBasePath
                          src="assets/img/icons/company-icon-03.svg"
                          className="w-auto h-auto"
                          alt="img"
                        />
                      </Link>
                      <div className="d-flex flex-column">
                        <span className="d-block">Sent to</span>
                        <Link to="#" className="text-default">
                          HarborView
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-3 col-xl-4 col-md-6">
              <div className="card border shadow">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
                    <div className="flex-shrink-0">
                      <span className="badge badge-soft-info">#1493016</span>
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
                          data-bs-target="#delete_proposals"
                        >
                          <i className="ti ti-trash" /> Delete
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-clipboard-copy text-green" /> View
                          Proposal
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-checks" /> Mark As Accepted
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-file text-tertiary" /> Mark as
                          Draft
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-sticker text-blue" /> Mark ad
                          Declined
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-subtask text-pink" /> Convert to
                          estimate
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-file-invoice text-tertiary" />
                          Convert to Invoice
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-printer" /> Print
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="d-block">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div>
                        <h4 className="mb-1 fs-14 fw-semibold">SEO Proposal</h4>
                        <p className="fs-13 mb-0">Project : Truelysell</p>
                      </div>
                      <div>
                        <span className="badge bg-secondary">Declined</span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="d-flex align-items-center mb-2">
                        <span className="me-2 text-dark">
                          <i className="ti ti-moneybag fs-12" />
                        </span>
                        Total Value : $2,04,214
                      </p>
                      <p className="d-flex align-items-center mb-2">
                        <span className="me-2 text-dark">
                          <i className="ti ti-calendar-event fs-12" />
                        </span>
                        Date : 25 May 2024
                      </p>
                      <p className="d-flex align-items-center">
                        <span className="me-2 text-dark">
                          <i className="ti ti-calendar-stats fs-12" />
                        </span>
                        Open till : 31 Jun 2024
                      </p>
                    </div>
                  </div>
                  <div className="rounded">
                    <div className="d-flex align-items-center">
                      <Link
                        to="#"
                        className="avatar rounded-circle bg-white border me-2"
                      >
                         <ImageWithBasePath
                          src="assets/img/icons/company-icon-04.svg"
                          className="w-auto h-auto"
                          alt="img"
                        />
                      </Link>
                      <div className="d-flex flex-column">
                        <span className="d-block">Sent to</span>
                        <Link to="#" className="text-default">
                          CoastalStar Co.
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-3 col-xl-4 col-md-6">
              <div className="card border shadow">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
                    <div className="flex-shrink-0">
                      <span className="badge badge-soft-info">#1493016</span>
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
                          data-bs-target="#delete_proposals"
                        >
                          <i className="ti ti-trash" /> Delete
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-clipboard-copy text-green" /> View
                          Proposal
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-checks" /> Mark As Accepted
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-file text-tertiary" /> Mark as
                          Draft
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-sticker text-blue" /> Mark ad
                          Declined
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-subtask text-pink" /> Convert to
                          estimate
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-file-invoice text-tertiary" />
                          Convert to Invoice
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-printer" /> Print
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="d-block">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div>
                        <h4 className="mb-1 fs-14 fw-semibold">SEO Proposal</h4>
                        <p className="fs-13 mb-0">Project : Truelysell</p>
                      </div>
                      <div>
                        <span className="badge bg-secondary">Declined</span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="d-flex align-items-center mb-2">
                        <span className="me-2 text-dark">
                          <i className="ti ti-moneybag fs-12" />
                        </span>
                        Total Value : $2,04,214
                      </p>
                      <p className="d-flex align-items-center mb-2">
                        <span className="me-2 text-dark">
                          <i className="ti ti-calendar-event fs-12" />
                        </span>
                        Date : 25 May 2024
                      </p>
                      <p className="d-flex align-items-center">
                        <span className="me-2 text-dark">
                          <i className="ti ti-calendar-stats fs-12" />
                        </span>
                        Open till : 31 Jun 2024
                      </p>
                    </div>
                  </div>
                  <div className="rounded">
                    <div className="d-flex align-items-center">
                      <Link
                        to="#"
                        className="avatar rounded-circle bg-white border me-2"
                      >
                         <ImageWithBasePath
                          src="assets/img/icons/company-icon-05.svg"
                          className="w-auto h-auto"
                          alt="img"
                        />
                      </Link>
                      <div className="d-flex flex-column">
                        <span className="d-block">Sent to</span>
                        <Link to="#" className="text-default">
                          Summit Peak
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-3 col-xl-4 col-md-6">
              <div className="card border shadow">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
                    <div className="flex-shrink-0">
                      <span className="badge badge-soft-info">#1493016</span>
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
                          data-bs-target="#delete_proposals"
                        >
                          <i className="ti ti-trash" /> Delete
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-clipboard-copy text-green" /> View
                          Proposal
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-checks" /> Mark As Accepted
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-file text-tertiary" /> Mark as
                          Draft
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-sticker text-blue" /> Mark ad
                          Declined
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-subtask text-pink" /> Convert to
                          estimate
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-file-invoice text-tertiary" />
                          Convert to Invoice
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-printer" /> Print
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="d-block">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div>
                        <h4 className="mb-1 fs-14 fw-semibold">SEO Proposal</h4>
                        <p className="fs-13 mb-0">Project : Truelysell</p>
                      </div>
                      <div>
                        <span className="badge bg-teal">Sent</span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="d-flex align-items-center mb-2">
                        <span className="me-2 text-dark">
                          <i className="ti ti-moneybag fs-12" />
                        </span>
                        Total Value : $2,04,214
                      </p>
                      <p className="d-flex align-items-center mb-2">
                        <span className="me-2 text-dark">
                          <i className="ti ti-calendar-event fs-12" />
                        </span>
                        Date : 25 May 2024
                      </p>
                      <p className="d-flex align-items-center">
                        <span className="me-2 text-dark">
                          <i className="ti ti-calendar-stats fs-12" />
                        </span>
                        Open till : 31 Jun 2024
                      </p>
                    </div>
                  </div>
                  <div className="rounded">
                    <div className="d-flex align-items-center">
                      <Link
                        to="#"
                        className="avatar rounded-circle bg-white border me-2"
                      >
                         <ImageWithBasePath
                          src="assets/img/icons/company-icon-07.svg"
                          className="w-auto h-auto"
                          alt="img"
                        />
                      </Link>
                      <div className="d-flex flex-column">
                        <span className="d-block">Sent to</span>
                        <Link to="#" className="text-default">
                          Silver Hawk
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-3 col-xl-4 col-md-6">
              <div className="card border shadow">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
                    <div className="flex-shrink-0">
                      <span className="badge badge-soft-info">#1493016</span>
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
                          data-bs-target="#delete_proposals"
                        >
                          <i className="ti ti-trash" /> Delete
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-clipboard-copy text-green" /> View
                          Proposal
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-checks" /> Mark As Accepted
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-file text-tertiary" /> Mark as
                          Draft
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-sticker text-blue" /> Mark ad
                          Declined
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-subtask text-pink" /> Convert to
                          estimate
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-file-invoice text-tertiary" />
                          Convert to Invoice
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-printer" /> Print
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="d-block">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div>
                        <h4 className="mb-1 fs-14 fw-semibold">SEO Proposal</h4>
                        <p className="fs-13 mb-0">Project : Truelysell</p>
                      </div>
                      <div>
                        <span className="badge bg-danger">Deleted</span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="d-flex align-items-center mb-2">
                        <span className="me-2 text-dark">
                          <i className="ti ti-moneybag fs-12" />
                        </span>
                        Total Value : $2,04,214
                      </p>
                      <p className="d-flex align-items-center mb-2">
                        <span className="me-2 text-dark">
                          <i className="ti ti-calendar-event fs-12" />
                        </span>
                        Date : 25 May 2024
                      </p>
                      <p className="d-flex align-items-center">
                        <span className="me-2 text-dark">
                          <i className="ti ti-calendar-stats fs-12" />
                        </span>
                        Open till : 31 Jun 2024
                      </p>
                    </div>
                  </div>
                  <div className="rounded">
                    <div className="d-flex align-items-center">
                      <Link
                        to="#"
                        className="avatar rounded-circle bg-white border me-2"
                      >
                         <ImageWithBasePath
                          src="assets/img/icons/company-icon-06.svg"
                          className="w-auto h-auto"
                          alt="img"
                        />
                      </Link>
                      <div className="d-flex flex-column">
                        <span className="d-block">Sent to</span>
                        <Link to="#" className="text-default">
                          BlueSky Industries
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-3 col-xl-4 col-md-6">
              <div className="card border shadow">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
                    <div className="flex-shrink-0">
                      <span className="badge badge-soft-info">#1493016</span>
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
                          data-bs-target="#delete_proposals"
                        >
                          <i className="ti ti-trash" /> Delete
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-clipboard-copy text-green" /> View
                          Proposal
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-checks" /> Mark As Accepted
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-file text-tertiary" /> Mark as
                          Draft
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-sticker text-blue" /> Mark ad
                          Declined
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-subtask text-pink" /> Convert to
                          estimate
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-file-invoice text-tertiary" />
                          Convert to Invoice
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-printer" /> Print
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="d-block">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div>
                        <h4 className="mb-1 fs-14 fw-semibold">SEO Proposal</h4>
                        <p className="fs-13 mb-0">Project : Truelysell</p>
                      </div>
                      <div>
                        <span className="badge bg-info">Draft</span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="d-flex align-items-center mb-2">
                        <span className="me-2 text-dark">
                          <i className="ti ti-moneybag fs-12" />
                        </span>
                        Total Value : $2,04,214
                      </p>
                      <p className="d-flex align-items-center mb-2">
                        <span className="me-2 text-dark">
                          <i className="ti ti-calendar-event fs-12" />
                        </span>
                        Date : 25 May 2024
                      </p>
                      <p className="d-flex align-items-center">
                        <span className="me-2 text-dark">
                          <i className="ti ti-calendar-stats fs-12" />
                        </span>
                        Open till : 31 Jun 2024
                      </p>
                    </div>
                  </div>
                  <div className="rounded">
                    <div className="d-flex align-items-center">
                      <Link
                        to="#"
                        className="avatar rounded-circle bg-white border me-2"
                      >
                         <ImageWithBasePath
                          src="assets/img/icons/company-icon-08.svg"
                          className="w-auto h-auto"
                          alt="img"
                        />
                      </Link>
                      <div className="d-flex flex-column">
                        <span className="d-block">Sent to</span>
                        <Link to="#" className="text-default">
                          NovaWave LLC
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* /Proposal Grid */}
          <div className="load-btn text-center">
            <Link to="#" className="btn btn-primary">
              <i className="ti ti-loader me-1" />
              Load More
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
        <ModalProposal/>
    </>
  );
};

export default Proposals;
