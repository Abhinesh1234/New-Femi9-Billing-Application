import { Link } from "react-router";
import ImageWithBasePath from "../../../../components/imageWithBasePath";
import { useState } from "react";
import SearchInput from "../../../../components/dataTable/dataTableSearch";
import Datatable from "../../../../components/dataTable";
import { all_routes } from "../../../../routes/all_routes";
import PageHeader from "../../../../components/page-header/pageHeader";
import ModalActivities from "./modal/modalActivities";
import { ActivitiesCallsData } from "../../../../core/json/activitiesListData";
import CommonDatePicker from "../../../../components/common-datePicker/commonDatePicker";

const ActivityCalls = () => {
  const data = ActivitiesCallsData;
  const columns = [
    {
      title: "Titel",
      dataIndex: "Title",
      
      sorter: (a: any, b: any) => a.Title.length - b.Title.length,
    },
    {
      title: "Activity Type",
      dataIndex: "ActivityType",
      render: (text: any) => (
        <span className={`badge activity-badge ${text === "Meeting"? "badge-soft-info": text==="Calls"? "badge-soft-success": text==="Email"? "badge-soft-warning": "badge-soft-danger"} border-0`}>
          <i className={`ti ti-${text === "Meeting"? "user-share": text==="Calls"? "phone": text==="Email"? "mail": "subtask"} me-1`} />
          {text}
        </span>
      ),
      sorter: (a: any, b: any) => a.Title.length - b.Title.length,
    },
    {
      title: "Due Date",
      dataIndex: "DueDate",
      sorter: (a: any, b: any) => a.DueDate.length - b.DueDate.length,
    },
    {
      title: "Owner",
      dataIndex: "Owner",
      render: (text:any,render:any)=>(
      <div className="d-flex align-items-center mb-0">
        <Link to="#" className="avatar avatar-xss me-2">
          <ImageWithBasePath
            className="img-fluid rounded-circle"
            src={`assets/img/profiles/${render.Image}`}
            alt="User Image"
          />
        </Link>
        {text}
      </div>
),
      sorter: (a: any, b: any) => a.Owner.length - b.Owner.length,
    },
    {
      title: "Created At",
      dataIndex: "CreatedAt",
      sorter: (a: any, b: any) => a.CreatedAt.length - b.CreatedAt.length,
    },
    {
      title: "Action",
      dataIndex: "Action",
      render: () => (
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
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvas_edit"
            >
              <i className="ti ti-edit text-blue" /> Edit
            </Link>
            <Link
              className="dropdown-item"
              to="#"
              data-bs-toggle="modal"
              data-bs-target="#delete_activity"
            >
              <i className="ti ti-trash" /> Delete
            </Link>
          </div>
        </div>
      ),
      sorter: (a: any, b: any) => a.Action.length - b.Action.length,
    },
  ];

  const [searchText, setSearchText] = useState<string>("");

  const handleSearch = (value: string) => {
    setSearchText(value);
  };
  return (
    <div className="page-wrapper">
  {/* Start Content */}
  <div className="content pb-0">
    {/* Page Header */}
    <PageHeader title="Activities" badgeCount={125} showModuleTile={false} showExport={true}/>
    {/* End Page Header */}
    {/* card start */}
    <div className="card border-0 rounded-0">
      <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
        <div className="input-icon input-icon-start position-relative">
          <span className="input-icon-addon text-dark">
            <i className="ti ti-search" />
          </span>
          <SearchInput value={searchText} onChange={handleSearch} />
        </div>
        <Link
          to="#"
          className="btn btn-primary"
          data-bs-toggle="offcanvas"
          data-bs-target="#offcanvas_add"
        >
          <i className="ti ti-square-rounded-plus-filled me-1" />
          Add New Activity
        </Link>
      </div>
      <div className="card-body">
        {/* table header */}
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <h6 className="mb-0">All Activities</h6>
            <Link
              to={all_routes.activityCalls}
              className="btn btn-icon btn-outline-light shadow active"
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              data-bs-original-title="Calls"
            >
              <i className="ti ti-phone" />
            </Link>
            <Link
              to={all_routes.activityMail}
              className="btn btn-icon btn-outline-light shadow"
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              data-bs-original-title="Mail"
            >
              <i className="ti ti-mail" />
            </Link>
            <Link
              to={all_routes.activityTask}
              className="btn btn-icon btn-outline-light shadow"
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              data-bs-original-title="Task"
            >
              <i className="ti ti-subtask" />
            </Link>
            <Link
              to={all_routes.activityMeeting}
              className="btn btn-icon btn-outline-light shadow"
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              data-bs-original-title="Meeting"
            >
              <i className="ti ti-user-share" />
            </Link>
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
                          Project Name
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
                                We scheduled a meeting for next week
                              </label>
                            </li>
                            <li>
                              <label className="dropdown-item px-2 d-flex align-items-center">
                                <input
                                  className="form-check-input m-0 me-1"
                                  type="checkbox"
                                />
                                Had conversation with Fred regarding task
                              </label>
                            </li>
                            <li>
                              <label className="dropdown-item px-2 d-flex align-items-center">
                                <input
                                  className="form-check-input m-0 me-1"
                                  type="checkbox"
                                />
                                Analysing latest time estimation for new project
                              </label>
                            </li>
                            <li>
                              <label className="dropdown-item px-2 d-flex align-items-center">
                                <input
                                  className="form-check-input m-0 me-1"
                                  type="checkbox"
                                />
                                Store and manage contact data
                              </label>
                            </li>
                            <li>
                              <label className="dropdown-item px-2 d-flex align-items-center">
                                <input
                                  className="form-check-input m-0 me-1"
                                  type="checkbox"
                                />
                                Store and manage contact data
                              </label>
                            </li>
                            <li>
                              <label className="dropdown-item px-2 d-flex align-items-center">
                                <input
                                  className="form-check-input m-0 me-1"
                                  type="checkbox"
                                />
                                Will have a meeting before project start
                              </label>
                            </li>
                            <li>
                              <label className="dropdown-item px-2 d-flex align-items-center">
                                <input
                                  className="form-check-input m-0 me-1"
                                  type="checkbox"
                                />
                                Call John and discuss about project
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
                          Activity Type
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
                          data-bs-target="#date"
                          aria-expanded="false"
                          aria-controls="date"
                        >
                          Due Date
                        </Link>
                      </div>
                      <div
                        className="filter-set-contents accordion-collapse collapse"
                        id="date"
                        data-bs-parent="#accordionExample"
                      >
                        <div className="filter-content-list bg-light rounded border p-2 shadow mt-2">
                          <div className="input-group w-auto input-group-flat">
                            <CommonDatePicker placeholder="dd/mm/yyyy" />
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
                          data-bs-target="#date2"
                          aria-expanded="false"
                          aria-controls="date2"
                        >
                          Created Date
                        </Link>
                      </div>
                      <div
                        className="filter-set-contents accordion-collapse collapse"
                        id="date2"
                        data-bs-parent="#accordionExample"
                      >
                        <div className="filter-content-list bg-light rounded border p-2 shadow mt-2">
                          <div className="input-group w-auto input-group-flat">
                            <CommonDatePicker placeholder="dd/mm/yyyy" />
                          </div>
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
                    <Link to="" className="btn btn-primary w-100">
                      Filter
                    </Link>
                  </div>
                </div>
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
                        <span>Title</span>
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
                        <span>Activity Type</span>
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
                        <span>Due Date</span>
                        <CommonDatePicker placeholder="dd/mm/yyyy" />
                      </label>
                    </div>
                  </li>
                  <li className="gap-1 d-flex align-items-center mb-2">
                    <i className="ti ti-columns me-1" />
                    <div className="form-check form-switch w-100 ps-0">
                      <label className="form-check-label d-flex align-items-center gap-2 w-100">
                        <span>Owner</span>
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
                        <span>Created at</span>
                        <input
                          className="form-check-input switchCheckDefault ms-auto"
                          type="checkbox"
                          role="switch"
                        />
                      </label>
                    </div>
                  </li>
                  <li className="gap-1 d-flex align-items-center mb-0">
                    <i className="ti ti-columns me-1" />
                    <div className="form-check form-switch w-100 ps-0">
                      <label className="form-check-label d-flex align-items-center gap-2 w-100">
                        <span>Action</span>
                        <input
                          className="form-check-input switchCheckDefault ms-auto"
                          type="checkbox"
                          role="switch"
                          defaultChecked
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
        {/* Activity List */}
        <div className="custom-table table-nowrap">
           <Datatable
              columns={columns}
              dataSource={data}
              Selection={true}
              searchText={searchText}
            />
        </div>

        {/* /Activity List */}
      </div>
    </div>
    {/* card end */}
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
  <ModalActivities/>
</div>

  );
};

export default ActivityCalls;
