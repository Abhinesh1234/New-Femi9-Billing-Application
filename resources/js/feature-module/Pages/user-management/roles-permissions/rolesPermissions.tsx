import { Link } from "react-router";
import Footer from "../../../../components/footer/footer";
import PageHeader from "../../../../components/page-header/pageHeader";
import SearchInput from "../../../../components/dataTable/dataTableSearch";
import { useState } from "react";
import { RolesPermissionsListData } from "../../../../core/json/rolesPermissionsListData";
import Datatable from "../../../../components/dataTable";
import { all_routes } from "../../../../routes/all_routes";

const RolesPermissions = () => {
  const data = RolesPermissionsListData;
  const columns = [
    {
      title: "Role Name",
      dataIndex: "RoleName",
      sorter: (a: any, b: any) => a.RoleName.length - b.RoleName.length,
    },
    {
      title: "Created",
      dataIndex: "Created",

      sorter: (a: any, b: any) => a.Created.length - b.Created.length,
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
              data-bs-target="#edit_role"
            >
              <i className="ti ti-edit text-blue" /> Edit
            </Link>
            <Link className="dropdown-item" to={all_routes.permissions}>
              <i className="ti ti-shield" /> Permission
            </Link>
          </div>
        </div>
      ),
      sorter: (a: any, b: any) => a.Action.length - b.Action.length,
    },
  ];

  const [searchText, setSearchText] = useState<string>("");

  const handleSearch = (value: string) => {
    setSearchText(value);
  };
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
            title="Roles & Permissions"
            badgeCount={152}
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
                data-bs-target="#add_role"
              >
                <i className="ti ti-square-rounded-plus-filled me-1" />
                Add New Role
              </Link>
            </div>
            <div className="card-body">
              {/* Contact List */}
              <div className="table-responsive custom-table">
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
  {/* Add Role */}
  <div className="modal fade" id="add_role" role="dialog">
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Add Role</h5>
          <button
            className="btn-close custom-btn-close border p-1 me-0 text-dark"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <form action="roles-permissions.html">
          <div className="modal-body">
            <div className="mb-0">
              <label className="form-label">
                Role Name <span className="text-danger">*</span>
              </label>
              <input type="text" className="form-control" />
            </div>
          </div>
          <div className="modal-footer">
            <div className="d-flex align-items-center justify-content-end m-0">
              <a
                href="#"
                className="btn btn-light me-2"
                data-bs-dismiss="modal"
              >
                Cancel
              </a>
              <button type="submit" className="btn btn-primary">
                Create
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
  {/* /Add Role */}
  {/* Edit Role */}
  <div className="modal fade" id="edit_role" role="dialog">
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Edit Role</h5>
          <button
            className="btn-close custom-btn-close border p-1 me-0 text-dark"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <form action="roles-permissions.html">
          <div className="modal-body">
            <div className="mb-0">
              <label className="form-label">
                Role Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                defaultValue="Admin"
              />
            </div>
          </div>
          <div className="modal-footer">
            <div className="d-flex align-items-center justify-content-end m-0">
              <a
                href="#"
                className="btn btn-light me-2"
                data-bs-dismiss="modal"
              >
                Cancel
              </a>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
  {/* /Edit Role */}
</>

    </>
  );
};

export default RolesPermissions;
