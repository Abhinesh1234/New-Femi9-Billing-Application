import { Link } from "react-router";
import Footer from "../../../../components/footer/footer";
import PageHeader from "../../../../components/page-header/pageHeader";
import { useState } from "react";
import { BlogCategoriesListData } from "../../../../core/json/blogCategoriesListData";
import SearchInput from "../../../../components/dataTable/dataTableSearch";
import PredefinedDatePicker from "../../../../components/common-dateRangePicker/PredefinedDatePicker";
import Datatable from "../../../../components/dataTable";
import { all_routes } from "../../../../routes/all_routes";
import CommonDatePicker from "../../../../components/common-datePicker/commonDatePicker";

const BlogCategories = () => {
  const [searchText, setSearchText] = useState<string>("");
  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const data = BlogCategoriesListData;
  const columns = [
    {
      title: "Category Name",
      dataIndex: "Category_Name",
      sorter: (a: any, b: any) =>
        a.Category_Name.length - b.Category_Name.length,
    },
    {
      title: "Created Date",
      dataIndex: "Created_Date",
      sorter: (a: any, b: any) => a.Created_Date.length - b.Created_Date.length,
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
          {text}
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
            className="action-icon btn btn-xs shadow d-inline-flex btn-outline-light"
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
              data-bs-target="#edit_categories"
            >
              <i className="ti ti-edit text-blue" /> Edit
            </Link>
            <Link
              className="dropdown-item"
              to="#"
              data-bs-toggle="modal"
              data-bs-target="#delete_categories"
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
            title="Blog Categories"
            badgeCount={false}
            moduleTitle="BLogs"
            showModuleTile={true}
            showExport={true}
          />
          {/* End Page Header */}
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
                data-bs-target="#add_categories"
              >
                <i className="ti ti-square-rounded-plus-filled me-1" />
                Add Blog Category
              </Link>
            </div>
            <div className="card-body">
              {/* table header */}
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <PredefinedDatePicker/>
                </div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <div className="dropdown">
                    <Link
                      to="#"
                      className="dropdown-toggle btn btn-outline-light px-2 shadow"
                      data-bs-toggle="dropdown"
                    >
                      <i className="ti ti-sort-ascending-2 me-2" />
                      Sort By
                    </Link>
                    <div className="dropdown-menu">
                      <ul>
                        <li>
                          <Link to="#" className="dropdown-item">
                            Newest
                          </Link>
                        </li>
                        <li>
                          <Link to="#" className="dropdown-item">
                            Oldest
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              {/* table header */}
              {/* Contact Stage List */}
              <div className="custom-table">
                <Datatable
                  columns={columns}
                  dataSource={data}
                  Selection={true}
                  searchText={searchText}
                />
              </div>
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

      {/* Add New Source */}
      <div className="modal fade" id="add_categories" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add Blog Category</h5>
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
                <div className="mb-0">
                  <label className="form-label">
                    Created Date <span className="text-danger">*</span>
                  </label>
                  <div className="input-group w-auto input-group-flat">
                   <CommonDatePicker placeholder="dd/mm/yyyy" />
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
      {/* /Add New Source */}
      {/* Edit Source */}
      <div className="modal fade" id="edit_categories" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Blog Category</h5>
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
                    defaultValue="Sales Optimization"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Created Date <span className="text-danger">*</span>
                  </label>
                  <div className="input-group w-auto input-group-flat">
                   <CommonDatePicker placeholder="dd/mm/yyyy" />
                  </div>
                </div>
                <div className="mb-0">
                  <label className="form-label">Status</label>
                  <div className="d-flex align-items-center">
                    <div className="me-2">
                      <input
                        type="radio"
                        className="status-radio"
                        id="edit-active"
                        name="status"
                        defaultChecked
                      />
                      <label htmlFor="edit-active">Active</label>
                    </div>
                    <div>
                      <input
                        type="radio"
                        className="status-radio"
                        id="edit-inactive"
                        name="status"
                      />
                      <label htmlFor="edit-inactive">Inactive</label>
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
      {/* /Edit Source */}
      {/* Delete Source */}
      <div className="modal fade" id="delete_categories" role="dialog">
        <div className="modal-dialog modal-dialog-centered modal-sm">
          <div className="modal-content">
            <div className="modal-body">
              <div className="text-center">
                <div className="avatar avatar-xl bg-danger-light rounded-circle mb-3">
                  <i className="ti ti-trash-x fs-36 text-danger" />
                </div>
                <h4 className="mb-2">Delete Confirmation</h4>
                <p className="mb-0">
                  Are you sure you want to remove blog category you selected.
                </p>
                <div className="d-flex align-items-center justify-content-center mt-4">
                  <Link
                    to="#"
                    className="btn btn-light me-2"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </Link>
                  <Link
                    to={all_routes.blogCategories}
                    className="btn btn-danger"
                  >
                    Yes, Delete it
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Delete Source */}
    </>
  );
};

export default BlogCategories;
