import { apiRequest } from "./client";

export interface Workspace {
  id: string;
  name: string;
  slug?: string;
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface WorkspaceListResponse {
  success: boolean;
  data: Workspace[];
}

interface WorkspaceResponse {
  success: boolean;
  data: Workspace;
}

export async function getWorkspaces(): Promise<Workspace[]> {
  const response =
    await apiRequest<WorkspaceListResponse>("/api/workspaces");

  return response.data;
}

export async function getWorkspace(
  workspaceId: string
): Promise<Workspace> {
  const response =
    await apiRequest<WorkspaceResponse>(
      `/api/workspaces/${workspaceId}`
    );

  return response.data;
}

export async function createWorkspace(
  name: string
): Promise<Workspace> {
  const response =
    await apiRequest<WorkspaceResponse>("/api/workspaces", {
      method: "POST",
      body: JSON.stringify({ name }),
    });

  return response.data;
}

export async function updateWorkspace(
  workspaceId: string,
  name: string
): Promise<Workspace> {
  const response =
    await apiRequest<WorkspaceResponse>(
      `/api/workspaces/${workspaceId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ name }),
      }
    );

  return response.data;
}

export async function deleteWorkspace(
  workspaceId: string
): Promise<void> {
  await apiRequest(
    `/api/workspaces/${workspaceId}`,
    {
      method: "DELETE",
    }
  );
}