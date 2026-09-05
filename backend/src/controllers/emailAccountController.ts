import { Request, Response } from "express";
import {
  EmailAccountProvider,
  EmailAccountStatus,
} from "@prisma/client";
import {
  createEmailAccount,
  deleteEmailAccount,
  getEmailAccountById,
  listEmailAccounts,
  updateEmailAccount,
} from "../services/emailAccountService";
import { asyncHandler } from "../utils/asyncHandler";
import {
  assertAtLeastOneField,
  assertNonEmptyString,
  assertOptionalEnum,
} from "../utils/validation";

const providers = Object.values(EmailAccountProvider);
const statuses = Object.values(EmailAccountStatus);

function getProvider(value: unknown) {
  return assertOptionalEnum(
    value,
    "provider",
    providers
  );
}

function getStatus(value: unknown) {
  return assertOptionalEnum(
    value,
    "status",
    statuses
  );
}

export const createEmailAccountController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;

    assertNonEmptyString(body.workspaceId, "workspaceId");
    assertNonEmptyString(body.email, "email");

    const provider = getProvider(body.provider);

    if (!provider) {
      assertNonEmptyString(body.provider, "provider");
    }

    const emailAccount = await createEmailAccount({
      workspaceId: body.workspaceId,
      email: body.email,
      displayName:
        typeof body.displayName === "string"
          ? body.displayName
          : undefined,
      provider: provider!,
      googleRefreshToken:
        typeof body.googleRefreshToken === "string"
          ? body.googleRefreshToken
          : undefined,
      smtpHost:
        typeof body.smtpHost === "string"
          ? body.smtpHost
          : undefined,
      smtpPort:
        typeof body.smtpPort === "number"
          ? body.smtpPort
          : undefined,
      smtpUser:
        typeof body.smtpUser === "string"
          ? body.smtpUser
          : undefined,
      smtpPass:
        typeof body.smtpPass === "string"
          ? body.smtpPass
          : undefined,
    });

    res.status(201).json({
      success: true,
      data: emailAccount,
    });
  }
);

export const listEmailAccountsController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId =
      typeof req.query.workspaceId === "string"
        ? req.query.workspaceId
        : undefined;

    const emailAccounts =
      await listEmailAccounts(workspaceId);

    res.json({
      success: true,
      data: emailAccounts,
    });
  }
);

export const getEmailAccountController = asyncHandler(
  async (req: Request, res: Response) => {
    assertNonEmptyString(req.params.id, "id");

    const emailAccount =
      await getEmailAccountById(req.params.id);

    res.json({
      success: true,
      data: emailAccount,
    });
  }
);

export const updateEmailAccountController = asyncHandler(
  async (req: Request, res: Response) => {
    assertNonEmptyString(req.params.id, "id");

    const body = req.body as Record<string, unknown>;

    assertAtLeastOneField(body, [
      "email",
      "displayName",
      "status",
      "googleRefreshToken",
      "smtpHost",
      "smtpPort",
      "smtpUser",
      "smtpPass",
    ]);

    const status =
      body.status !== undefined
        ? getStatus(body.status)
        : undefined;

    const emailAccount =
      await updateEmailAccount(req.params.id, {
        email:
          typeof body.email === "string"
            ? body.email
            : undefined,

        displayName:
          body.displayName === null
            ? null
            : typeof body.displayName === "string"
              ? body.displayName
              : undefined,

        status,

        googleRefreshToken:
          body.googleRefreshToken === null
            ? null
            : typeof body.googleRefreshToken === "string"
              ? body.googleRefreshToken
              : undefined,

        smtpHost:
          body.smtpHost === null
            ? null
            : typeof body.smtpHost === "string"
              ? body.smtpHost
              : undefined,

        smtpPort:
          body.smtpPort === null
            ? null
            : typeof body.smtpPort === "number"
              ? body.smtpPort
              : undefined,

        smtpUser:
          body.smtpUser === null
            ? null
            : typeof body.smtpUser === "string"
              ? body.smtpUser
              : undefined,

        smtpPass:
          body.smtpPass === null
            ? null
            : typeof body.smtpPass === "string"
              ? body.smtpPass
              : undefined,
      });

    res.json({
      success: true,
      data: emailAccount,
    });
  }
);

export const deleteEmailAccountController = asyncHandler(
  async (req: Request, res: Response) => {
    assertNonEmptyString(req.params.id, "id");

    await deleteEmailAccount(req.params.id);

    res.json({
      success: true,
      message: "Email account deleted successfully",
    });
  }
);