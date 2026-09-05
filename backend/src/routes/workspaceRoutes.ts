import { Router } from "express";
import {
  createWorkspaceController,
  deleteWorkspaceController,
  getWorkspaceController,
  listWorkspacesController,
  updateWorkspaceController,
} from "../controllers/workspaceController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.use(requireAuth);

router.post("/", createWorkspaceController);
router.get("/", listWorkspacesController);
router.get("/:id", getWorkspaceController);
router.patch("/:id", updateWorkspaceController);
router.delete("/:id", deleteWorkspaceController);

export default router;