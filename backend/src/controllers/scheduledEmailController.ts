import { Request, Response } from "express";
import { ScheduledEmailStatus } from "@prisma/client";
import {
  createScheduledEmail,
  getScheduledEmailById,
  listScheduledEmails,
  updateScheduledEmail,
  cancelScheduledEmail,
} from "../services/scheduledEmailService";
import { asyncHandler } from "../utils/asyncHandler";
import {
  assertAtLeastOneField,
  assertNonEmptyString,
  assertOptionalDate,
  assertOptionalEnum,
} from "../utils/validation";
import { AppError } from "../utils/AppError";

const statuses = Object.values(ScheduledEmailStatus);

function getScheduledStatus(value: unknown) {
  return assertOptionalEnum(value, "status", statuses);
}

export const createScheduledEmailController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;

    const workspaceId = body.workspaceId;
    const campaignId = body.campaignId;
    const contactId = body.contactId;
    const campaignEnrollmentId = body.campaignEnrollmentId;
    const sequenceStepId = body.sequenceStepId;
    const emailAccountId = body.emailAccountId;

    assertNonEmptyString(workspaceId, "workspaceId");
    assertNonEmptyString(campaignId, "campaignId");
    assertNonEmptyString(contactId, "contactId");
    assertNonEmptyString(
      campaignEnrollmentId,
      "campaignEnrollmentId"
    );
    assertNonEmptyString(sequenceStepId, "sequenceStepId");
    assertNonEmptyString(emailAccountId, "emailAccountId");

    const scheduledAt = assertOptionalDate(
      body.scheduledAt,
      "scheduledAt"
    );

    if (!scheduledAt) {
      throw new AppError(400, "scheduledAt is required", {
        code: "VALIDATION_ERROR",
        details: { field: "scheduledAt" },
      });
    }

    const scheduledEmail = await createScheduledEmail({
      workspaceId,
      campaignId,
      contactId,
      campaignEnrollmentId,
      sequenceStepId,
      emailAccountId,
      scheduledAt,
    });

    res.status(201).json({
      success: true,
      data: scheduledEmail,
    });
  }
);

export const listScheduledEmailsController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId =
      typeof req.query.workspaceId === "string"
        ? req.query.workspaceId
        : undefined;

    const campaignId =
      typeof req.query.campaignId === "string"
        ? req.query.campaignId
        : undefined;

    const contactId =
      typeof req.query.contactId === "string"
        ? req.query.contactId
        : undefined;

    const status =
      typeof req.query.status === "string"
        ? getScheduledStatus(req.query.status)
        : undefined;

    const emails = await listScheduledEmails({
      workspaceId,
      campaignId,
      contactId,
      status,
    });

    res.json({
      success: true,
      data: emails,
    });
  }
);

export const getScheduledEmailController = asyncHandler(
  async (req: Request, res: Response) => {
    assertNonEmptyString(req.params.id, "id");

    const scheduledEmail = await getScheduledEmailById(
      req.params.id
    );

    res.json({
      success: true,
      data: scheduledEmail,
    });
  }
);

export const updateScheduledEmailController = asyncHandler(
  async (req: Request, res: Response) => {
    assertNonEmptyString(req.params.id, "id");

    const body = req.body as Record<string, unknown>;

    assertAtLeastOneField(body, ["scheduledAt", "status"]);

    const scheduledAt =
      body.scheduledAt !== undefined
        ? assertOptionalDate(body.scheduledAt, "scheduledAt")
        : undefined;

    const status =
      body.status !== undefined
        ? getScheduledStatus(body.status)
        : undefined;

    const scheduledEmail = await updateScheduledEmail(
      req.params.id,
      {
        scheduledAt: scheduledAt ?? undefined,
        status,
      }
    );

    res.json({
      success: true,
      data: scheduledEmail,
    });
  }
);

export const cancelScheduledEmailController = asyncHandler(
  async (req: Request, res: Response) => {
    assertNonEmptyString(req.params.id, "id");

    const scheduledEmail = await cancelScheduledEmail(
      req.params.id
    );

    res.json({
      success: true,
      data: scheduledEmail,
    });
  }
);