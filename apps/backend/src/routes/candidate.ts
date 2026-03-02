import { Router } from 'express'
import multer from 'multer'
import { applyToPortal, getCandidateByToken, getCandidatesByPortal } from '../controllers/candidate'
import { isLoggedIn } from '../middleware/auth'

const router = Router()
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (_req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true)
        } else {
            cb(new Error('Only PDF files are allowed'))
        }
    },
})

router.post('/:portalId/apply', upload.single('resume'), applyToPortal)
router.get('/token/:token', getCandidateByToken)
router.get('/:portalId/candidates', isLoggedIn, getCandidatesByPortal)

export default router
