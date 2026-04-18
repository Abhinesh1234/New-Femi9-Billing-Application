import { useState } from "react";
import { ContactMessageListData } from "../../../../core/json/contactMessageListData";
import { Link } from "react-router";
import ImageWithBasePath from "../../../../components/imageWithBasePath";
import PageHeader from "../../../../components/page-header/pageHeader";
import SearchInput from "../../../../components/dataTable/dataTableSearch";
import PredefinedDatePicker from "../../../../components/common-dateRangePicker/PredefinedDatePicker";
import Footer from "../../../../components/footer/footer";
import Datatable from "../../../../components/dataTable";
import CommonPhoneInput from "../../../../components/common-phoneInput/commonPhoneInput";
import { all_routes } from "../../../../routes/all_routes";


const ContactMessages = () => {
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

  const data = ContactMessageListData;
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
      title: "Name",
      dataIndex: "Name",
      render:(text:any,render:any) =>(
        <h6 className="d-flex align-items-center fs-14 fw-medium mb-0">
  <Link to="#" className="avatar me-2">
    <ImageWithBasePath
      className="img-fluid rounded-circle"
      src={`assets/img/profiles/${render.Image}`}
      alt="User Image"
    />
  </Link>
  <Link to="#" className="d-flex flex-column">
   {text}{" "}
    <span className="text-body fs-13 fw-normal mt-1">{render.Role}</span>
  </Link>
</h6>

      ),
      sorter: (a: any, b: any) => a.Name.length - b.Name.length,
    },
    {
      title: "Phone",
      dataIndex: "Phone",
      sorter: (a: any, b: any) => a.Phone.length - b.Phone.length,
    },
    {
      title: "Email",
      dataIndex: "Email",
      sorter: (a: any, b: any) => a.Email.length - b.Email.length,
    },
    {
      title: "Message",
      dataIndex: "Message",
      sorter: (a: any, b: any) => a.Message.length - b.Message.length,
    },
    {
      title: "Created",
      dataIndex: "Created",
      sorter: (a: any, b: any) => a.Created.length - b.Created.length,
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
      data-bs-target="#edit_contact"
    >
      <i className="ti ti-edit text-blue" /> Edit
    </Link>
    <Link
      className="dropdown-item"
      to="#"
      data-bs-toggle="modal"
      data-bs-target="#delete_contact"
    >
      <i className="ti ti-trash" /> Delete
    </Link>
  </div>
</div>

      ),
      sorter: (a: any, b: any) => a.Action.length - b.Action.length,
    },
  ];

  const [phone, setPhone] = useState<string | undefined>();
  const [phone2, setPhone2] = useState<string | undefined>();

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
                  title="Contact Messages"
                  badgeCount={125}
                  showModuleTile={false}
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
            data-bs-target="#add_contact"
          >
            <i className="ti ti-square-rounded-plus-filled me-1" />
            Add Contact Message
          </Link>
        </div>
        <div className="card-body">
          {/* table header */}
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <div className="dropdown">
                <Link
                  to="#"
                  className="btn btn-outline-light shadow px-2"
                  data-bs-toggle="dropdown"
                  data-bs-auto-close="outside"
                >
                  <i className="ti ti-filter me-2" />
                  Filter
                  <i className="ti ti-chevron-down ms-2" />
                </Link>
                <div className="filter-dropdown-menu dropdown-menu dropdown-menu-lg p-0">
                  <div className="filter-header d-flex align-items-center justify-content-between border-bottom">
                    <h6 className="mb-0">
                      <i className="ti ti-filter me-1" />
                      Filter
                    </h6>
                    <button
                      type="button"
                      className="btn-close close-filter-btn"
                      data-bs-dismiss="dropdown-menu"
                      aria-label="Close"
                    />
                  </div>
                  <div className="filter-set-view p-3">
                    <div className="accordion" id="accordionExample">
                      <div className="filter-set-content">
                        <div className="filter-set-content-head">
                          <Link
                            to="#"
                            data-bs-toggle="collapse"
                            data-bs-target="#collapseTwo"
                            aria-expanded="true"
                            aria-controls="collapseTwo"
                          >
                            Name
                          </Link>
                        </div>
                        <div
                          className="filter-set-contents accordion-collapse collapse show"
                          id="collapseTwo"
                          data-bs-parent="#accordionExample"
                        >
                          <div className="filter-content-list bg-light rounded border p-2 shadow mt-2">
                            <div className="mb-2">
                              <div className="input-icon-start input-icon position-relative">
                                <span className="input-icon-addon fs-12">
                                  <i className="ti ti-search" />
                                </span>
                                <input
                                  type="text"
                                  className="form-control form-control-md"
                                  placeholder="Search"
                                />
                              </div>
                            </div>
                            <ul className="mb-0">
                              <li className="mb-1">
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  <span className="avatar avatar-xs rounded-circle me-2">
                                    <ImageWithBasePath
                                      src="assets/img/users/user-06.jpg"
                                      className="flex-shrink-0 rounded-circle"
                                      alt="img"
                                    />
                                  </span>
                                  Elizabeth Morgan
                                </label>
                              </li>
                              <li className="mb-1">
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  <span className="avatar avatar-xs rounded-circle me-2">
                                    <ImageWithBasePath
                                      src="assets/img/users/user-40.jpg"
                                      className="flex-shrink-0 rounded-circle"
                                      alt="img"
                                    />
                                  </span>
                                  Katherine Brooks
                                </label>
                              </li>
                              <li className="mb-1">
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  <span className="avatar avatar-xs rounded-circle me-2">
                                    <ImageWithBasePath
                                      src="assets/img/users/user-05.jpg"
                                      className="flex-shrink-0 rounded-circle"
                                      alt="img"
                                    />
                                  </span>
                                  Sophia Lopez
                                </label>
                              </li>
                              <li className="mb-1">
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  <span className="avatar avatar-xs rounded-circle me-2">
                                    <ImageWithBasePath
                                      src="assets/img/users/user-10.jpg"
                                      className="flex-shrink-0 rounded-circle"
                                      alt="img"
                                    />
                                  </span>
                                  John Michael
                                </label>
                              </li>
                              <li className="mb-1">
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  <span className="avatar avatar-xs rounded-circle me-2">
                                    <ImageWithBasePath
                                      src="assets/img/users/user-15.jpg"
                                      className="flex-shrink-0 rounded-circle"
                                      alt="img"
                                    />
                                  </span>
                                  Natalie Brooks
                                </label>
                              </li>
                              <li className="mb-1">
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  <span className="avatar avatar-xs rounded-circle me-2">
                                    <ImageWithBasePath
                                      src="assets/img/users/user-01.jpg"
                                      className="flex-shrink-0 rounded-circle"
                                      alt="img"
                                    />
                                  </span>
                                  William Turner
                                </label>
                              </li>
                              <li className="mb-1">
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  <span className="avatar avatar-xs rounded-circle me-2">
                                    <ImageWithBasePath
                                      src="assets/img/users/user-13.jpg"
                                      className="flex-shrink-0 rounded-circle"
                                      alt="img"
                                    />
                                  </span>
                                  Ava Martinez
                                </label>
                              </li>
                              <li className="mb-1">
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  <span className="avatar avatar-xs rounded-circle me-2">
                                    <ImageWithBasePath
                                      src="assets/img/users/user-12.jpg"
                                      className="flex-shrink-0 rounded-circle"
                                      alt="img"
                                    />
                                  </span>
                                  Nathan Reed
                                </label>
                              </li>
                              <li className="mb-1">
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  <span className="avatar avatar-xs rounded-circle me-2">
                                    <ImageWithBasePath
                                      src="assets/img/users/user-03.jpg"
                                      className="flex-shrink-0 rounded-circle"
                                      alt="img"
                                    />
                                  </span>
                                  Lily Anderson
                                </label>
                              </li>
                              <li className="mb-1">
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  <span className="avatar avatar-xs rounded-circle me-2">
                                    <ImageWithBasePath
                                      src="assets/img/users/user-18.jpg"
                                      className="flex-shrink-0 rounded-circle"
                                      alt="img"
                                    />
                                  </span>
                                  Ryan Coleman
                                </label>
                              </li>
                              <li>
                                <Link
                                  to="#"
                                  className="link-primary text-decoration-underline p-2 d-flex"
                                >
                                  Load More
                                </Link>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="filter-set-content">
                        <div className="filter-set-content-head">
                          <Link
                            to="#"
                            className="collapsed"
                            data-bs-toggle="collapse"
                            data-bs-target="#collapseThree"
                            aria-expanded="false"
                            aria-controls="collapseThree"
                          >
                            Phone
                          </Link>
                        </div>
                        <div
                          className="filter-set-contents accordion-collapse collapse"
                          id="collapseThree"
                          data-bs-parent="#accordionExample"
                        >
                          <div className="filter-content-list bg-light rounded border p-2 shadow mt-2">
                            <ul>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  +1 87545 54503
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  +1 98975 17485
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  +1 54655 25455
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  +1 45447 58787
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  +1 12454 27845
                                </label>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="filter-set-content">
                        <div className="filter-set-content-head">
                          <Link
                            to="#"
                            className="collapsed"
                            data-bs-toggle="collapse"
                            data-bs-target="#owner"
                            aria-expanded="false"
                            aria-controls="owner"
                          >
                            Email
                          </Link>
                        </div>
                        <div
                          className="filter-set-contents accordion-collapse collapse"
                          id="owner"
                          data-bs-parent="#accordionExample"
                        >
                          <div className="filter-content-list bg-light rounded border p-2 shadow mt-2">
                            <div className="mb-1">
                              <div className="input-icon-start input-icon position-relative">
                                <span className="input-icon-addon fs-12">
                                  <i className="ti ti-search" />
                                </span>
                                <input
                                  type="text"
                                  className="form-control form-control-md"
                                  placeholder="Search"
                                />
                              </div>
                            </div>
                            <ul className="mb-0">
                              <li className="mb-1">
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  elizabeth@example.com
                                </label>
                              </li>
                              <li className="mb-1">
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  katherine@example.com
                                </label>
                              </li>
                              <li className="mb-1">
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  samantha@example.com
                                </label>
                              </li>
                              <li className="mb-1">
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  william@example.com
                                </label>
                              </li>
                              <li className="mb-1">
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  jonathan@example.com
                                </label>
                              </li>
                              <li>
                                <Link
                                  to="#"
                                  className="link-primary text-decoration-underline p-2 pt-0 d-flex"
                                >
                                  Load More
                                </Link>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="filter-set-content">
                        <div className="filter-set-content-head">
                          <Link
                            to="#"
                            className="collapsed"
                            data-bs-toggle="collapse"
                            data-bs-target="#collapseFive"
                            aria-expanded="false"
                            aria-controls="collapseFive"
                          >
                            Created Date
                          </Link>
                        </div>
                        <div
                          className="filter-set-contents accordion-collapse collapse"
                          id="collapseFive"
                          data-bs-parent="#accordionExample"
                        >
                          <div className="filter-content-list bg-light rounded border p-2 shadow mt-2">
                            <div
                              id="reportrange"
                              className="reportrange-picker d-flex align-items-center shadow"
                            >
                              <i className="ti ti-calendar-due text-dark fs-14 me-1" />
                              <PredefinedDatePicker/>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="filter-set-content">
                        <div className="filter-set-content-head">
                          <Link
                            to="#"
                            className="collapsed"
                            data-bs-toggle="collapse"
                            data-bs-target="#collapseOne"
                            aria-expanded="false"
                            aria-controls="collapseOne"
                          >
                            Rating
                          </Link>
                        </div>
                        <div
                          className="filter-set-contents accordion-collapse collapse"
                          id="collapseOne"
                          data-bs-parent="#accordionExample"
                        >
                          <div className="filter-content-list bg-light rounded border p-2 shadow mt-2">
                            <ul>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  <span className="rating">
                                    <i className="ti ti-star-filled text-warning" />
                                    <i className="ti ti-star-filled text-warning" />
                                    <i className="ti ti-star-filled text-warning" />
                                    <i className="ti ti-star-filled text-warning" />
                                    <i className="ti ti-star-filled text-warning" />
                                    <span className="ms-1">5.0</span>
                                  </span>
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  <span className="rating">
                                    <i className="ti ti-star-filled text-warning" />
                                    <i className="ti ti-star-filled text-warning" />
                                    <i className="ti ti-star-filled text-warning" />
                                    <i className="ti ti-star-filled text-warning" />
                                    <i className="ti ti-star-filled" />
                                    <span className="ms-1">4.0</span>
                                  </span>
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  <span className="rating">
                                    <i className="ti ti-star-filled text-warning" />
                                    <i className="ti ti-star-filled text-warning" />
                                    <i className="ti ti-star-filled text-warning" />
                                    <i className="ti ti-star-filled" />
                                    <i className="ti ti-star-filled" />
                                    <span className="ms-1">3.0</span>
                                  </span>
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  <span className="rating">
                                    <i className="ti ti-star-filled text-warning" />
                                    <i className="ti ti-star-filled text-warning" />
                                    <i className="ti ti-star-filled" />
                                    <i className="ti ti-star-filled" />
                                    <i className="ti ti-star-filled" />
                                    <span className="ms-1">2.0</span>
                                  </span>
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  <span className="rating">
                                    <i className="ti ti-star-filled text-warning" />
                                    <i className="ti ti-star-filled" />
                                    <i className="ti ti-star-filled" />
                                    <i className="ti ti-star-filled" />
                                    <i className="ti ti-star-filled" />
                                    <span className="ms-1">1.0</span>
                                  </span>
                                </label>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="filter-set-content">
                        <div className="filter-set-content-head">
                          <Link
                            to="#"
                            className="collapsed"
                            data-bs-toggle="collapse"
                            data-bs-target="#Status"
                            aria-expanded="false"
                            aria-controls="Status"
                          >
                            Status
                          </Link>
                        </div>
                        <div
                          className="filter-set-contents accordion-collapse collapse"
                          id="Status"
                          data-bs-parent="#accordionExample"
                        >
                          <div className="filter-content-list bg-light rounded border p-2 shadow mt-2">
                            <ul>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Active
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Inactive
                                </label>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <Link
                        to="#"
                        className="btn btn-outline-light w-100"
                      >
                        Reset
                      </Link>
                      <Link
                        to={all_routes.contactMessages}
                        className="btn btn-primary w-100"
                      >
                        Filter
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
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
              <div className="dropdown">
                <Link
                  to="#"
                  className="btn bg-soft-indigo px-2 border-0"
                  data-bs-toggle="dropdown"
                  data-bs-auto-close="outside"
                >
                  <i className="ti ti-columns-3 me-2" />
                  Manage Columns
                </Link>
                <div className="dropdown-menu dropdown-menu-md dropdown-md p-3">
                  <ul>
                    <li className="gap-1 d-flex align-items-center mb-2">
                      <i className="ti ti-columns me-1" />
                      <div className="form-check form-switch w-100 ps-0">
                        <label className="form-check-label d-flex align-items-center gap-2 w-100">
                          <span>Name</span>
                          <input
                            className="form-check-input switchCheckDefault ms-auto"
                            type="checkbox"
                            role="switch"
                            defaultChecked
                          />
                        </label>
                      </div>
                    </li>
                    <li className="gap-1 d-flex align-items-center mb-2">
                      <i className="ti ti-columns me-1" />
                      <div className="form-check form-switch w-100 ps-0">
                        <label className="form-check-label d-flex align-items-center gap-2 w-100">
                          <span>Phone</span>
                          <input
                            className="form-check-input switchCheckDefault ms-auto"
                            type="checkbox"
                            role="switch"
                            defaultChecked
                          />
                        </label>
                      </div>
                    </li>
                    <li className="gap-1 d-flex align-items-center mb-2">
                      <i className="ti ti-columns me-1" />
                      <div className="form-check form-switch w-100 ps-0">
                        <label className="form-check-label d-flex align-items-center gap-2 w-100">
                          <span>Email</span>
                          <input
                            className="form-check-input switchCheckDefault ms-auto"
                            type="checkbox"
                            role="switch"
                            defaultChecked
                          />
                        </label>
                      </div>
                    </li>
                    <li className="gap-1 d-flex align-items-center mb-2">
                      <i className="ti ti-columns me-1" />
                      <div className="form-check form-switch w-100 ps-0">
                        <label className="form-check-label d-flex align-items-center gap-2 w-100">
                          <span>Message</span>
                          <input
                            className="form-check-input switchCheckDefault ms-auto"
                            type="checkbox"
                            role="switch"
                            defaultChecked
                          />
                        </label>
                      </div>
                    </li>
                    <li className="gap-1 d-flex align-items-center mb-2">
                      <i className="ti ti-columns me-1" />
                      <div className="form-check form-switch w-100 ps-0">
                        <label className="form-check-label d-flex align-items-center gap-2 w-100">
                          <span>Created Date</span>
                          <input
                            className="form-check-input switchCheckDefault ms-auto"
                            type="checkbox"
                            role="switch"
                          />
                        </label>
                      </div>
                    </li>
                    <li className="gap-1 d-flex align-items-center mb-2">
                      <i className="ti ti-columns me-1" />
                      <div className="form-check form-switch w-100 ps-0">
                        <label className="form-check-label d-flex align-items-center gap-2 w-100">
                          <span>Status</span>
                          <input
                            className="form-check-input switchCheckDefault ms-auto"
                            type="checkbox"
                            role="switch"
                            defaultChecked
                          />
                        </label>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          {/* table header */}
          {/* Contact Stage List */}
          <div className=" custom-table">
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
    <Footer/>
    {/* End Footer */}
  </div>
  {/* ========================
			End Page Content
		========================= */}
  {/* Add New Source */}
  <div className="modal fade" id="add_contact" role="dialog">
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Add New Contact Message</h5>
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
                Name <span className="text-danger">*</span>
              </label>
              <input type="text" className="form-control" />
            </div>
            {/* start row */}
            <div className="row">
              <div className="col-lg-6">
                <div className="mb-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <label className="form-label">
                      Email <span className="text-danger">*</span>
                    </label>
                    <div className="form-check form-switch mb-1">
                      <label className="form-check-label d-flex align-items-center gap-2">
                        <span>Email Opt Out</span>
                        <input
                          className="form-check-input form-check-input-sm switchCheckDefault ms-auto"
                          type="checkbox"
                          role="switch"
                          defaultChecked
                        />
                      </label>
                    </div>
                  </div>
                  <input type="text" className="form-control" />
                </div>
              </div>
              {/* end col */}
              <div className="col-lg-6">
                <div className="mb-3">
                  <label className="form-label">
                    Phone <span className="text-danger">*</span>
                  </label>
                 <CommonPhoneInput
                            value={phone}
                            onChange={setPhone}
                            placeholder="(201) 555-0123"
                          />
                </div>
              </div>
              {/* end col */}
            </div>
            {/* end row */}
            <div className="mb-0">
              <label className="form-label">
                Message <span className="text-danger ms-1">*</span>
              </label>
              <textarea className="form-control" rows={3} defaultValue={""} />
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
  <div className="modal fade" id="edit_contact" role="dialog">
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Edit Contact Message</h5>
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
                Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                defaultValue="William Anderson"
              />
            </div>
            {/* start row */}
            <div className="row">
              <div className="col-lg-6">
                <div className="mb-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <label className="form-label">
                      Email <span className="text-danger">*</span>
                    </label>
                    <div className="form-check form-switch mb-1">
                      <label className="form-check-label d-flex align-items-center gap-2">
                        <span>Email Opt Out</span>
                        <input
                          className="form-check-input form-check-input-sm switchCheckDefault ms-auto"
                          type="checkbox"
                          role="switch"
                          defaultChecked
                        />
                      </label>
                    </div>
                  </div>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue="william@example.com"
                  />
                </div>
              </div>
              {/* end col */}
              <div className="col-lg-6">
                <div className="mb-3">
                  <label className="form-label">
                    Phone <span className="text-danger">*</span>
                  </label>
                  <CommonPhoneInput
                            value={phone2}
                            onChange={setPhone2}
                            placeholder="(201) 555-0123"
                          />
                </div>
              </div>
              {/* end col */}
            </div>
            {/* end row */}
            <div className="mb-0">
              <label className="form-label">
                Message <span className="text-danger ms-1">*</span>
              </label>
              <textarea
                className="form-control"
                rows={3}
                defaultValue={
                  "I’m having trouble accessing my account. Could you assist with a password reset ?"
                }
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
  {/* /Edit Source */}
  {/* Delete Source */}
  <div className="modal fade" id="delete_contact" role="dialog">
    <div className="modal-dialog modal-dialog-centered modal-sm">
      <div className="modal-content">
        <div className="modal-body">
          <div className="text-center">
            <div className="avatar avatar-xl bg-danger-light rounded-circle mb-3">
              <i className="ti ti-trash-x fs-36 text-danger" />
            </div>
            <h4 className="mb-2">Delete Confirmation</h4>
            <p className="mb-0">
              Are you sure you want to remove contact message you selected.
            </p>
            <div className="d-flex align-items-center justify-content-center mt-4">
              <Link
                to="#"
                className="btn btn-light me-2"
                data-bs-dismiss="modal"
              >
                Cancel
              </Link>
              <Link to={all_routes.contactMessages} className="btn btn-danger">
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

  )
}

export default ContactMessages