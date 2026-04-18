import { Link } from "react-router"
import Footer from "../../../../components/footer/footer"
import { all_routes } from "../../../../routes/all_routes"
import { Category } from "../../../../core/json/selectOption"
import CommonSelect from "../../../../components/common-select/commonSelect"
import CommonTagInputs from "../../../../components/common-tagInput/commonTagInputs"
import { useState } from "react"

const Addblog = () => {

    const [tags, setTags] = useState<string[]>([]);
const handleTagsChange = (newTags: string[]) => {
setTags(newTags);
};


  return (
   <>
  {/* ========================
			Start Page Content
		========================= */}
  <div className="page-wrapper">
    {/* Start Content */}
    <div className="content">
      <h4 className="mb-4">Add Blog</h4>
      <div className="row">
        <div className="col-lg-10 mx-auto">
          <div className="mb-3">
            <Link
              to={all_routes.blog}
              className="d-inline-flex align-items-center fw-medium"
            >
              <i className="ti ti-arrow-left me-1" />
              All Blogs
            </Link>
          </div>
          {/* Ticket Details */}
          <div className="card mb-0">
            <div className="card-body">
              <div>
                <div className="mb-3">
                  <label className="form-label">
                    Title<span className="text-danger ms-1">*</span>
                  </label>
                  <input type="text" className="form-control" />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Category<span className="text-danger ms-1">*</span>
                  </label>
                   <CommonSelect
                            options={Category}
                            className="select"
                            defaultValue={Category[0]}
                          />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Tags<span className="text-danger ms-1">*</span>
                  </label>
                 <CommonTagInputs
                            initialTags={tags}
                            onTagsChange={handleTagsChange}
                          />
                  <span className="fs-13">Enter value separated by comma</span>
                </div>
                <div className="mb-3">
                  <label className="form-label">Content</label>
                  <div className="editor pages-editor" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Featured Image</label>
                  <div className="file-upload drag-file w-100 d-flex bg-light border shadow align-items-center justify-content-center flex-column">
                    <span className="upload-img d-block mb-1">
                      <i className="ti ti-folder-open text-primary fs-16" />
                    </span>
                    <p className="mb-0 fs-14 text-dark">
                      Drop your files here or{" "}
                      <Link
                        to="#"
                        className="text-decoration-underline text-primary"
                      >
                        browse
                      </Link>
                    </p>
                    <input type="file" accept="video/image" />
                    <p className="fs-13 mb-0">Maximum size : 50 MB</p>
                  </div>
                </div>
              </div>
              <div className="mb-0">
                <label className="form-label">Status</label>
                <div className="d-flex align-items-center">
                  <div className="me-2">
                    <input
                      type="radio"
                      className="status-radio"
                      id="add-active"
                      name="status"
                    />
                    <label htmlFor="add-active">Active</label>
                  </div>
                  <div>
                    <input
                      type="radio"
                      className="status-radio"
                      id="add-inactive"
                      name="status"
                    />
                    <label htmlFor="add-inactive">Inactive</label>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-footer">
              <div className="d-flex align-items-center justify-content-end">
                <Link to="#" className="btn btn-light me-3">
                  Cancel
                </Link>
                <Link to="#" className="btn btn-primary">
                  Create New
                </Link>
              </div>
            </div>
          </div>
          {/* /Ticket Details */}
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

export default Addblog