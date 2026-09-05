import { Contact } from "@prisma/client";

export type { Contact };

export interface CreateContactInput {
  workspaceId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  title?: string;
}

export interface UpdateContactInput {
  email?: string;
  firstName?: string | null;
  lastName?: string | null;
  company?: string | null;
  title?: string | null;
}

export interface ContactListFilters {
  workspaceId?: string;
  email?: string;
}
