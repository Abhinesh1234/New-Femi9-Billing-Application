import { Link } from "react-router";
import { all_routes } from "../../../../../routes/all_routes";
import {
  City,
  Company_Name,
  Country,
  Currency,
  Deals,
  Industry,
  Language,
  Owner,
  Phone,
  Source,
  State,
} from "../../../../../core/json/selectOption";
import CommonSelect from "../../../../../components/common-select/commonSelect";
import ImageWithBasePath from "../../../../../components/imageWithBasePath";
import { useState } from "react";
import MultipleSelect from "../../../../../components/multiple-Select/multipleSelect";
import CommonTagInputs from "../../../../../components/common-tagInput/commonTagInputs";
import CommonPhoneInput from "../../../../../components/common-phoneInput/commonPhoneInput";

const ModalLeads = () => {
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

  const [tags, setTags] = useState<string[]>(["Collab"]);
  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags);
  };
  const [tags2, setTags2] = useState<string[]>(["Collab", "VIP"]);
  const handleTagsChange2 = (newTags: string[]) => {
    setTags2(newTags);
  };

  const [phone, setPhone] = useState<string | undefined>();
  const [phone2, setPhone2] = useState<string | undefined>();

  return (
    <>
      {/* Add lead*/}
      <div
        className="offcanvas offcanvas-end offcanvas-large"
        tabIndex={-1}
        id="offcanvas_add"
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="mb-0">Add New Lead</h5>
          <button
            type="button"
            className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
          <form>
            <div className="row">
              <div className="col-md-12">
                <div className="mb-3">
                  <label className="form-label">
                    Lead Name<span className="text-danger">*</span>
                  </label>
                  <input type="text" className="form-control" />
                </div>
              </div>
              <div className="col-md-12">
                <div className="mb-3">
                  <label className="form-label">Lead Type</label>
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
                        Person
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
                        Organization
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-12">
                <div className="mb-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <label className="form-label">Company Name</label>
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
                    options={Company_Name}
                    className="select"
                    defaultValue={Company_Name[0]}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Value <span className="text-danger">*</span>
                  </label>
                  <input type="text" className="form-control" />
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
                    Phone <span className="text-danger">*</span>
                  </label>
                  <input type="text" className="form-control" />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label mb-3" />
                  <CommonSelect
                    options={Phone}
                    className="select"
                    defaultValue={Phone[0]}
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
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Owner</label>
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
                  <label className="form-label">Tags </label>
                  <CommonTagInputs
                    initialTags={tags}
                    onTagsChange={handleTagsChange}
                  />
                </div>
              </div>
              <div className="col-md-12">
                <div className="mb-3">
                  <label className="form-label">
                    Description <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Description"
                    defaultValue={""}
                  />
                </div>
              </div>
              <div className="col-md-12">
                <div className="mb-3">
                  <label className="form-label">Visibility</label>
                  <div className="d-flex flex-wrap gap-2">
                    <div className="form-check">
                      <input
                        type="radio"
                        id="customRadio3"
                        name="customRadio"
                        className="form-check-input"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="customRadio3"
                      >
                        Public
                      </label>
                    </div>
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
                        Private
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        type="radio"
                        id="customRadio5"
                        name="customRadio"
                        className="form-check-input"
                        defaultChecked
                      />
                      <label
                        className="form-check-label"
                        htmlFor="customRadio5"
                      >
                        Select Pepole
                      </label>
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
      {/* /Add lead */}
      {/* Add offcanvas */}
      <div
        className="offcanvas offcanvas-end offcanvas-large"
        tabIndex={-1}
        id="offcanvas_add_2"
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
                            initialTags={tags2}
                            onTagsChange={handleTagsChange2}
                          />
                          <span className="fs-13">
                            Enter value separated by comma
                          </span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Deals</label>
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
                                id="customRadio6"
                                name="customRadio"
                                className="form-check-input"
                              />
                              <label
                                className="form-check-label"
                                htmlFor="customRadio6"
                              >
                                Public
                              </label>
                            </div>
                            <div className="form-check">
                              <input
                                type="radio"
                                id="customRadio7"
                                name="customRadio"
                                className="form-check-input"
                              />
                              <label
                                className="form-check-label"
                                htmlFor="customRadio7"
                              >
                                Private
                              </label>
                            </div>
                            <div className="form-check">
                              <input
                                type="radio"
                                id="customRadio8"
                                name="customRadio"
                                className="form-check-input"
                                defaultChecked
                              />
                              <label
                                className="form-check-label"
                                htmlFor="customRadio8"
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
          <h5 className="mb-0">Edit Lead</h5>
          <button
            type="button"
            className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
          <form>
            <div className="row">
              <div className="col-md-12">
                <div className="mb-3">
                  <label className="form-label">
                    Lead Name<span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue="Elizabeth Morgan"
                  />
                </div>
              </div>
              <div className="col-md-12">
                <div className="mb-3">
                  <label className="form-label">Lead Type</label>
                  <div className="d-flex flex-wrap gap-2">
                    <div className="form-check">
                      <input
                        type="radio"
                        id="customRadio9"
                        name="customRadio"
                        className="form-check-input"
                        defaultChecked
                      />
                      <label
                        className="form-check-label"
                        htmlFor="customRadio9"
                      >
                        Person
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        type="radio"
                        id="customRadio10"
                        name="customRadio"
                        className="form-check-input"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="customRadio10"
                      >
                        Organization
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-12">
                <div className="mb-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <label className="form-label">Company Name</label>
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
                    options={Company_Name}
                    className="select"
                    defaultValue={Company_Name[0]}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Value <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue={10}
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
                    Phone <span className="text-danger">*</span>
                  </label>
                  <CommonPhoneInput
                    value={phone}
                    onChange={setPhone}
                    placeholder="(201) 555-0123"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label mb-3" />
                  <CommonSelect
                    options={Phone}
                    className="select"
                    defaultValue={Phone[0]}
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
                  <label className="form-label">Owner</label>
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
                  <label className="form-label">Tags </label>
                  <CommonTagInputs
                    initialTags={tags}
                    onTagsChange={handleTagsChange}
                  />
                </div>
              </div>
              <div className="col-md-12">
                <div className="mb-3">
                  <label className="form-label">
                    Description <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Description"
                    defaultValue={
                      "Key decision-maker overseeing operations and strategic planning. Responsible for approving major deals and partnerships. Prefers direct communication via email."
                    }
                  />
                </div>
              </div>
              <div className="col-md-12">
                <div className="mb-3">
                  <label className="form-label">Visibility</label>
                  <div className="d-flex flex-wrap gap-2">
                    <div className="form-check">
                      <input
                        type="radio"
                        id="customRadio11"
                        name="customRadio"
                        className="form-check-input"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="customRadio11"
                      >
                        Public
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        type="radio"
                        id="customRadio12"
                        name="customRadio"
                        className="form-check-input"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="customRadio12"
                      >
                        Private
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        type="radio"
                        id="customRadio13"
                        name="customRadio"
                        className="form-check-input"
                        defaultChecked
                      />
                      <label
                        className="form-check-label"
                        htmlFor="customRadio13"
                      >
                        Select Pepole
                      </label>
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
              <button
                type="button"
                className="btn btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#create_success"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* edit offcanvas */}
      {/* success modal */}
      <div className="modal fade" id="create_success">
        <div className="modal-dialog modal-dialog-centered modal-sm rounded-0">
          <div className="modal-content rounded-0">
            <div className="modal-body p-4 text-center position-relative">
              <div className="mb-3 position-relative z-1">
                <span className="avatar avatar-xl badge-soft-info border-0 text-info rounded-circle">
                  <i className="ti ti-building-skyscraper fs-24" />
                </span>
              </div>
              <h5 className="mb-1">Lead Created Successfully!!!</h5>
              <p className="mb-3">View the details of lead, created</p>
              <div className="d-flex justify-content-center">
                <Link
                  to="#"
                  className="btn btn-light position-relative z-1 me-2 w-100"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </Link>
                <Link
                  to={all_routes.leadsDetails}
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
      <div className="modal fade" id="delete_lead">
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
                Are you sure you want to remove leads you selected.
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

export default ModalLeads;
