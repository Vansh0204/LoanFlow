import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { User } from '../models/User';
import { LoanApplication } from '../models/LoanApplication';
import { BorrowerProfile } from '../models/BorrowerProfile';
import { Payment } from '../models/Payment';
import mongoose from 'mongoose';

// Sales Module
export const getSalesLeads = async (req: AuthRequest, res: Response) => {
  try {
    const borrowers = await User.find({ role: 'borrower' }).select('email createdAt');
    const loanBorrowerIds = await LoanApplication.distinct('borrowerId');
    
    const leads = borrowers.filter(b => !loanBorrowerIds.some(id => id.toString() === b._id.toString()));
    
    res.status(200).json(leads);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sales leads' });
  }
};

// Sanction Module
export const getSanctionApplications = async (req: AuthRequest, res: Response) => {
  try {
    const applications = await LoanApplication.find({ status: 'applied' })
      .populate('borrowerProfile')
      .sort({ createdAt: -1 });
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sanction applications' });
  }
};

export const updateSanctionStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { loanId } = req.params;
    const { action, rejectionReason } = req.body;

    const status = action === 'approve' ? 'sanctioned' : 'rejected';
    const updateData: any = { status };

    if (action === 'approve') {
      updateData.sanctionedBy = req.user!.id;
      updateData.sanctionedAt = new Date();
    } else {
      updateData.rejectionReason = rejectionReason;
    }

    const loan = await LoanApplication.findByIdAndUpdate(loanId, updateData, { new: true });
    res.status(200).json(loan);
  } catch (error) {
    res.status(500).json({ message: 'Error updating sanction status' });
  }
};

// Disbursement Module
export const getDisbursementLoans = async (req: AuthRequest, res: Response) => {
  try {
    const loans = await LoanApplication.find({ status: 'sanctioned' })
      .populate('borrowerId', 'email')
      .populate('borrowerProfile', 'fullName');
    res.status(200).json(loans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching disbursement loans' });
  }
};

export const disburseLoan = async (req: AuthRequest, res: Response) => {
  try {
    const { loanId } = req.params;
    const loan = await LoanApplication.findById(loanId);
    
    if (!loan) return res.status(404).json({ message: 'Loan not found' });

    (loan as any).status = 'disbursed';
    loan.disbursedBy = new mongoose.Types.ObjectId(req.user!.id);
    loan.disbursedAt = new Date();
    loan.outstandingBalance = loan.totalRepayment;
    
    await loan.save();
    res.status(200).json(loan);
  } catch (error) {
    res.status(500).json({ message: 'Error disbursing loan' });
  }
};

// Collection Module
export const getCollectionLoans = async (req: AuthRequest, res: Response) => {
  try {
    const loans = await LoanApplication.find({ status: { $in: ['disbursed', 'active'] } })
      .populate('borrowerId', 'email')
      .populate('borrowerProfile', 'fullName');
    res.status(200).json(loans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching collection loans' });
  }
};

export const recordPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { loanId } = req.params;
    const { utrNumber, amount, paymentDate } = req.body;

    const loan = await LoanApplication.findById(loanId);
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    if (amount <= 0 || amount > loan.outstandingBalance) {
      return res.status(400).json({ message: 'Invalid payment amount' });
    }

    const existingPayment = await Payment.findOne({ utrNumber });
    if (existingPayment) {
      return res.status(400).json({ message: 'UTR Number must be unique' });
    }

    const payment = await Payment.create({
      loanId: loanId as any,
      borrowerId: loan.borrowerId as any,
      utrNumber,
      amount,
      paymentDate,
      recordedBy: req.user!.id as any
    });

    loan.totalAmountPaid += amount;
    loan.outstandingBalance -= amount;
    (loan as any).status = loan.outstandingBalance <= 0 ? 'closed' : 'active';
    
    await loan.save();
    
    res.status(201).json(payment);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error recording payment' });
  }
};

export const getLoanPayments = async (req: AuthRequest, res: Response) => {
  try {
    const { loanId } = req.params;
    const payments = await Payment.find({ loanId }).sort({ paymentDate: -1 });
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payments' });
  }
};

// Admin Overview
export const getAdminStats = async (req: AuthRequest, res: Response) => {
  try {
    const [totalLeads, pendingApps, activeLoans, closedThisMonth] = await Promise.all([
      // Leads: borrowers without loan applications
      (async () => {
        const borrowers = await User.countDocuments({ role: 'borrower' });
        const withApps = await LoanApplication.distinct('borrowerId');
        return Math.max(0, borrowers - withApps.length);
      })(),
      // Pending: Everything from applied to sanctioned (needs action)
      LoanApplication.countDocuments({ status: { $in: ['applied', 'sanctioned'] } }),
      // Active: Funded loans
      LoanApplication.countDocuments({ status: { $in: ['disbursed', 'active'] } }),
      // Closed: Fully repaid
      LoanApplication.countDocuments({ 
        status: 'closed',
        updatedAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
      })
    ]);

    res.status(200).json({ totalLeads, pendingApps, activeLoans, closedThisMonth });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin stats' });
  }
};
