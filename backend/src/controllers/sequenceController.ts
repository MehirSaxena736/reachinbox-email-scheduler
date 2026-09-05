import { Request, Response } from "express";
import {
  createSequence,
  createSequenceStep,
  deleteSequence,
  deleteSequenceStep,
  getSequenceByCampaignId,
  updateSequence,
  updateSequenceStep,
} from "../services/sequenceService";
import {
  assertAtLeastOneField,
  assertNonEmptyString,
} from "../utils/validation";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";

function getPositiveInteger(value: unknown, field: string): number {
  const number = Number(value);

  if (!Number.isInteger(number) || number <= 0) {
    throw new AppError(400, `${field} must be a positive integer`, {
      code: "VALIDATION_ERROR",
      details: { field },
    });
  }

  return number;
}

function getNonNegativeInteger(value: unknown, field: string): number {
  const number = Number(value);

  if (!Number.isInteger(number) || number < 0) {
    throw new AppError(400, `${field} must be a non-negative integer`, {
      code: "VALIDATION_ERROR",
      details: { field },
    });
  }

  return number;
}

export const createSequenceController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;

    assertNonEmptyString(body.campaignId, "campaignId");
    assertNonEmptyString(body.name, "name");

    const sequence = await createSequence({
      campaignId: body.campaignId,
      name: body.name,
    });

    res.status(201).json({
      success: true,
      data: sequence,
    });
  }
);

export const getSequenceController = asyncHandler(
  async (req: Request, res: Response) => {
    assertNonEmptyString(req.params.campaignId, "campaignId");

    const sequence = await getSequenceByCampaignId(
      req.params.campaignId
    );

    res.json({
      success: true,
      data: sequence,
    });
  }
);

export const updateSequenceController = asyncHandler(
  async (req: Request, res: Response) => {
    assertNonEmptyString(req.params.id, "id");

    const body = req.body as Record<string, unknown>;

    assertNonEmptyString(body.name, "name");

    const sequence = await updateSequence(req.params.id, {
      name: body.name,
    });

    res.json({
      success: true,
      data: sequence,
    });
  }
);

export const deleteSequenceController = asyncHandler(
  async (req: Request, res: Response) => {
    assertNonEmptyString(req.params.id, "id");

    await deleteSequence(req.params.id);

    res.status(204).send();
  }
);

export const createSequenceStepController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;

    assertNonEmptyString(body.sequenceId, "sequenceId");
    assertNonEmptyString(body.subject, "subject");
    assertNonEmptyString(body.body, "body");

    const stepNumber = getPositiveInteger(
      body.stepNumber,
      "stepNumber"
    );

    const delayMinutes =
      body.delayMinutes === undefined
        ? 0
        : getNonNegativeInteger(
            body.delayMinutes,
            "delayMinutes"
          );

    const step = await createSequenceStep({
      sequenceId: body.sequenceId,
      stepNumber,
      subject: body.subject,
      body: body.body,
      delayMinutes,
    });

    res.status(201).json({
      success: true,
      data: step,
    });
  }
);

export const updateSequenceStepController = asyncHandler(
  async (req: Request, res: Response) => {
    assertNonEmptyString(req.params.id, "id");

    const body = req.body as Record<string, unknown>;

    assertAtLeastOneField(body, [
      "stepNumber",
      "subject",
      "body",
      "delayMinutes",
    ]);

    const input: {
      stepNumber?: number;
      subject?: string;
      body?: string;
      delayMinutes?: number;
    } = {};

    if (body.stepNumber !== undefined) {
      input.stepNumber = getPositiveInteger(
        body.stepNumber,
        "stepNumber"
      );
    }

    if (body.subject !== undefined) {
      assertNonEmptyString(body.subject, "subject");
      input.subject = body.subject;
    }

    if (body.body !== undefined) {
      assertNonEmptyString(body.body, "body");
      input.body = body.body;
    }

    if (body.delayMinutes !== undefined) {
      input.delayMinutes = getNonNegativeInteger(
        body.delayMinutes,
        "delayMinutes"
      );
    }

    const step = await updateSequenceStep(
      req.params.id,
      input
    );

    res.json({
      success: true,
      data: step,
    });
  }
);

export const deleteSequenceStepController = asyncHandler(
  async (req: Request, res: Response) => {
    assertNonEmptyString(req.params.id, "id");

    await deleteSequenceStep(req.params.id);

    res.status(204).send();
  }
);