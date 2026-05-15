# LoanFlow — Loan Management System

LoanFlow is a full-stack Loan Management System (LMS) built with the MERN stack (MongoDB, Express, React, Node.js) and Next.js 14. It features a complete borrower onboarding flow with an automated Business Rule Engine (BRE) and a specialized Operations Dashboard for internal executives.

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide React, Zustand, React Hook Form, Zod.
- **Backend**: Node.js, Express.js, TypeScript, Mongoose.
- **Database**: MongoDB.
- **Auth**: JWT, Bcrypt, Role-Based Access Control (RBAC).
- **File Storage**: Multer (Local storage for salary slips).

## 📋 Prerequisites

- Node.js 18+
- MongoDB (Local instance or Atlas connection string)
- npm or yarn

## 🛠 Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/loanflow.git
cd loanflow
```

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lms
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```
Create a `.env.local` file in the `client` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Seed the Database
Initialize the system with default roles and accounts:
```bash
cd ../server
npm run seed
```

### 5. Run the Application

**Terminal 1 (Server):**
```bash
cd server
npm run dev
```

**Terminal 2 (Client):**
```bash
cd client
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🔐 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@lms.com | Admin@123 |
| **Sales** | sales@lms.com | Sales@123 |
| **Sanction** | sanction@lms.com | Sanction@123 |
| **Disbursement** | disbursement@lms.com | Disbursement@123 |
| **Collection** | collection@lms.com | Collection@123 |
| **Borrower** | borrower@lms.com | Borrower@123 |

## 🔄 Complete Workflow

1. **Borrower Portal**:
   - Register/Login as a borrower.
   - Enter personal details (Age 23-50, Income > ₹25k, Valid PAN).
   - The **BRE** validates eligibility instantly.
   - Upload a salary slip (PDF/JPG/PNG).
   - Configure loan amount (₹50k - ₹5L) and tenure.
2. **Operations Dashboard**:
   - **Sales**: View registered users who haven't applied yet.
   - **Sanction**: Sanctioning officers review applications, verify documents, and approve/reject.
   - **Disbursement**: Finance team marks sanctioned loans as disbursed.
   - **Collection**: Agents record payments, track outstanding balances, and close loans automatically when paid in full.

## ⚖️ Business Rules (BRE)
- **Age**: 23 to 50 years.
- **Monthly Salary**: Minimum ₹25,000.
- **Employment**: Must be Salaried or Self-Employed.
- **PAN**: Must match standard Indian PAN format.
- **Loan SI**: Calculated as $(P \times 12 \times T) / (365 \times 100)$.
