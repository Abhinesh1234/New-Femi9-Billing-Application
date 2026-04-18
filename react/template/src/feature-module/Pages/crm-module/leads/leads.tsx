import { Link } from "react-router"
import Footer from "../../../../components/footer/footer"
import PageHeader from "../../../../components/page-header/pageHeader"
import { all_routes } from "../../../../routes/all_routes"
import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import ModalLeads from "./modal/modalLeads";
import ImageWithBasePath from "../../../../components/imageWithBasePath";
import CommonDatePicker from "../../../../components/common-datePicker/commonDatePicker";


const Leads = () => {
  // ...existing code...

const initialLeadsColumns = [
  {
    id: "contacted",
    title: "Contacted",
    icon: <i className="ti ti-circle-filled fs-10 text-warning me-1" />,
    leads: 45,
    amount: "$15,44,540",
    cards: [
      {
        id: "l1",
        avatar: { text: "SM", color: "info" },
        name: "Schumm",
        amount: "$03,50,000",
        email: "darleeo@example.com",
        phone: "+1 12445-47878",
        location: "Newyork, United States",
        companyIcon: "assets/img/icons/company-icon-09.svg",
      },
      {
        id: "l2",
        avatar: { text: "CS", color: "danger" },
        name: "Collins",
        amount: "$02,10,000",
        email: "robertson@example.com",
        phone: "+1 13987-90231",
        location: "Austin, United States",
        companyIcon: "assets/img/icons/company-icon-01.svg",
      },
      {
        id: "l3",
        avatar: { text: "KI", color: "warning" },
        name: "Konopelski",
        amount: "$02,18,000",
        email: "sharon@example.com",
        phone: "+1 17932-04278",
        location: "Atlanta, United States",
        companyIcon: "assets/img/icons/company-icon-02.svg",
      },
    ],
  },
  {
    id: "not_contacted",
    title: "Not Contacted",
    icon: <i className="ti ti-circle-filled fs-10 text-info me-1" />,
    leads: 45,
    amount: "$15,44,540",
    cards: [
      {
        id: "l4",
        avatar: { text: "AS", color: "danger" },
        name: "Adams",
        amount: "$02,45,000",
        email: "vaughan12@example.com",
        phone: "+1 17392-27846",
        location: "London, United Kingdom",
        companyIcon: "assets/img/icons/company-icon-03.svg",
      },
      {
        id: "l5",
        avatar: { text: "WK", color: "info" },
        name: "Wizosk",
        amount: "$01,17,000",
        email: "caroltho3@example.com",
        phone: "+1 78982-09163",
        location: "Bristol, United Kingdom",
        companyIcon: "assets/img/icons/company-icon-04.svg",
      },
      {
        id: "l6",
        avatar: { text: "HR", color: "success" },
        name: "Heller",
        amount: "$02,12,000",
        email: "dawnmercha@example.com",
        phone: "+1 27691-89246",
        location: "San Francisco, United States",
        companyIcon: "assets/img/icons/company-icon-05.svg",
      },
    ],
  },
  {
    id: "closed",
    title: "Closed",
    icon: <i className="ti ti-circle-filled fs-10 text-success me-1" />,
    leads: 45,
    amount: "$15,44,540",
    cards: [
      {
        id: "l7",
        avatar: { text: "GI", color: "danger" },
        name: "Gutkowsi",
        amount: "$01,84,043",
        email: "rachel@example.com",
        phone: "+1 17839-93617",
        location: "Dallas, United States",
        companyIcon: "assets/img/icons/company-icon-06.svg",
      },
      {
        id: "l8",
        avatar: { text: "WR", color: "warning" },
        name: "Walter",
        amount: "$09,35,189",
        email: "jonelle@example.com",
        phone: "+1 16739-47193",
        location: "Leicester, United Kingdom",
        companyIcon: "assets/img/icons/company-icon-07.svg",
      },
      {
        id: "l9",
        avatar: { text: "HN", color: "success" },
        name: "Hansen",
        amount: "$04,27,940",
        email: "jonathan@example.com",
        phone: "+1 18390-37153",
        location: "Norwich, United Kingdom",
        companyIcon: "assets/img/icons/company-icon-08.svg",
      },
    ],
  },
  {
    id: "lost",
    title: "Lost",
    icon: <i className="ti ti-circle-filled fs-10 text-danger me-1" />,
    leads: 15,
    amount: "$14,89,543",
    cards: [
      {
        id: "l10",
        avatar: { text: "SE", color: "danger" },
        name: "Steve",
        amount: "$04,17,593",
        email: "sidney@example.com",
        phone: "+1 11739-38135",
        location: "Manchester, United Kingdom",
        companyIcon: "assets/img/icons/company-icon-09.svg",
      },
      {
        id: "l11",
        avatar: { text: "LE", color: "info" },
        name: "Leuschke",
        amount: "$08,81,389",
        email: "brook@example.com",
        phone: "+1 19302-91043",
        location: "Chicago, United States",
        companyIcon: "assets/img/icons/company-icon-10.svg",
      },
      {
        id: "l12",
        avatar: { text: "AY", color: "danger" },
        name: "Anthony",
        amount: "$09,27,193",
        email: "mickey@example.com",
        phone: "+1 17280-92016",
        location: "Derby, United Kingdom",
        companyIcon: "assets/img/icons/company-icon-01.svg",
      },
    ],
  },
];

function LeadsKanbanBoard() {
  const [columns, setColumns] = useState(initialLeadsColumns);

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId === destination.droppableId) {
      const colIdx = columns.findIndex((col) => col.id === source.droppableId);
      const newCards = Array.from(columns[colIdx].cards);
      const [removed] = newCards.splice(source.index, 1);
      newCards.splice(destination.index, 0, removed);

      const newColumns = [...columns];
      newColumns[colIdx] = { ...columns[colIdx], cards: newCards };
      setColumns(newColumns);
    } else {
      const sourceColIdx = columns.findIndex((col) => col.id === source.droppableId);
      const destColIdx = columns.findIndex((col) => col.id === destination.droppableId);

      const sourceCards = Array.from(columns[sourceColIdx].cards);
      const destCards = Array.from(columns[destColIdx].cards);

      const [removed] = sourceCards.splice(source.index, 1);
      destCards.splice(destination.index, 0, removed);

      const newColumns = [...columns];
      newColumns[sourceColIdx] = { ...columns[sourceColIdx], cards: sourceCards };
      newColumns[destColIdx] = { ...columns[destColIdx], cards: destCards };
      setColumns(newColumns);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="d-flex overflow-x-auto align-items-start gap-3">
        {columns.map((col) => (
          <div className="kanban-list-items p-2 rounded border" key={col.id}>
            <div className="card mb-0 border-0 shadow">
              <div className="card-body p-2">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="d-flex align-items-center mb-1">
                      {col.icon}
                      {col.title}
                    </h6>
                    <span className="fw-medium">
                      {col.leads} Leads - {col.amount}
                    </span>
                  </div>
                  <div className="d-flex align-items-center">
                    <Link to="#" className="text-info">
                      <i className="ti ti-plus" />
                    </Link>
                    <div className="dropdown table-action ms-2">
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
                          <i className="ti ti-pencil me-1" /> Edit
                        </Link>
                        <Link
                          className="dropdown-item"
                          to="#"
                          data-bs-toggle="modal"
                          data-bs-target="#delete_lead"
                        >
                          <i className="ti ti-trash me-1" />
                          Delete
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Droppable droppableId={col.id}>
              {(provided: any) => (
                <div
                  className="kanban-drag-wrap"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{ minHeight: 100 }}
                >
                  {col.cards.map((card, idx) => (
                    <Draggable draggableId={card.id} index={idx} key={card.id}>
                      {(provided: any, snapshot: any) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            marginBottom: 16,
                            opacity: snapshot.isDragging ? 0.8 : 1,
                          }}
                        >
                          <div className="card kanban-card border mb-0 mt-3 shadow">
                            <div className="card-body">
                              <div className="d-block">
                                <div className="card-topbar mb-3 pt-1" style={{
                                  background:
                                    col.id === "contacted"
                                      ? "#f7b924"
                                      : col.id === "not_contacted"
                                      ? "#17a2b8"
                                      : col.id === "closed"
                                      ? "#28a745"
                                      : "#dc3545",
                                }} />
                                <div className="d-flex align-items-center mb-3">
                                  <Link
                                    to="#"
                                    className={`avatar rounded-circle bg-soft-${card.avatar.color} flex-shrink-0 me-2`}
                                  >
                                    <span className={`avatar-title text-${card.avatar.color}`}>
                                      {card.avatar.text}
                                    </span>
                                  </Link>
                                  <h6 className="fw-medium fs-14 mb-0">
                                    <Link to={all_routes.leadsDetails}>{card.name}</Link>
                                  </h6>
                                </div>
                              </div>
                              <div className="d-flex flex-column">
                                <p className="text-default d-inline-flex align-items-center mb-2">
                                  <i className="ti ti-report-money text-dark me-1" />
                                  {card.amount}
                                </p>
                                <p className="text-default d-inline-flex align-items-center mb-2">
                                  <i className="ti ti-mail text-dark me-1" />
                                  {card.email}
                                </p>
                                <p className="text-default d-inline-flex align-items-center mb-2">
                                  <i className="ti ti-phone text-dark me-1" />
                                  {card.phone}
                                </p>
                                <p className="text-default d-inline-flex align-items-center">
                                  <i className="ti ti-map-pin-pin text-dark me-1" />
                                  {card.location}
                                </p>
                              </div>
                              <div className="d-flex align-items-center justify-content-between border-top pt-3">
                                <span className="avatar avatar-xs border rounded-circle d-flex align-items-center justify-content-center p-1">
                                  <ImageWithBasePath src={card.companyIcon} alt="" />
                                </span>
                                <div className="icons-social d-flex align-items-center gap-1">
                                  <Link
                                    to="#"
                                    className="d-flex align-items-center justify-content-center me-1"
                                  >
                                    <i className="ti ti-phone-check" />
                                  </Link>
                                  <Link
                                    to="#"
                                    className="d-flex align-items-center justify-content-center me-1"
                                  >
                                    <i className="ti ti-message-circle-2" />
                                  </Link>
                                  <Link
                                    to="#"
                                    className="d-flex align-items-center justify-content-center"
                                  >
                                    <i className="ti ti-color-swatch" />
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}

// ...existing code...
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
            title="Leads"
            badgeCount={125}
            showModuleTile={false}
            showExport={true}
          />
      {/* End Page Header */}
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
                        Lead Name
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
                        Company Name
                      </Link>
                    </div>
                    <div
                      className="filter-set-contents accordion-collapse collapse"
                      id="collapseThree"
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
                        <ul>
                          <li>
                            <label className="dropdown-item px-2 d-flex align-items-center">
                              <input
                                className="form-check-input m-0 me-1"
                                type="checkbox"
                              />
                              NovaWave LLC
                            </label>
                          </li>
                          <li>
                            <label className="dropdown-item px-2 d-flex align-items-center">
                              <input
                                className="form-check-input m-0 me-1"
                                type="checkbox"
                              />
                              BlueSky Industries
                            </label>
                          </li>
                          <li>
                            <label className="dropdown-item px-2 d-flex align-items-center">
                              <input
                                className="form-check-input m-0 me-1"
                                type="checkbox"
                              />
                              Silver Hawk
                            </label>
                          </li>
                          <li>
                            <label className="dropdown-item px-2 d-flex align-items-center">
                              <input
                                className="form-check-input m-0 me-1"
                                type="checkbox"
                              />
                              Summit Peak
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
                        data-bs-target="#status"
                        aria-expanded="false"
                        aria-controls="status"
                      >
                        Lead Status
                      </Link>
                    </div>
                    <div
                      className="filter-set-contents accordion-collapse collapse"
                      id="status"
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
                          <li>
                            <label className="dropdown-item px-2 d-flex align-items-center">
                              <input
                                className="form-check-input m-0 me-1"
                                type="checkbox"
                              />
                              Closed
                            </label>
                          </li>
                          <li>
                            <label className="dropdown-item px-2 d-flex align-items-center">
                              <input
                                className="form-check-input m-0 me-1"
                                type="checkbox"
                              />
                              Not Closed
                            </label>
                          </li>
                          <li>
                            <label className="dropdown-item px-2 d-flex align-items-center">
                              <input
                                className="form-check-input m-0 me-1"
                                type="checkbox"
                              />
                              Contacted
                            </label>
                          </li>
                          <li>
                            <label className="dropdown-item px-2 d-flex align-items-center">
                              <input
                                className="form-check-input m-0 me-1"
                                type="checkbox"
                              />
                              Lost
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
                        data-bs-target="#date2"
                        aria-expanded="false"
                        aria-controls="date2"
                      >
                        Created Date
                      </Link>
                    </div>
                    <div
                      className="filter-set-contents accordion-collapse collapse"
                      id="date2"
                      data-bs-parent="#accordionExample"
                    >
                      <div className="filter-content-list bg-light rounded border p-2 shadow mt-2">
                        <div className="input-group w-auto input-group-flat">
                          <div className="input-group w-100 input-group-flat">
                              <CommonDatePicker placeholder="dd/mm/yyyy" />
                            </div>
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
                        data-bs-target="#owner"
                        aria-expanded="false"
                        aria-controls="owner"
                      >
                        Lead Owner
                      </Link>
                    </div>
                    <div
                      className="filter-set-contents accordion-collapse collapse"
                      id="owner"
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
                                  src="assets/img/users/user-17.jpg"
                                  className="flex-shrink-0 rounded-circle"
                                  alt="img"
                                />
                              </span>
                              Robert Johnson
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
                                  src="assets/img/users/user-16.jpg"
                                  className="flex-shrink-0 rounded-circle"
                                  alt="img"
                                />
                              </span>
                              Isabella Cooper
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
                                  src="assets/img/users/user-14.jpg"
                                  className="flex-shrink-0 rounded-circle"
                                  alt="img"
                                />
                              </span>
                              John Smith
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
                                  src="assets/img/users/user-22.jpg"
                                  className="flex-shrink-0 rounded-circle"
                                  alt="img"
                                />
                              </span>
                              Sophia Parker
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
                                  src="assets/img/users/user-25.jpg"
                                  className="flex-shrink-0 rounded-circle"
                                  alt="img"
                                />
                              </span>
                              Emma Reynolds
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
                                  src="assets/img/users/user-24.jpg"
                                  className="flex-shrink-0 rounded-circle"
                                  alt="img"
                                />
                              </span>
                              Liam Carter
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
                                  src="assets/img/users/user-39.jpg"
                                  className="flex-shrink-0 rounded-circle"
                                  alt="img"
                                />
                              </span>
                              Noah Mitchell
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
                                  src="assets/img/users/user-31.jpg"
                                  className="flex-shrink-0 rounded-circle"
                                  alt="img"
                                />
                              </span>
                              Mason Hayes
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
                                  src="assets/img/users/user-21.jpg"
                                  className="flex-shrink-0 rounded-circle"
                                  alt="img"
                                />
                              </span>
                              Ron Thompson
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
                              Laura Bennett
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
                  <Link to="" className="btn btn-primary w-100">
                    Filter
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="input-icon input-icon-start position-relative">
            <span className="input-icon-addon text-dark">
              <i className="ti ti-search" />
            </span>
            <input type="text" className="form-control" placeholder="Search" />
          </div>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="d-flex align-items-center shadow p-1 rounded border view-icons bg-white">
            <Link to={all_routes.leadsList} className="btn btn-sm p-1 border-0 fs-14">
              <i className="ti ti-list-tree" />
            </Link>
            <Link
              to={all_routes.leads}
              className="flex-shrink-0 btn btn-sm p-1 border-0 ms-1 fs-14 active"
            >
              <i className="ti ti-grid-dots" />
            </Link>
          </div>
          <Link
            to="#"
            className="btn btn-primary"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvas_add"
          >
            <i className="ti ti-square-rounded-plus-filled me-1" />
            Add Lead
          </Link>
        </div>
      </div>
      {/* table header */}
      {/* Leads Kanban */}
     <LeadsKanbanBoard />
      {/* /Leads Kanban */}
    </div>
    {/* End Content */}
    {/* Start Footer */}
   <Footer/>
    {/* End Footer */}
  </div>
  {/* ========================
			End Page Content
		========================= */}
    <ModalLeads/>
</>

  )
}

export default Leads