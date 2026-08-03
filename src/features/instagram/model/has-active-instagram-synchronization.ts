function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value != null;
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function isActiveStatus(status: string | null): boolean {
  if (status == null) {
    return false;
  }

  const normalized = status.toLowerCase();
  return (
    normalized === "active" ||
    normalized === "syncing" ||
    normalized === "in_progress" ||
    normalized === "in-progress" ||
    normalized === "running" ||
    normalized === "pending"
  );
}

function hasActiveSynchronizationItems(value: unknown): boolean {
  if (!Array.isArray(value)) {
    return false;
  }

  if (value.length === 0) {
    return false;
  }

  return value.some((item) => {
    if (!isRecord(item)) {
      return true;
    }

    if (
      item.active === true ||
      item.isActive === true ||
      item.syncing === true
    ) {
      return true;
    }

    const status =
      readString(item.status) ??
      readString(item.state) ??
      readString(item.phase);

    if (status == null) {
      return true;
    }

    return isActiveStatus(status);
  });
}

/**
 * Returns true when GET /api/instagram/synchronizations/active reports an
 * in-progress Instagram history / chats synchronization.
 */
export function hasActiveInstagramSynchronization(data: unknown): boolean {
  if (data == null) {
    return false;
  }

  if (typeof data === "boolean") {
    return data;
  }

  if (Array.isArray(data)) {
    return hasActiveSynchronizationItems(data);
  }

  if (!isRecord(data)) {
    return false;
  }

  if (
    data.active === true ||
    data.isActive === true ||
    data.syncing === true ||
    data.hasActive === true
  ) {
    return true;
  }

  if (
    isActiveStatus(readString(data.status)) ||
    isActiveStatus(readString(data.state))
  ) {
    return true;
  }

  return (
    hasActiveSynchronizationItems(data.items) ||
    hasActiveSynchronizationItems(data.synchronizations) ||
    hasActiveSynchronizationItems(data.data) ||
    hasActiveSynchronizationItems(data.results)
  );
}
