import { Link } from "react-router";
import Footer from "../../../../components/footer/footer";
import CollapseIcons from "../../../../components/collapse-icons/collapseIcons";
import PredefinedDatePicker from "../../../../components/common-dateRangePicker/PredefinedDatePicker";
import ImageWithBasePath from "../../../../components/imageWithBasePath";
import { all_routes } from "../../../../routes/all_routes";
import LeadPieChart from "./charts/leadPieChart";
import ContactReportChart from "./charts/contactReportChart";
import LastChart from "../deals-dashboard/chats/lastChart";
import WonChart from "../deals-dashboard/chats/wonChart";

const LeadsDashboard = () => {

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
              <h4 className="mb-0">Leads Dashboard</h4>
            </div>
            <div className="gap-2 d-flex align-items-center flex-wrap">
              <PredefinedDatePicker />
              <CollapseIcons />
            </div>
          </div>
          {/* End Page Header */}
          {/* start row */}
          <div className="row">
            <div className="col-xl-6 d-flex">
              <div className="card flex-fill">
                <div className="card-header">
                  <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                    <h6 className="mb-0">Recently Created Leads</h6>
                    <div className="dropdown">
                      <Link
                        className="dropdown-toggle btn btn-outline-light shadow"
                        data-bs-toggle="dropdown"
                        to="#"
                      >
                        Last 30 days
                      </Link>
                      <div className="dropdown-menu dropdown-menu-end">
                        <Link to="#" className="dropdown-item">
                          Last 15 days
                        </Link>
                        <Link to="#" className="dropdown-item">
                          Last 30 days
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-body leads-table">
                  <div className=" custom-table overflow-auto">
                    <table
                      className="table table-nowrap dataTable no-footer"
                      id="lead-project"
                      style={{ width: 570 }}
                    >
                      <thead className="table-light">
                        <tr>
                          <th
                            className="sorting_disabled"
                            rowSpan={1}
                            colSpan={1}
                            style={{ width: 83 }}
                          >
                            Lead Name
                          </th>
                          <th
                            className="sorting_disabled"
                            rowSpan={1}
                            colSpan={1}
                            style={{ width: 195 }}
                          >
                            Company Name
                          </th>
                          <th
                            className="sorting_disabled"
                            rowSpan={1}
                            colSpan={1}
                            style={{ width: 106 }}
                          >
                            Phone
                          </th>
                          <th
                            className="sorting_disabled"
                            rowSpan={1}
                            colSpan={1}
                            style={{ width: 78 }}
                          >
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="odd">
                          <td>
                            <Link to="leads-details.html">Collins</Link>
                          </td>
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
                                  <Link
                                    to={all_routes.companyDetails}
                                    className="d-flex flex-column"
                                  >
                                    NovaWave LLC
                                  </Link>
                                </h6>
                              </div>
                            </div>
                          </td>
                          <td>+1 875455453</td>
                          <td>
                            <span className="badge badge-pill  bg-success">
                              {" "}
                              Closed
                            </span>
                          </td>
                        </tr>
                        <tr className="even">
                          <td>
                            <Link to="leads-details.html">Konopelski</Link>
                          </td>
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
                                  <Link
                                    to={all_routes.companyDetails}
                                    className="d-flex flex-column"
                                  >
                                    BlueSky Industries
                                  </Link>
                                </h6>
                              </div>
                            </div>
                          </td>
                          <td>+1 989757485</td>
                          <td>
                            <span className="badge badge-pill  bg-success">
                              {" "}
                              Closed
                            </span>
                          </td>
                        </tr>
                        <tr className="odd">
                          <td>
                            <Link to="leads-details.html">Adams</Link>
                          </td>
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
                                  <Link
                                    to={all_routes.companyDetails}
                                    className="d-flex flex-column"
                                  >
                                    Silver Hawk
                                  </Link>
                                </h6>
                              </div>
                            </div>
                          </td>
                          <td>+1 546555455</td>
                          <td>
                            <span className="badge badge-pill  bg-success">
                              {" "}
                              Closed
                            </span>
                          </td>
                        </tr>
                        <tr className="even">
                          <td>
                            <Link to="leads-details.html">Schumm</Link>
                          </td>
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
                                  <Link
                                    to={all_routes.companyDetails}
                                    className="d-flex flex-column"
                                  >
                                    Summit Peak
                                  </Link>
                                </h6>
                              </div>
                            </div>
                          </td>
                          <td>+1 454478787</td>
                          <td>
                            <span className="badge badge-pill  bg-warning">
                              {" "}
                              Contacted
                            </span>
                          </td>
                        </tr>
                        <tr className="odd">
                          <td>
                            <Link to="leads-details.html">Wisozk</Link>
                          </td>
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
                                  <Link
                                    to={all_routes.companyDetails}
                                    className="d-flex flex-column"
                                  >
                                    RiverStone Ltd
                                  </Link>
                                </h6>
                              </div>
                            </div>
                          </td>
                          <td>+1 1245427875</td>
                          <td>
                            <span className="badge badge-pill  bg-success">
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
            </div>{" "}
            {/* end col */}
            <div className="col-xl-6 d-flex">
              <div className="card flex-fill">
                <div className="card-header">
                  <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                    <h6 className="mb-0">Projects By Stage</h6>
                    <div className="dropdown">
                      <Link
                        className="dropdown-toggle btn btn-outline-light shadow"
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
                          Last 15 Days
                        </Link>
                        <Link to="#" className="dropdown-item">
                          Last 7 Days
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div id="leadpiechart" className="text-center">
                    <LeadPieChart />
                  </div>
                </div>{" "}
                {/* end card body */}
              </div>{" "}
              {/* end card */}
            </div>{" "}
            {/* end col */}
          </div>
          {/* end row */}
          {/* start row */}
          <div className="row">
            <div className="col-md-12 d-flex">
              <div className="card flex-fill">
                <div className="card-header">
                  <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                    <h6 className="mb-0">Projects By Stage</h6>
                    <div className="d-flex align-items-center flex-wrap row-gap-3">
                      <div className="dropdown me-2">
                        <Link
                          className="dropdown-toggle btn btn-outline-light shadow"
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
                          className="dropdown-toggle btn btn-outline-light shadow"
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
                            Last 15 Days
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Last 7 Days
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-body py-0">
                  <div id="contact-report">
                    <ContactReportChart />
                  </div>
                </div>{" "}
                {/* end card body */}
              </div>{" "}
              {/* end card */}
            </div>{" "}
            {/* end col */}
          </div>
          {/* end row */}
          {/* start row */}
          <div className="row">
            <div className="col-md-6 d-flex">
              <div className="card flex-fill">
                <div className="card-header">
                  <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                    <h6 className="mb-0">Lost Deals Stage</h6>
                    <div className="d-flex align-items-center flex-wrap row-gap-3">
                      <div className="dropdown me-2">
                        <Link
                          className="dropdown-toggle btn btn-outline-light shadow"
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
                          className="dropdown-toggle btn btn-outline-light shadow"
                          data-bs-toggle="dropdown"
                          to="#"
                        >
                          Last 3 months
                        </Link>
                        <div className="dropdown-menu dropdown-menu-end">
                          <Link to="#" className="dropdown-item">
                            Last 3 months
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Last 6 months
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Last 12 months
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
            </div>{" "}
            {/* end col */}
            <div className="col-md-6 d-flex">
              <div className="card w-100">
                <div className="card-header">
                  <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                    <h6 className="mb-0">Won Deals Stage</h6>
                    <div className="d-flex align-items-center flex-wrap row-gap-3">
                      <div className="dropdown me-2">
                        <Link
                          className="dropdown-toggle btn btn-outline-light shadow"
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
                          className="dropdown-toggle btn btn-outline-light shadow"
                          data-bs-toggle="dropdown"
                          to="#"
                        >
                          Last 3 months
                        </Link>
                        <div className="dropdown-menu dropdown-menu-end">
                          <Link to="#" className="dropdown-item">
                            Last 3 months
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Last 6 months
                          </Link>
                          <Link to="#" className="dropdown-item">
                            Last 12 months
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
            </div>{" "}
            {/* end col */}
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

export default LeadsDashboard;
