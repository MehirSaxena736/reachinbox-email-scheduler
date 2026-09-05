import { WorkspaceMemberRole } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";

interface CreateWorkspaceInput {
  name: string;
  ownerId: string;
}

interface UpdateWorkspaceInput {
  name?: string;
}

export async function createWorkspace(
  input: CreateWorkspaceInput
) {
  const owner = await prisma.user.findUnique({
    where: {
      id: input.ownerId,
    },
  });

  if (!owner) {
    throw new AppError(404, "User not found", {
      code: "USER_NOT_FOUND",
    });
  }

  const workspace = await prisma.workspace.create({
    data: {
      name: input.name.trim(),
      ownerId: input.ownerId,
      members: {
        create: {
          userId: input.ownerId,
          role: WorkspaceMemberRole.OWNER,
        },
      },
    },
    include: {
      members: true,
    },
  });

  return workspace;
}

export async function listUserWorkspaces(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError(404, "User not found", {
      code: "USER_NOT_FOUND",
    });
  }

  return prisma.workspace.findMany({
    where: {
      OR: [
        {
          ownerId: userId,
        },
        {
          members: {
            some: {
              userId,
            },
          },
        },
      ],
    },
    include: {
      members: true,
      emailAccounts: {
        select: {
          id: true,
          email: true,
          displayName: true,
          provider: true,
          status: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getWorkspaceById(
  workspaceId: string,
  userId: string
) {
  const workspace = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
      OR: [
        {
          ownerId: userId,
        },
        {
          members: {
            some: {
              userId,
            },
          },
        },
      ],
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      },
      emailAccounts: {
        select: {
          id: true,
          email: true,
          displayName: true,
          provider: true,
          status: true,
        },
      },
    },
  });

  if (!workspace) {
    throw new AppError(404, "Workspace not found", {
      code: "WORKSPACE_NOT_FOUND",
    });
  }

  return workspace;
}

export async function updateWorkspace(
  workspaceId: string,
  userId: string,
  input: UpdateWorkspaceInput
) {
  const workspace = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
      ownerId: userId,
    },
  });

  if (!workspace) {
    throw new AppError(
      404,
      "Workspace not found or you are not the owner",
      {
        code: "WORKSPACE_NOT_FOUND",
      }
    );
  }

  return prisma.workspace.update({
    where: {
      id: workspaceId,
    },
    data: {
      name: input.name?.trim(),
    },
  });
}

export async function deleteWorkspace(
  workspaceId: string,
  userId: string
) {
  const workspace = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
      ownerId: userId,
    },
  });

  if (!workspace) {
    throw new AppError(
      404,
      "Workspace not found or you are not the owner",
      {
        code: "WORKSPACE_NOT_FOUND",
      }
    );
  }

  await prisma.workspace.delete({
    where: {
      id: workspaceId,
    },
  });
}