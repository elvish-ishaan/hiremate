import { Router } from "express";
import { createOrganization, getOrganization, updateOrganization } from "../controllers/organization";
import { isLoggedIn } from "../middleware/auth";
import multer from "multer";

const router = Router();

const logoUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true)
        } else {
            cb(new Error('Only image files are allowed'))
        }
    },
})

router.get("/get-organization", isLoggedIn, getOrganization)
router.post("/create-organization", isLoggedIn, logoUpload.single('logo'), createOrganization)
router.post("/update-organization/:orgId", isLoggedIn, logoUpload.single('logo'), updateOrganization)

export default router;
