import { Link } from "react-router";
import Footer from "../../../../components/footer/footer";
import ImageWithBasePath from "../../../../components/imageWithBasePath";
import PredefinedDatePicker from "../../../../components/common-dateRangePicker/PredefinedDatePicker";
import { useState } from "react";
import { InvoicesListData } from "../../../../core/json/invoicesListData";
import { all_routes } from "../../../../routes/all_routes";
import SearchInput from "../../../../components/dataTable/dataTableSearch";
import PageHeader from "../../../../components/page-header/pageHeader";
import Datatable from "../../../../components/dataTable";
import ModalInvoice from "./modal/modalInvoice";

const InvoicesList = () => {
  const [searchText, setSearchText] = useState<string>("");

  const handleSearch = (value: string) => {
    setSearchText(value);
  };
  const data = InvoicesListData;
  const columns = [
    {
      title: "Invoice ID",
      dataIndex: "Invoice_ID",
      render: (text: string) => (
        <Link to="#" className="title-name">
          {text}
        </Link>
      ),
      sorter: (a: any, b: any) => a.Invoice_ID.length - b.Invoice_ID.length,
    },
    {
      title: "Client",
      dataIndex: "Client",
      render: (text: any, render: any) => (
        <h6 className="d-flex align-items-center fs-14 mb-0 fw-medium">
          <Link
            to={all_routes.companyDetails}
            className="avatar rounded-circle border me-2"
          >
            <ImageWithBasePath
              className="w-auto h-auto"
              src={`assets/img/company/${render.Client_Image}`}
              alt="User Image"
            />
          </Link>
          <Link to={all_routes.companyDetails} className="d-flex flex-column">
            {text}
          </Link>
        </h6>
      ),
      sorter: (a: any, b: any) => a.Client.length - b.Client.length,
    },
    {
      title: "Project",
      dataIndex: "project",
      render: (text: any, render: any) => (
        <h6 className="d-flex align-items-center fs-14 mb-0 fw-medium">
          <Link
            to={all_routes.projectDetails}
            className="avatar avatar-rounded border me-2"
          >
            <ImageWithBasePath
              className="w-auto h-auto"
              src={`assets/img/projects/${render.Project_Image}`}
              alt="User Image"
            />
          </Link>
          <Link to={all_routes.projectDetails} className="d-flex flex-column">
            {text}
          </Link>
        </h6>
      ),
      sorter: (a: any, b: any) => a.project.length - b.project.length,
    },
    {
      title: "Due Date",
      dataIndex: "Due_Date",
      sorter: (a: any, b: any) => a.Due_Date.length - b.Due_Date.length,
    },
    {
      title: "Amount",
      dataIndex: "Amount",
      sorter: (a: any, b: any) => a.Amount.length - b.Amount.length,
    },
    {
      title: "Paid Amount",
      dataIndex: "Paid_Amount",
      sorter: (a: any, b: any) => a.Paid_Amount.length - b.Paid_Amount.length,
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text: any) => (
        <span
          className={`badge ${
            text === "Partially Paid"
              ? "bg-warning"
              : text === "Paid"
              ? "bg-success"
              : text === "Overdue"
              ? "bg-info"
              : "bg-danger"
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
              <i className="ti ti-edit me-1" /> Edit
            </Link>
            <Link
              className="dropdown-item"
              to="#"
              data-bs-toggle="modal"
              data-bs-target="#delete_invoices"
            >
              <i className="ti ti-trash me-1" />
              Delete
            </Link>
            <Link className="dropdown-item" to={all_routes.invoice_details}>
              <i className="ti ti-clipboard-copy me-1" /> View Invoices
            </Link>
            <Link className="dropdown-item" to="#">
              <i className="ti ti-checks me-1" /> Mark as Paid
            </Link>
            <Link className="dropdown-item" to="#">
              <i className="ti ti-file me-1" /> Mark as Partially Paid
            </Link>
            <Link className="dropdown-item" to="#">
              <i className="ti ti-sticker me-1" /> Mark ad Unpaid
            </Link>
            <Link className="dropdown-item" to="#">
              <i className="ti ti-printer me-1" /> Print
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
        <div className="content">
          {/* Page Header */}
          <PageHeader
            title="Invoices"
            badgeCount={125}
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
                Add New Invoice
              </Link>
            </div>
            <div className="card-body">
              {/* table header */}
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <div className="dropdown">
                    <Link
                      to="#"
                      className="dropdown-toggle btn btn-outline-light px-2 fs-16 fw-bold border-0"
                      data-bs-toggle="dropdown"
                    >
                      All Invoices
                    </Link>
                    <div className="dropdown-menu">
                      <ul>
                        <li>
                          <Link to="#" className="dropdown-item">
                            <i className="ti ti-dots-vertical me-1" />
                            All Invoices
                          </Link>
                        </li>
                        <li>
                          <Link to="#" className="dropdown-item">
                            <i className="ti ti-dots-vertical me-1" />
                            Paid
                          </Link>
                        </li>
                        <li>
                          <Link to="#" className="dropdown-item">
                            <i className="ti ti-dots-vertical me-1" />
                            Partially Paid
                          </Link>
                        </li>
                        <li>
                          <Link to="#" className="dropdown-item">
                            <i className="ti ti-dots-vertical me-1" />
                            Overdue
                          </Link>
                        </li>
                        <li>
                          <Link to="#" className="dropdown-item">
                            <i className="ti ti-dots-vertical me-1" />
                            Unpaid
                          </Link>
                        </li>
                      </ul>
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
                                Client
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
                                      NovaWave LLC
                                    </label>
                                  </li>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Redwood Inc
                                    </label>
                                  </li>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Harborview
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
                                Project
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
                                      Turelysell
                                    </label>
                                  </li>
                                  <li className="mb-1">
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Dreamschat
                                    </label>
                                  </li>
                                  <li className="mb-1">
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      DreamGigs
                                    </label>
                                  </li>
                                  <li className="mb-1">
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Servbook
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
                                Amount
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
                                      $2,15,000
                                    </label>
                                  </li>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      $1,45,000
                                    </label>
                                  </li>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      $2,12,000
                                    </label>
                                  </li>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      $4,80,380
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
                            to={all_routes.InvoiceList}
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
                              <span>Invoice ID</span>
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
                              <span>Client</span>
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
                              <span>Project</span>
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
                              <span>Amount</span>
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
                              <span>Paid AMount</span>
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
                  <div className="d-flex align-items-center shadow p-1 rounded border view-icons bg-white">
                    <Link
                      to={all_routes.InvoiceList}
                      className="btn btn-sm p-1 border-0 fs-14 active"
                    >
                      <i className="ti ti-list-tree" />
                    </Link>
                    <Link
                      to={all_routes.InvoiceGrid}
                      className="flex-shrink-0 btn btn-sm p-1 border-0 ms-1 fs-14"
                    >
                      <i className="ti ti-grid-dots" />
                    </Link>
                  </div>
                </div>
              </div>
              {/* table header */}
              {/* contracts List */}
              <div className="custom-table table-nowrap">
                <Datatable
                  columns={columns}
                  dataSource={data}
                  Selection={true}
                  searchText={searchText}
                />
              </div>
              {/* /contracts List */}
            </div>
          </div>
          {/* card end */}
          <div className="load-btn text-center">
            <Link to="#" className="btn btn-primary">
              <i className="ti ti-loader me-1" /> Load More
            </Link>
          </div>
        </div>
        {/* End Content */}
        {/* Start Footer */}
        <Footer />
        {/* End Footer */}
      </div>
      {/* ========================
			End Page Content
		========================= */}
      <ModalInvoice />
    </>
  );
};

export default InvoicesList;
