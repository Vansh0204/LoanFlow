import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware';
import { BorrowerProfile } from '../models/BorrowerProfile';
import { LoanApplication } from '../models/LoanApplication';
import { runBRE } from '../utils/bre';

export const saveProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { fullName, pan, dateOfBirth, monthlySalary, employmentMode } = req.body;

    const breResult = runBRE({
      dateOfBirth,
      pan: pan?.toUpperCase(),
      monthlySalary: Number(monthlySalary),
      employmentMode,
    });

    if (breResult.status === 'failed') {
      res.status(422).json({ passed: false, reasons: breResult.reasons });
      return;
    }

    const updateData: any = {
      fullName,
      pan: pan.toUpperCase(),
      dateOfBirth,
      monthlySalary: Number(monthlySalary),
      employmentMode,
      breStatus: 'passed',
      breRejectionReasons: [],
    };

    let profile = await BorrowerProfile.findOne({ userId });

    if (profile) {
      profile = await BorrowerProfile.findByIdAndUpdate(profile._id, updateData, { new: true });
    } else {
      profile = await BorrowerProfile.create({
        userId,
        ...updateData,
      } as any);
    }

    res.status(200).json({ passed: true, profileId: profile?._id });
  } catch (error) {
    console.error('Save profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const uploadSalarySlip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const userId = req.user!.id;
    const profile = await BorrowerProfile.findOne({ userId });

    if (!profile) {
      res.status(404).json({ message: 'Profile not found. Please complete step 1 first.' });
      return;
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    
    profile.salarySlipUrl = fileUrl;
    profile.salarySlipOriginalName = req.file.originalname;
    await profile.save();

    res.status(200).json({ fileUrl, fileName: req.file.originalname });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const applyLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { loanAmount, tenure } = req.body;

    const profile = await BorrowerProfile.findOne({ userId });
    if (!profile || profile.breStatus !== 'passed') {
      res.status(400).json({ message: 'You are not eligible to apply for a loan.' });
      return;
    }

    const existingApplication = await LoanApplication.findOne({ 
      borrowerId: userId,
      status: { $nin: ['rejected', 'closed'] }
    });

    if (existingApplication) {
      res.status(400).json({ message: 'You already have an active loan application.' });
      return;
    }

    const P = Number(loanAmount);
    const T = Number(tenure);
    const R = 12; // 12% p.a. fixed interest rate
    
    // Simple Interest Calculation based on days
    const SI = Math.round((P * R * T) / (365 * 100));
    const totalRepayment = P + SI;

    const loanApplication = await LoanApplication.create({
      borrowerId: new mongoose.Types.ObjectId(userId),
      borrowerProfile: profile._id,
      loanAmount: P,
      tenure: T,
      interestRate: R,
      simpleInterest: SI,
      totalRepayment,
      outstandingBalance: totalRepayment,
      status: 'applied',
    } as any);

    res.status(201).json(loanApplication);
  } catch (error: any) {
    console.error('Apply loan error details:', {
      message: error.message,
      stack: error.stack,
      errors: error.errors // Mongoose validation errors
    });
    res.status(500).json({ 
      message: 'Internal server error', 
      details: error.message 
    });
  }
};

export const getMyLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const application = await LoanApplication.findOne({ borrowerId: userId })
      .populate('borrowerProfile')
      .sort({ createdAt: -1 });

    res.status(200).json(application);
  } catch (error) {
    console.error('Get my loan error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
