import { unknownErrorMessage } from "@/utils/unknown-error-message";

export function throwLoadError(scope: string, error: unknown): never {
  throw new Error(`${scope}: ${unknownErrorMessage(error)}`, { cause: error });
}
