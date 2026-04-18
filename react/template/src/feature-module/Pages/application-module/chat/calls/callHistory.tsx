import { Link } from "react-router";
import ImageWithBasePath from "../../../../../components/imageWithBasePath";
import PageHeader from "../../../../../components/page-header/pageHeader";
import Footer from "../../../../../components/footer/footer";
import Modal from "./modal/modal";
import PredefinedDatePicker from "../../../../../components/common-dateRangePicker/PredefinedDatePicker";

const CallHistory = () => {
  return (
    <>
      {/* ========================
			Start Page Content
		========================= */}
      <div className="page-wrapper">
        {/* Start Content */}
        <div className="content content-two">
          <div>
            {/* Page Header */}
            <PageHeader
              title="Call History"
              showModuleTile={true}
              moduleTitle="Application"
              showExport={false}
            />

            {/* End Page Header */}
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
              <PredefinedDatePicker/>
              <div className="dropdown">
                <Link
                  to="#"
                  className="btn fs-14 btn-outline-white bg-white text-dark d-inline-flex align-items-center"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="ti ti-sort-descending-2 me-1 " />
                  Sort By : <span className="ms-1">Newest</span>
                </Link>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link
                      to="#"
                      className="dropdown-item rounded-1"
                    >
                      Newest
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="#"
                      className="dropdown-item rounded-1"
                    >
                      Oldest
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            {/* Table List Start */}
            <div className="table-responsive">
              <table className="table table-nowrap border">
                <thead className="table-light">
                  <tr>
                    <th>
                      <div className="form-check form-check-md">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="select-all"
                        />
                      </div>
                    </th>
                    <th />
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Call Type</th>
                    <th>Duration</th>
                    <th>Date &amp; Time</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="form-check form-check-md">
                        <input className="form-check-input" type="checkbox" />
                      </div>
                    </td>
                    <td>
                      <div className="set-star rating-select">
                        <i className="ti ti-star-filled fs-16" />
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <Link
                          to="#"
                          className="avatar avatar-sm"
                          data-bs-toggle="modal"
                          data-bs-target="#view_details"
                        >
                          <ImageWithBasePath
                            src="assets/img/users/user-01.jpg"
                            className="img-fluid rounded-circle"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <p className="text-dark fw-medium mb-0">
                            <Link
                              to="#"
                              data-bs-toggle="modal"
                              data-bs-target="#view_details"
                            >
                              Anthony Lewis
                            </Link>
                          </p>
                          <span className="fs-12">anthony@example.com</span>
                        </div>
                      </div>
                    </td>
                    <td>(123) 4567 890</td>
                    <td>
                      <div className="d-inline-flex align-items-center">
                        <i className="ti ti-phone-incoming text-success me-2" />
                        Incoming
                      </div>
                    </td>
                    <td>00.25</td>
                    <td>14 Jan 2024, 04:27 AM </td>
                    <td>
                      <div className="d-inline-flex align-items-center">
                        <Link
                          to="#"
                          className="btn btn-icon btn-sm btn-outline-white border-0"
                          data-bs-toggle="modal"
                          data-bs-target="#call_history"
                        >
                          <i className="ti ti-eye" />
                        </Link>
                        <Link
                          to="#"
                          className="btn btn-icon btn-sm btn-outline-white border-0"
                          data-bs-toggle="modal"
                          data-bs-target="#delete_modal"
                        >
                          <i className="ti ti-trash" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="form-check form-check-md">
                        <input className="form-check-input" type="checkbox" />
                      </div>
                    </td>
                    <td>
                      <div className="set-star rating-select">
                        <i className="ti ti-star-filled fs-16" />
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <Link
                          to="#"
                          className="avatar avatar-sm"
                          data-bs-toggle="modal"
                          data-bs-target="#view_details"
                        >
                          <ImageWithBasePath
                            src="assets/img/users/user-09.jpg"
                            className="img-fluid rounded-circle"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <p className="text-dark fw-medium mb-0">
                            <Link
                              to="#"
                              data-bs-toggle="modal"
                              data-bs-target="#view_details"
                            >
                              Brian Villalobos
                            </Link>
                          </p>
                          <span className="fs-12">brian@example.com</span>
                        </div>
                      </div>
                    </td>
                    <td>(179) 7382 829</td>
                    <td>
                      <div className="d-inline-flex align-items-center">
                        <i className="ti ti-phone-outgoing text-success me-2" />
                        Outgoing
                      </div>
                    </td>
                    <td>00.10</td>
                    <td>21 Jan 2024, 03:19 AM</td>
                    <td>
                      <div className="d-inline-flex align-items-center">
                        <Link
                          to="#"
                          className="btn btn-icon btn-sm btn-outline-white border-0"
                          data-bs-toggle="modal"
                          data-bs-target="#call_history"
                        >
                          <i className="ti ti-eye" />
                        </Link>
                        <Link
                          to="#"
                          className="btn btn-icon btn-sm btn-outline-white border-0"
                          data-bs-toggle="modal"
                          data-bs-target="#delete_modal"
                        >
                          <i className="ti ti-trash" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="form-check form-check-md">
                        <input className="form-check-input" type="checkbox" />
                      </div>
                    </td>
                    <td>
                      <div className="set-star rating-select">
                        <i className="ti ti-star-filled fs-16" />
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <Link
                          to="#"
                          className="avatar avatar-sm"
                          data-bs-toggle="modal"
                          data-bs-target="#view_details"
                        >
                          <ImageWithBasePath
                            src="assets/img/users/user-02.jpg"
                            className="img-fluid rounded-circle"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <p className="text-dark fw-medium mb-0">
                            <Link
                              to="#"
                              data-bs-toggle="modal"
                              data-bs-target="#view_details"
                            >
                              Harvey Smith
                            </Link>
                          </p>
                          <span className="fs-12">harvey@example.com</span>
                        </div>
                      </div>
                    </td>
                    <td>(184) 2719 738</td>
                    <td>
                      <div className="d-inline-flex align-items-center">
                        <i className="ti ti-video text-success me-2" />
                        Incoming
                      </div>
                    </td>
                    <td>00.40</td>
                    <td>20 Feb 2024, 12:15 PM</td>
                    <td>
                      <div className="d-inline-flex align-items-center">
                        <Link
                          to="#"
                          className="btn btn-icon btn-sm btn-outline-white border-0"
                          data-bs-toggle="modal"
                          data-bs-target="#call_history"
                        >
                          <i className="ti ti-eye" />
                        </Link>
                        <Link
                          to="#"
                          className="btn btn-icon btn-sm btn-outline-white border-0"
                          data-bs-toggle="modal"
                          data-bs-target="#delete_modal"
                        >
                          <i className="ti ti-trash" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="form-check form-check-md">
                        <input className="form-check-input" type="checkbox" />
                      </div>
                    </td>
                    <td>
                      <div className="set-star rating-select">
                        <i className="ti ti-star-filled fs-16" />
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <Link
                          to="#"
                          className="avatar avatar-sm"
                          data-bs-toggle="modal"
                          data-bs-target="#view_details"
                        >
                          <ImageWithBasePath
                            src="assets/img/users/user-03.jpg"
                            className="img-fluid rounded-circle"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <p className="text-dark fw-medium mb-0">
                            <Link
                              to="#"
                              data-bs-toggle="modal"
                              data-bs-target="#view_details"
                            >
                              peral@example.com
                            </Link>
                          </p>
                          <span className="fs-12">peral@example.com</span>
                        </div>
                      </div>
                    </td>
                    <td>(193) 7839 748</td>
                    <td>
                      <div className="d-inline-flex align-items-center">
                        <i className="ti ti-phone-x text-danger me-2" />
                        Missed Call
                      </div>
                    </td>
                    <td>00.00</td>
                    <td>15 Mar 2024, 12:11 AM</td>
                    <td>
                      <div className="d-inline-flex align-items-center">
                        <Link
                          to="#"
                          className="btn btn-icon btn-sm btn-outline-white border-0"
                          data-bs-toggle="modal"
                          data-bs-target="#call_history"
                        >
                          <i className="ti ti-eye" />
                        </Link>
                        <Link
                          to="#"
                          className="btn btn-icon btn-sm btn-outline-white border-0"
                          data-bs-toggle="modal"
                          data-bs-target="#delete_modal"
                        >
                          <i className="ti ti-trash" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="form-check form-check-md">
                        <input className="form-check-input" type="checkbox" />
                      </div>
                    </td>
                    <td>
                      <div className="set-star rating-select">
                        <i className="ti ti-star-filled fs-16" />
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <Link
                          to="#"
                          className="avatar avatar-sm"
                          data-bs-toggle="modal"
                          data-bs-target="#view_details"
                        >
                          <ImageWithBasePath
                            src="assets/img/users/user-10.jpg"
                            className="img-fluid rounded-circle"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <p className="text-dark fw-medium mb-0">
                            <Link
                              to="#"
                              data-bs-toggle="modal"
                              data-bs-target="#view_details"
                            >
                              Doglas Martini
                            </Link>
                          </p>
                          <span className="fs-12">martniwr@example.com</span>
                        </div>
                      </div>
                    </td>
                    <td>(183) 9302 890</td>
                    <td>
                      <div className="d-inline-flex align-items-center">
                        <i className="ti ti-video text-success me-2" />
                        Outgoing
                      </div>
                    </td>
                    <td>00.35</td>
                    <td>12 Apr 2024, 05:48 PM</td>
                    <td>
                      <div className="d-inline-flex align-items-center">
                        <Link
                          to="#"
                          className="btn btn-icon btn-sm btn-outline-white border-0"
                          data-bs-toggle="modal"
                          data-bs-target="#call_history"
                        >
                          <i className="ti ti-eye" />
                        </Link>
                        <Link
                          to="#"
                          className="btn btn-icon btn-sm btn-outline-white border-0"
                          data-bs-toggle="modal"
                          data-bs-target="#delete_modal"
                        >
                          <i className="ti ti-trash" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="form-check form-check-md">
                        <input className="form-check-input" type="checkbox" />
                      </div>
                    </td>
                    <td>
                      <div className="set-star rating-select">
                        <i className="ti ti-star-filled fs-16" />
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <Link
                          to="#"
                          className="avatar avatar-sm"
                          data-bs-toggle="modal"
                          data-bs-target="#view_details"
                        >
                          <ImageWithBasePath
                            src="assets/img/users/user-04.jpg"
                            className="img-fluid rounded-circle"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <p className="text-dark fw-medium mb-0">
                            <Link
                              to="#"
                              data-bs-toggle="modal"
                              data-bs-target="#view_details"
                            >
                              Linda Ray
                            </Link>
                          </p>
                          <span className="fs-12">ray456@example.com</span>
                        </div>
                      </div>
                    </td>
                    <td>(120) 3728 039</td>
                    <td>
                      <div className="d-inline-flex align-items-center">
                        <i className="ti ti-phone-incoming text-success me-2" />
                        Incomiing
                      </div>
                    </td>
                    <td>01.40</td>
                    <td>20 Apr 2024, 06:11 PM</td>
                    <td>
                      <div className="d-inline-flex align-items-center">
                        <Link
                          to="#"
                          className="btn btn-icon btn-sm btn-outline-white border-0"
                          data-bs-toggle="modal"
                          data-bs-target="#call_history"
                        >
                          <i className="ti ti-eye" />
                        </Link>
                        <Link
                          to="#"
                          className="btn btn-icon btn-sm btn-outline-white border-0"
                          data-bs-toggle="modal"
                          data-bs-target="#delete_modal"
                        >
                          <i className="ti ti-trash" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="form-check form-check-md">
                        <input className="form-check-input" type="checkbox" />
                      </div>
                    </td>
                    <td>
                      <div className="set-star rating-select">
                        <i className="ti ti-star-filled fs-16" />
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <Link
                          to="#"
                          className="avatar avatar-sm"
                          data-bs-toggle="modal"
                          data-bs-target="#view_details"
                        >
                          <ImageWithBasePath
                            src="assets/img/users/user-05.jpg"
                            className="img-fluid rounded-circle"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <p className="text-dark fw-medium mb-0">
                            <Link
                              to="#"
                              data-bs-toggle="modal"
                              data-bs-target="#view_details"
                            >
                              Elliot Murray
                            </Link>
                          </p>
                          <span className="fs-12">murray@example.com</span>
                        </div>
                      </div>
                    </td>
                    <td>(102) 8480 832</td>
                    <td>
                      <div className="d-inline-flex align-items-center">
                        <i className="ti ti-video text-danger me-2" />
                        Missed call
                      </div>
                    </td>
                    <td>00.00</td>
                    <td>06 Jul 2024, 07:15 PM</td>
                    <td>
                      <div className="d-inline-flex align-items-center">
                        <Link
                          to="#"
                          className="btn btn-icon btn-sm btn-outline-white border-0"
                          data-bs-toggle="modal"
                          data-bs-target="#call_history"
                        >
                          <i className="ti ti-eye" />
                        </Link>
                        <Link
                          to="#"
                          className="btn btn-icon btn-sm btn-outline-white border-0"
                          data-bs-toggle="modal"
                          data-bs-target="#delete_modal"
                        >
                          <i className="ti ti-trash" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="form-check form-check-md">
                        <input className="form-check-input" type="checkbox" />
                      </div>
                    </td>
                    <td>
                      <div className="set-star rating-select">
                        <i className="ti ti-star-filled fs-16" />
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <Link
                          to="#"
                          className="avatar avatar-sm"
                          data-bs-toggle="modal"
                          data-bs-target="#view_details"
                        >
                          <ImageWithBasePath
                            src="assets/img/users/user-06.jpg"
                            className="img-fluid rounded-circle"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <p className="text-dark fw-medium mb-0">
                            <Link
                              to="#"
                              data-bs-toggle="modal"
                              data-bs-target="#view_details"
                            >
                              Rebecca Smtih
                            </Link>
                          </p>
                          <span className="fs-12">smtih@example.com</span>
                        </div>
                      </div>
                    </td>
                    <td>(162) 8920 713</td>
                    <td>
                      <div className="d-inline-flex align-items-center">
                        <i className="ti ti-phone-outgoing text-success me-2" />
                        Outgoing
                      </div>
                    </td>
                    <td>00.45</td>
                    <td>02 Sep 2024, 09:21 PM</td>
                    <td>
                      <div className="d-inline-flex align-items-center">
                        <Link
                          to="#"
                          className="btn btn-icon btn-sm btn-outline-white border-0"
                          data-bs-toggle="modal"
                          data-bs-target="#call_history"
                        >
                          <i className="ti ti-eye" />
                        </Link>
                        <Link
                          to="#"
                          className="btn btn-icon btn-sm btn-outline-white border-0"
                          data-bs-toggle="modal"
                          data-bs-target="#delete_modal"
                        >
                          <i className="ti ti-trash" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="form-check form-check-md">
                        <input className="form-check-input" type="checkbox" />
                      </div>
                    </td>
                    <td>
                      <div className="set-star rating-select">
                        <i className="ti ti-star-filled fs-16" />
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <Link
                          to="#"
                          className="avatar avatar-sm"
                          data-bs-toggle="modal"
                          data-bs-target="#view_details"
                        >
                          <ImageWithBasePath
                            src="assets/img/users/user-07.jpg"
                            className="img-fluid rounded-circle"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <p className="text-dark fw-medium mb-0">
                            <Link
                              to="#"
                              data-bs-toggle="modal"
                              data-bs-target="#view_details"
                            >
                              Connie Waters
                            </Link>
                          </p>
                          <span className="fs-12">connie@example.com</span>
                        </div>
                      </div>
                    </td>
                    <td>(189) 0920 723</td>
                    <td>
                      <div className="d-inline-flex align-items-center">
                        <i className="ti ti-phone-incoming text-success me-2" />
                        Incoming
                      </div>
                    </td>
                    <td>00.50</td>
                    <td>15 Nov 2024, 12:44 PM</td>
                    <td>
                      <div className="d-inline-flex align-items-center">
                        <Link
                          to="#"
                          className="btn btn-icon btn-sm btn-outline-white border-0"
                          data-bs-toggle="modal"
                          data-bs-target="#call_history"
                        >
                          <i className="ti ti-eye" />
                        </Link>
                        <Link
                          to="#"
                          className="btn btn-icon btn-sm btn-outline-white border-0"
                          data-bs-toggle="modal"
                          data-bs-target="#delete_modal"
                        >
                          <i className="ti ti-trash" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="form-check form-check-md">
                        <input className="form-check-input" type="checkbox" />
                      </div>
                    </td>
                    <td>
                      <div className="set-star rating-select">
                        <i className="ti ti-star-filled fs-16" />
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <Link
                          to="#"
                          className="avatar avatar-sm"
                          data-bs-toggle="modal"
                          data-bs-target="#view_details"
                        >
                          <ImageWithBasePath
                            src="assets/img/users/user-08.jpg"
                            className="img-fluid rounded-circle"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <p className="text-dark fw-medium mb-0">
                            <Link
                              to="#"
                              data-bs-toggle="modal"
                              data-bs-target="#view_details"
                            >
                              Lori Broaddus
                            </Link>
                          </p>
                          <span className="fs-12">broaddus@example.com</span>
                        </div>
                      </div>
                    </td>
                    <td>(168) 8392 823</td>
                    <td>
                      <div className="d-inline-flex align-items-center">
                        <i className="ti ti-phone-x text-danger me-2" />
                        Missed call
                      </div>
                    </td>
                    <td>00.00</td>
                    <td>10 Dec 2024, 11:23 PM</td>
                    <td>
                      <div className="d-inline-flex align-items-center">
                        <Link
                          to="#"
                          className="btn btn-icon btn-sm btn-outline-white border-0"
                          data-bs-toggle="modal"
                          data-bs-target="#call_history"
                        >
                          <i className="ti ti-eye" />
                        </Link>
                        <Link
                          to="#"
                          className="btn btn-icon btn-sm btn-outline-white border-0"
                          data-bs-toggle="modal"
                          data-bs-target="#delete_modal"
                        >
                          <i className="ti ti-trash" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* Table List End */}
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
      <Modal />
    </>
  );
};

export default CallHistory;
