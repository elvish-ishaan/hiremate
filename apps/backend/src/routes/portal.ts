import { Router  } from "express"; 
import { createPortal, getPortalById, listPortals } from "../controllers/portal";
import { isLoggedIn } from "../middleware/auth";

const router = Router();

router.get("/:portalId", getPortalById)
router.post("/create-portal",isLoggedIn, createPortal)
router.get("/:orgId/list-portals",isLoggedIn, listPortals)

export default router;