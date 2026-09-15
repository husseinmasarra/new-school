/**
 * Neon PostgreSQL Serverless Database Integration & Schema Service
 * 
 * Neon (https://neon.tech) is a fully managed serverless PostgreSQL platform.
 */

export const NEON_POSTGRES_SCHEMA_SQL = `-- ============================================================
-- 🐘 NEON POSTGRESQL PRODUCTION SCHEMA FOR SCHOOL PORTAL
-- Copy & Run this SQL script in your Neon SQL Editor:
-- ============================================================

-- 1. School Settings Table
CREATE TABLE IF NOT EXISTS school_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'main',
    school_name VARCHAR(255) DEFAULT 'مدرسة الدعم التعليمي',
    school_name_en VARCHAR(255) DEFAULT 'Educational Support School',
    academic_year VARCHAR(50) DEFAULT '2026/2027',
    exchange_rate NUMERIC(12,2) DEFAULT 89500.00,
    phone VARCHAR(50) DEFAULT '+961 01 888 999',
    email VARCHAR(100) DEFAULT 'info@school.edu.lb',
    address TEXT DEFAULT 'بيروت - لبنان',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Students Table
CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    username VARCHAR(100) UNIQUE,
    password VARCHAR(100),
    grade VARCHAR(100),
    grade_en VARCHAR(100),
    classroom VARCHAR(50),
    avatar TEXT,
    tuition_total NUMERIC(12,2) DEFAULT 1600.00,
    tuition_paid NUMERIC(12,2) DEFAULT 0.00,
    parent_name VARCHAR(255),
    parent_name_en VARCHAR(255),
    parent_phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Teachers Table
CREATE TABLE IF NOT EXISTS teachers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    username VARCHAR(100) UNIQUE,
    password VARCHAR(100),
    subject VARCHAR(100),
    subjects TEXT[],
    monthly_salary NUMERIC(12,2) DEFAULT 1200.00,
    due_bonus NUMERIC(12,2) DEFAULT 0.00,
    avatar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Staff Employees Table
CREATE TABLE IF NOT EXISTS staff_employees (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    job_title VARCHAR(150),
    department VARCHAR(150),
    monthly_salary NUMERIC(12,2) DEFAULT 800.00,
    phone VARCHAR(50),
    avatar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tuition Payments & Receipts Table
CREATE TABLE IF NOT EXISTS tuition_payments (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) REFERENCES students(id) ON DELETE CASCADE,
    receipt_no VARCHAR(100) NOT NULL,
    amount_usd NUMERIC(12,2) NOT NULL,
    amount_lbp NUMERIC(15,2),
    payment_method VARCHAR(50) DEFAULT 'fresh_cash',
    payment_date DATE DEFAULT CURRENT_DATE,
    description TEXT,
    remaining_balance_usd NUMERIC(12,2)
);

-- 6. Employee Advances (السلف المادية) Table
CREATE TABLE IF NOT EXISTS employee_advances (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL,
    amount_usd NUMERIC(12,2) NOT NULL,
    advance_date DATE DEFAULT CURRENT_DATE,
    reason TEXT,
    is_deducted BOOLEAN DEFAULT FALSE,
    deducted_date DATE
);

-- 7. Agenda & Homework Items Table
CREATE TABLE IF NOT EXISTS agenda_items (
    id VARCHAR(50) PRIMARY KEY,
    subject VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    details TEXT,
    activity_type VARCHAR(50) DEFAULT 'homework',
    grade VARCHAR(100),
    classroom VARCHAR(50),
    exam_duration INT,
    total_score INT,
    due_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. System Users & Roles Matrix Table
CREATE TABLE IF NOT EXISTS system_users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    role_title VARCHAR(150),
    phone VARCHAR(50),
    avatar TEXT,
    permissions TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    category VARCHAR(100),
    expense_date DATE DEFAULT CURRENT_DATE
);

-- Create Indexing for Fast Query Performance
CREATE INDEX IF NOT EXISTS idx_students_grade ON students(grade);
CREATE INDEX IF NOT EXISTS idx_tuition_student ON tuition_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_advances_employee ON employee_advances(employee_id);
`;

/**
 * Get current Neon Connection URL from Settings or localStorage
 */
export function getNeonConnectionUrl() {
  return localStorage.getItem('neon_database_url') || 'postgresql://neondb_owner:npg_dMHDq2Ae1FXR@ep-billowing-recipe-awh6dwin.c-12.us-east-1.aws.neon.tech/neondb?sslmode=require';
}

/**
 * Save Neon Connection URL
 */
export function saveNeonConnectionUrl(url) {
  if (url) {
    localStorage.setItem('neon_database_url', url.trim());
  } else {
    localStorage.removeItem('neon_database_url');
  }
}

/**
 * Validate Neon connection string format
 */
export function isValidNeonUrl(url) {
  if (!url) return false;
  return url.startsWith('postgres://') || url.startsWith('postgresql://');
}
