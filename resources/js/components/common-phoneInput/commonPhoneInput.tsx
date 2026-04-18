import React from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

type CommonPhoneInputProps = {
  value?: string;
  onChange?: (value?: string) => void;
  inputClassName?: string;
  containerClassName?: string;
  placeholder?: string;
};

const CommonPhoneInput: React.FC<CommonPhoneInputProps> = ({
  value,
  onChange,
  inputClassName = "",
  containerClassName = "form-control",
  placeholder = "Enter phone number",
}) => {
  return (
    <div className={containerClassName}>
      <PhoneInput
        defaultCountry="US"
        value={value}
        onChange={onChange ? (val) => onChange(val as string | undefined) : () => {}}
        placeholder={placeholder}
        inputComponent={(props) => (
          <input
            {...props}
            className={inputClassName ? `phone-input ${inputClassName}` : "phone-input"}
          />
        )}
      />
    </div>
  );
};

export default CommonPhoneInput;
