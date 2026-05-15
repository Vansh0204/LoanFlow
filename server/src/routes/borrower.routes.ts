import { Router } from 'express';
import { saveProfile, uploadSalarySlip, applyLoan, getMyLoan } from '../controllers/borrower.controller';
import { auth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// All borrower routes are protected and require the 'borrower' role
router.use(auth, requireRole('borrower'));

router.post('/profile', saveProfile);
router.post('/upload-salary-slip', upload.single('salarySlip'), uploadSalarySlip);
router.post('/apply', applyLoan);
router.get('/my-loan', getMyLoan);

export default router;
