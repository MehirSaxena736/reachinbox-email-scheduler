import { CampaignStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import {
  CampaignListFilters,
  CreateCampaignInput,
  UpdateCampaignInput,
} from "../types/campaign";
import { AppError } from "../utils/AppError";

export async function createCampaign(input: CreateCampaignInput) {
  const emailAccount = await prisma.emailAccount.findFirst({
    where: {
      id: input.emailAccountId,
      workspaceId: input.workspaceId,
    },
  });

  if (!emailAccount) {
    throw new AppError(404, "Email account not found in this workspace", {
      code: "EMAIL_ACCOUNT_NOT_FOUND",
    });
  }

  return prisma.campaign.create({
    data: {
      workspaceId: input.workspaceId,
      emailAccountId: input.emailAccountId,
      name: input.name.trim(),
      description: input.description?.trim(),
      status: input.status ?? CampaignStatus.DRAFT,
      timezone: input.timezone ?? "UTC",
      scheduledStartAt: input.scheduledStartAt ?? null,
    },
  });
}

export async function listCampaigns(filters: CampaignListFilters) {
  return prisma.campaign.findMany({
    where: {
      workspaceId: filters.workspaceId,
      status: filters.status,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getCampaignById(id: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      sequence: {
        include: {
          steps: {
            orderBy: {
              stepNumber: "asc",
            },
          },
        },
      },
    },
  });

  if (!campaign) {
    throw new AppError(404, "Campaign not found", {
      code: "CAMPAIGN_NOT_FOUND",
    });
  }

  return campaign;
}

export async function updateCampaign(
  id: string,
  input: UpdateCampaignInput
) {
  const existing = await prisma.campaign.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, "Campaign not found", {
      code: "CAMPAIGN_NOT_FOUND",
    });
  }

  if (input.emailAccountId) {
    const emailAccount = await prisma.emailAccount.findFirst({
      where: {
        id: input.emailAccountId,
        workspaceId: existing.workspaceId,
      },
    });

    if (!emailAccount) {
      throw new AppError(404, "Email account not found in this workspace", {
        code: "EMAIL_ACCOUNT_NOT_FOUND",
      });
    }
  }

  return prisma.campaign.update({
    where: { id },
    data: {
      emailAccountId: input.emailAccountId,
      name: input.name?.trim(),
      description:
        input.description === null
          ? null
          : input.description?.trim(),
      status: input.status,
      timezone: input.timezone,
      scheduledStartAt: input.scheduledStartAt,
    },
  });
}

export async function deleteCampaign(id: string) {
  const existing = await prisma.campaign.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, "Campaign not found", {
      code: "CAMPAIGN_NOT_FOUND",
    });
  }

  await prisma.campaign.delete({
    where: { id },
  });
}