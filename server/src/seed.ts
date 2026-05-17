import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms';

// Define schema inline to avoid import issues during seeding
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

const seedUsers = [
  { email: 'admin@lms.com', role: 'admin', password: 'Admin@123' },
  { email: 'sales@lms.com', role: 'sales', password: 'Sales@123' },
  { email: 'sanction@lms.com', role: 'sanction', password: 'Sanction@123' },
  { email: 'disbursement@lms.com', role: 'disbursement', password: 'Disbursement@123' },
  { email: 'collection@lms.com', role: 'collection', password: 'Collection@123' },
  { email: 'borrower@lms.com', role: 'borrower', password: 'Borrower@123' },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    console.log('Cleared existing users');

    // Also clear all other collections for a clean reset
    await mongoose.connection.db?.collection('borrowerprofiles').deleteMany({});
    console.log('Cleared existing borrower profiles');

    await mongoose.connection.db?.collection('loanapplications').deleteMany({});
    console.log('Cleared existing loan applications');

    await mongoose.connection.db?.collection('payments').deleteMany({});
    console.log('Cleared existing payments');

    for (const u of seedUsers) {
      const hashedPassword = await bcrypt.hash(u.password, 10);
      await User.create({
        email: u.email,
        password: hashedPassword,
        role: u.role,
      });
      console.log(`Created user: ${u.email} with role: ${u.role}`);
    }

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();
