import { Router } from "express";
import {
  createCampaignController,
  deleteCampaignController,
  getCampaignController,
  listCampaignsController,
  updateCampaignController,
} from "../controllers/campaignController";
import { requireAuth } from "../middleware/authMiddleware";
import { requireWorkspaceAccess } from "../middleware/workspaceMiddleware";

const router = Router();

router.use(requireAuth);

router.post("/", requireWorkspaceAccess, createCampaignController);
router.get("/", requireWorkspaceAccess, listCampaignsController);
router.get("/:id", getCampaignController);
router.patch("/:id", updateCampaignController);
router.delete("/:id", deleteCampaignController);

export default router;