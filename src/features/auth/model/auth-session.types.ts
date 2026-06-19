export type AuthUserRole = "super_admin" | string;

export type AuthUser = {
  id: number;
  email: string;
  firstName: string;
  lastName: string | null;
  avatar_src: string | null;
  status: number;
  invitedAt: string | null;
  invitedByUserId: number | null;
  invitationExpiresAt: string | null;
  invitationAcceptedAt: string | null;
  emailVerifiedAt: string | null;
  lastSeenAt: string | null;
  lastLoginAt: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  streetLine1: string | null;
  streetLine2: string | null;
  postalCode: string | null;
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
  company: AuthCompany | null;
  companyName: string | null;
};
