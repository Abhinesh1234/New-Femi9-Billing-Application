import { useState } from "react";
import { FaqListData } from "../../../core/json/faqListData";
import { Link } from "react-router";
import PageHeader from "../../../components/page-header/pageHeader";
import SearchInput from "../../../components/dataTable/dataTableSearch";
import Datatable from "../../../components/dataTable";
import Footer from "../../../components/footer/footer";
import { all_routes } from "../../../routes/all_routes";

const Faq = () => {
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

  const data = FaqListData;
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
      title: "Questions",
      dataIndex: "Questions",
      sorter: (a: any, b: any) => a.Questions.length - b.Questions.length,
    },
    {
      title: "Category",
      dataIndex: "Category",
      sorter: (a: any, b: any) => a.Category.length - b.Category.length,
    },
    {
      title: "Answers",
      dataIndex: "Answers",
      sorter: (a: any, b: any) => a.Answers.length - b.Answers.length,
    },
    {
      title: "Created at",
      dataIndex: "Createdat",
      sorter: (a: any, b: any) => a.Createdat.length - b.Createdat.length,
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
              data-bs-target="#edit_faq"
            >
              <i className="ti ti-edit" /> Edit
            </Link>
            <Link
              className="dropdown-item"
              to="#"
              data-bs-toggle="modal"
              data-bs-target="#delete_faq"
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
            title="FAQ"
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
                data-bs-target="#add_faq"
              >
                <i className="ti ti-square-rounded-plus-filled me-1" />
                Add FAQ
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
        <Footer />
        {/* End Footer */}
      </div>
      {/* ========================
			End Page Content
		========================= */}
      <>
        {/* Add Testimonial */}
        <div className="modal fade" id="add_faq" role="dialog">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add FAQ</h5>
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
                      Category <span className="text-danger">*</span>
                    </label>
                    <input type="text" className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Question <span className="text-danger">*</span>
                    </label>
                    <input type="text" className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Answer <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      rows={4}
                      defaultValue={""}
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
                      Create New
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* /Add Testimonial  */}
        {/* Edit Testimonial */}
        <div className="modal fade" id="edit_faq" role="dialog">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit FAQ</h5>
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
                      Category <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      defaultValue="Service"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Question <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      defaultValue="How can I book a service"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Answer <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      rows={4}
                      defaultValue={
                        'Log in to your account. Go to the "Services" or "Bookings" page.'
                      }
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
                          id="active2"
                          name="status2"
                          defaultChecked
                        />
                        <label htmlFor="active2">Active</label>
                      </div>
                      <div>
                        <input
                          type="radio"
                          className="status-radio"
                          id="inactive2"
                          name="status2"
                        />
                        <label htmlFor="inactive2">Inactive</label>
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
        <div className="modal fade" id="delete_faq">
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
                  Are you sure you want to remove FAQ you selected.
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
                    to={all_routes.faq}
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

export default Faq;
