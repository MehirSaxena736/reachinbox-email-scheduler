import { apiRequest } from "./client";

export interface Contact {
  id: string;
  workspaceId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  company?: string | null;
  title?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface ContactListResponse {
  success: boolean;
  data: Contact[];
}

interface ContactResponse {
  success: boolean;
  data: Contact;
}

export async function getContacts(
  workspaceId: string,
  email?: string
): Promise<Contact[]> {
  const params = new URLSearchParams({
    workspaceId,
  });

  if (email?.trim()) {
    params.set("email", email.trim());
  }

  const response = await apiRequest<ContactListResponse>(
    `/api/contacts?${params.toString()}`
  );

  return response.data;
}

export async function getContact(
  contactId: string
): Promise<Contact> {
  const response = await apiRequest<ContactResponse>(
    `/api/contacts/${contactId}`
  );

  return response.data;
}

export interface CreateContactInput {
  workspaceId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  title?: string;
}

export async function createContact(
  input: CreateContactInput
): Promise<Contact> {
  const response = await apiRequest<ContactResponse>(
    "/api/contacts",
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );

  return response.data;
}

export async function updateContact(
  contactId: string,
  input: Partial<CreateContactInput>
): Promise<Contact> {
  const response = await apiRequest<ContactResponse>(
    `/api/contacts/${contactId}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    }
  );

  return response.data;
}

export async function deleteContact(
  contactId: string
): Promise<void> {
  await apiRequest(
    `/api/contacts/${contactId}`,
    {
      method: "DELETE",
    }
  );
}