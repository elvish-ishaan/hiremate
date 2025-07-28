
//get all the reports of the portal candidates
import express from "express";
import { getReports, getSessionDetails } from "../controllers/report";
import { isLoggedIn } from "../middleware/auth";
const router = express.Router();

router.get("/portalReport/:portalId",getReports )
router.get('/session/:sessionId',getSessionDetails)



export default router;