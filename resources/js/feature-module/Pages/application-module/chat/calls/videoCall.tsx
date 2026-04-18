import { Link } from "react-router"
import ImageWithBasePath from "../../../../../components/imageWithBasePath"
import PageHeader from "../../../../../components/page-header/pageHeader"
import Footer from "../../../../../components/footer/footer"
import { useState } from "react"


const VideoCall = () => {

 const [isFullscreen, setIsFullscreen] = useState(false);
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        setIsFullscreen(false);
      }
    }
  };

  return (
    <>
  {/* ========================
			Start Page Content
		========================= */}
  <div className="page-wrapper">
    {/* Start Content */}
    <div className="content">
      {/* Page Header */}
      <PageHeader title="Video Call" badgeCount={false} moduleTitle="Application" showModuleTile={true} showExport={false} />

      {/* End Page Header */}
      {/* start row */}
      <div className="row">
        <div className="col-xxl-12">
          <div className="single-video d-flex">
            <div className="join-video flex-fill position-relative">
              <ImageWithBasePath
                src="assets/img/social/video.jpg"
                className="img-fluid"
                alt="Logo"
              />
              <div className="chat-active-users">
                <div className="video-avatar position-absolute p-2 top-0 end-0">
                  <ImageWithBasePath
                    src="./assets/img/users/user-01.jpg"
                    className="img-fluid rounded border border-primary"
                    alt="Logo"
                  />
                  <div className="position-absolute start-0 bottom-0 w-100 text-center py-2">
                    <span className="bg-white text-dark d-inline-block fw-medium rounded p-1 my-2">
                      Joe Lewis
                    </span>
                  </div>
                </div>
              </div>
              <div className="position-absolute start-0 top-0 p-2 z-1 d-flex align-items-center">
                <div className="me-2">
                  <span className="bg-light-subtle rounded badge text-dark p-2 d-inline-flex align-items-center">
                    <i className="ti ti-circle-filled me-1" />
                    40:12
                  </span>
                </div>
                <Link
                  to="#"
                  className="btn p-0 avatar-sm btn-light btnFullscreen	"
                   onClick={toggleFullscreen}
                >
                  <i className="ti ti-maximize" />
                </Link>
              </div>
              <div className="d-flex justify-content-center align-items-center flex-wrap w-100 position-absolute bottom-0 z-2 p-2">
                <div className="bg-light bg-opacity-50 px-3 py-2 rounded-pill d-flex justify-content-center align-items-center">
                  <Link
                    to="#"
                    className="bg-light btn-icon btn-sm bg-light d-flex justify-content-center align-items-center rounded me-2"
                  >
                    <i className="ti ti-microphone" />
                  </Link>
                  <Link
                    to="#"
                    className="bg-light btn-icon btn-sm bg-light d-flex justify-content-center align-items-center rounded me-2"
                  >
                    <i className="ti ti-video" />
                  </Link>
                  <Link
                    to="#"
                    className="btn btn-icon btn-lg text-white bg-danger d-flex justify-content-center align-items-center rounded"
                  >
                    <i className="ti ti-phone" />
                  </Link>
                  <Link
                    to="#"
                    className="bg-light btn-icon btn-sm bg-light d-flex justify-content-center align-items-center rounded mx-2"
                  >
                    <i className="ti ti-volume" />
                  </Link>
                  <Link
                    to="#"
                    className="bg-light text-dark btn-icon btn-sm d-flex align-items-center justify-content-center rounded"
                  >
                    <i className="ti ti-user-off" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* end col */}
      </div>
      {/* end row */}
    </div>
    {/* End Content */}
    {/* Start Footer */}
   <Footer/>
    {/* End Footer */}
  </div>
  {/* ========================
			End Page Content
		========================= */}
</>

  )
}

export default VideoCall