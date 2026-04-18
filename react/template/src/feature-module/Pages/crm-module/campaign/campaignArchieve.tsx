import { Link } from "react-router";
import Footer from "../../../../components/footer/footer";
import PageHeader from "../../../../components/page-header/pageHeader";
import { all_routes } from "../../../../routes/all_routes";
import ImageWithBasePath from "../../../../components/imageWithBasePath";
import { useState } from "react";
import Datatable from "../../../../components/dataTable";
import SearchInput from "../../../../components/dataTable/dataTableSearch";
import PredefinedDatePicker from "../../../../components/common-dateRangePicker/PredefinedDatePicker";
import { campaignArchieveListData } from "../../../../core/json/campaignArchieveListData";
import ModalCampaign from "./modal/modalCampaign";
import CommonDatePicker from "../../../../components/common-datePicker/commonDatePicker";

const CampaignArchieve = () => {
  const [searchText, setSearchText] = useState<string>("");

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const [filledStars, setFilledStars] = useState<{ [key: string]: boolean }>(
    {}
  );

  const handleClick = (key: string) => {
    setFilledStars((prev) => ({
      ...prev,
      [key]: !prev[key], // toggle on/off
    }));
  };
  const data = campaignArchieveListData;
  const columns = [
    {
      title: "",
      dataIndex: "Name",
      render: (_: any, record: any) => (
        <div
          className={`set-star rating-select ${
            filledStars[record.Name] ? "filled" : ""
          }`}
          onClick={() => handleClick(record.Name)}
        >
          <i className="ti ti-star-filled fs-16" />
        </div>
      ),
      sorter: (a: any, b: any) => a.Name.length - b.Name.length,
    },
    {
      title: "Name",
      dataIndex: "Name",
      sorter: (a: any, b: any) => a.Name.length - b.Name.length,
    },
    {
      title: "Type",
      dataIndex: "Type",
      sorter: (a: any, b: any) => a.Type.length - b.Type.length,
    },
    {
      title: "Progress",
      dataIndex: "Progress1",
      render: (_text: any, render: any) => (
        <ul className="list-progress d-flex gap-3">
          <li>
            <h6 className="fs-14 fw-semibold mb-1">{render.Progress1}</h6>
            <p className="fs-13 mb-0">Opened</p>
          </li>
          <li>
            <h6 className="fs-14 fw-semibold mb-1">{render.Progress2}</h6>
            <p className="fs-13 mb-0">Closed</p>
          </li>
          <li>
            <h6 className="fs-14 fw-semibold mb-1">{render.Progress3}</h6>
            <p className="fs-13 mb-0">Unsubscribe</p>
          </li>
          <li>
            <h6 className="fs-14 fw-semibold mb-1">{render.Progress4}</h6>
            <p className="fs-13 mb-0">Delivered</p>
          </li>
          <li>
            <h6 className="fs-14 fw-semibold mb-1">{render.Progress5}</h6>
            <p className="fs-13 mb-0">Conversation</p>
          </li>
        </ul>
      ),
      sorter: (a: any, b: any) => a.Progress1.length - b.Progress1.length,
    },
    {
      title: "Members",
      dataIndex: "Members",
      render: (text: any) => (
        <ul className="avatar-list-stacked avatar-group-sm">
          <li className="avatar avatar-rounded flex-shrink-0">
            <Link to="#">
              <ImageWithBasePath
                src="assets/img/profiles/avatar-14.jpg"
                alt="img"
              />
            </Link>
          </li>
          <li className="avatar avatar-rounded flex-shrink-0">
            <Link to="#">
              <ImageWithBasePath
                src="assets/img/profiles/avatar-15.jpg"
                alt="img"
              />
            </Link>
          </li>
          <li className="avatar avatar-rounded flex-shrink-0">
            <Link to="#">
              <ImageWithBasePath
                src="assets/img/profiles/avatar-16.jpg"
                alt="img"
              />
            </Link>
          </li>
          <li className="avatar avatar-rounded flex-shrink-0 bg-light fs-10">
            <Link to="#">{text}</Link>
          </li>
        </ul>
      ),
      sorter: (a: any, b: any) => a.Members.length - b.Members.length,
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text: string) => (
        <span
          className={`badge badge-pill badge-status ${
            text === "Success"
              ? "bg-success"
              : text === "Pending"
              ? "bg-warning"
              : text === "Paused"
              ? "bg-info"
              : "bg-danger"
          } `}
        >
          {text}
        </span>
      ),
      sorter: (a: any, b: any) => a.Status.length - b.Status.length,
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
              data-bs-target="#delete_campaign"
            >
              <i className="ti ti-trash" /> Delete
            </Link>
          </div>
        </div>
      ),
      sorter: (a: any, b: any) => a.Action.length - b.Action.length,
    },
  ];
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
            title="Campaign"
            badgeCount={125}
            showModuleTile={false}
            showExport={true}
          />
          {/* End Page Header */}
          {/* row start */}
          <div className="row">
            <div className="col-xl-3 col-md-6">
              <div className="card shadow">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <span className="avatar avatar-lg rounded-circle bg-secondary fs-24 flex-shrink-0">
                        <i className="ti ti-brand-campaignmonitor" />
                      </span>
                      <div>
                        <p className="mb-1 text-truncate">Campaign</p>
                        <h6 className="mb-0">474</h6>
                      </div>
                    </div>
                    <span className="badge badge-soft-success">+5.62%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="card shadow">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <span className="avatar avatar-lg rounded-circle bg-info fs-24 flex-shrink-0">
                        <i className="ti ti-send" />
                      </span>
                      <div>
                        <p className="mb-1 text-truncate">Sent</p>
                        <h6 className="mb-0">454</h6>
                      </div>
                    </div>
                    <span className="badge badge-soft-success">+4.12%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="card shadow">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <span className="avatar avatar-lg rounded-circle bg-danger fs-24 flex-shrink-0">
                        <i className="ti ti-brand-feedly" />
                      </span>
                      <div>
                        <p className="mb-1 text-truncate">Opened</p>
                        <h6 className="mb-0">650</h6>
                      </div>
                    </div>
                    <span className="badge badge-soft-success">+3.14%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="card shadow">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <span className="avatar avatar-lg rounded-circle bg-success fs-24 flex-shrink-0">
                        <i className="ti ti-checks" />
                      </span>
                      <div>
                        <p className="mb-1 text-truncate">Completed</p>
                        <h6 className="mb-0">650</h6>
                      </div>
                    </div>
                    <span className="badge badge-soft-success">+6.27%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* row end */}
          {/* Campaign Tab */}
          <div className="campaign-tab">
            <ul className="nav nav-tabs nav-bordered mb-4">
              <li className="nav-item">
                <Link
                  to={all_routes.campaign}
                  className="nav-link bg-transparent"
                >
                  Active Campaign
                  <span className="fs-10 fw-normal ms-1 text-body">24</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to={all_routes.campaignComplete}
                  className="nav-link  bg-transparent "
                >
                  Completed Campaign
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to={all_routes.campaignArchieve}
                  className="nav-link active bg-transparent text-primary"
                >
                  Archived Campaign
                </Link>
              </li>
            </ul>
          </div>
          {/* Campaign Tab */}
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
                Add New Campaign
              </Link>
            </div>
            <div className="card-body">
              {/* table header */}
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
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
                          <Link
                            to="#"
                            className="dropdown-item"
                          >
                            Newest
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="#"
                            className="dropdown-item"
                          >
                            Oldest
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <PredefinedDatePicker/>
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
                                Name
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
                                      Distribution
                                    </label>
                                  </li>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Menchandising
                                    </label>
                                  </li>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Pricing
                                    </label>
                                  </li>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Increased Sales
                                    </label>
                                  </li>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Brand recognition
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
                                Type
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
                                      Public Relations
                                    </label>
                                  </li>
                                  <li className="mb-1">
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Content Marketing
                                    </label>
                                  </li>
                                  <li className="mb-1">
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Social Marketing
                                    </label>
                                  </li>
                                  <li className="mb-1">
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Brand
                                    </label>
                                  </li>
                                  <li className="mb-1">
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Sales
                                    </label>
                                  </li>
                                  <li className="mb-1">
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Media
                                    </label>
                                  </li>
                                  <li className="mb-1">
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Rebranding
                                    </label>
                                  </li>
                                  <li className="mb-1">
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Product launch
                                    </label>
                                  </li>
                                  <li className="mb-1">
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Content Marketing
                                    </label>
                                  </li>
                                  <li className="mb-1">
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Brand
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
                                      Success
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
                                      Bounced
                                    </label>
                                  </li>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Paused
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
                              <span>Type</span>
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
                              <span>Progress</span>
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
                              <span>Members</span>
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
                              <span>Start Date</span>
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
                              <span>End Date</span>
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
                              <span>Status</span>
                              <input
                                className="form-check-input switchCheckDefault ms-auto"
                                type="checkbox"
                                role="switch"
                              />
                            </label>
                          </div>
                        </li>
                        <li className="gap-1 d-flex align-items-center mb-2">
                          <i className="ti ti-columns me-1" />
                          <div className="form-check form-switch w-100 ps-0">
                            <label className="form-check-label d-flex align-items-center gap-2 w-100">
                              <span>Created</span>
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
              {/* Campaign List */}
              <div className="table-nowrap custom-table">
                <Datatable
                  columns={columns}
                  dataSource={data}
                  Selection={true}
                  searchText={searchText}
                />
              </div>

              {/* /Campaign List */}
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
        <ModalCampaign/>
    </>
  );
};

export default CampaignArchieve;
