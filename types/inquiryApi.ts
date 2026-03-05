import type { InquiryStatus } from './inquiry';

export type CreateInquiryRequest = {
  clientName: string;
  clientEmail: string;
  propertyId: string;
  propertyTitle: string;
  agentId: string;
  message: string;
  date?: string;
  idempotencyKey?: string;
};

export type CreateInquiryResponse = {
  ok: true;
  inquiryId: string;
  status: InquiryStatus;
  createdAt: string;
};
