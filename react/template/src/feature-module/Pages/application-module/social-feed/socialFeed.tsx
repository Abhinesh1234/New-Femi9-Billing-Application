import { useState } from "react";
import { Link } from "react-router";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import PageHeader from "../../../../components/page-header/pageHeader";
import ImageWithBasePath from "../../../../components/imageWithBasePath";
import Footer from "../../../../components/footer/footer";

const galleryImages = [
  {
    src: "/src/assets/img/social/gallery-big-01.jpg",
    thumb: "assets/img/social/gallery-01.jpg",
  },
  {
    src: "/src/assets/img/social/gallery-big-03.jpg",
    thumb: "assets/img/social/gallery-03.jpg",
  },
  {
    src: "/src/assets/img/social/gallery-big-02.jpg",
    thumb: "assets/img/social/gallery-02.jpg",
  },
  {
    src: "/src/assets/img/social/gallery-big-04.jpg",
    thumb: "assets/img/social/gallery-04.jpg",
  },
];

const SocialFeed = () => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

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
            title="Social Feed"
            showModuleTile={true}
            moduleTitle="Application"
            showExport={false}
          />

          {/* End Page Header */}

          {/* start row */}
          <div className="row">
            <div className="col-xl-3 theiaStickySidebar">
              <div className="card sticky-class filemanager-left-sidebar">
                <div className="card-body">
                  <div className="bg-light rounded p-3 mb-3">
                    <div className="text-center mb-3">
                      <Link
                        to="#"
                        className="avatar avatar-xl online avatar-rounded"
                      >
                        <ImageWithBasePath
                          src="assets/img/users/user-02.jpg"
                          alt="Img"
                        />
                      </Link>
                      <h6 className="mb-1">
                        <Link to="#">James Hong </Link>
                      </h6>
                      <p className="fs-12">@James Hong324</p>
                    </div>
                    <div className="row g-2">
                      <div className="col-sm-6">
                        <div className="rounded bg-white text-center p-2">
                          <h6 className="mb-1">89K</h6>
                          <p className="fs-12 mb-0">Followers</p>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="rounded bg-white text-center p-2">
                          <h6 className="mb-1">45</h6>
                          <p className="fs-12 mb-0">Follows</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <Link
                      to="#"
                      className="btn btn-primary d-inline-flex align-items-center justify-content-center w-100"
                    >
                      <i className="ti ti-circle-plus me-2" />
                      Create Post
                    </Link>
                  </div>
                  <div className="files-list border-bottom pb-2 mb-3">
                    <Link
                      to="javscript:void(0);"
                      className="d-flex align-items-center justify-content-between active fw-medium p-2"
                    >
                      <span>
                        <i className="ti ti-brand-feedly me-2" />
                        All Feeds
                      </span>
                      <span className="badge bg-danger badge-xs rounded-pill">
                        56
                      </span>
                    </Link>
                    <Link
                      to="javscript:void(0);"
                      className="d-flex align-items-center fw-medium p-2"
                    >
                      <i className="ti ti-mood-search me-2" />
                      Explore
                    </Link>
                    <Link
                      to="javscript:void(0);"
                      className="d-flex align-items-center fw-medium p-2"
                    >
                      <i className="ti ti-mail-check me-2" />
                      Messages
                    </Link>
                    <Link
                      to="javscript:void(0);"
                      className="d-flex align-items-center fw-medium p-2"
                    >
                      <i className="ti ti-list me-2" />
                      Lists
                    </Link>
                    <Link
                      to="javscript:void(0);"
                      className="d-flex align-items-center fw-medium p-2"
                    >
                      <i className="ti ti-bookmark me-2" />
                      Bookmark
                    </Link>
                    <Link
                      to="javscript:void(0);"
                      className="d-flex align-items-center fw-medium p-2"
                    >
                      <i className="ti ti-coffee me-2" />
                      Marketplace
                    </Link>
                    <Link
                      to="javscript:void(0);"
                      className="d-flex align-items-center justify-content-between fw-medium p-2"
                    >
                      <span>
                        <i className="ti ti-file-text me-2" />
                        Files
                      </span>
                      <span className="badge bg-info badge-xs rounded-pill">
                        14
                      </span>
                    </Link>
                    <Link
                      to="javscript:void(0);"
                      className="d-flex align-items-center fw-medium p-2"
                    >
                      <i className="ti ti-music me-2" />
                      Media
                    </Link>
                    <Link
                      to="javscript:void(0);"
                      className="d-flex align-items-center fw-medium p-2"
                    >
                      <i className="ti ti-user-share me-2" />
                      Profile
                    </Link>
                  </div>
                  <div>
                    <div className="mb-2">
                      <h6>Pages You Liked</h6>
                    </div>
                    <div>
                      <Link
                        to="javscript:void(0);"
                        className="fw-medium d-flex align-items-center justify-content-between text-dark py-1 mb-2"
                      >
                        <span className="d-inline-flex align-items-center">
                          <ImageWithBasePath
                            src="assets/img/icons/liked-page-01.svg"
                            className="me-2"
                            alt="Img"
                          />
                          Dribble
                        </span>
                        <span className="btn btn-icon btn-sm">
                          <i className="ti ti-thumb-down" />
                        </span>
                      </Link>
                      <Link
                        to="javscript:void(0);"
                        className="fw-medium d-flex align-items-center justify-content-between text-dark py-1 mb-2"
                      >
                        <span className="d-inline-flex align-items-center">
                          <ImageWithBasePath
                            src="assets/img/icons/liked-page-02.svg"
                            className="me-2"
                            alt="Img"
                          />
                          UI/UX Designs
                        </span>
                        <span className="btn btn-icon btn-sm">
                          <i className="ti ti-thumb-down" />
                        </span>
                      </Link>
                      <Link
                        to="javscript:void(0);"
                        className="fw-medium d-flex align-items-center justify-content-between text-dark py-1"
                      >
                        <span className="d-inline-flex align-items-center">
                          <ImageWithBasePath
                            src="assets/img/icons/liked-page-03.svg"
                            className="me-2"
                            alt="Img"
                          />
                          Figma Update
                        </span>
                        <span className="btn btn-icon btn-sm">
                          <i className="ti ti-thumb-down" />
                        </span>
                      </Link>
                      <div>
                        <div className="more-menu-3">
                          <Link
                            to="javscript:void(0);"
                            className="fw-medium d-flex align-items-center justify-content-between text-dark py-1 mb-2"
                          >
                            <span className="d-inline-flex align-items-center">
                              <ImageWithBasePath
                                src="assets/img/icons/liked-page-04.svg"
                                className="me-2"
                                alt="Img"
                              />
                              I Am Techie
                            </span>
                            <span className="btn btn-icon btn-sm">
                              <i className="ti ti-thumb-down" />
                            </span>
                          </Link>
                        </div>
                        <div className="view-all mt-2">
                          <Link to="#" className="viewall-button-3 fw-medium">
                            <span>Show More</span>
                            <i className="ti ti-chevron-down fs-10 ms-2" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* end card body */}
              </div>
              {/* end card */}
            </div>
            {/* end col */}
            <div className="col-xl-6">
              <div>
                <div className="card">
                  <div className="card-body">
                    <form>
                      <div className="mb-3">
                        <label className="form-label">Create Post</label>
                        <div className="position-relative">
                          <textarea
                            className="form-control"
                            rows={3}
                            placeholder="What's on your mind?"
                            defaultValue={""}
                          />
                        </div>
                      </div>
                      <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                        <div className="d-flex align-items-center">
                          <Link
                            to="#"
                            className="btn btn-icon btn-sm rounded-circle"
                          >
                            <i className="ti ti-photo fs-16" />
                          </Link>
                          <Link
                            to="#"
                            className="btn btn-icon btn-sm rounded-circle"
                          >
                            <i className="ti ti-link fs-16" />
                          </Link>
                          <Link
                            to="#"
                            className="btn btn-icon btn-sm rounded-circle"
                          >
                            <i className="ti ti-paperclip fs-16" />
                          </Link>
                          <Link
                            to="#"
                            className="btn btn-icon btn-sm rounded-circle"
                          >
                            <i className="ti ti-video fs-16" />
                          </Link>
                          <Link
                            to="#"
                            className="btn btn-icon btn-sm rounded-circle"
                          >
                            <i className="ti ti-hash fs-16" />
                          </Link>
                          <Link
                            to="#"
                            className="btn btn-icon btn-sm rounded-circle"
                          >
                            <i className="ti ti-map-pin-heart fs-16" />
                          </Link>
                          <Link
                            to="#"
                            className="btn btn-icon btn-sm rounded-circle"
                          >
                            <i className="ti ti-mood-smile fs-16" />
                          </Link>
                        </div>
                        <div className="d-flex align-items-center">
                          <Link
                            to="#"
                            className="btn btn-icon btn-sm rounded-circle"
                          >
                            <i className="ti ti-refresh fs-16" />
                          </Link>
                          <Link
                            to="#"
                            className="btn btn-icon btn-sm rounded-circle"
                          >
                            <i className="ti ti-trash fs-16" />
                          </Link>
                          <Link
                            to="#"
                            className="btn btn-icon btn-sm rounded-circle"
                          >
                            <i className="ti ti-world fs-16" />
                          </Link>
                          <button
                            type="submit"
                            className="btn btn-primary d-inline-flex align-items-center ms-2"
                          >
                            <i className="ti ti-circle-plus fs-16 me-2" />
                            Share Post
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                  {/* end card body */}
                </div>
                {/* end card */}
                <div className="card">
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-3">
                      <h6 className="mb-0">Popular Channels</h6>
                    </div>
                    <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                      <Link to="#">
                        <ImageWithBasePath
                          src="assets/img/icons/channel-01.svg"
                          alt="Img"
                        />
                      </Link>
                      <Link to="#">
                        <ImageWithBasePath
                          src="assets/img/icons/channel-02.svg"
                          alt="Img"
                        />
                      </Link>
                      <Link to="#">
                        <ImageWithBasePath
                          src="assets/img/icons/channel-03.svg"
                          alt="Img"
                        />
                      </Link>
                      <Link to="#">
                        <ImageWithBasePath
                          src="assets/img/icons/channel-04.svg"
                          alt="Img"
                        />
                      </Link>
                      <Link to="#">
                        <ImageWithBasePath
                          src="assets/img/icons/channel-05.svg"
                          alt="Img"
                        />
                      </Link>
                      <Link to="#">
                        <ImageWithBasePath
                          src="assets/img/icons/channel-06.svg"
                          alt="Img"
                        />
                      </Link>
                      <Link to="#">
                        <ImageWithBasePath
                          src="assets/img/icons/channel-07.svg"
                          alt="Img"
                        />
                      </Link>
                    </div>
                  </div>
                  {/* end card body */}
                </div>

                <div className="card">
                  <div className="card-header border-0 pb-0">
                    <div className="d-flex align-items-center justify-content-between border-bottom flex-wrap row-gap-3 pb-3">
                      <div className="d-flex align-items-center">
                        <a
                          href="#"
                          className="avatar avatar-lg avatar-rounded flex-shrink-0 me-2"
                        >
                          <ImageWithBasePath
                            src="assets/img/profiles/avatar-03.jpg"
                            alt="Img"
                          />
                        </a>
                        <div>
                          <h6 className="fs-16 mb-1">
                            <a href="#">
                              Richard Smith{" "}
                              <i className="ti ti-circle-check-filled text-success" />
                            </a>
                          </h6>
                          <p className="d-flex align-items-center mb-0">
                            <span className="text-info">@richard442</span>
                            <i className="ti ti-circle-filled fs-7 mx-2" />
                            United Kingdom
                          </p>
                        </div>
                      </div>
                      <div className="d-flex align-items-center">
                        <p className="mb-0 text-dark">About 1 hr ago</p>
                        <div className="dropdown ms-3 me-1">
                          <button
                            className="btn btn-icon bg-transparent d-flex align-items-center text-dark border-0 p-0 btn-sm"
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          >
                            <i className="ti ti-world pe-1" />
                          </button>
                          <ul className="dropdown-menu dropdown-menu-end">
                            <li>
                              <a
                                className="dropdown-item"
                                href="#"
                              >
                                Private
                              </a>
                            </li>
                            <li>
                              <a
                                className="dropdown-item"
                                href="#"
                              >
                                Public
                              </a>
                            </li>
                          </ul>
                        </div>
                        <div className="dropdown">
                          <a
                            href="#"
                            className="d-inline-flex align-items-center show"
                            data-bs-toggle="dropdown"
                            aria-expanded="true"
                          >
                            <i className="ti ti-dots-vertical" />
                          </a>
                          <ul className="dropdown-menu dropdown-menu-end">
                            <li>
                              <a
                                href="#"
                                className="dropdown-item"
                              >
                                <i className="ti ti-edit me-2" />
                                Edit
                              </a>
                            </li>
                            <li>
                              <a
                                href="#"
                                className="dropdown-item"
                              >
                                <i className="ti ti-eye me-2" />
                                Hide Post
                              </a>
                            </li>
                            <li>
                              <a
                                href="#"
                                className="dropdown-item"
                              >
                                <i className="ti ti-report me-2" />
                                Report
                              </a>
                            </li>
                            <li>
                              <a
                                href="#"
                                className="dropdown-item"
                              >
                                <i className="ti ti-trash-x me-2" />
                                Delete
                              </a>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="mb-2">
                      <p className="text-dark fw-medium">
                        "Believe in yourself and all that you are. Know that
                        there is something inside you that is greater than any
                        obstacle.
                        <a
                          href="#"
                          className="text-info link-hover"
                        >
                          #MotivationMonday
                        </a>
                        <a
                          href="#"
                          className="text-info link-hover"
                        >
                          #Inspiration
                        </a>{" "}
                        🌟"
                      </p>
                    </div>
                    <div className="mb-2">
                      <ImageWithBasePath
                        src="assets/img/social/social-feed-01.jpg"
                        className="rounded img-fluid"
                        alt="Img"
                      />
                    </div>
                    <div className="row g-2 mb-2">
                      {galleryImages.map((img, idx) => (
                        <div className="col-md-3" key={idx}>
                          <div
                            className="img-full-view"
                            style={{ cursor: "pointer" }}
                          >
                            <div
                              onClick={() => {
                                setLightboxIndex(idx);
                                setLightboxOpen(true);
                              }}
                            >
                              <ImageWithBasePath
                                src={img.thumb}
                                className="rounded img-fluid"
                                alt="img"
                              />
                              <span className="avatar avatar-md avatar-rounded">
                                <i className="ti ti-eye" />
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Lightbox
                      open={lightboxOpen}
                      close={() => setLightboxOpen(false)}
                      index={lightboxIndex}
                      slides={galleryImages.map((img) => ({ src: img.src }))}
                    />
                    <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3 mb-3">
                      <div className="d-flex align-items-center flex-wrap row-gap-3">
                        <a
                          href="#"
                          className="d-inline-flex align-items-center me-3"
                        >
                          <i className="ti ti-heart me-2" />
                          340K Likes
                        </a>
                        <a
                          href="#"
                          className="d-inline-flex align-items-center me-3"
                        >
                          <i className="ti ti-message-dots me-2" />
                          45 Comments
                        </a>
                        <a
                          href="#"
                          className="d-inline-flex align-items-center"
                        >
                          <i className="ti ti-share-3 me-2" />
                          28 Share
                        </a>
                      </div>
                      <div className="d-flex align-items-center">
                        <a
                          href="#"
                          className="btn btn-icon btn-sm btn-outline-white border-0 rounded-circle"
                        >
                          <i className="ti ti-heart-filled text-danger" />
                        </a>
                        <a
                          href="#"
                          className="btn btn-icon btn-sm btn-outline-white border-0 rounded-circle"
                        >
                          <i className="ti ti-share" />
                        </a>
                        <a
                          href="#"
                          className="btn btn-icon btn-sm btn-outline-white border-0 rounded-circle"
                        >
                          <i className="ti ti-message-star" />
                        </a>
                        <a
                          href="#"
                          className="btn btn-icon btn-sm btn-outline-white border-0 rounded-circle"
                        >
                          <i className="ti ti-bookmark-filled text-warning" />
                        </a>
                      </div>
                    </div>
                    <div className="d-flex align-items-start">
                      <a
                        href="#"
                        className="avatar avatar-rounded me-2 flex-shrink-0"
                      >
                        <ImageWithBasePath
                          src="assets/img/profiles/avatar-04.jpg"
                          alt="Img"
                        />
                      </a>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Comments"
                      />
                    </div>
                  </div>
                  {/* end card body */}
                </div>
                {/* end card */}
                <div className="card">
                  <div className="card-header border-0 pb-0">
                    <div className="d-flex align-items-center justify-content-between border-bottom flex-wrap row-gap-3 pb-3">
                      <div className="d-flex align-items-center">
                        <a
                          href="#"
                          className="avatar avatar-lg avatar-rounded flex-shrink-0 me-2"
                        >
                          <ImageWithBasePath
                            src="assets/img/profiles/avatar-05.jpg"
                            alt="Img"
                          />
                        </a>
                        <div>
                          <h6 className="fs-16 mb-1">
                            <a href="#">
                              Jason Heier{" "}
                              <i className="ti ti-circle-check-filled text-success" />
                            </a>
                          </h6>
                          <p className="d-flex align-items-center mb-0">
                            <span className="text-info">@jason118</span>
                            <i className="ti ti-circle-filled fs-7 mx-2" />{" "}
                            United Kingdom
                          </p>
                        </div>
                      </div>
                      <div className="d-flex align-items-center">
                        <p className="mb-0 text-dark">About 1 hr ago</p>
                        <div className="dropdown ms-3 me-1">
                          <button
                            className="btn btn-icon bg-transparent d-flex align-items-center text-dark border-0 p-0 btn-sm"
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          >
                            <i className="ti ti-world pe-1" />
                          </button>
                          <ul className="dropdown-menu dropdown-menu-end">
                            <li>
                              <a
                                className="dropdown-item"
                                href="#"
                              >
                                Private
                              </a>
                            </li>
                            <li>
                              <a
                                className="dropdown-item"
                                href="#"
                              >
                                Public
                              </a>
                            </li>
                          </ul>
                        </div>
                        <div className="dropdown">
                          <a
                            href="#"
                            className="d-inline-flex align-items-center show"
                            data-bs-toggle="dropdown"
                            aria-expanded="true"
                          >
                            <i className="ti ti-dots-vertical" />
                          </a>
                          <ul className="dropdown-menu dropdown-menu-end">
                            <li>
                              <a
                                href="#"
                                className="dropdown-item"
                              >
                                <i className="ti ti-edit me-2" />
                                Edit
                              </a>
                            </li>
                            <li>
                              <a
                                href="#"
                                className="dropdown-item"
                              >
                                <i className="ti ti-eye me-2" />
                                Hide Post
                              </a>
                            </li>
                            <li>
                              <a
                                href="#"
                                className="dropdown-item"
                              >
                                <i className="ti ti-report me-2" />
                                Report
                              </a>
                            </li>
                            <li>
                              <a
                                href="#"
                                className="dropdown-item"
                              >
                                <i className="ti ti-trash-x me-2" />
                                Delete
                              </a>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="mb-2">
                      <p className="text-dark fw-medium">
                        Drinking water boosts skin health and beauty. Stay
                        hydrated!
                        <a
                          href="#"
                          className="text-info link-hover"
                        >
                          #HealthTips{" "}
                        </a>
                        <a
                          href="#"
                          className="text-info link-hover"
                        >
                          {" "}
                          #Wellness
                        </a>{" "}
                        💧
                      </p>
                    </div>
                    <div className="card shadow-none mb-3">
                      <div className="card-img card-img-hover rounded-0">
                        <a href="#" className="rounded-top">
                          <ImageWithBasePath
                            src="assets/img/social/social-feed-02.jpg"
                            className="rounded-top img-fluid"
                            alt="Img"
                          />
                        </a>
                      </div>
                      <div className="card-body p-2">
                        <h6 className="mb-1 text-truncate">
                          <a href="#">
                            Drinking water boosts skin health and beauty. Stay
                            hydrated!💧
                          </a>
                        </h6>
                        <a href="#">Health.com</a>
                      </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                      <div className="d-flex align-items-center flex-wrap row-gap-3">
                        <a
                          href="#"
                          className="d-inline-flex align-items-center me-3"
                        >
                          <i className="ti ti-heart me-2" />
                          340K Likes
                        </a>
                        <a
                          href="#"
                          className="d-inline-flex align-items-center me-3"
                        >
                          <i className="ti ti-message-dots me-2" />
                          45 Comments
                        </a>
                        <a
                          href="#"
                          className="d-inline-flex align-items-center"
                        >
                          <i className="ti ti-share-3 me-2" />
                          28 Share
                        </a>
                      </div>
                      <div className="d-flex align-items-center">
                        <a
                          href="#"
                          className="btn btn-icon btn-sm btn-outline-white border-0 rounded-circle"
                        >
                          <i className="ti ti-heart" />
                        </a>
                        <a
                          href="#"
                          className="btn btn-icon btn-sm btn-outline-white border-0 rounded-circle"
                        >
                          <i className="ti ti-share" />
                        </a>
                        <a
                          href="#"
                          className="btn btn-icon btn-sm btn-outline-white border-0 rounded-circle"
                        >
                          <i className="ti ti-message-star" />
                        </a>
                        <a
                          href="#"
                          className="btn btn-icon btn-sm btn-outline-white border-0 rounded-circle"
                        >
                          <i className="ti ti-bookmark" />
                        </a>
                      </div>
                    </div>
                  </div>
                  {/* end card body */}
                </div>
                {/* end card */}
                <div className="card">
                  <div className="card-header border-0 pb-0">
                    <div className="d-flex align-items-center justify-content-between border-bottom flex-wrap row-gap-3 pb-3">
                      <div className="d-flex align-items-center">
                        <span className="avatar avatar-lg avatar-rounded flex-shrink-0 me-2">
                          <ImageWithBasePath
                            src="assets/img/profiles/avatar-04.jpg"
                            alt="Img"
                          />
                        </span>
                        <div>
                          <h6 className="fs-16 mb-1">
                            <a href="#">
                              Sophie Headrick{" "}
                              <i className="ti ti-circle-check-filled text-success" />
                            </a>
                          </h6>
                          <p className="d-flex align-items-center mb-0">
                            <span className="text-info">@sophie241</span>
                            <i className="ti ti-circle-filled fs-7 mx-2" />{" "}
                            United Kingdom
                          </p>
                        </div>
                      </div>
                      <div className="d-flex align-items-center">
                        <p className="mb-0 text-dark">About 1 hr ago</p>
                        <div className="dropdown ms-3 me-1">
                          <button
                            className="btn btn-icon bg-transparent d-flex align-items-center text-dark border-0 p-0 btn-sm"
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          >
                            <i className="ti ti-world pe-1" />
                          </button>
                          <ul className="dropdown-menu dropdown-menu-end">
                            <li>
                              <a
                                className="dropdown-item"
                                href="#"
                              >
                                Private
                              </a>
                            </li>
                            <li>
                              <a
                                className="dropdown-item"
                                href="#"
                              >
                                Public
                              </a>
                            </li>
                          </ul>
                        </div>
                        <div className="dropdown">
                          <a
                            href="#"
                            className="d-inline-flex align-items-center show"
                            data-bs-toggle="dropdown"
                            aria-expanded="true"
                          >
                            <i className="ti ti-dots-vertical" />
                          </a>
                          <ul className="dropdown-menu dropdown-menu-end">
                            <li>
                              <a
                                href="#"
                                className="dropdown-item"
                              >
                                <i className="ti ti-edit me-2" />
                                Edit
                              </a>
                            </li>
                            <li>
                              <a
                                href="#"
                                className="dropdown-item"
                              >
                                <i className="ti ti-eye me-2" />
                                Hide Post
                              </a>
                            </li>
                            <li>
                              <a
                                href="#"
                                className="dropdown-item"
                              >
                                <i className="ti ti-report me-2" />
                                Report
                              </a>
                            </li>
                            <li>
                              <a
                                href="#"
                                className="dropdown-item"
                              >
                                <i className="ti ti-trash-x me-2" />
                                Delete
                              </a>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="mb-2">
                      <p className="text-dark fw-medium">
                        Excited to announce the launch of our new product! Get
                        yours now and enjoy a special discount.
                        <a
                          href="#"
                          className="text-info link-hover"
                        >
                          #NewRelease{" "}
                        </a>
                        <a
                          href="#"
                          className="text-info link-hover"
                        >
                          {" "}
                          #Innovation
                        </a>{" "}
                        🎉
                      </p>
                    </div>
                    <div className="mb-2">
                      <ImageWithBasePath
                        src="assets/img/social/social-feed-03.jpg"
                        className="rounded img-fluid"
                        alt="Img"
                      />
                    </div>
                    <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3 mb-3">
                      <div className="d-flex align-items-center flex-wrap row-gap-3">
                        <a
                          href="#"
                          className="d-inline-flex align-items-center me-3"
                        >
                          <i className="ti ti-heart me-2" />
                          340K Likes
                        </a>
                        <a
                          href="#"
                          className="d-inline-flex align-items-center me-3"
                        >
                          <i className="ti ti-message-dots me-2" />
                          45 Comments
                        </a>
                        <a
                          href="#"
                          className="d-inline-flex align-items-center"
                        >
                          <i className="ti ti-share-3 me-2" />
                          28 Share
                        </a>
                      </div>
                      <div className="d-flex align-items-center">
                        <a
                          href="#"
                          className="btn btn-icon btn-sm btn-outline-white border-0 rounded-circle"
                        >
                          <i className="ti ti-heart-filled text-danger" />
                        </a>
                        <a
                          href="#"
                          className="btn btn-icon btn-sm btn-outline-white border-0 rounded-circle"
                        >
                          <i className="ti ti-share" />
                        </a>
                        <a
                          href="#"
                          className="btn btn-icon btn-sm btn-outline-white border-0 rounded-circle"
                        >
                          <i className="ti ti-message-star" />
                        </a>
                        <a
                          href="#"
                          className="btn btn-icon btn-sm btn-outline-white border-0 rounded-circle"
                        >
                          <i className="ti ti-bookmark-filled text-warning" />
                        </a>
                      </div>
                    </div>
                    <div className="d-flex align-items-start mb-3">
                      <a
                        href="#"
                        className="avatar avatar-rounded flex-shrink-0 me-2"
                      >
                        <ImageWithBasePath
                          src="assets/img/profiles/avatar-02.jpg"
                          alt="Img"
                        />
                      </a>
                      <div className="bg-light rounded flex-fill p-2">
                        <div className="d-flex align-items-center mb-1">
                          <h6 className="fs-16 mb-0">
                            <a href="#">Frank Hoffman</a>
                          </h6>
                          <span className="ms-2">12:45 PM</span>
                        </div>
                        <p className="mb-1">
                          Congratulations on the launch! I've been eagerly
                          waiting for this product, and the special discount
                          makes it even more exciting.
                        </p>
                        <a
                          href="#"
                          className="d-inline-flex align-items-center"
                        >
                          <i className="ti ti-share-3 me-2" />
                          Reply
                        </a>
                      </div>
                    </div>
                    <div className="d-flex align-items-start mb-3 ms-4 ps-2">
                      <a
                        href="#"
                        className="avatar avatar-rounded flex-shrink-0 me-2"
                      >
                        <ImageWithBasePath
                          src="assets/img/profiles/avatar-01.jpg"
                          alt="Img"
                        />
                      </a>
                      <div className="bg-light rounded flex-fill p-2">
                        <div className="d-flex align-items-center mb-1">
                          <h6 className="fs-16 mb-0">
                            <a href="#">Sophie Headrick</a>
                          </h6>
                          <span className="ms-2">12:45 PM</span>
                        </div>
                        <p className="mb-1">
                          Thank you so much for your enthusiasm and support!
                        </p>
                        <a
                          href="#"
                          className="d-inline-flex align-items-center"
                        >
                          <i className="ti ti-share-3 me-2" />
                          Reply
                        </a>
                      </div>
                    </div>
                    <div className="d-flex align-items-start mb-3">
                      <a
                        href="#"
                        className="avatar avatar-rounded flex-shrink-0 me-2"
                      >
                        <ImageWithBasePath
                          src="assets/img/profiles/avatar-04.jpg"
                          alt="Img"
                        />
                      </a>
                      <div className="bg-light rounded flex-fill p-2">
                        <div className="d-flex align-items-center mb-1">
                          <h6 className="fs-16 mb-0">
                            <a href="#">Samuel Butler</a>
                          </h6>
                          <span className="ms-2">12:40 PM</span>
                        </div>
                        <p className="mb-1">
                          So thrilled to see this product finally launched! I've
                          heard amazing things about it and am excited to see
                          how it lives up to the hype.
                        </p>
                        <a
                          href="#"
                          className="d-inline-flex align-items-center"
                        >
                          <i className="ti ti-share-3 me-2" />
                          Reply
                        </a>
                      </div>
                    </div>
                    <div>
                      <div className="more-menu">
                        <div className="d-flex align-items-start mb-3">
                          <a
                            href="#"
                            className="avatar avatar-rounded flex-shrink-0 me-2"
                          >
                            <ImageWithBasePath
                              src="assets/img/profiles/avatar-05.jpg"
                              alt="Img"
                            />
                          </a>
                          <div className="bg-light rounded flex-fill p-2">
                            <div className="d-flex align-items-center mb-1">
                              <h6 className="fs-16 mb-0">
                                <a href="#">Samuel Butler</a>
                              </h6>
                              <span className="ms-2">12:40 PM</span>
                            </div>
                            <p className="mb-1">
                              So thrilled to see this product finally launched!
                              I've heard amazing things about it and am excited
                              to see how it lives up to the hype.
                            </p>
                            <a
                              href="#"
                              className="d-inline-flex align-items-center"
                            >
                              <i className="ti ti-share-3 me-2" />
                              Reply
                            </a>
                          </div>
                        </div>
                        <div className="d-flex align-items-start mb-3">
                          <a
                            href="#"
                            className="avatar avatar-rounded flex-shrink-0 me-2"
                          >
                            <ImageWithBasePath
                              src="assets/img/profiles/avatar-06.jpg"
                              alt="Img"
                            />
                          </a>
                          <div className="bg-light rounded flex-fill p-2">
                            <div className="d-flex align-items-center mb-1">
                              <h6 className="fs-16 mb-0">
                                <a href="#">Samuel Butler</a>
                              </h6>
                              <span className="ms-2">12:40 PM</span>
                            </div>
                            <p className="mb-1">
                              So thrilled to see this product finally launched!
                              I've heard amazing things about it and am excited
                              to see how it lives up to the hype.
                            </p>
                            <a
                              href="#"
                              className="d-inline-flex align-items-center"
                            >
                              <i className="ti ti-share-3 me-2" />
                              Reply
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className="view-all text-center mb-3">
                        <a
                          href="#"
                          className="viewall-button link-primary fw-medium"
                        >
                          View All 200 Comments
                        </a>
                      </div>
                    </div>
                    <div className="d-flex align-items-start">
                      <span className="avatar avatar-rounded me-2 flex-shrink-0">
                        <ImageWithBasePath
                          src="assets/img/profiles/avatar-05.jpg"
                          alt="Img"
                        />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Comments"
                      />
                    </div>
                  </div>
                  {/* end card body */}
                </div>
                {/* end card */}
              </div>
            </div>
            {/* end col */}
            <div className="col-xl-3 theiaStickySidebar">
              <div className=" filemanager-left-sidebar">
              <div className="card sticky-class">
                <div className="card-body">
                  <h6 className="mb-3">Peoples</h6>
                  <ul
                    className="nav nav-pills border d-flex p-2 rounded mb-3"
                    id="pills-tab"
                    role="tablist"
                  >
                    <li className="nav-item flex-fill" role="presentation">
                      <button
                        className="nav-link btn active w-100"
                        data-bs-toggle="pill"
                        data-bs-target="#pills-home"
                        type="button"
                        role="tab"
                        aria-selected="true"
                      >
                        General
                      </button>
                    </li>
                    <li className="nav-item flex-fill" role="presentation">
                      <button
                        className="nav-link btn w-100"
                        data-bs-toggle="pill"
                        data-bs-target="#pills-profile"
                        type="button"
                        role="tab"
                        aria-selected="false"
                      >
                        Primary
                      </button>
                    </li>
                  </ul>
                  <div className="tab-content">
                    <div
                      className="tab-pane fade show active"
                      id="pills-home"
                      role="tabpanel"
                    >
                      <div>
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <div className="d-flex align-items-center">
                            <Link
                              to="#"
                              className="avatar avatar-rounded flex-shrink-0 me-2"
                            >
                              <ImageWithBasePath
                                src="assets/img/profiles/avatar-01.jpg"
                                alt="Img"
                              />
                            </Link>
                            <div>
                              <h6 className="d-inline-flex align-items-center fs-14 fw-medium mb-1">
                                <Link to="#">Anthony Lewis</Link>
                                <i className="ti ti-circle-check-filled text-success ms-1" />
                              </h6>
                              <span className="fs-12 d-block">
                                United States
                              </span>
                            </div>
                          </div>
                          <Link to="#" className="btn btn-sm btn-icon">
                            <i className="ti ti-user-x" />
                          </Link>
                        </div>
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <div className="d-flex align-items-center">
                            <Link
                              to="#"
                              className="avatar avatar-rounded flex-shrink-0 me-2"
                            >
                              <ImageWithBasePath
                                src="assets/img/users/user-01.jpg"
                                alt="Img"
                              />
                            </Link>
                            <div>
                              <h6 className="d-inline-flex align-items-center fs-14 fw-medium mb-1">
                                <Link to="#">Harvey Smith</Link>
                              </h6>
                              <span className="fs-12 d-block">Ukrain</span>
                            </div>
                          </div>
                          <Link to="#" className="btn btn-sm btn-icon">
                            <i className="ti ti-user-x" />
                          </Link>
                        </div>
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <div className="d-flex align-items-center">
                            <Link
                              to="#"
                              className="avatar avatar-rounded flex-shrink-0 me-2"
                            >
                              <ImageWithBasePath
                                src="assets/img/users/user-01.jpg"
                                alt="Img"
                              />
                            </Link>
                            <div>
                              <h6 className="d-inline-flex align-items-center fw-medium mb-1">
                                <Link to="#">Stephan Peralt</Link>
                              </h6>
                              <span className="fs-12 d-block">Isreal</span>
                            </div>
                          </div>
                          <Link to="#" className="btn btn-sm btn-icon">
                            <i className="ti ti-user-x" />
                          </Link>
                        </div>
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <div className="d-flex align-items-center">
                            <Link
                              to="#"
                              className="avatar avatar-rounded flex-shrink-0 me-2"
                            >
                              <ImageWithBasePath
                                src="assets/img/users/user-02.jpg"
                                alt="Img"
                              />
                            </Link>
                            <div>
                              <h6 className="d-inline-flex align-items-center fs-14 fw-medium mb-1">
                                <Link to="#">Doglas Martini</Link>
                              </h6>
                              <span className="fs-12 d-block">Belgium</span>
                            </div>
                          </div>
                          <Link to="#" className="btn btn-sm btn-icon">
                            <i className="ti ti-user-x" />
                          </Link>
                        </div>
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <div className="d-flex align-items-center">
                            <Link
                              to="#"
                              className="avatar avatar-rounded flex-shrink-0 me-2"
                            >
                              <ImageWithBasePath
                                src="assets/img/users/user-09.jpg"
                                alt="Img"
                              />
                            </Link>
                            <div>
                              <h6 className="d-inline-flex align-items-center fs-14 fw-medium mb-1">
                                <Link to="#">Brian Villalobos</Link>
                                <i className="ti ti-circle-check-filled text-success ms-1" />
                              </h6>
                              <span className="fs-12 d-block">
                                United Kingdom
                              </span>
                            </div>
                          </div>
                          <Link to="#" className="btn btn-sm btn-icon">
                            <i className="ti ti-user-x" />
                          </Link>
                        </div>
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <div className="d-flex align-items-center">
                            <Link
                              to="#"
                              className="avatar avatar-rounded flex-shrink-0 me-2"
                            >
                              <ImageWithBasePath
                                src="assets/img/users/user-02.jpg"
                                alt="Img"
                              />
                            </Link>
                            <div>
                              <h6 className="d-inline-flex align-items-center fs-14 fw-medium mb-1">
                                <Link to="#">Linda Ray</Link>
                              </h6>
                              <span className="fs-12 d-block">Argentina</span>
                            </div>
                          </div>
                          <Link to="#" className="btn btn-sm btn-icon">
                            <i className="ti ti-user-x" />
                          </Link>
                        </div>
                      </div>
                      <div>
                        <Link to="#" className="btn btn-white w-100 border">
                          View All <i className="ti ti-arrow-right ms-2" />
                        </Link>
                      </div>
                    </div>
                    <div
                      className="tab-pane fade"
                      id="pills-profile"
                      role="tabpanel"
                    >
                      <div>
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <div className="d-flex align-items-center">
                            <Link
                              to="#"
                              className="avatar avatar-rounded flex-shrink-0 me-2"
                            >
                              <ImageWithBasePath
                                src="assets/img/profiles/avatar-11.jpg"
                                alt="Img"
                              />
                            </Link>
                            <div>
                              <h6 className="d-inline-flex fs-14 align-items-center fw-medium mb-1">
                                <Link to="#">Anthony Lewis</Link>
                                <i className="ti ti-circle-check-filled text-success ms-1" />
                              </h6>
                              <span className="fs-12 d-block">
                                United States
                              </span>
                            </div>
                          </div>
                          <Link to="#" className="btn btn-sm btn-icon">
                            <i className="ti ti-user-x" />
                          </Link>
                        </div>
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <div className="d-flex align-items-center">
                            <Link
                              to="#"
                              className="avatar avatar-rounded flex-shrink-0 me-2"
                            >
                              <ImageWithBasePath
                                src="assets/img/users/user-10.jpg"
                                alt="Img"
                              />
                            </Link>
                            <div>
                              <h6 className="d-inline-flex align-items-center fs-14 fw-medium mb-1">
                                <Link to="#">Harvey Smith</Link>
                              </h6>
                              <span className="fs-12 d-block">Ukrain</span>
                            </div>
                          </div>
                          <Link to="#" className="btn btn-sm btn-icon">
                            <i className="ti ti-user-x" />
                          </Link>
                        </div>
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <div className="d-flex align-items-center">
                            <Link
                              to="#"
                              className="avatar avatar-rounded flex-shrink-0 me-2"
                            >
                              <ImageWithBasePath
                                src="assets/img/users/user-09.jpg"
                                alt="Img"
                              />
                            </Link>
                            <div>
                              <h6 className="d-inline-flex align-items-center fs-14  fw-medium mb-1">
                                <Link to="#">Stephan Peralt</Link>
                              </h6>
                              <span className="fs-12 d-block">Isreal</span>
                            </div>
                          </div>
                          <Link to="#" className="btn btn-sm btn-icon">
                            <i className="ti ti-user-x" />
                          </Link>
                        </div>
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <div className="d-flex align-items-center">
                            <Link
                              to="#"
                              className="avatar avatar-rounded flex-shrink-0 me-2"
                            >
                              <ImageWithBasePath
                                src="assets/img/users/user-08.jpg"
                                alt="Img"
                              />
                            </Link>
                            <div>
                              <h6 className="d-inline-flex fs-14 align-items-center fw-medium mb-1">
                                <Link to="#">Doglas Martini</Link>
                              </h6>
                              <span className="fs-12 d-block">Belgium</span>
                            </div>
                          </div>
                          <Link to="#" className="btn btn-sm btn-icon">
                            <i className="ti ti-user-x" />
                          </Link>
                        </div>
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <div className="d-flex align-items-center">
                            <Link
                              to="#"
                              className="avatar avatar-rounded flex-shrink-0 me-2"
                            >
                              <ImageWithBasePath
                                src="assets/img/users/user-07.jpg"
                                alt="Img"
                              />
                            </Link>
                            <div>
                              <h6 className="d-inline-flex fs-14 align-items-center fw-medium mb-1">
                                <Link to="#">Brian Villalobos</Link>
                                <i className="ti ti-circle-check-filled text-success ms-1" />
                              </h6>
                              <span className="fs-12 d-block">
                                United Kingdom
                              </span>
                            </div>
                          </div>
                          <Link to="#" className="btn btn-sm btn-icon">
                            <i className="ti ti-user-x" />
                          </Link>
                        </div>
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <div className="d-flex align-items-center">
                            <Link
                              to="#"
                              className="avatar avatar-rounded flex-shrink-0 me-2"
                            >
                              <ImageWithBasePath
                                src="assets/img/users/user-06.jpg"
                                alt="Img"
                              />
                            </Link>
                            <div>
                              <h6 className="d-inline-flex align-items-center fs-14 fw-medium mb-1">
                                <Link to="#">Linda Ray</Link>
                              </h6>
                              <span className="fs-12 d-block">Argentina</span>
                            </div>
                          </div>
                          <Link to="#" className="btn btn-sm btn-icon">
                            <i className="ti ti-user-x" />
                          </Link>
                        </div>
                      </div>
                      <div>
                        <Link to="#" className="btn btn-white w-100 border">
                          View All <i className="ti ti-arrow-right ms-2" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                {/* end card body */}
              </div>
              {/* end card */}
              <div className="card">
                <div className="card-body">
                  <h6 className="mb-3">Saved Feeds</h6>
                  <div className="bg-light rounded p-2 mb-2">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <Link to="#" className="d-flex align-items-center">
                        <span>
                          <ImageWithBasePath
                            src="assets/img/icons/feeds-01.svg"
                            className="me-2"
                            alt="Img"
                          />
                        </span>
                        <p className="fs-12 fw-medium">World Health</p>
                      </Link>
                      <Link to="#">
                        <i className="ti ti-bookmark-filled text-warning" />
                      </Link>
                    </div>
                    <p className="text-dark fw-medium">
                      <Link to="#">
                        Retail investor party continues even as
                      </Link>
                    </p>
                  </div>
                  <div className="bg-light rounded p-2 mb-2">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <Link to="#" className="d-flex align-items-center">
                        <span>
                          <ImageWithBasePath
                            src="assets/img/icons/feeds-02.svg"
                            className="me-2"
                            alt="Img"
                          />
                        </span>
                        <p className="fs-12 fw-medium">T3 Tech</p>
                      </Link>
                      <Link to="#">
                        <i className="ti ti-bookmark-filled text-warning" />
                      </Link>
                    </div>
                    <p className="text-dark fw-medium">
                      <Link to="#">Ipad Air (2020) vs Samsung Galaxy Tab</Link>
                    </p>
                  </div>
                  <div className="bg-light rounded p-2 mb-2">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <Link to="#" className="d-flex align-items-center">
                        <span>
                          <ImageWithBasePath
                            src="assets/img/icons/feeds-03.svg"
                            className="me-2"
                            alt="Img"
                          />
                        </span>
                        <p className="fs-12 fw-medium">Fstoppers</p>
                      </Link>
                      <Link to="#">
                        <i className="ti ti-bookmark-filled text-warning" />
                      </Link>
                    </div>
                    <p className="text-dark fw-medium">
                      <Link to="#">Beyond capital gains tax! Top 50 stock</Link>
                    </p>
                  </div>
                  <div className="bg-light rounded p-2">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <Link to="#" className="d-flex align-items-center">
                        <span>
                          <ImageWithBasePath
                            src="assets/img/icons/feeds-04.svg"
                            className="me-2"
                            alt="Img"
                          />
                        </span>
                        <p className="fs-12 fw-medium">Evernote</p>
                      </Link>
                      <Link to="#">
                        <i className="ti ti-bookmark-filled text-warning" />
                      </Link>
                    </div>
                    <p className="text-dark fw-medium">
                      <Link to="#">Sony Just Destroyed the Competition</Link>
                    </p>
                  </div>
                  <div className="mt-3">
                    <Link to="#" className="btn btn-white w-100 border">
                      View All <i className="ti ti-arrow-right ms-2" />
                    </Link>
                  </div>
                </div>
                {/* end card body */}
              </div>
              {/* end card */}
              <div className="card">
                <div className="card-body">
                  <h6 className="mb-3">Trending Hastags</h6>
                  <div className="d-flex align-items-center flex-wrap gap-1">
                    <Link to="#" className="text-info d-inline-flex link-hover">
                      #HealthTips
                    </Link>
                    <Link to="#" className="text-info d-inline-flex link-hover">
                      #Wellness
                    </Link>
                    <Link to="#" className="text-info d-inline-flex link-hover">
                      #Motivation
                    </Link>
                    <Link to="#" className="text-info d-inline-flex link-hover">
                      #Inspiration
                    </Link>
                  </div>
                </div>
                {/* end card body */}
              </div>
              {/* end card */}
              <div className="card">
                <div className="card-body">
                  <div className="card-img card-img-hover mb-3">
                    <Link to="#" className="rounded">
                      <ImageWithBasePath
                        src="assets/img/social/social-feed-04.jpg"
                        className="rounded"
                        alt="Img"
                      />
                    </Link>
                  </div>
                  <h6 className="text-center fs-14">
                    <Link to="#">
                      Enjoy Unlimited Access on a small price monthly.
                    </Link>
                  </h6>
                  <div className="mt-3">
                    <Link to="#" className="btn btn-white w-100 border">
                      Upgrade Now <i className="ti ti-arrow-right ms-2" />
                    </Link>
                  </div>
                </div>
                {/* end card body */}
              </div>
              {/* end card */}
              </div>
            </div>
            {/* end col */}
          </div>
          {/* end row */}
        </div>
        {/* End Content */}
        {/* Footer Start */}
       <Footer/>
        {/* Footer End */}
      </div>
      {/* ========================
			End Page Content
		========================= */}
    </>
  );
};

export default SocialFeed;
