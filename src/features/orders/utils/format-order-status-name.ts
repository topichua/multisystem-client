export const formatOrderStatusName = (
  name: string,
  isDefault: boolean,
  defaultLabel: string,
): string => (isDefault ? `${name} (${defaultLabel})` : name);
