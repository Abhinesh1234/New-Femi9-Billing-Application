import { Link } from "react-router";
import ImageWithBasePath from "../../../../components/imageWithBasePath";
import { useState } from "react";
import SearchInput from "../../../../components/dataTable/dataTableSearch";
import Datatable from "../../../../components/dataTable";
import { ContactsListData } from "../../../../core/json/contactsListData";
import { all_routes } from "../../../../routes/all_routes";
import Footer from "../../../../components/footer/footer";
import PageHeader from "../../../../components/page-header/pageHeader";
import PredefinedDatePicker from "../../../../components/common-dateRangePicker/PredefinedDatePicker";
import ModalContacts from "./modals/modalContacts";

const ContactsList = () => {
  const [filledStars, setFilledStars] = useState<{ [key: string]: boolean }>(
    {}
  );

  const handleClick = (key: string) => {
    setFilledStars((prev) => ({
      ...prev,
      [key]: !prev[key], // toggle on/off
    }));
  };
  const data = ContactsListData;
  const columns = [
    {
      title: "",
      dataIndex: "Name",
      render: (_: any, record: any) => (
        <div
          className={`set-star rating-select ${
            filledStars[record.Name] ? "filled" : ""
          }`}
          onClick={() => handleClick(record.Name)}
        >
          <i className="ti ti-star-filled fs-16" />
        </div>
      ),
      sorter: (a: any, b: any) => a.Name.length - b.Name.length,
    },
    {
      title: "Name",
      dataIndex: "Name",
      render: (text: string, render: any) => (
        <h6 className="d-flex align-items-center fs-14 fw-medium mb-0">
          <Link to={all_routes.contactDetails} className="avatar me-2">
            <ImageWithBasePath
              className="img-fluid rounded-circle"
              src={`assets/img/profiles/${render.Image}`}
              alt="User Image"
            />
          </Link>
          <Link to={all_routes.contactDetails} className="d-flex flex-column">
            {text}{" "}
            <span className="text-body fs-13 fw-normal mt-1">
              {render.role}{" "}
            </span>
          </Link>
        </h6>
      ),
      sorter: (a: any, b: any) => a.Name.length - b.Name.length,
    },
    {
      title: "Tags",
      dataIndex: "Tags",
      render: (text: any) => (
        <span
          className={`badge badge-tag ${
            text === "Collab"
              ? "badge-soft-success"
              : text === "VIP"
              ? "badge-soft-warning"
              : "badge-soft-danger"
          } `}
        >{text}</span>
      ),
      sorter: (a: any, b: any) => a.Tags.length - b.Tags.length,
    },
    {
      title: "Location",
      dataIndex: "Location",
      render: (text: any, render: any) => (
        <div className="d-flex align-items-center mb-0">
          <Link
            to={all_routes.contactDetails}
            className="avatar avatar-xss me-2"
          >
            <ImageWithBasePath
              className="img-fluid rounded-circle"
              src={`assets/img/flags/${render.Flags}`}
              alt="User Image"
            />
          </Link>
          {text}
        </div>
      ),
      sorter: (a: any, b: any) => a.Location.length - b.Location.length,
    },
    {
      title: "Rating",
      dataIndex: "Rating",
      render: (text: any) => (
        <div className="set-star">
          <span>
            <i className="ti ti-star-filled text-warning" /> {text}{" "}
          </span>
        </div>
      ),
      sorter: (a: any, b: any) => a.Rating.length - b.Rating.length,
    },
    {
      title: "Contact",
      dataIndex: "Contact",
      render: () => (
        <ul className="social-links d-flex align-items-center">
          <li>
            <Link to="#">
              <i className="ti ti-mail" />
            </Link>
          </li>
          <li>
            <Link to="#">
              <i className="ti ti-phone-check" />
            </Link>
          </li>
          <li>
            <Link to="#">
              <i className="ti ti-message-circle-share" />
            </Link>
          </li>
          <li>
            <Link to="#">
              <i className="ti ti-brand-facebook " />
            </Link>
          </li>
        </ul>
      ),
      sorter: (a: any, b: any) => a.Contact.length - b.Contact.length,
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text: any) => (
        <span
          className={`badge badge-pill badge-status ${
            text === "Active" ? "bg-success" : "bg-danger"
          } `}
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
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvas_edit"
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
            <Link className="dropdown-item" to={all_routes.contactDetails}>
              <i className="ti ti-eye text-blue-light" /> Preview
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
         <PageHeader title="Contacts" badgeCount={125} showModuleTile={false} showExport={true}/>
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
                data-bs-toggle="offcanvas"
                data-bs-target="#offcanvas_add"
              >
                <i className="ti ti-square-rounded-plus-filled me-1" />
                Add Contacts
              </Link>
            </div>
            <div className="card-body">
              {/* table header */}
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
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
                  <PredefinedDatePicker/>
                </div>
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
                                Tags
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
                                      Collab
                                    </label>
                                  </li>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Promotion
                                    </label>
                                  </li>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      VIP
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
                                Owner
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
                                      Hendry Milner
                                    </label>
                                  </li>
                                  <li className="mb-1">
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Guilory Berggren
                                    </label>
                                  </li>
                                  <li className="mb-1">
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Jami Carlile
                                    </label>
                                  </li>
                                  <li className="mb-1">
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Theresa Nelson
                                    </label>
                                  </li>
                                  <li className="mb-1">
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      Smith Cooper
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
                                Location
                              </Link>
                            </div>
                            <div
                              className="filter-set-contents accordion-collapse collapse"
                              id="collapseFive"
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
                                      <span className="avatar avatar-xss rounded-circle me-1">
                                        <ImageWithBasePath
                                          src="assets/img/flags/us.svg"
                                          className="flex-shrink-0 rounded-circle"
                                          alt="img"
                                        />
                                      </span>
                                      USA
                                    </label>
                                  </li>
                                  <li className="mb-1">
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      <span className="avatar avatar-xss rounded-circle me-1">
                                        <ImageWithBasePath
                                          src="assets/img/flags/ae.svg"
                                          className="flex-shrink-0 rounded-circle"
                                          alt="img"
                                        />
                                      </span>
                                      UAE
                                    </label>
                                  </li>
                                  <li className="mb-1">
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      <span className="avatar avatar-xss rounded-circle me-1">
                                        <ImageWithBasePath
                                          src="assets/img/flags/de.svg"
                                          className="flex-shrink-0 rounded-circle"
                                          alt="img"
                                        />
                                      </span>
                                      Germany
                                    </label>
                                  </li>
                                  <li className="mb-1">
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input
                                        className="form-check-input m-0 me-1"
                                        type="checkbox"
                                      />
                                      <span className="avatar avatar-xss rounded-circle me-1">
                                        <ImageWithBasePath
                                          src="assets/img/flags/fr.svg"
                                          className="flex-shrink-0 rounded-circle"
                                          alt="img"
                                        />
                                      </span>
                                      France
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
                          <Link to="#" className="btn btn-outline-light w-100">
                            Reset
                          </Link>
                          <Link
                            to={all_routes.contactList}
                            className="btn btn-primary w-100"
                          >
                            Filter
                          </Link>
                        </div>
                      </div>
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
                              <span>Tags</span>
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
                              <span>Location</span>
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
                              <span>Rating</span>
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
                              <span>Owner</span>
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
                              <span>Contact</span>
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
                        <li className="gap-1 d-flex align-items-center">
                          <i className="ti ti-columns me-1" />
                          <div className="form-check form-switch w-100 ps-0">
                            <label className="form-check-label d-flex align-items-center gap-2 w-100">
                              <span>Action</span>
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
                  <div className="d-flex align-items-center shadow p-1 rounded border view-icons bg-white">
                    <Link
                      to={all_routes.contactList}
                      className="btn btn-sm p-1 border-0 fs-14 active"
                    >
                      <i className="ti ti-list-tree" />
                    </Link>
                    <Link
                      to={all_routes.contactGrid}
                      className="flex-shrink-0 btn btn-sm p-1 border-0 ms-1 fs-14"
                    >
                      <i className="ti ti-grid-dots" />
                    </Link>
                  </div>
                </div>
              </div>
              {/* table header */}
              {/* Contact List */}
                <Datatable
                  columns={columns}
                  dataSource={data}
                  Selection={true}
                  searchText={searchText}
                />
              {/* /Contact List */}
            </div>
          </div>
          {/* card end */}
        </div>
        {/* End Content */}
        {/* Start Footer */}
        <Footer/>
        {/* End Footer */}
      </div>
      {/* ========================
			End Page Content
		========================= */}
    <ModalContacts/>
    </>
  );
};

export default ContactsList;
