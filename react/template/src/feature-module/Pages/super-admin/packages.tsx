import { Link } from "react-router";
import PageHeader from "../../../components/page-header/pageHeader";
import PredefinedDatePicker from "../../../components/common-dateRangePicker/PredefinedDatePicker";
import Footer from "../../../components/footer/footer";
import {
  Plan_Currency,
  Plan_Fixed,
  Plan_Position,
  PlanType,
  StatusActive,
  Trial_Days,
} from "../../../core/json/selectOption";
import CommonSelect from "../../../components/common-select/commonSelect";
import { all_routes } from "../../../routes/all_routes";
import { useState } from "react";
import { PackageListData } from "../../../core/json/packageListData";
import SearchInput from "../../../components/dataTable/dataTableSearch";
import Datatable from "../../../components/dataTable";

const Packages = () => {
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
  const data = PackageListData;
  const columns = [
    {
      title: "",
      dataIndex: "Name",
      render: (_: any, record: any) => (
        <div
          className={`set-star rating-select ${
            filledStars[record.key] ? "filled" : ""
          }`}
          onClick={() => handleClick(record.key)}
        >
          <i className="ti ti-star-filled fs-16" />
        </div>
      ),
      sorter: (a: any, b: any) => a.Name.length - b.Name.length,
    },
    {
      title: "Plan Name",
      dataIndex: "PlanName",
      render: (text: string) => (
        <h6 className="fs-14 fw-normal">
          <Link to="#">{text}</Link>
        </h6>
      ),
      sorter: (a: any, b: any) => a.PlanName.length - b.PlanName.length,
    },
    {
      title: "Plan Type",
      dataIndex: "PlanType",
      sorter: (a: any, b: any) => a.PlanType.length - b.PlanType.length,
    },
    {
      title: "Total Subscribers",
      dataIndex: "TotalSubscribers",
      sorter: (a: any, b: any) => a.TotalSubscribers.length - b.TotalSubscribers.length,
    },
    {
      title: "Plan",
      dataIndex: "Plan",
      sorter: (a: any, b: any) => a.Plan.length - b.Plan.length,
    },
    {
      title: "Created Dated",
      dataIndex: "CreatedDated",
      sorter: (a: any, b: any) => a.CreatedDated.length - b.CreatedDated.length,
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text: any) => (
        <span
          className={`badge badge-pill badge-status ${
            text === "Active" ? "bg-success" : "bg-danger"
          }`}
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
            className="action-icon btn btn-xs shadow btn-icon btn-outline-light "
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
              <i className="ti ti-edit text-blue me-1" />
              Edit
            </Link>
            <Link
              className="dropdown-item"
              to="#"
              data-bs-toggle="modal"
              data-bs-target="#delete_packages"
            >
              <i className="ti ti-trash text-blue me-1" />
              Delete
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
            title="Packages"
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
                <SearchInput value={searchText} onChange={handleSearch} />
              </div>
              <Link
                to="#"
                className="btn btn-primary"
                data-bs-toggle="offcanvas"
                data-bs-target="#offcanvas_add"
              >
                <i className="ti ti-square-rounded-plus-filled me-1" />
                Add New Plan
              </Link>
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
                                Select Plan
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
                                      Premium
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
                                data-bs-target="#country"
                                aria-expanded="false"
                                aria-controls="country"
                              >
                                Plan Type
                              </Link>
                            </div>
                            <div
                              className="filter-set-contents accordion-collapse collapse"
                              id="country"
                              data-bs-parent="#accordionExample"
                            >
                              <div className="filter-content-list bg-light rounded border p-2 shadow mt-2">
                                <ul className="mb-0">
                                  <li className="mb-1">
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Monthly
                                    </label>
                                  </li>
                                  <li className="mb-1">
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Yearly
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
                          <Link
                            to={all_routes.superadminPackagelist}
                            className="btn btn-primary w-100"
                          >
                            Filter
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <PredefinedDatePicker />
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
                              <span>Subscriber</span>
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
                        <li className="gap-1 d-flex align-items-center mb-2">
                          <i className="ti ti-columns me-1" />
                          <div className="form-check form-switch w-100 ps-0">
                            <label className="form-check-label d-flex align-items-center gap-2 w-100">
                              <span>Payment</span>
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
                              <span>Tags</span>
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
              {/* Report List */}
              <div className="custom-table">
                <Datatable
                  columns={columns}
                  dataSource={data}
                  Selection={true}
                  searchText={searchText}
                />
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
      {/* Start Add Pack */}
      <div
        className="offcanvas offcanvas-end offcanvas-large"
        tabIndex={-1}
        id="offcanvas_add"
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="fw-semibold">Add New Company</h5>
          <button
            type="button"
            className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          >
            <i className="ti ti-x" />
          </button>
        </div>
        <div className="offcanvas-body">
          <form>
            <div className="card">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-12">
                    <div className="d-flex align-items-center mb-3">
                      <div className="avatar avatar-xxl border border-dashed me-3 flex-shrink-0">
                        <div className="position-relative d-flex align-items-center">
                          <i className="ti ti-photo text-dark fs-16" />
                        </div>
                      </div>
                      <div className="d-inline-flex flex-column align-items-start">
                        <div className="drag-upload-btn btn btn-sm btn-primary position-relative mb-2">
                          <i className="ti ti-file-broken me-1" />
                          Upload file
                          <input
                            type="file"
                            className="form-control image-sign"
                            multiple
                          />
                        </div>
                        <span>JPG, GIF or PNG. Max size of 800K</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3 ">
                      <label className="form-label">
                        Plan Name<span className="text-danger"> *</span>
                      </label>
                      <input type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3 ">
                      <label className="form-label">
                        Plan Type<span className="text-danger"> *</span>
                      </label>
                      <CommonSelect
                        options={PlanType}
                        className="select"
                        defaultValue={PlanType[0]}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3 ">
                      <label className="form-label">
                        Plan Position<span className="text-danger"> *</span>
                      </label>
                      <CommonSelect
                        options={Plan_Position}
                        className="select"
                        defaultValue={Plan_Position[0]}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3 ">
                      <label className="form-label">
                        Plan Currency<span className="text-danger"> *</span>
                      </label>
                      <CommonSelect
                        options={Plan_Currency}
                        className="select"
                        defaultValue={Plan_Currency[0]}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <div className="d-flex justify-content-between">
                        <label className="form-label">
                          Plan Currency<span className="text-danger"> *</span>
                        </label>
                        <span className="text-primary d-md-flex align-items-center">
                          <i className="ti ti-info-circle-filled text-danger me-1" />
                          Set 0 for free
                        </span>
                      </div>
                      <CommonSelect
                        options={Plan_Fixed}
                        className="select"
                        defaultValue={Plan_Fixed[0]}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="mb-3 ">
                      <label className="form-label">
                        Discount Type<span className="text-danger"> *</span>
                      </label>
                      <div className="pass-group">
                        <CommonSelect
                          options={Plan_Fixed}
                          className="select"
                          defaultValue={Plan_Fixed[0]}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="mb-3 ">
                      <label className="form-label">
                        Discount<span className="text-danger"> *</span>
                      </label>
                      <div className="pass-group">
                        <input type="text" className="form-control" />
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3">
                    <div className="mb-3">
                      <label className="form-label">Limitations Invoices</label>
                      <input type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="col-lg-3">
                    <div className="mb-3">
                      <label className="form-label">Max Customers</label>
                      <input type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="col-lg-3">
                    <div className="mb-3">
                      <label className="form-label">Product</label>
                      <input type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="col-lg-3">
                    <div className="mb-3">
                      <label className="form-label">Supplier</label>
                      <input type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <h6 className="fs-14 fw-semibold">Plan Modules</h6>
                      <div className="form-check d-flex align-items-center">
                        <label className="form-check-label mt-0 fw-normal">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="select-all"
                          />
                          Select All
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-lg-3 col-sm-6">
                      <div className="form-check d-flex align-items-center mb-3">
                        <label className="form-check-label mt-0">
                          <input className="form-check-input" type="checkbox" />
                          Contacts
                        </label>
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6">
                      <div className="form-check d-flex align-items-center mb-3">
                        <label className="form-check-label mt-0">
                          <input className="form-check-input" type="checkbox" />
                          Companies
                        </label>
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6">
                      <div className="form-check d-flex align-items-center mb-3">
                        <label className="form-check-label mt-0">
                          <input className="form-check-input" type="checkbox" />
                          Deals
                        </label>
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6">
                      <div className="form-check d-flex align-items-center mb-3">
                        <label className="form-check-label mt-0">
                          <input className="form-check-input" type="checkbox" />
                          Leads
                        </label>
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6">
                      <div className="form-check d-flex align-items-center mb-3">
                        <label className="form-check-label mt-0">
                          <input className="form-check-input" type="checkbox" />
                          Pipelines
                        </label>
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6">
                      <div className="form-check d-flex align-items-center mb-3">
                        <label className="form-check-label mt-0">
                          <input className="form-check-input" type="checkbox" />
                          Projects
                        </label>
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6">
                      <div className="form-check d-flex align-items-center mb-3">
                        <label className="form-check-label mt-0">
                          <input className="form-check-input" type="checkbox" />
                          Tasks
                        </label>
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6">
                      <div className="form-check d-flex align-items-center mb-3">
                        <label className="form-check-label mt-0">
                          <input className="form-check-input" type="checkbox" />
                          Campaigns
                        </label>
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6">
                      <div className="form-check d-flex align-items-center mb-3">
                        <label className="form-check-label mt-0">
                          <input className="form-check-input" type="checkbox" />
                          Contracts
                        </label>
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6">
                      <div className="form-check d-flex align-items-center mb-3">
                        <label className="form-check-label mt-0">
                          <input className="form-check-input" type="checkbox" />
                          Estimations
                        </label>
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6">
                      <div className="form-check d-flex align-items-center mb-3">
                        <label className="form-check-label mt-0">
                          <input className="form-check-input" type="checkbox" />
                          Proposals
                        </label>
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6">
                      <div className="form-check d-flex align-items-center mb-3">
                        <label className="form-check-label mt-0">
                          <input className="form-check-input" type="checkbox" />
                          Invoices
                        </label>
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6">
                      <div className="form-check d-flex align-items-center mb-3">
                        <label className="form-check-label mt-0">
                          <input className="form-check-input" type="checkbox" />
                          Payments
                        </label>
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6">
                      <div className="form-check d-flex align-items-center mb-3">
                        <label className="form-check-label mt-0">
                          <input className="form-check-input" type="checkbox" />
                          Activities
                        </label>
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6">
                      <div className="form-check d-flex align-items-center mb-3">
                        <label className="form-check-label mt-0">
                          <input className="form-check-input" type="checkbox" />
                          Analytics
                        </label>
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6">
                      <div className="form-check d-flex align-items-center mb-3">
                        <label className="form-check-label mt-0">
                          <input className="form-check-input" type="checkbox" />
                          Reports
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-center mb-3">
                        <label
                          className="form-check-label mt-0 me-2"
                          htmlFor="access_trail"
                        >
                          Access Trial
                        </label>
                        <div className="form-check form-switch me-2">
                          <input
                            className="form-check-input me-2"
                            id="access_trail"
                            type="checkbox"
                            role="switch"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row align-items-center gx-3">
                    <div className="col-md-6">
                      <div className="d-flex align-items-center mb-3">
                        <div className="flex-fill">
                          <label className="form-label">Trial Days</label>
                          <CommonSelect
                            options={Trial_Days}
                            className="select"
                            defaultValue={Trial_Days[0]}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">
                          Status<span className="text-danger"> *</span>
                        </label>
                        <CommonSelect
                          options={StatusActive}
                          className="select"
                          defaultValue={StatusActive[0]}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-center flex-wrap mb-0">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            id="access_trail2"
                            type="checkbox"
                            role="switch"
                          />
                        </div>
                        <label
                          className="form-check-label mt-0"
                          htmlFor="access_trail2"
                        >
                          Access Trial
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="d-flex align-items-center justify-content-end">
              <button
                type="button"
                data-bs-dismiss="offcanvas"
                className="btn btn-sm btn-light me-2"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-sm btn-primary">
                Create New
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* End Add Pack */}
      {/* Start Edit Pack */}
      <div
        className="offcanvas offcanvas-end offcanvas-large"
        tabIndex={-1}
        id="offcanvas_edit"
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="fw-semibold">Edit Company</h5>
          <button
            type="button"
            className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          >
            <i className="ti ti-x" />
          </button>
        </div>
        <div className="offcanvas-body">
          <form>
            <div className="card">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-12">
                    <div className="d-flex align-items-center mb-3">
                      <div className="avatar avatar-xxl border border-dashed me-3 flex-shrink-0">
                        <div className="position-relative d-flex align-items-center">
                          <i className="ti ti-photo text-dark fs-16" />
                        </div>
                      </div>
                      <div className="d-inline-flex flex-column align-items-start">
                        <div className="drag-upload-btn btn btn-sm btn-primary position-relative mb-2">
                          <i className="ti ti-file-broken me-1" />
                          Upload file
                          <input
                            type="file"
                            className="form-control image-sign"
                            multiple
                          />
                        </div>
                        <span>JPG, GIF or PNG. Max size of 800K</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3 ">
                      <label className="form-label">
                        Plan Name<span className="text-danger"> *</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        defaultValue="Basic"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3 ">
                      <label className="form-label">
                        Plan Type<span className="text-danger"> *</span>
                      </label>
                      <CommonSelect
                        options={PlanType}
                        className="select"
                        defaultValue={PlanType[1]}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3 ">
                      <label className="form-label">
                        Plan Position<span className="text-danger"> *</span>
                      </label>
                      <CommonSelect
                        options={Plan_Position}
                        className="select"
                        defaultValue={Plan_Position[1]}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3 ">
                      <label className="form-label">
                        Plan Currency<span className="text-danger"> *</span>
                      </label>
                      <CommonSelect
                        options={Plan_Currency}
                        className="select"
                        defaultValue={Plan_Currency[1]}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <div className="d-flex justify-content-between">
                        <label className="form-label">
                          Plan Currency<span className="text-danger"> *</span>
                        </label>
                        <span className="text-primary d-md-flex align-items-center">
                          <i className="ti ti-info-circle-filled text-danger me-1" />
                          Set 0 for free
                        </span>
                      </div>
                      <CommonSelect
                        options={Plan_Fixed}
                        className="select"
                        defaultValue={Plan_Fixed[1]}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="mb-3 ">
                      <label className="form-label">
                        Discount Type<span className="text-danger"> *</span>
                      </label>
                      <div className="pass-group">
                        <CommonSelect
                          options={Plan_Fixed}
                          className="select"
                          defaultValue={Plan_Fixed[1]}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="mb-3 ">
                      <label className="form-label">
                        Discount<span className="text-danger"> *</span>
                      </label>
                      <div className="pass-group">
                        <input
                          type="text"
                          className="form-control"
                          defaultValue=""
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3">
                    <div className="mb-3">
                      <label className="form-label">Limitations Invoices</label>
                      <input type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="col-lg-3">
                    <div className="mb-3">
                      <label className="form-label">Max Customers</label>
                      <input type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="col-lg-3">
                    <div className="mb-3">
                      <label className="form-label">Product</label>
                      <input type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="col-lg-3">
                    <div className="mb-3">
                      <label className="form-label">Supplier</label>
                      <input type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <h6 className="fs-14 fw-semibold">Plan Modules</h6>
                      <div className="form-check d-flex align-items-center">
                        <label className="form-check-label mt-0 fw-normal">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="select-all-3"
                          />
                          Select All
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-lg-3 col-sm-6">
                      <div className="form-check d-flex align-items-center mb-3">
                        <label className="form-check-label mt-0">
                          <input className="form-check-input" type="checkbox" />
                          Contacts
                        </label>
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6">
                      <div className="form-check d-flex align-items-center mb-3">
                        <label className="form-check-label mt-0">
                          <input className="form-check-input" type="checkbox" />
                          Companies
                        </label>
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6">
                      <div className="form-check d-flex align-items-center mb-3">
                        <label className="form-check-label mt-0">
                          <input className="form-check-input" type="checkbox" />
                          Deals
                        </label>
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6">
                      <div className="form-check d-flex align-items-center mb-3">
                        <label className="form-check-label mt-0">
                          <input className="form-check-input" type="checkbox" />
                          Leads
                        </label>
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6">
                      <div className="form-check d-flex align-items-center mb-3">
                        <label className="form-check-label mt-0">
                          <input className="form-check-input" type="checkbox" />
                          Pipelines
                        </label>
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6">
                      <div className="form-check d-flex align-items-center mb-3">
                        <label className="form-check-label mt-0">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            defaultChecked
                          />
                          Projects
                        </label>
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6">
                      <div className="form-check d-flex align-items-center mb-3">
                        <label className="form-check-label mt-0">
                          <input className="form-check-input" type="checkbox" />
                          Tasks
                        </label>
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6">
                      <div className="form-check d-flex align-items-center mb-3">
                        <label className="form-check-label mt-0">
                          <input className="form-check-input" type="checkbox" />
                          Campaigns
                        </label>
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6">
                      <div className="form-check d-flex align-items-center mb-3">
                        <label className="form-check-label mt-0">
                          <input className="form-check-input" type="checkbox" />
                          Contracts
                        </label>
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6">
                      <div className="form-check d-flex align-items-center mb-3">
                        <label className="form-check-label mt-0">
                          <input className="form-check-input" type="checkbox" />
                          Estimations
                        </label>
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6">
                      <div className="form-check d-flex align-items-center mb-3">
                        <label className="form-check-label mt-0">
                          <input className="form-check-input" type="checkbox" />
                          Proposals
                        </label>
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6">
                      <div className="form-check d-flex align-items-center mb-3">
                        <label className="form-check-label mt-0">
                          <input className="form-check-input" type="checkbox" />
                          Invoices
                        </label>
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6">
                      <div className="form-check d-flex align-items-center mb-3">
                        <label className="form-check-label mt-0">
                          <input className="form-check-input" type="checkbox" />
                          Payments
                        </label>
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6">
                      <div className="form-check d-flex align-items-center mb-3">
                        <label className="form-check-label mt-0">
                          <input className="form-check-input" type="checkbox" />
                          Activities
                        </label>
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6">
                      <div className="form-check d-flex align-items-center mb-3">
                        <label className="form-check-label mt-0">
                          <input className="form-check-input" type="checkbox" />
                          Analytics
                        </label>
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6">
                      <div className="form-check d-flex align-items-center mb-3">
                        <label className="form-check-label mt-0">
                          <input className="form-check-input" type="checkbox" />
                          Reports
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-center mb-3">
                        <label className="form-check-label mt-0 me-2 text-dark">
                          Access Trial
                        </label>
                        <div className="form-check form-switch me-2">
                          <input
                            className="form-check-input me-2"
                            type="checkbox"
                            role="switch"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row align-items-center gx-3">
                    <div className="col-md-6">
                      <div className="d-flex align-items-center mb-3">
                        <div className="flex-fill">
                          <label className="form-label">Trial Days</label>
                          <CommonSelect
                            options={Trial_Days}
                            className="select"
                            defaultValue={Trial_Days[1]}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">
                          Status<span className="text-danger"> *</span>
                        </label>
                        <CommonSelect
                          options={StatusActive}
                          className="select"
                          defaultValue={StatusActive[1]}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-center flex-wrap mb-0">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                          />
                        </div>
                        <label className="form-check-label mt-0 text-dark">
                          Access Trial
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="d-flex align-items-center justify-content-end">
              <button
                type="button"
                data-bs-dismiss="offcanvas"
                className="btn btn-sm btn-light me-2"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-sm btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* End Edit Pack */}
      {/* delete modal */}
      <div className="modal fade" id="delete_packages">
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

export default Packages;
