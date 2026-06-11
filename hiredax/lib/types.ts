import type { Timestamp } from "firebase/firestore";

export type { Timestamp };

export type SessionStatus =
  | "call_active"
  | "link_sent"
  | "photos_uploading"
  | "photos_complete"
  | "analysis_running"
  | "pending_approval"
  | "quote_approved"
  | "quote_delivered"
  | "booking_confirmed"
  | "work_order_signed"
  | "job_complete"
  | "rated";

export interface AnalysisResult {
  items: string[];
  volume_yd3: number;
  confidence: number;
  suggestedPrice: number;
}

export interface Operator {
  uid: string;
  email: string;
  businessName: string;
  phone: string;
  plan: string;
  createdAt: Timestamp;
}

export interface Session {
  id: string;
  operatorId: string;
  customerName: string;
  customerPhone: string;
  status: SessionStatus;
  portalToken: string;
  photoUrls: string[];
  analysisResult: AnalysisResult | null;
  suggestedPrice: number | null;
  approvedPrice: number | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
