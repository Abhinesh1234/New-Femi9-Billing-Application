import type { TimePickerProps } from "antd";
import { TimePicker } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import type { DatePickerProps } from "antd";
import { DatePicker } from "antd";
import CommonUiPageHeader from "../../../../../components/commonUiPageHeader/commonUiPageHeader";
import Footer from "../../../../../components/footer/footer";

const onChangeDate: DatePickerProps["onChange"] = (date, dateString) => {
  console.log(date, dateString);
};

dayjs.extend(customParseFormat);

const onChangeTime: TimePickerProps["onChange"] = (time, timeString) => {
  console.log(time, timeString);
};



const onOk = () => {};
const FormPickers = () => {
  return (
    <>
      {/* ========================
			Start Page Content
		========================= */}
      <div className="page-wrapper">
        {/* Start Content */}
        <div className="content">
          {/* Page Header */}
          <CommonUiPageHeader
            title="Form Picker"
            breadcrumbs={[
              { label: "Home", path: "/dashboard/deals-dashboard" },
              { label: "Form" },
              { label: "Form Picker", active: true },
            ]}
          />

          {/* End Page Header */}
          {/* start row */}
          <div className="row">
            <div className="col-xl-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Flatpickr - Datepicker</h5>
                </div>
                <div className="card-body">
                  <form action="#">
                    {/* start row */}
                    <div className="row gy-3">
                      <div className="col-lg-6">
                        <div>
                          <label className="form-label mb-0">Basic</label>
                          <p className="text-muted">
                            Set
                            <code>
                              data-provider="flatpickr" data-date-format="d M,
                              Y"
                            </code>
                            attribute.
                          </p>
                          <DatePicker
                            className="form-control"
                            onChange={onChangeDate}
                          />
                        </div>
                      </div>
                      {/* end col */}
                      <div className="col-lg-6">
                        <div>
                          <label className="form-label mb-0">DateTime</label>
                          <p className="text-muted">
                            Set
                            <code>
                              data-provider="flatpickr" data-date-format="d.m.y"
                              data-enable-time
                            </code>
                            attribute.
                          </p>
                          <div className="form-picker-default">
                                <DatePicker showTime onOk={onOk} />
                          </div>
                          
                        </div>
                      </div>
                      {/* end col */}
                    </div>
                    {/* end row */}
                    {/* start row */}
                    <div className="row">
                      <div className="col-lg-6">
                        <div className="mt-3">
                          <label className="form-label mb-0">
                            Human-Friendly Dates
                          </label>
                          <p className="text-muted">
                            Set
                            <code>
                              data-provider="flatpickr" data-altFormat="F j, Y"
                            </code>
                            attribute.
                          </p>
                          <DatePicker
                            className="form-control flatpickr-input"
                            onChange={onChangeDate}
                          />
                        </div>
                      </div>
                      {/* end col */}
                      <div className="col-lg-6">
                        <div className="mt-3">
                          <label className="form-label mb-0">
                            MinDate and MaxDate
                          </label>
                          <p className="text-muted">
                            Set
                            <code>
                              data-provider="flatpickr" data-date-format="d M,
                              Y" data-minDate="Your Min. Date"
                              data-maxDate="Your Max. date"
                            </code>
                            attribute.
                          </p>
                          <DatePicker
                            className="form-control"
                            onChange={onChangeDate}
                          />
                        </div>
                      </div>
                      {/* end col */}
                    </div>
                    {/* end row */}
                    {/* start row */}
                    <div className="row">
                      <div className="col-lg-6">
                        <div className="mt-3">
                          <label className="form-label mb-0">
                            Default Date
                          </label>
                          <p className="text-muted">
                            Set
                            <code>
                              data-provider="flatpickr" data-date-format="d M,
                              Y" data-deafult-date="Your Default Date"
                            </code>
                            attribute.
                          </p>
                          <DatePicker
                            className="form-control"
                            defaultValue={dayjs('2025-01-25')} 
                            onChange={onChangeDate}
                          />
                        </div>
                      </div>
                      {/* end col */}
                      <div className="col-lg-6">
                        <div className="mt-3">
                          <label className="form-label mb-0">
                            Disabling Dates
                          </label>
                          <p className="text-muted">
                            Set
                            <code>
                              data-provider="flatpickr" data-disable="true"
                            </code>
                            attribute.
                          </p>
                          <DatePicker
                            className="form-control"
                            onChange={onChangeDate}
                          />
                        </div>
                      </div>
                      {/* end col */}
                    </div>
                    {/* end row */}
                    {/* start row */}
                    <div className="row">
                      <div className="col-lg-6">
                        <div className="mt-3">
                          <label className="form-label mb-0">
                            Selecting Multiple Dates
                          </label>
                          <p className="text-muted">
                            Set
                            <code>
                              data-provider="flatpickr" data-date-format="d M,
                              Y" data-multiple-date="true"
                            </code>
                            attribute.
                          </p>
                          <DatePicker
                            className="form-control"
                            onChange={onChangeDate}
                          />
                        </div>
                      </div>
                      {/* end col */}
                      <div className="col-lg-6">
                        <div className="mt-3">
                          <label className="form-label mb-0">Range</label>
                          <p className="text-muted">
                            Set
                            <code>
                              data-provider="flatpickr" data-date-format="d M,
                              Y" data-range-date="true"
                            </code>
                            attribute.
                          </p>
                          <DatePicker
                            className="form-control"
                            onChange={onChangeDate}
                          />
                        </div>
                      </div>
                      {/* end col */}
                    </div>
                    {/* end row */}
                    {/* start row */}
                    <div className="row">
                      <div className="col-lg-6">
                        <div className="mt-3">
                          <label className="form-label mb-0">Inline</label>
                          <p className="text-muted">
                            Set
                            <code>
                              data-provider="flatpickr" data-date-format="d M,
                              Y" data-deafult-date="today"
                              data-inline-date="true"
                            </code>
                            attribute.
                          </p>
                          <DatePicker
                            className="form-control d-block"
                            onChange={onChangeDate}
                          />
                        </div>
                      </div>
                      {/* end col */}
                      <div className="col-lg-6">
                        <div className="mt-3">
                          <label className="form-label mb-0">
                            Week Numbers
                          </label>
                          <p className="text-muted">
                            Set
                            <code>
                              data-provider="flatpickr" data-date-format="d M,
                              Y" data-week-number
                            </code>
                            attribute.
                          </p>
                          <DatePicker
                            className="form-control"
                            onChange={onChangeDate}
                          />
                        </div>
                      </div>
                      {/* end col */}
                    </div>
                    {/* end row */}
                  </form>
                  {/* end form */}
                </div>
                {/* end card-body */}
              </div>
              {/* end card */}
            </div>
            {/* end col */}
          </div>
          {/* end row */}
          {/* start row */}
          <div className="row">
            <div className="col-lg-12">
              <div className="card">
                <div className="card-header">
                  <h4 className="card-title mb-0">Flatpickr - Timepicker</h4>
                </div>
                <div className="card-body">
                  <form action="#">
                    <div className="row gy-3">
                      <div className="col-lg-6">
                        <div>
                          <label className="form-label mb-0">Timepicker</label>
                          <p className="text-muted">
                            Set
                            <code>
                              data-provider="timepickr" data-time-basic="true"
                            </code>
                            attribute.
                          </p>
                          <TimePicker
                            className="form-control"
                            onChange={onChangeTime}
                            defaultOpenValue={dayjs("00:00:00", "HH:mm:ss")}
                          />
                        </div>
                      </div>
                      {/* end col */}
                      <div className="col-lg-6">
                        <div>
                          <label className="form-label mb-0">
                            24-hour Time Picker
                          </label>
                          <p className="text-muted">
                            Set
                            <code>
                              data-provider="timepickr" data-time-hrs="true"
                            </code>
                            attribute.
                          </p>
                          <TimePicker
                            className="form-control"
                            onChange={onChangeTime}
                            defaultOpenValue={dayjs("00:00:00", "HH:mm:ss")}
                          />
                        </div>
                      </div>
                      {/* end col */}
                    </div>
                    {/* end row */}
                    <div className="row">
                      <div className="col-lg-6">
                        <div className="mt-3">
                          <label className="form-label mb-0">
                            Time Picker w/ Limits
                          </label>
                          <p className="text-muted">
                            Set
                            <code>
                              data-provider="timepickr" data-min-time="Min.Time"
                              data-max-time="Max.Time"
                            </code>
                            attribute.
                          </p>
                          <TimePicker
                            className="form-control"
                            onChange={onChangeTime}
                            defaultOpenValue={dayjs("00:00:00", "HH:mm:ss")}
                          />
                        </div>
                      </div>
                      {/* end col */}
                      <div className="col-lg-6">
                        <div className="mt-3">
                          <label className="form-label mb-0">
                            Preloading Time
                          </label>
                          <p className="text-muted">
                            Set
                            <code>
                              data-provider="timepickr" data-default-time="Your
                              Default Time"
                            </code>
                            attribute.
                          </p>
                          <TimePicker
                            className="form-control"
                            onChange={onChangeTime}
                            defaultOpenValue={dayjs("00:00:00", "HH:mm:ss")}
                          />
                        </div>
                      </div>
                      {/* end col */}
                    </div>
                    {/* end row */}
                    <div className="row">
                      <div className="col-lg-6">
                        <div className="mt-3">
                          <label className="form-label mb-0">Inline</label>
                          <p className="text-muted">
                            Set
                            <code>
                              data-provider="timepickr" data-time-inline="Your
                              Default Time"
                            </code>
                            attribute.
                          </p>
                          <TimePicker
                            className="form-control"
                            onChange={onChangeTime}
                            defaultOpenValue={dayjs("00:00:00", "HH:mm:ss")}
                          />
                        </div>
                      </div>
                      {/* end col */}
                    </div>
                    {/* end row */}
                  </form>
                  {/* end form */}
                </div>
                {/* end card-body */}
              </div>
              {/* end card */}
            </div>
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

export default FormPickers;
