import React from "react";
import { Select } from "antd";
import type { SelectProps } from "antd";

type MultipleSelectProps = {
  value?: string[];
  onChange?: (value: string[]) => void;
  options: SelectProps['options'];
  placeholder?: string;
  style?: React.CSSProperties;
};

const MultipleSelect: React.FC<MultipleSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Please select",
  style = { width: "100%" },
}) => {
  return (
    <div className="common-multiSelect">
    <Select
      mode="multiple"
      allowClear
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      options={options}
      style={style}
    />
    </div>
  );
};

export default MultipleSelect;
