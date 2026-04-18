import { Link } from "react-router";
import Footer from "../../../../components/footer/footer";
import PageHeader from "../../../../components/page-header/pageHeader";
import ImageWithBasePath from "../../../../components/imageWithBasePath";
import SearchInput from "../../../../components/dataTable/dataTableSearch";
import PredefinedDatePicker from "../../../../components/common-dateRangePicker/PredefinedDatePicker";
import { useState } from "react";
import LeadsChart from "../../crm-module/analytics/chart/leadsChart";
import LeadsAnalysisChart from "../../dashboard/deals-dashboard/chats/leadsAnalysis";
import { all_routes } from "../../../../routes/all_routes";
import { LeadsReportListData } from "../../../../core/json/leadsReportListData";
import Datatable from "../../../../components/dataTable";
import LeadsReportModal from "./modal/leadsReportModal";

const LeadReports = () => {
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
  const data = LeadsReportListData;
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
      title: "Lead Name",
      dataIndex: "LeadName",
      render: (text: string, render: any) => (
        <h6 className="d-flex fs-14 align-items-center fw-medium mb-0">
          <Link to="#" className="avatar avatar-rounded border me-2">
            <ImageWithBasePath
              src={`assets/img/users/${render.LeadImage}`}
              alt="User Image"
            />
          </Link>
          <Link to="#" className="d-flex flex-column">
            {text}
          </Link>
        </h6>
      ),
      sorter: (a: any, b: any) => a.LeadName.length - b.LeadName.length,
    },
    {
      title: "Company Name",
      dataIndex: "CompanyName",
      render: (text: any, render: any) => (
        <h6 className="d-flex fs-14 align-items-center fw-medium mb-0">
          <Link
            to={all_routes.companyDetails}
            className="avatar rounded-circle border me-2"
          >
            <ImageWithBasePath
              className="w-auto h-auto"
              src={`assets/img/company/${render.CompanyImage}`}
              alt="User Image"
            />
          </Link>
          <Link to={all_routes.companyDetails} className="d-flex flex-column">
            {text}
            <span className="text-body fs-13 fw-normal mt-1">
              {render.Location}
            </span>
          </Link>
        </h6>
      ),
      sorter: (a: any, b: any) => a.CompanyName.length - b.CompanyName.length,
    },
    {
      title: "Phone",
      dataIndex: "Phone",
      sorter: (a: any, b: any) => a.Phone.length - b.Phone.length,
    },
    {
      title: "Lead Status",
      dataIndex: "LeadStatus",
      render: (text: any) => (
        <span
          className={`badge badge-tag ${
            text === "Closed"
              ? "bg-success"
              : text === "Not Closed"
              ? "bg-info"
              : text === "Contacted"
              ? "bg-warning "
              : "bg-danger"
          }`}
        >
          {text}
        </span>
      ),
      sorter: (a: any, b: any) => a.LeadStatus.length - b.LeadStatus.length,
    },
    {
      title: "Created Date",
      dataIndex: "CreatedDate",
      sorter: (a: any, b: any) => a.CreatedDate.length - b.CreatedDate.length,
    },
    {
      title: "Lead Owner",
      dataIndex: "LeadOwner",
      render: (text: any, render: any) => (
        <h6 className="d-flex fs-14 align-items-center fw-medium mb-0">
          <Link to="#" className="avatar avatar-rounded border me-2">
            <ImageWithBasePath
              src={`assets/img/profiles/${render.OwnerImage}`}
              alt="User Image"
            />
          </Link>
          <Link to="#" className="d-flex flex-column">
            {text}
          </Link>
        </h6>
      ),
      sorter: (a: any, b: any) => a.LeadOwner.length - b.LeadOwner.length,
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
            title="Lead Report"
            badgeCount={125}
            showModuleTile={false}
            showExport={false}
          />
          {/* End Page Header */}
          <div className="row">
            <div className="col-md-7 d-flex">
              <div className="card shadow flex-fill">
                <div className="card-header d-flex justify-content-between align-items-center flex-wrap row-gap-2">
                  <h6 className="mb-0">Leads By Year</h6>
                  <div className="dropdown">
                    <Link
                      className="dropdown-toggle btn btn-outline-light shadow"
                      data-bs-toggle="dropdown"
                      to="#"
                    >
                      <i className="ti ti-calendar me-1" />
                      2025
                    </Link>
                    <div className="dropdown-menu dropdown-menu-end">
                      <Link to="#" className="dropdown-item">
                        2025
                      </Link>
                      <Link to="#" className="dropdown-item">
                        2024
                      </Link>
                      <Link to="#" className="dropdown-item">
                        2023
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div id="leads-report">
                    <LeadsChart />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-5 d-flex">
              <div className="card shadow flex-fill">
                <div className="card-header d-flex justify-content-between align-items-center flex-wrap row-gap-2">
                  <h6 className="mb-0">Leads By Source</h6>
                  <div className="dropdown">
                    <Link
                      className="dropdown-toggle btn btn-outline-light shadow"
                      data-bs-toggle="dropdown"
                      to="#"
                    >
                      <i className="ti ti-calendar me-1" />
                      2025
                    </Link>
                    <div className="dropdown-menu dropdown-menu-end">
                      <Link to="#" className="dropdown-item">
                        2025
                      </Link>
                      <Link to="#" className="dropdown-item">
                        2024
                      </Link>
                      <Link to="#" className="dropdown-item">
                        2023
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div id="leads-analysis">
                    <LeadsAnalysisChart />
                  </div>
                </div>
              </div>
            </div>
          </div>
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
                data-bs-toggle="modal"
                data-bs-target="#download_report"
              >
                <i className="ti ti-file-download me-1" />
                Download Report
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
                                data-bs-toggle="collapse"
                                data-bs-target="#collapseTwo"
                                aria-expanded="true"
                                aria-controls="collapseTwo"
                              >
                                Lead Name
                              </Link>
                            </div>
                            <div
                              className="filter-set-contents accordion-collapse collapse show"
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
                                data-bs-target="#collapseThree"
                                aria-expanded="false"
                                aria-controls="collapseThree"
                              >
                                Lead Status
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
                                      Closed
                                    </label>
                                  </li>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Not Closed
                                    </label>
                                  </li>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Contacted
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
                                Lead Owner
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
                                    <SearchInput
                                      value={searchText}
                                      onChange={handleSearch}
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
                                      Robert Johnson
                                    </label>
                                  </li>
                                  <li className="mb-1">
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Isabella Cooper
                                    </label>
                                  </li>
                                  <li className="mb-1">
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      John Smith
                                    </label>
                                  </li>
                                  <li className="mb-1">
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Sophia Parker
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
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <Link to="#" className="btn btn-outline-light w-100">
                            Reset
                          </Link>
                          <Link
                            to={all_routes.leadReports}
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
                              <span>Lead Name</span>
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
                              <span>Company Name</span>
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
                              <span>Phone</span>
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
                              <span>Lead Status</span>
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
                              <span>Created Date</span>
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
                              <span>Lead Owner</span>
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
        <LeadsReportModal/>
    </>
  );
};

export default LeadReports;
