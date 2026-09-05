import { apiRequest } from "./client";

export interface EmailAccount {
  id: string;
  workspaceId: string;
  email: string;
  name?: string | null;
  provider: string;
  status: string;

  dailyLimit?: number | null;
  sentToday?: number;
  lastActivity?: string | null;

  createdAt?: string;
  updatedAt?: string;
}

interface EmailAccountListResponse {
  success: boolean;
  data: EmailAccount[];
}

interface EmailAccountResponse {
  success: boolean;
  data: EmailAccount;
}

/**
 * Get all email accounts for a workspace
 */
export async function getEmailAccounts(
  workspaceId: string
): Promise<EmailAccount[]> {
  const response =
    await apiRequest<EmailAccountListResponse>(
      `/api/email-accounts?workspaceId=${encodeURIComponent(
        workspaceId
      )}`
    );

  return response.data;
}

/**
 * Get one email account
 */
export async function getEmailAccount(
  accountId: string
): Promise<EmailAccount> {
  const response =
    await apiRequest<EmailAccountResponse>(
      `/api/email-accounts/${accountId}`
    );

  return response.data;
}

/**
 * Frontend input
 *
 * The UI uses:
 * smtpUsername
 * smtpPassword
 *
 * Backend expects:
 * smtpUser
 * smtpPass
 */
export interface CreateEmailAccountInput {
  workspaceId: string;
  email: string;
  name?: string;

  /**
   * Backend enum:
   * GOOGLE
   * SMTP
   * ETHEREAL
   */
  provider: string;

  smtpHost?: string;
  smtpPort?: number;

  smtpUsername?: string;
  smtpPassword?: string;

  dailyLimit?: number;
}

/**
 * Create email account
 */
export async function createEmailAccount(
  input: CreateEmailAccountInput
): Promise<EmailAccount> {
  const payload = {
    workspaceId: input.workspaceId,

    email: input.email.trim(),

    displayName:
      input.name?.trim() || input.email.trim(),

    provider: input.provider.toUpperCase(),

    smtpHost: input.smtpHost?.trim(),

    smtpPort: input.smtpPort,

    // IMPORTANT:
    // Convert frontend names to backend names
    smtpUser: input.smtpUsername?.trim(),

    smtpPass: input.smtpPassword,

    dailyLimit: input.dailyLimit,
  };

  console.log(
    "Creating email account:",
    {
      ...payload,
      smtpPass: payload.smtpPass
        ? "***"
        : undefined,
    }
  );

  const response =
    await apiRequest<EmailAccountResponse>(
      "/api/email-accounts",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );

  return response.data;
}

/**
 * Update email account
 */
export async function updateEmailAccount(
  accountId: string,
  input: Partial<CreateEmailAccountInput> & {
    status?: string;
  }
): Promise<EmailAccount> {
  const payload: Record<string, unknown> = {};

  if (input.workspaceId !== undefined) {
    payload.workspaceId =
      input.workspaceId;
  }

  if (input.email !== undefined) {
    payload.email =
      input.email.trim();
  }

  if (input.name !== undefined) {
    payload.displayName =
      input.name.trim();
  }

  if (input.provider !== undefined) {
    payload.provider =
      input.provider.toUpperCase();
  }

  if (input.smtpHost !== undefined) {
    payload.smtpHost =
      input.smtpHost.trim();
  }

  if (input.smtpPort !== undefined) {
    payload.smtpPort =
      input.smtpPort;
  }

  if (input.smtpUsername !== undefined) {
    payload.smtpUser =
      input.smtpUsername.trim();
  }

  if (input.smtpPassword !== undefined) {
    payload.smtpPass =
      input.smtpPassword;
  }

  if (input.dailyLimit !== undefined) {
    payload.dailyLimit =
      input.dailyLimit;
  }

  if (input.status !== undefined) {
    payload.status =
      input.status.toUpperCase();
  }

  const response =
    await apiRequest<EmailAccountResponse>(
      `/api/email-accounts/${accountId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      }
    );

  return response.data;
}

/**
 * Delete email account
 */
export async function deleteEmailAccount(
  accountId: string
): Promise<void> {
  await apiRequest(
    `/api/email-accounts/${accountId}`,
    {
      method: "DELETE",
    }
  );
}