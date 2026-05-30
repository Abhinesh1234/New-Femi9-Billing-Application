import React, { useEffect, useState } from "react";
import { DatePicker, type DatePickerProps } from "antd";

// ── Masking helpers ───────────────────────────────────────────────────────────

function applyDigit(current: string, digit: string): string {
  const len = current.length;

  if (len === 0) {
    // Day first digit: 0–3 only
    if (parseInt(digit) > 3) return current;
    return digit;
  }
  if (len === 1) {
    // Day second digit — validate full day 01–31
    const day = parseInt(current + digit);
    if (day < 1 || day > 31) return current;
    return current + digit + "/";   // auto-insert separator
  }
  if (len === 3) {
    // Month first digit: 0 or 1 only
    if (parseInt(digit) > 1) return current;
    return current + digit;
  }
  if (len === 4) {
    // Month second digit — validate full month 01–12
    const month = parseInt(current[3] + digit);
    if (month < 1 || month > 12) return current;
    return current + digit + "/";   // auto-insert separator
  }
  if (len >= 6 && len <= 9) {
    // Year — accept any 4 digits
    return current + digit;
  }

  return current; // max length (10) reached or unexpected state
}

// ── Masked input component ────────────────────────────────────────────────────

interface MaskedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const MaskedDateInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ value: externalValue, onChange, onKeyDown, ...rest }, ref) => {
    const [display, setDisplay] = useState<string>((externalValue as string) ?? "");

    // Sync when AntD updates value externally (calendar pick, programmatic change)
    useEffect(() => {
      setDisplay((externalValue as string) ?? "");
    }, [externalValue]);

    const fireChange = (val: string) => {
      if (!onChange) return;
      // Emit a synthetic ChangeEvent so AntD can parse the new value
      const evt = {
        target: { value: val },
        currentTarget: { value: val },
        preventDefault: () => {},
        stopPropagation: () => {},
        persist: () => {},
        nativeEvent: {} as Event,
        bubbles: true,
        cancelable: false,
        defaultPrevented: false,
        eventPhase: 0,
        isTrusted: false,
        timeStamp: Date.now(),
        type: "change",
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      onChange(evt);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const key = e.key;

      // Pass navigation / system keys through to AntD (open/close picker, etc.)
      if (
        ["Tab", "Escape", "Enter", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(key) ||
        e.ctrlKey ||
        e.metaKey
      ) {
        onKeyDown?.(e as any);
        return;
      }

      // Block everything else at the browser level
      e.preventDefault();

      let next = display;

      if (key === "Backspace" || key === "Delete") {
        // When a separator was auto-inserted, remove it together with the digit before it
        if (next.endsWith("/")) next = next.slice(0, -2);
        else next = next.slice(0, -1);
      } else if (/^\d$/.test(key)) {
        next = applyDigit(display, key);
      } else {
        return; // ignore letters, symbols, etc.
      }

      if (next === display) return;
      setDisplay(next);
      fireChange(next);
    };

    return (
      <input
        {...rest}
        ref={ref}
        value={display}
        onChange={() => {}}                    // fully controlled via keyDown
        onKeyDown={handleKeyDown}
        onPaste={(e) => e.preventDefault()}    // block paste (avoids malformed strings)
        inputMode="numeric"
        autoComplete="off"
      />
    );
  }
);

MaskedDateInput.displayName = "MaskedDateInput";

// ── CommonDatePicker ──────────────────────────────────────────────────────────

type CommonDatePickerProps = DatePickerProps & {
  className?: string;
  icon?: React.ReactNode;
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
        suffixIcon={icon}
        components={{ input: MaskedDateInput }}
        {...props}
      />
    </div>
  );
};

export default CommonDatePicker;
