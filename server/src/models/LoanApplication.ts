import mongoose, { Schema, Document } from 'mongoose';

export interface ILoanApplication extends Document {
  borrowerId: mongoose.Types.ObjectId;
  borrowerProfile: mongoose.Types.ObjectId;
  loanAmount: number;
  tenure: number;
  interestRate: number;
  simpleInterest: number;
  totalRepayment: number;
  status: 'applied' | 'sanctioned' | 'rejected' | 'disbursed' | 'active' | 'closed';
  rejectionReason?: string;
  sanctionedBy?: mongoose.Types.ObjectId;
  sanctionedAt?: Date;
  disbursedBy?: mongoose.Types.ObjectId;
  disbursedAt?: Date;
  totalAmountPaid: number;
  outstandingBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

const loanApplicationSchema = new Schema<ILoanApplication>(
  {
    borrowerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    borrowerProfile: {
      type: Schema.Types.ObjectId,
      ref: 'BorrowerProfile',
      required: true,
    },
    loanAmount: {
      type: Number,
      required: true,
      min: 50000,
      max: 500000,
    },
    tenure: {
      type: Number,
      required: true,
      min: 30,
      max: 365,
    },
    interestRate: {
      type: Number,
      default: 12, // Fixed at 12%
    },
    simpleInterest: {
      type: Number,
      default: 0,
    },
    totalRepayment: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['applied', 'sanctioned', 'rejected', 'disbursed', 'active', 'closed'],
      default: 'applied',
    },
    rejectionReason: {
      type: String,
    },
    sanctionedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    sanctionedAt: {
      type: Date,
    },
    disbursedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    disbursedAt: {
      type: Date,
    },
    totalAmountPaid: {
      type: Number,
      default: 0,
    },
    outstandingBalance: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save to compute totalRepayment, outstandingBalance, etc. if not explicitly set
loanApplicationSchema.pre('save', function (this: ILoanApplication) {
  if (this.isNew || this.isModified('loanAmount') || this.isModified('tenure')) {
    const principal = this.loanAmount || 0;
    const rate = this.interestRate || 12;
    const tenure = this.tenure || 0;
    
    if (principal > 0 && tenure > 0) {
      const timeInYears = tenure / 365;
      this.simpleInterest = Math.round((principal * rate * timeInYears) / 100);
      this.totalRepayment = principal + this.simpleInterest;
      
      if (this.isNew) {
        this.outstandingBalance = this.totalRepayment;
      }
    }
  }
});

export const LoanApplication = mongoose.model<ILoanApplication>('LoanApplication', loanApplicationSchema);
