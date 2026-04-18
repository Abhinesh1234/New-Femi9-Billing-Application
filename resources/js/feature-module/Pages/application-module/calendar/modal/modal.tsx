import CommonDatePicker from "../../../../../components/common-datePicker/commonDatePicker";
import CommonSelect from "../../../../../components/common-select/commonSelect";
import {
  Category_Color,
  Event_Category,
} from "../../../../../core/json/selectOption";

const Modal = () => {
  return (
    <>
      {/* Add New Event Start */}
      <div className="modal fade" id="add_event">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h6 className="mb-0">Add New Event</h6>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <form>
              <div className="modal-body">
                {/* start row */}
                <div className="row">
                  <div className="col-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Event Name <span className="text-danger">*</span>
                      </label>
                      <input type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Event Date <span className="text-danger">*</span>
                      </label>
                      <div className="input-group w-auto input-group-flat">
                        <CommonDatePicker placeholder="dd/mm/yyyy" />
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div>
                      <label className="form-label">
                        Event Category <span className="text-danger">*</span>
                      </label>
                      <CommonSelect
                        options={Event_Category}
                        className="select"
                        defaultValue={Event_Category[0]}
                      />
                    </div>
                  </div>
                </div>
                {/* end row */}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-md btn-light me-2"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-md btn-primary">
                  Add Event
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* Add New Event End */}
      <div className="modal fade" id="add_category">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h6 className="mb-0">Add New Category</h6>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <form>
              <div className="modal-body">
                {/* start row */}
                <div className="row">
                  <div className="col-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Category Name <span className="text-danger">*</span>
                      </label>
                      <input type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="col-12">
                    <div>
                      <label className="form-label">
                        Category Color <span className="text-danger">*</span>
                      </label>
                      <CommonSelect
                        options={Category_Color}
                        className="select"
                        defaultValue={Category_Color[0]}
                      />
                    </div>
                  </div>
                </div>
                {/* end row */}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-md btn-light me-2"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-md btn-primary">
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* Start Event */}
      <div className="modal fade" id="event_modal">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-dark modal-bg">
              <div className="modal-title text-white">
                <span id="eventTitle" />
              </div>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <div className="modal-body">
              <p className="d-flex align-items-center fw-medium text-black mb-3">
                <i className="ti ti-calendar-check text-default me-2" />
                26 Jul,2024 to 31 Jul,2024
              </p>
              <p className="d-flex align-items-center fw-medium text-black mb-3">
                <i className="ti ti-calendar-check text-default me-2" />
                11:00 AM to 12:15 PM
              </p>
              <p className="d-flex align-items-center fw-medium text-black mb-3">
                <i className="ti ti-map-pin-bolt text-default me-2" />
                Las Vegas, US
              </p>
              <p className="d-flex align-items-center fw-medium text-black mb-0">
                <i className="ti ti-calendar-check text-default me-2" />A
                recurring or repeating event is simply any event that you will
                occur more than once on your calendar.
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* End Event */}
    </>
  );
};

export default Modal;
