import { Link } from "react-router";
import Footer from "../../../../components/footer/footer";
import ImageWithBasePath from "../../../../components/imageWithBasePath";
import PageHeader from "../../../../components/page-header/pageHeader";
import { all_routes } from "../../../../routes/all_routes";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useState } from "react";
import ModalEstimation from "./modal/modalEstimation";
import CommonDatePicker from "../../../../components/common-datePicker/commonDatePicker";

const initialColumns = [
  {
    id: "draft",
    title: (
      <>
        <i className="ti ti-circle-filled text-warning me-1" />
        Draft
      </>
    ),
    cards: [
      {
        id: "draft-1",
        project: "Truelysell",
        type: "Mobile App",
        icon: "assets/img/priority/truellysell.svg",
        estimateId: "#EST00020",
        amount: "$01,23,000",
        date: "15 Oct 2023",
        expiry: "05 Nov 2026",
        user: {
          name: "Dawn Mercha",
          avatar: "assets/img/profiles/avatar-22.jpg",
        },
        companyIcon: "assets/img/icons/company-icon-07.svg",
        desc: "TruelySell provides a multiple on-demand service based bootstrap html template.",
      },
      {
        id: "draft-2",
        project: "Kofejob",
        type: "Meeting",
        icon: "assets/img/priority/project-01.svg",
        estimateId: "#EST00020",
        amount: "$01,23,000",
        date: "15 Oct 2023",
        expiry: "05 Nov 2026",
        user: {
          name: "Darlee Robertson",
          avatar: "assets/img/profiles/avatar-21.jpg",
        },
        companyIcon: "assets/img/icons/company-icon-03.svg",
        desc: "TruelySell provides a multiple on-demand service based bootstrap html template.",
      },
    ],
  },
  {
    id: "sent",
    title: (
      <>
        <i className="ti ti-circle-filled fs-8 text-info me-1" />
        Sent
      </>
    ),
    cards: [
      {
        id: "sent-1",
        project: "Truelysell",
        type: "Web App",
        icon: "assets/img/priority/truellysel.svg",
        estimateId: "#EST00020",
        amount: "$01,23,000",
        date: "15 Oct 2023",
        expiry: "05 Nov 2026",
        user: {
          name: "Darlee Robertson",
          avatar: "assets/img/profiles/avatar-19.jpg",
        },
        companyIcon: "assets/img/icons/company-icon-01.svg",
        desc: "TruelySell provides a multiple on-demand service based bootstrap html template.",
      },
      {
        id: "sent-2",
        project: "Doccure",
        type: "Meeting",
        icon: "assets/img/priority/project-02.svg",
        estimateId: "#EST00020",
        amount: "$01,23,000",
        date: "15 Oct 2023",
        expiry: "05 Nov 2026",
        user: {
          name: "Rachel Hampton",
          avatar: "assets/img/profiles/avatar-23.jpg",
        },
        companyIcon: "assets/img/icons/company-icon-08.svg",
        desc: "TruelySell provides a multiple on-demand service based bootstrap html template.",
      },
    ],
  },
  {
    id: "accepted",
    title: (
      <>
        <i className="ti ti-circle-filled fs-8 text-success me-1" />
        Accepted
      </>
    ),
    cards: [
      {
        id: "accepted-1",
        project: "Dreamschat",
        type: "Meeting",
        icon: "assets/img/priority/dreamchat.svg",
        estimateId: "#EST00020",
        amount: "$01,23,000",
        date: "15 Oct 2023",
        expiry: "05 Nov 2026",
        user: {
          name: "Sharon Roy",
          avatar: "assets/img/profiles/avatar-20.jpg",
        },
        companyIcon: "assets/img/icons/company-icon-02.svg",
        desc: "TruelySell provides a multiple on-demand service based bootstrap html template.",
      },
      {
        id: "accepted-2",
        project: "servbook",
        type: "Meeting",
        icon: "assets/img/priority/servbook.svg",
        estimateId: "#EST00020",
        amount: "$01,23,000",
        date: "15 Oct 2023",
        expiry: "05 Nov 2026",
        user: {
          name: "Jessica Louise",
          avatar: "assets/img/profiles/avatar-01.jpg",
        },
        companyIcon: "assets/img/icons/company-icon-04.svg",
        desc: "TruelySell provides a multiple on-demand service based bootstrap html template.",
      },
    ],
  },
  {
    id: "declined",
    title: (
      <>
        <i className="ti ti-circle-filled fs-8 text-danger me-1" />
        Declined
      </>
    ),
    cards: [
      {
        id: "declined-1",
        project: "DreamPOS",
        type: "Web App",
        icon: "assets/img/priority/dream-pos.svg",
        estimateId: "#EST00020",
        amount: "$01,23,000",
        date: "15 Oct 2023",
        expiry: "05 Nov 2026",
        user: {
          name: "Carol Thomas",
          avatar: "assets/img/profiles/avatar-16.jpg",
        },
        companyIcon: "assets/img/icons/company-icon-05.svg",
        desc: "TruelySell provides a multiple on-demand service based bootstrap html template.",
      },
      {
        id: "declined-2",
        project: "Dreamsports",
        type: "Meeting",
        icon: "assets/img/priority/dream-pos.svg",
        estimateId: "#EST00020",
        amount: "$01,23,000",
        date: "15 Oct 2023",
        expiry: "05 Nov 2026",
        user: {
          name: "Jonathan Smith",
          avatar: "assets/img/profiles/avatar-25.jpg",
        },
        companyIcon: "assets/img/icons/company-icon-10.svg",
        desc: "TruelySell provides a multiple on-demand service based bootstrap html template.",
      },
    ],
  },
];

