import { Link } from "react-router"
import Footer from "../../../../components/footer/footer"
import { all_routes } from "../../../../routes/all_routes"
import ImageWithBasePath from "../../../../components/imageWithBasePath"


const InvoicesDetails = () => {
  return (
    <>
  {/* ========================
			Start Page Content
		========================= */}
  <div className="page-wrapper">
    {/* Start Content */}
    <div className="content pb-0">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h4 className="mb-0">Invoices Details</h4>
        <button className="btn btn-primary" type="button">
          <i className="ti ti-download me-1" />
          Download
        </button>
      </div>
      {/* start row*/}
      <div className="row">
        <div className="col-lg-10 mx-auto">
          {/* start page header */}
          <h6 className="mb-3 fw-normal fs-14">
            {" "}
            <Link to={all_routes.InvoiceGrid}>
              <i className="ti ti-arrow-left me-1" />
              Back to Invoice
            </Link>
          </h6>
          {/* end page header */}
          <div className="card">
            <div className="card-body">
              {/* Items */}
              <div className="d-flex align-items-center justify-content-between border-1 border-bottom pb-3 mb-3">
                <div>
                  <ImageWithBasePath
                    src="assets/img/logo.svg"
                    className="invoice-light-logo"
                    width={140}
                    alt=""
                  />
                  <ImageWithBasePath
                    src="assets/img/logo-white.svg"
                    className="dark-logo"
                    width={140}
                    alt=""
                  />
                  <p className="mb-0 mt-2">
                    3099 Kennedy Court Framingham, MA 01702
                  </p>
                </div>
                <div>
                  <p className="mb-1 fw-semibold">
                    Invoice No : <span className="text-primary">#INV0287</span>
                  </p>
                  <p className="mb-1">
                    Invoice No : <span className="text-dark">12/09/2024</span>
                  </p>
                  <p className="mb-0">
                    Due date : <span className="text-dark">12/10/2024</span>
                  </p>
                </div>
              </div>
              {/* start row */}
              <div className="row pb-3 border-1 border-bottom mb-4">
                <div className="col-lg-4">
                  <h5 className="mb-2 fs-14 fw-medium">From</h5>
                  <h6 className="mb-1">Thomas Lawler</h6>
                  <p className="mb-1">2077 Chicago Avenue Orosi, CA 93647</p>
                  <p className="mb-1">
                    {" "}
                    Email :{" "}
                    <span className="text-dark">
                      {" "}
                      tarala2445@gmail.com{" "}
                    </span>{" "}
                  </p>
                  <p className="mb-0">
                    {" "}
                    Phone : <span className="text-dark">
                      {" "}
                      +1 987 654 3210
                    </span>{" "}
                  </p>
                </div>{" "}
                {/* end col */}
                <div className="col-lg-4">
                  <h5 className="mb-2 fs-14 fw-medium">To</h5>
                  <h6 className="mb-1">Sara Inc,.</h6>
                  <p className="mb-1">3103 Trainer Avenue Peoria, IL 61602</p>
                  <p className="mb-1">
                    {" "}
                    Email :{" "}
                    <span className="text-dark">sara_inc34@gmail.com</span>{" "}
                  </p>
                  <p className="mb-0">
                    {" "}
                    Phone : <span className="text-dark">
                      +1 987 471 6589{" "}
                    </span>{" "}
                  </p>
                </div>{" "}
                {/* end col */}
                <div className="col-lg-4">
                  <h5 className="mb-2 fs-14 fw-medium">Payment Status </h5>
                  <span className="badge bg-danger mb-2">Due in 10 Days</span>
                  <ImageWithBasePath
                    src="assets/img/icons/invoice-qr.png"
                    className="d-block"
                    alt=""
                  />
                </div>{" "}
                {/* end col */}
              </div>
              {/* end row */}
              {/* Items */}
              <div className="mb-4">
                <p>
                  Invoice For :{" "}
                  <span className="text-dark">
                    Design &amp; Development of Website
                  </span>{" "}
                </p>
                <div>
                  {/* Table List */}
                  <div className="table-responsive">
                    <table className="table table-nowrap border">
                      <thead className="table-light">
                        <tr>
                          <th>Job Description</th>
                          <th>Qty</th>
                          <th>Price</th>
                          <th>Discount</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Design System</td>
                          <td>1</td>
                          <td>$5000</td>
                          <td>$100</td>
                          <td>$5000</td>
                        </tr>
                        <tr>
                          <td>UX Strategy</td>
                          <td>1</td>
                          <td>$500</td>
                          <td>$100</td>
                          <td>$500</td>
                        </tr>
                        <tr>
                          <td>Brand Guidellines</td>
                          <td>1</td>
                          <td>$5000</td>
                          <td>$100</td>
                          <td>$5000</td>
                        </tr>
                        <tr>
                          <td>Social Media Template</td>
                          <td>1</td>
                          <td>$5000</td>
                          <td>$100</td>
                          <td>$5000</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  {/* /Table List */}
                </div>
              </div>
              {/* etart row */}
              <div className="pb-3 mb-3 border-1 border-bottom ">
                <div className="row align-items-center">
                  <div className="col-lg-6">
                    <div>
                      <div className=" mb-3">
                        <h6 className="mb-1 fs-14 fw-semibold">
                          {" "}
                          Terms and Conditions{" "}
                        </h6>
                        <p className="mb-0">
                          {" "}
                          Please pay within 15 days from the date of invoice,
                          overdue interest © 14% will be charged on delayed
                          payments.
                        </p>
                      </div>
                      <div>
                        <h6 className="mb-1 fs-14 fw-semibold"> Notes </h6>
                        <p className="mb-0">
                          {" "}
                          Please quote invoice number when remitting funds.
                        </p>
                      </div>
                    </div>
                  </div>{" "}
                  {/* end col */}
                  <div className="col-lg-6">
                    <div className="">
                      <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-2">
                        <h6 className="fs-14 fw-medium mb-0">Sub Total</h6>
                        <h6 className="fs-14 fw-medium mb-0">$5500</h6>
                      </div>
                      <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-2">
                        <h6 className="fs-14 fw-medium mb-0">Discount(0%)</h6>
                        <h6 className="fs-14 fw-medium mb-0">$400</h6>
                      </div>
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <h6 className="fs-14 fw-medium mb-0">VAT(5%)</h6>
                        <h6 className="fs-14 fw-medium mb-0">$54</h6>
                      </div>
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <h6 className="mb-0">TotalAMount</h6>
                        <h6 className="mb-0">$5775</h6>
                      </div>
                      <p>
                        Amount in Words : Dollar Five thousand Seven Seventy
                        Five
                      </p>
                    </div>
                  </div>{" "}
                  {/* end col */}
                </div>
              </div>
              {/* end row */}
              {/* Items */}
              <div className="text-end border-bottom mb-3 pb-3">
                <div>
                  <ImageWithBasePath
                    src="assets/img/icons/signature-img.svg"
                    alt=""
                    className="img-fluid "
                  />
                  <h6 className="fs-14 fw-semibold"> Ted M. Davis </h6>
                  <p className="fs-13 fw-normal mb-0">Assistant Manager</p>
                </div>
              </div>
              <div className="text-center border-bottom pb-3 mb-3">
                <div className="text-center mb-3">
                  <ImageWithBasePath
                    src="assets/img/logo.svg"
                    className="invoice-light-logo"
                    width={130}
                    alt=""
                  />
                  <ImageWithBasePath
                    src="assets/img/logo-white.svg"
                    className="dark-logo"
                    width={130}
                    alt=""
                  />
                </div>
                <p className="fs-13 mb-1">
                  Payment Made Via bank transfer / Cheque in the name of Thomas
                  Lawler
                </p>
                <div className="d-flex align-items-center justify-content-center gap-3 flex-wrap">
                  <p className="mb-0">
                    Bank Name : <span className="text-dark">HDFC Bank</span>
                  </p>
                  <p className="mb-0">
                    Account Number :{" "}
                    <span className="text-dark">45366287987</span>
                  </p>
                  <p className="mb-0">
                    IFSC : <span className="text-dark">HDFC0018159</span>
                  </p>
                </div>
              </div>
              <div className="text-center d-flex align-items-center justify-content-end">
                <Link
                  to="#"
                  className="btn btn-md btn-light me-2 d-flex align-items-center"
                >
                  {" "}
                  <i className="ti ti-copy me-1" />
                  Clone Invoice
                </Link>
                <Link
                  to="#"
                  className="btn btn-md btn-primary d-flex align-items-center"
                >
                  {" "}
                  <i className="ti ti-printer me-1" />
                  Print Invoice
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* end row*/}
    </div>
    {/* End Content */}
    {/* Start Footer */}
<Footer/>
    {/* End Footer */}
  </div>
  {/* ========================
			End Page Content
		========================= */}
</>

  )
}

export default InvoicesDetails