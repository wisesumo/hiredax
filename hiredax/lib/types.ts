// Timestamp placeholder — replaced with firebase/firestore Timestamp in Task 11
export type Timestamp = { seconds: number; nanoseconds: number; toDate(): Date };

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
  items: { name: string; volume: number; quantity: number }[];
  totalVolume: number;
  estimatedPrice: number;
  surcharges: Record<string, number>;
}

export interface Operator {
  id: string;
  companyName: string;
  phone: string;
  forwardingNumber: string;
  operatingHours: { open: string; close: string };
  equipment: ("dumpster" | "flatbed" | "pickup")[];
  serviceRadius: number;
  serviceZips: string[];
  taskDurations: Record<string, { label: string; hours: number; flatRate: number }>;
  onboardingComplete: boolean;
  createdAt: Timestamp;
}

export interface Session {
  token: string;
  operatorId: string;
  customerPhone: string;
  customerName: string;
  status: SessionStatus;
  photos: string[];
  analysisResult: AnalysisResult | null;
  approvedPrice: number | null;
  operatorOverride: boolean;
  bookingSlot: string | null;
  signatureUrl: string | null;
  rating: number | null;
  feedbackNote: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
