import type { Operator, Session, Timestamp } from "./types";

function ts(d: Date): Timestamp {
  const seconds = Math.floor(d.getTime() / 1000);
  return { seconds, nanoseconds: 0, toDate: () => d };
}

const NOW = new Date("2026-06-09T10:00:00-05:00");
const HOUR = 60 * 60 * 1000;

export const MOCK_OPERATOR: Operator = {
  id: "op-001",
  companyName: "ATL Junk Pros",
  phone: "678-555-0100",
  forwardingNumber: "",
  operatingHours: { open: "08:00", close: "20:00" },
  equipment: ["dumpster", "pickup"],
  serviceRadius: 25,
  serviceZips: ["30213", "30214", "30215"],
  taskDurations: {},
  onboardingComplete: true,
  createdAt: ts(new Date(NOW.getTime() - 30 * 24 * HOUR)),
};

export const MOCK_SESSION_PENDING: Session = {
  token: "session-demo-001",
  operatorId: "op-001",
  customerName: "Marcus Williams",
  customerPhone: "+14045550123",
  status: "pending_approval",
  photos: [],
  analysisResult: {
    items: [
      { name: "couch",           volume: 1.5, quantity: 1 },
      { name: "mattress",        volume: 1.2, quantity: 1 },
      { name: "cardboard boxes", volume: 0.8, quantity: 6 },
    ],
    totalVolume: 3.5,
    estimatedPrice: 412.50,
    surcharges: { heavy_items: 0, stairs: 0, interior: 50 },
  },
  approvedPrice: null,
  operatorOverride: false,
  bookingSlot: null,
  signatureUrl: null,
  rating: null,
  feedbackNote: null,
  createdAt: ts(new Date(NOW.getTime() - 2 * HOUR)),
  updatedAt: ts(new Date(NOW.getTime() - 10 * 60 * 1000)),
};

export const MOCK_SESSION_APPROVED: Session = {
  token: "session-demo-002",
  operatorId: "op-001",
  customerName: "Sheila Thompson",
  customerPhone: "+14045550199",
  status: "quote_approved",
  photos: [],
  analysisResult: null,
  approvedPrice: 375,
  operatorOverride: false,
  bookingSlot: null,
  signatureUrl: null,
  rating: null,
  feedbackNote: null,
  createdAt: ts(new Date(NOW.getTime() - 4 * HOUR)),
  updatedAt: ts(new Date(NOW.getTime() - 3 * HOUR)),
};

export const MOCK_SESSION_BOOKED: Session = {
  token: "session-demo-003",
  operatorId: "op-001",
  customerName: "David Chen",
  customerPhone: "+14045550177",
  status: "booking_confirmed",
  photos: [],
  analysisResult: null,
  approvedPrice: 525,
  operatorOverride: false,
  bookingSlot: "2:00 PM – 4:00 PM today",
  signatureUrl: null,
  rating: null,
  feedbackNote: null,
  createdAt: ts(new Date(NOW.getTime() - 6 * HOUR)),
  updatedAt: ts(new Date(NOW.getTime() - 5 * HOUR)),
};

export const MOCK_SESSIONS: Session[] = [
  MOCK_SESSION_PENDING,
  MOCK_SESSION_APPROVED,
  MOCK_SESSION_BOOKED,
];
