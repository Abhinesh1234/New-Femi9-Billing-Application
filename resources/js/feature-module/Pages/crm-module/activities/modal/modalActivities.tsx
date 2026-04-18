import { Link } from "react-router"
import CommonSelect from "../../../../../components/common-select/commonSelect"
import { BeforeDue, Company_Name, Deals, Owner } from "../../../../../core/json/selectOption"
import ImageWithBasePath from "../../../../../components/imageWithBasePath"
import { useState } from "react"
import MultipleSelect from "../../../../../components/multiple-Select/multipleSelect"
import CommonTimePicker from "../../../../../components/common-timePickers/CommonTimePicker"
import CommonDatePicker from "../../../../../components/common-datePicker/commonDatePicker"
import TextEditor from "../../../../../components/texteditor/texteditor"

const ModalActivities=() => {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

        const handleChange = (value: string[]) => {
        setSelectedItems(value);
        };
       const options = [
    {
      label: (
        <div className="d-flex align-items-center gap-2">
          <div
            style={{
              borderRadius: "50%",
              overflow: "hidden",
              width: 24,
              height: 24,
            }}
          >
            <ImageWithBasePath
              src="assets/img/profiles/avatar-02.jpg"
              alt="Robert"
              width={24}
              height={24}
            />
          </div>
          Robert Johnson
        </div>
      ),
      value: "robert-johnson",
    },
    {
      label: (
        <div className="d-flex align-items-center gap-2">
          <div
            style={{
              borderRadius: "50%",
              overflow: "hidden",
              width: 24,
              height: 24,
            }}
          >
            <ImageWithBasePath
              src="assets/img/users/user-01.jpg"
              alt="Sharon"
              width={24}
              height={24}
            />
          </div>
          Sharon Roy
        </div>
      ),
      value: "sharon-roy",
    },
    {
      label: (
        <div className="d-flex align-items-center gap-2">
          <div
            style={{
              borderRadius: "50%",
              overflow: "hidden",
              width: 24,
              height: 24,
            }}
          >
            <ImageWithBasePath
              src="assets/img/profiles/avatar-21.jpg"
              alt="Vaughan"
              width={24}
              height={24}
            />
          </div>
          Vaughan Lewis
        </div>
      ),
      value: "vaughan-lewis",
    },
    {
      label: (
        <div className="d-flex align-items-center gap-2">
          <div
            style={{
              borderRadius: "50%",
              overflow: "hidden",
              width: 24,
              height: 24,
            }}
          >
            <ImageWithBasePath
              src="assets/img/profiles/avatar-23.jpg"
              alt="Jessica"
              width={24}
              height={24}
            />
          </div>
          Jessica Louise
        </div>
      ),
      value: "jessica-louise",
    },
    {
      label: (
        <div className="d-flex align-items-center gap-2">
          <div
            style={{
              borderRadius: "50%",
              overflow: "hidden",
              width: 24,
              height: 24,
            }}
          >
            <ImageWithBasePath
              src="assets/img/profiles/avatar-16.jpg"
              alt="Carol"
              width={24}
              height={24}
            />
          </div>
          Carol Thomas
        </div>
      ),
      value: "carol-thomas",
    },
  ];
 return(
    <>
  {/* Add New Activity */}
  <div
    className="offcanvas offcanvas-end offcanvas-large"
    tabIndex={-1}
    id="offcanvas_add"
  >
    <div className="offcanvas-header border-bottom">
      <h5 className="mb-0">Add New Activity </h5>
      <button
        type="button"
        className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
        data-bs-dismiss="offcanvas"
        aria-label="Close"
      >
        <i className="ti ti-x" />
      </button>
    </div>
    <div className="offcanvas-body">
      <form>
        <div>
          <div className="row">
            <div className="col-md-12">
              <div className="mb-3">
                <label className="form-label">
                  Title <span className="text-danger">*</span>
                </label>
                <input type="text" className="form-control" />
              </div>
            </div>
            <div className="col-md-12">
              <div className="mb-2">
                <label className="form-label">
                  Activity Type <span className="text-danger">*</span>
                </label>
                <ul className="radio-activity">
                  <li className="me-2 mb-2">
                    <div className="active-type">
                      <input
                        type="radio"
                        id="call"
                        name="status"
                        defaultChecked
                      />
                      <label htmlFor="call" className="rounded">
                        <i className="ti ti-phone me-2" />
                        Calls
                      </label>
                    </div>
                  </li>
                  <li className="me-2 mb-2">
                    <div className="active-type">
                      <input type="radio" id="mail" name="status" />
                      <label htmlFor="mail" className="rounded">
                        <i className="ti ti-mail me-2" />
                        Email
                      </label>
                    </div>
                  </li>
                  <li className="me-2 mb-2">
                    <div className="active-type">
                      <input type="radio" id="task" name="status" />
                      <label htmlFor="task" className="rounded">
                        <i className="ti ti-subtask me-2" />
                        Task
                      </label>
                    </div>
                  </li>
                  <li className="me-2 mb-2">
                    <div className="active-type">
                      <input type="radio" id="shares" name="status" />
                      <label htmlFor="shares" className="rounded">
                        <i className="ti ti-user-share me-2" />
                        Meeting
                      </label>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">
                  Due Date <span className="text-danger">*</span>
                </label>
                <div className="input-group w-auto input-group-flat">
                  <CommonDatePicker placeholder="dd/mm/yyyy" />
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Time</label>
                <div className="input-icon-end position-relative">
                  <CommonTimePicker
                        className="form-control"
                        allowClear
                    />
                  <span className="input-icon-addon">
                    <i className="ti ti-clock-hour-10 text-dark" />
                  </span>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">
                  Reminder <span className="text-danger">*</span>
                </label>
                <div className="input-group w-auto input-group-flat">
                  <input type="text" className="form-control" />
                  <span className="input-group-text">
                    <i className="ti ti-bell-ringing" />
                  </span>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex align-items-center">
                <div className="mb-3 w-100">
                  <label className="form-label">&nbsp;</label>
                  <CommonSelect
                    options={BeforeDue}
                    className="select"
                    defaultValue={BeforeDue[0]}
                    />
                </div>
                <div className="mb-3 time-text flex-shrink-0 ms-2">
                  <label className="form-label">&nbsp;</label>
                  <p className="mb-0">Before Due</p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">
                  Owner <span className="text-danger">*</span>
                </label>
                <CommonSelect
                    options={Owner}
                    className="select"
                    defaultValue={Owner[0]}
                    />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">
                  Guests <span className="text-danger">*</span>
                </label>
                <MultipleSelect
                    value={selectedItems}
                    onChange={handleChange}
                    options={options}
                    placeholder="Select"
                    />
              </div>
            </div>
            <div className="col-md-12">
              <div className="mb-3">
                <label className="form-label">
                  Description <span className="text-danger">*</span>
                </label>
                <TextEditor/>
              </div>
              <div className="mb-3">
                <div className="d-flex align-items-center justify-content-between">
                  <label className="form-label">Deals</label>
                  <Link
                    to="#"
                    className="label-add link-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#add_deal"
                  >
                    <i className="ti ti-plus me-1" />
                    Add New
                  </Link>
                </div>
                <CommonSelect
                    options={Deals}
                    className="select"
                    defaultValue={Deals[0]}
                    />
              </div>
              <div className="mb-3">
                <div className="d-flex align-items-center justify-content-between">
                  <label className="form-label">Contacts</label>
                  <Link
                    to="#"
                    className="label-add link-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#add_contacts"
                  >
                    <i className="ti ti-plus me-1" />
                    Add New
                  </Link>
                </div>
                <CommonSelect
                    options={Owner}
                    className="select"
                    defaultValue={Owner[0]}
                    />
              </div>
              <div className="mb-3">
                <div className="d-flex align-items-center justify-content-between">
                  <label className="form-label">Companies</label>
                  <Link
                    to="#"
                    className="label-add link-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#add_company"
                  >
                    <i className="ti ti-plus me-1" />
                    Add New
                  </Link>
                </div>
                <CommonSelect
                    options={Company_Name}
                    className="select"
                    defaultValue={Company_Name[0]}
                    />
              </div>
            </div>
          </div>
        </div>
        <div className="d-flex align-items-center justify-content-end">
          <button
            type="button"
            data-bs-dismiss="offcanvas"
            className="btn btn-light me-2"
          >
            Cancel
          </button>
          <button type="button" className="btn btn-primary">
            Create
          </button>
        </div>
      </form>
    </div>
  </div>
  {/* /Add New Activity */}
  {/* Edit Activity */}
  <div
    className="offcanvas offcanvas-end offcanvas-large"
    tabIndex={-1}
    id="offcanvas_edit"
  >
    <div className="offcanvas-header border-bottom">
      <div>
        <h5 className="mb-1">We scheduled a meeting for next week</h5>
        <p className="mb-0">Commented by Aeron on 15 Sep 2025, 11:15 PM</p>
      </div>
      <button
        type="button"
        className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
        data-bs-dismiss="offcanvas"
        aria-label="Close"
      >
        <i className="ti ti-x" />
      </button>
    </div>
    <div className="offcanvas-body">
      <form>
        <div className="pro-create">
          <div className="tab-activity">
            <ul className="nav nav-tabs nav-bordered mb-3">
              <li className="nav-item">
                <Link
                  to="#"
                  data-bs-toggle="tab"
                  data-bs-target="#activity"
                  className="active nav-link"
                >
                  Activity
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="#"
                  data-bs-toggle="tab"
                  data-bs-target="#comments"
                  className="nav-link"
                >
                  Comments
                  <span className="p-1 lh-1 d-inline-flex align-items-center bg-light rounded-circle fs-10 ms-1 border-bottom border-dark">
                    0
                  </span>
                </Link>
              </li>
            </ul>
          </div>
          <div className="tab-content">
            <div className="tab-pane fade" id="comments">
              <div className="comment-wrap p-2 shadow border mb-4 rounded">
                <p className="mb-2">
                  The best way to get a project done faster is to start sooner.
                  A goal without a timeline is just a dream.The goal you set
                  must be challenging. At the same time, it should be realistic
                  and attainable, not impossible to reach.
                </p>
                <p className="mb-0">
                  Commented by <span className="text-danger">Aeron</span> on 15
                  Sep 2023, 11:15 pm
                </p>
              </div>
            </div>
            <div className="tab-pane show active" id="activity">
              <div className="row">
                <div className="col-md-12">
                  <div className="mb-3">
                    <label className="form-label">
                      Title <span className="text-danger">*</span>
                    </label>
                    <input type="text" className="form-control" />
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="mb-2">
                    <label className="form-label">
                      Activity Type <span className="text-danger">*</span>
                    </label>
                    <ul className="radio-activity">
                      <li className="me-2 mb-2">
                        <div className="active-type">
                          <input
                            type="radio"
                            id="call2"
                            name="status"
                            defaultChecked
                          />
                          <label htmlFor="call2" className="rounded">
                            <i className="ti ti-phone me-2" />
                            Calls
                          </label>
                        </div>
                      </li>
                      <li className="me-2 mb-2">
                        <div className="active-type">
                          <input type="radio" id="mail2" name="status" />
                          <label htmlFor="mail2" className="rounded">
                            <i className="ti ti-mail me-2" />
                            Email
                          </label>
                        </div>
                      </li>
                      <li className="me-2 mb-2">
                        <div className="active-type">
                          <input type="radio" id="task2" name="status" />
                          <label htmlFor="task2" className="rounded">
                            <i className="ti ti-subtask me-2" />
                            Task
                          </label>
                        </div>
                      </li>
                      <li>
                        <div className="active-type">
                          <input type="radio" id="shares2" name="status" />
                          <label htmlFor="shares2" className="rounded">
                            <i className="ti ti-user-share me-2" />
                            Meeting
                          </label>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      Due Date <span className="text-danger">*</span>
                    </label>
                    <div className="input-group w-auto input-group-flat">
                      <CommonDatePicker placeholder="dd/mm/yyyy" />
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Time</label>
                    <div className="input-icon-end position-relative">
                      <CommonTimePicker
                        className="form-control"
                        allowClear
                    />
                      <span className="input-icon-addon">
                        <i className="ti ti-clock-hour-10 text-dark" />
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      Reminder <span className="text-danger">*</span>
                    </label>
                    <div className="input-group w-auto input-group-flat">
                      <input type="text" className="form-control" />
                      <span className="input-group-text">
                        <i className="ti ti-bell-ringing" />
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center">
                    <div className="mb-3 w-100">
                      <label className="form-label">&nbsp;</label>
                      <CommonSelect
                        options={BeforeDue}
                        className="select"
                        defaultValue={BeforeDue[0]}
                        />
                    </div>
                    <div className="mb-3 time-text flex-shrink-0 ms-2">
                      <label className="form-label">&nbsp;</label>
                      <p className="mb-0">Before Due</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      Owner <span className="text-danger">*</span>
                    </label>
                    <CommonSelect
                        options={Owner}
                        className="select"
                        defaultValue={Owner[0]}
                        />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      Guests <span className="text-danger">*</span>
                    </label>
                    <select className="multiple-img">
                      <option
                        data-image="assets/img/profiles/avatar-19.jpg"
                    
                      >
                        Darlee Robertson
                      </option>
                      <option data-image="assets/img/profiles/avatar-20.jpg">
                        Sharon Roy
                      </option>
                      <option data-image="assets/img/profiles/avatar-21.jpg">
                        Vaughan Lewis
                      </option>
                      <option data-image="assets/img/profiles/avatar-23.jpg">
                        Jessica Louise
                      </option>
                      <option data-image="assets/img/profiles/avatar-16.jpg">
                        Carol Thomas
                      </option>
                    </select>
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="mb-3">
                    <label className="form-label">
                      Description <span className="text-danger">*</span>
                    </label>
                    <TextEditor/>
                  </div>
                  <div className="mb-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <label className="form-label">Deals</label>
                      <Link
                        to="#"
                        className="label-add link-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#add_deal"
                      >
                        <i className="ti ti-plus me-1" />
                        Add New
                      </Link>
                    </div>
                    <CommonSelect
                        options={Deals}
                        className="select"
                        defaultValue={Deals[0]}
                        />
                  </div>
                  <div className="mb-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <label className="form-label">Contacts</label>
                      <Link
                        to="#"
                        className="label-add link-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#add_contacts"
                      >
                        <i className="ti ti-plus me-1" />
                        Add New
                      </Link>
                    </div>
                    <CommonSelect
                        options={Owner}
                        className="select"
                        defaultValue={Owner[0]}
                        />
                  </div>
                  <div className="mb-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <label className="form-label">Companies</label>
                      <Link
                        to="#"
                        className="label-add link-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#add_company"
                      >
                        <i className="ti ti-plus me-1" />
                        Add New
                      </Link>
                    </div>
                    <CommonSelect
                        options={Company_Name}
                        className="select"
                        defaultValue={Company_Name[0]}
                        />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="d-flex align-items-center justify-content-end">
          <button
            type="button"
            data-bs-dismiss="offcanvas"
            className="btn btn-light me-2"
          >
            Cancel
          </button>
          <button type="button" className="btn btn-primary">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
  {/* /Edit Activity */}
  {/* Add Contacts */}
  <div className="modal custom-modal fade" id="add_contacts" role="dialog">
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title mb-0">Add Contacts</h5>
          <button
            className="btn-close me-0"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <form>
          <div className="modal-body">
            <div className="mb-3">
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
              <li className="mb-2">
                <label className="dropdown-item px-2 d-flex align-items-center">
                  <input
                    className="form-check-input m-0 me-1"
                    type="checkbox"
                  />
                  <span className="avatar avatar-xs rounded-circle me-2">
                    <ImageWithBasePath
                      src="assets/img/users/user-06.jpg"
                      className="flex-shrink-0 rounded-circle"
                      alt="img"
                    />
                  </span>
                  Elizabeth Morgan
                </label>
              </li>
              <li className="mb-2">
                <label className="dropdown-item px-2 d-flex align-items-center">
                  <input
                    className="form-check-input m-0 me-1"
                    type="checkbox"
                  />
                  <span className="avatar avatar-xs rounded-circle me-2">
                    <ImageWithBasePath
                      src="assets/img/users/user-40.jpg"
                      className="flex-shrink-0 rounded-circle"
                      alt="img"
                    />
                  </span>
                  Katherine Brooks
                </label>
              </li>
              <li className="mb-2">
                <label className="dropdown-item px-2 d-flex align-items-center">
                  <input
                    className="form-check-input m-0 me-1"
                    type="checkbox"
                  />
                  <span className="avatar avatar-xs rounded-circle me-2">
                    <ImageWithBasePath
                      src="assets/img/users/user-05.jpg"
                      className="flex-shrink-0 rounded-circle"
                      alt="img"
                    />
                  </span>
                  Sophia Lopez
                </label>
              </li>
              <li className="mb-2">
                <label className="dropdown-item px-2 d-flex align-items-center">
                  <input
                    className="form-check-input m-0 me-1"
                    type="checkbox"
                  />
                  <span className="avatar avatar-xs rounded-circle me-2">
                    <ImageWithBasePath
                      src="assets/img/users/user-10.jpg"
                      className="flex-shrink-0 rounded-circle"
                      alt="img"
                    />
                  </span>
                  John Michael
                </label>
              </li>
              <li className="mb-2">
                <label className="dropdown-item px-2 d-flex align-items-center">
                  <input
                    className="form-check-input m-0 me-1"
                    type="checkbox"
                  />
                  <span className="avatar avatar-xs rounded-circle me-2">
                    <ImageWithBasePath
                      src="assets/img/users/user-15.jpg"
                      className="flex-shrink-0 rounded-circle"
                      alt="img"
                    />
                  </span>
                  Natalie Brooks
                </label>
              </li>
              <li className="mb-1">
                <label className="dropdown-item px-2 d-flex align-items-center">
                  <input
                    className="form-check-input m-0 me-1"
                    type="checkbox"
                  />
                  <span className="avatar avatar-xs rounded-circle me-2">
                    <ImageWithBasePath
                      src="assets/img/users/user-01.jpg"
                      className="flex-shrink-0 rounded-circle"
                      alt="img"
                    />
                  </span>
                  William Turner
                </label>
              </li>
              <li className="mb-2">
                <label className="dropdown-item px-2 d-flex align-items-center">
                  <input
                    className="form-check-input m-0 me-1"
                    type="checkbox"
                  />
                  <span className="avatar avatar-xs rounded-circle me-2">
                    <ImageWithBasePath
                      src="assets/img/users/user-13.jpg"
                      className="flex-shrink-0 rounded-circle"
                      alt="img"
                    />
                  </span>
                  Ava Martinez
                </label>
              </li>
              <li className="mb-2">
                <label className="dropdown-item px-2 d-flex align-items-center">
                  <input
                    className="form-check-input m-0 me-1"
                    type="checkbox"
                  />
                  <span className="avatar avatar-xs rounded-circle me-2">
                    <ImageWithBasePath
                      src="assets/img/users/user-12.jpg"
                      className="flex-shrink-0 rounded-circle"
                      alt="img"
                    />
                  </span>
                  Nathan Reed
                </label>
              </li>
              <li className="mb-2">
                <label className="dropdown-item px-2 d-flex align-items-center">
                  <input
                    className="form-check-input m-0 me-1"
                    type="checkbox"
                  />
                  <span className="avatar avatar-xs rounded-circle me-2">
                    <ImageWithBasePath
                      src="assets/img/users/user-03.jpg"
                      className="flex-shrink-0 rounded-circle"
                      alt="img"
                    />
                  </span>
                  Lily Anderson
                </label>
              </li>
              <li className="mb-0">
                <label className="dropdown-item px-2 d-flex align-items-center">
                  <input
                    className="form-check-input m-0 me-1"
                    type="checkbox"
                  />
                  <span className="avatar avatar-xs rounded-circle me-2">
                    <ImageWithBasePath
                      src="assets/img/users/user-18.jpg"
                      className="flex-shrink-0 rounded-circle"
                      alt="img"
                    />
                  </span>
                  Ryan Coleman
                </label>
              </li>
            </ul>
          </div>
          <div className="modal-btn text-end border-top p-3">
            <Link to="#" className="btn btn-light me-2" data-bs-dismiss="modal">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary">
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  {/* /Add Contacts */}
  {/* Add Deals */}
  <div className="modal custom-modal fade" id="add_deal" role="dialog">
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title mb-0">Add Deals</h5>
          <button
            className="btn-close custom-btn-close border p-1 me-0 text-dark"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <form>
          <div className="modal-body">
            <div className="mb-3">
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
              <li className="mb-2">
                <label className="dropdown-item px-2 d-flex align-items-center">
                  <input
                    className="form-check-input m-0 me-1"
                    type="checkbox"
                  />
                  Collins
                </label>
              </li>
              <li className="mb-2">
                <label className="dropdown-item px-2 d-flex align-items-center">
                  <input
                    className="form-check-input m-0 me-1"
                    type="checkbox"
                  />
                  Konopelski
                </label>
              </li>
              <li className="mb-2">
                <label className="dropdown-item px-2 d-flex align-items-center">
                  <input
                    className="form-check-input m-0 me-1"
                    type="checkbox"
                  />
                  Adams
                </label>
              </li>
              <li className="mb-2">
                <label className="dropdown-item px-2 d-flex align-items-center">
                  <input
                    className="form-check-input m-0 me-1"
                    type="checkbox"
                  />
                  Schumm
                </label>
              </li>
              <li className="mb-2">
                <label className="dropdown-item px-2 d-flex align-items-center">
                  <input
                    className="form-check-input m-0 me-1"
                    type="checkbox"
                  />
                  Wisozk
                </label>
              </li>
              <li className="mb-0">
                <label className="dropdown-item px-2 d-flex align-items-center">
                  <input
                    className="form-check-input m-0 me-1"
                    type="checkbox"
                  />
                  Dawn Mercha
                </label>
              </li>
            </ul>
          </div>
          <div className="modal-btn text-end p-3 border-top">
            <Link to="#" className="btn btn-light me-2" data-bs-dismiss="modal">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary">
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  {/* /Add Deals */}
  {/* Add Company */}
  <div className="modal custom-modal fade" id="add_company" role="dialog">
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title mb-0">Add Company</h5>
          <button
            className="btn-close custom-btn-close border p-1 me-0 text-dark"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <form>
          <div className="modal-body">
            <div className="mb-3">
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
              <li className="mb-2">
                <label className="dropdown-item px-2 d-flex align-items-center">
                  <input
                    className="form-check-input m-0 me-1"
                    type="checkbox"
                  />
                  <span className="avatar avatar-xs rounded-circle me-2">
                    <ImageWithBasePath
                      src="assets/img/icons/company-icon-01.svg"
                      className="flex-shrink-0 rounded-circle"
                      alt="img"
                    />
                  </span>
                  NovaWave LLC
                </label>
              </li>
              <li className="mb-2">
                <label className="dropdown-item px-2 d-flex align-items-center">
                  <input
                    className="form-check-input m-0 me-1"
                    type="checkbox"
                  />
                  <span className="avatar avatar-xs rounded-circle me-2">
                    <ImageWithBasePath
                      src="assets/img/icons/company-icon-02.svg"
                      className="flex-shrink-0 rounded-circle"
                      alt="img"
                    />
                  </span>
                  BlueSky Industries
                </label>
              </li>
              <li className="mb-2">
                <label className="dropdown-item px-2 d-flex align-items-center">
                  <input
                    className="form-check-input m-0 me-1"
                    type="checkbox"
                  />
                  <span className="avatar avatar-xs rounded-circle me-2">
                    <ImageWithBasePath
                      src="assets/img/icons/company-icon-03.svg"
                      className="flex-shrink-0 rounded-circle"
                      alt="img"
                    />
                  </span>
                  Silver Hawk
                </label>
              </li>
              <li className="mb-2">
                <label className="dropdown-item px-2 d-flex align-items-center">
                  <input
                    className="form-check-input m-0 me-1"
                    type="checkbox"
                  />
                  <span className="avatar avatar-xs rounded-circle me-2">
                    <ImageWithBasePath
                      src="assets/img/icons/company-icon-04.svg"
                      className="flex-shrink-0 rounded-circle"
                      alt="img"
                    />
                  </span>
                  Summit Peak
                </label>
              </li>
              <li className="mb-2">
                <label className="dropdown-item px-2 d-flex align-items-center">
                  <input
                    className="form-check-input m-0 me-1"
                    type="checkbox"
                  />
                  <span className="avatar avatar-xs rounded-circle me-2">
                    <ImageWithBasePath
                      src="assets/img/icons/company-icon-05.svg"
                      className="flex-shrink-0 rounded-circle"
                      alt="img"
                    />
                  </span>
                  RiverStone Ventur
                </label>
              </li>
              <li className="mb-0">
                <label className="dropdown-item px-2 d-flex align-items-center">
                  <input
                    className="form-check-input m-0 me-1"
                    type="checkbox"
                  />
                  <span className="avatar avatar-xs rounded-circle me-2">
                    <ImageWithBasePath
                      src="assets/img/icons/company-icon-06.svg"
                      className="flex-shrink-0 rounded-circle"
                      alt="img"
                    />
                  </span>
                  Bright Bridge Grp
                </label>
              </li>
            </ul>
          </div>
          <div className="modal-btn text-end p-3 border-top">
            <Link to="#" className="btn btn-light me-2" data-bs-dismiss="modal">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary">
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  {/* /Add Company */}
  {/* delete modal */}
  <div className="modal fade" id="delete_activity">
    <div className="modal-dialog modal-dialog-centered modal-sm rounded-0">
      <div className="modal-content rounded-0">
        <div className="modal-body p-4 text-center position-relative">
          <div className="mb-3 position-relative z-1">
            <span className="avatar avatar-xl badge-soft-danger border-0 text-danger rounded-circle">
              <i className="ti ti-trash fs-24" />
            </span>
          </div>
          <h5 className="mb-1">Delete Confirmation</h5>
          <p className="mb-3">
            Are you sure you want to remove activity you selected.
          </p>
          <div className="d-flex justify-content-center">
            <Link
              to="#"
              className="btn btn-light position-relative z-1 me-2 w-100"
              data-bs-dismiss="modal"
            >
              Cancel
            </Link>
            <Link
              to="#"
              className="btn btn-primary position-relative z-1 w-100"
              data-bs-dismiss="modal"
            >
              Yes, Delete
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
  {/* delete modal */}
</>

 )
}
export default ModalActivities