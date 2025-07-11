import { Router  } from "express"; 
import { createOrganization } from "../controllers/organization";

const router = Router();

router.post("/create-organization", createOrganization)

export default router;