const EstimationsKanban = () => {
  const [columns, setColumns] = useState(initialColumns);

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const { source, destination } = result;

    // Find source and destination columns
    const sourceColIdx = columns.findIndex(
      (col) => col.id === source.droppableId
    );
    const destColIdx = columns.findIndex(
      (col) => col.id === destination.droppableId
    );

    // Same column
    if (sourceColIdx === destColIdx) {
      const newCards = Array.from(columns[sourceColIdx].cards);
      const [removed] = newCards.splice(source.index, 1);
      newCards.splice(destination.index, 0, removed);

      const newColumns = [...columns];
      newColumns[sourceColIdx] = { ...columns[sourceColIdx], cards: newCards };
      setColumns(newColumns);
    } else {
      // Different columns
      const sourceCards = Array.from(columns[sourceColIdx].cards);
      const destCards = Array.from(columns[destColIdx].cards);

      const [removed] = sourceCards.splice(source.index, 1);
      destCards.splice(destination.index, 0, removed);

      const newColumns = [...columns];
      newColumns[sourceColIdx] = {
        ...columns[sourceColIdx],
        cards: sourceCards,
      };
      newColumns[destColIdx] = { ...columns[destColIdx], cards: destCards };
      setColumns(newColumns);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="d-flex overflow-x-auto align-items-start mb-4 gap-3">
        {columns.map((col) => (
          <div className="kanban-list-items p-2 rounded border" key={col.id}>
            <div className="card border-0 shadow">
              <div className="card-body p-2">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="d-flex align-items-center mb-0">
                    {col.title}
                  </h6>
                  <Link
                    to="#"
                    className="text-purple btn btn-icon btn-xs btn-outline-light shadow"
                  >
                    <i className="ti ti-plus" />
                  </Link>
                </div>
              </div>
            </div>
            <Droppable droppableId={col.id}>
              {(provided) => (
                <div
                  className="kanban-drag-wrap"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{ minHeight: 100 }}
                >
                  {col.cards.map((card, idx) => (
                    <Draggable draggableId={card.id} index={idx} key={card.id}>
                      {(provided, snapshot) => (
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
                              <div className="d-flex align-items-center justify-content-between bg-light-200 rounded mb-3">
                                <div className="d-flex align-items-center">
                                  <Link
                                    to="#"
                                    className="avatar rounded-circle border bg-white flex-shrink-0 me-2"
                                  >
                                    <ImageWithBasePath
                                      src={card.icon}
                                      className="w-auto h-auto"
                                      alt=""
                                    />
                                  </Link>
                                  <div>
                                    <h6 className="fw-medium fs-14 mb-1">
                                      <Link to="#">{card.project}</Link>
                                    </h6>
                                    <p className="fs-13 mb-0">{card.type}</p>
                                  </div>
                                </div>
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
                                      <i className="ti ti-edit text-blue" />{" "}
                                      Edit
                                    </Link>
                                    <Link
                                      className="dropdown-item"
                                      to="#"
                                      data-bs-toggle="modal"
                                      data-bs-target="#delete_estimations"
                                    >
                                      <i className="ti ti-trash" />
                                      Delete
                                    </Link>
                                  </div>
                                </div>
                              </div>
                              <p className="mb-3">{card.desc}</p>
                              <div className="mb-3 d-flex flex-column border-bottom">
                                <p className="text-default d-inline-flex align-items-center mb-2">
                                  <i className="ti ti-forbid-2 text-dark me-1" />
                                  Estimate ID : {card.estimateId}
                                </p>
                                <p className="text-default d-inline-flex align-items-center mb-2">
                                  <i className="ti ti-report-money text-dark me-1" />
                                  Amount : {card.amount}
                                </p>
                                <p className="text-default d-inline-flex align-items-center mb-2">
                                  <i className="ti ti-calendar-exclamation text-dark me-1" />
                                  Date : {card.date}
                                </p>
                                <p className="text-default d-inline-flex align-items-center">
                                  <i className="ti ti-calendar-time text-dark me-1" />
                                  Expiry Date : {card.expiry}
                                </p>
                              </div>
                              <div className="d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center">
                                  <Link
                                    to="#"
                                    className="avatar avatar-xs rounded-circle flex-shrink-0 me-2"
                                  >
                                    <ImageWithBasePath
                                      src={card.user.avatar}
                                      alt=""
                                      className="rounded-circle"
                                    />
                                  </Link>
                                  <Link to="#">{card.user.name}</Link>
                                </div>
                                <Link
                                  to="#"
                                  className="avatar avatar-xs border p-1 rounded-circle d-flex align-items-center justify-content-center"
                                >
                                  <ImageWithBasePath
                                    src={card.companyIcon}
                                    alt=""
                                  />
                                </Link>
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
};

const Estimations = () => {
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
            title="Estimations"
            badgeCount={123}
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
                            className="collapsed"
                            data-bs-toggle="collapse"
                            data-bs-target="#project"
                            aria-expanded="false"
                            aria-controls="project"
                          >
                            Project
                          </Link>
                        </div>
                        <div
                          className="filter-set-contents accordion-collapse collapse"
                          id="project"
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
                            <ul>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Truelysell
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Dreamsports
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Best@laundry
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Doccure
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
                            data-bs-target="#collapseThree"
                            aria-expanded="false"
                            aria-controls="collapseThree"
                          >
                            Client Name
                          </Link>
                        </div>
                        <div
                          className="filter-set-contents accordion-collapse collapse"
                          id="collapseThree"
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
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  RiverStone Ltd
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Bright Bridge Grp
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  CoastalStar Co.
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  HarborView
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Golden Gate Ltd
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Redwood Inc
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
                            data-bs-target="#date"
                            aria-expanded="false"
                            aria-controls="date"
                          >
                            Date of Estimation
                          </Link>
                        </div>
                        <div
                          className="filter-set-contents accordion-collapse collapse"
                          id="date"
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
                            data-bs-target="#collapseTwo"
                            aria-expanded="false"
                            aria-controls="collapseTwo"
                          >
                            Estimated By
                          </Link>
                        </div>
                        <div
                          className="filter-set-contents accordion-collapse collapse"
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
                            data-bs-target="#date2"
                            aria-expanded="false"
                            aria-controls="date2"
                          >
                            Expiry Date
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
                                  Accepted
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Draft
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Declined
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
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search"
                />
              </div>
            </div>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <div className="d-flex align-items-center shadow p-1 rounded border view-icons bg-white">
                <Link
                  to={all_routes.estimationList}
                  className="btn btn-sm p-1 border-0 fs-14"
                >
                  <i className="ti ti-list-tree" />
                </Link>
                <Link
                  to={all_routes.estimationKanban}
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
                Add Estimation
              </Link>
            </div>
          </div>
          {/* table header */}
          {/* Estimations Kanban */}
          <EstimationsKanban />
          <div className="load-btn text-center">
            <Link to="#" className="btn btn-primary">
              <i className="ti ti-loader me-1" />
              Load More
            </Link>
          </div>
          {/* /Estimations Kanban */}
        </div>
        {/* End Content */}
        {/* Start Footer */}
        <Footer />
        {/* End Footer */}
      </div>
      {/* ========================
			End Page Content
		========================= */}
      <ModalEstimation />
    </>
  );
};

export default Estimations;
