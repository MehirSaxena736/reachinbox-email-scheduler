import { Router } from "express";
import {
  createContactController,
  deleteContactController,
  getContactController,
  listContactsController,
  updateContactController,
} from "../controllers/contactController";
import { requireAuth } from "../middleware/authMiddleware";
import {
  requireContactAccess,
  requireWorkspaceAccess,
} from "../middleware/workspaceMiddleware";

const router = Router();

router.use(requireAuth);

router.post("/", requireWorkspaceAccess, createContactController);
router.get("/", requireWorkspaceAccess, listContactsController);
router.get("/:id", requireContactAccess, getContactController);
router.patch("/:id", requireContactAccess, updateContactController);
router.delete("/:id", requireContactAccess, deleteContactController);

export default router;