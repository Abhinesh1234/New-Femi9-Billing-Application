import { Link } from "react-router"

const ModalPayments = () => {
  return (
    <>
  {/* Preview Payment */}
  <div
    className="offcanvas offcanvas-end offcanvas-large"
    tabIndex={-1}
    id="offcanvas_view"
  >
    <div className="offcanvas-header border-bottom justify-content-between">
      <h5 className="mb-0">
        Payment for Invoice<span className=" text-danger ms-2">#274738</span>{" "}
      </h5>
      <div className="d-flex align-items-center">
        <div className="toggle-header-popup">
          <div className="dropdown table-action me-2">
            <Link
              to="#"
              className="btn btn-dropdowns btn-outline-light dropdown-toggle"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Download
            </Link>
            <div className="dropdown-menu dropdown-menu-right">
              <Link className="dropdown-item " to="#">
                Download
              </Link>
              <Link className="dropdown-item " to="#">
                Download PDF
              </Link>
            </div>
          </div>
        </div>
        <button
          type="button"
          className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        >
          <i className="ti ti-x" />
        </button>
      </div>
    </div>
    <div className="offcanvas-body">
      <form>
        <div className="card mb-0 shadow">
          <div className="card-body pb-3">
            <div className="details-propsal">
              <h6 className="mb-3">Proposal From &amp; To</h6>
              <div className="row row-gap-2">
                <div className="col-lg-6 col-12">
                  <div className="proposal-to">
                    <h6 className="mb-2 fw-semibold fs-14">CRMS</h6>
                    <p className="mb-1">
                      3338 Marcus Street Birmingham, AL 35211
                    </p>
                    <p className="mb-1">
                      Phone : <span className="text-dark">+1 98789 78788</span>{" "}
                    </p>
                    <p className="mb-1">
                      Email :{" "}
                      <span className="text-dark">info@example.com</span>
                    </p>
                  </div>
                </div>
                <div className="col-lg-6 col-12">
                  <div className="proposal-to">
                    <h6 className="mb-2 fw-semibold fs-14">NovaWave LLC </h6>
                    <p className="mb-1">
                      994 Martine Ranch Suite 900 Candacefort New Hampshire
                    </p>
                    <p className="mb-1">
                      Phone : <span className="text-dark">+1 58478 74646</span>
                    </p>
                    <p className="mb-1">
                      Email :{" "}
                      <span className="text-dark">info@example.net</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <hr />
            <div className="details-propsal details-propsals border-bottom pb-3 mb-3">
              <h6 className="mb-3">Payment Details</h6>
              <ul className="d-flex align-items-centers justify-content-between gap-2 flex-wrap">
                <li>
                  <p className="fs-13 fw-medium mb-1">Payment Date</p>
                  <h6 className="fs-14 fw-normal">13 May 2024</h6>
                </li>
                <li>
                  <p className="fs-13 fw-medium mb-1">Payment Method</p>
                  <h6 className="fs-14 fw-normal">Cash</h6>
                </li>
                <li>
                  <p className="fs-13 fw-medium mb-1">Total Amount</p>
                  <h6 className="fs-14 fw-normal">$96</h6>
                </li>
              </ul>
            </div>
            <div className="details-propsal">
              <div className="d-flex align-items-center justify-content-between">
                <h6 className="mb-3">Invoice Details</h6>
                <h6 className="d-flex fs-14 fw-normal">
                  <span className="text-danger"> Amount Due : </span> $100
                </h6>
              </div>
              <ul className="m-0 border-0 d-flex align-items-centers justify-content-between gap-2 flex-wrap">
                <li>
                  <p className="fs-13 fw-medium mb-1">Invoice Number</p>
                  <h6 className="mb-0">
                    <span className="badge badge-soft-danger d-inline-flex">
                      #1254057
                    </span>
                  </h6>
                </li>
                <li>
                  <p className="fs-13 fw-medium mb-1">Invoice Date</p>
                  <h6 className="fs-14 fw-normal">13 May 2024</h6>
                </li>
                <li>
                  <p className="fs-13 fw-medium mb-1">Invoice Amount</p>
                  <h6 className="fs-14 fw-normal">$196</h6>
                </li>
                <li>
                  <p className="fs-13 fw-medium mb-1">Payment Amount</p>
                  <h6 className="fs-14 fw-normal">$96</h6>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
  {/* /Preview payment */}
  {/* delete modal */}
  <div className="modal fade" id="delete_payments">
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
            Are you sure you want to remove invoice you selected.
          </p>
          <div className="d-flex justify-content-center">
            <Link
              to="#"
              className="btn btn-light position-relative z-1 me-2 w-100"
              data-bs-dismiss="modal"
            >
              Cancel
            </Link>
            <Link
              to="#"
              className="btn btn-primary position-relative z-1 w-100"
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

  )
}

export default ModalPayments