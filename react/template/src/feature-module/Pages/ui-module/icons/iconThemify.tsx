import { useEffect } from "react";
import "../../../../assets/icon/themify/themify.css";

const IconThemify = () => {
  useEffect(() => {
    const loadCSS = async () => {
      // Dynamically import the CSS file
      await import("../../../../assets/icon/themify/themify.css");
    };

    loadCSS();

    // Optionally, cleanup if you want to remove the CSS when the component unmounts
    return () => {
      // Find the link element with the href that includes the CSS file path and remove it
      const linkElement: any = document.querySelector(
        'link[href*="themify.css"]'
      );
      if (linkElement) {
        linkElement.parentNode.removeChild(linkElement);
      }
    };
  }, []);
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
            <h4 className="mb-1">Themify Icon</h4>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0 p-0">
                <li className="breadcrumb-item">
                  <a href="index.html">Home</a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#">Icons</a>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Themify Icon
                </li>
              </ol>
            </nav>
          </div>
          {/* End Page Header */}
          {/* start row */}
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Themify Icon</div>
                </div>
                <div className="card-body">
                  <div className="icons-list">
                    <div className="icons-list-item">
                      <i
                        className="ti-arrow-up"
                        data-bs-toggle="tooltip"
                        title="ti-arrow-up"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-arrow-right"
                        data-bs-toggle="tooltip"
                        title="ti-arrow-right"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-arrow-left"
                        data-bs-toggle="tooltip"
                        title="ti-arrow-left"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-arrow-down"
                        data-bs-toggle="tooltip"
                        title="ti-arrow-down"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-arrows-vertical"
                        data-bs-toggle="tooltip"
                        title="ti-arrows-vertical"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-arrows-horizontal"
                        data-bs-toggle="tooltip"
                        title="ti-arrows-horizontal"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-angle-up"
                        data-bs-toggle="tooltip"
                        title="ti-angle-up"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-angle-right"
                        data-bs-toggle="tooltip"
                        title="ti-angle-right"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-angle-left"
                        data-bs-toggle="tooltip"
                        title="ti-angle-left"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-angle-down"
                        data-bs-toggle="tooltip"
                        title="ti-angle-down"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-angle-double-up"
                        data-bs-toggle="tooltip"
                        title="ti-angle-double-up"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-angle-double-right"
                        data-bs-toggle="tooltip"
                        title="ti-angle-double-right"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-angle-double-left"
                        data-bs-toggle="tooltip"
                        title="ti-angle-double-left"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-angle-double-down"
                        data-bs-toggle="tooltip"
                        title="ti-angle-double-down"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-move"
                        data-bs-toggle="tooltip"
                        title="ti-move"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-fullscreen"
                        data-bs-toggle="tooltip"
                        title="ti-fullscreen"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-arrow-top-right"
                        data-bs-toggle="tooltip"
                        title="ti-arrow-top-right"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-arrow-top-left"
                        data-bs-toggle="tooltip"
                        title="ti-arrow-top-left"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-arrow-circle-up"
                        data-bs-toggle="tooltip"
                        title="ti-arrow-circle-up"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-arrow-circle-right"
                        data-bs-toggle="tooltip"
                        title="ti-arrow-circle-right"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-arrow-circle-left"
                        data-bs-toggle="tooltip"
                        title="ti-arrow-circle-left"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-arrow-circle-down"
                        data-bs-toggle="tooltip"
                        title="ti-arrow-circle-down"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-arrows-corner"
                        data-bs-toggle="tooltip"
                        title="ti-arrows-corner"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-split-v"
                        data-bs-toggle="tooltip"
                        title="ti-split-v"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-split-v-alt"
                        data-bs-toggle="tooltip"
                        title="ti-split-v-alt"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-split-h"
                        data-bs-toggle="tooltip"
                        title="ti-split-h"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-hand-point-up"
                        data-bs-toggle="tooltip"
                        title="ti-hand-point-up"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-hand-point-right"
                        data-bs-toggle="tooltip"
                        title="ti-hand-point-right"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-hand-point-left"
                        data-bs-toggle="tooltip"
                        title="ti-hand-point-left"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-hand-point-down"
                        data-bs-toggle="tooltip"
                        title="ti-hand-point-down"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-back-right"
                        data-bs-toggle="tooltip"
                        title="ti-back-right"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-back-left"
                        data-bs-toggle="tooltip"
                        title="ti-back-left"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-exchange-vertical"
                        data-bs-toggle="tooltip"
                        title="ti-exchange-vertical"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-wand"
                        data-bs-toggle="tooltip"
                        title="ti-wand"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-save"
                        data-bs-toggle="tooltip"
                        title="ti-save"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-save-alt"
                        data-bs-toggle="tooltip"
                        title="ti-save-alt"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-direction"
                        data-bs-toggle="tooltip"
                        title="ti-direction"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-direction-alt"
                        data-bs-toggle="tooltip"
                        title="ti-direction-alt"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-user"
                        data-bs-toggle="tooltip"
                        title="ti-user"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-link"
                        data-bs-toggle="tooltip"
                        title="ti-link"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-unlink"
                        data-bs-toggle="tooltip"
                        title="ti-unlink"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-trash"
                        data-bs-toggle="tooltip"
                        title="ti-trash"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-target"
                        data-bs-toggle="tooltip"
                        title="ti-target"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-tag"
                        data-bs-toggle="tooltip"
                        title="ti-tag"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-desktop"
                        data-bs-toggle="tooltip"
                        title="ti-desktop"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-tablet"
                        data-bs-toggle="tooltip"
                        title="ti-tablet"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-mobile"
                        data-bs-toggle="tooltip"
                        title="ti-mobile"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-email"
                        data-bs-toggle="tooltip"
                        title="ti-email"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-star"
                        data-bs-toggle="tooltip"
                        title="ti-star"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-spray"
                        data-bs-toggle="tooltip"
                        title="ti-spray"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-signal"
                        data-bs-toggle="tooltip"
                        title="ti-signal"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-shopping-cart"
                        data-bs-toggle="tooltip"
                        title="ti-shopping-cart"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-shopping-cart-full"
                        data-bs-toggle="tooltip"
                        title="ti-shopping-cart-full"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-settings"
                        data-bs-toggle="tooltip"
                        title="ti-settings"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-search"
                        data-bs-toggle="tooltip"
                        title="ti-search"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-zoom-in"
                        data-bs-toggle="tooltip"
                        title="ti-zoom-in"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-zoom-out"
                        data-bs-toggle="tooltip"
                        title="ti-zoom-out"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-cut"
                        data-bs-toggle="tooltip"
                        title="ti-cut"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-ruler"
                        data-bs-toggle="tooltip"
                        title="ti-ruler"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-ruler-alt-2"
                        data-bs-toggle="tooltip"
                        title="ti-ruler-alt-2"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-ruler-pencil"
                        data-bs-toggle="tooltip"
                        title="ti-ruler-pencil"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-ruler-alt"
                        data-bs-toggle="tooltip"
                        title="ti-ruler-alt"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-bookmark"
                        data-bs-toggle="tooltip"
                        title="ti-bookmark"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-bookmark-alt"
                        data-bs-toggle="tooltip"
                        title="ti-bookmark-alt"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-reload"
                        data-bs-toggle="tooltip"
                        title="ti-reload"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-plus"
                        data-bs-toggle="tooltip"
                        title="ti-plus"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-minus"
                        data-bs-toggle="tooltip"
                        title="ti-minus"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-close"
                        data-bs-toggle="tooltip"
                        title="ti-close"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-pin"
                        data-bs-toggle="tooltip"
                        title="ti-pin"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-pencil"
                        data-bs-toggle="tooltip"
                        title="ti-pencil"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-pencil-alt"
                        data-bs-toggle="tooltip"
                        title="ti-pencil-alt"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-paint-roller"
                        data-bs-toggle="tooltip"
                        title="ti-paint-roller"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-paint-bucket"
                        data-bs-toggle="tooltip"
                        title="ti-paint-bucket"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i className="ti-na" data-bs-toggle="tooltip" title="ti-na" />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-medall"
                        data-bs-toggle="tooltip"
                        title="ti-medall"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-medall-alt"
                        data-bs-toggle="tooltip"
                        title="ti-medall-alt"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-marker"
                        data-bs-toggle="tooltip"
                        title="ti-marker"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-marker-alt"
                        data-bs-toggle="tooltip"
                        title="ti-marker-alt"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-lock"
                        data-bs-toggle="tooltip"
                        title="ti-lock"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-unlock"
                        data-bs-toggle="tooltip"
                        title="ti-unlock"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-location-arrow"
                        data-bs-toggle="tooltip"
                        title="ti-location-arrow"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-layout"
                        data-bs-toggle="tooltip"
                        title="ti-layout"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-layers"
                        data-bs-toggle="tooltip"
                        title="ti-layers"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-layers-alt"
                        data-bs-toggle="tooltip"
                        title="ti-layers-alt"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-key"
                        data-bs-toggle="tooltip"
                        title="ti-key"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-image"
                        data-bs-toggle="tooltip"
                        title="ti-image"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-heart"
                        data-bs-toggle="tooltip"
                        title="ti-heart"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-heart-broken"
                        data-bs-toggle="tooltip"
                        title="ti-heart-broken"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-hand-stop"
                        data-bs-toggle="tooltip"
                        title="ti-hand-stop"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-hand-open"
                        data-bs-toggle="tooltip"
                        title="ti-hand-open"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-hand-drag"
                        data-bs-toggle="tooltip"
                        title="ti-hand-drag"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-flag"
                        data-bs-toggle="tooltip"
                        title="ti-flag"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-flag-alt"
                        data-bs-toggle="tooltip"
                        title="ti-flag-alt"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-flag-alt-2"
                        data-bs-toggle="tooltip"
                        title="ti-flag-alt-2"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-eye"
                        data-bs-toggle="tooltip"
                        title="ti-eye"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-import"
                        data-bs-toggle="tooltip"
                        title="ti-import"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-export"
                        data-bs-toggle="tooltip"
                        title="ti-export"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-cup"
                        data-bs-toggle="tooltip"
                        title="ti-cup"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-crown"
                        data-bs-toggle="tooltip"
                        title="ti-crown"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-comments"
                        data-bs-toggle="tooltip"
                        title="ti-comments"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-comment"
                        data-bs-toggle="tooltip"
                        title="ti-comment"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-comment-alt"
                        data-bs-toggle="tooltip"
                        title="ti-comment-alt"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-thought"
                        data-bs-toggle="tooltip"
                        title="ti-thought"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-clip"
                        data-bs-toggle="tooltip"
                        title="ti-clip"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-check"
                        data-bs-toggle="tooltip"
                        title="ti-check"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-check-box"
                        data-bs-toggle="tooltip"
                        title="ti-check-box"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-camera"
                        data-bs-toggle="tooltip"
                        title="ti-camera"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-announcement"
                        data-bs-toggle="tooltip"
                        title="ti-announcement"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-brush"
                        data-bs-toggle="tooltip"
                        title="ti-brush"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-brush-alt"
                        data-bs-toggle="tooltip"
                        title="ti-brush-alt"
                      />
                    </div>
                    <div className="icons-list-item">
                      <i
                        className="ti-palette"
                        data-bs-toggle="tooltip"
                        title="ti-palette"
                      />
                    </div>
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
            <a
              href="javascript:void(0);"
              className="link-primary text-decoration-underline"
            >
              CRMS
            </a>
          </p>
          <div className="d-flex align-items-center gap-2 footer-links justify-content-center justify-content-md-end">
            <a href="javascript:void(0);">About</a>
            <a href="javascript:void(0);">Terms</a>
            <a href="javascript:void(0);">Contact Us</a>
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

export default IconThemify;
