
import ImageWithBasePath from "../../../../components/imageWithBasePath";
import CommonUiPageHeader from "../../../../components/commonUiPageHeader/commonUiPageHeader";
import Footer from "../../../../components/footer/footer";


const UiImages = () => {
  return (
    <>
      {/* ========================
			Start Page Content
		========================= */}
      <div className="page-wrapper">
        {/* Start Content */}
        <div className="content pb-0">
          {/* Page Header */}
          <CommonUiPageHeader
            title="Images"
            breadcrumbs={[
              { label: "Home", path: "/dashboard/deals-dashboard" },
              { label: "Base UI" },
              { label: "Images", active: true },
            ]}
          />

          {/* End Page Header */}
          {/* start row */}
          <div className="row">
            <div className="col-xl-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title">Images Shapes</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-xl-12">
                      <p className="text-muted">
                        Add classes to an <code>&lt;img&gt;</code> element to
                        easily style images in any project.
                      </p>
                      <div className="row">
                        <div className="col-sm-3">
                          <ImageWithBasePath
                            src="assets/img/media/img-4.jpg"
                            alt="image"
                            className="img-fluid rounded"
                            width={200}
                          />
                          <p className="mb-0">
                            <code>.rounded</code>
                          </p>
                        </div>
                        <div className="col-sm-3">
                          <ImageWithBasePath
                            src="assets/img/profiles/avatar-03.jpg"
                            alt="image"
                            className="img-fluid rounded-circle"
                            width={133}
                          />
                          <p className="mb-0">
                            <code>.rounded-circle</code>
                          </p>
                        </div>
                        <div className="col-sm-3">
                          <ImageWithBasePath
                            src="assets/img/media/img-1.jpg"
                            alt="image"
                            className="img-fluid img-thumbnail"
                            width={200}
                          />
                          <p className="mb-0">
                            <code>.img-thumbnail</code>
                          </p>
                        </div>
                        <div className="col-sm-3">
                          <ImageWithBasePath
                            src="assets/img/profiles/avatar-02.jpg"
                            alt="image"
                            className="img-thumbnail rounded-pill"
                            width={133}
                          />
                          <p className="mb-0">
                            <code>.rounded-pill</code>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>{" "}
                {/* end card body */}
              </div>{" "}
              {/* end card */}
            </div>{" "}
            {/* end col */}
          </div>
          {/* end row */}
          <div className="row">
            <div className="col-xl-4">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title">Image Left Align</h5>
                </div>
                <div className="card-body">
                  <ImageWithBasePath
                    className="rounded float-start"
                    src="assets/img/media/img-1.jpg"
                    alt="..."
                    width={200}
                  />
                </div>{" "}
                {/* end card body */}
              </div>{" "}
              {/* end card */}
            </div>{" "}
            {/* end col */}
            <div className="col-xl-4">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title">Image Center Align</h5>
                </div>
                <div className="card-body">
                  <ImageWithBasePath
                    className="rounded mx-auto d-block"
                    src="assets/img/media/img-1.jpg"
                    alt="..."
                    width={200}
                  />
                </div>{" "}
                {/* end card body */}
              </div>{" "}
              {/* end card */}
            </div>{" "}
            {/* end col */}
            <div className="col-xl-4">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title">Image Right Align</h5>
                </div>
                <div className="card-body">
                  <ImageWithBasePath
                    className="rounded float-end"
                    src="assets/img/media/img-1.jpg"
                    alt="..."
                    width={200}
                  />
                </div>{" "}
                {/* end card body */}
              </div>{" "}
              {/* end card */}
            </div>{" "}
            {/* end col */}
            <div className="col-xl-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title">Figures</h5>
                </div>
                <div className="card-body d-flex justify-content-between gap-2 pb-1">
                  <figure className="figure">
                    <ImageWithBasePath
                      className="bd-placeholder-img figure-img img-fluid rounded card-img"
                      src="assets/img/media/img-1.jpg"
                      alt="..."
                    />
                    <figcaption className="figure-caption">
                      A caption for the above image.
                    </figcaption>
                  </figure>
                  <figure className="figure float-end">
                    <ImageWithBasePath
                      className="bd-placeholder-img figure-img img-fluid rounded card-img"
                      src="assets/img/media/img-1.jpg"
                      alt="..."
                    />
                    <figcaption className="figure-caption text-end">
                      A caption for the above image.
                    </figcaption>
                  </figure>
                </div>{" "}
                {/* end card body */}
              </div>{" "}
              {/* end card */}
            </div>{" "}
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
  );
};

export default UiImages;
