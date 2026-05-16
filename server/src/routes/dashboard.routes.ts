import { Router } from 'express';
import { 
  getSalesLeads, 
  getSanctionApplications, 
  updateSanctionStatus, 
  getDisbursementLoans, 
  disburseLoan, 
  getCollectionLoans, 
  recordPayment, 
  getLoanPayments, 
  getAdminStats 
} from '../controllers/dashboard.controller';
import { auth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';

const router = Router();

// Sales
router.get('/sales', auth, requireRole('admin', 'sales'), getSalesLeads);

// Sanction
router.get('/sanction', auth, requireRole('admin', 'sanction'), getSanctionApplications);
router.put('/sanction/:loanId', auth, requireRole('admin', 'sanction'), updateSanctionStatus);

// Disbursement
router.get('/disbursement', auth, requireRole('admin', 'disbursement'), getDisbursementLoans);
router.put('/disbursement/:loanId', auth, requireRole('admin', 'disbursement'), disburseLoan);

// Collection
router.get('/collection', auth, requireRole('admin', 'collection'), getCollectionLoans);
router.get('/collection/:loanId/payments', auth, requireRole('admin', 'collection'), getLoanPayments);
router.post('/collection/:loanId/payment', auth, requireRole('admin', 'collection'), recordPayment);

// Stats (Overview)
router.get('/stats', auth, requireRole('admin', 'sales', 'sanction', 'disbursement', 'collection'), getAdminStats);

export default router;
