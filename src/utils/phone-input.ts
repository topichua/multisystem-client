import type { Rule } from "antd/es/form";
import type { Country } from "react-phone-number-input";
import { isValidPhoneNumber, parsePhoneNumber } from "react-phone-number-input";

export const CLIENT_PHONE_DEFAULT_COUNTRY: Country = "UA";

export function normalizeClientPhoneForInput(
  phone: string,
  defaultCountry: Country = CLIENT_PHONE_DEFAULT_COUNTRY,
): string {
  const t = phone.trim();
  if (!t) {
    return "";
  }
  if (isValidPhoneNumber(t)) {
    return t;
  }
  const parsed = parsePhoneNumber(t, defaultCountry);
  if (parsed?.isValid()) {
    return parsed.number;
  }
  return t;
}

export const phoneFieldRules = (options?: {
  required?: boolean;
  requiredMessage?: string;
  invalidMessage?: string;
}): Rule[] => {
  const required = options?.required ?? true;
  const requiredMessage = options?.requiredMessage ?? "Required";
  const invalidMessage = options?.invalidMessage ?? "Invalid phone number";

  const rules: Rule[] = [];

  if (required) {
    rules.push({ required: true, message: requiredMessage });
  }

  rules.push({
    validator: (_, value) => {
      if (
        value === undefined ||
        value === null ||
        String(value).trim() === ""
      ) {
        return Promise.resolve();
      }
      if (!isValidPhoneNumber(String(value))) {
        return Promise.reject(new Error(invalidMessage));
      }
      return Promise.resolve();
    },
  });

  return rules;
};
