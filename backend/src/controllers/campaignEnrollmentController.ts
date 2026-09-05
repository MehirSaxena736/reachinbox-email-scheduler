import { Request, Response } from "express";
import {
  createCampaignEnrollment,
  deleteCampaignEnrollment,
  getCampaignEnrollmentById,
  listCampaignEnrollments,
} from "../services/campaignEnrollmentService";
import {
  assertNonEmptyString,
} from "../utils/validation";
import { asyncHandler } from "../utils/asyncHandler";

export const createCampaignEnrollmentController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;

    assertNonEmptyString(body.campaignId, "campaignId");
    assertNonEmptyString(body.contactId, "contactId");

    const enrollment = await createCampaignEnrollment({
      campaignId: body.campaignId,
      contactId: body.contactId,
    });

    res.status(201).json({
      success: true,
      data: enrollment,
    });
  }
);

export const listCampaignEnrollmentsController = asyncHandler(
  async (req: Request, res: Response) => {
    const campaignId =
      typeof req.query.campaignId === "string"
        ? req.query.campaignId
        : undefined;

    const contactId =
      typeof req.query.contactId === "string"
        ? req.query.contactId
        : undefined;

    const enrollments = await listCampaignEnrollments({
      campaignId,
      contactId,
    });

    res.json({
      success: true,
      data: enrollments,
    });
  }
);

export const getCampaignEnrollmentController = asyncHandler(
  async (req: Request, res: Response) => {
    assertNonEmptyString(req.params.id, "id");

    const enrollment = await getCampaignEnrollmentById(
      req.params.id
    );

    res.json({
      success: true,
      data: enrollment,
    });
  }
);

export const deleteCampaignEnrollmentController = asyncHandler(
  async (req: Request, res: Response) => {
    assertNonEmptyString(req.params.id, "id");

    await deleteCampaignEnrollment(req.params.id);

    res.status(204).send();
  }
);