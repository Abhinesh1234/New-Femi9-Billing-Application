import { Link } from "react-router";
import Footer from "../../../../components/footer/footer";
import PageHeader from "../../../../components/page-header/pageHeader";
import SettingsTopbar from "../settings-topbar/settingsTopbar";
import { all_routes } from "../../../../routes/all_routes";
import {
  Countries_Restriction,
  Currency,
  Currency_Position,
  Currency_Symbol,
  Date_Format,
  Decimal_Seperator,
  Financial_Year,
  Language,
  Starting_Month,
  Time_Format,
  Time_zone,
} from "../../../../core/json/selectOption";
import CommonSelect from "../../../../components/common-select/commonSelect";

const LocalizationSettings = () => {
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
              <div className="card mb-3 mb-xl-0 filemanager-left-sidebar">
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
                        className="d-block p-2 fw-medium active"
                      >
                        Localization
                      </Link>
                      <Link
                        to={all_routes.prefixes}
                        className="d-block p-2 fw-medium"
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
              {/* Prefixes */}
              <div className="card mb-0">
                <div className="card-body">
                  <div className="border-bottom mb-3 pb-3">
                    <h5 className="mb-0 fs-17">Localization</h5>
                  </div>
                  <form>
                    <div className="mb-3">
                      <h6 className="mb-1">Basic Information</h6>
                      <p className="mb-0">
                        Provide the basic information below
                      </p>
                    </div>
                    <div className="border-bottom mb-3">
                      <div className="row">
                        <div className="col-md-8">
                          <div className="mb-3">
                            <h6 className="fs-14 fw-semibold mb-1">Language</h6>
                            <p className="fs-13 mb-0">
                              Select Language of the website
                            </p>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="mb-3">
                            <CommonSelect
                              options={Language}
                              className="select"
                              defaultValue={Language[0]}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-8">
                          <div className="mb-3">
                            <h6 className="fs-14 fw-semibold mb-1">
                              Language Switcher
                            </h6>
                            <p className="fs-13 mb-0">
                              To display in all the pages
                            </p>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="mb-3">
                            <div className="form-check form-switch ms-0 ps-0">
                              <input
                                className="form-check-input ms-0"
                                type="checkbox"
                                role="switch"
                                defaultChecked
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-8">
                          <div className="mb-3">
                            <h6 className="fs-14 fw-semibold mb-1">Timezone</h6>
                            <p className="fs-13 mb-0">
                              Select date format to display in website
                            </p>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="mb-3">
                            <CommonSelect
                              options={Time_zone}
                              className="select"
                              defaultValue={Time_zone[0]}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-8">
                          <div className="mb-3">
                            <h6 className="fs-14 fw-semibold mb-1">
                              Date Format
                            </h6>
                            <p className="fs-13 mb-0">
                              Select Language of the website
                            </p>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="mb-3">
                            <CommonSelect
                              options={Date_Format}
                              className="select"
                              defaultValue={Date_Format[0]}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-8">
                          <div className="mb-3">
                            <h6 className="fs-14 fw-semibold mb-1">
                              Time Format
                            </h6>
                            <p className="fs-13 mb-0">
                              Select time format to display in website
                            </p>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="mb-3">
                            <CommonSelect
                              options={Time_Format}
                              className="select"
                              defaultValue={Time_Format[0]}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-8">
                          <div className="mb-3">
                            <h6 className="fs-14 fw-semibold mb-1">
                              Financial Year
                            </h6>
                            <p className="fs-13 mb-0">
                              Select year for finance
                            </p>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="mb-3">
                            <CommonSelect
                              options={Financial_Year}
                              className="select"
                              defaultValue={Financial_Year[0]}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-8">
                          <div className="mb-3">
                            <h6 className="fs-14 fw-semibold mb-1">
                              Starting Month
                            </h6>
                            <p className="fs-13 mb-0">
                              Select starting month to display
                            </p>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="mb-3">
                            <CommonSelect
                              options={Starting_Month}
                              className="select"
                              defaultValue={Starting_Month[0]}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <h6 className="mb-1">Currency Settings</h6>
                      <p>Provide the currency information below</p>
                    </div>
                    <div className="border-bottom mb-3">
                      <div className="row">
                        <div className="col-md-8">
                          <div className="mb-3">
                            <h6 className="fs-14 fw-semibold mb-1">Currency</h6>
                            <p className="fs-13 mb-0">Select currency</p>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="mb-3">
                            <CommonSelect
                              options={Currency}
                              className="select"
                              defaultValue={Currency[0]}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-8">
                          <div className="mb-3">
                            <h6 className="fs-14 fw-semibold mb-1">
                              Currency Symbol
                            </h6>
                            <p className="fs-13 mb-0">Select currency symbol</p>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="mb-3">
                            <CommonSelect
                              options={Currency_Symbol}
                              className="select"
                              defaultValue={Currency_Symbol[0]}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-8">
                          <div className="mb-3">
                            <h6 className="fs-14 fw-semibold mb-1">
                              Currency Position
                            </h6>
                            <p className="fs-13 mb-0">
                              Select currency position
                            </p>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="mb-3">
                            <CommonSelect
                              options={Currency_Position}
                              className="select"
                              defaultValue={Currency_Position[0]}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-8">
                          <div className="mb-3">
                            <h6 className="fs-14 fw-semibold mb-1">
                              Decimal Seperator
                            </h6>
                            <p className="fs-13 mb-0">
                              Select decimal seperator
                            </p>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="mb-3">
                            <CommonSelect
                              options={Decimal_Seperator}
                              className="select"
                              defaultValue={Decimal_Seperator[0]}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-8">
                          <div className="mb-3">
                            <h6 className="fs-14 fw-semibold mb-1">
                              Thousand Seperator
                            </h6>
                            <p className="fs-13 mb-0">
                              Select thousand seperator
                            </p>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="mb-3">
                            <CommonSelect
                              options={Decimal_Seperator}
                              className="select"
                              defaultValue={Decimal_Seperator[0]}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <h6 className="mb-1">Country Settings</h6>
                      <p className="mb-0">
                        Provide the country information below
                      </p>
                    </div>
                    <div className="border-bottom mb-3">
                      <div className="row">
                        <div className="col-md-8">
                          <div className="mb-3">
                            <h6 className="fs-14 fw-semibold mb-1">
                              Countries Restriction
                            </h6>
                            <p className="mb-0">Select restricted countries</p>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="mb-3">
                            <CommonSelect
                              options={Countries_Restriction}
                              className="select"
                              defaultValue={Countries_Restriction[0]}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <h6 className="mb-1">File Settings</h6>
                      <p className="mb-0">
                        Provide the files information below
                      </p>
                    </div>
                    <div className="border-bottom mb-3 border-0">
                      <div className="row">
                        <div className="col-md-8">
                          <div className="mb-3">
                            <h6 className="fs-14 fw-semibold mb-1">
                              Allowed Files
                            </h6>
                            <p className="fs-13 mb-0">Select allowed files</p>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="mb-3">
                            <input
                              className="form-control"
                              id="choices-text-remove-button"
                              data-choices=""
                              data-choices-removeitem=""
                              type="text"
                              defaultValue="JPG, PNG, GIF"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-8">
                          <div className="mb-3">
                            <h6 className="fs-14 fw-semibold mb-1">
                              Max File Size
                            </h6>
                            <p className="fs-13 mb-0">
                              Select size of the files
                            </p>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="mb-3">
                            <input
                              type="text"
                              className="form-control"
                              defaultValue="5000MB"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-end flex-wrap gap-2">
                      <Link to="#" className="btn btn-sm btn-light">
                        Cancel
                      </Link>
                      <button type="submit" className="btn btn-sm btn-primary">
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              {/* /Prefixes */}
            </div>
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
    </>
  );
};

export default LocalizationSettings;
