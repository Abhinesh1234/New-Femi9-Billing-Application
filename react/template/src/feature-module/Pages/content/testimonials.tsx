import { Link } from "react-router";
import ImageWithBasePath from "../../../components/imageWithBasePath";
import { useState } from "react";
import { testimonialsListData } from "../../../core/json/testimonialsListData";
import PageHeader from "../../../components/page-header/pageHeader";
import SearchInput from "../../../components/dataTable/dataTableSearch";
import Datatable from "../../../components/dataTable";
import CommonSelect from "../../../components/common-select/commonSelect";
import { Ratings } from "../../../core/json/selectOption";
import { all_routes } from "../../../routes/all_routes";

const Testimonials = () => {
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

  const data = testimonialsListData;
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
      title: "Estimation By",
      dataIndex: "EstimationBy",
      render: (text: any, render: any) => (
        <h6 className="d-flex align-items-center fs-14 fw-medium mb-0">
          <Link to="#" className="avatar avatar-rounded me-2">
            <ImageWithBasePath
              src={`assets/img/profiles/${render.Image}`}
              alt="User Image"
            />
          </Link>
          <Link to="#" className="d-flex flex-column">
            {text}
            <span className="text-body fw-normal fs-13 d-inline-block mt-1">
              {render.Role}{" "}
            </span>
          </Link>
        </h6>
      ),
      sorter: (a: any, b: any) => a.EstimationBy.length - b.EstimationBy.length,
    },
    {
      title: "Rating",
      dataIndex: "Rating",
      render: () => (
        <div className="set-star rating-select filled">
          <i className="ti ti-star-filled fs-16 me-1" />
          <i className="ti ti-star-filled fs-16 me-1" />
          <i className="ti ti-star-filled fs-16 me-1" />
          <i className="ti ti-star-filled fs-16 me-1" />
          <i className="ti ti-star-filled fs-16 me-1" />
        </div>
      ),
      sorter: (a: any, b: any) => a.Rating.length - b.Rating.length,
    },
    {
      title: "Content",
      dataIndex: "Content",
      sorter: (a: any, b: any) => a.Content.length - b.Content.length,
    },
    {
      title: "Created Date",
      dataIndex: "CreatedDate",
      sorter: (a: any, b: any) => a.CreatedDate.length - b.CreatedDate.length,
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text: any) => (
        <span
          className={`badge badge-pill badge-status ${
            text === "Active" ? "bg-success" : "bg-danger"
          }`}
        >
          Active
        </span>
      ),
      sorter: (a: any, b: any) => a.Status.length - b.Status.length,
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
              data-bs-target="#edit_testimonial"
            >
              <i className="ti ti-edit text-blue" /> Edit
            </Link>
            <Link
              className="dropdown-item"
              to="#"
              data-bs-toggle="modal"
              data-bs-target="#delete_testimonial"
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
            title="Testimonials"
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
                data-bs-target="#add_testimonial"
              >
                <i className="ti ti-square-rounded-plus-filled me-1" />
                Add Testimonials
              </Link>
            </div>
            <div className="card-body">
              {/* Contact List */}
              <div className="custom-table">
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
        <footer className="footer d-block d-md-flex justify-content-between text-md-start text-center">
          <p className="mb-md-0 mb-1">
            Copyright ©{" "}
            <Link
              to="#"
              className="link-primary text-decoration-underline"
            >
              CRMS
            </Link>
          </p>
          <div className="d-flex align-items-center gap-2 footer-links justify-content-center justify-content-md-end">
            <Link to="#">About</Link>
            <Link to="#">Terms</Link>
            <Link to="#">Contact Us</Link>
          </div>
        </footer>
        {/* End Footer */}
      </div>
      {/* ========================
			End Page Content
		========================= */}
      <>
        {/* Add Testimonial */}
        <div className="modal fade" id="add_testimonial" role="dialog">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Testimonial</h5>
                <button
                  className="btn-close custom-btn-close border p-1 me-0 text-dark"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                />
              </div>
              <form>
                <div className="modal-body">
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-3">
                      <div className="avatar avatar-xxl border border-dashed me-3 flex-shrink-0">
                        <div className="position-relative d-flex align-items-center">
                          <i className="ti ti-photo text-dark fs-16" />
                        </div>
                      </div>
                      <div className="d-inline-flex flex-column align-items-start">
                        <div className="drag-upload-btn btn btn-sm btn-primary position-relative mb-2">
                          <i className="ti ti-file-broken me-1" />
                          Upload file
                          <input
                            type="file"
                            className="form-control image-sign"
                            multiple
                          />
                        </div>
                        <span>JPG, GIF or PNG. Max size of 800K</span>
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      User Name <span className="text-danger">*</span>
                    </label>
                    <input type="text" className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Designation <span className="text-danger">*</span>
                    </label>
                    <input type="text" className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Ratings <span className="text-danger">*</span>
                    </label>
                     <CommonSelect
                            options={Ratings}
                            className="select"
                            defaultValue={Ratings[0]}
                          />
                  </div>
                  <div className="mb-0">
                    <label className="form-label">
                      Status <span className="text-danger">*</span>
                    </label>
                    <div className="d-flex align-items-center">
                      <div className="me-2">
                        <input
                          type="radio"
                          className="status-radio"
                          id="active"
                          name="status"
                          defaultChecked
                        />
                        <label htmlFor="active">Active</label>
                      </div>
                      <div>
                        <input
                          type="radio"
                          className="status-radio"
                          id="inactive"
                          name="status"
                        />
                        <label htmlFor="inactive">Inactive</label>
                      </div>
                    </div>
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
        {/* /Add Testimonial  */}
        {/* Edit Testimonial */}
        <div className="modal fade" id="edit_testimonial" role="dialog">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Testimonial</h5>
                <button
                  className="btn-close custom-btn-close border p-1 me-0 text-dark"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                />
              </div>
              <form >
                <div className="modal-body">
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-3">
                      <div className="avatar avatar-xxl border border-dashed me-3 flex-shrink-0">
                        <div className="position-relative d-flex align-items-center">
                          <i className="ti ti-photo text-dark fs-16" />
                        </div>
                      </div>
                      <div className="d-inline-flex flex-column align-items-start">
                        <div className="drag-upload-btn btn btn-sm btn-primary position-relative mb-2">
                          <i className="ti ti-file-broken me-1" />
                          Upload file
                          <input
                            type="file"
                            className="form-control image-sign"
                            multiple
                          />
                        </div>
                        <span>JPG, GIF or PNG. Max size of 800K</span>
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      User Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      defaultValue="Darlee Robertson"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Designation <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      defaultValue="Facility Manager"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Ratings <span className="text-danger">*</span>
                    </label>
                      <CommonSelect
                            options={Ratings}
                            className="select"
                            defaultValue={Ratings[5]}
                          />
                  </div>
                  <div className="mb-0">
                    <label className="form-label">
                      Status <span className="text-danger">*</span>
                    </label>
                    <div className="d-flex align-items-center">
                      <div className="me-2">
                        <input
                          type="radio"
                          className="status-radio"
                          id="active1"
                          name="status2"
                          defaultChecked
                        />
                        <label htmlFor="active1">Active</label>
                      </div>
                      <div>
                        <input
                          type="radio"
                          className="status-radio"
                          id="inactive1"
                          name="status2"
                        />
                        <label htmlFor="inactive1">Inactive</label>
                      </div>
                    </div>
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
        {/* /Edit Testimonial  */}
        {/* delete modal */}
        <div className="modal fade" id="delete_testimonial">
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
                  Are you sure you want to remove testimonials you selected.
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
                    to={all_routes.testimonials}
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

export default Testimonials;
