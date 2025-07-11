import { Router  } from "express"; 
import { createPortal } from "../controllers/portal";

const router = Router();

router.post("/create-portal", createPortal)

export default router;