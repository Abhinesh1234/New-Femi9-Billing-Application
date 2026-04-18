import { TimePicker, type TimePickerProps } from "antd";

interface CommonTimePickerProps extends TimePickerProps {
  className?: string;
}

const CommonTimePicker: React.FC<CommonTimePickerProps> = ({
  className = "",
  ...props
}) => {
  return (
    <TimePicker
      className={className}
      format="HH:mm:ss"
      {...props}
    />
  );
};

export default CommonTimePicker;