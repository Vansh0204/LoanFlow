import mongoose, { Schema, Document } from 'mongoose';

export interface IBorrowerProfile extends Document {
  userId: mongoose.Types.ObjectId;
  fullName: string;
  pan: string;
  dateOfBirth: Date;
  monthlySalary: number;
  employmentMode: 'salaried' | 'self-employed' | 'unemployed';
  salarySlipUrl?: string;
  salarySlipOriginalName?: string;
  breStatus: 'pending' | 'passed' | 'failed';
  breRejectionReasons: string[];
  createdAt: Date;
  updatedAt: Date;
}

const borrowerProfileSchema = new Schema<IBorrowerProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    pan: {
      type: String,
      required: true,
      uppercase: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    monthlySalary: {
      type: Number,
      required: true,
    },
    employmentMode: {
      type: String,
      enum: ['salaried', 'self-employed', 'unemployed'],
      required: true,
    },
    salarySlipUrl: {
      type: String,
    },
    salarySlipOriginalName: {
      type: String,
    },
    breStatus: {
      type: String,
      enum: ['pending', 'passed', 'failed'],
      default: 'pending',
    },
    breRejectionReasons: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const BorrowerProfile = mongoose.model<IBorrowerProfile>('BorrowerProfile', borrowerProfileSchema);
