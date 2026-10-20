# 🌸 GlowBook (ग्लोबुक)

> **Beautician's Order & Cash Book** — A simple, calm, and mobile-friendly web application designed for a beautician to easily manage customer bookings, appointments, daily income, and business expenses.

Built with special care for ease of use, featuring **English & Hindi (हिन्दी)** bilingual support, large readable text, gentle blush pink aesthetics, and single-tap actions.

---

## ✨ Key Features

### 1. 💰 Income & Expense Management
- **Quick Entry:** Add income or expenses with amount, date, category, and optional notes.
- **Tailored Categories:**
  - *Income:* Bridal Makeup (दुल्हन मेकअप), Party Makeup (पार्टी मेकअप), Hairstyling (हेयर स्टाइलिंग), Facial & Cleanup (फेशियल), Saree Draping (साड़ी ड्रेपिंग), Other Service.
  - *Expenses:* Cosmetics & Products (सामान), Travel & Transport (किराया), Equipment & Tools (उपकरण), Shop / Parlor Rent (किराया), Other Expense.
- **Date Filtering:** Instantly view totals for **Today**, **This Month**, **This Year**, **All Time**, or **Custom Date Ranges**.
- **Financial Totals:** Clean display of Total Income, Total Expenses, and Net Profit (Income minus Expenses).
- **Simple Visual Breakdown:** Dual-color split bar chart and category breakdown meters showing where money is coming from and going.
- **Edit & Delete:** Full control to edit or delete entries with a confirmation safeguard.
- **CSV Export:** Download full transaction records in Excel/Google Sheets friendly CSV format (with UTF-8 support for Hindi characters).

---

### 2. 📅 Customer Bookings & Appointments
- **Comprehensive Booking Details:**
  - Customer name & optional phone number.
  - Service or event type.
  - Appointment date & time.
  - Total price & advance amount received.
  - **Automatic Remaining Balance:** Real-time calculation (`Total Price - Advance Paid`).
  - Optional notes (e.g., bridal jewelry setting, venue address).
  - Status: **Upcoming** (आगामी), **Completed** (पूरा हुआ), or **Cancelled** (रद्द).
- **Upcoming Highlights:** Today and tomorrow bookings are highlighted with prominent badges so no client is ever missed.
- **1-Tap WhatsApp & Call:** Direct WhatsApp button opens chat with a pre-formatted appointment reminder; phone button initiates a call.
- **Record Balance Payment:** When the client pays the remaining balance, tap **"Record Payment"** to log the payment into income, update the balance to ₹0, and automatically complete the booking.
- **CSV Export:** Export all bookings and appointment schedules to CSV.

---

### 3. 🎯 Strict Accounting & Payment Rules
- **Cash Basis Accounting:** Income is counted **only when money is actually received**. Unpaid order balances are never counted as revenue until paid.
- **No Double-Counting:** Advance payments and final balance payments are recorded once into income records and linked to the booking.
- **Separation of Concerns:** Orders maintain customer and appointment details, while transactions track actual cash flow.

---

### 4. 🌐 Bilingual (English & Hindi)
- Toggle anytime with one tap between **English** and **हिन्दी** from the header.
- Every label, button, stat, category, status, and alert message translates seamlessly.

---

### 5. 🛡️ Dual-Mode: Neon PostgreSQL & Local Storage Fallback
- **Neon Cloud Database:** Full persistence using Neon serverless PostgreSQL when `DATABASE_URL` is configured.
- **Local Fallback Mode:** Works seamlessly even before configuring a database, saving safely in browser storage with an informative banner.

---

## 🛠️ Technology Stack
- **Framework:** Next.js (App Router) + React 19 + TypeScript
- **Styling:** Custom Vanilla CSS design system (soft blush pink, warm white, gentle rose, sage green for income, terracotta for expenses)
- **Database:** [Neon PostgreSQL](https://neon.tech) via `@neondatabase/serverless` (HTTP serverless driver)
- **Deployment:** [Vercel](https://vercel.com) (zero-configuration deployment)
- **Icons:** `lucide-react`

---

## 🚀 Getting Started Locally

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/malviyakarishma/glow-book.git
cd glow-book
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Open `.env.local` and add your Neon PostgreSQL database connection string:
```env
DATABASE_URL="postgresql://username:password@ep-cool-butterfly-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
```
*(Note: If you don't have a Neon database yet, you can still run the app in Local Storage Mode!)*

### 3. (Optional) Run Database Migration
If you provided `DATABASE_URL`, initialize the database tables:
```bash
npm run db:init
```
*(GlowBook also checks and creates the tables automatically on startup if they don't already exist!)*

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser (or on your phone connected to the same Wi-Fi).

---

## 🗄️ Database Schema (`schema.sql`)

```sql
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY,
  customer_name VARCHAR(200) NOT NULL,
  phone_number VARCHAR(50),
  service_type VARCHAR(150) NOT NULL,
  appointment_date VARCHAR(10) NOT NULL,
  appointment_time VARCHAR(20),
  total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
  advance_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (advance_amount >= 0),
  remaining_balance NUMERIC(10, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'Upcoming',
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(64) PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  category VARCHAR(100) NOT NULL,
  date VARCHAR(10) NOT NULL,
  note TEXT,
  order_id VARCHAR(64) REFERENCES orders(id) ON DELETE SET NULL,
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(appointment_date);
CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON transactions(order_id);
```

---

## ☁️ Deploying to Vercel

1. Push your repository to GitHub.
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your `glow-book` repository.
4. Under **Environment Variables**, add:
   - **Key:** `DATABASE_URL`
   - **Value:** *Your Neon PostgreSQL connection string* (from the [Neon Console](https://console.neon.tech))
5. Click **Deploy**.
6. Vercel will build and deploy your app in seconds with zero configuration!

---

## 🔒 Security & Privacy
- **Zero Client Leakage:** Database credentials and queries run exclusively inside Next.js Serverless API routes on the server side. The database connection string is never exposed to browser code.
- **Git Protection:** `.env*` files are strictly included in `.gitignore` to prevent credentials from ever being committed to Git.
- **No Login Hassle:** Single-user design tailored for one beautician without complicated login/signup friction.
