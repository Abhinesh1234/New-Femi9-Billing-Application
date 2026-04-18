import { Link } from "react-router";
import Footer from "../../../../components/footer/footer";
import CollapseIcons from "../../../../components/collapse-icons/collapseIcons";
import ImageWithBasePath from "../../../../components/imageWithBasePath";
import DealsChart from "./chart/dealsChart";
import WonChart from "../../dashboard/deals-dashboard/chats/wonChart";
import LastChart2 from "./chart/lastChart2";
import LeadsChart from "./chart/leadsChart";
import LastChart from "../../dashboard/deals-dashboard/chats/lastChart";
import { all_routes } from "../../../../routes/all_routes";

const Analytics = () => {
  return (
    <>
      {/* ========================
			Start Page Content
		========================= */}
      <div className="page-wrapper">
        {/* Start Content */}
        <div className="content pb-0">
          {/* Page Header */}
          <div className="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
            <div>
              <h4 className="mb-0">Analytics</h4>
            </div>
            <div className="gap-2 d-flex align-items-center flex-wrap">
              <CollapseIcons />
            </div>
          </div>
          {/* End Page Header */}
          {/* start row */}
          <div className="row">
            <div className="col-xl-6">
              <div className="card">
                <div className="card-header">
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <h6 className="mb-0">Recently Created Contacts</h6>
                    <div className="d-flex align-items-center flex-wrap gap-2">
                      <div className="dropdown">
                        <Link
                          className="dropdown-toggle btn btn-outline-white shadow"
                          data-bs-toggle="dropdown"
                          to="#"
                        >
                          Last 30 Days
                        </Link>
                        <div className="dropdown-menu dropdown-menu-end">
                          <Link to="#" className="dropdown-item">
                            Last 30 Days
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Last 3 Months
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Last 6 Months
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table
                      className="table dataTable table-nowrap mb-0"
                      id="analytic-contact"
                    >
                      <thead className="table-light">
                        <tr>
                          <th>Contact</th>
                          <th>Phone</th>
                          <th>Created At</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="odd">
                          <td>
                            <div className="d-flex align-items-center">
                              <Link to={all_routes.contactDetails} className="avatar">
                                <ImageWithBasePath
                                  className="img-fluid rounded-circle"
                                  src="assets/img/profiles/avatar-09.jpg"
                                  alt="User Image"
                                />
                              </Link>
                              <div className="ms-2">
                                <h6 className="fs-14 fw-medium mb-1">
                                  <Link
                                    to={all_routes.contactDetails}
                                    className="d-flex flex-column fw-medium"
                                  >
                                    Elizabeth Morgan
                                  </Link>
                                </h6>
                                <span className="text-body fs-13 d-inline-block">
                                  Product Manager{" "}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>+1 87545 54503</td>
                          <td>10 May 2025</td>
                        </tr>
                        <tr className="even">
                          <td>
                            <div className="d-flex align-items-center">
                              <Link to={all_routes.contactDetails} className="avatar">
                                <ImageWithBasePath
                                  className="img-fluid rounded-circle"
                                  src="assets/img/profiles/avatar-22.jpg"
                                  alt="User Image"
                                />
                              </Link>
                              <div className="ms-2">
                                <h6 className="fs-14 fw-medium mb-1">
                                  <Link
                                    to={all_routes.contactDetails}
                                    className="d-flex flex-column fw-medium"
                                  >
                                    Katherine Brooks
                                  </Link>
                                </h6>
                                <span className="text-body fs-13 d-inline-block">
                                  Installer{" "}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>+1 98975 17485</td>
                          <td>02 May 2025</td>
                        </tr>
                        <tr className="odd">
                          <td>
                            <div className="d-flex align-items-center">
                              <Link to={all_routes.contactDetails} className="avatar">
                                <ImageWithBasePath
                                  className="img-fluid rounded-circle"
                                  src="assets/img/profiles/avatar-08.jpg"
                                  alt="User Image"
                                />
                              </Link>
                              <div className="ms-2">
                                <h6 className="fs-14 fw-medium mb-1">
                                  <Link
                                    to={all_routes.contactDetails}
                                    className="d-flex flex-column fw-medium"
                                  >
                                    Samantha Reed
                                  </Link>
                                </h6>
                                <span className="text-body fs-13 d-inline-block">
                                  Human Resources{" "}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>+1 54655 25455</td>
                          <td>28 Apr 2025</td>
                        </tr>
                        <tr className="even">
                          <td>
                            <div className="d-flex align-items-center">
                              <Link to={all_routes.contactDetails} className="avatar">
                                <ImageWithBasePath
                                  className="img-fluid rounded-circle"
                                  src="assets/img/profiles/avatar-24.jpg"
                                  alt="User Image"
                                />
                              </Link>
                              <div className="ms-2">
                                <h6 className="fs-14 fw-medium mb-1">
                                  <Link
                                    to={all_routes.contactDetails}
                                    className="d-flex flex-column fw-medium"
                                  >
                                    William Anderson
                                  </Link>
                                </h6>
                                <span className="text-body fs-13 d-inline-block">
                                  Data Analytics{" "}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>+1 45447 58787</td>
                          <td>16 Apr 2025</td>
                        </tr>
                        <tr className="odd">
                          <td>
                            <div className="d-flex align-items-center">
                              <Link to={all_routes.contactDetails} className="avatar">
                                <ImageWithBasePath
                                  className="img-fluid rounded-circle"
                                  src="assets/img/profiles/avatar-23.jpg"
                                  alt="User Image"
                                />
                              </Link>
                              <div className="ms-2">
                                <h6 className="fs-14 fw-medium mb-1">
                                  <Link
                                    to={all_routes.contactDetails}
                                    className="d-flex flex-column fw-medium"
                                  >
                                    Jonathan Mitchell
                                  </Link>
                                </h6>
                                <span className="text-body fs-13 d-inline-block">
                                  Facility Manager{" "}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>+1 12454 27845</td>
                          <td>05 Apr 2025</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>{" "}
                {/* end card body */}
              </div>{" "}
              {/* end card */}
              <div className="card">
                <div className="card-header">
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <h6 className="mb-0">Won Deals Stage</h6>
                    <div className="d-flex align-items-center flex-wrap gap-2">
                      <div className="dropdown me-2">
                        <Link
                          className="dropdown-toggle btn btn-outline-white shadow"
                          data-bs-toggle="dropdown"
                          to="#"
                        >
                          Marketing Pipeline
                        </Link>
                        <div className="dropdown-menu dropdown-menu-end">
                          <Link to="#" className="dropdown-item">
                            Marketing Pipeline
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Sales Pipeline
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Email
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Chats
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Operational
                          </Link>
                        </div>
                      </div>
                      <div className="dropdown">
                        <Link
                          className="dropdown-toggle btn btn-outline-white shadow"
                          data-bs-toggle="dropdown"
                          to="#"
                        >
                          Last 30 Days
                        </Link>
                        <div className="dropdown-menu dropdown-menu-end">
                          <Link to="#" className="dropdown-item">
                            Last 30 Days
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Last 3 Months
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Last 6 Months
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-body py-0">
                  <div id="won-chart">
                    <WonChart />
                  </div>
                </div>{" "}
                {/* end card body */}
              </div>{" "}
              {/* end card */}
              <div className="card">
                <div className="card-header">
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <h6 className="mb-0">Recently Created Deals</h6>
                    <div className="d-flex align-items-center flex-wrap gap-2">
                      <div className="dropdown">
                        <Link
                          className="dropdown-toggle btn btn-outline-white shadow"
                          data-bs-toggle="dropdown"
                          to="#"
                        >
                          Last 30 Days
                        </Link>
                        <div className="dropdown-menu dropdown-menu-end">
                          <Link to="#" className="dropdown-item">
                            Last 30 Days
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Last 3 Months
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Last 6 Months
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table
                      className="table table-nowrap custom-table mb-0"
                      id="analytic-deal"
                    >
                      <thead className="table-light">
                        <tr>
                          <th>Deal Name</th>
                          <th>Stage</th>
                          <th>Deal Value</th>
                          <th>Probability</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="odd">
                          <td>
                            <Link to={all_routes.dealsDetails}> Collins</Link>
                          </td>
                          <td>Conversation</td>
                          <td>$04,51,000</td>
                          <td>85%</td>
                          <td>
                            <span className="badge badge-pill badge-status bg-info">
                              {" "}
                              Open
                            </span>
                          </td>
                        </tr>
                        <tr className="even">
                          <td>
                            <Link to={all_routes.dealsDetails}> Konopelski</Link>
                          </td>
                          <td>Pipeline</td>
                          <td>$04,14,800</td>
                          <td>15%</td>
                          <td>
                            <span className="badge badge-pill badge-status bg-danger">
                              {" "}
                              Lost
                            </span>
                          </td>
                        </tr>
                        <tr className="odd">
                          <td>
                            <Link to={all_routes.dealsDetails}> Adams</Link>
                          </td>
                          <td>Won</td>
                          <td>$04,14,800</td>
                          <td>95%</td>
                          <td>
                            <span className="badge badge-pill badge-status bg-success">
                              {" "}
                              Won
                            </span>
                          </td>
                        </tr>
                        <tr className="even">
                          <td>
                            <Link to={all_routes.dealsDetails}> Schumm</Link>
                          </td>
                          <td>Lost</td>
                          <td>$9,14,400</td>
                          <td>47%</td>
                          <td>
                            <span className="badge badge-pill badge-status bg-success">
                              {" "}
                              Won
                            </span>
                          </td>
                        </tr>
                        <tr className="odd">
                          <td>
                            <Link to={all_routes.dealsDetails}> Wisozk</Link>
                          </td>
                          <td>Follow Up</td>
                          <td>$11,14,400</td>
                          <td>98%</td>
                          <td>
                            <span className="badge badge-pill badge-status bg-success">
                              {" "}
                              Won
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>{" "}
                {/* end card body */}
              </div>{" "}
              {/* end card */}
              <div className="card">
                <div className="card-header">
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <h6 className="mb-0">Lost Leads Stage</h6>
                    <div className="d-flex align-items-center flex-wrap gap-2">
                      <div className="dropdown me-2">
                        <Link
                          className="dropdown-toggle btn btn-outline-white shadow"
                          data-bs-toggle="dropdown"
                          to="#"
                        >
                          Marketing Pipeline
                        </Link>
                        <div className="dropdown-menu dropdown-menu-end">
                          <Link to="#" className="dropdown-item">
                            Marketing Pipeline
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Sales Pipeline
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Email
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Chats
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Operational
                          </Link>
                        </div>
                      </div>
                      <div className="dropdown">
                        <Link
                          className="dropdown-toggle btn btn-outline-white shadow"
                          data-bs-toggle="dropdown"
                          to="#"
                        >
                          Last 30 Days
                        </Link>
                        <div className="dropdown-menu dropdown-menu-end">
                          <Link to="#" className="dropdown-item">
                            Last 30 Days
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Last 3 Months
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Last 6 Months
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-body py-0">
                  <div id="last-chart-2">
                    <LastChart2 />
                  </div>
                </div>{" "}
                {/* end card body */}
              </div>{" "}
              {/* end card */}
              <div className="card ">
                <div className="card-header">
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <h6 className="mb-0">Leads By Stage</h6>
                    <div className="d-flex align-items-center flex-wrap gap-2">
                      <div className="dropdown me-2">
                        <Link
                          className="dropdown-toggle btn btn-outline-white shadow"
                          data-bs-toggle="dropdown"
                          to="#"
                        >
                          Sales Pipeline
                        </Link>
                        <div className="dropdown-menu dropdown-menu-end">
                          <Link to="#" className="dropdown-item">
                            Marketing Pipeline
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Sales Pipeline
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Email
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Chats
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Operational
                          </Link>
                        </div>
                      </div>
                      <div className="dropdown">
                        <Link
                          className="dropdown-toggle btn btn-outline-white shadow"
                          data-bs-toggle="dropdown"
                          to="#"
                        >
                          Last 30 Days
                        </Link>
                        <div className="dropdown-menu dropdown-menu-end">
                          <Link to="#" className="dropdown-item">
                            Last 30 Days
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Last 3 Months
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Last 6 Months
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-body py-0">
                  <div id="leads-chart">
                    <LeadsChart />
                  </div>
                </div>{" "}
                {/* end card body */}
              </div>{" "}
              {/* end card */}
              <div className="card">
                <div className="card-header">
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <h6 className="mb-0">Recently Added Companies</h6>
                    <div className="d-flex align-items-center flex-wrap gap-2">
                      <div className="dropdown me-2">
                        <Link
                          className="dropdown-toggle btn btn-outline-white shadow"
                          data-bs-toggle="dropdown"
                          to="#"
                        >
                          Last 30 Days
                        </Link>
                        <div className="dropdown-menu dropdown-menu-end">
                          <Link to="#" className="dropdown-item">
                            Last 30 Days
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Last 3 Months
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Last 6 Months
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table
                      className="table table-nowrap mb-0"
                      id="analytic-company"
                    >
                      <thead className="table-light">
                        <tr>
                          <th>Company Name</th>
                          <th>Phone</th>
                          <th>Created at</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="odd">
                          <td>
                            <div className="d-flex align-items-center">
                              <Link
                                to={all_routes.companyDetails}
                                className="avatar avatar-rounded border"
                              >
                                <ImageWithBasePath
                                  className="w-auto h-auto"
                                  src="assets/img/icons/company-icon-01.svg"
                                  alt="User Image"
                                />
                              </Link>
                              <div className="ms-2">
                                <h6 className="fs-14 fw-medium mb-0">
                                  <Link to={all_routes.companyDetails}>
                                    NovaWaveLLC
                                  </Link>
                                </h6>
                              </div>
                            </div>
                          </td>
                          <td>+1 87545 54503</td>
                          <td>10 May 2025</td>
                        </tr>
                        <tr className="even">
                          <td>
                            <div className="d-flex align-items-center">
                              <Link
                                to={all_routes.companyDetails}
                                className="avatar avatar-rounded border"
                              >
                                <ImageWithBasePath
                                  className="w-auto h-auto"
                                  src="assets/img/icons/company-icon-02.svg"
                                  alt="User Image"
                                />
                              </Link>
                              <div className="ms-2">
                                <h6 className="fs-14 fw-medium mb-0">
                                  <Link to={all_routes.companyDetails}>
                                    BlueSky Industries
                                  </Link>
                                </h6>
                              </div>
                            </div>
                          </td>
                          <td>+1 98975 17485</td>
                          <td>02 May 2025</td>
                        </tr>
                        <tr className="odd">
                          <td>
                            <div className="d-flex align-items-center">
                              <Link
                                to={all_routes.companyDetails}
                                className="avatar avatar-rounded border"
                              >
                                <ImageWithBasePath
                                  className="w-auto h-auto"
                                  src="assets/img/icons/company-icon-03.svg"
                                  alt="User Image"
                                />
                              </Link>
                              <div className="ms-2">
                                <h6 className="fs-14 fw-medium mb-0">
                                  <Link to={all_routes.companyDetails}>
                                    Silver Hawk
                                  </Link>
                                </h6>
                              </div>
                            </div>
                          </td>
                          <td>+1 54655 25455</td>
                          <td>28 Apr 2025</td>
                        </tr>
                        <tr className="even">
                          <td>
                            <div className="d-flex align-items-center">
                              <Link
                                to={all_routes.companyDetails}
                                className="avatar avatar-rounded border"
                              >
                                <ImageWithBasePath
                                  className="w-auto h-auto"
                                  src="assets/img/icons/company-icon-04.svg"
                                  alt="User Image"
                                />
                              </Link>
                              <div className="ms-2">
                                <h6 className="fs-14 fw-medium mb-0">
                                  <Link to={all_routes.companyDetails}>
                                    Summit Peak
                                  </Link>
                                </h6>
                              </div>
                            </div>
                          </td>
                          <td>+1 45447 58787</td>
                          <td>16 Apr 2025</td>
                        </tr>
                        <tr className="odd">
                          <td>
                            <div className="d-flex align-items-center">
                              <Link
                                to={all_routes.companyDetails}
                                className="avatar avatar-rounded border"
                              >
                                <ImageWithBasePath
                                  className="w-auto h-auto"
                                  src="assets/img/icons/company-icon-05.svg"
                                  alt="User Image"
                                />
                              </Link>
                              <div className="ms-2">
                                <h6 className="fs-14 fw-medium mb-0">
                                  <Link to={all_routes.companyDetails}>
                                    RiverStone Ltd
                                  </Link>
                                </h6>
                              </div>
                            </div>
                          </td>
                          <td>+1 12454 27845</td>
                          <td>05 Apr 2025</td>
                        </tr>
                        <tr className="even">
                          <td>
                            <div className="d-flex align-items-center">
                              <Link
                                to={all_routes.companyDetails}
                                className="avatar avatar-rounded border"
                              >
                                <ImageWithBasePath
                                  className="w-auto h-auto"
                                  src="assets/img/icons/company-icon-06.svg"
                                  alt="User Image"
                                />
                              </Link>
                              <div className="ms-2">
                                <h6 className="fs-14 fw-medium mb-0">
                                  <Link to={all_routes.companyDetails}>
                                    Redwood Inc
                                  </Link>
                                </h6>
                              </div>
                            </div>
                          </td>
                          <td>+1 46789 27845</td>
                          <td>15 Nov 2025</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>{" "}
                {/* end card body */}
              </div>{" "}
              {/* end card */}
            </div>{" "}
            {/* end col */}
            <div className="col-xl-6">
              <div className="card">
                <div className="card-header">
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <h6 className="mb-0">Deals By Stage</h6>
                    <div className="d-flex align-items-center flex-wrap gap-2">
                      <div className="dropdown me-2">
                        <Link
                          className="dropdown-toggle btn btn-outline-white shadow"
                          data-bs-toggle="dropdown"
                          to="#"
                        >
                          Sales Pipeline
                        </Link>
                        <div className="dropdown-menu dropdown-menu-end">
                          <Link to="#" className="dropdown-item">
                            Marketing Pipeline
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Sales Pipeline
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Email
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Chats
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Operational
                          </Link>
                        </div>
                      </div>
                      <div className="dropdown">
                        <Link
                          className="dropdown-toggle btn btn-outline-white shadow"
                          data-bs-toggle="dropdown"
                          to="#"
                        >
                          Last 30 Days
                        </Link>
                        <div className="dropdown-menu dropdown-menu-end">
                          <Link to="#" className="dropdown-item">
                            Last 30 Days
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Last 3 Months
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Last 6 Months
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-body py-0">
                  <div id="deals-chart">
                    <DealsChart />
                  </div>
                </div>{" "}
                {/* end card body */}
              </div>{" "}
              {/* end card */}
              <div className="card">
                <div className="card-header">
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <h6 className="mb-0">Activities</h6>
                    <div className="d-flex align-items-center flex-wrap gap-2">
                      <div className="dropdown me-2">
                        <Link
                          className="dropdown-toggle btn btn-outline-white shadow"
                          data-bs-toggle="dropdown"
                          to="#"
                        >
                          Last 30 Days
                        </Link>
                        <div className="dropdown-menu dropdown-menu-end">
                          <Link to="#" className="dropdown-item">
                            Last 30 Days
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Last 3 Months
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Last 6 Months
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="card">
                    <div className="card-body p-3">
                      {/* start row */}
                      <div className="row align-items-center row-gap-2">
                        <div className="col-sm-4">
                          <div className="activity-name">
                            <h6 className="fs-14 fw-medium mb-1">
                              We scheduled a meeting
                            </h6>
                            <p className="fs-13 mb-1">25 sep 2025, 12:12 PM</p>
                            <span className="badge bg-info">Meeting</span>
                          </div>
                        </div>{" "}
                        {/* end col */}
                        <div className="col-sm-4">
                          <div className="d-flex align-items-center">
                            <span className="avatar flex-shrink-0">
                              <ImageWithBasePath
                                src="assets/img/profiles/avatar-12.jpg"
                                className="rounded-circle"
                                alt=""
                              />
                            </span>
                            <div className="ms-2">
                              <h6 className="fs-14 fw-medium mb-1">
                                Elizabeth Morgan
                              </h6>
                              <p className="fs-13 mb-0">Product Manager</p>
                            </div>
                          </div>
                        </div>{" "}
                        {/* end col */}
                        <div className="col-sm-4">
                          <div className="text-sm-end">
                            <div className="dropdown">
                              <Link
                                className="dropdown-toggle btn btn-sm btn-outline-light shadow"
                                data-bs-toggle="dropdown"
                                to="#"
                              >
                                Inprogress
                              </Link>
                              <div className="dropdown-menu dropdown-menu-end">
                                <Link to="#" className="dropdown-item">
                                  Completed
                                </Link>
                                <Link to="#" className="dropdown-item">
                                  Inprogress
                                </Link>
                                <Link to="#" className="dropdown-item">
                                  Cancelled
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>{" "}
                        {/* end col */}
                      </div>
                      {/* end row */}
                    </div>{" "}
                    {/* end card body */}
                  </div>{" "}
                  {/* end card */}
                  <div className="card">
                    <div className="card-body p-3">
                      {/* start row */}
                      <div className="row align-items-center row-gap-2">
                        <div className="col-sm-4">
                          <div className="activity-name">
                            <h6 className="fs-14 fw-medium mb-1">
                              We scheduled a meeting
                            </h6>
                            <p className="fs-13 mb-1">28 sep 2025, 12:12 PM</p>
                            <span className="badge bg-secondary">Email</span>
                          </div>
                        </div>{" "}
                        {/* end col */}
                        <div className="col-sm-4">
                          <div className="d-flex align-items-center">
                            <span className="avatar flex-shrink-0">
                              <ImageWithBasePath
                                src="assets/img/profiles/avatar-13.jpg"
                                className="rounded-circle"
                                alt=""
                              />
                            </span>
                            <div className="ms-2">
                              <h6 className="fs-14 fw-medium mb-1">
                                Katherine Brooks
                              </h6>
                              <p className="fs-13 mb-0">Installer</p>
                            </div>
                          </div>
                        </div>{" "}
                        {/* end col */}
                        <div className="col-sm-4">
                          <div className="text-sm-end">
                            <div className="dropdown">
                              <Link
                                className="dropdown-toggle btn btn-sm btn-outline-light shadow"
                                data-bs-toggle="dropdown"
                                to="#"
                              >
                                Inprogress
                              </Link>
                              <div className="dropdown-menu dropdown-menu-end">
                                <Link to="#" className="dropdown-item">
                                  Completed
                                </Link>
                                <Link to="#" className="dropdown-item">
                                  Inprogress
                                </Link>
                                <Link to="#" className="dropdown-item">
                                  Cancelled
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>{" "}
                        {/* end col */}
                      </div>
                      {/* end row */}
                    </div>{" "}
                    {/* end card body */}
                  </div>{" "}
                  {/* end card */}
                  <div className="card">
                    <div className="card-body p-3">
                      {/* start row */}
                      <div className="row align-items-center row-gap-2">
                        <div className="col-sm-4">
                          <div className="activity-name">
                            <h6 className="fs-14 fw-medium mb-1">
                              We scheduled a meeting
                            </h6>
                            <p className="fs-13 mb-1">25 jun 2025, 12:12 PM</p>
                            <span className="badge bg-cyan">Task</span>
                          </div>
                        </div>{" "}
                        {/* end col */}
                        <div className="col-sm-4">
                          <div className="d-flex align-items-center">
                            <span className="avatar flex-shrink-0">
                              <ImageWithBasePath
                                src="assets/img/profiles/avatar-18.jpg"
                                className="rounded-circle"
                                alt=""
                              />
                            </span>
                            <div className="ms-2">
                              <h6 className="fs-14 fw-medium mb-1">
                                Samantha Reed
                              </h6>
                              <p className="fs-13 mb-0">Human Resources</p>
                            </div>
                          </div>
                        </div>{" "}
                        {/* end col */}
                        <div className="col-sm-4">
                          <div className="text-sm-end">
                            <div className="dropdown">
                              <Link
                                className="dropdown-toggle btn btn-sm btn-outline-light shadow"
                                data-bs-toggle="dropdown"
                                to="#"
                              >
                                Inprogress
                              </Link>
                              <div className="dropdown-menu dropdown-menu-end">
                                <Link to="#" className="dropdown-item">
                                  Completed
                                </Link>
                                <Link to="#" className="dropdown-item">
                                  Inprogress
                                </Link>
                                <Link to="#" className="dropdown-item">
                                  Cancelled
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>{" "}
                        {/* end col */}
                      </div>
                      {/* end row */}
                    </div>{" "}
                    {/* end card body */}
                  </div>{" "}
                  {/* end card */}
                  <div className="card mb-0">
                    <div className="card-body p-3">
                      {/* start row */}
                      <div className="row align-items-center row-gap-2">
                        <div className="col-sm-4">
                          <div className="activity-name">
                            <h6 className="fs-14 fw-medium mb-1">
                              We scheduled a meeting
                            </h6>
                            <p className="fs-13 mb-1">20 sep 2025, 12:00 PM</p>
                            <span className="badge bg-teal">Calls</span>
                          </div>
                        </div>{" "}
                        {/* end col */}
                        <div className="col-sm-4">
                          <div className="d-flex align-items-center">
                            <span className="avatar flex-shrink-0">
                              <ImageWithBasePath
                                src="assets/img/profiles/avatar-20.jpg"
                                className="rounded-circle"
                                alt=""
                              />
                            </span>
                            <div className="ms-2">
                              <h6 className="fs-14 fw-medium mb-1">
                                William Anderson
                              </h6>
                              <p className="fs-13 mb-0">Data Analytics</p>
                            </div>
                          </div>
                        </div>{" "}
                        {/* end col */}
                        <div className="col-sm-4">
                          <div className="text-sm-end">
                            <div className="dropdown">
                              <Link
                                className="dropdown-toggle btn btn-sm btn-outline-light shadow"
                                data-bs-toggle="dropdown"
                                to="#"
                              >
                                Inprogress
                              </Link>
                              <div className="dropdown-menu dropdown-menu-end">
                                <Link to="#" className="dropdown-item">
                                  Completed
                                </Link>
                                <Link to="#" className="dropdown-item">
                                  Inprogress
                                </Link>
                                <Link to="#" className="dropdown-item">
                                  Cancelled
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>{" "}
                        {/* end col */}
                      </div>
                      {/* end row */}
                    </div>
                  </div>
                </div>{" "}
                {/* end card body */}
              </div>{" "}
              {/* end card */}
              <div className="card">
                <div className="card-header">
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <h6 className="mb-0">Lost Leads Stage</h6>
                    <div className="d-flex align-items-center flex-wrap gap-2">
                      <div className="dropdown me-2">
                        <Link
                          className="dropdown-toggle btn btn-outline-white shadow"
                          data-bs-toggle="dropdown"
                          to="#"
                        >
                          Marketing Pipeline
                        </Link>
                        <div className="dropdown-menu dropdown-menu-end">
                          <Link to="#" className="dropdown-item">
                            Marketing Pipeline
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Sales Pipeline
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Email
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Chats
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Operational
                          </Link>
                        </div>
                      </div>
                      <div className="dropdown">
                        <Link
                          className="dropdown-toggle btn btn-outline-white shadow"
                          data-bs-toggle="dropdown"
                          to="#"
                        >
                          Last 30 Days
                        </Link>
                        <div className="dropdown-menu dropdown-menu-end">
                          <Link to="#" className="dropdown-item">
                            Last 30 Days
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Last 3 Months
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Last 6 Months
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-body py-0">
                  <div id="last-chart">
                    <LastChart />
                  </div>
                </div>{" "}
                {/* end card body */}
              </div>{" "}
              {/* end card */}
              <div className="card ">
                <div className="card-header">
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <h6 className="mb-0">Recently Created Leads</h6>
                    <div className="d-flex align-items-center flex-wrap gap-2">
                      <div className="dropdown me-2">
                        <Link
                          className="dropdown-toggle btn btn-outline-white shadow"
                          data-bs-toggle="dropdown"
                          to="#"
                        >
                          Last 30 Days
                        </Link>
                        <div className="dropdown-menu dropdown-menu-end">
                          <Link to="#" className="dropdown-item">
                            Last 30 Days
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Last 3 Months
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Last 6 Months
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table
                      className="table table-nowrap mb-0"
                      id="analytic-lead"
                    >
                      <thead className="table-light">
                        <tr>
                          <th>Lead Name</th>
                          <th>Company Name</th>
                          <th>Phone</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="odd">
                          <td>
                            <Link to={all_routes.leadsDetails}> Collins</Link>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <Link
                                to={all_routes.leadsDetails}
                                className="avatar avatar-rounded border"
                              >
                                <ImageWithBasePath
                                  className="w-auto h-auto"
                                  src="assets/img/icons/company-icon-01.svg"
                                  alt="User Image"
                                />
                              </Link>
                              <div className="ms-2">
                                <h6 className="fs-14 fw-medium mb-0">
                                  <Link
                                    to={all_routes.leadsDetails}
                                    className="d-flex flex-column"
                                  >
                                    NovaWaveLLC
                                  </Link>
                                </h6>
                              </div>
                            </div>
                          </td>
                          <td>+1 87545 54503</td>
                          <td>
                            <span className="badge badge-pill text-white bg-success">
                              {" "}
                              Closed
                            </span>
                          </td>
                        </tr>
                        <tr className="even">
                          <td>
                            <Link to={all_routes.leadsDetails}> Konopelski</Link>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <Link
                                to={all_routes.leadsDetails}
                                className="avatar avatar-rounded border"
                              >
                                <ImageWithBasePath
                                  className="w-auto h-auto"
                                  src="assets/img/icons/company-icon-02.svg"
                                  alt="User Image"
                                />
                              </Link>
                              <div className="ms-2">
                                <h6 className="fs-14 fw-medium mb-0">
                                  <Link
                                    to={all_routes.leadsDetails}
                                    className="d-flex flex-column"
                                  >
                                    BlueSky
                                  </Link>
                                </h6>
                              </div>
                            </div>
                          </td>
                          <td>+1 98975 17485</td>
                          <td>
                            <span className="badge badge-pill text-white bg-warning">
                              {" "}
                              Contacted
                            </span>
                          </td>
                        </tr>
                        <tr className="odd">
                          <td>
                            <Link to={all_routes.leadsDetails}> Adams</Link>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <Link
                                to={all_routes.leadsDetails}
                                className="avatar avatar-rounded border"
                              >
                                <ImageWithBasePath
                                  className="w-auto h-auto"
                                  src="assets/img/icons/company-icon-03.svg"
                                  alt="User Image"
                                />
                              </Link>
                              <div className="ms-2">
                                <h6 className="fs-14 fw-medium mb-0">
                                  <Link
                                    to={all_routes.leadsDetails}
                                    className="d-flex flex-column"
                                  >
                                    Silver Hawk
                                  </Link>
                                </h6>
                              </div>
                            </div>
                          </td>
                          <td>+1 54655 25455</td>
                          <td>
                            <span className="badge badge-pill text-white bg-success">
                              {" "}
                              Closed
                            </span>
                          </td>
                        </tr>
                        <tr className="even">
                          <td>
                            <Link to={all_routes.leadsDetails}> Schumm</Link>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <Link
                                to={all_routes.leadsDetails}
                                className="avatar avatar-rounded border"
                              >
                                <ImageWithBasePath
                                  className="w-auto h-auto"
                                  src="assets/img/icons/company-icon-04.svg"
                                  alt="User Image"
                                />
                              </Link>
                              <div className="ms-2">
                                <h6 className="fs-14 fw-medium mb-0">
                                  <Link
                                    to={all_routes.leadsDetails}
                                    className="d-flex flex-column"
                                  >
                                    Summit Peak
                                  </Link>
                                </h6>
                              </div>
                            </div>
                          </td>
                          <td>+1 45447 58787</td>
                          <td>
                            <span className="badge badge-pill text-white bg-warning">
                              {" "}
                              Contacted
                            </span>
                          </td>
                        </tr>
                        <tr className="odd">
                          <td>
                            <Link to={all_routes.leadsDetails}> Wisozk</Link>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <Link
                                to={all_routes.leadsDetails}
                                className="avatar avatar-rounded border"
                              >
                                <ImageWithBasePath
                                  className="w-auto h-auto"
                                  src="assets/img/icons/company-icon-05.svg"
                                  alt="User Image"
                                />
                              </Link>
                              <div className="ms-2">
                                <h6 className="fs-14 fw-medium mb-0">
                                  <Link
                                    to={all_routes.leadsDetails}
                                    className="d-flex flex-column"
                                  >
                                    RiverStone Ltd
                                  </Link>
                                </h6>
                              </div>
                            </div>
                          </td>
                          <td>+1 12454 27845</td>
                          <td>
                            <span className="badge badge-pill text-white bg-success">
                              {" "}
                              Closed
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>{" "}
                {/* end card body */}
              </div>{" "}
              {/* end card */}
              <div className="card">
                <div className="card-header">
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <h6 className="mb-0">Recently Created Campaign</h6>
                    <div className="d-flex align-items-center flex-wrap gap-2">
                      <div className="dropdown me-2">
                        <Link
                          className="dropdown-toggle btn btn-outline-white shadow"
                          data-bs-toggle="dropdown"
                          to="#"
                        >
                          Last 30 Days
                        </Link>
                        <div className="dropdown-menu dropdown-menu-end">
                          <Link to="#" className="dropdown-item">
                            Last 30 Days
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Last 3 Months
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Last 6 Months
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="overflow-x-auto">
                    <div className="card w-min-content mb-3">
                      <div className="card-body p-3">
                        <div className="border-bottom mb-2 pb-2">
                          <div className="d-flex align-items-center gap-3">
                            <div className="w-25">
                              <h6 className="fs-14 fw-medium mb-1">
                                Distribution
                              </h6>
                              <p className="fs-13 mb-0">Public Relations</p>
                            </div>
                            <div className="w-auto">
                              <div className="d-flex align-items-center gap-2">
                                <div>
                                  <h6 className="fs-14 fw-semibold mb-1">
                                    40.5%
                                  </h6>
                                  <p className="fs-13 mb-0">Opened</p>
                                </div>
                                <div>
                                  <h6 className="fs-14 fw-semibold mb-1">
                                    20.5%
                                  </h6>
                                  <p className="fs-13 mb-0">Closed</p>
                                </div>
                                <div>
                                  <h6 className="fs-14 fw-semibold mb-1">
                                    30.5%
                                  </h6>
                                  <p className="fs-13 mb-0">Unsubscribe</p>
                                </div>
                                <div>
                                  <h6 className="fs-14 fw-semibold mb-1">
                                    70.5%
                                  </h6>
                                  <p className="fs-13 mb-0">Delivered</p>
                                </div>
                                <div>
                                  <h6 className="fs-14 fw-semibold mb-1">
                                    35.0%
                                  </h6>
                                  <p className="fs-13 mb-0">Conversation</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge badge-pill bg-danger">
                              Bounced
                            </span>
                            <p className="fs-13 mb-0">Due Date : 25 Sep 2025</p>
                          </div>
                          <div className="avatar-list-stacked avatar-group-sm">
                            <Link to="#" className="avatar avatar-rounded">
                              <ImageWithBasePath
                                src="assets/img/profiles/avatar-14.jpg"
                                className="border border-white"
                                alt="img"
                              />
                            </Link>
                            <Link to="#" className="avatar avatar-rounded">
                              <ImageWithBasePath
                                src="assets/img/profiles/avatar-15.jpg"
                                className="border border-white"
                                alt="img"
                              />
                            </Link>
                            <Link to="#" className="avatar avatar-rounded">
                              <ImageWithBasePath
                                src="assets/img/profiles/avatar-16.jpg"
                                className="border border-white"
                                alt="img"
                              />
                            </Link>
                            <Link to="#" className="avatar avatar-rounded">
                              <ImageWithBasePath
                                src="assets/img/profiles/avatar-17.jpg"
                                className="border border-white"
                                alt="img"
                              />
                            </Link>
                            <Link
                              to="#"
                              className="avatar avatar-rounded bg-light text-dark fs-10 fw-medium"
                            >
                              +8
                            </Link>
                          </div>
                        </div>
                      </div>{" "}
                      {/* end card body */}
                    </div>{" "}
                    {/* end card */}
                    <div className="card w-min-content mb-3">
                      <div className="card-body p-3">
                        <div className="border-bottom mb-2 pb-2">
                          <div className="d-flex align-items-center gap-3">
                            <div className="w-25">
                              <h6 className="fs-14 fw-medium mb-1">Pricing</h6>
                              <p className="fs-13 mb-0">Social Marketing</p>
                            </div>
                            <div className="w-auto">
                              <div className="d-flex align-items-center gap-2">
                                <div>
                                  <h6 className="fs-14 fw-semibold mb-1">
                                    70.5%
                                  </h6>
                                  <p className="fs-13 mb-0">Opened</p>
                                </div>
                                <div>
                                  <h6 className="fs-14 fw-semibold mb-1">
                                    90.5%
                                  </h6>
                                  <p className="fs-13 mb-0">Closed</p>
                                </div>
                                <div>
                                  <h6 className="fs-14 fw-semibold mb-1">
                                    20.5%
                                  </h6>
                                  <p className="fs-13 mb-0">Unsubscribe</p>
                                </div>
                                <div>
                                  <h6 className="fs-14 fw-semibold mb-1">
                                    90.5%
                                  </h6>
                                  <p className="fs-13 mb-0">Delivered</p>
                                </div>
                                <div>
                                  <h6 className="fs-14 fw-semibold mb-1">
                                    98.0%
                                  </h6>
                                  <p className="fs-13 mb-0">Conversation</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge badge-pill bg-teal">
                              Running
                            </span>
                            <p className="fs-13 mb-0">Due Date : 28 Sep 2025</p>
                          </div>
                          <div className="avatar-list-stacked avatar-group-sm">
                            <Link to="#" className="avatar avatar-rounded">
                              <ImageWithBasePath
                                src="assets/img/profiles/avatar-11.jpg"
                                className="border border-white"
                                alt="img"
                              />
                            </Link>
                            <Link to="#" className="avatar avatar-rounded">
                              <ImageWithBasePath
                                src="assets/img/profiles/avatar-12.jpg"
                                className="border border-white"
                                alt="img"
                              />
                            </Link>
                            <Link to="#" className="avatar avatar-rounded">
                              <ImageWithBasePath
                                src="assets/img/profiles/avatar-13.jpg"
                                className="border border-white"
                                alt="img"
                              />
                            </Link>
                            <Link to="#" className="avatar avatar-rounded">
                              <ImageWithBasePath
                                src="assets/img/profiles/avatar-14.jpg"
                                className="border border-white"
                                alt="img"
                              />
                            </Link>
                            <Link
                              to="#"
                              className="avatar avatar-rounded bg-light text-dark fs-10 fw-medium"
                            >
                              +2
                            </Link>
                          </div>
                        </div>
                      </div>{" "}
                      {/* end card body */}
                    </div>{" "}
                    {/* end card */}
                    <div className="card w-min-content mb-3">
                      <div className="card-body p-3">
                        <div className="border-bottom mb-2 pb-2">
                          <div className="d-flex align-items-center gap-3">
                            <div className="w-25">
                              <h6 className="fs-14 fw-medium mb-1">
                                Merchandising
                              </h6>
                              <p className="fs-13 mb-0">Content Marketing</p>
                            </div>
                            <div className="w-auto">
                              <div className="d-flex align-items-center gap-2">
                                <div>
                                  <h6 className="fs-14 fw-semibold mb-1">
                                    30.5%
                                  </h6>
                                  <p className="fs-13 mb-0">Opened</p>
                                </div>
                                <div>
                                  <h6 className="fs-14 fw-semibold mb-1">
                                    10.5%
                                  </h6>
                                  <p className="fs-13 mb-0">Closed</p>
                                </div>
                                <div>
                                  <h6 className="fs-14 fw-semibold mb-1">
                                    70.5%
                                  </h6>
                                  <p className="fs-13 mb-0">Unsubscribe</p>
                                </div>
                                <div>
                                  <h6 className="fs-14 fw-semibold mb-1">
                                    90.5%
                                  </h6>
                                  <p className="fs-13 mb-0">Delivered</p>
                                </div>
                                <div>
                                  <h6 className="fs-14 fw-semibold mb-1">
                                    45.0%
                                  </h6>
                                  <p className="fs-13 mb-0">Conversation</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge badge-pill bg-cyan">
                              Paused
                            </span>
                            <p className="fs-13 mb-0">Due Date : 14 Sep 2025</p>
                          </div>
                          <div className="avatar-list-stacked avatar-group-sm">
                            <Link to="#" className="avatar avatar-rounded">
                              <ImageWithBasePath
                                src="assets/img/profiles/avatar-02.jpg"
                                className="border border-white"
                                alt="img"
                              />
                            </Link>
                            <Link to="#" className="avatar avatar-rounded">
                              <ImageWithBasePath
                                src="assets/img/profiles/avatar-04.jpg"
                                className="border border-white"
                                alt="img"
                              />
                            </Link>
                            <Link to="#" className="avatar avatar-rounded">
                              <ImageWithBasePath
                                src="assets/img/profiles/avatar-06.jpg"
                                className="border border-white"
                                alt="img"
                              />
                            </Link>
                            <Link to="#" className="avatar avatar-rounded">
                              <ImageWithBasePath
                                src="assets/img/profiles/avatar-08.jpg"
                                className="border border-white"
                                alt="img"
                              />
                            </Link>
                            <Link
                              to="#"
                              className="avatar avatar-rounded bg-light text-dark fs-10 fw-medium"
                            >
                              +4
                            </Link>
                          </div>
                        </div>
                      </div>{" "}
                      {/* end card body */}
                    </div>{" "}
                    {/* end card */}
                    <div className="card w-min-content mb-0">
                      <div className="card-body p-3">
                        <div className="border-bottom mb-2 pb-2">
                          <div className="d-flex align-items-center gap-3">
                            <div className="w-25">
                              <h6 className="fs-14 fw-medium mb-1">
                                Repeat Customer
                              </h6>
                              <p className="fs-13 mb-0">Rebranding</p>
                            </div>
                            <div className="w-auto">
                              <div className="d-flex align-items-center gap-2">
                                <div>
                                  <h6 className="fs-14 fw-semibold mb-1">
                                    80.5%
                                  </h6>
                                  <p className="fs-13 mb-0">Opened</p>
                                </div>
                                <div>
                                  <h6 className="fs-14 fw-semibold mb-1">
                                    20.5%
                                  </h6>
                                  <p className="fs-13 mb-0">Closed</p>
                                </div>
                                <div>
                                  <h6 className="fs-14 fw-semibold mb-1">
                                    70.5%
                                  </h6>
                                  <p className="fs-13 mb-0">Unsubscribe</p>
                                </div>
                                <div>
                                  <h6 className="fs-14 fw-semibold mb-1">
                                    60.5%
                                  </h6>
                                  <p className="fs-13 mb-0">Delivered</p>
                                </div>
                                <div>
                                  <h6 className="fs-14 fw-semibold mb-1">
                                    75.0%
                                  </h6>
                                  <p className="fs-13 mb-0">Conversation</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge badge-pill bg-danger">
                              Bounced
                            </span>
                            <p className="fs-13 mb-0">Due Date : 25 Sep 2023</p>
                          </div>
                          <div className="avatar-list-stacked avatar-group-sm">
                            <Link to="#" className="avatar avatar-rounded">
                              <ImageWithBasePath
                                src="assets/img/profiles/avatar-01.jpg"
                                className="border border-white"
                                alt="img"
                              />
                            </Link>
                            <Link to="#" className="avatar avatar-rounded">
                              <ImageWithBasePath
                                src="assets/img/profiles/avatar-03.jpg"
                                className="border border-white"
                                alt="img"
                              />
                            </Link>
                            <Link to="#" className="avatar avatar-rounded">
                              <ImageWithBasePath
                                src="assets/img/profiles/avatar-05.jpg"
                                className="border border-white"
                                alt="img"
                              />
                            </Link>
                            <Link to="#" className="avatar avatar-rounded">
                              <ImageWithBasePath
                                src="assets/img/profiles/avatar-07.jpg"
                                className="border border-white"
                                alt="img"
                              />
                            </Link>
                            <Link
                              to="#"
                              className="avatar avatar-rounded bg-light text-dark fs-10 fw-medium"
                            >
                              +5
                            </Link>
                          </div>
                        </div>
                      </div>{" "}
                      {/* end card body */}
                    </div>{" "}
                    {/* end card */}
                  </div>
                </div>{" "}
                {/* end card body */}
              </div>{" "}
              {/* end card */}
            </div>
          </div>
          {/* end row */}
        </div>
        {/* End Content */}
        {/* Start Footer */}
        <Footer />
        {/* End Footer */}
      </div>
      {/* ========================
			End Page Content
		========================= */}
    </>
  );
};

export default Analytics;
