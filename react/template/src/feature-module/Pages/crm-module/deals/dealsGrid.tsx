import { Link } from "react-router";
import Footer from "../../../../components/footer/footer";
import PageHeader from "../../../../components/page-header/pageHeader";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useState } from "react";
import ImageWithBasePath from "../../../../components/imageWithBasePath";
import { all_routes } from "../../../../routes/all_routes";
import ModalDeals from "./modal/modalDeals";

const DealsGrid = () => {
  // Kanban data
  const initialColumns = [
    {
      id: "qualify",
      title: "Qualify To Buy",
      leads: 45,
      amount: "$15,44,540",
      cards: [
        {
          id: "1",
          avatar: { text: "HT", color: "success" },
          name: "Howell, Tremblay and Rath",
          amount: "$03,50,000",
          email: "darleeo@example.com",
          phone: "+1 12445-47878",
          location: "Newyork, United States",
          owner: {
            name: "Darlee Robertson",
            img: "assets/img/profiles/avatar-19.jpg",
          },
          progress: { value: 85, color: "success" },
          date: "10 Jan 2024",
        },
        {
          id: "2",
          avatar: { text: "RJ", color: "warning" },
          name: "Robert, John and Carlos",
          amount: "$02,10,000",
          email: "sheron@example.com",
          phone: "+1 12445-47878",
          location: "Exeter, United States",
          owner: {
            name: "Sharon Roy",
            img: "assets/img/profiles/avatar-20.jpg",
          },
          progress: { value: 15, color: "warning" },
          date: "12 Jan 2024",
        },
        {
          id: "3",
          avatar: { text: "WS", color: "info" },
          name: "Wendy, Star and David",
          amount: "$04,22,000",
          email: "vau@example.com",
          phone: "+1 12445-47878",
          location: "Phoenix, United States",
          owner: {
            name: "Vaughan Lewis",
            img: "assets/img/profiles/avatar-21.jpg",
          },
          progress: { value: 95, color: "info" },
          date: "14 Jan 2024",
        },
      ],
    },
    {
      id: "contact",
      title: "Contact Made",
      leads: 30,
      amount: "$19,94,938",
      cards: [
        {
          id: "4",
          avatar: { text: "BR", color: "danger" },
          name: "Byron, Roman and Bailey",
          amount: "$02,45,000",
          email: "jessica13@example.com",
          phone: "+1 89351-90346",
          location: "Chester, United States",
          owner: {
            name: "Jessica Louise",
            img: "assets/img/profiles/avatar-01.jpg",
          },
          progress: { value: 47, color: "danger" },
          date: "06 Feb 2024",
        },
        {
          id: "5",
          avatar: { text: "RJ", color: "success" },
          name: "Robert, John and Carlos",
          amount: "$01,17,000",
          email: "caroltho3@example.com",
          phone: "+1 78982-09163",
          location: "Charlotte, United States",
          owner: {
            name: "Carol Thomas",
            img: "assets/img/profiles/avatar-16.jpg",
          },
          progress: { value: 98, color: "success" },
          date: "15 Jan 2024",
        },
        {
          id: "6",
          avatar: { text: "IC", color: "danger" },
          name: "Irene, Charles and Wilston",
          amount: "$02,12,000",
          email: "dawnmercha@example.com",
          phone: "+1 27691-89246",
          location: "Bristol, United States",
          owner: {
            name: "Dawn Mercha",
            img: "assets/img/profiles/avatar-22.jpg",
          },
          progress: { value: 95, color: "danger" },
          date: "25 Jan 2024",
        },
      ],
    },
    {
      id: "presentation",
      title: "Presentation",
      leads: 25,
      amount: "$10,36,390",
      cards: [
        {
          id: "7",
          avatar: { text: "HT", color: "info" },
          name: "Jody, Powell and Cecil",
          amount: "$01,84,043",
          email: "rachel@example.com",
          phone: "+1 17839-93617",
          location: "Baltimore, United States",
          owner: {
            name: "Rachel Hampton",
            img: "assets/img/profiles/avatar-23.jpg",
          },
          progress: { value: 25, color: "info" },
          date: "18 Mar 2024",
        },
        {
          id: "8",
          avatar: { text: "BL", color: "danger" },
          name: "Bonnie, Linda and Mullin",
          amount: "$09,35,189",
          email: "jonelle@example.com",
          phone: "+1 16739-47193",
          location: "Coventry, United States",
          owner: {
            name: "Jonelle Curtiss",
            img: "assets/img/profiles/avatar-24.jpg",
          },
          progress: { value: 70, color: "danger" },
          date: "15 Feb 2024",
        },
        {
          id: "9",
          avatar: { text: "CJ", color: "success" },
          name: "Carlos, Jones and Jim",
          amount: "$04,27,940",
          email: "jonathan@example.com",
          phone: "+1 18390-37153",
          location: "Seattle",
          owner: {
            name: "Jonathan Smith",
            img: "assets/img/profiles/avatar-25.jpg",
          },
          progress: { value: 45, color: "success" },
          date: "30 Jan 2024",
        },
      ],
    },
    {
      id: "proposal",
      title: "Proposal Made",
      leads: 50,
      amount: "$18,83,013",
      cards: [
        {
          id: "10",
          avatar: { text: "FJ", color: "info" },
          name: "Freda,Jennfier and Thompson",
          amount: "$04,17,593",
          email: "sidney@example.com",
          phone: "+1 11739-38135",
          location: "London, United States",
          owner: {
            name: "Sidney Franks",
            img: "assets/img/profiles/avatar-17.jpg",
          },
          progress: { value: 59, color: "info" },
          date: "11 Apr 2024",
        },
        {
          id: "11",
          avatar: { text: "BF", color: "danger" },
          name: "Bruce, Faulkner and Lela",
          amount: "$08,81,389",
          email: "brook@example.com",
          phone: "+1 19302-91043",
          location: "Detroit, United State",
          owner: {
            name: "Brook Carter",
            img: "assets/img/profiles/avatar-26.jpg",
          },
          progress: { value: 72, color: "danger" },
          date: "17 Apr 2024",
        },
        {
          id: "12",
          avatar: { text: "LP", color: "danger" },
          name: "Lawrence, Patrick and Vandorn",
          amount: "$09,27,193",
          email: "mickey@example.com",
          phone: "+1 17280-92016",
          location: "Manchester, United States",
          owner: { name: "Mickey", img: "assets/img/profiles/avatar-15.jpg" },
          progress: { value: 20, color: "danger" },
          date: "10 Feb 2024",
        },
      ],
    },
    {
      id: "appointment",
      title: "Appointment",
      leads: 45,
      amount: "$15,44,540",
      cards: [
        {
          id: "13",
          avatar: { text: "HT", color: "danger" },
          name: "Howell, Tremblay and Rath",
          amount: "$04,17,593",
          email: "sidney@example.com",
          phone: "+1 11739-38135",
          location: "London, United States",
          owner: {
            name: "Sidney Franks",
            img: "assets/img/profiles/avatar-17.jpg",
          },
          progress: { value: 59, color: "danger" },
          date: "11 Apr 2024",
        },
        {
          id: "14",
          avatar: { text: "BF", color: "danger" },
          name: "Bruce, Faulkner and Lela",
          amount: "$08,81,389",
          email: "brook@example.com",
          phone: "+1 19302-91043",
          location: "Detroit, United State",
          owner: {
            name: "Brook Carter",
            img: "assets/img/profiles/avatar-26.jpg",
          },
          progress: { value: 72, color: "danger" },
          date: "17 Apr 2024",
        },
        {
          id: "15",
          avatar: { text: "LP", color: "info" },
          name: "Lawrence, Patrick and Vandorn",
          amount: "$09,27,193",
          email: "mickey@example.com",
          phone: "+1 17280-92016",
          location: "Manchester, United States",
          owner: { name: "Mickey", img: "assets/img/profiles/avatar-15.jpg" },
          progress: { value: 20, color: "info" },
          date: "10 Feb 2024",
        },
      ],
    },
  ];

  function KanbanBoard() {
    const [columns, setColumns] = useState(initialColumns);

    // Drag and drop handler
    const onDragEnd = (result: any) => {
      if (!result.destination) return;
      const { source, destination } = result;

      if (source.droppableId === destination.droppableId) {
        // Move within same column
        const colIdx = columns.findIndex(
          (col) => col.id === source.droppableId
        );
        const newCards = Array.from(columns[colIdx].cards);
        const [removed] = newCards.splice(source.index, 1);
        newCards.splice(destination.index, 0, removed);

        const newColumns = [...columns];
        newColumns[colIdx] = { ...columns[colIdx], cards: newCards };
        setColumns(newColumns);
      } else {
        // Move to another column
        const sourceColIdx = columns.findIndex(
          (col) => col.id === source.droppableId
        );
        const destColIdx = columns.findIndex(
          (col) => col.id === destination.droppableId
        );

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
        <div className="d-flex overflow-x-auto align-items-start mb-0 gap-3">
          {columns.map((col, _colIdx) => (
            <div
              className="kanban-list-items p-2 rounded border"
              key={col.id}
              style={{ minWidth: 300 }}
            >
              <div className="card mb-0 border-0 shadow">
                <div className="card-body p-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="d-flex align-items-center mb-1">
                        <i className="ti ti-circle-filled fs-10 text-info me-1" />
                        {col.title}
                      </h6>
                      <span>
                        {col.leads} Leads - {col.amount}
                      </span>
                    </div>
                    <div className="d-flex align-items-center">
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
                            <i className="ti ti-pencil me-1" />Edit
                          </Link>
                          <Link
                            className="dropdown-item"
                            to="#"
                            data-bs-toggle="modal"
                            data-bs-target="#delete_deal"
                          >
                            <i className="ti ti-trash me-1" />Delete
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
                      <Draggable
                        draggableId={card.id}
                        index={idx}
                        key={card.id}
                      >
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
                                  <div className="d-flex align-items-center mb-3">
                                    <Link
                                        to={all_routes.dealsDetails}
                                      className={`avatar bg-soft-${card.avatar.color} text-${card.avatar.color} rounded-circle flex-shrink-0 me-2`}
                                    >
                                      <span
                                        className={`avatar-title text-${card.avatar.color}`}
                                      >
                                        {card.avatar.text}
                                      </span>
                                    </Link>
                                    <h6 className="fw-medium fs-14 mb-0">
                                        <Link to={all_routes.dealsDetails}>
                                        {card.name}
                                      </Link>
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
                                <div className="d-flex justify-content-between align-items-center">
                                  <div className="d-flex align-items-center">
                                    <Link
                                      to="#"
                                      className="avatar avatar-xs flex-shrink-0 me-2"
                                    >
                                      <ImageWithBasePath
                                        src={card.owner.img}
                                        alt=""
                                        className="rounded-circle"
                                      />
                                    </Link>
                                    <Link to="#" className="text-default">
                                      {card.owner.name}
                                    </Link>
                                  </div>
                                  <span
                                    className={`badge bg-${card.progress.color}`}
                                  >
                                    {card.progress.value}%
                                  </span>
                                </div>
                                <div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
                                  <span>
                                    <i className="ti ti-calendar-due" />{" "}
                                    {card.date}
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
            title="Deals"
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
                            className="collapsed"
                            data-bs-toggle="collapse"
                            data-bs-target="#collapseThree"
                            aria-expanded="false"
                            aria-controls="collapseThree"
                          >
                            Deals Name
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
                                  Konopelski
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Adams
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Gutkowski
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Walter
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
                                  Won
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Open
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
                            data-bs-target="#tags"
                            aria-expanded="false"
                            aria-controls="tags"
                          >
                            Tags
                          </Link>
                        </div>
                        <div
                          className="filter-set-contents accordion-collapse collapse"
                          id="tags"
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
                                  Promotion
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Rated
                                </label>
                              </li>
                              <li>
                                <label className="dropdown-item px-2 d-flex align-items-center">
                                  <input
                                    className="form-check-input m-0 me-1"
                                    type="checkbox"
                                  />
                                  Rejected
                                </label>
                              </li>
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
                                  Calls
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
                  to={all_routes.dealsList}
                  className="btn btn-sm p-1 border-0 fs-14"
                >
                  <i className="ti ti-list-tree" />
                </Link>
                <Link
                  to={all_routes.dealsGrid}
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
                Add Deal
              </Link>
            </div>
          </div>
          {/* table header */}
          {/* Deals Kanban */}
          <KanbanBoard />
          {/* /Deals Kanban */}
        </div>
        {/* End Content */}
        {/* Start Footer */}
        <Footer />
        {/* End Footer */}
      </div>
      {/* ========================
			End Page Content
		========================= */}
    <ModalDeals/>
    </>
  );
};

export default DealsGrid;
