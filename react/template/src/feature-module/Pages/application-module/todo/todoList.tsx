import { Link } from "react-router";
import { all_routes } from "../../../../routes/all_routes";
import ImageWithBasePath from "../../../../components/imageWithBasePath";
import Modals from "./modals/modals";
import Footer from "../../../../components/footer/footer";

const TodoList = () => {
  return (
    <>
      {/* ========================
              Start Page Content
          ========================= */}
      <div className="page-wrapper">
        <div className="content content-two">
          {/* Page Header */}
          <div className="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
            <div>
              <h4 className="mb-1">Calendar</h4>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0 p-0">
                  <li className="breadcrumb-item">
                    <Link to={all_routes.dealsDashboard}>Home</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link to="#">Applications</Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Todo List
                  </li>
                </ol>
              </nav>
            </div>
            <div className="gap-2 d-flex align-items-center flex-wrap">
              <Link
                to="#"
                className="btn btn-icon btn-outline-light shadow"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                aria-label="Refresh"
                data-bs-original-title="Refresh"
              >
                <i className="ti ti-refresh" />
              </Link>
              <Link
                to="#"
                className="btn btn-icon btn-outline-light shadow"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                aria-label="Collapse"
                data-bs-original-title="Collapse"
                id="collapse-header"
              >
                <i className="ti ti-transition-top" />
              </Link>
            </div>
          </div>
          {/* End Page Header */}
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
            <Link
              to="#"
              className="btn btn-sm btn-primary"
              data-bs-toggle="modal"
              data-bs-target="#add_todo"
            >
              <i className="ti ti-circle-plus me-1" />
              Create New
            </Link>
            <ul className="d-flex align-items-center flex-shrink-0 list-unstyled mb-0">
              <li>
                <Link
                  to={all_routes.todo}
                  className="btn btn-icon btn-sm bg-white text-dark me-2"
                >
                  <i className="ti ti-layout-grid" />
                </Link>
              </li>
              <li>
                <Link
                  to={all_routes.todoList}
                  className="btn btn-icon btn-sm bg-primary text-white active me-2"
                >
                  <i className="ti ti-list-tree" />
                </Link>
              </li>
            </ul>
          </div>

          <div>
            {/* table list start */}
            <div className="table-responsive table-nowrap">
              <table className="table border mb-0">
                <thead className="table-light text-uppercase">
                  <tr>
                    <th>
                      <div className="form-check form-check-md">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="select-all"
                        />
                      </div>
                    </th>
                    <th>Company Name</th>
                    <th>Tags</th>
                    <th>Assignee</th>
                    <th>Created On</th>
                    <th>Progress</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="form-check form-check-md">
                          <input className="form-check-input" type="checkbox" />
                        </div>
                        <span className="mx-2 d-flex align-items-center rating-select">
                          <i className="ti ti-star" />
                        </span>
                        <span className="d-flex align-items-center">
                          <i className="ti ti-square-rounded text-danger me-2" />
                        </span>
                      </div>
                    </td>
                    <td>
                      <p className="fw-medium text-dark">
                        Respond to any pending messages
                      </p>
                    </td>
                    <td>
                      <span className="badge bg-info">Social</span>
                    </td>
                    <td>
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
                            src="assets/img/profiles/avatar-05.jpg"
                            alt="img"
                          />
                        </span>
                      </div>
                    </td>
                    <td>14 Jan 2024</td>
                    <td>
                      <span className="d-block mb-1">Progress : 100%</span>
                      <div
                        className="progress progress-xs flex-grow-1 mb-2"
                        style={{ width: 190 }}
                      >
                        <div
                          className="progress-bar bg-success rounded"
                          role="progressbar"
                          style={{ width: "100%" }}
                          aria-valuenow={30}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                    </td>
                    <td>14 Jan 2024</td>
                    <td>
                      <span className="badge badge-soft-success d-inline-flex align-items-center">
                        <i className="ti ti-circle-filled fs-5 me-1" />
                        Completed
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <Link
                          to="#"
                          className="btn btn-sm btn-icon"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_todo"
                        >
                          <i className="ti ti-edit" />
                        </Link>
                        <Link
                          to="#"
                          className="btn btn-sm btn-icon"
                          data-bs-toggle="modal"
                          data-bs-target="#delete_modal"
                        >
                          <i className="ti ti-trash" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="form-check form-check-md">
                          <input className="form-check-input" type="checkbox" />
                        </div>
                        <span className="mx-2 d-flex align-items-center rating-select">
                          <i className="ti ti-star-filled filled" />
                        </span>
                        <span className="d-flex align-items-center">
                          <i className="ti ti-square-rounded text-purple me-2" />
                        </span>
                      </div>
                    </td>
                    <td>
                      <p className="fw-medium text-dark">
                        Update calendar and schedule
                      </p>
                    </td>
                    <td>
                      <span className="badge bg-primary">Meetings</span>
                    </td>
                    <td>
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
                      </div>
                    </td>
                    <td>21 Jan 2024</td>
                    <td>
                      <span className="d-block mb-1">Progress : 15%</span>
                      <div
                        className="progress progress-xs flex-grow-1 mb-2"
                        style={{ width: 190 }}
                      >
                        <div
                          className="progress-bar bg-danger rounded"
                          role="progressbar"
                          style={{ width: "15%" }}
                          aria-valuenow={30}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                    </td>
                    <td>21 Jan 2024</td>
                    <td>
                      <span className="badge badge-soft-secondary d-inline-flex align-items-center">
                        <i className="ti ti-circle-filled fs-5 me-1" />
                        Pending
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <Link
                          to="#"
                          className="btn btn-sm btn-icon"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_todo"
                        >
                          <i className="ti ti-edit" />
                        </Link>
                        <Link
                          to="#"
                          className="btn btn-sm btn-icon"
                          data-bs-toggle="modal"
                          data-bs-target="#delete_modal"
                        >
                          <i className="ti ti-trash" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="form-check form-check-md">
                          <input className="form-check-input" type="checkbox" />
                        </div>
                        <span className="mx-2 d-flex align-items-center rating-select">
                          <i className="ti ti-star" />
                        </span>
                        <span className="d-flex align-items-center">
                          <i className="ti ti-square-rounded text-purple me-2" />
                        </span>
                      </div>
                    </td>
                    <td>
                      <p className="fw-medium text-dark">
                        Respond to any pending messages
                      </p>
                    </td>
                    <td>
                      <span className="badge bg-danger">Research</span>
                    </td>
                    <td>
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
                            className="border border-white"
                            src="assets/img/profiles/avatar-06.jpg"
                            alt="img"
                          />
                        </span>
                      </div>
                    </td>
                    <td>20 Feb 2024</td>
                    <td>
                      <span className="d-block mb-1">Progress : 45%</span>
                      <div
                        className="progress progress-xs flex-grow-1 mb-2"
                        style={{ width: 190 }}
                      >
                        <div
                          className="progress-bar bg-warning rounded"
                          role="progressbar"
                          style={{ width: "45%" }}
                          aria-valuenow={30}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                    </td>
                    <td>20 Feb 2024</td>
                    <td>
                      <span className="badge badge-soft-primary d-inline-flex align-items-center">
                        <i className="ti ti-circle-filled fs-5 me-1" />
                        Inprogress
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <Link
                          to="#"
                          className="btn btn-sm btn-icon"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_todo"
                        >
                          <i className="ti ti-edit" />
                        </Link>
                        <Link
                          to="#"
                          className="btn btn-sm btn-icon"
                          data-bs-toggle="modal"
                          data-bs-target="#delete_modal"
                        >
                          <i className="ti ti-trash" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="form-check form-check-md">
                          <input className="form-check-input" type="checkbox" />
                        </div>
                        <span className="mx-2 d-flex align-items-center rating-select">
                          <i className="ti ti-star" />
                        </span>
                        <span className="d-flex align-items-center">
                          <i className="ti ti-square-rounded text-warning me-2" />
                        </span>
                      </div>
                    </td>
                    <td>
                      <p className="fw-medium text-dark">
                        Attend team meeting at 10:00 AM
                      </p>
                    </td>
                    <td>
                      <span className="badge bg-primary">Web Design</span>
                    </td>
                    <td>
                      <div className="avatar-list-stacked avatar-group-sm">
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            className="border border-white"
                            src="assets/img/profiles/avatar-05.jpg"
                            alt="img"
                          />
                        </span>
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            className="border border-white"
                            src="assets/img/profiles/avatar-06.jpg"
                            alt="img"
                          />
                        </span>
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            className="border border-white"
                            src="assets/img/profiles/avatar-07.jpg"
                            alt="img"
                          />
                        </span>
                      </div>
                    </td>
                    <td>15 Mar 2024</td>
                    <td>
                      <span className="d-block mb-1">Progress : 40%</span>
                      <div
                        className="progress progress-xs flex-grow-1 mb-2"
                        style={{ width: 190 }}
                      >
                        <div
                          className="progress-bar bg-warning rounded"
                          role="progressbar"
                          style={{ width: "40%" }}
                          aria-valuenow={30}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                    </td>
                    <td>15 Mar 2024</td>
                    <td>
                      <span className="badge badge-soft-primary d-inline-flex align-items-center">
                        <i className="ti ti-circle-filled fs-5 me-1" />
                        Inprogress
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <Link
                          to="#"
                          className="btn btn-sm btn-icon"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_todo"
                        >
                          <i className="ti ti-edit" />
                        </Link>
                        <Link
                          to="#"
                          className="btn btn-sm btn-icon"
                          data-bs-toggle="modal"
                          data-bs-target="#delete_modal"
                        >
                          <i className="ti ti-trash" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="form-check form-check-md">
                          <input className="form-check-input" type="checkbox" />
                        </div>
                        <span className="mx-2 d-flex align-items-center rating-select">
                          <i className="ti ti-star" />
                        </span>
                        <span className="d-flex align-items-center">
                          <i className="ti ti-square-rounded text-purple me-2" />
                        </span>
                      </div>
                    </td>
                    <td>
                      <p className="fw-medium text-dark">
                        Check and respond to emails
                      </p>
                    </td>
                    <td>
                      <span className="badge bg-info">Reminder</span>
                    </td>
                    <td>
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
                            src="assets/img/profiles/avatar-09.jpg"
                            alt="img"
                          />
                        </span>
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            className="border border-white"
                            src="assets/img/profiles/avatar-10.jpg"
                            alt="img"
                          />
                        </span>
                      </div>
                    </td>
                    <td>12 Apr 2024</td>
                    <td>
                      <span className="d-block mb-1">Progress : 65%</span>
                      <div
                        className="progress progress-xs flex-grow-1 mb-2"
                        style={{ width: 190 }}
                      >
                        <div
                          className="progress-bar bg-purple rounded"
                          role="progressbar"
                          style={{ width: "65%" }}
                          aria-valuenow={30}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                    </td>
                    <td>12 Apr 2024</td>
                    <td>
                      <span className="badge badge-soft-secondary d-inline-flex align-items-center">
                        <i className="ti ti-circle-filled fs-5 me-1" />
                        Pending
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <Link
                          to="#"
                          className="btn btn-sm btn-icon"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_todo"
                        >
                          <i className="ti ti-edit" />
                        </Link>
                        <Link
                          to="#"
                          className="btn btn-sm btn-icon"
                          data-bs-toggle="modal"
                          data-bs-target="#delete_modal"
                        >
                          <i className="ti ti-trash" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="form-check form-check-md">
                          <input className="form-check-input" type="checkbox" />
                        </div>
                        <span className="mx-2 d-flex align-items-center rating-select">
                          <i className="ti ti-star" />
                        </span>
                        <span className="d-flex align-items-center">
                          <i className="ti ti-square-rounded text-warning me-2" />
                        </span>
                      </div>
                    </td>
                    <td>
                      <p className="fw-medium text-dark">
                        Coordinate with department head
                      </p>
                    </td>
                    <td>
                      <span className="badge bg-danger">Internal</span>
                    </td>
                    <td>
                      <div className="avatar-list-stacked avatar-group-sm">
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            className="border border-white"
                            src="assets/img/profiles/avatar-11.jpg"
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
                            className="border border-white"
                            src="assets/img/profiles/avatar-13.jpg"
                            alt="img"
                          />
                        </span>
                      </div>
                    </td>
                    <td>20 Apr 2024</td>
                    <td>
                      <span className="d-block mb-1">Progress : 85%</span>
                      <div
                        className="progress progress-xs flex-grow-1 mb-2"
                        style={{ width: 190 }}
                      >
                        <div
                          className="progress-bar bg-pink rounded"
                          role="progressbar"
                          style={{ width: "85%" }}
                          aria-valuenow={30}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                    </td>
                    <td>20 Apr 2024</td>
                    <td>
                      <span className="badge badge-soft-danger d-inline-flex align-items-center">
                        <i className="ti ti-circle-filled fs-5 me-1" />
                        Onhold
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <Link
                          to="#"
                          className="btn btn-sm btn-icon"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_todo"
                        >
                          <i className="ti ti-edit" />
                        </Link>
                        <Link
                          to="#"
                          className="btn btn-sm btn-icon"
                          data-bs-toggle="modal"
                          data-bs-target="#delete_modal"
                        >
                          <i className="ti ti-trash" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="form-check form-check-md">
                          <input className="form-check-input" type="checkbox" />
                        </div>
                        <span className="mx-2 d-flex align-items-center rating-select">
                          <i className="ti ti-star" />
                        </span>
                        <span className="d-flex align-items-center">
                          <i className="ti ti-square-rounded text-success me-2" />
                        </span>
                      </div>
                    </td>
                    <td>
                      <p className="fw-medium text-dark">
                        Plan tasks for the next day
                      </p>
                    </td>
                    <td>
                      <span className="badge bg-info">Social</span>
                    </td>
                    <td>
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
                            className="border border-white"
                            src="assets/img/profiles/avatar-16.jpg"
                            alt="img"
                          />
                        </span>
                      </div>
                    </td>
                    <td>06 Jul 2024</td>
                    <td>
                      <span className="d-block mb-1">Progress : 100%</span>
                      <div
                        className="progress progress-xs flex-grow-1 mb-2"
                        style={{ width: 190 }}
                      >
                        <div
                          className="progress-bar bg-success rounded"
                          role="progressbar"
                          style={{ width: "100%" }}
                          aria-valuenow={30}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                    </td>
                    <td>06 Jul 2024</td>
                    <td>
                      <span className="badge badge-soft-success d-inline-flex align-items-center">
                        <i className="ti ti-circle-filled fs-5 me-1" />
                        Completed
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <Link
                          to="#"
                          className="btn btn-sm btn-icon"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_todo"
                        >
                          <i className="ti ti-edit" />
                        </Link>
                        <Link
                          to="#"
                          className="btn btn-sm btn-icon"
                          data-bs-toggle="modal"
                          data-bs-target="#delete_modal"
                        >
                          <i className="ti ti-trash" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="form-check form-check-md">
                          <input className="form-check-input" type="checkbox" />
                        </div>
                        <span className="mx-2 d-flex align-items-center rating-select">
                          <i className="ti ti-star" />
                        </span>
                        <span className="d-flex align-items-center">
                          <i className="ti ti-square-rounded text-success me-2" />
                        </span>
                      </div>
                    </td>
                    <td>
                      <p className="fw-medium text-dark">
                        Finalize project proposal
                      </p>
                    </td>
                    <td>
                      <span className="badge bg-success">Projects</span>
                    </td>
                    <td>
                      <div className="avatar-list-stacked avatar-group-sm">
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            className="border border-white"
                            src="assets/img/profiles/avatar-17.jpg"
                            alt="img"
                          />
                        </span>
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
                      </div>
                    </td>
                    <td>02 Sep 2024</td>
                    <td>
                      <span className="d-block mb-1">Progress : 65%</span>
                      <div
                        className="progress progress-xs flex-grow-1 mb-2"
                        style={{ width: 190 }}
                      >
                        <div
                          className="progress-bar bg-danger rounded"
                          role="progressbar"
                          style={{ width: "65%" }}
                          aria-valuenow={30}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                    </td>
                    <td>02 Sep 2024</td>
                    <td>
                      <span className="badge badge-soft-danger d-inline-flex align-items-center">
                        <i className="ti ti-circle-filled fs-5 me-1" />
                        Onhold
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <Link
                          to="#"
                          className="btn btn-sm btn-icon"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_todo"
                        >
                          <i className="ti ti-edit" />
                        </Link>
                        <Link
                          to="#"
                          className="btn btn-sm btn-icon"
                          data-bs-toggle="modal"
                          data-bs-target="#delete_modal"
                        >
                          <i className="ti ti-trash" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="form-check form-check-md">
                          <input className="form-check-input" type="checkbox" />
                        </div>
                        <span className="mx-2 d-flex align-items-center rating-select">
                          <i className="ti ti-star" />
                        </span>
                        <span className="d-flex align-items-center">
                          <i className="ti ti-square-rounded text-purple me-2" />
                        </span>
                      </div>
                    </td>
                    <td>
                      <p className="fw-medium text-dark">
                        Submit to supervisor by EOD
                      </p>
                    </td>
                    <td>
                      <span className="badge bg-info">Reminder</span>
                    </td>
                    <td>
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
                      </div>
                    </td>
                    <td>15 Nov 2024</td>
                    <td>
                      <span className="d-block mb-1">Progress : 75%</span>
                      <div
                        className="progress progress-xs flex-grow-1 mb-2"
                        style={{ width: 190 }}
                      >
                        <div
                          className="progress-bar bg-purple rounded"
                          role="progressbar"
                          style={{ width: "75%" }}
                          aria-valuenow={30}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                    </td>
                    <td>15 Nov 2024</td>
                    <td>
                      <span className="badge badge-soft-primary d-inline-flex align-items-center">
                        <i className="ti ti-circle-filled fs-5 me-1" />
                        Inprogress
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <Link
                          to="#"
                          className="btn btn-sm btn-icon"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_todo"
                        >
                          <i className="ti ti-edit" />
                        </Link>
                        <Link
                          to="#"
                          className="btn btn-sm btn-icon"
                          data-bs-toggle="modal"
                          data-bs-target="#delete_modal"
                        >
                          <i className="ti ti-trash" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="form-check form-check-md">
                          <input className="form-check-input" type="checkbox" />
                        </div>
                        <span className="mx-2 d-flex align-items-center rating-select">
                          <i className="ti ti-star" />
                        </span>
                        <span className="d-flex align-items-center">
                          <i className="ti ti-square-rounded text-success me-2" />
                        </span>
                      </div>
                    </td>
                    <td>
                      <p className="fw-medium text-dark">
                        Prepare presentation slides
                      </p>
                    </td>
                    <td>
                      <span className="badge bg-danger">Research</span>
                    </td>
                    <td>
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
                      </div>
                    </td>
                    <td>10 Dec 2024</td>
                    <td>
                      <span className="d-block mb-1">Progress : 90%</span>
                      <div
                        className="progress progress-xs flex-grow-1 mb-2"
                        style={{ width: 190 }}
                      >
                        <div
                          className="progress-bar bg-pink rounded"
                          role="progressbar"
                          style={{ width: "90%" }}
                          aria-valuenow={30}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                    </td>
                    <td>10 Dec 2024</td>
                    <td>
                      <span className="badge badge-soft-secondary d-inline-flex align-items-center">
                        <i className="ti ti-circle-filled fs-5 me-1" />
                        Pending
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <Link
                          to="#"
                          className="btn btn-sm btn-icon"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_todo"
                        >
                          <i className="ti ti-edit" />
                        </Link>
                        <Link
                          to="#"
                          className="btn btn-sm btn-icon"
                          data-bs-toggle="modal"
                          data-bs-target="#delete_modal"
                        >
                          <i className="ti ti-trash" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* table list end */}
          </div>
        </div>
        {/* Start Footer*/}
       <Footer/>
        {/* End Footer*/}
      </div>
      {/* ========================
              End Page Content
          ========================= */}
      <Modals />
    </>
  );
};

export default TodoList;
