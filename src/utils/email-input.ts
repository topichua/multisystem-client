import type { Rule } from "antd/es/form";

export const emailFieldRules = (options?: {
  required?: boolean;
  requiredMessage?: string;
  invalidMessage?: string;
}): Rule[] => {
  const required = options?.required ?? true;
  const requiredMessage = options?.requiredMessage ?? "Required";
  const invalidMessage = options?.invalidMessage ?? "Invalid email";

  const rules: Rule[] = [];

  if (required) {
    rules.push({ required: true, whitespace: true, message: requiredMessage });
  }

  rules.push({ type: "email", message: invalidMessage });

  return rules;
};
