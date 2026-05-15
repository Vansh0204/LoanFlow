import { IBorrowerProfile } from '../models/BorrowerProfile';

export const runBRE = (profile: Partial<IBorrowerProfile>): { status: 'passed' | 'failed'; reasons: string[] } => {
  const reasons: string[] = [];

  // Age calculation
  if (profile.dateOfBirth) {
    const ageDifMs = Date.now() - new Date(profile.dateOfBirth).getTime();
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    
    if (age < 23 || age > 50) {
      reasons.push('Applicant must be between 23 and 50 years old.');
    }
  } else {
    reasons.push('Date of birth is required.');
  }

  // PAN validation
  if (profile.pan) {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(profile.pan)) {
      reasons.push('Invalid PAN format.');
    }
  } else {
    reasons.push('PAN is required.');
  }

  // Employment mode
  if (profile.employmentMode === 'unemployed') {
    reasons.push('Applicant must be employed.');
  }

  // Minimum salary
  if (profile.monthlySalary !== undefined) {
    if (profile.monthlySalary < 25000) {
      reasons.push('Minimum monthly salary requirement is ₹25,000.');
    }
  } else {
    reasons.push('Monthly salary is required.');
  }

  return {
    status: reasons.length === 0 ? 'passed' : 'failed',
    reasons,
  };
};
