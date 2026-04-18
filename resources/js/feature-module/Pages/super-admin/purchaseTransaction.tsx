import { Link } from "react-router";
import PredefinedDatePicker from "../../../components/common-dateRangePicker/PredefinedDatePicker";
import Footer from "../../../components/footer/footer";
import { all_routes } from "../../../routes/all_routes";
import ImageWithBasePath from "../../../components/imageWithBasePath";
import PageHeader from "../../../components/page-header/pageHeader";
import { useState } from "react";
import { PurchaseTransactionListData } from "../../../core/json/purchaseTransactionListData";
import SearchInput from "../../../components/dataTable/dataTableSearch";
import Datatable from "../../../components/dataTable";

const PurchaseTransaction = () => {
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
  const data = PurchaseTransactionListData;
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
      title: "Invoice ID",
      dataIndex: "InvoiceID",
      render: (text: string) => (
        <Link
          to="#"
          data-bs-toggle="modal"
          data-bs-target="#view_invoice"
          className="link-default"
        >
          {text}
        </Link>
      ),
      sorter: (a: any, b: any) => a.InvoiceID.length - b.InvoiceID.length,
    },
    {
      title: "Customer",
      dataIndex: "Customer",
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
      sorter: (a: any, b: any) => a.Customer.length - b.Customer.length,
    },
    {
      title: "Email",
      dataIndex: "Email",
      sorter: (a: any, b: any) => a.Email.length - b.Email.length,
    },
    {
      title: "Created Date",
      dataIndex: "CreatedDate",
      sorter: (a: any, b: any) => a.CreatedDate.length - b.CreatedDate.length,
    },
    {
      title: "Amount",
      dataIndex: "Amount",
      sorter: (a: any, b: any) => a.Amount.length - b.Amount.length,
    },
    {
      title: "Payment Method",
      dataIndex: "PaymentMethod",
      sorter: (a: any, b: any) =>
        a.PaymentMethod.length - b.PaymentMethod.length,
    },

    {
      title: "Status",
      dataIndex: "Status",
      render: (text: any) => (
        <span
          className={`badge badge-pill badge-status ${
            text === "paid" ? "bg-success" : "bg-danger"
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
              data-bs-toggle="modal"
              data-bs-target="#purchase_details"
            >
              <i className="ti ti-eye text-blue-light me-1" /> Preview
            </Link>
            <Link className="dropdown-item" to="#">
              <i className="ti ti-download text-blue me-1" />
              Download
            </Link>
            <Link
              className="dropdown-item"
              to="#"
              data-bs-toggle="modal"
              data-bs-target="#delete_purchase"
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
            title="Purchase Transaction"
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
                                Payment
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
                                      Payment Method
                                    </label>
                                  </li>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Paypal
                                    </label>
                                  </li>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Debit Card
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
                                      Paid
                                    </label>
                                  </li>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Unpaid
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
                            to={all_routes.superadminSubscription}
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
                              <span>Domain Url</span>
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
                        <li className="gap-1 d-flex align-items-center mb-0">
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
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              {/* table header */}
              {/* Report List */}
              <div className="table-responsive custom-table">
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
      {/* Start View Invoice */}
      <div className="modal fade" id="purchase_details">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-body p-4">
              <div className="row justify-content-between align-items-center mb-3">
                <div className="col-md-6">
                  <div className="mb-4">
                    <div className="super-admin-logo-dark">
                    <ImageWithBasePath
                      src="assets/img/logo.svg"
                      className="img-fluid"
                      alt="logo"
                    />
                    </div>
                    <div className="super-admin-logo-light">
                    <ImageWithBasePath
                      src="assets/img/logo-white.svg"
                      className="img-fluid"
                      alt="logo"
                    />
  </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className=" text-end mb-3">
                    <h5 className="text-dark mb-1">Invoice</h5>
                    <p className="mb-1 fw-normal">
                      <i className="ti ti-file-invoice me-1" />
                      INV0287
                    </p>
                    <p className="mb-1 fw-normal">
                      <i className="ti ti-calendar me-1" />
                      Issue date : 12 Sep 2025{" "}
                    </p>
                    <p className="fw-normal">
                      <i className="ti ti-calendar me-1" />
                      Due date : 12 Oct 2025{" "}
                    </p>
                  </div>
                </div>
              </div>
              <div className="row mb-3 d-flex justify-content-between">
                <div className="col-md-7">
                  <p className="text-dark mb-2 fw-semibold fs-14">
                    Invoice From :
                  </p>
                  <div>
                    <p className="mb-1">Crms</p>
                    <p className="mb-1">
                      797 Hilltop Street, Springfield <br /> New York, United
                      States
                    </p>
                    <p className="mb-1">crms@example.com</p>
                  </div>
                </div>
                <div className="col-md-5">
                  <p className="text-dark mb-2 fw-semibold fs-14">
                    Invoice To :
                  </p>
                  <div>
                    <p className="mb-1">NovaWave LLC</p>
                    <p className="mb-1">
                      367 Hillcrest Lane, Irvine, California,
                      <br /> United States United States
                    </p>
                    <p className="mb-1">michael@example.com</p>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <div className="table-responsive mb-3">
                  <table className="table table-nowrap">
                    <thead className="table-light">
                      <tr>
                        <th>Plan</th>
                        <th>Billing Cycle</th>
                        <th>Created Date</th>
                        <th>Expiring On</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Advanced (Monthly)</td>
                        <td>30 Days</td>
                        <td>12 Sep 2024</td>
                        <td>12 Oct 2024</td>
                        <td>$200</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="row mb-3 d-flex justify-content-between">
                <div className="col-md-4">
                  <div>
                    <h6 className="mb-4 fw-medium">Payment info:</h6>
                    <p className="mb-0">Credit Card - 123***********789</p>
                    <div className="d-flex justify-content-between align-items-center mb-2 pe-3">
                      <p className="mb-0">Amount</p>
                      <p className="text-dark">$200.00</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex justify-content-between align-items-center pe-3">
                    <p className="text-dark mb-2">Sub Total</p>
                    <p className="mb-2">$200.00</p>
                  </div>
                  <div className="d-flex justify-content-between align-items-center pe-3">
                    <p className="text-dark mb-2">Tax </p>
                    <p className="mb-2">$0.00</p>
                  </div>
                  <div className="d-flex justify-content-between align-items-center pe-3">
                    <p className="text-dark mb-0">Total</p>
                    <p className="text-dark fw-medium mb-0">$200.00</p>
                  </div>
                </div>
              </div>
              <div className="card border mb-0">
                <div className="card-body">
                  <p className="text-dark fw-medium mb-2">
                    Terms &amp; Conditions:
                  </p>
                  <p className="fs-14 fw-normal d-flex align-items-baseline mb-2">
                    <i className="ti ti-point-filled text-primary fs-12 me-1" />
                    All payments must be made according to the agreed schedule.
                    Late payments may incur additional fees.
                  </p>
                  <p className="fs-14 fw-normal d-flex align-items-baseline mb-0">
                    <i className="ti ti-point-filled text-primary fs-12 me-1" />
                    We are not liable for any indirect, incidental, or
                    consequential damages, including loss of profits, revenue,
                    or data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* End View Invoice */}
      {/* delete modal */}
      <div className="modal fade" id="delete_purchase">
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

export default PurchaseTransaction;
