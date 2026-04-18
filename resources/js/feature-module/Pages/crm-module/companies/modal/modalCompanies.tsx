import { useState } from "react";
import { Link } from "react-router";
import {
  City,
  Country,
  Currency,
  Deals,
  Industry,
  Language,
  Owner,
  Period,
  Pipeine,
  Priority,
  Source,
  State,
  Status_Open,
} from "../../../../../core/json/selectOption";
import CommonSelect from "../../../../../components/common-select/commonSelect";
import ImageWithBasePath from "../../../../../components/imageWithBasePath";
import CommonPhoneInput from "../../../../../components/common-phoneInput/commonPhoneInput";
import CommonTagInputs from "../../../../../components/common-tagInput/commonTagInputs";
import MultipleSelect from "../../../../../components/multiple-Select/multipleSelect";
import CommonDatePicker from "../../../../../components/common-datePicker/commonDatePicker";
import TextEditor from "../../../../../components/texteditor/texteditor";
import { all_routes } from "../../../../../routes/all_routes";

const ModalCompanies = () => {
  const [tags, setTags] = useState<string[]>(["Collab", "VIP"]);
  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags);
  };
  const [tags2, setTags2] = useState<string[]>([
    "Devops Design",
    "MargrateDesign",
  ]);
  const handleTagsChange2 = (newTags: string[]) => {
    setTags2(newTags);
  };

  const [tags3, setTags3] = useState<string[]>(["Collab", "Rated"]);

  const handleTagsChange3 = (newTags: string[]) => {
    setTags3(newTags);
  };

  const [phone, setPhone] = useState<string | undefined>();
  const [phone2, setPhone2] = useState<string | undefined>();

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
  const [selectedItems3, setSelectedItems3] = useState<string[]>([]);

  const handleChange3 = (value: string[]) => {
    setSelectedItems3(value);
  };
  const options3 = [
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
  const [selectedItems4, setSelectedItems4] = useState<string[]>([]);

  const handleChange4 = (value: string[]) => {
    setSelectedItems4(value);
  };
  const options4 = [
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
                  <Link
                    to="#"
                    className="accordion-button accordion-custom-button rounded"
                    data-bs-toggle="collapse"
                    data-bs-target="#basic"
                  >
                    <span className="avatar avatar-md rounded me-1">
                      <i className="ti ti-user-plus" />
                    </span>
                    Basic Info
                  </Link>
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
                            <Link
                              to="#"
                              className="label-add link-primary mb-1"
                              data-bs-toggle="offcanvas"
                              data-bs-target="#offcanvas_add_2"
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
                  <Link
                    to="#"
                    className="accordion-button accordion-custom-button rounded"
                    data-bs-toggle="collapse"
                    data-bs-target="#address"
                  >
                    <span className="avatar avatar-md rounded me-1">
                      <i className="ti ti-map-pin-cog" />
                    </span>
                    Address Info
                  </Link>
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
                  <Link
                    to="#"
                    className="accordion-button accordion-custom-button rounded"
                    data-bs-toggle="collapse"
                    data-bs-target="#social"
                  >
                    <span className="avatar avatar-md rounded me-1">
                      <i className="ti ti-social" />
                    </span>
                    Social Profile
                  </Link>
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
                  <Link
                    to="#"
                    className="accordion-button accordion-custom-button rounded"
                    data-bs-toggle="collapse"
                    data-bs-target="#access-info"
                  >
                    <span className="avatar avatar-md rounded me-1">
                      <i className="ti ti-accessible" />
                    </span>
                    Access
                  </Link>
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
      {/* edit offcanvas */}
      <div
        className="offcanvas offcanvas-end offcanvas-large"
        tabIndex={-1}
        id="offcanvas_edit"
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="mb-0">Edit Company</h5>
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
                  <Link
                    to="#"
                    className="accordion-button accordion-custom-button rounded"
                    data-bs-toggle="collapse"
                    data-bs-target="#basic2"
                  >
                    <span className="avatar avatar-md rounded me-1">
                      <i className="ti ti-user-plus" />
                    </span>
                    Basic Info
                  </Link>
                </div>
                <div
                  className="accordion-collapse collapse show"
                  id="basic2"
                  data-bs-parent="#main_accordion2"
                >
                  <div className="accordion-body border-top">
                    <div className="row mb-3">
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
                            <Link
                              to="#"
                              className="label-add link-primary mb-1"
                              data-bs-toggle="offcanvas"
                              data-bs-target="#offcanvas_add_2"
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
                            options={Currency}
                            className="select"
                            defaultValue={Currency[0]}
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
                  <Link
                    to="#"
                    className="accordion-button accordion-custom-button rounded"
                    data-bs-toggle="collapse"
                    data-bs-target="#address2"
                  >
                    <span className="avatar avatar-md rounded me-1">
                      <i className="ti ti-map-pin-cog" />
                    </span>
                    Address Info
                  </Link>
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
                  <Link
                    to="#"
                    className="accordion-button accordion-custom-button rounded"
                    data-bs-toggle="collapse"
                    data-bs-target="#social2"
                  >
                    <span className="avatar avatar-md rounded me-1">
                      <i className="ti ti-social" />
                    </span>
                    Social Profile
                  </Link>
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
                  <Link
                    to="#"
                    className="accordion-button accordion-custom-button rounded"
                    data-bs-toggle="collapse"
                    data-bs-target="#access-info2"
                  >
                    <span className="avatar avatar-md rounded me-1">
                      <i className="ti ti-accessible" />
                    </span>
                    Access
                  </Link>
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
      {/* /edit offcanvas */}
      {/* Add New Deals */}
      <div
        className="offcanvas offcanvas-end offcanvas-large"
        tabIndex={-1}
        id="offcanvas_add_2"
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="mb-0">Add New Deals</h5>
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
            <div className="row mb-3">
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
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Deal Value<span className="text-danger"> *</span>
                  </label>
                  <input className="form-control" type="text" />
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
                    Period <span className="text-danger">*</span>
                  </label>
                  <CommonSelect
                    options={Period}
                    className="select"
                    defaultValue={Period[0]}
                  />
                </div>
              </div>
              <div className="col-md-6">
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
                    Contacts <span className="text-danger">*</span>
                  </label>
                  <MultipleSelect
                    value={selectedItems3}
                    onChange={handleChange3}
                    options={options3}
                    placeholder="Select"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Project <span className="text-danger">*</span>
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
                    value={selectedItems4}
                    onChange={handleChange4}
                    options={options4}
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
                    initialTags={tags3}
                    onTagsChange={handleTagsChange3}
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
                data-bs-target="#create_success_2"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* /Add New Deals */}
      {/* success modal */}
      <div className="modal fade" id="create_success">
        <div className="modal-dialog modal-dialog-centered modal-sm rounded-0">
          <div className="modal-content rounded-0">
            <div className="modal-body p-4 text-center position-relative">
              <div className="mb-3 position-relative z-1">
                <span className="avatar avatar-xl badge-soft-success border-0 text-success rounded-circle">
                  <i className="ti ti-building-community fs-24" />
                </span>
              </div>
              <h5 className="mb-1">Company Created Successfully!!!</h5>
              <p className="mb-3">View the details of company, created</p>
              <div className="d-flex justify-content-center">
                <Link
                  to="#"
                  className="btn btn-light position-relative z-1 me-2 w-100"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </Link>
                <Link
                  to={all_routes.companyDetails}
                  className="btn btn-primary position-relative z-1 w-100"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* success modal */}
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
                Are you sure you want to remove company you selected.
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
  );
};

export default ModalCompanies;
