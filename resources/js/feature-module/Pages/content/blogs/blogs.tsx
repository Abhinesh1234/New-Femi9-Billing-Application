import { Link } from "react-router";
import Footer from "../../../../components/footer/footer";
import PageHeader from "../../../../components/page-header/pageHeader";
import { all_routes } from "../../../../routes/all_routes";
import ImageWithBasePath from "../../../../components/imageWithBasePath";

const Blogs = () => {
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
            title="All Blogs"
            badgeCount={125}
            moduleTitle="Blogs"
            showModuleTile={true}
            showExport={true}
          />
          {/* End Page Header */}
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
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
                <Link to={all_routes.addblog} className="btn btn-primary">
                  <i className="ti ti-square-rounded-plus-filled me-1" />
                  Add Blog
                </Link>
              </div>
            </div>
          </div>
          {/* start row */}
          <div className="row row-gap-3">
            <div className="col-md-6 col-lg-4">
              <div className="card blog-item mb-0">
                <div className="card-body">
                  <div className="blog-img rounded position-relative mb-3">
                    <Link to={all_routes.blogDetails}>
                      <ImageWithBasePath
                        src="assets/img/blogs/blog-1.jpg"
                        alt="img"
                        className="img-fluid position-relative rounded"
                      />
                    </Link>
                    <Link
                      to="#"
                      className="btn btn-xs btn-info position-absolute fs-12 py-0 top-0 start-0 mt-2 ms-2"
                    >
                      Sales Optimization
                    </Link>
                  </div>
                  <div className="blog-content">
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                      <span>
                        <i className="ti ti-message-minus me-1" />
                        40 Comments
                      </span>
                      <span>
                        <i className="ti ti-calendar me-1" />
                        27 May 2025
                      </span>
                    </div>
                    <div className="mb-3">
                      <h6 className="mb-2">
                        <Link to={all_routes.blogDetails}>
                          Improve Efficiency for Sales
                        </Link>
                      </h6>
                      <p className="mb-0 truncate-2-lines">
                        Discover how to optimize tools to boost your sales
                        team’s productivity and track important metrics.
                      </p>
                    </div>
                    <hr />
                    <div className="d-flex align-items-center justify-content-between">
                      <Link
                        to={all_routes.editblog}
                        className="btn btn-xs px-3 fs-12 btn-outline-dark"
                      >
                        <i className="ti ti-edit me-1" />
                        Edit
                      </Link>
                      <span className="badge badge-sm badge-soft-success">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* end col */}
            <div className="col-md-6 col-lg-4">
              <div className="card blog-item mb-0">
                <div className="card-body">
                  <div className="blog-img rounded position-relative mb-3">
                    <Link to={all_routes.blogDetails}>
                      <ImageWithBasePath
                        src="assets/img/blogs/blog-2.jpg"
                        alt="img"
                        className="img-fluid position-relative rounded"
                      />
                    </Link>
                    <Link
                      to="#"
                      className="btn btn-xs btn-info position-absolute fs-12 py-0 top-0 start-0 mt-2 ms-2"
                    >
                      Automation
                    </Link>
                  </div>
                  <div className="blog-content">
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                      <span>
                        <i className="ti ti-message-minus me-1" />
                        123 Comments
                      </span>
                      <span>
                        <i className="ti ti-calendar me-1" />
                        15 May 2025
                      </span>
                    </div>
                    <div className="mb-3">
                      <h6 className="mb-2">
                        <Link to={all_routes.blogDetails}>
                          Automation Benefits for Growth
                        </Link>
                      </h6>
                      <p className="mb-0 truncate-2-lines">
                        Learn how automation features can streamline workflows
                        and accelerate your business’s growth effortlessly.
                      </p>
                    </div>
                    <hr />
                    <div className="d-flex align-items-center justify-content-between">
                      <Link
                        to={all_routes.editblog}
                        className="btn btn-xs px-3 fs-12 btn-outline-dark"
                      >
                        <i className="ti ti-edit me-1" />
                        Edit
                      </Link>
                      <span className="badge badge-sm badge-soft-danger">
                        Inactive
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* end col */}
            <div className="col-md-6 col-lg-4">
              <div className="card blog-item mb-0">
                <div className="card-body">
                  <div className="blog-img rounded position-relative mb-3">
                    <Link to={all_routes.blogDetails}>
                      <ImageWithBasePath
                        src="assets/img/blogs/blog-3.jpg"
                        alt="img"
                        className="img-fluid position-relative rounded"
                      />
                    </Link>
                    <Link
                      to="#"
                      className="btn btn-xs btn-info position-absolute fs-12 py-0 top-0 start-0 mt-2 ms-2"
                    >
                      Marketing
                    </Link>
                  </div>
                  <div className="blog-content">
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                      <span>
                        <i className="ti ti-message-minus me-1" />
                        54 Comments
                      </span>
                      <span>
                        <i className="ti ti-calendar me-1" />
                        04 May 2025
                      </span>
                    </div>
                    <div className="mb-3">
                      <h6 className="mb-2">
                        <Link to={all_routes.blogDetails}>
                          Marketing Integration Guide
                        </Link>
                      </h6>
                      <p className="mb-0 truncate-2-lines">
                        Explore seamless integration strategies between customer
                        management and marketing tools to enhance outreach and
                        engagement.
                      </p>
                    </div>
                    <hr />
                    <div className="d-flex align-items-center justify-content-between">
                      <Link
                        to={all_routes.editblog}
                        className="btn btn-xs px-3 fs-12 btn-outline-dark"
                      >
                        <i className="ti ti-edit me-1" />
                        Edit
                      </Link>
                      <span className="badge badge-sm badge-soft-success">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* end col */}
            <div className="col-md-6 col-lg-4">
              <div className="card blog-item mb-0">
                <div className="card-body">
                  <div className="blog-img rounded position-relative mb-3">
                    <Link to={all_routes.blogDetails}>
                      <ImageWithBasePath
                        src="assets/img/blogs/blog-4.jpg"
                        alt="img"
                        className="img-fluid position-relative rounded"
                      />
                    </Link>
                    <Link
                      to="#"
                      className="btn btn-xs btn-info position-absolute fs-12 py-0 top-0 start-0 mt-2 ms-2"
                    >
                      Implementation
                    </Link>
                  </div>
                  <div className="blog-content">
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                      <span>
                        <i className="ti ti-message-minus me-1" />
                        152 Comments
                      </span>
                      <span>
                        <i className="ti ti-calendar me-1" />
                        29 Apr 2025
                      </span>
                    </div>
                    <div className="mb-3">
                      <h6 className="mb-2">
                        <Link to={all_routes.blogDetails}>Avoid Setup Mistakes</Link>
                      </h6>
                      <p className="mb-0 truncate-2-lines">
                        Identify common pitfalls in implementation and learn
                        proactive steps to avoid costly mistakes during setup.
                      </p>
                    </div>
                    <hr />
                    <div className="d-flex align-items-center justify-content-between">
                      <Link
                        to={all_routes.editblog}
                        className="btn btn-xs px-3 fs-12 btn-outline-dark"
                      >
                        <i className="ti ti-edit me-1" />
                        Edit
                      </Link>
                      <span className="badge badge-sm badge-soft-danger">
                        Inactive
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* end col */}
            <div className="col-md-6 col-lg-4">
              <div className="card blog-item mb-0">
                <div className="card-body">
                  <div className="blog-img rounded position-relative mb-3">
                    <Link to={all_routes.blogDetails}>
                      <ImageWithBasePath
                        src="assets/img/blogs/blog-5.jpg"
                        alt="img"
                        className="img-fluid position-relative rounded"
                      />
                    </Link>
                    <Link
                      to="#"
                      className="btn btn-xs btn-info position-absolute fs-12 py-0 top-0 start-0 mt-2 ms-2"
                    >
                      Product Features
                    </Link>
                  </div>
                  <div className="blog-content">
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                      <span>
                        <i className="ti ti-message-minus me-1" />
                        58 Comments
                      </span>
                      <span>
                        <i className="ti ti-calendar me-1" />
                        17 Apr 2025
                      </span>
                    </div>
                    <div className="mb-3">
                      <h6 className="mb-2">
                        <Link to={all_routes.blogDetails}>
                          Top Features for 2025
                        </Link>
                      </h6>
                      <p className="mb-0 truncate-2-lines">
                        Uncover must-have features for 2025 that improve
                        customer relationships and operational efficiency.
                      </p>
                    </div>
                    <hr />
                    <div className="d-flex align-items-center justify-content-between">
                      <Link
                        to={all_routes.editblog}
                        className="btn btn-xs px-3 fs-12 btn-outline-dark"
                      >
                        <i className="ti ti-edit me-1" />
                        Edit
                      </Link>
                      <span className="badge badge-sm badge-soft-success">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* end col */}
            <div className="col-md-6 col-lg-4">
              <div className="card blog-item mb-0">
                <div className="card-body">
                  <div className="blog-img rounded position-relative mb-3">
                    <Link to={all_routes.blogDetails}>
                      <ImageWithBasePath
                        src="assets/img/blogs/blog-6.jpg"
                        alt="img"
                        className="img-fluid position-relative rounded"
                      />
                    </Link>
                    <Link
                      to="#"
                      className="btn btn-xs btn-info position-absolute fs-12 py-0 top-0 start-0 mt-2 ms-2"
                    >
                      Data &amp; Analytics
                    </Link>
                  </div>
                  <div className="blog-content">
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                      <span>
                        <i className="ti ti-message-minus me-1" />
                        78 Comments
                      </span>
                      <span>
                        <i className="ti ti-calendar me-1" />
                        03 Apr 2025
                      </span>
                    </div>
                    <div className="mb-3">
                      <h6 className="mb-2">
                        <Link to={all_routes.blogDetails}>
                          Data Insights for Success
                        </Link>
                      </h6>
                      <p className="mb-0 truncate-2-lines">
                        Leverage data insights to enhance customer engagement,
                        identify opportunities, and make data-driven decisions.
                      </p>
                    </div>
                    <hr />
                    <div className="d-flex align-items-center justify-content-between">
                      <Link
                        to={all_routes.editblog}
                        className="btn btn-xs px-3 fs-12 btn-outline-dark"
                      >
                        <i className="ti ti-edit me-1" />
                        Edit
                      </Link>
                      <span className="badge badge-sm badge-soft-danger">
                        Inactive
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* end col */}
            <div className="col-md-6 col-lg-4">
              <div className="card blog-item mb-0">
                <div className="card-body">
                  <div className="blog-img rounded position-relative mb-3">
                    <Link to={all_routes.blogDetails}>
                      <ImageWithBasePath
                        src="assets/img/blogs/blog-7.jpg"
                        alt="img"
                        className="img-fluid position-relative rounded"
                      />
                    </Link>
                    <Link
                      to="#"
                      className="btn btn-xs btn-info position-absolute fs-12 py-0 top-0 start-0 mt-2 ms-2"
                    >
                      Customization
                    </Link>
                  </div>
                  <div className="blog-content">
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                      <span>
                        <i className="ti ti-message-minus me-1" />
                        56 Comments
                      </span>
                      <span>
                        <i className="ti ti-calendar me-1" />
                        26 Mar 2025
                      </span>
                    </div>
                    <div className="mb-3">
                      <h6 className="mb-2">
                        <Link to={all_routes.blogDetails}>
                          Customizing Effectively
                        </Link>
                      </h6>
                      <p className="mb-0 truncate-2-lines">
                        Tailor your system to fit your business processes,
                        improving usability, adoption, and productivity across
                        teams.
                      </p>
                    </div>
                    <hr />
                    <div className="d-flex align-items-center justify-content-between">
                      <Link
                        to={all_routes.editblog}
                        className="btn btn-xs px-3 fs-12 btn-outline-dark"
                      >
                        <i className="ti ti-edit me-1" />
                        Edit
                      </Link>
                      <span className="badge badge-sm badge-soft-success">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* end col */}
            <div className="col-md-6 col-lg-4">
              <div className="card blog-item mb-0">
                <div className="card-body">
                  <div className="blog-img rounded position-relative mb-3">
                    <Link to={all_routes.blogDetails}>
                      <ImageWithBasePath
                        src="assets/img/blogs/blog-8.jpg"
                        alt="img"
                        className="img-fluid position-relative rounded"
                      />
                    </Link>
                    <Link
                      to="#"
                      className="btn btn-xs btn-info position-absolute fs-12 py-0 top-0 start-0 mt-2 ms-2"
                    >
                      Customization
                    </Link>
                  </div>
                  <div className="blog-content">
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                      <span>
                        <i className="ti ti-message-minus me-1" />
                        97 Comments
                      </span>
                      <span>
                        <i className="ti ti-calendar me-1" />
                        13 Mar 2025
                      </span>
                    </div>
                    <div className="mb-3">
                      <h6 className="mb-2">
                        <Link to={all_routes.blogDetails}>
                          Future Trends &amp; Innovations
                        </Link>
                      </h6>
                      <p className="mb-0 truncate-2-lines">
                        Explore emerging trends and innovations that are shaping
                        the future of customer relationship management.
                      </p>
                    </div>
                    <hr />
                    <div className="d-flex align-items-center justify-content-between">
                      <Link
                        to={all_routes.editblog}
                        className="btn btn-xs px-3 fs-12 btn-outline-dark"
                      >
                        <i className="ti ti-edit me-1" />
                        Edit
                      </Link>
                      <span className="badge badge-sm badge-soft-danger">
                        Inactive
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* end col */}
            <div className="col-md-6 col-lg-4">
              <div className="card blog-item mb-0">
                <div className="card-body">
                  <div className="blog-img rounded position-relative mb-3">
                    <Link to={all_routes.blogDetails}>
                      <ImageWithBasePath
                        src="assets/img/blogs/blog-9.jpg"
                        alt="img"
                        className="img-fluid position-relative rounded"
                      />
                    </Link>
                    <Link
                      to="#"
                      className="btn btn-xs btn-info position-absolute fs-12 py-0 top-0 start-0 mt-2 ms-2"
                    >
                      Training &amp; Adoption
                    </Link>
                  </div>
                  <div className="blog-content">
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                      <span>
                        <i className="ti ti-message-minus me-1" />
                        34 Comments
                      </span>
                      <span>
                        <i className="ti ti-calendar me-1" />
                        06 Mar 2025
                      </span>
                    </div>
                    <div className="mb-3">
                      <h6 className="mb-2">
                        <Link to={all_routes.blogDetails}>User Training Tips</Link>
                      </h6>
                      <p className="mb-0 truncate-2-lines">
                        Ensure your team’s success with essential training
                        strategies and onboarding tips to boost adoption rates.
                      </p>
                    </div>
                    <hr />
                    <div className="d-flex align-items-center justify-content-between">
                      <Link
                        to={all_routes.editblog}
                        className="btn btn-xs px-3 fs-12 btn-outline-dark"
                      >
                        <i className="ti ti-edit me-1" />
                        Edit
                      </Link>
                      <span className="badge badge-sm badge-soft-success">
                        Active
                      </span>
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
        <Footer />
        {/* End Footer */}
      </div>
      {/* ========================
			End Page Content
		========================= */}
    </>
  );
};

export default Blogs;
