import { Request, Response } from "express";
import { EmailEventType } from "@prisma/client";
import {
  createEmailEvent,
  getEmailEventById,
  listEmailEvents,
} from "../services/emailEventService";
import {
  assertNonEmptyString,
  assertOptionalEnum,
} from "../utils/validation";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";

const eventTypes = Object.values(EmailEventType);

export const createEmailEventController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;

    assertNonEmptyString(
      body.scheduledEmailId,
      "scheduledEmailId"
    );

    const type = assertOptionalEnum(
      body.type,
      "type",
      eventTypes
    );

    if (!type) {
      throw new AppError(400, "type is required", {
        code: "VALIDATION_ERROR",
        details: { field: "type" },
      });
    }

    let metadata: Record<string, unknown> | undefined;

    if (body.metadata !== undefined) {
      if (
        typeof body.metadata !== "object" ||
        body.metadata === null ||
        Array.isArray(body.metadata)
      ) {
        throw new AppError(400, "metadata must be an object", {
          code: "VALIDATION_ERROR",
          details: { field: "metadata" },
        });
      }

      metadata = body.metadata as Record<string, unknown>;
    }

    const event = await createEmailEvent({
      scheduledEmailId: body.scheduledEmailId,
      type,
      metadata,
    });

    res.status(201).json({
      success: true,
      data: event,
    });
  }
);

export const listEmailEventsController = asyncHandler(
  async (req: Request, res: Response) => {
    const scheduledEmailId =
      typeof req.query.scheduledEmailId === "string"
        ? req.query.scheduledEmailId
        : undefined;

    const type =
      typeof req.query.type === "string"
        ? assertOptionalEnum(
            req.query.type,
            "type",
            eventTypes
          )
        : undefined;

    const events = await listEmailEvents({
      scheduledEmailId,
      type,
    });

    res.json({
      success: true,
      data: events,
    });
  }
);

export const getEmailEventController = asyncHandler(
  async (req: Request, res: Response) => {
    assertNonEmptyString(req.params.id, "id");

    const event = await getEmailEventById(req.params.id);

    res.json({
      success: true,
      data: event,
    });
  }
);