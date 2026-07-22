// ─── Auth ────────────────────────────────────────────────────────────

export interface RequestOtpResponse {
  mockOtp: string;
}

export interface VerifyOtpResponse {
  token: string;
  user: User;
}

export interface AdminLoginResponse {
  accessToken: string;
  admin: AdminUser;
}

// ─── Users ───────────────────────────────────────────────────────────

export interface User {
  id: string;
  phone: string;
  name: string | null;
  createdAt: string;
}

// ─── Admin Users ─────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  login: string;
  role: 'admin' | 'operator';
}

// ─── Applications ────────────────────────────────────────────────────

export type ApplicantType = 'individual' | 'business';
export type ApplicationStatus = 'new' | 'in_progress' | 'approved' | 'rejected';

export interface Application {
  id: string;
  userId: string;
  applicantType: ApplicantType;
  amount: number;
  termDays: number;
  status: ApplicationStatus;
  comment: string | null;
  createdAt: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  companyName: string | null;
  registrationNumber: string | null;
  companyEmail: string | null;
  companyPhone: string | null;
}

export interface CreateApplicationDto {
  applicantType: ApplicantType;
  phone: string;
  amount: number;
  termDays: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  companyName?: string;
  registrationNumber?: string;
  companyEmail?: string;
  companyPhone?: string;
  fileAttachmentIds?: string[];
}

// ─── Loans ───────────────────────────────────────────────────────────

export type LoanStatus = 'pending_signature' | 'active' | 'closed';

export interface Loan {
  id: string;
  applicationId: string;
  userId: string;
  amount: number;
  dailyRate: number;
  termDays: number;
  status: LoanStatus;
  signedAt: string | null;
  signedIp: string | null;
  signedUserAgent: string | null;
  createdAt: string;
}

// ─── Payment Schedule ────────────────────────────────────────────────

export type ScheduleItemStatus = 'pending' | 'paid' | 'overdue';

export interface PaymentScheduleItem {
  id: string;
  loanId: string;
  dueDate: string;
  amount: number;
  status: ScheduleItemStatus;
}

// ─── Payment Requests ────────────────────────────────────────────────

export type PaymentRequestStatus = 'pending' | 'approved' | 'rejected';

export interface PaymentRequest {
  id: string;
  loanId: string;
  userId: string;
  amount: number;
  reference: string;
  status: PaymentRequestStatus;
  createdAt: string;
}

export interface CreatePaymentRequestDto {
  amount: number;
  reference: string;
}

// ─── Payments ────────────────────────────────────────────────────────

export interface Payment {
  id: string;
  loanId: string;
  paymentRequestId: string | null;
  amount: number;
  date: string;
  recordedByAdminId: string;
}

// ─── Notifications ───────────────────────────────────────────────────

export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// ─── File Attachments ────────────────────────────────────────────────

export type OwnerType = 'application' | 'contact_message' | 'upload';

export interface FileAttachment {
  id: string;
  ownerType: OwnerType;
  ownerId: string | null;
  s3Key: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

// ─── Contact Messages ────────────────────────────────────────────────

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  attachmentId: string | null;
  createdAt: string;
}

export interface CreateContactMessageDto {
  name: string;
  email: string;
  phone: string;
  message: string;
  attachmentId?: string;
}

// ─── Calculator ──────────────────────────────────────────────────────

export interface CalculatorEstimate {
  payment: number;
  total: number;
}

export interface CalculatorEstimateDto {
  amount: number;
  termDays: number;
}

// ─── Clients (admin) ─────────────────────────────────────────────────

export interface ClientSummary {
  id: string;
  phone: string;
  name: string | null;
  createdAt: string;
  applicationsCount: number;
  activeLoansCount: number;
  closedLoansCount: number;
  totalLoansAmount: number;
}

export interface ClientDetail extends ClientSummary {
  applications: Application[];
  loans: (Loan & {
    scheduleItems: PaymentScheduleItem[];
    payments: Payment[];
    application: Application;
  })[];
  paymentRequests: (PaymentRequest & { loan: Loan; payment: Payment | null })[];
  recentNotifications: Notification[];
}

// ─── Pagination / Query ──────────────────────────────────────────────

export interface ApplicationsQuery {
  search?: string;
  status?: ApplicationStatus;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface PaymentRequestsQuery {
  status?: PaymentRequestStatus;
}

export interface ClientsQuery {
  search?: string;
}
