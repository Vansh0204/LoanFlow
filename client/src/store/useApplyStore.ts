import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ApplyState {
  // Step 1
  personalDetails: {
    fullName: string;
    pan: string;
    dateOfBirth: string;
    monthlySalary: number;
    employmentMode: 'salaried' | 'self-employed' | 'unemployed';
  } | null;
  setPersonalDetails: (details: ApplyState['personalDetails']) => void;

  // Step 2
  documents: {
    salarySlipUrl: string;
    salarySlipOriginalName: string;
  } | null;
  setDocuments: (docs: ApplyState['documents']) => void;

  // Step 3
  loanConfig: {
    loanAmount: number;
    tenure: number;
  } | null;
  setLoanConfig: (config: ApplyState['loanConfig']) => void;

  reset: () => void;
}

export const useApplyStore = create<ApplyState>()(
  persist(
    (set) => ({
      personalDetails: null,
      setPersonalDetails: (details) => set({ personalDetails: details }),
      
      documents: null,
      setDocuments: (docs) => set({ documents: docs }),

      loanConfig: null,
      setLoanConfig: (config) => set({ loanConfig: config }),

      reset: () => set({ personalDetails: null, documents: null, loanConfig: null }),
    }),
    {
      name: 'lms-apply',
    }
  )
);
