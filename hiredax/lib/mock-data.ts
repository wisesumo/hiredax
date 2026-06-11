// Reference fixtures only — NOT imported by any page component.
// Live data comes from Firestore (seeded by scripts/seed.ts).
import { Timestamp } from "firebase/firestore";
import type { Operator, Session } from "./types";

function ts(d: Date): Timestamp {
  return Timestamp.fromDate(d);
}

const NOW = new Date("2026-06-10T10:00:00-05:00");
const HOUR = 60 * 60 * 1000;

export const MOCK_OPERATOR: Operator = {
  uid: "op-demo",
  email: "demo@hiredax.com",
  businessName: "Demo Hauling Co",
  phone: "+14045550123",
  plan: "pro",
  createdAt: ts(new Date(NOW.getTime() - 30 * 24 * HOUR)),
};

export const MOCK_SESSION_PENDING: Session = {
  id: "demo-session-001",
  operatorId: "op-demo",
  customerName: "Marcus Johnson",
  customerPhone: "+14045550199",
  status: "pending_approval",
  portalToken: "demo-token-001",
  photoUrls: [
    "https://placehold.co/400x300?text=Couch",
    "https://placehold.co/400x300?text=Mattress",
  ],
  analysisResult: {
    items: ["Sectional sofa", "Queen mattress", "Dresser"],
    volume_yd3: 4.2,
    confidence: 0.87,
    suggestedPrice: 285,
  },
  suggestedPrice: 285,
  approvedPrice: null,
  createdAt: ts(new Date(NOW.getTime() - 2 * HOUR)),
  updatedAt: ts(new Date(NOW.getTime() - 10 * 60 * 1000)),
};

export const MOCK_SESSION_APPROVED: Session = {
  id: "demo-session-002",
  operatorId: "op-demo",
  customerName: "Linda Park",
  customerPhone: "+14045550177",
  status: "quote_approved",
  portalToken: "demo-token-002",
  photoUrls: ["https://placehold.co/400x300?text=Appliances"],
  analysisResult: {
    items: ["Refrigerator", "Washing machine"],
    volume_yd3: 2.8,
    confidence: 0.91,
    suggestedPrice: 195,
  },
  suggestedPrice: 195,
  approvedPrice: 195,
  createdAt: ts(new Date(NOW.getTime() - 4 * HOUR)),
  updatedAt: ts(new Date(NOW.getTime() - 3 * HOUR)),
};

export const MOCK_SESSION_BOOKED: Session = {
  id: "demo-session-003",
  operatorId: "op-demo",
  customerName: "Tony Rivera",
  customerPhone: "+14045550155",
  status: "booking_confirmed",
  portalToken: "demo-token-003",
  photoUrls: [],
  analysisResult: null,
  suggestedPrice: 150,
  approvedPrice: 150,
  createdAt: ts(new Date(NOW.getTime() - 6 * HOUR)),
  updatedAt: ts(new Date(NOW.getTime() - 5 * HOUR)),
};

export const MOCK_SESSIONS: Session[] = [
  MOCK_SESSION_PENDING,
  MOCK_SESSION_APPROVED,
  MOCK_SESSION_BOOKED,
];
