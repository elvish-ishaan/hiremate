import { Router } from "express";
import { createPortal, getPortalById, listPortals, updatePortalById, deletePortalById } from "../controllers/portal";
import { isLoggedIn } from "../middleware/auth";

const router = Router();

router.get("/:portalId", getPortalById)
router.post("/create-portal", isLoggedIn, createPortal)
router.get("/:orgId/list-portals", isLoggedIn, listPortals)
router.put("/:portalId", isLoggedIn, updatePortalById)
router.delete("/:portalId", isLoggedIn, deletePortalById)

export default router;
