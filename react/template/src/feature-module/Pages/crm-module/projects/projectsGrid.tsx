import { Link } from "react-router";
import Footer from "../../../../components/footer/footer";
import PageHeader from "../../../../components/page-header/pageHeader";
import ImageWithBasePath from "../../../../components/imageWithBasePath";
import { all_routes } from "../../../../routes/all_routes";
import ModalProject from "./modal/modalProject";
import CommonDatePicker from "../../../../components/common-datePicker/commonDatePicker";

const ProjectsGrid = () => {
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
            title="Projects"
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
                            Project Name
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
                                  Turelysell
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Dreamschat
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Servbook
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  DreamsPOS
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Kofejob
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
                                  Dreamsports
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  SmartHR
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
                            data-bs-target="#owner"
                            aria-expanded="false"
                            aria-controls="owner"
                          >
                            Client Name
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
                                  BlueSky Industries
                                </label>
                              </li>
                              <li className="mb-1">
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Silver Hawk
                                </label>
                              </li>
                              <li className="mb-1">
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Summit Peak
                                </label>
                              </li>
                              <li className="mb-1">
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  RiverStone Ltd
                                </label>
                              </li>
                              <li className="mb-1">
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Bright Bridge Grp
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
                                  HarborView
                                </label>
                              </li>
                              <li className="mb-1">
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Golden Gate Ltd
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
                            data-bs-target="#type"
                            aria-expanded="false"
                            aria-controls="type"
                          >
                            Type
                          </Link>
                        </div>
                        <div
                          className="filter-set-contents accordion-collapse collapse"
                          id="type"
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
                                  Web App
                                </label>
                              </li>
                              <li className="mb-1">
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Client Meeting
                                </label>
                              </li>
                              <li className="mb-1">
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Mobile App
                                </label>
                              </li>
                              <li className="mb-1">
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  UI/UX Design
                                </label>
                              </li>
                              <li className="mb-1">
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Product Lanuch
                                </label>
                              </li>
                              <li className="mb-1">
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Bug Fixing
                                </label>
                              </li>
                              <li className="mb-1">
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Content creation
                                </label>
                              </li>
                              <li className="mb-1">
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Sales Demo
                                </label>
                              </li>
                              <li className="mb-1">
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  QA Testing
                                </label>
                              </li>
                              <li className="mb-1">
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Customer Support
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
                            Start Date
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
                            End Date
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
                      <div className="filter-set-content">
                        <div className="filter-set-content-head">
                          <Link
                            to="#"
                            className="collapsed"
                            data-bs-toggle="collapse"
                            data-bs-target="#stage"
                            aria-expanded="false"
                            aria-controls="stage"
                          >
                            Pipeline Stage
                          </Link>
                        </div>
                        <div
                          className="filter-set-contents accordion-collapse collapse"
                          id="stage"
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
                                  Develop
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Meeting
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Design
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Launch
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Fix
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Write
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Demo
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Test
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Support
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
                  to={all_routes.projectsList}
                  className="btn btn-sm p-1 border-0 fs-14"
                >
                  <i className="ti ti-list-tree" />
                </Link>
                <Link
                  to={all_routes.projectsGrid}
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
                Add New Project
              </Link>
            </div>
          </div>
          {/* table header */}
          {/* Projects List */}
          <div className="row">
            <div className="col-xxl-3 col-xl-4 col-md-6">
              <div className="card border">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center">
                      <span className="badge badge-tag badge-soft-danger  text-danger me-2 border-0">
                        <i className="ti ti-square-rounded-filled text-danger fs-8 me-1" />
                        High
                      </span>
                      <span className="badge bg-success">Active</span>
                    </div>
                    <span className="avatar avatar-xs fs-16">
                      <i className="ti ti-star-filled text-warning" />
                    </span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between bg-light rounded p-2 mb-3">
                    <div className="d-flex align-items-center">
                      <Link
                        to={all_routes.projectDetails}
                        className="avatar border rounded-circle bg-white flex-shrink-0 me-2"
                      >
                        <ImageWithBasePath
                          src="assets/img/priority/truellysel.svg"
                          className="w-auto h-auto"
                          alt="img"
                        />
                      </Link>
                      <div>
                        <h5 className="fw-medium fs-14">
                          <Link to={all_routes.projectDetails}>Truelysell</Link>
                        </h5>
                        <p className="fs-13 mb-0">Web App</p>
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
                          data-bs-target="#delete_project"
                        >
                          <i className="ti ti-trash" /> Delete
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-clipboard-copy text-green" />{" "}
                          Clone this Project
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-printer" /> Print
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-subtask" /> Add New Task
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="d-block">
                    <p className="mb-3">
                      Kofejob is a freelancers marketplace where you can post
                      projects &amp; get instant help.
                    </p>
                    <div className="mb-3">
                      <p className="d-flex align-items-center mb-2">
                        <i className="ti ti-forbid-2 me-2" />
                        Project ID : #12145
                      </p>
                      <p className="d-flex align-items-center mb-2">
                        <i className="ti ti-report-money me-2" />
                        Value : $03,50,000
                      </p>
                      <p className="d-flex align-items-center mb-2">
                        <i className="ti ti-calendar-exclamation me-2" />
                        Due Date : 15 Oct 2023
                      </p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="avatar-list-stacked avatar-group-sm">
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            className="border border-white"
                            src="assets/img/profiles/avatar-14.jpg"
                            alt="img"
                          />
                        </span>
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            className="border border-white"
                            src="assets/img/profiles/avatar-15.jpg"
                            alt="img"
                          />
                        </span>
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            src="assets/img/profiles/avatar-16.jpg"
                            alt="img"
                          />
                        </span>
                        <Link
                          className="avatar text-dark bg-light border avatar-rounded fs-10"
                          to="#"
                        >
                          +05
                        </Link>
                      </div>
                      <div className="d-flex align-items-center">
                        <span className="avatar avatar-sm p-1 border rounded-circle flex-shrink-0">
                          <ImageWithBasePath
                            src="assets/img/icons/company-icon-01.svg"
                            alt="img"
                          />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                    <span className="badge badge-sm bg-soft-info text-info">
                      <i className="ti ti-clock-stop me-2" />
                      Total Hours : 100
                    </span>
                    <div className="d-flex align-items-center">
                      <span className="d-inline-flex align-items-center me-2">
                        <i className="ti ti-brand-wechat me-1" />
                        02
                      </span>
                      <span className="d-inline-flex align-items-center">
                        <i className="ti ti-subtask me-1" />
                        04
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-3 col-xl-4 col-md-6">
              <div className="card border">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center">
                      <span className="badge badge-tag badge-soft-danger  text-danger me-2 border-0">
                        <i className="ti ti-square-rounded-filled text-danger fs-8 me-1" />
                        High
                      </span>
                      <span className="badge bg-success">Active</span>
                    </div>
                    <span className="avatar avatar-xs fs-16">
                      <i className="ti ti-star-filled text-warning" />
                    </span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between bg-light rounded p-2 mb-3">
                    <div className="d-flex align-items-center">
                      <Link
                        to={all_routes.projectDetails}
                        className="avatar border rounded-circle bg-white flex-shrink-0 me-2"
                      >
                        <ImageWithBasePath
                          src="assets/img/priority/dreamchat.svg"
                          className="w-auto h-auto"
                          alt="img"
                        />
                      </Link>
                      <div>
                        <h5 className="fw-medium fs-14">
                          <Link to={all_routes.projectDetails}>Dreamschat</Link>
                        </h5>
                        <p className="fs-13 mb-0">Web App</p>
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
                          data-bs-target="#delete_project"
                        >
                          <i className="ti ti-trash" /> Delete
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-clipboard-copy text-green" />{" "}
                          Clone this Project
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-printer" /> Print
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-subtask" /> Add New Task
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="d-block">
                    <p className="mb-3">
                      Kofejob is a freelancers marketplace where you can post
                      projects &amp; get instant help.
                    </p>
                    <div className="mb-3">
                      <p className="d-flex align-items-center mb-2">
                        <i className="ti ti-forbid-2 me-2" />
                        Project ID : #12145
                      </p>
                      <p className="d-flex align-items-center mb-2">
                        <i className="ti ti-report-money me-2" />
                        Value : $02,15,000
                      </p>
                      <p className="d-flex align-items-center mb-2">
                        <i className="ti ti-calendar-exclamation me-2" />
                        Due Date : 19 Oct 2023
                      </p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="avatar-list-stacked avatar-group-sm">
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            className="border border-white"
                            src="assets/img/profiles/avatar-01.jpg"
                            alt="img"
                          />
                        </span>
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            className="border border-white"
                            src="assets/img/profiles/avatar-02.jpg"
                            alt="img"
                          />
                        </span>
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            src="assets/img/profiles/avatar-03.jpg"
                            alt="img"
                          />
                        </span>
                        <Link
                          className="avatar text-dark bg-light border avatar-rounded fs-10"
                          to="#"
                        >
                          +04
                        </Link>
                      </div>
                      <div className="d-flex align-items-center">
                        <span className="avatar avatar-sm p-1 border flex-shrink-0 rounded-circle">
                          <ImageWithBasePath
                            src="assets/img/icons/company-icon-02.svg"
                            alt="img"
                          />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                    <span className="badge badge-sm bg-soft-info text-info">
                      <i className="ti ti-clock-stop me-2" />
                      Total Hours : 80
                    </span>
                    <div className="d-flex align-items-center">
                      <span className="d-inline-flex align-items-center me-2">
                        <i className="ti ti-brand-wechat me-1" />
                        02
                      </span>
                      <span className="d-inline-flex align-items-center">
                        <i className="ti ti-subtask me-1" />
                        04
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-3 col-xl-4 col-md-6">
              <div className="card border">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center">
                      <span className="badge badge-tag badge-soft-danger  text-danger me-2 border-0">
                        <i className="ti ti-square-rounded-filled text-danger fs-8 me-1" />
                        High
                      </span>
                      <span className="badge bg-success">Active</span>
                    </div>
                    <span className="avatar avatar-xs fs-16">
                      <i className="ti ti-star-filled text-warning" />
                    </span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between bg-light rounded p-2 mb-3">
                    <div className="d-flex align-items-center">
                      <Link
                        to={all_routes.projectDetails}
                        className="avatar border rounded-circle bg-white flex-shrink-0 me-2"
                      >
                        <ImageWithBasePath
                          src="assets/img/priority/truellysell.svg"
                          className="w-auto h-auto"
                          alt="img"
                        />
                      </Link>
                      <div>
                        <h5 className="fw-medium fs-14">
                          <Link to={all_routes.projectDetails}>Truelysell</Link>
                        </h5>
                        <p className="fs-13 mb-0">Web App</p>
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
                          data-bs-target="#delete_project"
                        >
                          <i className="ti ti-trash" /> Delete
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-clipboard-copy text-green" />{" "}
                          Clone this Project
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-printer" /> Print
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-subtask" /> Add New Task
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="d-block">
                    <p className="mb-3">
                      Kofejob is a freelancers marketplace where you can post
                      projects &amp; get instant help.
                    </p>
                    <div className="mb-3">
                      <p className="d-flex align-items-center mb-2">
                        <i className="ti ti-forbid-2 me-2" />
                        Project ID : #12147
                      </p>
                      <p className="d-flex align-items-center mb-2">
                        <i className="ti ti-report-money me-2" />
                        Value : $01,45,000
                      </p>
                      <p className="d-flex align-items-center mb-2">
                        <i className="ti ti-calendar-exclamation me-2" />
                        Due Date : 12 Oct 2023
                      </p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="avatar-list-stacked avatar-group-sm">
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            className="border border-white"
                            src="assets/img/profiles/avatar-04.jpg"
                            alt="img"
                          />
                        </span>
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            className="border border-white"
                            src="assets/img/profiles/avatar-05.jpg"
                            alt="img"
                          />
                        </span>
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            src="assets/img/profiles/avatar-06.jpg"
                            alt="img"
                          />
                        </span>
                        <Link
                          className="avatar text-dark bg-light border avatar-rounded fs-10"
                          to="#"
                        >
                          +04
                        </Link>
                      </div>
                      <div className="d-flex align-items-center">
                        <span className="avatar avatar-sm p-1 border flex-shrink-0 rounded-circle">
                          <ImageWithBasePath
                            src="assets/img/icons/company-icon-03.svg"
                            alt="img"
                          />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                    <span className="badge badge-sm bg-soft-info text-info">
                      <i className="ti ti-clock-stop me-2" />
                      Total Hours : 75
                    </span>
                    <div className="d-flex align-items-center">
                      <span className="d-inline-flex align-items-center me-2">
                        <i className="ti ti-brand-wechat me-1" />
                        02
                      </span>
                      <span className="d-inline-flex align-items-center">
                        <i className="ti ti-subtask me-1" />
                        04
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-3 col-xl-4 col-md-6">
              <div className="card border">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center">
                      <span className="badge badge-tag badge-soft-danger  text-danger me-2 border-0">
                        <i className="ti ti-square-rounded-filled text-danger fs-8 me-1" />
                        High
                      </span>
                      <span className="badge bg-success">Active</span>
                    </div>
                    <span className="avatar avatar-xs fs-16">
                      <i className="ti ti-star-filled text-warning" />
                    </span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between bg-light rounded p-2 mb-3">
                    <div className="d-flex align-items-center">
                      <Link
                        to={all_routes.projectDetails}
                        className="avatar border rounded-circle bg-white flex-shrink-0 me-2"
                      >
                        <ImageWithBasePath
                          src="assets/img/priority/servbook.svg"
                          className="w-auto h-auto"
                          alt="img"
                        />
                      </Link>
                      <div>
                        <h5 className="fw-medium fs-14">
                          <Link to={all_routes.projectDetails}>Servbook</Link>
                        </h5>
                        <p className="fs-13 mb-0">Web App</p>
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
                          data-bs-target="#delete_project"
                        >
                          <i className="ti ti-trash" /> Delete
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-clipboard-copy text-green" />{" "}
                          Clone this Project
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-printer" /> Print
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-subtask" /> Add New Task
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="d-block">
                    <p className="mb-3">
                      Kofejob is a freelancers marketplace where you can post
                      projects &amp; get instant help.
                    </p>
                    <div className="mb-3">
                      <p className="d-flex align-items-center mb-2">
                        <i className="ti ti-forbid-2 me-2" />
                        Project ID : #12148
                      </p>
                      <p className="d-flex align-items-center mb-2">
                        <i className="ti ti-report-money me-2" />
                        Value : $02,15,000
                      </p>
                      <p className="d-flex align-items-center mb-2">
                        <i className="ti ti-calendar-exclamation me-2" />
                        Due Date : 24 Oct 2023
                      </p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="avatar-list-stacked avatar-group-sm">
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            className="border border-white"
                            src="assets/img/profiles/avatar-07.jpg"
                            alt="img"
                          />
                        </span>
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            className="border border-white"
                            src="assets/img/profiles/avatar-08.jpg"
                            alt="img"
                          />
                        </span>
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            src="assets/img/profiles/avatar-09.jpg"
                            alt="img"
                          />
                        </span>
                        <Link
                          className="avatar text-dark bg-light border avatar-rounded fs-10"
                          to="#"
                        >
                          +04
                        </Link>
                      </div>
                      <div className="d-flex align-items-center">
                        <span className="avatar avatar-sm p-1 border flex-shrink-0 rounded-circle">
                          <ImageWithBasePath
                            src="assets/img/icons/company-icon-04.svg"
                            alt="img"
                          />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                    <span className="badge badge-sm bg-soft-info text-info">
                      <i className="ti ti-clock-stop me-2" />
                      Total Hours : 75
                    </span>
                    <div className="d-flex align-items-center">
                      <span className="d-inline-flex align-items-center me-2">
                        <i className="ti ti-brand-wechat me-1" />
                        02
                      </span>
                      <span className="d-inline-flex align-items-center">
                        <i className="ti ti-subtask me-1" />
                        04
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-3 col-xl-4 col-md-6">
              <div className="card border">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center">
                      <span className="badge badge-tag badge-soft-danger  text-danger me-2 border-0">
                        <i className="ti ti-square-rounded-filled text-danger fs-8 me-1" />
                        High
                      </span>
                      <span className="badge bg-success">Active</span>
                    </div>
                    <span className="avatar avatar-xs fs-16">
                      <i className="ti ti-star-filled text-warning" />
                    </span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between bg-light rounded p-2 mb-3">
                    <div className="d-flex align-items-center">
                      <Link
                        to={all_routes.projectDetails}
                        className="avatar border rounded-circle bg-white flex-shrink-0 me-2"
                      >
                        <ImageWithBasePath
                          src="assets/img/priority/dream-pos.svg"
                          className="w-auto h-auto"
                          alt="img"
                        />
                      </Link>
                      <div>
                        <h5 className="fw-medium fs-14">
                          <Link to={all_routes.projectDetails}>DreamPOS</Link>
                        </h5>
                        <p className="mb-0 fs-13">Web App</p>
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
                          data-bs-target="#delete_project"
                        >
                          <i className="ti ti-trash" /> Delete
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-clipboard-copy text-green" />{" "}
                          Clone this Project
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-printer" /> Print
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-subtask" /> Add New Task
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="d-block">
                    <p className="mb-3">
                      Kofejob is a freelancers marketplace where you can post
                      projects &amp; get instant help.
                    </p>
                    <div className="mb-3">
                      <p className="d-flex align-items-center mb-2">
                        <i className="ti ti-forbid-2 me-2" />
                        Project ID : #12149
                      </p>
                      <p className="d-flex align-items-center mb-2">
                        <i className="ti ti-report-money me-2" />
                        Value : $03,64,000
                      </p>
                      <p className="d-flex align-items-center mb-2">
                        <i className="ti ti-calendar-exclamation me-2" />
                        Due Date : 22 Oct 2023
                      </p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="avatar-list-stacked avatar-group-sm">
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            className="border border-white"
                            src="assets/img/profiles/avatar-10.jpg"
                            alt="img"
                          />
                        </span>
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            className="border border-white"
                            src="assets/img/profiles/avatar-11.jpg"
                            alt="img"
                          />
                        </span>
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            src="assets/img/profiles/avatar-12.jpg"
                            alt="img"
                          />
                        </span>
                        <Link
                          className="avatar text-dark bg-light border avatar-rounded fs-10"
                          to="#"
                        >
                          +03
                        </Link>
                      </div>
                      <div className="d-flex align-items-center">
                        <span className="avatar avatar-sm p-1 border flex-shrink-0 rounded-circle">
                          <ImageWithBasePath
                            src="assets/img/icons/company-icon-05.svg"
                            alt="img"
                          />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                    <span className="badge badge-sm bg-soft-info text-info">
                      <i className="ti ti-clock-stop me-2" />
                      Total Hours : 60
                    </span>
                    <div className="d-flex align-items-center">
                      <span className="d-inline-flex align-items-center me-2">
                        <i className="ti ti-brand-wechat me-1" />
                        02
                      </span>
                      <span className="d-inline-flex align-items-center">
                        <i className="ti ti-subtask me-1" />
                        04
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-3 col-xl-4 col-md-6">
              <div className="card border">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center">
                      <span className="badge badge-tag badge-soft-danger  text-danger me-2 border-0">
                        <i className="ti ti-square-rounded-filled text-danger fs-8 me-1" />
                        High
                      </span>
                      <span className="badge bg-success">Active</span>
                    </div>
                    <span className="avatar avatar-xs fs-16">
                      <i className="ti ti-star-filled text-warning" />
                    </span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between bg-light rounded p-2 mb-3">
                    <div className="d-flex align-items-center">
                      <Link
                        to={all_routes.projectDetails}
                        className="avatar border rounded-circle bg-white flex-shrink-0 me-2"
                      >
                        <ImageWithBasePath
                          src="assets/img/priority/project-01.svg"
                          className="w-auto h-auto"
                          alt="img"
                        />
                      </Link>
                      <div>
                        <h5 className="fw-medium fs-14">
                          <Link to={all_routes.projectDetails}>Kofejob</Link>
                        </h5>
                        <p className="fs-13 mb-0">Meeting</p>
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
                          data-bs-target="#delete_project"
                        >
                          <i className="ti ti-trash" /> Delete
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-clipboard-copy text-green" />{" "}
                          Clone this Project
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-printer" /> Print
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-subtask" /> Add New Task
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="d-block">
                    <p className="mb-3">
                      Kofejob is a freelancers marketplace where you can post
                      projects &amp; get instant help.
                    </p>
                    <div className="mb-3">
                      <p className="d-flex align-items-center mb-2">
                        <i className="ti ti-forbid-2 me-2" />
                        Project ID : #12150
                      </p>
                      <p className="d-flex align-items-center mb-2">
                        <i className="ti ti-report-money me-2" />
                        Value : $02,12,000
                      </p>
                      <p className="d-flex align-items-center mb-2">
                        <i className="ti ti-calendar-exclamation me-2" />
                        Due Date : 09 Dec 2023
                      </p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="avatar-list-stacked avatar-group-sm">
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            className="border border-white"
                            src="assets/img/profiles/avatar-15.jpg"
                            alt="img"
                          />
                        </span>
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            className="border border-white"
                            src="assets/img/profiles/avatar-16.jpg"
                            alt="img"
                          />
                        </span>
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            src="assets/img/profiles/avatar-17.jpg"
                            alt="img"
                          />
                        </span>
                        <Link
                          className="avatar text-dark bg-light border avatar-rounded fs-10"
                          to="#"
                        >
                          +03
                        </Link>
                      </div>
                      <div className="d-flex align-items-center">
                        <span className="avatar avatar-sm p-1 border flex-shrink-0 rounded-circle">
                          <ImageWithBasePath
                            src="assets/img/icons/company-icon-06.svg"
                            alt="img"
                          />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                    <span className="badge badge-sm bg-soft-info text-info">
                      <i className="ti ti-clock-stop me-2" />
                      Total Hours : 96
                    </span>
                    <div className="d-flex align-items-center">
                      <span className="d-inline-flex align-items-center me-2">
                        <i className="ti ti-brand-wechat me-1" />
                        02
                      </span>
                      <span className="d-inline-flex align-items-center">
                        <i className="ti ti-subtask me-1" />
                        04
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-3 col-xl-4 col-md-6">
              <div className="card border">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center">
                      <span className="badge badge-tag badge-soft-danger  text-danger me-2 border-0">
                        <i className="ti ti-square-rounded-filled text-danger fs-8 me-1" />
                        High
                      </span>
                      <span className="badge bg-success">Active</span>
                    </div>
                    <span className="avatar avatar-xs fs-16">
                      <i className="ti ti-star-filled text-warning" />
                    </span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between bg-light rounded p-2 mb-3">
                    <div className="d-flex align-items-center">
                      <Link
                        to={all_routes.projectDetails}
                        className="avatar border rounded-circle bg-white flex-shrink-0 me-2"
                      >
                        <ImageWithBasePath
                          src="assets/img/priority/project-01.svg"
                          className="w-auto h-auto"
                          alt="img"
                        />
                      </Link>
                      <div>
                        <h5 className="fw-medium fs-14">
                          <Link to={all_routes.projectDetails}>Doccure</Link>
                        </h5>
                        <p className="fs-13 mb-0">Web App</p>
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
                          data-bs-target="#delete_project"
                        >
                          <i className="ti ti-trash" /> Delete
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-clipboard-copy text-green" />{" "}
                          Clone this Project
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-printer" /> Print
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-subtask" /> Add New Task
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="d-block">
                    <p className="mb-3">
                      Kofejob is a freelancers marketplace where you can post
                      projects &amp; get instant help.
                    </p>
                    <div className="mb-3">
                      <p className="d-flex align-items-center mb-2">
                        <i className="ti ti-forbid-2 me-2" />
                        Project ID : #12151
                      </p>
                      <p className="d-flex align-items-center mb-2">
                        <i className="ti ti-report-money me-2" />
                        Value : $04,18,000
                      </p>
                      <p className="d-flex align-items-center mb-2">
                        <i className="ti ti-calendar-exclamation me-2" />
                        Due Date : 16 Dec 2023
                      </p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="avatar-list-stacked avatar-group-sm">
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            className="border border-white"
                            src="assets/img/profiles/avatar-18.jpg"
                            alt="img"
                          />
                        </span>
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            className="border border-white"
                            src="assets/img/profiles/avatar-19.jpg"
                            alt="img"
                          />
                        </span>
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            src="assets/img/profiles/avatar-20.jpg"
                            alt="img"
                          />
                        </span>
                        <Link
                          className="avatar text-dark bg-light border avatar-rounded fs-10"
                          to="#"
                        >
                          +03
                        </Link>
                      </div>
                      <div className="d-flex align-items-center">
                        <span className="avatar avatar-sm p-1 border flex-shrink-0 rounded-circle">
                          <ImageWithBasePath
                            src="assets/img/icons/company-icon-07.svg"
                            alt="img"
                          />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                    <span className="badge badge-sm bg-soft-info text-info">
                      <i className="ti ti-clock-stop me-2" />
                      Total Hours : 80
                    </span>
                    <div className="d-flex align-items-center">
                      <span className="d-inline-flex align-items-center me-2">
                        <i className="ti ti-brand-wechat me-1" />
                        02
                      </span>
                      <span className="d-inline-flex align-items-center">
                        <i className="ti ti-subtask me-1" />
                        04
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-3 col-xl-4 col-md-6">
              <div className="card border">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center">
                      <span className="badge badge-tag badge-soft-danger  text-danger me-2 border-0">
                        <i className="ti ti-square-rounded-filled text-danger fs-8 me-1" />
                        High
                      </span>
                      <span className="badge bg-success">Active</span>
                    </div>
                    <span className="avatar avatar-xs fs-16">
                      <i className="ti ti-star-filled text-warning" />
                    </span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between bg-light rounded p-2 mb-3">
                    <div className="d-flex align-items-center">
                      <Link
                        to={all_routes.projectDetails}
                        className="avatar border rounded-circle bg-white flex-shrink-0 me-2"
                      >
                        <ImageWithBasePath
                          src="assets/img/priority/best.svg"
                          className="w-auto h-auto"
                          alt="img"
                        />
                      </Link>
                      <div>
                        <h5 className="fw-medium fs-14">
                          <Link to={all_routes.projectDetails}>
                            Best@laundry
                          </Link>
                        </h5>
                        <p className="fs-13 mb-0">Meeting</p>
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
                          data-bs-target="#delete_project"
                        >
                          <i className="ti ti-trash" /> Delete
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-clipboard-copy text-green" />{" "}
                          Clone this Project
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-printer" /> Print
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-subtask" /> Add New Task
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="d-block">
                    <p className="mb-3">
                      Kofejob is a freelancers marketplace where you can post
                      projects &amp; get instant help.
                    </p>
                    <div className="mb-3">
                      <p className="d-flex align-items-center mb-2">
                        <i className="ti ti-forbid-2 me-2" />
                        Project ID : #12152
                      </p>
                      <p className="d-flex align-items-center mb-2">
                        <i className="ti ti-report-money me-2" />
                        Value : $01,23,000
                      </p>
                      <p className="d-flex align-items-center mb-2">
                        <i className="ti ti-calendar-exclamation me-2" />
                        Due Date : 13 Jan 2024
                      </p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="avatar-list-stacked avatar-group-sm">
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            className="border border-white"
                            src="assets/img/profiles/avatar-21.jpg"
                            alt="img"
                          />
                        </span>
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            className="border border-white"
                            src="assets/img/profiles/avatar-22.jpg"
                            alt="img"
                          />
                        </span>
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            src="assets/img/profiles/avatar-23.jpg"
                            alt="img"
                          />
                        </span>
                        <Link
                          className="avatar text-dark bg-light border avatar-rounded fs-10"
                          to="#"
                        >
                          +02
                        </Link>
                      </div>
                      <div className="d-flex align-items-center">
                        <span className="avatar avatar-sm p-1 border flex-shrink-0 rounded-circle">
                          <ImageWithBasePath
                            src="assets/img/icons/company-icon-08.svg"
                            alt="img"
                          />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                    <span className="badge badge-sm bg-soft-info text-info">
                      <i className="ti ti-clock-stop me-2" />
                      Total Hours : 65
                    </span>
                    <div className="d-flex align-items-center">
                      <span className="d-inline-flex align-items-center me-2">
                        <i className="ti ti-brand-wechat me-1" />
                        02
                      </span>
                      <span className="d-inline-flex align-items-center">
                        <i className="ti ti-subtask me-1" />
                        04
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-3 col-xl-4 col-md-6">
              <div className="card border">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center">
                      <span className="badge badge-tag badge-soft-danger  text-danger me-2 border-0">
                        <i className="ti ti-square-rounded-filled text-danger fs-8 me-1" />
                        High
                      </span>
                      <span className="badge bg-success">Active</span>
                    </div>
                    <span className="avatar avatar-xs fs-16">
                      <i className="ti ti-star-filled text-warning" />
                    </span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between bg-light rounded p-2 mb-3">
                    <div className="d-flex align-items-center">
                      <Link
                        to={all_routes.projectDetails}
                        className="avatar border rounded-circle bg-white flex-shrink-0 me-2"
                      >
                        <ImageWithBasePath
                          src="assets/img/priority/dream-pos.svg"
                          className="w-auto h-auto"
                          alt="img"
                        />
                      </Link>
                      <div>
                        <h5 className="fw-medium fs-14">
                          <Link to={all_routes.projectDetails}>POS</Link>
                        </h5>
                        <p className="fs-13 mb-0">Web App</p>
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
                          data-bs-target="#delete_project"
                        >
                          <i className="ti ti-trash" /> Delete
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-clipboard-copy text-green" />{" "}
                          Clone this Project
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-printer" /> Print
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-subtask" /> Add New Task
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="d-block">
                    <p className="mb-3">
                      Kofejob is a freelancers marketplace where you can post
                      projects &amp; get instant help.
                    </p>
                    <div className="mb-3">
                      <p className="d-flex align-items-center mb-2">
                        <i className="ti ti-forbid-2 me-2" />
                        Project ID : #12153
                      </p>
                      <p className="d-flex align-items-center mb-2">
                        <i className="ti ti-report-money me-2" />
                        Value : $03,64,000
                      </p>
                      <p className="d-flex align-items-center mb-2">
                        <i className="ti ti-calendar-exclamation me-2" />
                        Due Date : 11 Jan 2024
                      </p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="avatar-list-stacked avatar-group-sm">
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            className="border border-white"
                            src="assets/img/profiles/avatar-24.jpg"
                            alt="img"
                          />
                        </span>
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            className="border border-white"
                            src="assets/img/profiles/avatar-25.jpg"
                            alt="img"
                          />
                        </span>
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            src="assets/img/profiles/avatar-26.jpg"
                            alt="img"
                          />
                        </span>
                        <Link
                          className="avatar text-dark bg-light border avatar-rounded fs-10"
                          to="#"
                        >
                          +02
                        </Link>
                      </div>
                      <div className="d-flex align-items-center">
                        <span className="avatar avatar-sm p-1 border flex-shrink-0 rounded-circle">
                          <ImageWithBasePath
                            src="assets/img/icons/company-icon-09.svg"
                            alt="img"
                          />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                    <span className="badge badge-sm bg-soft-info text-info">
                      <i className="ti ti-clock-stop me-2" />
                      Total Hours : 65
                    </span>
                    <div className="d-flex align-items-center">
                      <span className="d-inline-flex align-items-center me-2">
                        <i className="ti ti-brand-wechat me-1" />
                        02
                      </span>
                      <span className="d-inline-flex align-items-center">
                        <i className="ti ti-subtask me-1" />
                        04
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-3 col-xl-4 col-md-6">
              <div className="card border">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center">
                      <span className="badge badge-tag badge-soft-danger  text-danger me-2 border-0">
                        <i className="ti ti-square-rounded-filled text-danger fs-8 me-1" />
                        High
                      </span>
                      <span className="badge bg-success">Active</span>
                    </div>
                    <span className="avatar avatar-xs fs-16">
                      <i className="ti ti-star-filled text-warning" />
                    </span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between bg-light rounded p-2 mb-3">
                    <div className="d-flex align-items-center">
                      <Link
                        to={all_routes.projectDetails}
                        className="avatar border rounded-circle bg-white flex-shrink-0 me-2"
                      >
                        <ImageWithBasePath
                          src="assets/img/priority/servbook.svg"
                          className="w-auto h-auto"
                          alt="img"
                        />
                      </Link>
                      <div>
                        <h5 className="fw-medium fs-14">
                          <Link to={all_routes.projectDetails}>Servbook</Link>
                        </h5>
                        <p className="fs-13 mb-0">Meeting</p>
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
                          data-bs-target="#delete_project"
                        >
                          <i className="ti ti-trash" /> Delete
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-clipboard-copy text-green" />{" "}
                          Clone this Project
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-printer" /> Print
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-subtask" /> Add New Task
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="d-block">
                    <p className="mb-3">
                      Kofejob is a freelancers marketplace where you can post
                      projects &amp; get instant help.
                    </p>
                    <div className="mb-3">
                      <p className="d-flex align-items-center mb-2">
                        <i className="ti ti-forbid-2 me-2" />
                        Project ID : #12153
                      </p>
                      <p className="d-flex align-items-center mb-2">
                        <i className="ti ti-report-money me-2" />
                        Value : $04,10,000
                      </p>
                      <p className="d-flex align-items-center mb-2">
                        <i className="ti ti-calendar-exclamation me-2" />
                        Due Date : 29 Jan 2024
                      </p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="avatar-list-stacked avatar-group-sm">
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            className="border border-white"
                            src="assets/img/profiles/avatar-27.jpg"
                            alt="img"
                          />
                        </span>
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            className="border border-white"
                            src="assets/img/profiles/avatar-22.jpg"
                            alt="img"
                          />
                        </span>
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            src="assets/img/profiles/avatar-05.jpg"
                            alt="img"
                          />
                        </span>
                        <Link
                          className="avatar text-dark bg-light border avatar-rounded fs-10"
                          to="#"
                        >
                          +02
                        </Link>
                      </div>
                      <div className="d-flex align-items-center">
                        <span className="avatar avatar-sm p-1 border flex-shrink-0 rounded-circle">
                          <ImageWithBasePath
                            src="assets/img/icons/company-icon-10.svg"
                            alt="img"
                          />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                    <span className="badge badge-sm bg-soft-info text-info">
                      <i className="ti ti-clock-stop me-2" />
                      Total Hours : 56
                    </span>
                    <div className="d-flex align-items-center">
                      <span className="d-inline-flex align-items-center me-2">
                        <i className="ti ti-brand-wechat me-1" />
                        02
                      </span>
                      <span className="d-inline-flex align-items-center">
                        <i className="ti ti-subtask me-1" />
                        04
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-3 col-xl-4 col-md-6">
              <div className="card border">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center">
                      <span className="badge badge-tag badge-soft-danger  text-danger me-2 border-0">
                        <i className="ti ti-square-rounded-filled text-danger fs-8 me-1" />
                        High
                      </span>
                      <span className="badge bg-success">Active</span>
                    </div>
                    <span className="avatar avatar-xs fs-16">
                      <i className="ti ti-star-filled text-warning" />
                    </span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between bg-light rounded p-2 mb-3">
                    <div className="d-flex align-items-center">
                      <Link
                        to={all_routes.projectDetails}
                        className="avatar border rounded-circle bg-white flex-shrink-0 me-2"
                      >
                        <ImageWithBasePath
                          src="assets/img/priority/dreamchat.svg"
                          className="w-auto h-auto"
                          alt="img"
                        />
                      </Link>
                      <div>
                        <h5 className="fw-medium fs-14">
                          <Link to={all_routes.projectDetails}>Dreamchat</Link>
                        </h5>
                        <p className="fs-13 mb-0">Meeting</p>
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
                          data-bs-target="#delete_project"
                        >
                          <i className="ti ti-trash" /> Delete
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-clipboard-copy text-green" />{" "}
                          Clone this Project
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-printer" /> Print
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-subtask" /> Add New Task
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="d-block">
                    <p className="mb-3">
                      Kofejob is a freelancers marketplace where you can post
                      projects &amp; get instant help.
                    </p>
                    <div className="mb-3">
                      <p className="d-flex align-items-center mb-2">
                        <i className="ti ti-forbid-2 me-2" />
                        Project ID : #12154
                      </p>
                      <p className="d-flex align-items-center mb-2">
                        <i className="ti ti-report-money me-2" />
                        Value : $04,10,000
                      </p>
                      <p className="d-flex align-items-center mb-2">
                        <i className="ti ti-calendar-exclamation me-2" />
                        Due Date : 30 Jan 2024
                      </p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="avatar-list-stacked avatar-group-sm">
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            className="border border-white"
                            src="assets/img/profiles/avatar-08.jpg"
                            alt="img"
                          />
                        </span>
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            className="border border-white"
                            src="assets/img/profiles/avatar-12.jpg"
                            alt="img"
                          />
                        </span>
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            src="assets/img/profiles/avatar-15.jpg"
                            alt="img"
                          />
                        </span>
                        <Link
                          className="avatar text-dark bg-light border avatar-rounded fs-10"
                          to="#"
                        >
                          +02
                        </Link>
                      </div>
                      <div className="d-flex align-items-center">
                        <span className="avatar avatar-sm p-1 border flex-shrink-0 rounded-circle">
                          <ImageWithBasePath
                            src="assets/img/icons/company-icon-01.svg"
                            alt="img"
                          />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                    <span className="badge badge-sm bg-soft-info text-info">
                      <i className="ti ti-clock-stop me-2" />
                      Total Hours : 60
                    </span>
                    <div className="d-flex align-items-center">
                      <span className="d-inline-flex align-items-center me-2">
                        <i className="ti ti-brand-wechat me-1" />
                        02
                      </span>
                      <span className="d-inline-flex align-items-center">
                        <i className="ti ti-subtask me-1" />
                        04
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-3 col-xl-4 col-md-6">
              <div className="card border">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center">
                      <span className="badge badge-tag badge-soft-danger  text-danger me-2 border-0">
                        <i className="ti ti-square-rounded-filled text-danger fs-8 me-1" />
                        High
                      </span>
                      <span className="badge bg-success">Active</span>
                    </div>
                    <span className="avatar avatar-xs fs-16">
                      <i className="ti ti-star-filled text-warning" />
                    </span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between bg-light rounded p-2 mb-3">
                    <div className="d-flex align-items-center">
                      <Link
                        to={all_routes.projectDetails}
                        className="avatar border rounded-circle bg-white flex-shrink-0 me-2"
                      >
                        <ImageWithBasePath
                          src="assets/img/priority/sports.svg"
                          className="w-auto h-auto"
                          alt="img"
                        />
                      </Link>
                      <div>
                        <h5 className="fw-medium fs-14">
                          <Link to={all_routes.projectDetails}>Sports</Link>
                        </h5>
                        <p className="fs-13 mb-0">Web App</p>
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
                          data-bs-target="#delete_project"
                        >
                          <i className="ti ti-trash" /> Delete
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-clipboard-copy text-green" />{" "}
                          Clone this Project
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-printer" /> Print
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="ti ti-subtask" /> Add New Task
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="d-block">
                    <p className="mb-3">
                      Kofejob is a freelancers marketplace where you can post
                      projects &amp; get instant help.
                    </p>
                    <div className="mb-3">
                      <p className="d-flex align-items-center mb-2">
                        <i className="ti ti-forbid-2 me-2" />
                        Project ID : #12155
                      </p>
                      <p className="d-flex align-items-center mb-2">
                        <i className="ti ti-report-money me-2" />
                        Value : $04,10,000
                      </p>
                      <p className="d-flex align-items-center mb-2">
                        <i className="ti ti-calendar-exclamation me-2" />
                        Due Date : 31 Jan 2024
                      </p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="avatar-list-stacked avatar-group-sm">
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            className="border border-white"
                            src="assets/img/profiles/avatar-08.jpg"
                            alt="img"
                          />
                        </span>
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            className="border border-white"
                            src="assets/img/profiles/avatar-12.jpg"
                            alt="img"
                          />
                        </span>
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            src="assets/img/profiles/avatar-15.jpg"
                            alt="img"
                          />
                        </span>
                        <Link
                          className="avatar text-dark bg-light border avatar-rounded fs-10"
                          to="#"
                        >
                          +02
                        </Link>
                      </div>
                      <div className="d-flex align-items-center">
                        <span className="avatar avatar-sm p-1 border flex-shrink-0 rounded-circle">
                          <ImageWithBasePath
                            src="assets/img/icons/company-icon-02.svg"
                            alt="img"
                          />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                    <span className="badge badge-sm bg-soft-info text-info">
                      <i className="ti ti-clock-stop me-2" />
                      Total Hours : 60
                    </span>
                    <div className="d-flex align-items-center">
                      <span className="d-inline-flex align-items-center me-2">
                        <i className="ti ti-brand-wechat me-1" />
                        02
                      </span>
                      <span className="d-inline-flex align-items-center">
                        <i className="ti ti-subtask me-1" />
                        04
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* /Projects List */}
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
    <ModalProject/>
    </>
  );
};

export default ProjectsGrid;
