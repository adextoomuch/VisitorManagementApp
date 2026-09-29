export const visitorStatuses = [
  "Pending Approval",
  "Approved",
  "Rejected",
  "Checked In",
  "Checked Out",
] as const;

export type VisitorStatus = (typeof visitorStatuses)[number];

export interface Visitor {
  _id: string;
  visitorId: string;
  visitorName: string;
  mobileNo: number;
  address?: string;
  whomToMeet: string[];
  purpose?: string;
  dateOfVisit?: string;
  email: string;
  status: VisitorStatus;
  checkInTime?: string;
  checkOutTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVisitorPayload {
  visitorName: string;
  mobileNo: number;
  address?: string;
  whomToMeet: string[];
  purpose?: string;
  dateOfVisit: string;
  email: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
