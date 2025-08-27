import { Router  } from "express"; 
import { createOrganization, getOrganization, updateOrganization } from "../controllers/organization";
import { isLoggedIn } from "../middleware/auth";

const router = Router();

router.get("/get-organization", isLoggedIn, getOrganization)
router.post("/create-organization", isLoggedIn, createOrganization)
router.post("/update-organization/:orgId", isLoggedIn, updateOrganization)

export default router;