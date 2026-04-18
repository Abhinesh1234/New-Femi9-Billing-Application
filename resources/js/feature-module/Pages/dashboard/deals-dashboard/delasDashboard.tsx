import { Link } from "react-router";
import Footer from "../../../../components/footer/footer";
import CollapseIcons from "../../../../components/collapse-icons/collapseIcons";
import DealsChart from "./chats/dealsChart";
import LastChart from "./chats/lastChart";
import WonChart from "./chats/wonChart";
import DealsYearChart from "./chats/dealsYearChart";
import PredefinedDatePicker from "../../../../components/common-dateRangePicker/PredefinedDatePicker";
import { all_routes } from "../../../../routes/all_routes";

const DelasDashboard = () => {
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
              <h4 className="mb-0">Deals Dashboard</h4>
            </div>
            <div className="gap-2 d-flex align-items-center flex-wrap">
              <PredefinedDatePicker/>
              <CollapseIcons />
            </div>
          </div>
          {/* End Page Header */}
          {/* start row */}
          <div className="row">
            <div className="col-md-6 d-flex">
              <div className="card flex-fill">
                <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                  <h6 className="mb-0">Recently Created Deals</h6>
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
                <div className="card-body">
                  <div className="table-responsive custom-table">
                    <table
  className="table dataTable table-nowrap no-footer"
  id="deals-project"
  style={{ width: 570 }}
>
  <thead className="table-light">
    <tr>
      <th
        className="sorting_disabled"
        rowSpan={1}
        colSpan={1}
        style={{ width: 212 }}
      >
        Deal Name
      </th>
      <th
        className="sorting_disabled"
        rowSpan={1}
        colSpan={1}
        style={{ width: 110 }}
      >
        Stage
      </th>
      <th
        className="sorting_disabled"
        rowSpan={1}
        colSpan={1}
        style={{ width: 85 }}
      >
        Deal Value
      </th>
      <th
        className="sorting_disabled"
        rowSpan={1}
        colSpan={1}
        style={{ width: 54 }}
      >
        Status
      </th>
    </tr>
  </thead>
  <tbody>
    <tr className="odd">
      <td>
        <Link to={all_routes.dealsDetails} className="fw-medium">
          SkyHigh Annual Booking
        </Link>
      </td>
      <td>Appointment</td>
      <td>$04,51,000</td>
      <td>
        <span className="badge badge-pill  bg-success">Won</span>
      </td>
    </tr>
    <tr className="even">
      <td>
        <Link to={all_routes.dealsDetails} className="fw-medium">
          CRM Onboarding Package
        </Link>
      </td>
      <td>Contact Made</td>
      <td>$72,14,078</td>
      <td>
        <span className="badge badge-pill  bg-danger">Lost</span>
      </td>
    </tr>
    <tr className="odd">
      <td>
        <Link to={all_routes.dealsDetails} className="fw-medium">
          Enterprise Plan Upgrade
        </Link>
      </td>
      <td>Presentation</td>
      <td>$04,14,800</td>
      <td>
        <span className="badge badge-pill  bg-success">Won</span>
      </td>
    </tr>
    <tr className="even">
      <td>
        <Link to={all_routes.dealsDetails} className="fw-medium">
          CRM Migration Project
        </Link>
      </td>
      <td>Proposal Made</td>
      <td>$16,11,400</td>
      <td>
        <span className="badge badge-pill  bg-success">Won</span>
      </td>
    </tr>
    <tr className="odd">
      <td>
        <Link to={all_routes.dealsDetails} className="fw-medium">
          Sales Pipeline Optimization
        </Link>
      </td>
      <td>Qualify To Buy</td>
      <td>$09,05,947</td>
      <td>
        <span className="badge badge-pill  bg-success">Won</span>
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
            <div className="col-md-6 d-flex">
              <div className="card flex-fill">
                <div className="card-header">
                  <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                    <h6 className="mb-0">Deals By Stage</h6>
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
                  <div id="deals-chart">
                    <DealsChart />
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
                          Last 30 Days
                        </Link>
                        <div className="dropdown-menu dropdown-menu-end">
                          <Link to="#" className="dropdown-item">
                            Last 30 Days
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
              <div className="card flex-fill">
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
                          Last 30 Days
                        </Link>
                        <div className="dropdown-menu dropdown-menu-end">
                          <Link to="#" className="dropdown-item">
                            Last 30 Days
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
          {/* start row */}
          <div className="row">
            <div className="col-md-12 d-flex">
              <div className="card w-100">
                <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                  <h6 className="mb-0">Deals by Year</h6>
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
                <div className="card-body py-0">
                  <div id="deals-year">
                    <DealsYearChart />
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

export default DelasDashboard;
