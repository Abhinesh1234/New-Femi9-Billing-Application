import { Link } from "react-router";
import Footer from "../../../../components/footer/footer";
import PageHeader from "../../../../components/page-header/pageHeader";
import { all_routes } from "../../../../routes/all_routes";
import ImageWithBasePath from "../../../../components/imageWithBasePath";
import {
  Assigned_To,
  Reminder,
  Task_Priority,
} from "../../../../core/json/selectOption";
import CommonSelect from "../../../../components/common-select/commonSelect";
import ModalProjectDetails from "./modal/modalProjectDetails";

const ProjectDetails = () => {
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
            title="Project"
            badgeCount={125}
            showModuleTile={false}
            showExport={true}
          />
          {/* End Page Header */}
          <div className="row">
            <div className="col-md-12">
              <div className="mb-3">
                <Link to={all_routes.projectsGrid}>
                  <i className="ti ti-arrow-narrow-left me-1" />
                  Back to Projects
                </Link>
              </div>
              <div className="card">
                <div className="card-body pb-2">
                  <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <div className="d-flex align-items-center mb-2">
                      <div className="avatar avatar-xxl p-2 avatar-rounded border me-3 flex-shrink-0">
                        <ImageWithBasePath
                          src="assets/img/priority/truellysel.svg"
                          alt="img"
                          className="avatar avtart-sm rounded-circle"
                        />
                      </div>
                      <div>
                        <h5 className="mb-1">Trulysell</h5>
                        <p className="mb-1">
                          Project Id :{" "}
                          <span className="text-dark fw-medium">154454887</span>
                        </p>
                        <div className="d-flex align-items-center">
                          <span className="badge badge-sm badge-soft-danger fw-medium me-2 border-0">
                            <i className="ti ti-arrow-up-right me-1" />
                            High
                          </span>
                          <span className="badge badge-sm bg-success">
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="d-flex align-items-center flex-wrap gap-2">
                      <span className="py-1 px-2 fs-12 bg-soft-danger rounded text-danger fw-medium">
                        <i className="ti ti-lock me-1" />
                        Private
                      </span>
                      <div className="dropdown">
                        <Link
                          to="#"
                          className="btn btn-xs btn-success fs-12 py-1 px-2 fw-medium d-inline-flex align-items-center"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          {" "}
                          <i className="ti ti-thumb-up me-1" />
                          Completed
                          <i className="ti ti-chevron-down ms-1" />{" "}
                        </Link>
                        <div className="dropdown-menu dropdown-menu-right">
                          <Link className="dropdown-item" to="#">
                            <span>Completed</span>
                          </Link>
                          <Link className="dropdown-item" to="#">
                            <span>Development</span>
                          </Link>
                          <Link className="dropdown-item" to="#">
                            <span>Design</span>
                          </Link>
                          <Link className="dropdown-item" to="#">
                            <span>Plan</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* /Contact User */}
            </div>
            {/* Contact Sidebar */}
            <div className="col-xl-4">
              <div className="card">
                <div className="card-body p-3">
                  <h6 className="mb-3 fw-semibold">Project Information</h6>
                  <div className="border-bottom mb-3 pb-3">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <p className="mb-0">Start Date</p>
                      <p className="mb-0 text-dark"> 27 Sep 2025, 11:45 PM</p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <p className="mb-0">Due Date </p>
                      <p className="mb-0 text-dark"> 27 Sep 2025, 11:45 PM</p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <p className="mb-0">Deal Value</p>
                      <p className="mb-0 text-dark">$25,11,145</p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <p className="mb-0">Project Type</p>
                      <p className="mb-0 text-dark">Mobile Application</p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <p className="mb-0">Project Timing</p>
                      <p className="mb-0 text-dark">Hourly</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <h6 className="mb-3 fw-semibold">Client</h6>
                    <Link to="#" className="link-primary mb-3">
                      <i className="ti ti-plus me-1" />
                      Add New
                    </Link>
                  </div>
                  <div className="mb-3">
                    <div className="d-flex align-items-center">
                      <span className="avatar avatar-xs rounded-circle me-2">
                        <ImageWithBasePath
                          src="assets/img/icons/company-icon-08.svg"
                          alt=""
                          className="img-fluid rounded-circle w-auto h-auto"
                        />
                      </span>
                      <div>
                        <p className="mb-0">Jessica Sen</p>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <h6 className="mb-3 fw-semibold">Responsible Persons</h6>
                    <Link
                      to="#"
                      className="link-primary mb-3"
                      data-bs-toggle="modal"
                      data-bs-target="#add_contact"
                    >
                      <i className="ti ti-plus me-1" />
                      Add New
                    </Link>
                  </div>
                  <div className="mb-3">
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
                          className="border border-white"
                          src="assets/img/profiles/avatar-03.jpg"
                          alt="img"
                        />
                      </span>
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
                      <Link
                        className="avatar bg-light avatar-rounded text-dark"
                        to="#"
                      >
                        +1
                      </Link>
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <h6 className="mb-3 fw-semibold">Team Leader</h6>
                    <Link to="#" className="link-primary mb-3">
                      Change
                    </Link>
                  </div>
                  <div className="mb-3">
                    <div className="d-flex align-items-center">
                      <span className="avatar avatar-xs rounded-circle me-2">
                        <ImageWithBasePath
                          src="assets/img/users/avatar-4.jpg"
                          alt=""
                          className="img-fluid rounded-circle w-auto h-auto"
                        />
                      </span>
                      <div>
                        <p className="mb-0">Jessica Sen</p>
                      </div>
                    </div>
                  </div>
                  <hr />
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h6 className="mb-0 fw-semibold">Pipeline</h6>
                    <p className="mb-0 fw-medium text-dark">
                      <i className="ti ti-timeline-event-text me-1" />
                      Marketing Pipeline
                    </p>
                  </div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <p className="mb-0">Last Modified </p>
                    <p className="mb-0 text-dark"> 27 Sep 2025, 11:45 PM</p>
                  </div>
                  <hr />
                  <div className="d-flex align-items-center justify-content-between mb-0">
                    <p className="mb-0">Modified By</p>
                    <div className="d-flex align-items-center">
                      <span className="avatar avatar-xs rounded-circle me-2">
                        <ImageWithBasePath
                          src="assets/img/users/avatar-2.jpg"
                          alt=""
                          className="img-fluid rounded-circle w-auto h-auto"
                        />
                      </span>
                      <div>
                        <p className="mb-0">Darlee Robertson</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* /Contact Sidebar */}
            {/* Contact Details */}
            <div className="col-xl-8">
              <div className="mb-3 pb-3 border-bottom">
                <h5 className="mb-3">Project Pipeline Status</h5>
                <div className="step-progress d-flex flex-wrap gap-2">
                  <div className="step bg-indigo">Plan</div>
                  <div className="step bg-cyan">Design</div>
                  <div className="step bg-success">Development</div>
                  <div className="step bg-orange">Completed</div>
                  <div className="step bg-transparent" />
                </div>
              </div>
              <div className="card mb-3">
                <div className="card-body pb-0 pt-2 px-2">
                  <ul
                    className="nav nav-tabs nav-bordered border-0 mb-0"
                    role="tablist"
                  >
                    <li className="nav-item" role="presentation">
                      <Link
                        to="#tab_1"
                        data-bs-toggle="tab"
                        aria-expanded="false"
                        className="nav-link active border-3"
                        aria-selected="true"
                        role="tab"
                      >
                        <span className="d-md-inline-block">
                          <i className="ti ti-alarm-minus me-1" />
                          Activities
                        </span>
                      </Link>
                    </li>
                    <li className="nav-item" role="presentation">
                      <Link
                        to="#tab_2"
                        data-bs-toggle="tab"
                        aria-expanded="true"
                        className="nav-link border-3"
                        aria-selected="false"
                        role="tab"
                        tabIndex={-1}
                      >
                        <span className="d-md-inline-block">
                          <i className="ti ti-notes me-1" />
                          Notes
                        </span>
                      </Link>
                    </li>
                    <li className="nav-item" role="presentation">
                      <Link
                        to="#tab_3"
                        data-bs-toggle="tab"
                        aria-expanded="false"
                        className="nav-link border-3"
                        aria-selected="false"
                        tabIndex={-1}
                        role="tab"
                      >
                        <span className="d-md-inline-block">
                          <i className="ti ti-phone me-1" />
                          Calls
                        </span>
                      </Link>
                    </li>
                    <li className="nav-item" role="presentation">
                      <Link
                        to="#tab_4"
                        data-bs-toggle="tab"
                        aria-expanded="false"
                        className="nav-link border-3"
                        aria-selected="false"
                        tabIndex={-1}
                        role="tab"
                      >
                        <span className="d-md-inline-block">
                          <i className="ti ti-file me-1" />
                          Files
                        </span>
                      </Link>
                    </li>
                    <li className="nav-item" role="presentation">
                      <Link
                        to="#tab_5"
                        data-bs-toggle="tab"
                        aria-expanded="false"
                        className="nav-link border-3"
                        aria-selected="false"
                        tabIndex={-1}
                        role="tab"
                      >
                        <span className="d-md-inline-block">
                          <i className="ti ti-mail-check me-1" />
                          Email
                        </span>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              {/* Tab Content */}
              <div className="tab-content pt-0">
                {/* Activities */}
                <div className="tab-pane active show" id="tab_1">
                  <div className="card">
                    <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                      <h5 className="fw-semibold mb-0">Activities</h5>
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
                                Newest
                              </Link>
                            </li>
                            <li>
                              <Link to="#" className="dropdown-item">
                                Oldest
                              </Link>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="badge badge-soft-info border-0 mb-3">
                        <i className="ti ti-calendar-check me-1" />
                        28 May 2025
                      </div>
                      <div className="card border shadow-none mb-3">
                        <div className="card-body p-3">
                          <div className="d-flex flex-wrap row-gap-2">
                            <span className="avatar avatar-md flex-shrink-0 rounded me-2 bg-info">
                              <i className="ti ti-mail-code fs-20" />
                            </span>
                            <div>
                              <h6 className="fw-medium fs-14 mb-1">
                                You sent 1 Message to the contact.
                              </h6>
                              <p className="mb-0">10:25 pm</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="card border shadow-none mb-3">
                        <div className="card-body p-3">
                          <div className="d-flex flex-wrap row-gap-2">
                            <span className="avatar avatar-md flex-shrink-0 rounded me-2 bg-teal">
                              <i className="ti ti-phone fs-20" />
                            </span>
                            <div>
                              <h6 className="fw-medium fs-14 mb-1">
                                Denwar responded to your appointment schedule by
                                call at 09:30pm.
                              </h6>
                              <p className="mb-0">09:25 pm</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="card border shadow-none mb-3">
                        <div className="card-body p-3">
                          <div className="d-flex align-items-center flex-lg-nowrap flex-wrap row-gap-2">
                            <span className="avatar avatar-md flex-shrink-0 rounded me-2 bg-danger">
                              <i className="ti ti-notes fs-20" />
                            </span>
                            <div>
                              <h6 className="fw-medium fs-14 mb-1">
                                Notes added by Antony
                              </h6>
                              <p className="mb-1">
                                Please accept my apologies for the inconvenience
                                caused. It would be much appreciated if it's
                                possible to reschedule to 6:00 PM, or any other
                                day that week.
                              </p>
                              <p className="mb-0">10.00 pm</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="badge badge-soft-info border-0 mb-3">
                        <i className="ti ti-calendar-check me-1" />
                        27 May 2025
                      </div>
                      <div className="card border shadow-none mb-3">
                        <div className="card-body p-3">
                          <div className="d-flex flex-wrap row-gap-2">
                            <span className="avatar avatar-md flex-shrink-0 rounded me-2 bg-warning">
                              <i className="ti ti-user-pin fs-20" />
                            </span>
                            <div>
                              <h6 className="fw-medium mb-1 d-inline-flex align-items-center fs-14 flex-wrap">
                                Meeting With{" "}
                                <span className="avatar avatar-xs rounded mx-2">
                                  <ImageWithBasePath
                                    src="assets/img/profiles/avatar-19.jpg"
                                    alt="img"
                                  />
                                </span>{" "}
                                Abraham
                              </h6>
                              <p className="mb-0">Schedueled on 05:00 pm</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="card border shadow-none mb-3">
                        <div className="card-body p-3">
                          <div className="d-flex flex-wrap row-gap-2">
                            <span className="avatar avatar-md flex-shrink-0 rounded me-2 bg-teal">
                              <i className="ti ti-notes fs-20" />
                            </span>
                            <div>
                              <h6 className="fw-medium fs-14 mb-1">
                                Drain responded to your appointment schedule
                                question.
                              </h6>
                              <p className="mb-0">09:25 pm</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="badge badge-soft-info border-0 mb-3">
                        <i className="ti ti-calendar-check me-1" />
                        Upcoming Activity
                      </div>
                      <div className="card border shadow-none mb-0">
                        <div className="card-body p-3">
                          <div className="d-flex flex-lg-nowrap flex-wrap row-gap-2">
                            <span className="avatar avatar-md flex-shrink-0 rounded me-2 bg-warning">
                              <i className="ti ti-user-pin fs-20" />
                            </span>
                            <div>
                              <h6 className="fw-medium fs-14 mb-1">
                                Product Meeting
                              </h6>
                              <p className="mb-1">
                                A product team meeting is a gathering of the
                                cross-functional product team — ideally
                                including team members from product,
                                engineering, marketing, and customer support.
                              </p>
                              <p>25 Jul 2023, 05:00 pm</p>
                              <div className="card mb-0">
                                <div className="card-body">
                                  <div className="row gy-3">
                                    <div className="col-md-4">
                                      <div>
                                        <label className="form-label">
                                          Reminder{" "}
                                          <span className="text-danger">*</span>
                                        </label>
                                        <CommonSelect
                                          options={Reminder}
                                          className="select"
                                          defaultValue={Reminder[0]}
                                        />
                                      </div>
                                    </div>
                                    <div className="col-md-4">
                                      <div>
                                        <label className="form-label">
                                          Task Priority{" "}
                                          <span className="text-danger">*</span>
                                        </label>
                                        <CommonSelect
                                          options={Task_Priority}
                                          className="select"
                                          defaultValue={Task_Priority[0]}
                                        />
                                      </div>
                                    </div>
                                    <div className="col-md-4">
                                      <div>
                                        <label className="form-label">
                                          Assigned To{" "}
                                          <span className="text-danger">*</span>
                                        </label>
                                        <CommonSelect
                                          options={Assigned_To}
                                          className="select"
                                          defaultValue={Assigned_To[0]}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* /Activities */}
                {/* Notes */}
                <div className="tab-pane fade" id="tab_2">
                  <div className="card">
                    <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                      <h5 className="fw-semibold mb-0">Notes</h5>
                      <div className="d-inline-flex align-items-center">
                        <div className="dropdown me-2">
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
                                  Newest
                                </Link>
                              </li>
                              <li>
                                <Link to="#" className="dropdown-item">
                                  Oldest
                                </Link>
                              </li>
                            </ul>
                          </div>
                        </div>
                        <Link
                          to="#"
                          data-bs-toggle="modal"
                          data-bs-target="#add_notes"
                          className="link-primary fw-medium"
                        >
                          <i className="ti ti-circle-plus me-1" />
                          Add New
                        </Link>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="notes-activity">
                        <div className="card mb-3">
                          <div className="card-body">
                            <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2 pb-2">
                              <div className="d-inline-flex align-items-center mb-2">
                                <span className="avatar avatar-md me-2 flex-shrink-0">
                                  <ImageWithBasePath
                                    src="assets/img/profiles/avatar-19.jpg"
                                    alt="img"
                                  />
                                </span>
                                <div>
                                  <h6 className="fw-medium fs-14 mb-1">
                                    Darlee Robertson
                                  </h6>
                                  <p className="mb-0 fs-13">
                                    15 Sep 2023, 12:10 pm
                                  </p>
                                </div>
                              </div>
                              <div className="mb-2">
                                <div className="dropdown">
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
                                      data-bs-toggle="modal"
                                      data-bs-target="#edit_notes"
                                    >
                                      <i className="ti ti-edit me-1" />
                                      Edit
                                    </Link>
                                    <Link
                                      className="dropdown-item"
                                      to="#"
                                      data-bs-toggle="modal"
                                      data-bs-target="#delete_note"
                                    >
                                      <i className="ti ti-trash me-1" />
                                      Delete
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <h5 className="fw-medium fs-14 mb-1">
                              Notes added by Antony
                            </h5>
                            <p className="mb-3">
                              A project review evaluates the success of an
                              initiative and identifies areas for improvement.
                              It can also evaluate a current project to
                              determine whether it's on the right track. Or, it
                              can determine the success of a completed project.
                            </p>
                            <div className="row">
                              <div className="col-xxl-4 col-lg-5">
                                <div className="card">
                                  <div className="card-body p-2">
                                    <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                                      <div className="d-flex align-items-center me-3">
                                        <span className="avatar bg-success me-2">
                                          <i className="ti ti-file-spreadsheet fs-20" />
                                        </span>
                                        <div>
                                          <h6 className="fw-medium fs-14 mb-1">
                                            Project Specs.xls
                                          </h6>
                                          <p className="mb-0">365 KB</p>
                                        </div>
                                      </div>
                                      <Link
                                        to="#"
                                        className="avatar avatar-xs rounded-circle bg-light text-dark"
                                      >
                                        <i className="ti ti-arrow-down" />
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="col-xxl-4 col-lg-5">
                                <div className="card bg-light">
                                  <div className="card-body p-2">
                                    <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                                      <div className="d-flex align-items-center me-3">
                                        <span className="avatar bg-success me-2">
                                          <ImageWithBasePath
                                            src="assets/img/media/media-35.jpg"
                                            alt="img"
                                          />
                                        </span>
                                        <div>
                                          <h6 className="fw-medium fs-14 mb-1">
                                            637.jpg
                                          </h6>
                                          <p className="mb-0">365 KB</p>
                                        </div>
                                      </div>
                                      <Link
                                        to="#"
                                        className="avatar avatar-xs rounded-circle bg-white text-dark"
                                      >
                                        <i className="ti ti-arrow-down" />
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="notes-editor">
                              <div className="note-edit-wrap">
                                <div className="editor pages-editor" />
                                <div className="text-end note-btns mt-3">
                                  <Link
                                    to="#"
                                    className="btn btn-light add-cancel me-2"
                                  >
                                    Cancel
                                  </Link>
                                  <Link to="#" className="btn btn-primary">
                                    Save
                                  </Link>
                                </div>
                              </div>
                              <div className="text-end mt-2">
                                <Link
                                  to="#"
                                  className="add-comment link-primary fw-medium"
                                >
                                  <i className="ti ti-circle-plus me-1" />
                                  Add Comment
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="card mb-3">
                          <div className="card-body">
                            <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2 pb-2">
                              <div className="d-inline-flex align-items-center mb-2">
                                <span className="avatar avatar-md me-2 flex-shrink-0">
                                  <ImageWithBasePath
                                    src="assets/img/profiles/avatar-20.jpg"
                                    alt="img"
                                  />
                                </span>
                                <div>
                                  <h6 className="fw-medium fs-14 mb-1">
                                    Sharon Roy
                                  </h6>
                                  <p className="mb-0">18 Sep 2023, 09:52 am</p>
                                </div>
                              </div>
                              <div className="mb-2">
                                <div className="dropdown">
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
                                      data-bs-toggle="modal"
                                      data-bs-target="#edit_notes"
                                    >
                                      <i className="ti ti-edit me-1" />
                                      Edit
                                    </Link>
                                    <Link
                                      className="dropdown-item"
                                      to="#"
                                      data-bs-toggle="modal"
                                      data-bs-target="#delete_note"
                                    >
                                      <i className="ti ti-trash me-1" />
                                      Delete
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <h5 className="fw-medium fs-14 mb-1">
                              Notes added by Antony
                            </h5>
                            <p>
                              A project plan typically contains a list of the
                              essential elements of a project, such as
                              stakeholders, scope, timelines, estimated cost and
                              communication methods. The project manager
                              typically lists the information based on the
                              assignment.
                            </p>
                            <div className="row">
                              <div className="col-xxl-4 col-lg-5">
                                <div className="card">
                                  <div className="card-body p-2">
                                    <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                                      <div className="d-flex align-items-center me-3">
                                        <span className="avatar bg-teal me-2">
                                          <i className="ti ti-file-spreadsheet fs-20" />
                                        </span>
                                        <div>
                                          <h6 className="fw-medium fs-14 mb-1">
                                            Andewpass.txt
                                          </h6>
                                          <p className="mb-0">365 KB</p>
                                        </div>
                                      </div>
                                      <Link
                                        to="#"
                                        className="avatar avatar-xs rounded-circle bg-light text-dark"
                                      >
                                        <i className="ti ti-arrow-down" />
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="bg-light p-3 rounded">
                              <p className="mb-2">
                                The best way to get a project done faster is to
                                start sooner. A goal without a timeline is just
                                a dream.The goal you set must be challenging. At
                                the same time, it should be realistic and
                                attainable, not impossible to reach.
                              </p>
                              <p>
                                Commented by{" "}
                                <span className="text-info">Aeron</span> on 15
                                Sep 2024, 11:15 pm
                              </p>
                              <Link
                                to="#"
                                className="btn btn-outline-white bg-white btn-sm"
                              >
                                <i className="ti ti-arrow-back-up-double me-1" />
                                Reply
                              </Link>
                            </div>
                          </div>
                        </div>
                        <div className="card mb-0">
                          <div className="card-body">
                            <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2 pb-2">
                              <div className="d-inline-flex align-items-center mb-2">
                                <span className="avatar avatar-md me-2 flex-shrink-0">
                                  <ImageWithBasePath
                                    src="assets/img/profiles/avatar-21.jpg"
                                    alt="img"
                                  />
                                </span>
                                <div>
                                  <h6 className="fw-medium fs-14 mb-1">
                                    Vaughan Lewis
                                  </h6>
                                  <p className="mb-0">20 Sep 2023, 10:26 pm</p>
                                </div>
                              </div>
                              <div className="mb-2">
                                <div className="dropdown">
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
                                      data-bs-toggle="modal"
                                      data-bs-target="#edit_notes"
                                    >
                                      <i className="ti ti-edit me-1" />
                                      Edit
                                    </Link>
                                    <Link
                                      className="dropdown-item"
                                      to="#"
                                      data-bs-toggle="modal"
                                      data-bs-target="#delete_note"
                                    >
                                      <i className="ti ti-trash me-1" />
                                      Delete
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <p className="mb-0">
                              Projects play a crucial role in the success of
                              organizations, and their importance cannot be
                              overstated. Whether it's launching a new product,
                              improving an existing
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* /Notes */}
                {/* Calls */}
                <div className="tab-pane fade" id="tab_3">
                  <div className="card">
                    <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                      <h5 className="fw-semibold mb-0">Calls</h5>
                      <div className="d-inline-flex align-items-center">
                        <Link
                          to="#"
                          data-bs-toggle="modal"
                          data-bs-target="#create_call"
                          className="link-primary fw-medium"
                        >
                          <i className="ti ti-circle-plus me-1" />
                          Add New
                        </Link>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="card mb-3">
                        <div className="card-body">
                          <div className="d-sm-flex align-items-center justify-content-between pb-2">
                            <div className="d-flex align-items-center mb-2">
                              <span className="avatar avatar-md me-2 flex-shrink-0">
                                <ImageWithBasePath
                                  src="assets/img/profiles/avatar-19.jpg"
                                  alt="img"
                                />
                              </span>
                              <p className="mb-0">
                                <span className="text-dark fw-medium">
                                  Darlee Robertson
                                </span>
                                logged a call on 23 Jul 2023, 10:00 pm
                              </p>
                            </div>
                            <div className="d-inline-flex align-items-center mb-2">
                              <div className="dropdown me-2">
                                <Link
                                  to="#"
                                  className="btn btn-sm btn-outline-light"
                                  data-bs-toggle="dropdown"
                                  aria-expanded="false"
                                >
                                  Busy
                                  <i className="ti ti-chevron-down ms-2" />
                                </Link>
                                <div className="dropdown-menu dropdown-menu-right">
                                  <Link className="dropdown-item" to="#">
                                    Busy
                                  </Link>
                                  <Link className="dropdown-item" to="#">
                                    No Answer
                                  </Link>
                                  <Link className="dropdown-item" to="#">
                                    Unavailable
                                  </Link>
                                  <Link className="dropdown-item" to="#">
                                    Wrong Number
                                  </Link>
                                  <Link className="dropdown-item" to="#">
                                    Left Voice Message
                                  </Link>
                                  <Link className="dropdown-item" to="#">
                                    Moving Forward
                                  </Link>
                                </div>
                              </div>
                              <div className="dropdown">
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
                                    data-bs-toggle="modal"
                                    data-bs-target="#edit_call"
                                  >
                                    <i className="ti ti-edit me-1" />
                                    Edit
                                  </Link>
                                  <Link
                                    className="dropdown-item"
                                    to="#"
                                    data-bs-toggle="modal"
                                    data-bs-target="#delete_call"
                                  >
                                    <i className="ti ti-trash me-1" />
                                    Delete
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                          <p className="mb-0">
                            A project review evaluates the success of an
                            initiative and identifies areas for improvement. It
                            can also evaluate a current project to determine
                            whether it's on the right track. Or, it can
                            determine the success of a completed project.
                          </p>
                        </div>
                      </div>
                      <div className="card mb-3">
                        <div className="card-body">
                          <div className="d-sm-flex align-items-center justify-content-between pb-2">
                            <div className="d-flex align-items-center mb-2">
                              <span className="avatar avatar-md me-2 flex-shrink-0">
                                <ImageWithBasePath
                                  src="assets/img/profiles/avatar-20.jpg"
                                  alt="img"
                                />
                              </span>
                              <p className="mb-0">
                                <span className="text-dark fw-medium">
                                  Sharon Roy
                                </span>
                                logged a call on 18 Sep 2025, 09:52AM
                              </p>
                            </div>
                            <div className="d-inline-flex align-items-center mb-2">
                              <div className="dropdown me-2">
                                <Link
                                  to="#"
                                  className="btn btn-sm btn-outline-light"
                                  data-bs-toggle="dropdown"
                                  aria-expanded="false"
                                >
                                  No Answrer
                                  <i className="ti ti-chevron-down ms-2" />
                                </Link>
                                <div className="dropdown-menu dropdown-menu-right">
                                  <Link className="dropdown-item" to="#">
                                    No Answrer
                                  </Link>
                                  <Link className="dropdown-item" to="#">
                                    Unavailable
                                  </Link>
                                  <Link className="dropdown-item" to="#">
                                    Wrong Number
                                  </Link>
                                  <Link className="dropdown-item" to="#">
                                    Left Voice Message
                                  </Link>
                                  <Link className="dropdown-item" to="#">
                                    Moving Forward
                                  </Link>
                                </div>
                              </div>
                              <div className="dropdown">
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
                                    data-bs-toggle="modal"
                                    data-bs-target="#edit_call"
                                  >
                                    <i className="ti ti-edit me-1" />
                                    Edit
                                  </Link>
                                  <Link
                                    className="dropdown-item"
                                    to="#"
                                    data-bs-toggle="modal"
                                    data-bs-target="#delete_call"
                                  >
                                    <i className="ti ti-trash me-1" />
                                    Delete
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                          <p className="mb-0">
                            A project plan typically contains a list of the
                            essential elements of a project, such as
                            stakeholders, scope, timelines, estimated cost and
                            communication methods. The project manager typically
                            lists the information based on the assignment.
                          </p>
                        </div>
                      </div>
                      <div className="card mb-0">
                        <div className="card-body">
                          <div className="d-sm-flex align-items-center justify-content-between pb-2">
                            <div className="d-flex align-items-center mb-2">
                              <span className="avatar avatar-md me-2 flex-shrink-0">
                                <ImageWithBasePath
                                  src="assets/img/profiles/avatar-21.jpg"
                                  alt="img"
                                />
                              </span>
                              <p className="mb-0">
                                <span className="text-dark fw-medium">
                                  Vaughan
                                </span>
                                logged a call on 20 Sep 2025, 10:26 PM
                              </p>
                            </div>
                            <div className="d-inline-flex align-items-center mb-2">
                              <div className="dropdown me-2">
                                <Link
                                  to="#"
                                  className="btn btn-sm btn-outline-light"
                                  data-bs-toggle="dropdown"
                                  aria-expanded="false"
                                >
                                  No Answrer
                                  <i className="ti ti-chevron-down ms-2" />
                                </Link>
                                <div className="dropdown-menu dropdown-menu-right">
                                  <Link className="dropdown-item" to="#">
                                    No Answrer
                                  </Link>
                                  <Link className="dropdown-item" to="#">
                                    Unavailable
                                  </Link>
                                  <Link className="dropdown-item" to="#">
                                    Wrong Number
                                  </Link>
                                  <Link className="dropdown-item" to="#">
                                    Left Voice Message
                                  </Link>
                                  <Link className="dropdown-item" to="#">
                                    Moving Forward
                                  </Link>
                                </div>
                              </div>
                              <div className="dropdown">
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
                                    data-bs-toggle="modal"
                                    data-bs-target="#edit_call"
                                  >
                                    <i className="ti ti-edit me-1" />
                                    Edit
                                  </Link>
                                  <Link
                                    className="dropdown-item"
                                    to="#"
                                    data-bs-toggle="modal"
                                    data-bs-target="#delete_call"
                                  >
                                    <i className="ti ti-trash me-1" />
                                    Delete
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                          <p className="mb-0">
                            Projects play a crucial role in the success of
                            organizations, and their importance cannot be
                            overstated. Whether it's launching a new product,
                            improving an existing
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* /Calls */}
                {/* Files */}
                <div className="tab-pane fade" id="tab_4">
                  <div className="card">
                    <div className="card-header">
                      <h5 className="fw-semibold mb-0">Files</h5>
                    </div>
                    <div className="card-body">
                      <div className="card border mb-3">
                        <div className="card-body pb-0">
                          <div className="row align-items-center">
                            <div className="col-md-8">
                              <div className="mb-3">
                                <h6 className="mb-1">Manage Documents</h6>
                                <p>
                                  Send customizable quotes, proposals and
                                  contracts to close deals faster.
                                </p>
                              </div>
                            </div>
                            <div className="col-md-4 text-md-end">
                              <div className="mb-3">
                                <Link
                                  to="#"
                                  className="btn btn-primary"
                                  data-bs-toggle="modal"
                                  data-bs-target="#new_file"
                                >
                                  Create Document
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="card border shadow-none mb-3">
                        <div className="card-body pb-0">
                          <div className="row align-items-center">
                            <div className="col-md-8">
                              <div className="mb-3">
                                <h6 className="fw-semibold fs-14 mb-1">
                                  Collier-Turner Proposal
                                </h6>
                                <p>
                                  Send customizable quotes, proposals and
                                  contracts to close deals faster.
                                </p>
                                <div className="d-flex align-items-center flex-wrap row-gap-2">
                                  <span className="avatar avatar-md me-2 flex-shrink-0">
                                    <ImageWithBasePath
                                      src="assets/img/profiles/avatar-21.jpg"
                                      alt="img"
                                      className="rounded-circle"
                                    />
                                  </span>
                                  <div className="d-flex align-items-center">
                                    <p className="mb-0 me-2">Vaughan Lewis</p>
                                    <span className="badge bg-light text-body">
                                      Owner
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-4 text-md-end">
                              <div className="mb-3 d-inline-flex align-items-center">
                                <span className="badge badge-soft-danger me-1">
                                  Proposal
                                </span>
                                <span className="badge bg-info me-1">
                                  Draft
                                </span>
                                <div className="dropdown">
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
                                      data-bs-toggle="modal"
                                      data-bs-target="#delete_file"
                                    >
                                      <i className="ti ti-trash me-1" />
                                      Delete
                                    </Link>
                                    <Link className="dropdown-item" to="#">
                                      <i className="ti ti-download me-1" />
                                      Download
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="card border shadow-none mb-3">
                        <div className="card-body pb-0">
                          <div className="row align-items-center">
                            <div className="col-md-8">
                              <div className="mb-3">
                                <h6 className="fw-semibold fs-14 mb-1">
                                  Collier-Turner Proposal
                                </h6>
                                <p>
                                  Send customizable quotes, proposals and
                                  contracts to close deals faster.
                                </p>
                                <div className="d-flex align-items-center flex-wrap row-gap-2">
                                  <span className="avatar avatar-md me-2 flex-shrink-0">
                                    <ImageWithBasePath
                                      src="assets/img/profiles/avatar-01.jpg"
                                      alt="img"
                                      className="rounded-circle"
                                    />
                                  </span>
                                  <div className="d-flex align-items-center">
                                    <p className="mb-0 me-2">Jessica Louise</p>
                                    <span className="badge bg-light text-body">
                                      Owner
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-4 text-md-end">
                              <div className="mb-3 d-inline-flex align-items-center">
                                <span className="badge badge-purple-light me-1">
                                  Quote
                                </span>
                                <span className="badge bg-success me-1">
                                  Sent
                                </span>
                                <div className="dropdown">
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
                                      data-bs-toggle="modal"
                                      data-bs-target="#delete_file"
                                    >
                                      <i className="ti ti-trash me-1" />
                                      Delete
                                    </Link>
                                    <Link className="dropdown-item" to="#">
                                      <i className="ti ti-download me-1" />
                                      Download
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="card border shadow-none mb-0">
                        <div className="card-body pb-0">
                          <div className="row align-items-center">
                            <div className="col-md-8">
                              <div className="mb-3">
                                <h6 className="fw-semibold fs-14 mb-1">
                                  Collier-Turner Proposal
                                </h6>
                                <p>
                                  Send customizable quotes, proposals and
                                  contracts to close deals faster.
                                </p>
                                <div className="d-flex align-items-center flex-wrap row-gap-2">
                                  <span className="avatar avatar-md me-2 flex-shrink-0">
                                    <ImageWithBasePath
                                      src="assets/img/profiles/avatar-22.jpg"
                                      alt="img"
                                      className="rounded-circle"
                                    />
                                  </span>
                                  <div className="d-flex align-items-center">
                                    <p className="mb-0 me-2">Dawn Merhca</p>
                                    <span className="badge bg-light text-body">
                                      Owner
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-4 text-md-end">
                              <div className="mb-3 d-inline-flex align-items-center">
                                <span className="badge badge-danger-light me-1">
                                  Proposal
                                </span>
                                <span className="badge bg-pending priority-badge me-1">
                                  Draft
                                </span>
                                <div className="dropdown">
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
                                      data-bs-toggle="modal"
                                      data-bs-target="#delete_file"
                                    >
                                      <i className="ti ti-trash me-1" />
                                      Delete
                                    </Link>
                                    <Link className="dropdown-item" to="#">
                                      <i className="ti ti-download me-1" />
                                      Download
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* /Files */}
                {/* Email */}
                <div className="tab-pane fade" id="tab_5">
                  <div className="card">
                    <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                      <h5 className="mb-1">Email</h5>
                      <div className="d-inline-flex align-items-center">
                        <Link
                          to="#"
                          className="link-primary fw-medium"
                          data-bs-toggle="tooltip"
                          data-bs-placement="left"
                          data-bs-custom-class="tooltip-dark"
                          data-bs-original-title="There are no email accounts configured, Please configured your email account in order to Send/ Create EMails"
                        >
                          <i className="ti ti-circle-plus me-1" />
                          Create Email
                        </Link>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="card border mb-0">
                        <div className="card-body pb-0">
                          <div className="row align-items-center">
                            <div className="col-md-8">
                              <div className="mb-3">
                                <h6 className="mb-1">Manage Emails</h6>
                                <p>
                                  You can send and reply to emails directly via
                                  this section.
                                </p>
                              </div>
                            </div>
                            <div className="col-md-4 text-md-end">
                              <div className="mb-3">
                                <Link
                                  to="#"
                                  className="btn btn-primary"
                                  data-bs-toggle="modal"
                                  data-bs-target="#create_email"
                                >
                                  Connect Account
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* /Email */}
              </div>
              {/* /Tab Content */}
            </div>
            {/* /Contact Details */}
          </div>
          {/* Start Footer */}
        </div>
        {/* End Content */}
        <Footer />
        {/* End Footer */}
      </div>
      {/* ========================
			End Page Content
		========================= */}
      <ModalProjectDetails />
    </>
  );
};

export default ProjectDetails;
