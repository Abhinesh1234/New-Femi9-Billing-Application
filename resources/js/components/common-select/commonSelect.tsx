import React, { useEffect, useState } from "react";
import Select from "react-select";

export type Option = {
  value: string;
  label: string;
};

export interface SelectProps {
  options: Option[];
  defaultValue?: Option;
  value?: Option | null;
  className?: string;
  styles?: any;
  isClearable?: boolean;
  placeholder?: string;
  menuPortalTarget?: HTMLElement | null;
  menuPosition?: "fixed" | "absolute";
  isDisabled?: boolean;
  onChange?: (option: Option | null) => void;
}

const customComponents = {
  IndicatorSeparator: () => null,
};

const CommonSelect: React.FC<SelectProps> = ({ options, defaultValue, value, className, onChange, isClearable, placeholder, menuPortalTarget, menuPosition, isDisabled }) => {
  const [selectedOption, setSelectedOption] = useState<Option | undefined>(defaultValue);

  const customStyles = {
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected ? "#E41F07" : state.isFocused ? "white" : "white",
      color: state.isSelected ? "#fff" : state.isFocused ? "#E41F07" : "#707070",
      cursor: "pointer",
      "&:hover": {
        backgroundColor: "#E41F07",
        color: state.isSelected ? "white" : "#fff",
      },
    }),
    menu: (base: any) => ({ ...base, zIndex: 999 }),
    menuPortal: (base: any) => ({ ...base, zIndex: 999 }),
  };


  const handleChange = (option: Option | null) => {
    setSelectedOption(option || undefined);
    onChange?.(option);
  };
  useEffect(() => {
    setSelectedOption(defaultValue || undefined);
  }, [defaultValue])
  
  return (
    <div className="common-select">
    <Select
     classNamePrefix="react-select"
      className={className}
      styles={customStyles}
      options={options}
      value={value !== undefined ? value : selectedOption}
      onChange={handleChange}
      components={customComponents}
      placeholder={placeholder ?? "Select"}
      isClearable={isClearable}
      isDisabled={isDisabled}
      menuPortalTarget={menuPortalTarget}
      menuPosition={menuPosition}
    />
    </div>
  );
};

export default CommonSelect;
