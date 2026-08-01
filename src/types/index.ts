export type UserRole = "CANDIDATE" | "RECRUITER" | "ADMIN";
export type JobStatus = "PENDING" | "APPROVED" | "REJECTED" | "CLOSED";
export type ApplicationStatus = "APPLIED" | "SCREENING" | "SHORTLISTED" | "INTERVIEW" | "OFFERED" | "REJECTED" | "HIRED";
export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Candidate {
  id: string;
  userId: string;
  headline?: string;
  summary?: string;
  location?: string;
  experience?: number;
  currentSalary?: number;
  expectedSalary?: number;
  noticePeriod?: number;
  profileScore: number;
  isOpenToWork: boolean;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  user?: User;
}

export interface Recruiter {
  id: string;
  userId: string;
  companyId?: string;
  designation?: string;
  isVerified: boolean;
  user?: User;
  company?: Company;
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  website?: string;
  industry?: string;
  size?: string;
  description?: string;
  headquarters?: string;
  foundedYear?: number;
  isVerified: boolean;
}

export interface Job {
  id: string;
  recruiterId: string;
  companyId?: string;
  title: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  skills: string[];
  category?: string;
  jobType: string;
  workMode: string;
  location?: string;
  minSalary?: number;
  maxSalary?: number;
  currency: string;
  experience?: string;
  education?: string;
  status: JobStatus;
  openings: number;
  deadline?: Date;
  views: number;
  createdAt: Date;
  company?: Company;
  recruiter?: Recruiter;
  _count?: { applications: number };
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  resumeId?: string;
  coverLetter?: string;
  status: ApplicationStatus;
  stage: string;
  aiScore?: number;
  aiNotes?: string;
  recruiterNotes?: string;
  appliedAt: Date;
  job?: Job;
  candidate?: Candidate;
}

export interface Resume {
  id: string;
  candidateId: string;
  title: string;
  fileUrl?: string;
  fileType?: string;
  isAIGenerated: boolean;
  content?: Record<string, unknown>;
  isPrimary: boolean;
  createdAt: Date;
}

export interface Skill {
  id: string;
  name: string;
  category?: string;
}

export interface Assessment {
  id: string;
  title: string;
  category: string;
  description?: string;
  questions: AssessmentQuestion[];
  duration: number;
  passingScore: number;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface JobAlert {
  id: string;
  candidateId: string;
  keywords: string[];
  location?: string;
  jobType?: string;
  minSalary?: number;
  frequency: string;
  isActive: boolean;
  createdAt: Date;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: string;
  category?: string;
  adminNotes?: string;
  createdAt: Date;
  user?: User;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  plan: string;
  status: PaymentStatus;
  transactionId?: string;
  paymentMethod?: string;
  description?: string;
  paidAt?: Date;
  createdAt: Date;
}

export interface CandidateRating {
  id: string;
  candidateId: string;
  recruiterId: string;
  jobId?: string;
  rating: number;
  notes?: string;
  tags: string[];
  createdAt: Date;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
}
