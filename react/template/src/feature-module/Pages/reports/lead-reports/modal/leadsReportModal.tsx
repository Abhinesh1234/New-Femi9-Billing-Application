import CommonSelect from "../../../../../components/common-select/commonSelect";
import {
  File_Type,
  File_Type_2,
  Position,
  Select_Year,
  Source,
} from "../../../../../core/json/selectOption";

const LeadsReportModal = () => {
  return (
    <>
      {/* Start Download Modal */}
      <div className="modal custom-modal fade" id="download_report">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Download Report</h5>
              <button
                type="button"
                className="btn-close custom-btn-close border p-1 me-0 text-dark"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <form action="#">
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">
                    File Type <span className="text-danger">*</span>
                  </label>
                  <CommonSelect
                    options={File_Type}
                    className="select"
                    defaultValue={File_Type[0]}
                  />
                </div>
                <div className="mb-3">
                  <h5>Filters</h5>
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    File Type <span className="text-danger">*</span>
                  </label>
                  <CommonSelect
                    options={File_Type_2}
                    className="select"
                    defaultValue={File_Type_2[0]}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Position<span className="text-danger">*</span>
                  </label>
                  <CommonSelect
                    options={Position}
                    className="select"
                    defaultValue={Position[0]}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Source<span className="text-danger">*</span>
                  </label>
                  <CommonSelect
                    options={Source}
                    className="select"
                    defaultValue={Source[0]}
                  />
                </div>
                <div>
                  <label className="form-label">
                    Select Year<span className="text-danger">*</span>
                  </label>
                  <CommonSelect
                    options={Select_Year}
                    className="select"
                    defaultValue={Select_Year[0]}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="submit"
                  className="btn btn-light btn-sm me-2"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Download Now
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* End Download Modal */}
    </>
  );
};

export default LeadsReportModal;
