import { Link } from "react-router";
import ImageWithBasePath from "../../../../components/imageWithBasePath";
import { CitiesListData } from "../../../../core/json/citiesListData";
import { useState } from "react";
import PageHeader from "../../../../components/page-header/pageHeader";
import Datatable from "../../../../components/dataTable";
import Footer from "../../../../components/footer/footer";
import SearchInput from "../../../../components/dataTable/dataTableSearch";
import { all_routes } from "../../../../routes/all_routes";

const Cities = () => {
  const [filledStars, setFilledStars] = useState<{ [key: string]: boolean }>(
    {}
  );
  const handleClick = (key: string) => {
    setFilledStars((prev) => ({
      ...prev,
      [key]: !prev[key], // toggle on/off
    }));
  };
  const [searchText, setSearchText] = useState<string>("");
  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const data = CitiesListData;
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
      title: "Country Name",
      dataIndex: "CountryName",
      render: (text: any, render: any) => (
        <Link to="#" className="table-imgname flag-image">
          <span className="location-flag-img me-2">
            <ImageWithBasePath
              src={`assets/img/country/${render.Image}`}
              className="img-fluid"
              alt="img"
            />
          </span>
          <span>{text}</span>
        </Link>
      ),
      sorter: (a: any, b: any) => a.CountryName.length - b.CountryName.length,
    },
    {
      title: "State Name",
      dataIndex: "StateName",
      sorter: (a: any, b: any) => a.StateName.length - b.StateName.length,
    },
    {
      title: "City Name",
      dataIndex: "CityName",
      sorter: (a: any, b: any) => a.CityName.length - b.CityName.length,
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
              data-bs-target="#edit_city"
            >
              <i className="ti ti-edit text-blue" /> Edit
            </Link>
            <Link
              className="dropdown-item"
              to="#"
              data-bs-toggle="modal"
              data-bs-target="#delete_state"
            >
              <i className="ti ti-trash" /> Delete
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
            title="City"
            badgeCount={75}
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
              <Link
                to="#"
                className="btn btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#add_city"
              >
                <i className="ti ti-square-rounded-plus-filled me-1" />
                Add City
              </Link>
            </div>
            <div className="card-body">
              {/* Contact List */}
              <div className=" custom-table">
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
      <>
        {/* Add country */}
        <div className="modal fade" id="add_city" role="dialog">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add City</h5>
                <button
                  className="btn-close custom-btn-close border p-1 me-0 text-dark"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                />
              </div>
              <form>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">
                      Country Name <span className="text-danger">*</span>
                    </label>
                    <input type="text" className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      State Name <span className="text-danger">*</span>
                    </label>
                    <input type="text" className="form-control" />
                  </div>
                  <div className="mb-0">
                    <label className="form-label">
                      City Name <span className="text-danger">*</span>
                    </label>
                    <input type="text" className="form-control" />
                  </div>
                </div>
                <div className="modal-footer">
                  <div className="d-flex align-items-center justify-content-end m-0">
                    <Link
                      to="#"
                      className="btn btn-light me-2"
                      data-bs-dismiss="modal"
                    >
                      Cancel
                    </Link>
                    <button type="submit" className="btn btn-primary">
                      Create
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* /Add country  */}
        {/* Edit country  */}
        <div className="modal fade" id="edit_city" role="dialog">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit City</h5>
                <button
                  className="btn-close custom-btn-close border p-1 me-0 text-dark"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                />
              </div>
              <form>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">
                      Country Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      defaultValue="United States"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      State Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      defaultValue="Indiana"
                    />
                  </div>
                  <div className="mb-0">
                    <label className="form-label">
                      City Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      defaultValue="Indianapolis"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <div className="d-flex align-items-center justify-content-end m-0">
                    <Link
                      to="#"
                      className="btn btn-light me-2"
                      data-bs-dismiss="modal"
                    >
                      Cancel
                    </Link>
                    <button type="submit" className="btn btn-primary">
                      Save Changes
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* /Edit country  */}
        {/* delete modal */}
        <div className="modal fade" id="delete_city">
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
                  Are you sure you want to remove city you selected.
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
                    to={all_routes.cities}
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
    </>
  );
};

export default Cities;
