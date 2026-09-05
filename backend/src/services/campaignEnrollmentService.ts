import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";

interface CreateEnrollmentInput {
  campaignId: string;
  contactId: string;
}

interface EnrollmentFilters {
  campaignId?: string;
  contactId?: string;
}

export async function createCampaignEnrollment(
  input: CreateEnrollmentInput
) {
  const [campaign, contact] = await Promise.all([
    prisma.campaign.findUnique({
      where: { id: input.campaignId },
    }),
    prisma.contact.findUnique({
      where: { id: input.contactId },
    }),
  ]);

  if (!campaign) {
    throw new AppError(404, "Campaign not found", {
      code: "CAMPAIGN_NOT_FOUND",
    });
  }

  if (!contact) {
    throw new AppError(404, "Contact not found", {
      code: "CONTACT_NOT_FOUND",
    });
  }

  if (campaign.workspaceId !== contact.workspaceId) {
    throw new AppError(
      400,
      "Campaign and contact must belong to the same workspace",
      {
        code: "INVALID_RELATION",
      }
    );
  }

  const existing = await prisma.campaignEnrollment.findFirst({
    where: {
      campaignId: input.campaignId,
      contactId: input.contactId,
    },
  });

  if (existing) {
    throw new AppError(
      409,
      "Contact is already enrolled in this campaign",
      {
        code: "ENROLLMENT_ALREADY_EXISTS",
      }
    );
  }

  return prisma.campaignEnrollment.create({
    data: {
      campaignId: input.campaignId,
      contactId: input.contactId,
    },
  });
}

export async function listCampaignEnrollments(
  filters: EnrollmentFilters
) {
  return prisma.campaignEnrollment.findMany({
    where: {
      campaignId: filters.campaignId,
      contactId: filters.contactId,
    },
    
  });
}

export async function getCampaignEnrollmentById(id: string) {
  const enrollment = await prisma.campaignEnrollment.findUnique({
    where: { id },
  });

  if (!enrollment) {
    throw new AppError(404, "Campaign enrollment not found", {
      code: "ENROLLMENT_NOT_FOUND",
    });
  }

  return enrollment;
}

export async function deleteCampaignEnrollment(id: string) {
  const existing = await prisma.campaignEnrollment.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, "Campaign enrollment not found", {
      code: "ENROLLMENT_NOT_FOUND",
    });
  }

  await prisma.campaignEnrollment.delete({
    where: { id },
  });
}