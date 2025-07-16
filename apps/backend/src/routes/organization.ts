import { Router  } from "express"; 
import { createOrganization } from "../controllers/organization";
import { isLoggedIn } from "../middleware/auth";

const router = Router();

router.post("/create-organization", isLoggedIn, createOrganization)

export default router;