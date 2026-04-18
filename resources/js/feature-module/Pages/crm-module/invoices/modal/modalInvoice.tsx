import { Link } from "react-router"
import { Client, Currency, Payment_Method, Proposal_Project, Status_Paid, Zero } from "../../../../../core/json/selectOption"
import CommonSelect from "../../../../../components/common-select/commonSelect"
import CommonDatePicker from "../../../../../components/common-datePicker/commonDatePicker"
import TextEditor from "../../../../../components/texteditor/texteditor"


const ModalInvoice = () => {
  return (
    <>
  {/* Add New Invoices */}
  <div
    className="offcanvas offcanvas-end offcanvas-large"
    tabIndex={-1}
    id="offcanvas_add"
  >
    <div className="offcanvas-header border-bottom">
      <h5 className="mb-0">Add New Invoice</h5>
      <button
        type="button"
        className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
        data-bs-dismiss="offcanvas"
        aria-label="Close"
      ></button>
    </div>
    <div className="offcanvas-body">
      <form >
        <div>
          <div className="row">
            <div className="mb-3">
              <div className="d-flex align-items-center justify-content-between">
                <label className="form-label">Client</label>
                <Link
                  to="#"
                  className="text-primary mb-1"
                  data-bs-toggle="modal"
                  data-bs-target="#add_deal"
                >
                  <i className="ti ti-plus me-1" />
                  Add New
                </Link>
              </div>
              <CommonSelect
                            options={Client}
                            className="select"
                            defaultValue={Client[0]}
                          />
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">
                  Bill To<span className="text-danger"> *</span>
                </label>
                <input className="form-control" type="text" />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">
                  Ship To<span className="text-danger"> *</span>
                </label>
                <input className="form-control" type="text" />
              </div>
            </div>
            <div className="mb-3">
              <div className="d-flex align-items-center justify-content-between">
                <label className="form-label">Project</label>
                <Link
                  to="#"
                  className="text-primary mb-1"
                  data-bs-toggle="modal"
                  data-bs-target="#add_deal"
                >
                  <i className="ti ti-plus me-1" />
                  Add New
                </Link>
              </div>
              <CommonSelect
                            options={Proposal_Project}
                            className="select"
                            defaultValue={Proposal_Project[0]}
                          />
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">
                  Amount<span className="text-danger"> *</span>
                </label>
                <input className="form-control" type="text" />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">
                  Currency <span className="text-danger">*</span>
                </label>
                <CommonSelect
                            options={Currency}
                            className="select"
                            defaultValue={Currency[0]}
                          />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Date</label>
                <div className="input-group w-auto input-group-flat">
                  <CommonDatePicker placeholder="dd/mm/yyyy" />

                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">
                  Open Till<span className="text-danger">*</span>
                </label>
                <div className="input-group w-auto input-group-flat">
                  <CommonDatePicker placeholder="dd/mm/yyyy" />
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Payment Method</label>
                <CommonSelect
                            options={Payment_Method}
                            className="select"
                            defaultValue={Payment_Method[0]}
                          />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Status</label>
                <CommonSelect
                            options={Status_Paid}
                            className="select"
                            defaultValue={Status_Paid[0]}
                          />
              </div>
            </div>
            <div className="col-md-12 mb-3">
              <div className="mb-3">
                <label className="form-label">
                  Description <span className="text-danger">*</span>
                </label>
                <div className="editor pages-editor">
                    <TextEditor/>
                </div>
              </div>
            </div>
            <div className="table-responsive mb-3">
              <table className="table table-borderless table-nowrap">
                <thead className="table-light">
                  <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th className="w-25">Discount</th>
                    <th>Amount</th>
                    <th />
                  </tr>
                </thead>
                <tbody className="invoices-list-two">
                  <tr>
                    <td>
                      <div className="input-table input-table-descripition">
                        <input type="text" className="form-control" />
                      </div>
                    </td>
                    <td>
                      <div>
                        <input type="text" className="form-control" />
                      </div>
                    </td>
                    <td>
                      <div>
                        <input type="text" className="form-control" />
                      </div>
                    </td>
                    <td>
                      <div>
                        <CommonSelect
                            options={Zero}
                            className="select"
                            defaultValue={Zero[0]}
                          />
                      </div>
                    </td>
                    <td>
                      <div>
                        <input type="text" className="form-control" />
                      </div>
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <Link to="#" className="text-primary add-invoices-two mb-3">
              <i className="ti ti-plus me-1" />
              Add New
            </Link>
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="fs-14 fw-semibold mb-0">Subtotal</h6>
                  <h6 className="fs-14 fw-semibold mb-0">$0.00</h6>
                </div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="fs-14 fw-semibold mb-0">Discount 2%</h6>
                  <h6 className="fs-14 fw-semibold mb-0">$18</h6>
                </div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="fs-14 fw-semibold mb-0">Extra Discount 0%</h6>
                  <h6 className="fs-14 fw-semibold mb-0">$18</h6>
                </div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="fs-14 fw-semibold mb-0">Tax</h6>
                  <h6 className="fs-14 fw-semibold mb-0">$18</h6>
                </div>
                <div className="d-flex align-items-center justify-content-between">
                  <h6 className="fs-14 fw-semibold mb-0">Total</h6>
                  <h6 className="fs-14 fw-semibold mb-0">$18</h6>
                </div>
              </div>
            </div>
            <div className="col-md-12">
              <div className="mb-3">
                <label className="form-label">Notes</label>
                <textarea className="form-control" rows={3} defaultValue={""} />
              </div>
            </div>
            <div className="col-md-12">
              <div className="mb-3">
                <label className="form-label">Terms &amp; Conditions</label>
                <textarea className="form-control" rows={3} defaultValue={""} />
              </div>
            </div>
          </div>
        </div>
        <div className="d-flex align-items-center justify-content-end">
          <button
            type="button"
            data-bs-dismiss="offcanvas"
            className="btn btn-light me-2"
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Create
          </button>
        </div>
      </form>
    </div>
  </div>
  {/* /Add New Invoices */}
  {/* Edit Invoices */}
  <div
    className="offcanvas offcanvas-end offcanvas-large"
    tabIndex={-1}
    id="offcanvas_edit"
  >
    <div className="offcanvas-header border-bottom">
      <h5 className="mb-0">Edit Invoice</h5>
      <button
        type="button"
        className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
        data-bs-dismiss="offcanvas"
        aria-label="Close"
      ></button>
    </div>
    <div className="offcanvas-body">
      <form >
        <div>
          <div className="row">
            <div className="mb-3">
              <div className="d-flex align-items-center justify-content-between">
                <label className="form-label">Client</label>
                <Link
                  to="#"
                  className="text-primary mb-1"
                  data-bs-toggle="modal"
                  data-bs-target="#add_deal"
                >
                  <i className="ti ti-plus me-1" />
                  Add New
                </Link>
              </div>
              <CommonSelect
                            options={Client}
                            className="select"
                            defaultValue={Client[1]}
                          />
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">
                  Bill To<span className="text-danger"> *</span>
                </label>
                <input className="form-control" type="text" />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">
                  Ship To<span className="text-danger"> *</span>
                </label>
                <input className="form-control" type="text" />
              </div>
            </div>
            <div className="mb-3">
              <div className="d-flex align-items-center justify-content-between">
                <label className="form-label">Project</label>
                <Link
                  to="#"
                  className="text-primary mb-1"
                  data-bs-toggle="modal"
                  data-bs-target="#add_deal"
                >
                  <i className="ti ti-plus me-1" />
                  Add New
                </Link>
              </div>
                <CommonSelect
                            options={Proposal_Project}
                            className="select"
                            defaultValue={Proposal_Project[1]}
                          />
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">
                  Amount<span className="text-danger"> *</span>
                </label>
                <input
                  className="form-control"
                  type="text"
                  defaultValue="2,15,000"
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">
                  Currency <span className="text-danger">*</span>
                </label>
                <CommonSelect
                            options={Currency}
                            className="select"
                            defaultValue={Currency[1]}
                          />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Date</label>
                <div className="input-group w-auto input-group-flat">
                 <CommonDatePicker placeholder="dd/mm/yyyy" />

                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">
                  Open Till<span className="text-danger">*</span>
                </label>
                <div className="input-group w-auto input-group-flat">
                 <CommonDatePicker placeholder="dd/mm/yyyy" />
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Payment Method</label>
                 <CommonSelect
                            options={Payment_Method}
                            className="select"
                            defaultValue={Payment_Method[1]}
                          />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Status</label>
                <CommonSelect
                            options={Status_Paid}
                            className="select"
                            defaultValue={Status_Paid[1]}
                          />
              </div>
            </div>
            <div className="col-md-12 mb-3">
              <div className="mb-3">
                <label className="form-label">
                  Description <span className="text-danger">*</span>
                </label>
                <div className="editor pages-editor">
                  <TextEditor/>
                </div>
              </div>
            </div>
            <div className="table-responsive mb-3">
              <table className="table table-borderless table-nowrap">
                <thead className="table-light">
                  <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th className="w-25">Discount</th>
                    <th>Amount</th>
                    <th />
                  </tr>
                </thead>
                <tbody className="invoices-list-3">
                  <tr>
                    <td>
                      <div className="input-table input-table-descripition">
                        <input
                          type="text"
                          className="form-control"
                          defaultValue="CRM License Pro"
                        />
                      </div>
                    </td>
                    <td>
                      <div>
                        <input
                          type="text"
                          className="form-control"
                          defaultValue={5}
                        />
                      </div>
                    </td>
                    <td>
                      <div>
                        <input
                          type="text"
                          className="form-control"
                          defaultValue="$200"
                        />
                      </div>
                    </td>
                    <td>
                      <div>
                         <CommonSelect
                            options={Zero}
                            className="select"
                            defaultValue={Zero[1]}
                          />
                      </div>
                    </td>
                    <td>
                      <div>
                        <input
                          type="text"
                          className="form-control"
                          defaultValue="$900"
                        />
                      </div>
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <Link to="#" className="text-primary add-invoices-3 mb-3">
              <i className="ti ti-plus me-1" />
              Add New
            </Link>
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="fs-14 fw-semibold mb-0">Subtotal</h6>
                  <h6 className="fs-14 fw-semibold mb-0">$0.00</h6>
                </div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="fs-14 fw-semibold mb-0">Discount 2%</h6>
                  <h6 className="fs-14 fw-semibold mb-0">$18</h6>
                </div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="fs-14 fw-semibold mb-0">Extra Discount 0%</h6>
                  <h6 className="fs-14 fw-semibold mb-0">$18</h6>
                </div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="fs-14 fw-semibold mb-0">Tax</h6>
                  <h6 className="fs-14 fw-semibold mb-0">$18</h6>
                </div>
                <div className="d-flex align-items-center justify-content-between">
                  <h6 className="fs-14 fw-semibold mb-0">Total</h6>
                  <h6 className="fs-14 fw-semibold mb-0">$18</h6>
                </div>
              </div>
            </div>
            <div className="col-md-12">
              <div className="mb-3">
                <label className="form-label">Notes</label>
                <textarea className="form-control" rows={3} defaultValue={""} />
              </div>
            </div>
            <div className="col-md-12">
              <div className="mb-3">
                <label className="form-label">Terms &amp; Conditions</label>
                <textarea className="form-control" rows={3} defaultValue={""} />
              </div>
            </div>
          </div>
        </div>
        <div className="d-flex align-items-center justify-content-end">
          <button
            type="button"
            data-bs-dismiss="offcanvas"
            className="btn btn-light me-2"
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
  {/* /Edit Invoices */}
  {/* Add New View */}
  <div className="modal custom-modal fade" id="add_deal" role="dialog">
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Add</h5>
          <button
            className="btn-close custom-btn-close border p-1 me-0 text-dark"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <form>
          <div className="modal-body pb-1">
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input type="text" className="form-control" />
            </div>
          </div>
          <div className="modal-footer">
            <Link to="#" className="btn btn-light" data-bs-dismiss="modal">
              Cancel
            </Link>
            <button type="submit" className="btn btn-danger">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  {/* /Add New View */}
  {/* delete modal */}
  <div className="modal fade" id="delete_invoices">
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

export default ModalInvoice