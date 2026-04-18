import { Link } from "react-router-dom";
import ImageWithBasePath from "../../../../components/imageWithBasePath";
import { all_routes } from "../../../../routes/all_routes";


const TablesBasic = () => {
  return (
    <>
  {/* ========================
			Start Page Content
		========================= */}
  <div className="page-wrapper">
    {/* Start Content */}
    <div className="content pb-0">
      {/* Page Header */}
      <div className="mb-4">
        <h4 className="mb-1">Table Basic</h4>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-0 p-0">
            <li className="breadcrumb-item">
              <Link to={all_routes.dealsDashboard}>Home</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="#">Base UI</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Table Basic
            </li>
          </ol>
        </nav>
      </div>
      {/* End Page Header */}
      {/* start row */}
      <div className="row">
        <div className="col-xl-6">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Basic Example</h4>
            </div>
            <div className="card-body">
              <p>
                For basic styling—light padding and only horizontal dividers—add
                the base class <code>.table</code> to any{" "}
                <code>&lt;table&gt;</code>.
              </p>
              <div className="table-responsive">
                <table className="table mb-0">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">
                        <div className="d-flex align-items-center">
                          <span className="avatar avatar-sm me-2 online avatar-rounded">
                            <ImageWithBasePath
                              src="assets/img/profiles/avatar-01.jpg"
                              alt="img"
                            />
                          </span>
                          Mark
                        </div>
                      </th>
                      <td>mark@example.com</td>
                      <td>
                        <span className="badge rounded-pill badge-soft-success">
                          Active
                        </span>
                      </td>
                      <td>
                        <div className="dropdown d-inline-block">
                          <Link
                            className="dropdown-toggle drop-arrow-none"
                            to="#"
                            role="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          >
                            <i className="ti ti-dots-vertical fs-18 text-muted" />
                          </Link>
                          <ul className="dropdown-menu dropdown-menu-right">
                            <li>
                              <Link className="dropdown-item" to="#">
                                Edit
                              </Link>
                            </li>
                            <li>
                              <Link className="dropdown-item" to="#">
                                Delete
                              </Link>
                            </li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">
                        <div className="d-flex align-items-center">
                          <span className="avatar avatar-sm me-2 online avatar-rounded">
                            <ImageWithBasePath
                              src="assets/img/profiles/avatar-02.jpg"
                              alt="img"
                            />
                          </span>
                          Jacob
                        </div>
                      </th>
                      <td>jacob@example.com</td>
                      <td>
                        <span className="badge rounded-pill badge-soft-danger">
                          Inactive
                        </span>
                      </td>
                      <td>
                        <div className="dropdown d-inline-block">
                          <Link
                            className="dropdown-toggle drop-arrow-none"
                            to="#"
                            role="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          >
                            <i className="ti ti-dots-vertical fs-18 text-muted" />
                          </Link>
                          <ul className="dropdown-menu dropdown-menu-right">
                            <li>
                              <Link className="dropdown-item" to="#">
                                Edit
                              </Link>
                            </li>
                            <li>
                              <Link className="dropdown-item" to="#">
                                Delete
                              </Link>
                            </li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">
                        <div className="d-flex align-items-center">
                          <span className="avatar avatar-sm me-2 online avatar-rounded">
                            <ImageWithBasePath
                              src="assets/img/profiles/avatar-04.jpg"
                              alt="img"
                            />
                          </span>
                          Larry
                        </div>
                      </th>
                      <td>larry@example.com</td>
                      <td>
                        <span className="badge rounded-pill badge-soft-success">
                          Active
                        </span>
                      </td>
                      <td>
                        <div className="dropdown d-inline-block">
                          <Link
                            className="dropdown-toggle drop-arrow-none"
                            to="#"
                            role="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          >
                            <i className="ti ti-dots-vertical fs-18 text-muted" />
                          </Link>
                          <ul className="dropdown-menu dropdown-menu-right">
                            <li>
                              <Link className="dropdown-item" to="#">
                                Edit
                              </Link>
                            </li>
                            <li>
                              <Link className="dropdown-item" to="#">
                                Delete
                              </Link>
                            </li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>{" "}
            {/* end card-body */}
          </div>{" "}
          {/* end card */}
        </div>{" "}
        {/* end col */}
        <div className="col-xl-6">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Dark Table</h4>
            </div>
            <div className="card-body">
              <p className="card-title-desc">
                You can also invert the colors—with light text on dark
                backgrounds—with <code>.table-dark</code>.
              </p>
              <div className="table-responsive">
                <table className="table table-dark mb-0">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">
                        <div className="d-flex align-items-center">
                          <span className="avatar avatar-sm me-2 online avatar-rounded">
                            <ImageWithBasePath
                              src="assets/img/profiles/avatar-01.jpg"
                              alt="img"
                            />
                          </span>
                          Mark
                        </div>
                      </th>
                      <td>mark@example.com</td>
                      <td>
                        <span className="badge bg-success">Active</span>
                      </td>
                      <td className="text-right">
                        <Link to="#">
                          <i className="ti ti-pencil text-success font-18" />
                        </Link>
                        <Link to="#">
                          <i className="ti ti-trash text-danger font-18" />
                        </Link>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">
                        <div className="d-flex align-items-center">
                          <span className="avatar avatar-sm me-2 online avatar-rounded">
                            <ImageWithBasePath
                              src="assets/img/profiles/avatar-02.jpg"
                              alt="img"
                            />
                          </span>
                          Jacob
                        </div>
                      </th>
                      <td>jacob@example.com</td>
                      <td>
                        <span className="badge bg-danger">Inactive</span>
                      </td>
                      <td className="text-right">
                        <Link to="#">
                          <i className="ti ti-pencil text-success font-18" />
                        </Link>
                        <Link to="#">
                          <i className="ti ti-trash text-danger font-18" />
                        </Link>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">
                        <div className="d-flex align-items-center">
                          <span className="avatar avatar-sm me-2 online avatar-rounded">
                            <ImageWithBasePath
                              src="assets/img/profiles/avatar-04.jpg"
                              alt="img"
                            />
                          </span>
                          Larry
                        </div>
                      </th>
                      <td>larry@example.com</td>
                      <td>
                        <span className="badge bg-success">Active</span>
                      </td>
                      <td className="text-right">
                        <Link to="#">
                          <i className="ti ti-pencil text-success font-18" />
                        </Link>
                        <Link to="#">
                          <i className="ti ti-trash text-danger font-18" />
                        </Link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>{" "}
            {/* end card-body */}
          </div>{" "}
          {/* end card */}
        </div>{" "}
        {/* end col */}
      </div>
      {/* end row */}
      {/* start row */}
      <div className="row">
        <div className="col-xl-6">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Table Head</h4>
            </div>
            <div className="card-body">
              <p className="card-title-desc">
                Use one of two modifier classes to make{" "}
                <code>&lt;thead&gt;</code>s appear light or dark gray.
              </p>
              <div className="table-responsive">
                <table className="table mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>First Name</th>
                      <th>Last Name</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">1</th>
                      <td>Mark</td>
                      <td>Otto</td>
                      <td>
                        <button type="button" className="btn btn-light btn-sm">
                          View
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">2</th>
                      <td>Jacob</td>
                      <td>Thornton</td>
                      <td>
                        <button type="button" className="btn btn-light btn-sm">
                          View
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">3</th>
                      <td>Larry</td>
                      <td>Dooley</td>
                      <td>
                        <button type="button" className="btn btn-light btn-sm">
                          View
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>{" "}
            {/* end card-body */}
          </div>{" "}
          {/* end card */}
        </div>{" "}
        {/* end col */}
        <div className="col-xl-6">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Striped Rows</h4>
            </div>
            <div className="card-body">
              <p className="card-title-desc">
                Use <code>.table-striped</code> to add zebra-striping to any
                table row within the <code>&lt;tbody&gt;</code>.
              </p>
              <div className="table-responsive">
                <table className="table table-striped mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>First Name</th>
                      <th>Last Name</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">1</th>
                      <td>Mark</td>
                      <td>Otto</td>
                      <td>
                        <button className="btn btn-sm btn-success">
                          <i className="ti ti-download me-1" />
                          Download
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">2</th>
                      <td>Jacob</td>
                      <td>Thornton</td>
                      <td>
                        <button className="btn btn-sm btn-success">
                          <i className="ti ti-download me-1" />
                          Download
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">3</th>
                      <td>Larry</td>
                      <td>Dooley</td>
                      <td>
                        <button className="btn btn-sm btn-success">
                          <i className="ti ti-download me-1" />
                          Download
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>{" "}
            {/* end card-body */}
          </div>{" "}
          {/* end card */}
        </div>{" "}
        {/* end col */}
      </div>
      {/* end row */}
      {/* start row */}
      <div className="row">
        <div className="col-xl-6">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Bordered Table</h4>
            </div>
            <div className="card-body">
              <p className="card-title-desc">
                Add <code>.table-bordered</code> for borders on all sides of the
                table and cells.
              </p>
              <div className="table-responsive">
                <table className="table table-bordered mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>First Name</th>
                      <th>Last Name</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">1</th>
                      <td>Mark</td>
                      <td>Otto</td>
                      <td>
                        <div className="d-inline-flex gap-2">
                          <Link
                            to="javascript:void(0);"
                            className="btn btn-icon btn-sm btn-soft-success rounded-pill"
                          >
                            <i className="ti ti-download" />
                          </Link>
                          <Link
                            to="javascript:void(0);"
                            className="btn btn-icon btn-sm btn-soft-info rounded-pill"
                          >
                            <i className="ti ti-edit" />
                          </Link>
                          <Link
                            to="javascript:void(0);"
                            className="btn btn-icon btn-sm btn-soft-danger rounded-pill"
                          >
                            <i className="ti ti-trash" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">2</th>
                      <td>Jacob</td>
                      <td>Thornton</td>
                      <td>
                        <div className="d-inline-flex gap-2">
                          <Link
                            to="javascript:void(0);"
                            className="btn btn-icon btn-sm btn-soft-success rounded-pill"
                          >
                            <i className="ti ti-download" />
                          </Link>
                          <Link
                            to="javascript:void(0);"
                            className="btn btn-icon btn-sm btn-soft-info rounded-pill"
                          >
                            <i className="ti ti-edit" />
                          </Link>
                          <Link
                            to="javascript:void(0);"
                            className="btn btn-icon btn-sm btn-soft-danger rounded-pill"
                          >
                            <i className="ti ti-trash" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">3</th>
                      <td>Larry</td>
                      <td>Dooley</td>
                      <td>
                        <div className="d-inline-flex gap-2">
                          <Link
                            to="javascript:void(0);"
                            className="btn btn-icon btn-sm btn-soft-success rounded-pill"
                          >
                            <i className="ti ti-download" />
                          </Link>
                          <Link
                            to="javascript:void(0);"
                            className="btn btn-icon btn-sm btn-soft-info rounded-pill"
                          >
                            <i className="ti ti-edit" />
                          </Link>
                          <Link
                            to="javascript:void(0);"
                            className="btn btn-icon btn-sm btn-soft-danger rounded-pill"
                          >
                            <i className="ti ti-trash" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>{" "}
            {/* end card-body */}
          </div>{" "}
          {/* end card */}
        </div>{" "}
        {/* end col */}
        <div className="col-xl-6">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Borderless Table</h4>
            </div>
            <div className="card-body">
              <p className="card-title-desc">
                {" "}
                Add <code>.table-borderless</code> for a table without borders.
              </p>
              <div className="table-responsive">
                <table className="table table-borderless mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>First Name</th>
                      <th>Last Name</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">1</th>
                      <td>Mark</td>
                      <td>Otto</td>
                      <td>
                        <div className="d-inline-flex gap-2">
                          <Link
                            to="javascript:void(0);"
                            className="btn btn-icon btn-sm btn-light"
                          >
                            <i className="ti ti-download" />
                          </Link>
                          <Link
                            to="javascript:void(0);"
                            className="btn btn-icon btn-sm btn-light"
                          >
                            <i className="ti ti-edit" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">2</th>
                      <td>Jacob</td>
                      <td>Thornton</td>
                      <td>
                        <div className="d-inline-flex gap-2">
                          <Link
                            to="javascript:void(0);"
                            className="btn btn-icon btn-sm btn-light"
                          >
                            <i className="ti ti-download" />
                          </Link>
                          <Link
                            to="javascript:void(0);"
                            className="btn btn-icon btn-sm btn-light"
                          >
                            <i className="ti ti-edit" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">3</th>
                      <td>Larry</td>
                      <td>Dooley</td>
                      <td>
                        <div className="d-inline-flex gap-2">
                          <Link
                            to="javascript:void(0);"
                            className="btn btn-icon btn-sm btn-light"
                          >
                            <i className="ti ti-download" />
                          </Link>
                          <Link
                            to="javascript:void(0);"
                            className="btn btn-icon btn-sm btn-light"
                          >
                            <i className="ti ti-edit" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>{" "}
            {/* end card-body */}
          </div>{" "}
          {/* end card */}
        </div>{" "}
        {/* end col */}
      </div>
      {/* end row */}
      {/* start row */}
      <div className="row">
        <div className="col-xl-6">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Table Border Color</h4>
            </div>
            <div className="card-body">
              <p className="card-title-desc">
                Add <code>.table-bordered</code> &amp; <code>.border-*</code>{" "}
                for colored borders on all sides of the table and cells.
              </p>
              <div className="table-responsive">
                <table className="table table-bordered border-primary mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>First Name</th>
                      <th>Last Name</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">1</th>
                      <td>Mark</td>
                      <td>Otto</td>
                      <td>
                        <div className="d-inline-flex gap-2">
                          <Link
                            to="javascript:void(0);"
                            className="btn btn-icon btn-sm btn-success"
                          >
                            <i className="ti ti-download" />
                          </Link>
                          <Link
                            to="javascript:void(0);"
                            className="btn btn-icon btn-sm btn-info"
                          >
                            <i className="ti ti-edit" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">2</th>
                      <td>Jacob</td>
                      <td>Thornton</td>
                      <td>
                        <div className="d-inline-flex gap-2">
                          <Link
                            to="javascript:void(0);"
                            className="btn btn-icon btn-sm btn-success"
                          >
                            <i className="ti ti-download" />
                          </Link>
                          <Link
                            to="javascript:void(0);"
                            className="btn btn-icon btn-sm btn-info"
                          >
                            <i className="ti ti-edit" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">3</th>
                      <td>Larry</td>
                      <td>Dooley</td>
                      <td>
                        <div className="d-inline-flex gap-2">
                          <Link
                            to="javascript:void(0);"
                            className="btn btn-icon btn-sm btn-success"
                          >
                            <i className="ti ti-download" />
                          </Link>
                          <Link
                            to="javascript:void(0);"
                            className="btn btn-icon btn-sm btn-info"
                          >
                            <i className="ti ti-edit" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>{" "}
            {/* end card-body */}
          </div>{" "}
          {/* end card */}
        </div>{" "}
        {/* end col */}
        <div className="col-xl-6">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Table Border Color</h4>
            </div>
            <div className="card-body">
              <p className="card-title-desc">
                Add <code>.table-bordered</code> &amp; <code>.border-*</code>{" "}
                for colored borders on all sides of the table and cells.
              </p>
              <div className="table-responsive">
                <table className="table table-bordered border-success mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>First Name</th>
                      <th>Last Name</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">1</th>
                      <td>Mark</td>
                      <td>Otto</td>
                      <td>
                        <button className="btn btn-sm btn-danger btn-wave waves-effect waves-light">
                          <i className="ti ti-trash me-1" />
                          Delete
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">2</th>
                      <td>Jacob</td>
                      <td>Thornton</td>
                      <td>
                        <button className="btn btn-sm btn-danger btn-wave waves-effect waves-light">
                          <i className="ti ti-trash me-1" />
                          Delete
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">3</th>
                      <td>Larry</td>
                      <td>Dooley</td>
                      <td>
                        <button className="btn btn-sm btn-danger btn-wave waves-effect waves-light">
                          <i className="ti ti-trash me-1" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>{" "}
            {/* end card-body */}
          </div>{" "}
          {/* end card */}
        </div>{" "}
        {/* end col */}
      </div>
      {/* end row */}
      {/* start row */}
      <div className="row">
        <div className="col-xl-6">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Vertical Alignment</h4>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <p className="card-title-desc">
                  Table cells in <code>&lt;tbody&gt;</code> inherit their
                  alignment from <code>&lt;table&gt;</code> and are aligned to
                  the the top by default. Use the vertical align classes to
                  re-align where needed.
                </p>
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th scope="row">1</th>
                        <td>Mark</td>
                        <td>Otto</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-light btn-sm"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">2</th>
                        <td>Jacob</td>
                        <td>Thornton</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-light btn-sm"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">3</th>
                        <td>Larry</td>
                        <td>Dooley</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-light btn-sm"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">4</th>
                        <td>Jacob</td>
                        <td>Thornton</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-light btn-sm"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>{" "}
            {/* end card-body */}
          </div>{" "}
          {/* end card */}
        </div>{" "}
        {/* end col */}
        <div className="col-xl-6">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Nesting</h4>
            </div>
            <div className="card-body">
              <p className="card-title-desc">
                {" "}
                Border styles, active styles, and table variants are not
                inherited by nested tables.
              </p>
              <div className="table-responsive">
                <table className="table table-striped table-bordered mb-0">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">First</th>
                      <th scope="col">Last</th>
                      <th scope="col">Handle</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">1</th>
                      <td>Mark</td>
                      <td>Otto</td>
                      <td>@mdo</td>
                    </tr>
                    <tr>
                      <td colSpan={4}>
                        <table className="table mb-0">
                          <thead>
                            <tr>
                              <th scope="col">Header</th>
                              <th scope="col">Header</th>
                              <th scope="col">Header</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <th scope="row">A</th>
                              <td>First</td>
                              <td>Last</td>
                            </tr>
                            <tr>
                              <th scope="row">B</th>
                              <td>First</td>
                              <td>Last</td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">3</th>
                      <td>Jacob</td>
                      <td>Thornton</td>
                      <td>@fat</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>{" "}
            {/* end card-body */}
          </div>{" "}
          {/* end card */}
        </div>{" "}
        {/* end col */}
      </div>
      {/* end row */}
      {/* start row */}
      <div className="row">
        <div className="col-xl-6">
          <div className="card card-h-100">
            <div className="card-header">
              <h4 className="card-title">Hoverable Rows</h4>
            </div>
            <div className="card-body">
              <p className="card-title-desc">
                Add <code>.table-hover</code> to enable a hover state on table
                rows within a <code>&lt;tbody&gt;</code>.
              </p>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>First Name</th>
                      <th>Last Name</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">1</th>
                      <td>Mark</td>
                      <td>Otto</td>
                      <td className="text-center text-muted">
                        <Link
                          to="javascript: void(0);"
                          className="link-reset fs-20 p-1"
                        >
                          {" "}
                          <i className="ti ti-trash" />
                        </Link>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">2</th>
                      <td>Jacob</td>
                      <td>Thornton</td>
                      <td className="text-center text-muted">
                        <Link
                          to="javascript: void(0);"
                          className="link-reset fs-20 p-1"
                        >
                          {" "}
                          <i className="ti ti-trash" />
                        </Link>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">3</th>
                      <td>Larry</td>
                      <td>Dooley</td>
                      <td className="text-center text-muted">
                        <Link
                          to="javascript: void(0);"
                          className="link-reset fs-20 p-1"
                        >
                          {" "}
                          <i className="ti ti-trash" />
                        </Link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>{" "}
            {/* end card-body */}
          </div>{" "}
          {/* end card */}
        </div>{" "}
        {/* end col */}
        <div className="col-xl-6">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Small Table</h4>
            </div>
            <div className="card-body">
              <p className="card-title-desc">
                {" "}
                Add <code>.table-sm</code> to make tables more compact by
                cutting cell padding in half.
              </p>
              <div className="table-responsive">
                <table className="table table-sm m-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>First Name</th>
                      <th>Last Name</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">1</th>
                      <td>Mark</td>
                      <td>Otto</td>
                      <td className="text-center text-muted">
                        <Link
                          to="javascript: void(0);"
                          className="link-reset fs-20 p-1"
                        >
                          {" "}
                          <i className="ti ti-settings" />
                        </Link>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">2</th>
                      <td>Jacob</td>
                      <td>Thornton</td>
                      <td className="text-center text-muted">
                        <Link
                          to="javascript: void(0);"
                          className="link-reset fs-20 p-1"
                        >
                          {" "}
                          <i className="ti ti-settings" />
                        </Link>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">3</th>
                      <td>Larry</td>
                      <td>Dooley</td>
                      <td className="text-center text-muted">
                        <Link
                          to="javascript: void(0);"
                          className="link-reset fs-20 p-1"
                        >
                          {" "}
                          <i className="ti ti-settings" />
                        </Link>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">4</th>
                      <td>Mark</td>
                      <td>Otto</td>
                      <td className="text-center text-muted">
                        <Link
                          to="javascript: void(0);"
                          className="link-reset fs-20 p-1"
                        >
                          {" "}
                          <i className="ti ti-settings" />
                        </Link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>{" "}
            {/* end card-body */}
          </div>{" "}
          {/* end card */}
        </div>{" "}
        {/* end col */}
      </div>
      {/* end row */}
      {/* start row */}
      <div className="row">
        <div className="col-xl-6">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Contextual Classes</h4>
            </div>
            <div className="card-body">
              <p className="card-title-desc">
                Use contextual classes to color table rows or individual cells.
              </p>
              <div className="table-responsive">
                <table className="table mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Column heading</th>
                      <th>Column heading</th>
                      <th>Column heading</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="table-light">
                      <th scope="row">1</th>
                      <td>Column content</td>
                      <td>Column content</td>
                      <td>Column content</td>
                    </tr>
                    <tr className="table-success">
                      <th scope="row">2</th>
                      <td>Column content</td>
                      <td>Column content</td>
                      <td>Column content</td>
                    </tr>
                    <tr className="table-info">
                      <th scope="row">3</th>
                      <td>Column content</td>
                      <td>Column content</td>
                      <td>Column content</td>
                    </tr>
                    <tr className="table-warning">
                      <th scope="row">4</th>
                      <td>Column content</td>
                      <td>Column content</td>
                      <td>Column content</td>
                    </tr>
                    <tr className="table-danger">
                      <th scope="row">5</th>
                      <td>Column content</td>
                      <td>Column content</td>
                      <td>Column content</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>{" "}
            {/* end card-body */}
          </div>{" "}
          {/* end card */}
        </div>{" "}
        {/* end col */}
        <div className="col-xl-6">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Captions</h4>
            </div>
            <div className="card-body">
              <p className="card-title-desc">
                A <code>&lt;caption&gt;</code> functions like a heading for a
                table. It helps users with screen readers to find a table and
                understand what it’s about and decide if they want to read it.
              </p>
              <div className="table-responsive">
                <table className="table mb-0">
                  <caption>List of users</caption>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>First Name</th>
                      <th>Last Name</th>
                      <th>Handle</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">1</th>
                      <td>Mark</td>
                      <td>Otto</td>
                      <td>@mdo</td>
                    </tr>
                    <tr>
                      <th scope="row">2</th>
                      <td>Jacob</td>
                      <td>Thornton</td>
                      <td>@fat</td>
                    </tr>
                    <tr>
                      <th scope="row">3</th>
                      <td>Larry</td>
                      <td>Dooley</td>
                      <td>@twitter</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>{" "}
            {/* end card-body */}
          </div>{" "}
          {/* end card */}
        </div>{" "}
        {/* end col */}
      </div>
      {/* end row */}
      {/* start row */}
      <div className="row">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Responsive Table</h4>
            </div>
            <div className="card-body">
              <p className="card-title-desc">
                Create responsive tables by wrapping any <code>.table</code> in{" "}
                <code>.table-responsive</code> to make them scroll horizontally
                on small devices (under 768px).
              </p>
              <div className="table-responsive">
                <table className="table mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Invoice No</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Payment Mode</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">1</th>
                      <td>
                        <h6 className="mb-0 fs-14 fw-semibold"> #INV368967</h6>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar avatar-md me-2 avatar-rounded">
                            <ImageWithBasePath
                              src="assets/img/profiles/avatar-03.jpg"
                              alt="img"
                            />
                          </div>
                          <h6 className="mb-0 fs-14 fw-semibold">
                            Laura Biding
                          </h6>
                        </div>
                      </td>
                      <td>13 May 2025</td>
                      <td>
                        <span className="fw-semibold">$950</span>
                      </td>
                      <td>
                        <h6 className="mb-0 fs-14 fw-semibold">
                          Cash on Delivery
                        </h6>
                      </td>
                      <td>
                        <span className="badge badge-boxed  badge-outline-warning">
                          Pending
                        </span>
                      </td>
                      <td>
                        <Link
                          to="javascript: void(0);"
                          className="link-reset fs-18 p-1"
                        >
                          {" "}
                          <i className="ti ti-pencil" />
                        </Link>
                        <Link
                          to="javascript: void(0);"
                          className="link-reset fs-18 p-1"
                        >
                          {" "}
                          <i className="ti ti-trash" />
                        </Link>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">2</th>
                      <td>
                        <h6 className="mb-0 fs-14 fw-semibold"> #INV368967</h6>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar avatar-md me-2 avatar-rounded">
                            <ImageWithBasePath
                              src="assets/img/profiles/avatar-04.jpg"
                              alt="img"
                            />
                          </div>
                          <h6 className="mb-0 fs-14 fw-semibold">
                            Justin Gaethje
                          </h6>
                        </div>
                      </td>
                      <td>13 May 2025</td>
                      <td>
                        <span className="fw-semibold">$950</span>
                      </td>
                      <td>
                        <h6 className="mb-0 fs-14 fw-semibold">
                          Online Payment
                        </h6>
                      </td>
                      <td>
                        <span className="badge badge-outline-danger">
                          Cancelled
                        </span>
                      </td>
                      <td>
                        <Link
                          to="javascript: void(0);"
                          className="link-reset fs-18 p-1"
                        >
                          {" "}
                          <i className="ti ti-pencil" />
                        </Link>
                        <Link
                          to="javascript: void(0);"
                          className="link-reset fs-18 p-1"
                        >
                          {" "}
                          <i className="ti ti-trash" />
                        </Link>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">3</th>
                      <td>
                        <h6 className="mb-0 fs-14 fw-semibold"> #INV368967</h6>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar avatar-md me-2 avatar-rounded">
                            <ImageWithBasePath
                              src="assets/img/profiles/avatar-06.jpg"
                              alt="img"
                            />
                          </div>
                          <h6 className="mb-0 fs-14 fw-semibold">
                            Simon Cohen
                          </h6>
                        </div>
                      </td>
                      <td>13 May 2025</td>
                      <td>
                        <span className="fw-semibold">$950</span>
                      </td>
                      <td>
                        <h6 className="mb-0 fs-14 fw-semibold">Cheque</h6>
                      </td>
                      <td>
                        <span className="badge badge-outline-success">
                          Completed
                        </span>
                      </td>
                      <td>
                        <Link
                          to="javascript: void(0);"
                          className="link-reset fs-18 p-1"
                        >
                          {" "}
                          <i className="ti ti-pencil" />
                        </Link>
                        <Link
                          to="javascript: void(0);"
                          className="link-reset fs-18 p-1"
                        >
                          {" "}
                          <i className="ti ti-trash" />
                        </Link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>{" "}
            {/* end card-body */}
          </div>{" "}
          {/* end card */}
        </div>{" "}
        {/* end col */}
      </div>
      {/* end row */}
    </div>
    {/* End Content */}
    {/* Start Footer */}
    <footer className="footer d-block d-md-flex justify-content-between text-md-start text-center">
      <p className="mb-md-0 mb-1">
        Copyright ©{" "}
        <Link
          to="javascript:void(0);"
          className="link-primary text-decoration-underline"
        >
          CRMS
        </Link>
      </p>
      <div className="d-flex align-items-center gap-2 footer-links justify-content-center justify-content-md-end">
        <Link to="javascript:void(0);">About</Link>
        <Link to="javascript:void(0);">Terms</Link>
        <Link to="javascript:void(0);">Contact Us</Link>
      </div>
    </footer>
    {/* End Footer */}
  </div>
  {/* ========================
			End Page Content
		========================= */}
</>

  );
};

export default TablesBasic;
