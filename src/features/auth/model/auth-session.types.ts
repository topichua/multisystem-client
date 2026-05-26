export type AuthUserRole = "super_admin" | string;

export type AuthUser = {
  id: number;
  email: string;
  firstName: string;
  lastName?: unknown;
  status: number;
  invitedAt?: unknown;
  invitedByUserId?: unknown;
  invitationExpiresAt?: unknown;
  invitationAcceptedAt?: unknown;
  emailVerifiedAt?: unknown;
  lastSeenAt?: unknown;
  lastLoginAt?: unknown;
  country?: unknown;
  region?: unknown;
  city?: unknown;
  streetLine1?: unknown;
  streetLine2?: unknown;
  postalCode?: unknown;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type AuthCompany = {
  id: number;
  name: string;
  pageId: string;
  instagramAccountId: string;
};

export type AuthSessionResponse = {
  email: string;
  role: AuthUserRole;
  user: AuthUser;
  company: AuthCompany;
  companyName?: unknown;
};
