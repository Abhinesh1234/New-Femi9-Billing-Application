import { Link } from "react-router";
import PageHeader from "../../../components/page-header/pageHeader";
import { all_routes } from "../../../routes/all_routes";
import PredefinedDatePicker from "../../../components/common-dateRangePicker/PredefinedDatePicker";
import ImageWithBasePath from "../../../components/imageWithBasePath";
import Footer from "../../../components/footer/footer";
import {
  Currency,
  Language,
  Plan_Name,
  PlanType,
} from "../../../core/json/selectOption";
import CommonSelect from "../../../components/common-select/commonSelect";
import CommonDatePicker from "../../../components/common-datePicker/commonDatePicker";
import CommonPhoneInput from "../../../components/common-phoneInput/commonPhoneInput";
import { useState } from "react";
import Datatable from "../../../components/dataTable";
import { SuperAdminCompanyListData } from "../../../core/json/superAdminCompanyListData";
import SearchInput from "../../../components/dataTable/dataTableSearch";
type PasswordField = "password" | "confirmPassword";

const Company = () => {
  const [phone, setPhone] = useState<string | undefined>();
  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
    confirmPassword: false,
  });

  const togglePasswordVisibility = (field: PasswordField) => {
    setPasswordVisibility((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

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
  const data = SuperAdminCompanyListData;
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
      title: "Name",
      dataIndex: "Name",
      render: (text: string, render: any) => (
        <div className="d-flex align-items-center">
          <Link to="#" className="avatar rounded-circle border p-1 me-2">
            <ImageWithBasePath
              className="w-auto h-auto"
              src={`assets/img/icons/${render.Image}`}
              alt="User Image"
            />
          </Link>
          <Link to="#" className="d-flex flex-column fw-medium">
            {text}
          </Link>
        </div>
      ),
      sorter: (a: any, b: any) => a.Name.length - b.Name.length,
    },
    {
      title: "Email",
      dataIndex: "Email",
      sorter: (a: any, b: any) => a.Email.length - b.Email.length,
    },
    {
      title: "Account URL",
      dataIndex: "AccountURL",
      sorter: (a: any, b: any) => a.AccountURL.length - b.AccountURL.length,
    },
    {
      title: "Plan",
      dataIndex: "Plan",
      render: (text: any) => (
        <div className="d-flex align-items-center justify-content-between">
          <span>{text}</span>
          <Link
            to="#"
            className="badge badge-tag badge-soft-info ms-2"
            data-bs-toggle="offcanvas"
            data-bs-target="#upgrade_plan"
          >
            Upgrade
          </Link>
        </div>
      ),
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
              data-bs-target="#delete_company"
            >
              <i className="ti ti-trash text-blue me-1" />
              Delete
            </Link>
            <Link
              className="dropdown-item"
              to="#"
              data-bs-toggle="modal"
              data-bs-target="#company_detail"
            >
              <i className="ti ti-eye text-blue me-1" />
              View
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
            title="Companies"
            badgeCount={152}
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
                Add New Page
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
                                data-bs-target="#country"
                                aria-expanded="false"
                                aria-controls="country"
                              >
                                Country
                              </Link>
                            </div>
                            <div
                              className="filter-set-contents accordion-collapse collapse"
                              id="country"
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
                                      USA
                                    </label>
                                  </li>
                                  <li className="mb-1">
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      France
                                    </label>
                                  </li>
                                  <li className="mb-1">
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Italy
                                    </label>
                                  </li>
                                  <li className="mb-1">
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Germany
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
                          <Link to="#" className="btn btn-outline-light w-100">
                            Reset
                          </Link>
                          <Link
                            to={all_routes.superadminCompany}
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
                              <span>Email</span>
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
                              <span>Account URL</span>
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
                              <span>Created Dated</span>
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
                                defaultChecked
                              />
                            </label>
                          </div>
                        </li>
                        <li className="gap-1 d-flex align-items-center">
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
      {/* Start Upgrade Plane */}
      <div
        className="offcanvas offcanvas-end offcanvas-large"
        tabIndex={-1}
        id="upgrade_plan"
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="mb-0">Upgrade Package</h5>
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
            <div className="accordion accordion-bordered" id="main_accordion2">
              {/* Details Info */}
              <div className="accordion-item rounded mb-3">
                <div className="accordion-header">
                  <Link
                    to="#"
                    className="accordion-button accordion-custom-button rounded"
                    data-bs-toggle="collapse"
                    data-bs-target="#basic2"
                  >
                    <span className="avatar avatar-md rounded me-1">
                      <i className="ti ti-details" />
                    </span>
                    Current Plan Details
                  </Link>
                </div>
                <div
                  className="accordion-collapse collapse show"
                  id="basic2"
                  data-bs-parent="#main_accordion2"
                >
                  <div className="accordion-body border-top">
                    <div className="row align-items-center row-gap-3 mb-3">
                      <div className="col-md-4">
                        <div>
                          <p className="fs-14 mb-1 text-dark">Company Name</p>
                          <p className="fs-14 fw-semibold text-dark mb-0">
                            NovaWave LLC
                          </p>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div>
                          <p className="fs-14 mb-1 text-dark">Plan Name</p>
                          <p className="fs-14 fw-semibold text-dark mb-0">
                            Advanced
                          </p>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div>
                          <p className="fs-14 mb-1 text-dark">Plan Type</p>
                          <p className="fs-14 fw-semibold text-dark mb-0">
                            Monthly
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="row align-items-center row-gap-3">
                      <div className="col-md-4">
                        <div>
                          <p className="fs-14 mb-1 text-dark">Price</p>
                          <p className="fs-14 fw-semibold text-dark mb-0">
                            200
                          </p>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div>
                          <p className="fs-14 mb-1 text-dark">Register Date</p>
                          <p className="fs-14 fw-semibold text-dark mb-0">
                            12 Sep 2024
                          </p>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div>
                          <p className="fs-14 mb-1 text-dark">Expiring On</p>
                          <p className="fs-14 fw-semibold text-dark mb-0">
                            11 Oct 2024
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* /Details Info */}
              {/* Plan Info */}
              <div className="accordion-item border-top rounded mb-3">
                <div className="accordion-header">
                  <Link
                    to="#"
                    className="accordion-button accordion-custom-button rounded"
                    data-bs-toggle="collapse"
                    data-bs-target="#address2"
                  >
                    <span className="avatar avatar-md rounded me-1">
                      <i className="ti ti-chart-circles" />
                    </span>
                    Change Plan
                  </Link>
                </div>
                <div
                  className="accordion-collapse collapse"
                  id="address2"
                  data-bs-parent="#main_accordion2"
                >
                  <div className="accordion-body border-top">
                    <div className="row row-gap-3">
                      <div className="col-md-6">
                        <div>
                          <label className="form-label">
                            Plan Name <span className="text-danger">*</span>
                          </label>
                          <CommonSelect
                            options={Plan_Name}
                            className="select"
                            defaultValue={Plan_Name[0]}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div>
                          <label className="form-label">
                            Plan Type <span className="text-danger">*</span>
                          </label>
                          <CommonSelect
                            options={PlanType}
                            className="select"
                            defaultValue={PlanType[0]}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div>
                          <label className="form-label">
                            Amount<span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            defaultValue="Data Analytics"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div>
                          <label className="form-label">
                            Payment Date <span className="text-danger">*</span>
                          </label>
                          <div className="input-icon-end position-relative">
                            <CommonDatePicker placeholder="dd/mm/yyyy" />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div>
                          <label className="form-label">
                            Next Payment Date{" "}
                            <span className="text-danger">*</span>
                          </label>
                          <div className="input-icon-end position-relative">
                            <CommonDatePicker placeholder="dd/mm/yyyy" />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div>
                          <label className="form-label">
                            Expiring On <span className="text-danger">*</span>
                          </label>
                          <div className="input-icon-end position-relative">
                            <CommonDatePicker placeholder="dd/mm/yyyy" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* /Plan Info */}
            </div>
            <div className="d-flex align-items-center justify-content-end">
              <button
                type="button"
                data-bs-dismiss="offcanvas"
                className="btn btn-light me-2"
              >
                Cancel
              </button>
              <button type="button" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* End Upgrade Plane */}
      {/* Start Add Company */}
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
          <div className="card">
            <div className="card-body">
              <form>
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
                    <div className="mb-3">
                      <label className="form-label">
                        Company Name <span className="text-danger"> *</span>
                      </label>
                      <input type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Email Address</label>
                      <input type="email" className="form-control" />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Account URL</label>
                      <input type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Phone Number <span className="text-danger"> *</span>
                      </label>
                      <input type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Website</label>
                      <input type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3 ">
                      <label className="form-label">
                        Password <span className="text-danger"> *</span>
                      </label>
                      <div className="input-group input-group-flat pass-group">
                        <input
                          type={
                            passwordVisibility.password ? "text" : "password"
                          }
                          className="form-control pass-input"
                          placeholder="****************"
                        />
                        <span
                          className={`ti toggle-password input-group-text toggle-password ${
                            passwordVisibility.password
                              ? "ti-eye"
                              : "ti-eye-off"
                          }`}
                          onClick={() => togglePasswordVisibility("password")}
                        ></span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3 ">
                      <label className="form-label">
                        Confirm Password <span className="text-danger"> *</span>
                      </label>
                      <div className="input-group input-group-flat pass-group">
                        <input
                          type={
                            passwordVisibility.confirmPassword
                              ? "text"
                              : "password"
                          }
                          className="form-control pass-input"
                          placeholder="****************"
                        />
                        <span
                          className={`ti toggle-password input-group-text toggle-password ${
                            passwordVisibility.confirmPassword
                              ? "ti-eye"
                              : "ti-eye-off"
                          }`}
                          onClick={() =>
                            togglePasswordVisibility("confirmPassword")
                          }
                        ></span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Address</label>
                      <input type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3 ">
                      <label className="form-label">
                        Plan Name <span className="text-danger"> *</span>
                      </label>
                      <CommonSelect
                        options={Plan_Name}
                        className="select"
                        defaultValue={Plan_Name[0]}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3 ">
                      <label className="form-label">
                        Plan Type <span className="text-danger"> *</span>
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
                        Currency <span className="text-danger"> *</span>
                      </label>
                      <CommonSelect
                        options={Currency}
                        className="select"
                        defaultValue={Currency[0]}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3 ">
                      <label className="form-label">
                        Language <span className="text-danger"> *</span>
                      </label>
                      <CommonSelect
                        options={Language}
                        className="select"
                        defaultValue={Language[0]}
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-0">
                      <div className="radio-wrap">
                        <label className="form-label">Status</label>
                        <div className="d-flex flex-wrap">
                          <div className="me-2">
                            <input
                              type="radio"
                              className="status-radio"
                              id="person"
                              name="leave"
                              defaultChecked
                            />
                            <label htmlFor="person">Active</label>
                          </div>
                          <div>
                            <input
                              type="radio"
                              className="status-radio"
                              id="Organization"
                              name="leave"
                            />
                            <label htmlFor="Organization">Inactive</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
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
        </div>
      </div>
      {/* End Add Company */}
      {/* Start Edit Company */}
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
          <div className="card">
            <div className="card-body">
              <form>
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
                    <div className="mb-3">
                      <label className="form-label">
                        Company Name <span className="text-danger"> *</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        defaultValue="NovaWave LLC"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        defaultValue="nova@llc.com"
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Account URL</label>
                      <input
                        type="text"
                        className="form-control"
                        defaultValue="nw.nova.com"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Phone Number <span className="text-danger"> *</span>
                      </label>
                      <CommonPhoneInput
                        value={phone}
                        onChange={setPhone}
                        placeholder="(201) 555-0123"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Website</label>
                      <input type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3 ">
                      <label className="form-label">
                        Password <span className="text-danger"> *</span>
                      </label>
                      <div className="input-group input-group-flat pass-group">
                        <input
                          type={
                            passwordVisibility.password ? "text" : "password"
                          }
                          className="form-control pass-input"
                          placeholder="****************"
                        />
                        <span
                          className={`ti toggle-password input-group-text toggle-password ${
                            passwordVisibility.password
                              ? "ti-eye"
                              : "ti-eye-off"
                          }`}
                          onClick={() => togglePasswordVisibility("password")}
                        ></span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3 ">
                      <label className="form-label">
                        Confirm Password <span className="text-danger"> *</span>
                      </label>
                      <div className="input-group input-group-flat pass-group">
                        <input
                          type={
                            passwordVisibility.confirmPassword
                              ? "text"
                              : "password"
                          }
                          className="form-control pass-input"
                          placeholder="****************"
                        />
                        <span
                          className={`ti toggle-password input-group-text toggle-password ${
                            passwordVisibility.confirmPassword
                              ? "ti-eye"
                              : "ti-eye-off"
                          }`}
                          onClick={() =>
                            togglePasswordVisibility("confirmPassword")
                          }
                        ></span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Address</label>
                      <input
                        type="text"
                        className="form-control"
                        defaultValue="146 Settlers Lane New York, NY 10013"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3 ">
                      <label className="form-label">
                        Plan Name <span className="text-danger"> *</span>
                      </label>
                      <CommonSelect
                        options={Plan_Name}
                        className="select"
                        defaultValue={Plan_Name[1]}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3 ">
                      <label className="form-label">
                        Plan Type <span className="text-danger"> *</span>
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
                        Currency <span className="text-danger"> *</span>
                      </label>
                      <CommonSelect
                        options={Currency}
                        className="select"
                        defaultValue={Currency[1]}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3 ">
                      <label className="form-label">
                        Language <span className="text-danger"> *</span>
                      </label>
                      <CommonSelect
                        options={Language}
                        className="select"
                        defaultValue={Language[0]}
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-0">
                      <div className="radio-wrap">
                        <label className="form-label">Status</label>
                        <div className="d-flex flex-wrap">
                          <div className="me-2">
                            <input
                              type="radio"
                              className="status-radio"
                              id="person1"
                              name="leave"
                              defaultChecked
                            />
                            <label htmlFor="person1">Active</label>
                          </div>
                          <div>
                            <input
                              type="radio"
                              className="status-radio"
                              id="Organization1"
                              name="leave"
                            />
                            <label htmlFor="Organization1">Inactive</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
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
              Save changes
            </button>
          </div>
        </div>
      </div>
      {/* End Edit Company */}
      {/* Start Company Detail */}
      <div className="modal fade custom-modal" id="company_detail">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Company Detail</h4>
              <button
                type="button"
                className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <div className="modal-body">
              <div
                className="accordion accordion-bordered"
                id="main_accordion1"
              >
                {/* Start Details Info */}
                <div className="accordion-item rounded mb-3">
                  <div className="accordion-header">
                    <Link
                      to="#"
                      className="accordion-button accordion-custom-button rounded"
                      data-bs-toggle="collapse"
                      data-bs-target="#basic3"
                    >
                      <span className="avatar avatar-md rounded me-1">
                        <i className="ti ti-chart-circles" />
                      </span>
                      Basic Info
                    </Link>
                  </div>
                  <div
                    className="accordion-collapse collapse show"
                    id="basic3"
                    data-bs-parent="#main_accordion2"
                  >
                    <div className="accordion-body border-top">
                      <div className="row align-items-center row-gap-3 mb-3">
                        <div className="col-md-4">
                          <div>
                            <p className="fs-14 mb-1">Account URL</p>
                            <p className="fs-14 fw-semibold text-dark mb-0">
                              nw.example.com
                            </p>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div>
                            <p className="fs-14 mb-1">Phone Number</p>
                            <p className="fs-14 fw-semibold text-dark mb-0">
                              +1 875455453
                            </p>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div>
                            <p className="fs-14 mb-1">Website</p>
                            <p className="fs-14 fw-semibold text-dark mb-0">
                              www.example.com
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="row align-items-center row-gap-3">
                        <div className="col-md-4">
                          <div>
                            <p className="fs-14 mb-1">Currency</p>
                            <p className="fs-14 fw-semibold text-dark mb-0">
                              200
                            </p>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div>
                            <p className="fs-14 mb-1">Language</p>
                            <p className="fs-14 fw-semibold text-dark mb-0">
                              English
                            </p>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div>
                            <p className="fs-14 mb-1">Addresss</p>
                            <p className="fs-14 fw-semibold text-dark mb-0">
                              37 Lynn Avenue, Phelps, WI 54554
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* End Details Info */}
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
                            <p className="fs-14 mb-1">Price</p>
                            <p className="fs-14 fw-semibold text-dark mb-0">
                              $200
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="row align-items-center row-gap-3">
                        <div className="col-md-4">
                          <div>
                            <p className="fs-14 mb-1">Register Date</p>
                            <p className="fs-14 fw-semibold text-dark mb-0">
                              25 Sep 2025
                            </p>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div>
                            <p className="fs-14 mb-1">Expiring On</p>
                            <p className="fs-14 fw-semibold text-dark mb-0">
                              25 Oct 2025
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
          </div>
        </div>
      </div>
      {/* End Company Detail */}
      {/* delete modal */}
      <div className="modal fade" id="delete_company">
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

export default Company;
