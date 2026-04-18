import { useState } from "react";
import {
  AccountType,
  City,
  Company_Name,
  Country,
  Currency,
  Deals,
  DocumentType,
  Industry,
  Language,
  Owner,
  Period,
  Pipeine,
  Priority,
  Source,
  State,
  Status_Busy,
  Status_Open,
} from "../../../../../core/json/selectOption";
import CommonPhoneInput from "../../../../../components/common-phoneInput/commonPhoneInput";
import CommonSelect from "../../../../../components/common-select/commonSelect";
import CommonTagInputs from "../../../../../components/common-tagInput/commonTagInputs";
import MultipleSelect from "../../../../../components/multiple-Select/multipleSelect";
import CommonDatePicker from "../../../../../components/common-datePicker/commonDatePicker";
import TextEditor from "../../../../../components/texteditor/texteditor";
import ImageWithBasePath from "../../../../../components/imageWithBasePath";

const ModalCompaniesDetails = () => {
  const [phone, setPhone] = useState<string | undefined>();
  const [phone2, setPhone2] = useState<string | undefined>();

  const [tags, setTags] = useState<string[]>(["Collab", "VIP"]);
  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags);
  };
  const [tags2, setTags2] = useState<string[]>(["Collab", "Rated"]);
  const handleTagsChange2 = (newTags: string[]) => {
    setTags2(newTags);
  };
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
  const [selectedItems2, setSelectedItems2] = useState<string[]>([]);

  const handleChange2 = (value: string[]) => {
    setSelectedItems2(value);
  };
 const options2 = [
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
              src="assets/img/profiles/avatar-19.jpg"
              alt="Robert"
              width={24}
              height={24}
            />
          </div>
         Darlee Robertson
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

  const [selectedItems3, setSelectedItems3] = useState<string[]>([]);

  const handleChange3 = (value: string[]) => {
    setSelectedItems3(value);
  };
  const Project_Options = [
    { value: "devops-design", label: "Devops Design" },
    { value: "margrate-design", label: "MargrateDesign" },
    { value: "ui-for-chat", label: "UI for Chat" },
    { value: "web-chat", label: "Web Chat" },
  ];
  return (
    <>
      {/* Add offcanvas */}
      <div
        className="offcanvas offcanvas-end offcanvas-large"
        tabIndex={-1}
        id="offcanvas_add"
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="mb-0">Add New Company</h5>
          <button
            type="button"
            className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
          <form>
            <div className="accordion accordion-bordered" id="main_accordion">
              {/* Basic Info */}
              <div className="accordion-item rounded mb-3">
                <div className="accordion-header">
                  <a
                    href="#"
                    className="accordion-button accordion-custom-button rounded"
                    data-bs-toggle="collapse"
                    data-bs-target="#basic"
                  >
                    <span className="avatar avatar-md rounded me-1">
                      <i className="ti ti-user-plus" />
                    </span>
                    Basic Info
                  </a>
                </div>
                <div
                  className="accordion-collapse collapse show"
                  id="basic"
                  data-bs-parent="#main_accordion"
                >
                  <div className="accordion-body border-top">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="d-flex align-items-center mb-3">
                          <div className="avatar avatar-xxl border border-dashed me-3 flex-shrink-0">
                            <div className="position-relative d-flex align-items-center">
                              <i className="ti ti-photo text-dark fs-16" />
                            </div>
                          </div>
                          <div className="d-inline-flex flex-column align-items-start">
                            <div className="drag-upload-btn btn btn-sm btn-primary position-relative mb-2">
                              <i className="ti ti-file-broken me-1" />
                              Upload file
                              <input
                                type="file"
                                className="form-control image-sign"
                                multiple
                              />
                            </div>
                            <span>JPG, GIF or PNG. Max size of 800K</span>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">
                            Company Name<span className="text-danger">*</span>
                          </label>
                          <input type="text" className="form-control" />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <label className="form-label">
                              Email <span className="text-danger ms-1">*</span>
                            </label>
                            <div className="form-check form-switch mb-1">
                              <label className="form-check-label d-flex align-items-center gap-2">
                                <span>Email Opt Out</span>
                                <input
                                  className="form-check-input form-check-input-sm switchCheckDefault ms-auto"
                                  type="checkbox"
                                  role="switch"
                                  defaultChecked
                                />
                              </label>
                            </div>
                          </div>
                          <input type="text" className="form-control" />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Phone 1</label>
                          <CommonPhoneInput
                            value={phone}
                            onChange={setPhone}
                            placeholder="(201) 555-0123"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Phone 2</label>
                          <CommonPhoneInput
                            value={phone2}
                            onChange={setPhone2}
                            placeholder="(201) 555-0123"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Fax</label>
                          <input type="text" className="form-control" />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Website</label>
                          <input type="text" className="form-control" />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3 position-relative">
                          <label className="form-label">Reviews </label>
                          <div className="input-group w-auto input-group-flat">
                            <input type="text" className="form-control" />
                            <span className="input-group-text">
                              <i className="ti ti-star" />
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Owner</label>
                          <CommonSelect
                            options={Owner}
                            className="select"
                            defaultValue={Owner[0]}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Tags </label>
                          <CommonTagInputs
                            initialTags={tags}
                            onTagsChange={handleTagsChange}
                          />
                          <span className="fs-13">
                            Enter value separated by comma
                          </span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <div className="d-flex align-items-center justify-content-between">
                            <label className="form-label">Deals</label>
                            <a
                              href="#"
                              className="label-add link-primary mb-1"
                              data-bs-toggle="offcanvas"
                              data-bs-target="#offcanvas_add_2"
                            >
                              <i className="ti ti-plus me-1" />
                              Add New
                            </a>
                          </div>
                          <CommonSelect
                            options={Deals}
                            className="select"
                            defaultValue={Deals[0]}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Source <span className="text-danger">*</span>
                          </label>
                          <CommonSelect
                            options={Source}
                            className="select"
                            defaultValue={Source[0]}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Industry <span className="text-danger">*</span>
                          </label>
                          <CommonSelect
                            options={Industry}
                            className="select"
                            defaultValue={Industry[0]}
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">
                            Contacts <span className="text-danger">*</span>
                          </label>
                          <MultipleSelect
                            value={selectedItems}
                            onChange={handleChange}
                            options={options}
                            placeholder="Select"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Currency <span className="text-danger">*</span>
                          </label>
                          <CommonSelect
                            options={Currency}
                            className="select"
                            defaultValue={Currency[0]}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Language <span className="text-danger">*</span>
                          </label>
                          <CommonSelect
                            options={Language}
                            className="select"
                            defaultValue={Language[0]}
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-0">
                          <label className="form-label">
                            Description <span className="text-danger">*</span>
                          </label>
                          <textarea
                            className="form-control"
                            rows={3}
                            defaultValue={""}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* /Basic Info */}
              {/* Address Info */}
              <div className="accordion-item border-top rounded mb-3">
                <div className="accordion-header">
                  <a
                    href="#"
                    className="accordion-button accordion-custom-button rounded"
                    data-bs-toggle="collapse"
                    data-bs-target="#address"
                  >
                    <span className="avatar avatar-md rounded me-1">
                      <i className="ti ti-map-pin-cog" />
                    </span>
                    Address Info
                  </a>
                </div>
                <div
                  className="accordion-collapse collapse"
                  id="address"
                  data-bs-parent="#main_accordion"
                >
                  <div className="accordion-body border-top">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Street Address </label>
                          <input type="text" className="form-control" />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Country</label>
                          <CommonSelect
                            options={Country}
                            className="select"
                            defaultValue={Country[0]}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            State / Province{" "}
                          </label>
                          <CommonSelect
                            options={State}
                            className="select"
                            defaultValue={State[0]}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3 mb-md-0">
                          <label className="form-label">City </label>
                          <CommonSelect
                            options={City}
                            className="select"
                            defaultValue={City[0]}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-0">
                          <label className="form-label">Zipcode </label>
                          <input type="text" className="form-control" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* /Address Info */}
              {/* Social Profile */}
              <div className="accordion-item border-top rounded mb-3">
                <div className="accordion-header">
                  <a
                    href="#"
                    className="accordion-button accordion-custom-button rounded"
                    data-bs-toggle="collapse"
                    data-bs-target="#social"
                  >
                    <span className="avatar avatar-md rounded me-1">
                      <i className="ti ti-social" />
                    </span>
                    Social Profile
                  </a>
                </div>
                <div
                  className="accordion-collapse collapse"
                  id="social"
                  data-bs-parent="#main_accordion"
                >
                  <div className="accordion-body border-top">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Facebook</label>
                          <input type="text" className="form-control" />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Skype </label>
                          <input type="text" className="form-control" />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Linkedin </label>
                          <input type="text" className="form-control" />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Twitter</label>
                          <input type="text" className="form-control" />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3 mb-md-0">
                          <label className="form-label">Whatsapp</label>
                          <input type="text" className="form-control" />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-0">
                          <label className="form-label">Instagram</label>
                          <input type="text" className="form-control" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* /Social Profile */}
              {/* Access */}
              <div className="accordion-item border-top rounded mb-3">
                <div className="accordion-header">
                  <a
                    href="#"
                    className="accordion-button accordion-custom-button rounded"
                    data-bs-toggle="collapse"
                    data-bs-target="#access-info"
                  >
                    <span className="avatar avatar-md rounded me-1">
                      <i className="ti ti-accessible" />
                    </span>
                    Access
                  </a>
                </div>
                <div
                  className="accordion-collapse collapse"
                  id="access-info"
                  data-bs-parent="#main_accordion"
                >
                  <div className="accordion-body border-top">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="mb-0">
                          <label className="form-label">Visibility</label>
                          <div className="d-flex flex-wrap gap-2">
                            <div className="form-check">
                              <input
                                type="radio"
                                id="customRadio1"
                                name="customRadio"
                                className="form-check-input"
                              />
                              <label
                                className="form-check-label"
                                htmlFor="customRadio1"
                              >
                                Public
                              </label>
                            </div>
                            <div className="form-check">
                              <input
                                type="radio"
                                id="customRadio2"
                                name="customRadio"
                                className="form-check-input"
                              />
                              <label
                                className="form-check-label"
                                htmlFor="customRadio2"
                              >
                                Private
                              </label>
                            </div>
                            <div className="form-check">
                              <input
                                type="radio"
                                id="customRadio3"
                                name="customRadio"
                                className="form-check-input"
                                defaultChecked
                              />
                              <label
                                className="form-check-label"
                                htmlFor="customRadio3"
                              >
                                Select Pepole
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* /Access */}
            </div>
            <div className="d-flex align-items-center justify-content-end">
              <button
                type="button"
                data-bs-dismiss="offcanvas"
                className="btn btn-light me-2"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#create_success"
              >
                Create New
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* /Add offcanvas */}
      {/* Add New Deals */}
      <div
        className="offcanvas offcanvas-end offcanvas-large"
        tabIndex={-1}
        id="offcanvas_add_2"
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="fw-semibold">Add New Deals</h5>
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
            <div className="row">
              <div className="col-md-12">
                <div className="mb-3">
                  <label className="form-label">
                    Deal Name <span className="text-danger">*</span>
                  </label>
                  <input type="text" className="form-control" />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <label className="form-label">
                      Pipeine <span className="text-danger">*</span>
                    </label>
                  </div>
                  <CommonSelect
                    options={Pipeine}
                    className="select"
                    defaultValue={Pipeine[0]}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Status <span className="text-danger">*</span>
                  </label>
                  <CommonSelect
                    options={Status_Open}
                    className="select"
                    defaultValue={Status_Open[0]}
                  />
                </div>
              </div>
              <div className="col-lg-3 col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Deal Value<span className="text-danger"> *</span>
                  </label>
                  <input className="form-control" type="text" />
                </div>
              </div>
              <div className="col-lg-3 col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Currency <span className="text-danger">*</span>
                  </label>
                  <CommonSelect
                    options={Currency}
                    className="select"
                    defaultValue={Currency[0]}
                  />
                </div>
              </div>
              <div className="col-lg-3 col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Period <span className="text-danger">*</span>
                  </label>
                  <CommonSelect
                    options={Period}
                    className="select"
                    defaultValue={Period[0]}
                  />
                </div>
              </div>
              <div className="col-lg-3 col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Period Value <span className="text-danger">*</span>
                  </label>
                  <input className="form-control" type="text" />
                </div>
              </div>
              <div className="col-md-12">
                <div className="mb-3">
                  <label className="form-label">
                    Contact <span className="text-danger">*</span>
                  </label>
                  <MultipleSelect
                    value={selectedItems}
                    onChange={handleChange}
                    options={options}
                    placeholder="Select"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Project <span className="text-danger">*</span>
                  </label>
                  <MultipleSelect
                    value={selectedItems3}
                    onChange={handleChange3}
                    options={Project_Options}
                    placeholder="Select"
                  />
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
                  <label className="form-label">
                    Expected Closing Date <span className="text-danger">*</span>
                  </label>
                  <div className="input-group w-auto input-group-flat">
                    <CommonDatePicker placeholder="dd/mm/yyyy" />
                  </div>
                </div>
              </div>
              <div className="col-md-12">
                <div className="mb-3">
                  <label className="form-label">
                    Assignee <span className="text-danger">*</span>
                  </label>
                  <MultipleSelect
                    value={selectedItems2}
                    onChange={handleChange2}
                    options={options2}
                    placeholder="Select"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Follow Up Date <span className="text-danger">*</span>
                  </label>
                  <div className="input-group w-auto input-group-flat">
                    <CommonDatePicker placeholder="dd/mm/yyyy" />
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Source <span className="text-danger">*</span>
                  </label>
                  <CommonSelect
                    options={Source}
                    className="select"
                    defaultValue={Source[0]}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Tags <span className="text-danger">*</span>
                  </label>
                  <CommonTagInputs
                    initialTags={tags2}
                    onTagsChange={handleTagsChange2}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Priority <span className="text-danger">*</span>
                  </label>
                  <CommonSelect
                    options={Priority}
                    className="select"
                    defaultValue={Priority[0]}
                  />
                </div>
              </div>
              <div className="col-lg-12">
                <div className="mb-3">
                  <label className="form-label">
                    Description <span className="text-danger">*</span>
                  </label>
                  <div className="editor pages-editor">
                    <TextEditor />
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
              <button
                type="button"
                className="btn btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#create_success"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* /Add New Deals */}
      {/* edit Contact */}
      <div
        className="offcanvas offcanvas-end offcanvas-large"
        tabIndex={-1}
        id="offcanvas_edit"
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="mb-0">Edit Contact</h5>
          <button
            type="button"
            className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
          <form>
            <div className="accordion accordion-bordered" id="main_accordion2">
              {/* Basic Info */}
              <div className="accordion-item rounded mb-3">
                <div className="accordion-header">
                  <a
                    href="#"
                    className="accordion-button accordion-custom-button rounded"
                    data-bs-toggle="collapse"
                    data-bs-target="#basic2"
                  >
                    <span className="avatar avatar-md rounded me-1">
                      <i className="ti ti-user-plus" />
                    </span>
                    Basic Info
                  </a>
                </div>
                <div
                  className="accordion-collapse collapse show"
                  id="basic2"
                  data-bs-parent="#main_accordion2"
                >
                  <div className="accordion-body border-top">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="d-flex align-items-center mb-3">
                          <div className="avatar avatar-xxl border border-dashed me-3 flex-shrink-0">
                            <div className="position-relative d-flex align-items-center">
                              <ImageWithBasePath
                                src="./assets/img/users/avatar-1.jpg"
                                alt="img"
                              />
                              <a
                                href="#"
                                className="fs-12 text-danger border-0 badge-soft-danger rounded-circle p-1 trash-top d-flex align-items-center justify-content-center position-absolute end-0 top-0"
                              >
                                <i className="ti ti-trash" />
                              </a>
                            </div>
                          </div>
                          <div className="d-inline-flex flex-column align-items-start">
                            <div className="drag-upload-btn btn btn-sm btn-primary position-relative mb-2">
                              <i className="ti ti-file-broken me-1" />
                              Upload file
                              <input
                                type="file"
                                className="form-control image-sign"
                                multiple
                              />
                            </div>
                            <span>JPG, GIF or PNG. Max size of 800K</span>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            First Name <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            defaultValue="William"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Last Name <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            defaultValue="Anderson"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Job Title <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            defaultValue="Data Analytics"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Company Name
                            <span className="text-danger ms-1">*</span>
                          </label>
                          <CommonSelect
                            options={Company_Name}
                            className="select"
                            defaultValue={Company_Name[1]}
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <label className="form-label">
                              Email <span className="text-danger">*</span>
                            </label>
                            <div className="form-check form-switch mb-1">
                              <label className="form-check-label d-flex align-items-center gap-2">
                                <span>Email Opt Out</span>
                                <input
                                  className="form-check-input form-check-input-sm switchCheckDefault ms-auto"
                                  type="checkbox"
                                  role="switch"
                                  defaultChecked
                                />
                              </label>
                            </div>
                          </div>
                          <input
                            type="text"
                            className="form-control"
                            defaultValue="william@example.com"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Phone 1</label>
                          <CommonPhoneInput
                            value={phone}
                            onChange={setPhone}
                            placeholder="(201) 555-0123"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Phone 2</label>
                          <CommonPhoneInput
                            value={phone2}
                            onChange={setPhone2}
                            placeholder="(201) 555-0123"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Fax</label>
                          <input type="text" className="form-control" />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <div className="d-flex align-items-center justify-content-between">
                            <label className="form-label">Deals</label>
                            <a
                              href="#"
                              className="label-add link-primary mb-1"
                              data-bs-toggle="offcanvas"
                              data-bs-target="#offcanvas_add_2"
                            >
                              <i className="ti ti-plus me-1" />
                              Add New
                            </a>
                          </div>
                          <CommonSelect
                            options={Deals}
                            className="select"
                            defaultValue={Deals[1]}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Date of Birth</label>
                          <div className="input-group w-auto input-group-flat">
                            <CommonDatePicker placeholder="dd/mm/yyyy" />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3 position-relative">
                          <label className="form-label">Reviews </label>
                          <div className="input-group w-auto input-group-flat">
                            <input
                              type="text"
                              className="form-control"
                              defaultValue="4.5"
                            />
                            <span className="input-group-text">
                              <i className="ti ti-star" />
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Owner</label>
                          <CommonSelect
                            options={Owner}
                            className="select"
                            defaultValue={Owner[1]}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Tags </label>
                          <CommonTagInputs
                            initialTags={tags}
                            onTagsChange={handleTagsChange}
                          />
                          <span className="fs-13">
                            Enter value separated by comma
                          </span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Source <span className="text-danger">*</span>
                          </label>
                          <CommonSelect
                            options={Source}
                            className="select"
                            defaultValue={Source[1]}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Industry <span className="text-danger">*</span>
                          </label>
                          <CommonSelect
                            options={Industry}
                            className="select"
                            defaultValue={Industry[1]}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Currency <span className="text-danger">*</span>
                          </label>
                          <CommonSelect
                            options={Currency}
                            className="select"
                            defaultValue={Currency[1]}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Language <span className="text-danger">*</span>
                          </label>
                          <CommonSelect
                            options={Language}
                            className="select"
                            defaultValue={Language[1]}
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-0">
                          <label className="form-label">
                            Description <span className="text-danger">*</span>
                          </label>
                          <textarea
                            className="form-control"
                            rows={3}
                            defaultValue={
                              "Key decision-maker overseeing operations and strategic planning. Responsible for approving major deals and partnerships. Prefers direct communication via email."
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* /Basic Info */}
              {/* Address Info */}
              <div className="accordion-item border-top rounded mb-3">
                <div className="accordion-header">
                  <a
                    href="#"
                    className="accordion-button accordion-custom-button rounded"
                    data-bs-toggle="collapse"
                    data-bs-target="#address2"
                  >
                    <span className="avatar avatar-md rounded me-1">
                      <i className="ti ti-map-pin-cog" />
                    </span>
                    Address Info
                  </a>
                </div>
                <div
                  className="accordion-collapse collapse"
                  id="address2"
                  data-bs-parent="#main_accordion2"
                >
                  <div className="accordion-body border-top">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Street Address </label>
                          <input type="text" className="form-control" />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Country</label>
                          <CommonSelect
                            options={Country}
                            className="select"
                            defaultValue={Country[1]}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            State / Province{" "}
                          </label>
                          <CommonSelect
                            options={State}
                            className="select"
                            defaultValue={State[1]}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3 mb-md-0">
                          <label className="form-label">City </label>
                          <CommonSelect
                            options={City}
                            className="select"
                            defaultValue={City[1]}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-0">
                          <label className="form-label">Zipcode </label>
                          <input type="text" className="form-control" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* /Address Info */}
              {/* Social Profile */}
              <div className="accordion-item border-top rounded mb-3">
                <div className="accordion-header">
                  <a
                    href="#"
                    className="accordion-button accordion-custom-button rounded"
                    data-bs-toggle="collapse"
                    data-bs-target="#social2"
                  >
                    <span className="avatar avatar-md rounded me-1">
                      <i className="ti ti-social" />
                    </span>
                    Social Profile
                  </a>
                </div>
                <div
                  className="accordion-collapse collapse"
                  id="social2"
                  data-bs-parent="#main_accordion2"
                >
                  <div className="accordion-body border-top">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Facebook</label>
                          <input type="text" className="form-control" />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Skype </label>
                          <input type="text" className="form-control" />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Linkedin </label>
                          <input type="text" className="form-control" />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Twitter</label>
                          <input type="text" className="form-control" />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3 mb-md-0">
                          <label className="form-label">Whatsapp</label>
                          <input type="text" className="form-control" />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-0">
                          <label className="form-label">Instagram</label>
                          <input type="text" className="form-control" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* /Social Profile */}
              {/* Access */}
              <div className="accordion-item border-top rounded mb-3">
                <div className="accordion-header">
                  <a
                    href="#"
                    className="accordion-button accordion-custom-button rounded"
                    data-bs-toggle="collapse"
                    data-bs-target="#access-info2"
                  >
                    <span className="avatar avatar-md rounded me-1">
                      <i className="ti ti-accessible" />
                    </span>
                    Access
                  </a>
                </div>
                <div
                  className="accordion-collapse collapse"
                  id="access-info2"
                  data-bs-parent="#main_accordion2"
                >
                  <div className="accordion-body border-top">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="mb-0">
                          <label className="form-label">Visibility</label>
                          <div className="d-flex flex-wrap gap-2">
                            <div className="form-check">
                              <input
                                type="radio"
                                id="customRadio4"
                                name="customRadio"
                                className="form-check-input"
                              />
                              <label
                                className="form-check-label"
                                htmlFor="customRadio4"
                              >
                                Public
                              </label>
                            </div>
                            <div className="form-check">
                              <input
                                type="radio"
                                id="customRadio5"
                                name="customRadio"
                                className="form-check-input"
                              />
                              <label
                                className="form-check-label"
                                htmlFor="customRadio5"
                              >
                                Private
                              </label>
                            </div>
                            <div className="form-check">
                              <input
                                type="radio"
                                id="customRadio6"
                                name="customRadio"
                                className="form-check-input"
                                defaultChecked
                              />
                              <label
                                className="form-check-label"
                                htmlFor="customRadio6"
                              >
                                Select Pepole
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* /Access */}
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
      {/* /edit Contact */}
      {/* delete modal */}
      <div className="modal fade" id="delete_contact">
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
                Are you sure you want to remove call log you selected.
              </p>
              <div className="d-flex justify-content-center">
                <a
                  href="#"
                  className="btn btn-light position-relative z-1 me-2 w-100"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </a>
                <a
                  href="#"
                  className="btn btn-primary position-relative z-1 w-100"
                  data-bs-dismiss="modal"
                >
                  Yes, Delete
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* delete modal */}
      {/* delete modal */}
      <div className="modal fade" id="delete_call">
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
                Are you sure you want to remove call log you selected.
              </p>
              <div className="d-flex justify-content-center">
                <a
                  href="#"
                  className="btn btn-light position-relative z-1 me-2 w-100"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </a>
                <a
                  href="#"
                  className="btn btn-primary position-relative z-1 w-100"
                  data-bs-dismiss="modal"
                >
                  Yes, Delete
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* delete modal */}
      {/* delete modal */}
      <div className="modal fade" id="delete_note">
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
                Are you sure you want to remove note you selected.
              </p>
              <div className="d-flex justify-content-center">
                <a
                  href="#"
                  className="btn btn-light position-relative z-1 me-2 w-100"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </a>
                <a
                  href="#"
                  className="btn btn-primary position-relative z-1 w-100"
                  data-bs-dismiss="modal"
                >
                  Yes, Delete
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* delete modal */}
      {/* delete modal */}
      <div className="modal fade" id="delete_file">
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
                Are you sure you want to remove File you selected.
              </p>
              <div className="d-flex justify-content-center">
                <a
                  href="#"
                  className="btn btn-light position-relative z-1 me-2 w-100"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </a>
                <a
                  href="#"
                  className="btn btn-primary position-relative z-1 w-100"
                  data-bs-dismiss="modal"
                >
                  Yes, Delete
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* delete modal */}
      {/* Add Compose */}
      <div className="modal fade" id="add_compose" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Compose Email</h5>
              <button
                className="btn-close custom-btn-close border p-1 me-0 text-dark"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form action="#">
                <div className="mb-3">
                  <input
                    type="email"
                    placeholder="To"
                    className="form-control"
                  />
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <input
                        type="email"
                        placeholder="Cc"
                        className="form-control"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <input
                        type="email"
                        placeholder="Bcc"
                        className="form-control"
                      />
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="Subject"
                    className="form-control"
                  />
                </div>
                <div className="mb-3">
                  <div className="editor pages-editor" />
                </div>
                <div>
                  <div className="text-center d-flex align-items-center justify-content-center">
                    <button className="btn btn-primary me-2">Send</button>
                    <button className="btn btn-primary me-2" type="button">
                      Draft
                    </button>
                    <button className="btn btn-primary" type="button">
                      Delete
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* /Add Compose */}
      {/* Add Note */}
      <div className="modal fade" id="add_notes" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add New Notes</h5>
              <button
                type="button"
                className="btn-close custom-btn-close border p-1 me-0 text-dark"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <form>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">
                    Title <span className="text-danger"> *</span>
                  </label>
                  <input className="form-control" type="text" />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Note <span className="text-danger"> *</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows={4}
                    defaultValue={""}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Attachment <span className="text-danger">*</span>
                  </label>
                  <div className="file-upload drag-file w-100 d-flex bg-light border shadow align-items-center justify-content-center flex-column">
                    <span className="upload-img d-block mb-1">
                      <i className="ti ti-folder-open text-primary fs-16" />
                    </span>
                    <p className="mb-0 fs-14 text-dark">
                      Drop your files here or{" "}
                      <a
                        href="#"
                        className="text-decoration-underline text-primary"
                      >
                        browse
                      </a>
                    </p>
                    <input type="file" accept="video/image" />
                    <p className="fs-13 mb-0">Maximum size : 50 MB</p>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-7">
                    <div className="card mb-0">
                      <div className="card-body p-2">
                        <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                          <div className="d-flex align-items-center me-3">
                            <span className="avatar bg-success me-2">
                              <i className="ti ti-file-spreadsheet fs-20" />
                            </span>
                            <div>
                              <h6 className="fw-medium fs-14 mb-1">
                                Project Specs.xls
                              </h6>
                              <p className="mb-0">365 KB</p>
                            </div>
                          </div>
                          <a
                            href="#"
                            className="avatar avatar-xs rounded-circle bg-light text-dark"
                          >
                            <i className="ti ti-arrow-down" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <a className="btn btn-light" data-bs-dismiss="modal">
                  Cancel
                </a>
                <button className="btn btn-primary" type="submit">
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Add Note */}
      {/* Edit Note */}
      <div className="modal fade" id="edit_notes" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Notes</h5>
              <button
                type="button"
                className="btn-close custom-btn-close border p-1 me-0 text-dark"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <form>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">
                    Title <span className="text-danger"> *</span>
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    defaultValue="Team meet at Starbucks"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Note <span className="text-danger"> *</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows={4}
                    defaultValue={
                      "A project review evaluates the success of an initiative and identifies areas for improvement. "
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Attachment <span className="text-danger">*</span>
                  </label>
                  <div className="file-upload drag-file w-100 d-flex bg-light border shadow align-items-center justify-content-center flex-column">
                    <span className="upload-img d-block mb-1">
                      <i className="ti ti-folder-open text-primary fs-16" />
                    </span>
                    <p className="mb-0 fs-14 text-dark">
                      Drop your files here or{" "}
                      <a
                        href="#"
                        className="text-decoration-underline text-primary"
                      >
                        browse
                      </a>
                    </p>
                    <input type="file" accept="video/image" />
                    <p className="fs-13 mb-0">Maximum size : 50 MB</p>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-7">
                    <div className="card mb-0">
                      <div className="card-body p-2">
                        <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                          <div className="d-flex align-items-center me-3">
                            <span className="avatar bg-success me-2">
                              <i className="ti ti-file-spreadsheet fs-20" />
                            </span>
                            <div>
                              <h6 className="fw-medium fs-14 mb-1">
                                Project Specs.xls
                              </h6>
                              <p className="mb-0">365 KB</p>
                            </div>
                          </div>
                          <a
                            href="#"
                            className="avatar avatar-xs rounded-circle bg-light text-dark"
                          >
                            <i className="ti ti-arrow-down" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <a className="btn btn-light" data-bs-dismiss="modal">
                  Cancel
                </a>
                <button className="btn btn-primary" type="submit">
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Edit Note */}
      {/* Create Call Log */}
      <div className="modal fade" id="create_call" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Create Call Log</h5>
              <button
                type="button"
                className="btn-close custom-btn-close border p-1 me-0 text-dark"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <form>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Status <span className="text-danger"> *</span>
                      </label>
                      <CommonSelect
                        options={Status_Busy}
                        className="select"
                        defaultValue={Status_Busy[1]}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">
                        Follow Up Date <span className="text-danger">*</span>
                      </label>
                      <div className="input-group w-auto input-group-flat">
                        <CommonDatePicker placeholder="dd/mm/yyyy" />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">
                        Note <span className="text-danger"> *</span>
                      </label>
                      <textarea
                        className="form-control"
                        rows={4}
                        defaultValue={""}
                      />
                    </div>
                    <div>
                      <div className="form-check mb-1">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="customCheck1"
                        />
                        <label
                          className="form-check-label"
                          htmlFor="customCheck1"
                        >
                          Create a follow up task
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <a className="btn btn-light" data-bs-dismiss="modal">
                  Cancel
                </a>
                <button className="btn btn-primary" type="submit">
                  Create New
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Create Call Log */}
      {/* Edit Call Log */}
      <div className="modal fade" id="edit_call" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Call Log</h5>
              <button
                type="button"
                className="btn-close custom-btn-close border p-1 me-0 text-dark"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <form>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Status <span className="text-danger"> *</span>
                      </label>
                      <CommonSelect
                        options={Status_Busy}
                        className="select"
                        defaultValue={Status_Busy[0]}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">
                        Follow Up Date <span className="text-danger">*</span>
                      </label>
                      <div className="input-group w-auto input-group-flat">
                        <CommonDatePicker placeholder="dd/mm/yyyy" />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">
                        Note <span className="text-danger"> *</span>
                      </label>
                      <textarea
                        className="form-control"
                        rows={4}
                        defaultValue={
                          "A project review evaluates the success of an initiative and identifies areas for improvement."
                        }
                      />
                    </div>
                    <div>
                      <div className="form-check mb-1">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="customCheck2"
                        />
                        <label
                          className="form-check-label"
                          htmlFor="customCheck2"
                        >
                          Create a follow up task
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <a className="btn btn-light" data-bs-dismiss="modal">
                  Cancel
                </a>
                <button className="btn btn-primary" type="submit">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Edit Call Log */}
      {/* Connect Account */}
      <div className="modal fade" id="create_email" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Connect Account</h5>
              <button
                type="button"
                className="btn-close custom-btn-close border p-1 me-0 text-dark"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">
                  Account type <span className="text-danger"> *</span>
                </label>
                <CommonSelect
                  options={AccountType}
                  className="select"
                  defaultValue={AccountType[0]}
                />
              </div>
              <div>
                <h6 className="fs-14 fw-medium mb-2">Sync emails from</h6>
                <div>
                  <div className="form-check mb-1">
                    <input
                      type="radio"
                      id="customRadio14"
                      name="customRadio"
                      className="form-check-input"
                      defaultChecked
                    />
                    <label className="form-check-label" htmlFor="customRadio14">
                      Now
                    </label>
                  </div>
                  <div className="form-check mb-1">
                    <input
                      type="radio"
                      id="customRadio15"
                      name="customRadio"
                      className="form-check-input"
                    />
                    <label className="form-check-label" htmlFor="customRadio15">
                      1 Month Ago
                    </label>
                  </div>
                  <div className="form-check mb-1">
                    <input
                      type="radio"
                      id="customRadio16"
                      name="customRadio"
                      className="form-check-input"
                    />
                    <label className="form-check-label" htmlFor="customRadio16">
                      3 Month Ago
                    </label>
                  </div>
                  <div className="form-check mb-1">
                    <input
                      type="radio"
                      id="customRadio17"
                      name="customRadio"
                      className="form-check-input"
                    />
                    <label className="form-check-label" htmlFor="customRadio17">
                      6 Month Ago
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <a href="#" className="btn btn-light" data-bs-dismiss="modal">
                Cancel
              </a>
              <button
                className="btn btn-primary"
                data-bs-target="#success_mail"
                data-bs-toggle="modal"
                data-bs-dismiss="modal"
              >
                Connect Account
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* /Connect Account */}
      {/* Add File */}
      <div
        className="modal custom-modal fade custom-modal-two modal-padding"
        id="new_file"
        role="dialog"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Create New File</h5>
              <button
                type="button"
                className="btn-close custom-btn-close border p-1 me-0 text-dark"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="add-info-fieldset">
                <div className="add-details-wizard">
                  <ul className="progress-bar-wizard">
                    <li className="active me-3">
                      <span>
                        <i className="ti ti-file" />
                      </span>
                      <div className="multi-step-info">
                        <h6>Basic Info</h6>
                      </div>
                    </li>
                    <li>
                      <span>
                        <i className="ti ti-circle-plus" />
                      </span>
                      <div className="multi-step-info">
                        <h6>Add Recipient</h6>
                      </div>
                    </li>
                  </ul>
                </div>
                <fieldset id="first-field-file">
                  <form>
                    <div className="contact-input-set">
                      <div className="row">
                        <div className="col-md-12">
                          <div className="mb-3">
                            <label className="form-label">
                              {" "}
                              Deal <span className="text-danger">*</span>
                            </label>
                            <CommonSelect
                              options={Deals}
                              className="select"
                              defaultValue={Deals[0]}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">
                              Document Type{" "}
                              <span className="text-danger">*</span>
                            </label>
                            <CommonSelect
                              options={DocumentType}
                              className="select"
                              defaultValue={DocumentType[0]}
                            />
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
                        <div className="col-md-12">
                          <div className="mb-3">
                            <label className="form-label">
                              Title <span className="text-danger">*</span>
                            </label>
                            <input className="form-control" type="text" />
                          </div>
                        </div>
                        <div className="col-lg-12">
                          <div className="signature-wrap bg-light p-3 rounded border mb-3 pb-0">
                            <h6 className="fw-semibold mb-3">Signature</h6>
                            <ul className="nav sign-item">
                              <li className="nav-item mb-2">
                                <span
                                  className=" mb-0"
                                  data-bs-toggle="tab"
                                  data-bs-target="#nosign"
                                >
                                  <input
                                    type="radio"
                                    className="status-radio"
                                    id="sign1"
                                    name="email"
                                  />
                                  <label htmlFor="sign1" className="text-body">
                                    <span className="sign-title text-dark d-block mb-1">
                                      No Signature
                                    </span>
                                    This document does not require a signature
                                    before acceptance.
                                  </label>
                                </span>
                              </li>
                              <li className="nav-item">
                                <span
                                  className="active mb-0"
                                  data-bs-toggle="tab"
                                  data-bs-target="#use-esign"
                                >
                                  <input
                                    type="radio"
                                    className="status-radio"
                                    id="sign2"
                                    name="email"
                                    defaultChecked
                                  />
                                  <label htmlFor="sign2" className="text-body">
                                    <span className="sign-title text-dark d-block mb-1">
                                      Use e-signature
                                    </span>
                                    This document require e-signature before
                                    acceptance.
                                  </label>
                                </span>
                              </li>
                            </ul>
                            <div className="tab-content mt-3">
                              <div
                                className="tab-pane show active"
                                id="use-esign"
                              >
                                <div className="sign-content">
                                  <div className="row">
                                    <div className="col-md-6">
                                      <div className="mb-3">
                                        <label className="form-label">
                                          Recipients Name{" "}
                                          <span className="text-danger">*</span>
                                        </label>
                                        <input
                                          className="form-control"
                                          type="text"
                                          placeholder="Enter Name"
                                        />
                                      </div>
                                    </div>
                                    <div className="col-md-6">
                                      <div className="d-flex align-items-center">
                                        <div className="float-none mb-3 me-3 w-100">
                                          <label className="form-label">
                                            Recipients Email{" "}
                                            <span className="text-danger">
                                              *
                                            </span>
                                          </label>
                                          <input
                                            className="form-control"
                                            type="text"
                                            placeholder="Email Address"
                                          />
                                        </div>
                                        <div className="input-btn">
                                          <a
                                            href="#"
                                            className="add-sign"
                                          >
                                            <i className="ti ti-circle-plus" />
                                          </a>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="input-block mb-3">
                            <label className="form-label">
                              Content <span className="text-danger">*</span>
                            </label>
                            <textarea
                              className="form-control"
                              rows={3}
                              placeholder="Add Content"
                              defaultValue={""}
                            />
                          </div>
                        </div>
                        <div className="col-lg-12 text-end form-wizard-button border-top pt-3">
                          <button className="btn btn-light me-2" type="reset">
                            Cancel
                          </button>
                          <button
                            className="btn btn-primary wizard-next-btn"
                            type="button"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </fieldset>
                <fieldset>
                  <form>
                    <div className="contact-input-set">
                      <div className="row">
                        <div className="col-lg-12">
                          <div className="signature-wrap bg-light p-3 rounded border mb-3 pb-0">
                            <h6 className="mb-2 fw-semibold fs-14">
                              Send the document to following signers
                            </h6>
                            <p>In order to send the document to the signers</p>
                            <div className="sign-content">
                              <div className="row">
                                <div className="col-md-6">
                                  <div className="mb-3">
                                    <label className="form-label">
                                      Recipients Name{" "}
                                      <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      className="form-control"
                                      type="text"
                                      placeholder="Enter Name"
                                    />
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="d-flex align-items-center">
                                    <div className="float-none mb-3 me-3 w-100">
                                      <label className="form-label">
                                        Recipients Email{" "}
                                        <span className="text-danger">*</span>
                                      </label>
                                      <input
                                        className="form-control"
                                        type="text"
                                        placeholder="Email Address"
                                      />
                                    </div>
                                    <div className="input-btn">
                                      <a
                                        href="#"
                                        className="add-sign"
                                      >
                                        <i className="ti ti-circle-plus" />
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-12">
                          <div className="mb-3">
                            <label className="form-label">
                              Message Subject{" "}
                              <span className="text-danger"> *</span>
                            </label>
                            <input
                              className="form-control"
                              type="text"
                              placeholder="Enter Subject"
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">
                              Message Text{" "}
                              <span className="text-danger"> *</span>
                            </label>
                            <textarea
                              className="form-control"
                              rows={3}
                              placeholder="Your document is ready"
                              defaultValue={""}
                            />
                          </div>
                          <button className="btn btn-light mb-3">
                            Send Now
                          </button>
                          <div className="bg-soft-success text-success border border-success rounded p-2">
                            <p className="mb-0">
                              <i className="ti ti-circle-check-filled me-1" />{" "}
                              Document sent successfully to the selected
                              recipients
                            </p>
                          </div>
                        </div>
                        <div className="col-lg-12 text-end form-wizard-button pt-3 border-top mt-3">
                          <button className="btn btn-light me-2" type="reset">
                            Cancel
                          </button>
                          <button
                            className="btn btn-primary"
                            type="button"
                            data-bs-dismiss="modal"
                          >
                            Save &amp; Next
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </fieldset>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Add File */}
    </>
  );
};

export default ModalCompaniesDetails;
