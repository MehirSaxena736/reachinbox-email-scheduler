import {
  EmailAccountProvider,
  EmailAccountStatus,
} from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";

interface CreateEmailAccountInput {
  workspaceId: string;
  email: string;
  displayName?: string;
  provider: EmailAccountProvider;
  googleRefreshToken?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
}

interface UpdateEmailAccountInput {
  email?: string;
  displayName?: string | null;
  status?: EmailAccountStatus;
  googleRefreshToken?: string | null;
  smtpHost?: string | null;
  smtpPort?: number | null;
  smtpUser?: string | null;
  smtpPass?: string | null;
}

export async function createEmailAccount(
  input: CreateEmailAccountInput
) {
  const workspace = await prisma.workspace.findUnique({
    where: {
      id: input.workspaceId,
    },
  });

  if (!workspace) {
    throw new AppError(404, "Workspace not found", {
      code: "WORKSPACE_NOT_FOUND",
    });
  }

  const email = input.email.toLowerCase().trim();

  const existing = await prisma.emailAccount.findUnique({
    where: {
      workspaceId_email: {
        workspaceId: input.workspaceId,
        email,
      },
    },
  });

  if (existing) {
    throw new AppError(
      409,
      "Email account already exists in this workspace",
      {
        code: "EMAIL_ACCOUNT_ALREADY_EXISTS",
      }
    );
  }

  if (input.provider === EmailAccountProvider.SMTP) {
    if (
      !input.smtpHost ||
      !input.smtpPort ||
      !input.smtpUser ||
      !input.smtpPass
    ) {
      throw new AppError(
        400,
        "SMTP host, port, username and password are required for SMTP accounts",
        {
          code: "INVALID_SMTP_CONFIGURATION",
        }
      );
    }

    if (
      !Number.isInteger(input.smtpPort) ||
      input.smtpPort <= 0 ||
      input.smtpPort > 65535
    ) {
      throw new AppError(
        400,
        "SMTP port must be a valid port between 1 and 65535",
        {
          code: "INVALID_SMTP_PORT",
        }
      );
    }
  }

  if (
    input.provider === EmailAccountProvider.GOOGLE &&
    !input.googleRefreshToken
  ) {
    throw new AppError(
      400,
      "Google refresh token is required for Google accounts",
      {
        code: "INVALID_GOOGLE_CONFIGURATION",
      }
    );
  }

  if (input.provider === EmailAccountProvider.ETHEREAL) {
    if (
      !input.smtpHost ||
      !input.smtpPort ||
      !input.smtpUser ||
      !input.smtpPass
    ) {
      throw new AppError(
        400,
        "SMTP credentials are required for Ethereal accounts",
        {
          code: "INVALID_ETHEREAL_CONFIGURATION",
        }
      );
    }
  }

  return prisma.emailAccount.create({
    data: {
      workspaceId: input.workspaceId,
      email,
      displayName: input.displayName?.trim(),
      provider: input.provider,
      googleRefreshToken: input.googleRefreshToken,
      smtpHost: input.smtpHost,
      smtpPort: input.smtpPort,
      smtpUser: input.smtpUser,
      smtpPass: input.smtpPass,
    },
  });
}

export async function listEmailAccounts(
  workspaceId?: string
) {
  return prisma.emailAccount.findMany({
    where: {
      workspaceId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getEmailAccountById(id: string) {
  const emailAccount = await prisma.emailAccount.findUnique({
    where: {
      id,
    },
  });

  if (!emailAccount) {
    throw new AppError(404, "Email account not found", {
      code: "EMAIL_ACCOUNT_NOT_FOUND",
    });
  }

  return emailAccount;
}

export async function updateEmailAccount(
  id: string,
  input: UpdateEmailAccountInput
) {
  const existing = await prisma.emailAccount.findUnique({
    where: {
      id,
    },
  });

  if (!existing) {
    throw new AppError(404, "Email account not found", {
      code: "EMAIL_ACCOUNT_NOT_FOUND",
    });
  }

  if (input.email) {
    const email = input.email.toLowerCase().trim();

    const duplicate = await prisma.emailAccount.findFirst({
      where: {
        workspaceId: existing.workspaceId,
        email,
        NOT: {
          id,
        },
      },
    });

    if (duplicate) {
      throw new AppError(
        409,
        "Email account already exists in this workspace",
        {
          code: "EMAIL_ACCOUNT_ALREADY_EXISTS",
        }
      );
    }
  }

  return prisma.emailAccount.update({
    where: {
      id,
    },
    data: {
      email: input.email?.toLowerCase().trim(),
      displayName:
        input.displayName === null
          ? null
          : input.displayName?.trim(),
      status: input.status,
      googleRefreshToken: input.googleRefreshToken,
      smtpHost: input.smtpHost,
      smtpPort: input.smtpPort,
      smtpUser: input.smtpUser,
      smtpPass: input.smtpPass,
    },
  });
}

export async function deleteEmailAccount(id: string) {
  const existing = await prisma.emailAccount.findUnique({
    where: {
      id,
    },
  });

  if (!existing) {
    throw new AppError(404, "Email account not found", {
      code: "EMAIL_ACCOUNT_NOT_FOUND",
    });
  }

  const campaigns = await prisma.campaign.count({
    where: {
      emailAccountId: id,
    },
  });

  if (campaigns > 0) {
    throw new AppError(
      400,
      "Email account cannot be deleted while it is used by campaigns",
      {
        code: "EMAIL_ACCOUNT_IN_USE",
      }
    );
  }

  await prisma.emailAccount.delete({
    where: {
      id,
    },
  });
}