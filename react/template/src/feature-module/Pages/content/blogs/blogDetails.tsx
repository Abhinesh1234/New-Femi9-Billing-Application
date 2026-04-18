import { Link } from "react-router"
import Footer from "../../../../components/footer/footer"
import { all_routes } from "../../../../routes/all_routes"
import ImageWithBasePath from "../../../../components/imageWithBasePath"


const BlogDetails = () => {
  return (
   <>
  {/* ========================
			Start Page Content
		========================= */}
  <div className="page-wrapper">
    {/* Start Content */}
    <div className="content">
      <div className="row">
        <div className="col-lg-10 mx-auto">
          <div className="mb-4">
            <Link
              to={all_routes.blog}
              className="d-inline-flex align-items-center fw-medium"
            >
              <i className="ti ti-arrow-left me-1" />
              All Blogs
            </Link>
          </div>
          <h4 className="mb-4">Improve Efficiency for Sales</h4>
          {/* Blog Details */}
          <div className="mb-4 rounded">
            <ImageWithBasePath
              src="assets/img/blogs/blog-details-1.jpg"
              alt="img"
              className="img-fluid rounded w-100"
            />
          </div>
          <div className="card mb-0">
            <div className="card-body">
              <p>
                Boosting sales efficiency is essential for business growth, and
                a CRM system can play a vital role in streamlining sales
                processes. By centralizing customer data, automating repetitive
                tasks, and tracking interactions, CRM tools allow sales teams to
                focus more on closing deals and building relationships. It
                minimizes time spent on manual updates and follow-ups, ensuring
                no leads fall through the cracks. With insightful analytics and
                performance tracking, sales managers can make smarter,
                data-driven decisions. Ultimately, CRM platforms help businesses
                shorten sales cycles, increase conversion rates, and enhance
                customer satisfaction — all critical for driving long-term
                success.
              </p>
              <p className="mb-4">
                CRM systems not only organize your sales pipeline but also
                enable better team collaboration and communication. With
                real-time access to customer insights and sales activities,
                teams can respond faster and more effectively. This results in
                improved productivity, higher customer engagement, and a
                consistent approach to meeting sales goals and boosting revenue.
              </p>
              <h6 className="mb-3">Latest Tags</h6>
              <div className="d-flex align-items-center flex-wrap gap-2">
                <Link
                  to="#"
                  className="btn btn-xs fs-12 fw-medium btn-light me-2"
                >
                  Sales Efficiency
                </Link>
                <Link
                  to="#"
                  className="btn btn-xs fs-12 fw-medium btn-light me-2"
                >
                  CRM Strategies
                </Link>
                <Link
                  to="#"
                  className="btn btn-xs fs-12 fw-medium btn-light me-2"
                >
                  Sales Productivity
                </Link>
                <Link
                  to="#"
                  className="btn btn-xs fs-12 fw-medium btn-light me-2"
                >
                  Customer Relationship
                </Link>
                <Link
                  to="#"
                  className="btn btn-xs fs-12 fw-medium btn-light me-2"
                >
                  Sales Automation
                </Link>
                <Link
                  to="#"
                  className="btn btn-xs fs-12 fw-medium btn-light"
                >
                  Business Growth
                </Link>
              </div>
            </div>
          </div>
          {/* /Blog Details */}
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
</>

  )
}

export default BlogDetails