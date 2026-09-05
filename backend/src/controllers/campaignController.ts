import { Request, Response } from "express";
import { CampaignStatus } from "@prisma/client";
import {
  createCampaign,
  deleteCampaign,
  getCampaignById,
  listCampaigns,
  updateCampaign,
} from "../services/campaignService";
import {
  assertAtLeastOneField,
  assertNonEmptyString,
  assertOptionalDate,
  assertOptionalEnum,
  assertOptionalString,
} from "../utils/validation";
import { asyncHandler } from "../utils/asyncHandler";

const campaignStatuses = Object.values(CampaignStatus);

export const createCampaignController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;

    assertNonEmptyString(body.workspaceId, "workspaceId");
    assertNonEmptyString(body.emailAccountId, "emailAccountId");
    assertNonEmptyString(body.name, "name");

    const description = assertOptionalString(
      body.description,
      "description"
    );

    const timezone = assertOptionalString(body.timezone, "timezone");

    const status = assertOptionalEnum(
      body.status,
      "status",
      campaignStatuses
    );

    const scheduledStartAt = assertOptionalDate(
      body.scheduledStartAt,
      "scheduledStartAt"
    );

    const campaign = await createCampaign({
      workspaceId: body.workspaceId,
      emailAccountId: body.emailAccountId,
      name: body.name,
      description,
      status,
      timezone,
      scheduledStartAt,
    });

    res.status(201).json({
      success: true,
      data: campaign,
    });
  }
);

export const listCampaignsController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId =
      typeof req.query.workspaceId === "string"
        ? req.query.workspaceId
        : undefined;

    const status =
      typeof req.query.status === "string"
        ? assertOptionalEnum(
            req.query.status,
            "status",
            campaignStatuses
          )
        : undefined;

    const campaigns = await listCampaigns({
      workspaceId,
      status,
    });

    res.json({
      success: true,
      data: campaigns,
    });
  }
);

export const getCampaignController = asyncHandler(
  async (req: Request, res: Response) => {
    assertNonEmptyString(req.params.id, "id");

    const campaign = await getCampaignById(req.params.id);

    res.json({
      success: true,
      data: campaign,
    });
  }
);

export const updateCampaignController = asyncHandler(
  async (req: Request, res: Response) => {
    assertNonEmptyString(req.params.id, "id");

    const body = req.body as Record<string, unknown>;

    assertAtLeastOneField(body, [
      "emailAccountId",
      "name",
      "description",
      "status",
      "timezone",
      "scheduledStartAt",
    ]);

    const emailAccountId = assertOptionalString(
      body.emailAccountId,
      "emailAccountId"
    );

    const name = assertOptionalString(body.name, "name");

    const description = assertOptionalString(
      body.description,
      "description"
    );

    const timezone = assertOptionalString(
      body.timezone,
      "timezone"
    );

    const status = assertOptionalEnum(
      body.status,
      "status",
      campaignStatuses
    );

    const scheduledStartAt = assertOptionalDate(
      body.scheduledStartAt,
      "scheduledStartAt"
    );

    const campaign = await updateCampaign(req.params.id, {
      emailAccountId,
      name,
      description:
        body.description === null ? null : description,
      status,
      timezone,
      scheduledStartAt,
    });

    res.json({
      success: true,
      data: campaign,
    });
  }
);

export const deleteCampaignController = asyncHandler(
  async (req: Request, res: Response) => {
    assertNonEmptyString(req.params.id, "id");

    await deleteCampaign(req.params.id);

    res.status(204).send();
  }
);