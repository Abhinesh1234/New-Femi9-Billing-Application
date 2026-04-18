import { Link } from "react-router";
import Footer from "../../../../components/footer/footer";
import PageHeader from "../../../../components/page-header/pageHeader";
import { all_routes } from "../../../../routes/all_routes";
import SettingsTopbar from "../settings-topbar/settingsTopbar";

const PrefixesSettings = () => {
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
            title="Settings"
            badgeCount={false}
            showModuleTile={false}
            showExport={false}
          />
          {/* End Page Header */}
          <SettingsTopbar />
          {/* end card */}
          {/* start row */}
          <div className="row">
            <div className="col-xl-3 col-lg-12 theiaStickySidebar">
              <div className="card filemanager-left-sidebar">
                <div className="card-body">
                  <div className="settings-sidebar">
                    <h5 className="mb-3 fs-17">Website Settings</h5>
                    <div className="list-group list-group-flush settings-sidebar">
                      <Link
                        to={all_routes.companySettings}
                        className="d-block p-2 fw-medium "
                      >
                        Company Settings
                      </Link>
                      <Link
                        to={all_routes.localization}
                        className="d-block p-2 fw-medium "
                      >
                        Localization
                      </Link>
                      <Link
                        to={all_routes.prefixes}
                        className="d-block p-2 fw-medium active"
                      >
                        Prefixes
                      </Link>
                      <Link
                        to={all_routes.preference}
                        className="d-block p-2 fw-medium"
                      >
                        Preference
                      </Link>
                      <Link
                        to={all_routes.appearance}
                        className="d-block p-2 fw-medium"
                      >
                        Appearance
                      </Link>
                      <Link
                        to={all_routes.languageWeb}
                        className="d-block p-2 fw-medium"
                      >
                        Language
                      </Link>
                    </div>
                  </div>
                </div>{" "}
                {/* end card body */}
              </div>{" "}
              {/* end card */}
            </div>{" "}
            {/* end col */}
            <div className="col-xl-9 col-lg-12">
              <div className="card">
                <div className="card-body">
                  <div className="border-bottom mb-3 pb-3">
                    <h5 className="mb-0 fs-17">Prefixes</h5>
                  </div>
                  <form>
                    <div className="border-bottom mb-3">
                      {/* start row */}
                      <div className="row">
                        <div className="col-md-3 col-sm-6">
                          <div className="mb-3">
                            <label className="form-label">Products</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue="SKU - "
                            />
                          </div>
                        </div>{" "}
                        {/* end col */}
                        <div className="col-md-3 col-sm-6">
                          <div className="mb-3">
                            <label className="form-label">Supplier</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue="SUP - "
                            />
                          </div>
                        </div>{" "}
                        {/* end col */}
                        <div className="col-md-3 col-sm-6">
                          <div className="mb-3">
                            <label className="form-label">Purchase</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue="PU - "
                            />
                          </div>
                        </div>{" "}
                        {/* end col */}
                        <div className="col-md-3 col-sm-6">
                          <div className="mb-3">
                            <label className="form-label">
                              Purchase Return
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue="PR - "
                            />
                          </div>
                        </div>{" "}
                        {/* end col */}
                        <div className="col-md-3 col-sm-6">
                          <div className="mb-3">
                            <label className="form-label">Sales</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue="SA - "
                            />
                          </div>
                        </div>{" "}
                        {/* end col */}
                        <div className="col-md-3 col-sm-6">
                          <div className="mb-3">
                            <label className="form-label">Sales Return</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue="SR -  "
                            />
                          </div>
                        </div>{" "}
                        {/* end col */}
                        <div className="col-md-3 col-sm-6">
                          <div className="mb-3">
                            <label className="form-label">Customer</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue="CT - "
                            />
                          </div>
                        </div>{" "}
                        {/* end col */}
                        <div className="col-md-3 col-sm-6">
                          <div className="mb-3">
                            <label className="form-label">Expense</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue="EX - "
                            />
                          </div>
                        </div>{" "}
                        {/* end col */}
                        <div className="col-md-3 col-sm-6">
                          <div className="mb-3">
                            <label className="form-label">Stock Transfer</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue="ST -  "
                            />
                          </div>
                        </div>{" "}
                        {/* end col */}
                        <div className="col-md-3 col-sm-6">
                          <div className="mb-3">
                            <label className="form-label">
                              Stock Adjustment
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue="SA -  "
                            />
                          </div>
                        </div>{" "}
                        {/* end col */}
                        <div className="col-md-3 col-sm-6">
                          <div className="mb-3">
                            <label className="form-label">Sales Order</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue="SO - "
                            />
                          </div>
                        </div>{" "}
                        {/* end col */}
                        <div className="col-md-3 col-sm-6">
                          <div className="mb-3">
                            <label className="form-label">Invoice</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue="INV -  "
                            />
                          </div>
                        </div>{" "}
                        {/* end col */}
                        <div className="col-md-3 col-sm-6">
                          <div className="mb-3">
                            <label className="form-label">Estimation</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue="EST - "
                            />
                          </div>
                        </div>{" "}
                        {/* end col */}
                        <div className="col-md-3 col-sm-6">
                          <div className="mb-3">
                            <label className="form-label">Transaction</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue="TRN - "
                            />
                          </div>
                        </div>{" "}
                        {/* end col */}
                        <div className="col-md-3 col-sm-6">
                          <div className="mb-3">
                            <label className="form-label">Employee</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue="EMP -  "
                            />
                          </div>
                        </div>{" "}
                        {/* end col */}
                        <div className="col-md-3 col-sm-6">
                          <div className="mb-3">
                            <label className="form-label">
                              Purchase Return
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue="PR -  "
                            />
                          </div>
                        </div>{" "}
                        {/* end col */}
                      </div>
                      {/* end row */}
                    </div>
                    <div className="d-flex align-items-center justify-content-end flex-wrap gap-2">
                      <a href="#" className="btn btn-sm btn-light">
                        Cancel
                      </a>
                      <button type="submit" className="btn btn-sm btn-primary">
                        Save Changes
                      </button>
                    </div>
                  </form>
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

export default PrefixesSettings;
