import type { Option } from "../../components/common-select/commonSelect";

export const PAYMENT_MODE_OPTIONS: Option[] = [
  { value: "cash",          label: "Cash"          },
  { value: "upi",           label: "UPI"           },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cheque",        label: "Cheque"        },
  { value: "credit_card",   label: "Card / POS"    },
];

export const ADVANCE_PAYMENT_OPTION: Option = { value: "advance_payment", label: "Advance Payment" };
