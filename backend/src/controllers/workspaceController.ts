import { Request, Response } from "express";
import {
  createWorkspace,
  deleteWorkspace,
  getWorkspaceById,
  listUserWorkspaces,
  updateWorkspace,
} from "../services/workspaceService";
import { asyncHandler } from "../utils/asyncHandler";
import {
  assertAtLeastOneField,
  assertNonEmptyString,
} from "../utils/validation";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

function getUserId(req: Request): string {
  const authReq = req as AuthenticatedRequest;

  if (!authReq.user?.userId) {
    throw new Error("Authenticated user not found");
  }

  return authReq.user.userId;
}

export const createWorkspaceController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;

    assertNonEmptyString(body.name, "name");

    const workspace = await createWorkspace({
      name: body.name,
      ownerId: getUserId(req),
    });

    res.status(201).json({
      success: true,
      data: workspace,
    });
  }
);

export const listWorkspacesController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaces = await listUserWorkspaces(
      getUserId(req)
    );

    res.json({
      success: true,
      data: workspaces,
    });
  }
);

export const getWorkspaceController = asyncHandler(
  async (req: Request, res: Response) => {
    assertNonEmptyString(req.params.id, "id");

    const workspace = await getWorkspaceById(
      req.params.id,
      getUserId(req)
    );

    res.json({
      success: true,
      data: workspace,
    });
  }
);

export const updateWorkspaceController = asyncHandler(
  async (req: Request, res: Response) => {
    assertNonEmptyString(req.params.id, "id");

    const body = req.body as Record<string, unknown>;

    assertAtLeastOneField(body, ["name"]);

    if (body.name !== undefined) {
      assertNonEmptyString(body.name, "name");
    }

    const workspace = await updateWorkspace(
      req.params.id,
      getUserId(req),
      {
        name:
          typeof body.name === "string"
            ? body.name
            : undefined,
      }
    );

    res.json({
      success: true,
      data: workspace,
    });
  }
);

export const deleteWorkspaceController = asyncHandler(
  async (req: Request, res: Response) => {
    assertNonEmptyString(req.params.id, "id");

    await deleteWorkspace(
      req.params.id,
      getUserId(req)
    );

    res.json({
      success: true,
      message: "Workspace deleted successfully",
    });
  }
);