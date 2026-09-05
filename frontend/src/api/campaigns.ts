import { apiRequest } from "./client";

export interface Campaign {
  id: string;
  workspaceId: string;
  emailAccountId: string;
  name: string;
  description?: string | null;
  status: string;
  timezone?: string | null;
  scheduledStartAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface CampaignListResponse {
  success: boolean;
  data: Campaign[];
}

interface CampaignResponse {
  success: boolean;
  data: Campaign;
}

export async function getCampaigns(
  workspaceId: string,
  status?: string
): Promise<Campaign[]> {
  const params = new URLSearchParams();

  params.set("workspaceId", workspaceId);

  if (status) {
    params.set("status", status);
  }

  const response = await apiRequest<CampaignListResponse>(
    `/api/campaigns?${params.toString()}`
  );

  return response.data;
}

export async function getCampaign(
  campaignId: string
): Promise<Campaign> {
  const response = await apiRequest<CampaignResponse>(
    `/api/campaigns/${campaignId}`
  );

  return response.data;
}

export interface CreateCampaignInput {
  workspaceId: string;
  emailAccountId: string;
  name: string;
  description?: string;
  timezone?: string;
  scheduledStartAt?: string;
  status?: string;
}

export async function createCampaign(
  input: CreateCampaignInput
): Promise<Campaign> {
  const response = await apiRequest<CampaignResponse>(
    "/api/campaigns",
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );

  return response.data;
}

export interface UpdateCampaignInput {
  emailAccountId?: string;
  name?: string;
  description?: string | null;
  status?: string;
  timezone?: string;
  scheduledStartAt?: string;
}

export async function updateCampaign(
  campaignId: string,
  input: UpdateCampaignInput
): Promise<Campaign> {
  const response = await apiRequest<CampaignResponse>(
    `/api/campaigns/${campaignId}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    }
  );

  return response.data;
}

export async function deleteCampaign(
  campaignId: string
): Promise<void> {
  await apiRequest(
    `/api/campaigns/${campaignId}`,
    {
      method: "DELETE",
    }
  );
}