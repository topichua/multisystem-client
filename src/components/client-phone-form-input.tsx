import { Input } from "antd";
import type { InputProps } from "antd";
import PhoneInput from "react-phone-number-input";

import { CLIENT_PHONE_DEFAULT_COUNTRY } from "@/utils/phone-input";

type PhoneInputProps = React.ComponentProps<typeof PhoneInput>;

export type ClientPhoneFormInputProps = Omit<
  PhoneInputProps,
  "defaultCountry" | "international" | "onChange"
> &
  Omit<InputProps, "value" | "onChange" | "defaultValue" | "type"> & {
    onChange?: PhoneInputProps["onChange"];
  };

export function ClientPhoneFormInput({
  onChange,
  ...rest
}: ClientPhoneFormInputProps) {
  return (
    <PhoneInput
      defaultCountry={CLIENT_PHONE_DEFAULT_COUNTRY}
      inputComponent={Input}
      international
      smartCaret={false}
      onChange={onChange ?? (() => {})}
      {...rest}
    />
  );
}
