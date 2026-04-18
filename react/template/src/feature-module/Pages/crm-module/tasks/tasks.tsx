import { Link } from "react-router";
import Footer from "../../../../components/footer/footer";
import PageHeader from "../../../../components/page-header/pageHeader";
import { all_routes } from "../../../../routes/all_routes";
import ImageWithBasePath from "../../../../components/imageWithBasePath";
import ModalTask from "./modal/modalTask";
import CommonDatePicker from "../../../../components/common-datePicker/commonDatePicker";

const Tasks = () => {
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
            title="Tasks"
            badgeCount={123}
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
              <Link
                to="#"
                className="btn btn-primary"
                data-bs-toggle="offcanvas"
                data-bs-target="#offcanvas_add"
              >
                <i className="ti ti-square-rounded-plus-filled me-1" />
                Add New Task
              </Link>
            </div>
            <div className="card-body">
              {/* table header */}
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <div className="dropdown">
                    <Link
                      className="dropdown-toggle btn btn-outline-light shadow"
                      data-bs-toggle="dropdown"
                      to="#"
                    >
                      All Tasks
                    </Link>
                    <div className="dropdown-menu dropdown-menu-end">
                      <Link to={all_routes.tasks} className="dropdown-item active">
                        All Tasks
                      </Link>
                      <Link to={all_routes.tasksImportant} className="dropdown-item">
                        Important
                      </Link>
                      <Link to={all_routes.tasksCompleted} className="dropdown-item">
                        Completed
                      </Link>
                    </div>
                  </div>
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
                    <div className="filter-dropdown-menu dropdown-menu dropdown-menu-xl p-0">
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
                                Task Name
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
                                      Add a form to Update Task
                                    </label>
                                  </li>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Make all strokes thinner
                                    </label>
                                  </li>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Update original content
                                    </label>
                                  </li>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Use only component colours
                                    </label>
                                  </li>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Add images to the cards section
                                    </label>
                                  </li>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Add images to the cards section
                                    </label>
                                  </li>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Design description banner &amp; landing
                                      page
                                    </label>
                                  </li>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Make sure all the padding should be 24px
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
                                Task Type
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
                                      Meeting
                                    </label>
                                  </li>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Calls
                                    </label>
                                  </li>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Task
                                    </label>
                                  </li>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Email
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
                                data-bs-target="#Tags"
                                aria-expanded="false"
                                aria-controls="Tags"
                              >
                                Tags
                              </Link>
                            </div>
                            <div
                              className="filter-set-contents accordion-collapse collapse"
                              id="Tags"
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
                                      Promotion
                                    </label>
                                  </li>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Rated
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
                                      Calls
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
                                data-bs-target="#collapseTwo"
                                aria-expanded="false"
                                aria-controls="collapseTwo"
                              >
                                Created By
                              </Link>
                            </div>
                            <div
                              className="filter-set-contents accordion-collapse collapse"
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
                                data-bs-target="#date"
                                aria-expanded="false"
                                aria-controls="date"
                              >
                                Created Date
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
                  <div
                    id="reportrange"
                    className="reportrange-picker d-flex align-items-center shadow"
                  >
                    <i className="ti ti-calendar-due text-dark fs-14 me-1" />
                    <span className="reportrange-picker-field">
                      9 Jun 25 - 9 Jun 25
                    </span>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <div className="form-check form-check-md">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="select-all"
                    />
                    <label className="form-check-label" htmlFor="select-all">
                      Mark all as read
                    </label>
                  </div>
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
              </div>
              {/* table header */}
              {/* Task List */}
              <div className="task-wrap border-bottom mb-3">
                <Link
                  to="#"
                  className="d-flex align-items-center justify-content-between mb-3"
                  data-bs-toggle="collapse"
                  data-bs-target="#task_1"
                >
                  <h6 className="fs-16 mb-0">
                    Recent
                    <span className="badge badge-avatar text-dark bg-soft-dark rounded-circle ms-2 fw-medium">
                      24
                    </span>
                  </h6>
                  <i className="ti ti-chevron-up arrow-rotate" />
                </Link>
                <div className="collapse show" id="task_1">
                  <div className="card rounded-start-0 mb-3">
                    <div className="card-body border-start border-3 border-info">
                      <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                        <div className="d-flex align-items-center flex-wrap row-gap-2">
                          <span className="me-3">
                            <i className="ti ti-grip-vertical" />
                          </span>
                          <div className="form-check form-check-md me-3">
                            <input
                              className="form-check-input"
                              type="checkbox"
                            />
                          </div>
                          <div className="set-star rating-select me-3">
                            <i className="ti ti-star-filled fs-16" />
                          </div>
                          <h6 className="fw-semibold mb-0 fs-14 me-3">
                            Add a form to Update Task
                          </h6>
                          <span className="badge badge-soft-success border-0 me-2">
                            <i className="ti ti-phone me-1" />
                            Calls
                          </span>
                          <span className="badge badge-soft-info">Pending</span>
                        </div>
                        <div className="d-flex align-items-center flex-wrap row-gap-2">
                          <div className="me-2">
                            <span className="badge badge-soft-primary">
                              Promotion
                            </span>
                          </div>
                          <div className="me-2">
                            <i className="ti ti-calendar-exclamation me-1" />
                            25 Apr 2025
                          </div>
                          <div className="avatar avatar-xs avatar-rounded me-2">
                            <ImageWithBasePath
                              src="assets/img/profiles/avatar-14.jpg"
                              alt="img"
                            />
                          </div>
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
                                data-bs-toggle="offcanvas"
                                data-bs-target="#offcanvas_edit"
                                to="#"
                              >
                                <i className="ti ti-edit text-blue" /> Edit
                              </Link>
                              <Link
                                className="dropdown-item"
                                to="#"
                                data-bs-toggle="modal"
                                data-bs-target="#delete_task"
                              >
                                <i className="ti ti-trash" /> Delete
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card rounded-start-0 mb-3">
                    <div className="card-body border-start border-3 border-info">
                      <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                        <div className="d-flex align-items-center flex-wrap row-gap-2">
                          <span className="me-3">
                            <i className="ti ti-grip-vertical" />
                          </span>
                          <div className="form-check form-check-md me-3">
                            <input
                              className="form-check-input"
                              type="checkbox"
                            />
                          </div>
                          <div className="set-star rating-select me-3">
                            <i className="ti ti-star-filled fs-16" />
                          </div>
                          <h6 className="fw-semibold mb-0 fs-14 me-3">
                            Make all strokes thinner
                          </h6>
                          <span className="badge badge-soft-warning border-0 me-2">
                            <i className="ti ti-mail me-1" />
                            Email
                          </span>
                          <span className="badge badge-soft-info">Pending</span>
                        </div>
                        <div className="d-flex align-items-center flex-wrap row-gap-2">
                          <div className="me-2">
                            <span className="badge badge-soft-danger">
                              Rejected
                            </span>
                          </div>
                          <div className="me-2">
                            <span className="badge badge-soft-success">
                              Collab
                            </span>
                          </div>
                          <div className="me-2">
                            <i className="ti ti-calendar-exclamation me-1" />
                            25 Apr 2025
                          </div>
                          <div className="avatar avatar-xs avatar-rounded me-2">
                            <ImageWithBasePath
                              src="assets/img/profiles/avatar-15.jpg"
                              alt="img"
                            />
                          </div>
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
                                data-bs-toggle="offcanvas"
                                data-bs-target="#offcanvas_edit"
                                to="#"
                              >
                                <i className="ti ti-edit text-blue" /> Edit
                              </Link>
                              <Link
                                className="dropdown-item"
                                to="#"
                                data-bs-toggle="modal"
                                data-bs-target="#delete_task"
                              >
                                <i className="ti ti-trash" /> Delete
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card rounded-start-0 mb-3">
                    <div className="card-body border-start border-3 border-warning">
                      <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                        <div className="d-flex align-items-center flex-wrap row-gap-2">
                          <span className="me-3">
                            <i className="ti ti-grip-vertical" />
                          </span>
                          <div className="form-check form-check-md me-3">
                            <input
                              className="form-check-input"
                              type="checkbox"
                            />
                          </div>
                          <div className="set-star rating-select me-3">
                            <i className="ti ti-star-filled fs-16" />
                          </div>
                          <h6 className="fw-semibold mb-0 fs-14 me-3">
                            Update original content
                          </h6>
                          <span className="badge badge-soft-success border-0 me-2">
                            <i className="ti ti-phone me-1" />
                            Calls
                          </span>
                          <span className="badge badge-soft-warning">
                            Inprogress
                          </span>
                        </div>
                        <div className="d-flex align-items-center flex-wrap row-gap-2">
                          <div className="me-2">
                            <span className="badge badge-soft-primary">
                              Promotion
                            </span>
                          </div>
                          <div className="me-2">
                            <i className="ti ti-calendar-exclamation me-1" />
                            25 Apr 2025
                          </div>
                          <div className="avatar avatar-xs avatar-rounded me-2">
                            <ImageWithBasePath
                              src="assets/img/profiles/avatar-16.jpg"
                              alt="img"
                            />
                          </div>
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
                                data-bs-toggle="offcanvas"
                                data-bs-target="#offcanvas_edit"
                                to="#"
                              >
                                <i className="ti ti-edit text-blue" /> Edit
                              </Link>
                              <Link
                                className="dropdown-item"
                                to="#"
                                data-bs-toggle="modal"
                                data-bs-target="#delete_task"
                              >
                                <i className="ti ti-trash" /> Delete
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card rounded-start-0 mb-3">
                    <div className="card-body border-start border-3 border-warning">
                      <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                        <div className="d-flex align-items-center flex-wrap row-gap-2">
                          <span className="me-3">
                            <i className="ti ti-grip-vertical" />
                          </span>
                          <div className="form-check form-check-md me-3">
                            <input
                              className="form-check-input"
                              type="checkbox"
                            />
                          </div>
                          <div className="set-star rating-select me-3">
                            <i className="ti ti-star-filled fs-16" />
                          </div>
                          <h6 className="fw-semibold mb-0 fs-14 me-3">
                            Use only component colours
                          </h6>
                          <span className="badge badge-soft-info border-0 me-2">
                            <i className="ti ti-subtask me-1" />
                            Task
                          </span>
                          <span className="badge badge-soft-warning">
                            Inprogress
                          </span>
                        </div>
                        <div className="d-flex align-items-center flex-wrap row-gap-2">
                          <div className="me-2">
                            <span className="badge badge-soft-success">
                              Collab
                            </span>
                          </div>
                          <div className="me-2">
                            <span className="badge badge-soft-warning">
                              Rated
                            </span>
                          </div>
                          <div className="me-2">
                            <i className="ti ti-calendar-exclamation me-1" />
                            25 Apr 2025
                          </div>
                          <div className="avatar avatar-xs avatar-rounded me-2">
                            <ImageWithBasePath
                              src="assets/img/profiles/avatar-17.jpg"
                              alt="img"
                            />
                          </div>
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
                                data-bs-toggle="offcanvas"
                                data-bs-target="#offcanvas_edit"
                                to="#"
                              >
                                <i className="ti ti-edit text-blue" /> Edit
                              </Link>
                              <Link
                                className="dropdown-item"
                                to="#"
                                data-bs-toggle="modal"
                                data-bs-target="#delete_task"
                              >
                                <i className="ti ti-trash" /> Delete
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* /Task List */}
              {/* Task List */}
              <div className="task-wrap border-bottom mb-3">
                <Link
                  to="#"
                  className="d-flex align-items-center justify-content-between mb-3"
                  data-bs-toggle="collapse"
                  data-bs-target="#task_2"
                >
                  <h6 className="fs-16 mb-0">Yesterday</h6>
                  <i className="ti ti-chevron-up arrow-rotate" />
                </Link>
                <div className="collapse show" id="task_2">
                  <div className="card rounded-start-0 mb-3">
                    <div className="card-body border-start border-3 border-warning">
                      <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                        <div className="d-flex align-items-center flex-wrap row-gap-2">
                          <span className="me-3">
                            <i className="ti ti-grip-vertical" />
                          </span>
                          <div className="form-check form-check-md me-3">
                            <input
                              className="form-check-input"
                              type="checkbox"
                            />
                          </div>
                          <div className="set-star rating-select me-3">
                            <i className="ti ti-star-filled fs-16" />
                          </div>
                          <h6 className="fw-semibold mb-0 fs-14 me-3">
                            Add images to the cards section
                          </h6>
                          <span className="badge badge-soft-success border-0 me-2">
                            <i className="ti ti-phone me-1" />
                            Calls
                          </span>
                          <span className="badge badge-soft-warning">
                            Inprogress
                          </span>
                        </div>
                        <div className="d-flex align-items-center flex-wrap row-gap-2">
                          <div className="me-2">
                            <span className="badge badge-soft-primary">
                              Promotion
                            </span>
                          </div>
                          <div className="me-2">
                            <i className="ti ti-calendar-exclamation me-1" />
                            24 Apr 2025
                          </div>
                          <div className="avatar avatar-xs avatar-rounded me-2">
                            <ImageWithBasePath
                              src="assets/img/profiles/avatar-18.jpg"
                              alt="img"
                            />
                          </div>
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
                                data-bs-toggle="offcanvas"
                                data-bs-target="#offcanvas_edit"
                                to="#"
                              >
                                <i className="ti ti-edit text-blue" /> Edit
                              </Link>
                              <Link
                                className="dropdown-item"
                                to="#"
                                data-bs-toggle="modal"
                                data-bs-target="#delete_task"
                              >
                                <i className="ti ti-trash" /> Delete
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card rounded-start-0 mb-3">
                    <div className="card-body border-start border-3 border-danger">
                      <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                        <div className="d-flex align-items-center flex-wrap row-gap-2">
                          <span className="me-3">
                            <i className="ti ti-grip-vertical" />
                          </span>
                          <div className="form-check form-check-md me-3">
                            <input
                              className="form-check-input"
                              type="checkbox"
                            />
                          </div>
                          <div className="set-star rating-select me-3">
                            <i className="ti ti-star-filled fs-16" />
                          </div>
                          <h6 className="fw-semibold mb-0 fs-14 me-3">
                            Add images to the cards section
                          </h6>
                          <span className="badge badge-soft-success border-0 me-2">
                            <i className="ti ti-phone me-1" />
                            Calls
                          </span>
                          <span className="badge badge-soft-danger">
                            Rejected
                          </span>
                        </div>
                        <div className="d-flex align-items-center flex-wrap row-gap-2">
                          <div className="me-2">
                            <span className="badge badge-soft-primary">
                              Promotion
                            </span>
                          </div>
                          <div className="me-2">
                            <i className="ti ti-calendar-exclamation me-1" />
                            25 Apr 2025
                          </div>
                          <div className="avatar avatar-xs avatar-rounded me-2">
                            <ImageWithBasePath
                              src="assets/img/profiles/avatar-19.jpg"
                              alt="img"
                            />
                          </div>
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
                                data-bs-toggle="offcanvas"
                                data-bs-target="#offcanvas_edit"
                                to="#"
                              >
                                <i className="ti ti-edit text-blue" /> Edit
                              </Link>
                              <Link
                                className="dropdown-item"
                                to="#"
                                data-bs-toggle="modal"
                                data-bs-target="#delete_task"
                              >
                                <i className="ti ti-trash" /> Delete
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* /Task List */}
              {/* Task List */}
              <div className="task-wrap border-bottom mb-3">
                <Link
                  to="#"
                  className="d-flex align-items-center justify-content-between mb-3"
                  data-bs-toggle="collapse"
                  data-bs-target="#task_3"
                >
                  <h6 className="fs-16 mb-0">23 Apr 2025</h6>
                  <i className="ti ti-chevron-up arrow-rotate" />
                </Link>
                <div className="collapse show" id="task_3">
                  <div className="card rounded-start-0 mb-3">
                    <div className="card-body border-start border-3 border-warning">
                      <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                        <div className="d-flex align-items-center flex-wrap row-gap-2">
                          <span className="me-3">
                            <i className="ti ti-grip-vertical" />
                          </span>
                          <div className="form-check form-check-md me-3">
                            <input
                              className="form-check-input"
                              type="checkbox"
                            />
                          </div>
                          <div className="set-star rating-select me-3">
                            <i className="ti ti-star-filled fs-16" />
                          </div>
                          <h6 className="fw-semibold mb-0 fs-14 me-3">
                            Design description banner &amp; landing page
                          </h6>
                          <span className="badge badge-soft-info border-0 me-2">
                            <i className="ti ti-subtask me-1" />
                            Task
                          </span>
                          <span className="badge badge-soft-warning">
                            Inprogress
                          </span>
                        </div>
                        <div className="d-flex align-items-center flex-wrap row-gap-2">
                          <div className="me-2">
                            <span className="badge badge-soft-success">
                              Collab
                            </span>
                          </div>
                          <div className="me-2">
                            <span className="badge badge-soft-warning">
                              Rated
                            </span>
                          </div>
                          <div className="me-2">
                            <i className="ti ti-calendar-exclamation me-1" />
                            23 Apr 2025
                          </div>
                          <div className="avatar avatar-xs avatar-rounded me-2">
                            <ImageWithBasePath
                              src="assets/img/profiles/avatar-20.jpg"
                              alt="img"
                            />
                          </div>
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
                                data-bs-toggle="offcanvas"
                                data-bs-target="#offcanvas_edit"
                                to="#"
                              >
                                <i className="ti ti-edit text-blue" /> Edit
                              </Link>
                              <Link
                                className="dropdown-item"
                                to="#"
                                data-bs-toggle="modal"
                                data-bs-target="#delete_task"
                              >
                                <i className="ti ti-trash" /> Delete
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card rounded-start-0 mb-3">
                    <div className="card-body border-start border-3 border-success">
                      <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                        <div className="d-flex align-items-center flex-wrap row-gap-2">
                          <span className="me-3">
                            <i className="ti ti-grip-vertical" />
                          </span>
                          <div className="form-check form-check-md me-3">
                            <input
                              className="form-check-input"
                              type="checkbox"
                            />
                          </div>
                          <div className="set-star rating-select me-3">
                            <i className="ti ti-star-filled fs-16" />
                          </div>
                          <h6 className="fw-semibold mb-0 fs-14 me-3 text-decoration-line-through">
                            Make all strokes thinner
                          </h6>
                          <span className="badge badge-soft-warning border-0 me-2">
                            <i className="ti ti-mail me-1" />
                            Email
                          </span>
                          <span className="badge badge-soft-success">
                            Completed
                          </span>
                        </div>
                        <div className="d-flex align-items-center flex-wrap row-gap-2">
                          <div className="me-2">
                            <span className="badge badge-soft-primary">
                              Promotion
                            </span>
                          </div>
                          <div className="me-2">
                            <i className="ti ti-calendar-exclamation me-1" />
                            23 Apr 2025
                          </div>
                          <div className="avatar avatar-xs avatar-rounded me-2">
                            <ImageWithBasePath
                              src="assets/img/profiles/avatar-21.jpg"
                              alt="img"
                            />
                          </div>
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
                                data-bs-toggle="offcanvas"
                                data-bs-target="#offcanvas_edit"
                                to="#"
                              >
                                <i className="ti ti-edit text-blue" /> Edit
                              </Link>
                              <Link
                                className="dropdown-item"
                                to="#"
                                data-bs-toggle="modal"
                                data-bs-target="#delete_task"
                              >
                                <i className="ti ti-trash" /> Delete
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* /Task List */}
              {/* Task List */}
              <div className="task-wrap">
                <Link
                  to="#"
                  className="d-flex align-items-center justify-content-between mb-3"
                  data-bs-toggle="collapse"
                  data-bs-target="#task_4"
                >
                  <h6 className="fs-16 mb-0">22 Apr 2025</h6>
                  <i className="ti ti-chevron-up arrow-rotate" />
                </Link>
                <div className="collapse show" id="task_4">
                  <div className="card rounded-start-0 mb-0">
                    <div className="card-body border-start border-3 border-success">
                      <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                        <div className="d-flex align-items-center flex-wrap row-gap-2">
                          <span className="me-3">
                            <i className="ti ti-grip-vertical" />
                          </span>
                          <div className="form-check form-check-md me-3">
                            <input
                              className="form-check-input"
                              type="checkbox"
                            />
                          </div>
                          <div className="set-star rating-select me-3">
                            <i className="ti ti-star-filled fs-16" />
                          </div>
                          <h6 className="fw-semibold mb-0 fs-14 me-3 text-decoration-line-through">
                            Make all strokes thinner
                          </h6>
                          <span className="badge badge-soft-info border-0 me-2">
                            <i className="ti ti-user-share me-1" />
                            Meeting
                          </span>
                          <span className="badge badge-soft-success">
                            Completed
                          </span>
                        </div>
                        <div className="d-flex align-items-center flex-wrap row-gap-2">
                          <div className="me-2">
                            <span className="badge badge-soft-danger">
                              Rejected
                            </span>
                          </div>
                          <div className="me-2">
                            <span className="badge badge-soft-success">
                              Collab
                            </span>
                          </div>
                          <div className="me-2">
                            <i className="ti ti-calendar-exclamation me-1" />
                            22 Apr 2025
                          </div>
                          <div className="avatar avatar-xs avatar-rounded me-2">
                            <ImageWithBasePath
                              src="assets/img/profiles/avatar-22.jpg"
                              alt="img"
                            />
                          </div>
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
                                data-bs-toggle="offcanvas"
                                data-bs-target="#offcanvas_edit"
                                to="#"
                              >
                                <i className="ti ti-edit text-blue" /> Edit
                              </Link>
                              <Link
                                className="dropdown-item"
                                to="#"
                                data-bs-toggle="modal"
                                data-bs-target="#delete_task"
                              >
                                <i className="ti ti-trash" /> Delete
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* /Task List */}
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
        <ModalTask/>
    </>
  );
};

export default Tasks;
