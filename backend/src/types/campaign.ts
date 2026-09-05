import { Campaign, CampaignStatus } from "@prisma/client";

export type { Campaign, CampaignStatus };

export interface CreateCampaignInput {
  workspaceId: string;
  emailAccountId: string;
  name: string;
  description?: string;
  status?: CampaignStatus;
  timezone?: string;
  scheduledStartAt?: Date | null;
}

export interface UpdateCampaignInput {
  emailAccountId?: string;
  name?: string;
  description?: string | null;
  status?: CampaignStatus;
  timezone?: string;
  scheduledStartAt?: Date | null;
}

export interface CampaignListFilters {
  workspaceId?: string;
  status?: CampaignStatus;
}
