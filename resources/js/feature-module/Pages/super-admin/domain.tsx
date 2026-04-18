import { Link } from "react-router";
import Footer from "../../../components/footer/footer";
import PageHeader from "../../../components/page-header/pageHeader";
import ImageWithBasePath from "../../../components/imageWithBasePath";
import PredefinedDatePicker from "../../../components/common-dateRangePicker/PredefinedDatePicker";
import { all_routes } from "../../../routes/all_routes";

const Domain = () => {
  return (
    <>
      {/* ========================
			Start Page Content
		========================= */}
      <div className="page-wrapper">
        {/* Start Content */}
        <div className="content pb-0">
          {/* Page Header */}
          <PageHeader
            title="Domains"
            badgeCount={198}
            showModuleTile={false}
            showExport={true}
          />
          {/* End Page Header */}
          {/* card start */}
          <div className="card border-0 rounded-0">
            <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
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
            <div className="card-body">
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
                                Plan
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
                                      Basic
                                    </label>
                                  </li>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Advanced
                                    </label>
                                  </li>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Enterprise
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
                                      Approved
                                    </label>
                                  </li>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Pending
                                    </label>
                                  </li>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Rejected
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
                          <Link
                            to={all_routes.superadminSubscription}
                            className="btn btn-primary w-100"
                          >
                            Filter
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                
                   <PredefinedDatePicker/>
                
                </div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <div className="dropdown">
                    <Link
                      to="#"
                      className="dropdown-toggle btn btn-outline-light px-2 shadow"
                      data-bs-toggle="dropdown"
                    >
                      <i className="ti ti-sort-ascending-2 me-2" />
                      Sort By
                    </Link>
                    <div className="dropdown-menu">
                      <ul>
                        <li>
                          <Link to="#" className="dropdown-item">
                            Recently Viewed
                          </Link>
                        </li>
                        <li>
                          <Link to="#" className="dropdown-item">
                            Recently Added
                          </Link>
                        </li>
                        <li>
                          <Link to="#" className="dropdown-item">
                            Ascending
                          </Link>
                        </li>
                        <li>
                          <Link to="#" className="dropdown-item">
                            Descending
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="dropdown">
                    <Link
                      to="#"
                      className="btn bg-soft-indigo px-2 border-0"
                      data-bs-toggle="dropdown"
                      data-bs-auto-close="outside"
                    >
                      <i className="ti ti-columns-3 me-2" />
                      Manage Columns
                    </Link>
                    <div className="dropdown-menu dropdown-menu-md dropdown-md p-3">
                      <ul>
                        <li className="gap-1 d-flex align-items-center mb-2">
                          <i className="ti ti-columns me-1" />
                          <div className="form-check form-switch w-100 ps-0">
                            <label className="form-check-label d-flex align-items-center gap-2 w-100">
                              <span>Name</span>
                              <input
                                className="form-check-input switchCheckDefault ms-auto"
                                type="checkbox"
                                role="switch"
                                defaultChecked
                              />
                            </label>
                          </div>
                        </li>
                        <li className="gap-1 d-flex align-items-center mb-2">
                          <i className="ti ti-columns me-1" />
                          <div className="form-check form-switch w-100 ps-0">
                            <label className="form-check-label d-flex align-items-center gap-2 w-100">
                              <span>Domain Url</span>
                              <input
                                className="form-check-input switchCheckDefault ms-auto"
                                type="checkbox"
                                role="switch"
                                defaultChecked
                              />
                            </label>
                          </div>
                        </li>
                        <li className="gap-1 d-flex align-items-center mb-2">
                          <i className="ti ti-columns me-1" />
                          <div className="form-check form-switch w-100 ps-0">
                            <label className="form-check-label d-flex align-items-center gap-2 w-100">
                              <span>Plan</span>
                              <input
                                className="form-check-input switchCheckDefault ms-auto"
                                type="checkbox"
                                role="switch"
                                defaultChecked
                              />
                            </label>
                          </div>
                        </li>
                        <li className="gap-1 d-flex align-items-center mb-0">
                          <i className="ti ti-columns me-1" />
                          <div className="form-check form-switch w-100 ps-0">
                            <label className="form-check-label d-flex align-items-center gap-2 w-100">
                              <span>Status</span>
                              <input
                                className="form-check-input switchCheckDefault ms-auto"
                                type="checkbox"
                                role="switch"
                              />
                            </label>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              {/* table header */}
              {/* Report List */}
              <div className="table-responsive custom-table">
                <table className="table table-nowrap">
                  <thead className="table-light">
                    <tr>
                      <th className="no-sort">
                        <div className="form-check form-check-md">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="select-all"
                          />
                        </div>
                      </th>
                      <th className="no-sort" />
                      <th>Name</th>
                      <th>Domain URL</th>
                      <th>Plan</th>
                      <th>Created Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <div className="form-check form-check-md">
                          <input className="form-check-input" type="checkbox" />
                        </div>
                      </td>
                      <td>
                        <div className="set-star rating-select filled">
                          <i className="ti ti-star-filled fs-16" />
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <Link
                            to="#"
                            className="avatar rounded-circle border p-1 me-2"
                          >
                            <ImageWithBasePath
                              className="w-auto h-auto"
                              src="assets/img/icons/company-icon-01.svg"
                              alt="User Image"
                            />
                          </Link>
                          <Link to="#" className="d-flex flex-column fw-medium">
                            NovaWave LLC
                          </Link>
                        </div>
                      </td>
                      <td>nw.nova.com</td>
                      <td>Advanced (Monthly)</td>
                      <td>12 Sep 2025</td>
                      <td>
                        <span className="badge bg-success">Approved</span>
                      </td>
                      <td>
                        <div className="dropdown table-action">
                          <Link
                            to="#"
                            className="action-icon btn btn-xs shadow btn-icon btn-outline-light"
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
                              data-bs-target="#domain_approved"
                            >
                              <i className="ti ti-eye text-blue-light me-1" />{" "}
                              Preview
                            </Link>
                            <Link className="dropdown-item" to="#">
                              <i className="ti ti-download text-blue me-1" />
                              Download
                            </Link>
                            <Link
                              className="dropdown-item"
                              to="#"
                              data-bs-toggle="modal"
                              data-bs-target="#delete_domain"
                            >
                              <i className="ti ti-trash text-blue me-1" />
                              Delete
                            </Link>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="form-check form-check-md">
                          <input className="form-check-input" type="checkbox" />
                        </div>
                      </td>
                      <td>
                        <div className="set-star rating-select">
                          <i className="ti ti-star-filled fs-16" />
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <Link
                            to="#"
                            className="avatar rounded-circle border p-1 me-2"
                          >
                            <ImageWithBasePath
                              className="w-auto h-auto"
                              src="assets/img/icons/company-icon-02.svg"
                              alt="User Image"
                            />
                          </Link>
                          <Link to="#" className="d-flex flex-column fw-medium">
                            BlueSky Industries
                          </Link>
                        </div>
                      </td>
                      <td>bl.blue.com</td>
                      <td>Enterprise (Monthly)</td>
                      <td>24 Oct 2025</td>
                      <td>
                        <span className="badge bg-info">pending</span>
                      </td>
                      <td>
                        <div className="dropdown table-action">
                          <Link
                            to="#"
                            className="action-icon btn btn-xs shadow btn-icon btn-outline-light"
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
                              data-bs-target="#domain_approved"
                            >
                              <i className="ti ti-eye text-blue-light me-1" />{" "}
                              Preview
                            </Link>
                            <Link className="dropdown-item" to="#">
                              <i className="ti ti-download text-blue me-1" />
                              Download
                            </Link>
                            <Link
                              className="dropdown-item"
                              to="#"
                              data-bs-toggle="modal"
                              data-bs-target="#delete_domain"
                            >
                              <i className="ti ti-trash text-blue me-1" />
                              Delete
                            </Link>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="form-check form-check-md">
                          <input className="form-check-input" type="checkbox" />
                        </div>
                      </td>
                      <td>
                        <div className="set-star rating-select">
                          <i className="ti ti-star-filled fs-16" />
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <Link
                            to="#"
                            className="avatar rounded-circle border p-1 me-2"
                          >
                            <ImageWithBasePath
                              className="w-auto h-auto"
                              src="assets/img/icons/company-icon-03.svg"
                              alt="User Image"
                            />
                          </Link>
                          <Link to="#" className="d-flex flex-column fw-medium">
                            Silver Hawk
                          </Link>
                        </div>
                      </td>
                      <td>sh.silver.com</td>
                      <td>Advanced (Monthly)</td>
                      <td>16 Feb 2025</td>
                      <td>
                        <span className="badge bg-danger">Rejected</span>
                      </td>
                      <td>
                        <div className="dropdown table-action">
                          <Link
                            to="#"
                            className="action-icon btn btn-xs shadow btn-icon btn-outline-light"
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
                              data-bs-target="#domain_approved"
                            >
                              <i className="ti ti-eye text-blue-light me-1" />{" "}
                              Preview
                            </Link>
                            <Link className="dropdown-item" to="#">
                              <i className="ti ti-download text-blue me-1" />
                              Download
                            </Link>
                            <Link
                              className="dropdown-item"
                              to="#"
                              data-bs-toggle="modal"
                              data-bs-target="#delete_domain"
                            >
                              <i className="ti ti-trash text-blue me-1" />
                              Delete
                            </Link>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="form-check form-check-md">
                          <input className="form-check-input" type="checkbox" />
                        </div>
                      </td>
                      <td>
                        <div className="set-star rating-select">
                          <i className="ti ti-star-filled fs-16" />
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <Link
                            to="#"
                            className="avatar rounded-circle border p-1 me-2"
                          >
                            <ImageWithBasePath
                              className="w-auto h-auto"
                              src="assets/img/icons/company-icon-04.svg"
                              alt="User Image"
                            />
                          </Link>
                          <Link to="#" className="d-flex flex-column fw-medium">
                            Summit Peak
                          </Link>
                        </div>
                      </td>
                      <td>sp.summer.com</td>
                      <td>Advanced (Monthly)</td>
                      <td>20 Jul 2025</td>
                      <td>
                        <span className="badge bg-success">Approved</span>
                      </td>
                      <td>
                        <div className="dropdown table-action">
                          <Link
                            to="#"
                            className="action-icon btn btn-xs shadow btn-icon btn-outline-light"
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
                              data-bs-target="#domain_approved"
                            >
                              <i className="ti ti-eye text-blue-light me-1" />{" "}
                              Preview
                            </Link>
                            <Link className="dropdown-item" to="#">
                              <i className="ti ti-download text-blue me-1" />
                              Download
                            </Link>
                            <Link
                              className="dropdown-item"
                              to="#"
                              data-bs-toggle="modal"
                              data-bs-target="#delete_domain"
                            >
                              <i className="ti ti-trash text-blue me-1" />
                              Delete
                            </Link>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="form-check form-check-md">
                          <input className="form-check-input" type="checkbox" />
                        </div>
                      </td>
                      <td>
                        <div className="set-star rating-select">
                          <i className="ti ti-star-filled fs-16" />
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <Link
                            to="#"
                            className="avatar rounded-circle border p-1 me-2"
                          >
                            <ImageWithBasePath
                              className="w-auto h-auto"
                              src="assets/img/icons/company-icon-05.svg"
                              alt="User Image"
                            />
                          </Link>
                          <Link to="#" className="d-flex flex-column fw-medium">
                            RiverStone Ventur
                          </Link>
                        </div>
                      </td>
                      <td>ro.stone.com</td>
                      <td>Basic (Monthly)</td>
                      <td>20 Jul 2025</td>
                      <td>
                        <span className="badge bg-success">Approved</span>
                      </td>
                      <td>
                        <div className="dropdown table-action">
                          <Link
                            to="#"
                            className="action-icon btn btn-xs shadow btn-icon btn-outline-light"
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
                              data-bs-target="#domain_approved"
                            >
                              <i className="ti ti-eye text-blue-light me-1" />{" "}
                              Preview
                            </Link>
                            <Link className="dropdown-item" to="#">
                              <i className="ti ti-download text-blue me-1" />
                              Download
                            </Link>
                            <Link
                              className="dropdown-item"
                              to="#"
                              data-bs-toggle="modal"
                              data-bs-target="#delete_domain"
                            >
                              <i className="ti ti-trash text-blue me-1" />
                              Delete
                            </Link>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="form-check form-check-md">
                          <input className="form-check-input" type="checkbox" />
                        </div>
                      </td>
                      <td>
                        <div className="set-star rating-select">
                          <i className="ti ti-star-filled fs-16" />
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <Link
                            to="#"
                            className="avatar rounded-circle border p-1 me-2"
                          >
                            <ImageWithBasePath
                              className="w-auto h-auto"
                              src="assets/img/icons/company-icon-06.svg"
                              alt="User Image"
                            />
                          </Link>
                          <Link to="#" className="d-flex flex-column fw-medium">
                            Bright Bridge Grp
                          </Link>
                        </div>
                      </td>
                      <td>bb.bright.com</td>
                      <td>Enterprise (Monthly)</td>
                      <td>28 May 2025</td>
                      <td>
                        <span className="badge bg-info">Pending</span>
                      </td>
                      <td>
                        <div className="dropdown table-action">
                          <Link
                            to="#"
                            className="action-icon btn btn-xs shadow btn-icon btn-outline-light"
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
                              data-bs-target="#domain_approved"
                            >
                              <i className="ti ti-eye text-blue-light me-1" />{" "}
                              Preview
                            </Link>
                            <Link className="dropdown-item" to="#">
                              <i className="ti ti-download text-blue me-1" />
                              Download
                            </Link>
                            <Link
                              className="dropdown-item"
                              to="#"
                              data-bs-toggle="modal"
                              data-bs-target="#delete_domain"
                            >
                              <i className="ti ti-trash text-blue me-1" />
                              Delete
                            </Link>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="form-check form-check-md">
                          <input className="form-check-input" type="checkbox" />
                        </div>
                      </td>
                      <td>
                        <div className="set-star rating-select">
                          <i className="ti ti-star-filled fs-16" />
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <Link
                            to="#"
                            className="avatar rounded-circle border p-1 me-2"
                          >
                            <ImageWithBasePath
                              className="w-auto h-auto"
                              src="assets/img/icons/company-icon-07.svg"
                              alt="User Image"
                            />
                          </Link>
                          <Link to="#" className="d-flex flex-column fw-medium">
                            CoastalStar Co.
                          </Link>
                        </div>
                      </td>
                      <td>cs.coastal.com</td>
                      <td>Advanced (Monthly)</td>
                      <td>12 May 2025</td>
                      <td>
                        <span className="badge bg-success">Approved</span>
                      </td>
                      <td>
                        <div className="dropdown table-action">
                          <Link
                            to="#"
                            className="action-icon btn btn-xs shadow btn-icon btn-outline-light"
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
                              data-bs-target="#domain_approved"
                            >
                              <i className="ti ti-eye text-blue-light me-1" />{" "}
                              Preview
                            </Link>
                            <Link className="dropdown-item" to="#">
                              <i className="ti ti-download text-blue me-1" />
                              Download
                            </Link>
                            <Link
                              className="dropdown-item"
                              to="#"
                              data-bs-toggle="modal"
                              data-bs-target="#delete_domain"
                            >
                              <i className="ti ti-trash text-blue me-1" />
                              Delete
                            </Link>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="form-check form-check-md">
                          <input className="form-check-input" type="checkbox" />
                        </div>
                      </td>
                      <td>
                        <div className="set-star rating-select">
                          <i className="ti ti-star-filled fs-16" />
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <Link
                            to="#"
                            className="avatar rounded-circle border p-1 me-2"
                          >
                            <ImageWithBasePath
                              className="w-auto h-auto"
                              src="assets/img/icons/company-icon-08.svg"
                              alt="User Image"
                            />
                          </Link>
                          <Link to="#" className="d-flex flex-column fw-medium">
                            HarborView
                          </Link>
                        </div>
                      </td>
                      <td>hv.harbor.com</td>
                      <td>Advanced (Monthly)</td>
                      <td>14 April 2025</td>
                      <td>
                        <span className="badge bg-danger">Rejected</span>
                      </td>
                      <td>
                        <div className="dropdown table-action">
                          <Link
                            to="#"
                            className="action-icon btn btn-xs shadow btn-icon btn-outline-light"
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
                              data-bs-target="#domain_approved"
                            >
                              <i className="ti ti-eye text-blue-light me-1" />{" "}
                              Preview
                            </Link>
                            <Link className="dropdown-item" to="#">
                              <i className="ti ti-download text-blue me-1" />
                              Download
                            </Link>
                            <Link
                              className="dropdown-item"
                              to="#"
                              data-bs-toggle="modal"
                              data-bs-target="#delete_domain"
                            >
                              <i className="ti ti-trash text-blue me-1" />
                              Delete
                            </Link>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="form-check form-check-md">
                          <input className="form-check-input" type="checkbox" />
                        </div>
                      </td>
                      <td>
                        <div className="set-star rating-select">
                          <i className="ti ti-star-filled fs-16" />
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <Link
                            to="#"
                            className="avatar rounded-circle border p-1 me-2"
                          >
                            <ImageWithBasePath
                              className="w-auto h-auto"
                              src="assets/img/icons/company-icon-09.svg"
                              alt="User Image"
                            />
                          </Link>
                          <Link to="#" className="d-flex flex-column fw-medium">
                            Golden Gate Ltd
                          </Link>
                        </div>
                      </td>
                      <td>ggt.golden.com</td>
                      <td>Enterprise (Monthly)</td>
                      <td>03 Apr 2025</td>
                      <td>
                        <span className="badge bg-success">Approved</span>
                      </td>
                      <td>
                        <div className="dropdown table-action">
                          <Link
                            to="#"
                            className="action-icon btn btn-xs shadow btn-icon btn-outline-light"
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
                              data-bs-target="#domain_approved"
                            >
                              <i className="ti ti-eye text-blue-light me-1" />{" "}
                              Preview
                            </Link>
                            <Link className="dropdown-item" to="#">
                              <i className="ti ti-download text-blue me-1" />
                              Download
                            </Link>
                            <Link
                              className="dropdown-item"
                              to="#"
                              data-bs-toggle="modal"
                              data-bs-target="#delete_domain"
                            >
                              <i className="ti ti-trash text-blue me-1" />
                              Delete
                            </Link>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="form-check form-check-md">
                          <input className="form-check-input" type="checkbox" />
                        </div>
                      </td>
                      <td>
                        <div className="set-star rating-select">
                          <i className="ti ti-star-filled fs-16" />
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <Link
                            to="#"
                            className="avatar rounded-circle border p-1 me-2"
                          >
                            <ImageWithBasePath
                              className="w-auto h-auto"
                              src="assets/img/icons/company-icon-10.svg"
                              alt="User Image"
                            />
                          </Link>
                          <Link to="#" className="d-flex flex-column fw-medium">
                            Redwood Inc
                          </Link>
                        </div>
                      </td>
                      <td>ri.redwood.com</td>
                      <td>Basic (Monthly)</td>
                      <td>25 Feb 2025</td>
                      <td>
                        <span className="badge bg-success">Approved</span>
                      </td>
                      <td>
                        <div className="dropdown table-action">
                          <Link
                            to="#"
                            className="action-icon btn btn-xs shadow btn-icon btn-outline-light"
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
                              data-bs-target="#domain_approved"
                            >
                              <i className="ti ti-eye text-blue-light me-1" />{" "}
                              Preview
                            </Link>
                            <Link className="dropdown-item" to="#">
                              <i className="ti ti-download text-blue me-1" />
                              Download
                            </Link>
                            <Link
                              className="dropdown-item"
                              to="#"
                              data-bs-toggle="modal"
                              data-bs-target="#delete_domain"
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
              <div className="row align-items-center">
                <div className="col-md-6">
                  <div className="datatable-length" />
                </div>
                <div className="col-md-6">
                  <div className="datatable-paginate" />
                </div>
              </div>
              {/* /Contact List */}
            </div>
          </div>
          {/* card end */}
        </div>
        {/* End Content */}
        {/* Start Footer */}
        <Footer />
        {/* End Footer */}
      </div>
      {/* ========================
			End Page Content
		========================= */}
      {/* Start Domain Details */}
      <div className="modal fade" id="domain_approved">
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title d-flex align-items-center">
                Domain Detail
                <span className="badge bg-success ms-2">Approved</span>
              </h4>
              <button
                type="button"
                className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <form >
              <div className="modal-body">
                <div className="p-2 mb-3 rounded border bg-light">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="d-flex align-items-center file-name-icon">
                        <Link
                          to="#"
                          className="avatar avatar-sm border avatar-rounded p-1"
                        >
                          <ImageWithBasePath
                            src="assets/img/icons/company-icon-01.svg"
                            className="img-fluid"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <h6 className="fw-medium fs-14 mb-0">
                            <Link to="#">NovaWave LLC</Link>
                          </h6>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="accordion accordion-bordered"
                  id="main_accordion1"
                >
                  {/* Start Details Info */}
                  <div className="accordion-item rounded">
                    <div className="accordion-header">
                      <Link
                        to="#"
                        className="accordion-button accordion-custom-button rounded"
                        data-bs-toggle="collapse"
                        data-bs-target="#basic4"
                      >
                        <span className="avatar avatar-md rounded me-1">
                          <i className="ti ti-chart-circles" />
                        </span>
                        Plan Details
                      </Link>
                    </div>
                    <div
                      className="accordion-collapse collapse"
                      id="basic4"
                      data-bs-parent="#main_accordion2"
                    >
                      <div className="accordion-body border-top">
                        <div className="row align-items-center row-gap-3 mb-3">
                          <div className="col-md-4">
                            <div>
                              <p className="fs-14 mb-1">Plan Name</p>
                              <p className="fs-14 fw-semibold text-dark mb-0">
                                Advanced
                              </p>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div>
                              <p className="fs-14 mb-1">Plan Type</p>
                              <p className="fs-14 fw-semibold text-dark mb-0">
                                Monthly
                              </p>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div>
                              <p className="fs-14 mb-1">Account URL</p>
                              <p className="fs-14 fw-semibold text-dark mb-0">
                                nw.example.com
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="row align-items-center row-gap-3">
                          <div className="col-md-4">
                            <div>
                              <p className="fs-14 mb-1">Price</p>
                              <p className="fs-14 fw-semibold text-dark mb-0">
                                200
                              </p>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div>
                              <p className="fs-14 mb-1">Register Date</p>
                              <p className="fs-14 fw-semibold text-dark mb-0">
                                25 Oct 2025
                              </p>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div>
                              <p className="fs-14 mb-1">Register Date</p>
                              <p className="fs-14 fw-semibold text-dark mb-0">
                                25 Oct 2024
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* End Details Info */}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* End Domain Details */}
      {/* delete modal */}
      <div className="modal fade" id="delete_domain">
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
                Are you sure you want to remove contact you selected.
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
      {/* delete modal */}
    </>
  );
};

export default Domain;
