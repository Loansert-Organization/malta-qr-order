// Core user types
export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  firm?: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'AuditPartner' | 'EngagementManager' | 'AuditSenior' | 'ClientFinance';

// Engagement types
export interface Engagement {
  id: string;
  name: string;
  clientId: string;
  yearEnd: Date;
  partnerUid: string;
  managerUid?: string;
  status: EngagementStatus;
  materiality?: number;
  riskAssessment?: RiskLevel;
  createdAt: Date;
  updatedAt: Date;
}

export type EngagementStatus = 'planning' | 'fieldwork' | 'review' | 'completed' | 'archived';
export type RiskLevel = 'low' | 'medium' | 'high';

// Task and procedure types
export interface Task {
  id: string;
  engagementId: string;
  phase: AuditPhase;
  title: string;
  description?: string;
  assigneeUid?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: Date;
  procedureSteps: string[];
  aiStatus?: AIStatus;
  attachments: string[];
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export type AuditPhase = 'planning' | 'fieldwork' | 'completion' | 'reporting';
export type TaskStatus = 'todo' | 'in-progress' | 'waiting-ai' | 'review' | 'done';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type AIStatus = 'pending' | 'processing' | 'completed' | 'failed';

// Risk assessment types
export interface Risk {
  id: string;
  engagementId: string;
  area: string;
  description: string;
  likelihood: number; // 1-5 scale
  impact: number; // 1-5 scale
  severity: RiskLevel;
  controls: string[];
  mitigationPlan?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Evidence and file types
export interface EvidenceFile {
  id: string;
  engagementId: string;
  taskId?: string;
  fileName: string;
  gcsPath: string;
  hash: string;
  fileType: string;
  fileSize: number;
  extractedJson?: any;
  summary?: string;
  uploadedBy: string;
  uploadedAt: Date;
}

// Sampling types
export interface Sample {
  id: string;
  engagementId: string;
  taskId: string;
  population: number;
  method: SamplingMethod;
  sampleSize: number;
  items: SampleItem[];
  createdAt: Date;
}

export type SamplingMethod = 'monetary-unit' | 'random' | 'systematic' | 'judgmental';

export interface SampleItem {
  id: string;
  amount?: number;
  description: string;
  tested: boolean;
  exception?: string;
}

// Comment and collaboration types
export interface Comment {
  id: string;
  targetId: string; // taskId, engagementId, etc.
  authorUid: string;
  text: string;
  createdAt: Date;
  updatedAt?: Date;
}

// Quality review types
export interface QualityReview {
  id: string;
  engagementId: string;
  reviewerUid: string;
  notes: string;
  rating: number; // 1-5 scale
  isqmChecklist: ISQMItem[];
  eqcrNotes?: string;
  aiQualityMetrics?: AIQualityMetrics;
  createdAt: Date;
}

export interface ISQMItem {
  id: string;
  requirement: string;
  compliant: boolean;
  notes?: string;
}

export interface AIQualityMetrics {
  accuracy: number;
  completeness: number;
  relevance: number;
  consistency: number;
  auditTrail: boolean;
}

// AI and workflow types
export interface AIWorkflow {
  id: string;
  type: WorkflowType;
  status: AIStatus;
  input: any;
  output?: any;
  confidence?: number;
  reviewRequired: boolean;
  createdAt: Date;
  completedAt?: Date;
}

export type WorkflowType = 'risk_assessment' | 'document_analysis' | 'sample_selection' | 'report_generation';

// Navigation and UI types
export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
  children?: NavigationItem[];
}

// Dashboard widget types
export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  data: any;
  refreshInterval?: number;
}

export type WidgetType = 'risk_heatmap' | 'materiality_card' | 'ai_insight_feed' | 'progress_chart';

// Audit report types
export interface AuditReport {
  id: string;
  engagementId: string;
  sections: ReportSection[];
  opinion: OpinionType;
  kams: KeyAuditMatter[];
  draftedBy: string;
  reviewedBy?: string;
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type OpinionType = 'unmodified' | 'qualified' | 'adverse' | 'disclaimer';
export type ReportStatus = 'draft' | 'review' | 'partner_review' | 'final';

export interface ReportSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface KeyAuditMatter {
  id: string;
  title: string;
  description: string;
  response: string;
  order: number;
}