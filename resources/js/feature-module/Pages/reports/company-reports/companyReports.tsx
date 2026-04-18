import { Link } from "react-router";
import Footer from "../../../../components/footer/footer";
import ImageWithBasePath from "../../../../components/imageWithBasePath";
import PageHeader from "../../../../components/page-header/pageHeader";
import PredefinedDatePicker from "../../../../components/common-dateRangePicker/PredefinedDatePicker";
import CompanyYearChart from "../../dashboard/deals-dashboard/chats/companyReportChart";
import LeadsAnalysisChart from "../../dashboard/deals-dashboard/chats/leadsAnalysis";
import Datatable from "../../../../components/dataTable";
import SearchInput from "../../../../components/dataTable/dataTableSearch";
import { useState } from "react";
import { all_routes } from "../../../../routes/all_routes";
import { CompanyReportListData } from "../../../../core/json/companyReportListData";
import LeadsReportModal from "../lead-reports/modal/leadsReportModal";

const CompanyReports = () => {
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

  const data = CompanyReportListData;
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
        <h6 className="d-flex align-items-center fs-14 fw-medium mb-0">
          <Link
            to={all_routes.companiesDetails}
            className="avatar rounded-circle border me-2"
          >
            <ImageWithBasePath
              className="w-auto h-auto"
              src={`assets/img/company/${render.Image}`}
              alt="User Image"
            />
          </Link>
          <Link to={all_routes.companyDetails}>{text}</Link>
        </h6>
      ),
      sorter: (a: any, b: any) => a.Name.length - b.Name.length,
    },
    {
      title: "Email",
      dataIndex: "Email",
      sorter: (a: any, b: any) => a.Email.length - b.Email.length,
    },
    {
      title: "Tags",
      dataIndex: "Tags",
      render: (text: any) => (
        <span
          className={`badge badge-pill badge-status ${
            text === "Collab"
              ? "badge-soft-success"
              : text === "Promotion"
              ? "badge-soft-danger"
              : "badge-soft-warning"
          }`}
        >
          {text}
        </span>
      ),
      sorter: (a: any, b: any) => a.Tags.length - b.Tags.length,
    },
    {
      title: "Owner",
      dataIndex: "Owner",
      render: (text: any, render: any) => (
        <h6 className="d-flex align-items-center fs-14 fw-medium mb-0">
  <Link to="#" className="avatar avatar-sm avatar-rounded me-2">
    <ImageWithBasePath src={`assets/img/profiles/${render.OwnerImage}`} alt="User Image" />
  </Link>
  <Link to="#">{text}</Link>
</h6>

      ),
      sorter: (a: any, b: any) => a.Owner.length - b.Owner.length,
    },
   
    {
      title: "Contact",
      dataIndex: "Contact",
      render: () => (
        <ul className="social-links d-flex align-items-center">
          <li>
            <a href="#">
              <i className="ti ti-mail" />
            </a>
          </li>
          <li>
            <a href="#">
              <i className="ti ti-phone-check" />
            </a>
          </li>
          <li>
            <a href="#">
              <i className="ti ti-message-circle-share" />
            </a>
          </li>
          <li>
            <a href="#">
              <i className="ti ti-brand-facebook " />
            </a>
          </li>
        </ul>
      ),
      sorter: (a: any, b: any) => a.Contact.length - b.Contact.length,
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
            title="Company Reports"
            badgeCount={125}
            showModuleTile={false}
            showExport={false}
          />
          {/* End Page Header */}
          <div className="row">
            <div className="col-md-7 d-flex">
              <div className="card shadow flex-fill">
                <div className="card-header d-flex justify-content-between align-items-center flex-wrap row-gap-2">
                  <h6 className="mb-0">Companies By Year</h6>
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
                  <div id="company-year">
                    <CompanyYearChart />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-5 d-flex">
              <div className="card shadow flex-fill">
                <div className="card-header d-flex justify-content-between align-items-center flex-wrap row-gap-2">
                  <h6 className="mb-0">Contacts By Source</h6>
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
                <SearchInput value={searchText} onChange={handleSearch} />
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
                                Name
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
                                          src="assets/img/company/company-01.svg"
                                          className="flex-shrink-0 rounded-circle"
                                          alt="img"
                                        />
                                      </span>
                                      NovaWave LLC
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
                                          src="assets/img/company/company-02.svg"
                                          className="flex-shrink-0 rounded-circle"
                                          alt="img"
                                        />
                                      </span>
                                      BlueSky Industries
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
                                          src="assets/img/company/company-03.svg"
                                          className="flex-shrink-0 rounded-circle"
                                          alt="img"
                                        />
                                      </span>
                                      Silver Hawk
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
                                          src="assets/img/company/company-04.svg"
                                          className="flex-shrink-0 rounded-circle"
                                          alt="img"
                                        />
                                      </span>
                                      Summit Peak
                                    </label>
                                  </li>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      <span className="avatar avatar-xs rounded-circle me-2">
                                        <ImageWithBasePath
                                          src="assets/img/company/company-05.svg"
                                          className="flex-shrink-0 rounded-circle"
                                          alt="img"
                                        />
                                      </span>
                                      RiverStone Ltd
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
                          <Link
                            to="#"
                            className="btn btn-outline-light w-100"
                          >
                            Reset
                          </Link>
                          <Link
                            to={all_routes.companyReports}
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
                              <span>Contact</span>
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
              <div className=" custom-table">
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

export default CompanyReports;
