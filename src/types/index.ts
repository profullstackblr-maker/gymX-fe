export type PackageType = '1_month' | '2_months' | '3_months' | '6_months' | '1_year';

export interface Member {
  _id: string;
  name: string;
  phone: string;
  email: string;
  joiningDate: string;
  packageType: PackageType;
  packageDurationDays: number;
  expiryDate: string;
  joiningTime: string;
  amount: number;
  notes: string;
  remainingDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface MemberFormData {
  name: string;
  phone: string;
  email: string;
  joiningDate: string;
  packageType: PackageType | '';
  joiningTime: string;
  amount: string;
  notes: string;
}

export interface AnalyticsPeriod {
  count: number;
  revenue: number;
}

export interface DailyAnalytics extends AnalyticsPeriod {
  date: string;
}

export interface MonthlyAnalytics extends AnalyticsPeriod {
  month: string;
  key: string;
}

export interface YearlyAnalytics extends AnalyticsPeriod {
  year: string;
}

export interface Analytics {
  daily: DailyAnalytics[];
  monthly: MonthlyAnalytics[];
  yearly: YearlyAnalytics[];
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  admin: Admin;
}

export interface Stats {
  total: number;
  active: number;
  expired: number;
  expiringSoon: number;
}

export type MemberStatus = 'active' | 'expired' | 'expiring_soon';

export const PACKAGE_LABELS: Record<PackageType, string> = {
  '1_month': '1 Month',
  '2_months': '2 Months',
  '3_months': '3 Months',
  '6_months': '6 Months',
  '1_year': '1 Year',
};

export const PACKAGE_FEES: Record<PackageType, number> = {
  '1_month': 800,
  '2_months': 1500,
  '3_months': 2200,
  '6_months': 4000,
  '1_year': 7000,
};

export const PACKAGE_OPTIONS: { value: PackageType; label: string; days: number }[] = [
  { value: '1_month', label: '1 Month (30 days)', days: 30 },
  { value: '2_months', label: '2 Months (60 days)', days: 60 },
  { value: '3_months', label: '3 Months (90 days)', days: 90 },
  { value: '6_months', label: '6 Months (180 days)', days: 180 },
  { value: '1_year', label: '1 Year (365 days)', days: 365 },
];

export const JOINING_TIME_OPTIONS = [
  { value: 'morning', label: 'Morning (6 AM - 12 PM)' },
  { value: 'evening', label: 'Evening (4 PM - 9 PM)' },
  { value: '05:00 AM', label: '5:00 AM' },
  { value: '06:00 AM', label: '6:00 AM' },
  { value: '07:00 AM', label: '7:00 AM' },
  { value: '08:00 AM', label: '8:00 AM' },
  { value: '09:00 AM', label: '9:00 AM' },
  { value: '10:00 AM', label: '10:00 AM' },
  { value: '04:00 PM', label: '4:00 PM' },
  { value: '05:00 PM', label: '5:00 PM' },
  { value: '06:00 PM', label: '6:00 PM' },
  { value: '07:00 PM', label: '7:00 PM' },
  { value: '08:00 PM', label: '8:00 PM' },
];
