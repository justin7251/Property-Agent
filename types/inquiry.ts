export type InquiryStatus = 'new' | 'in_progress' | 'resolved' | 'closed';

export interface Inquiry {
  id: string;
  clientName: string;
  clientEmail: string;
  propertyId: string;
  propertyTitle: string;
  agentId: string;
  status: InquiryStatus;
  message: string;
  date: string;
}
