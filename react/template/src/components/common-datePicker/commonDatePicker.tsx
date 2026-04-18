import React from "react";
import { DatePicker, type DatePickerProps } from "antd";

type CommonDatePickerProps = DatePickerProps & {
  className?: string;
  icon?: React.ReactNode; // allows passing a custom icon
};

const CommonDatePicker: React.FC<CommonDatePickerProps> = ({
  className = "",
  icon = <i className="ti ti-calendar text-dark" />,
  ...props
}) => {
  return (
    <div className={`common-datePicker ${className}`}>
      <DatePicker
        className="form-control"
        suffixIcon={icon} // Replace default icon with custom
        {...props}
      />
    </div>
  );
};

export default CommonDatePicker;
