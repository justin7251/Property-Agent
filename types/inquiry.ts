export type InquiryStatus = 'new' | 'approved' | 'rejected' | 'contacted' | 'converted';
export type InquiryType = 'lead' | 'maintenance';
export type MaintenanceDecision = 'pending' | 'approved' | 'deferred' | 'rejected';

export interface InquiryStatusHistoryEntry {
  from: InquiryStatus;
  to: InquiryStatus;
  at: string;
  by: string;
  note?: string;
}

export interface Inquiry {
  id: string;
  clientName: string;
  clientEmail: string;
  propertyId: string;
  propertyTitle: string;
  agentId: string;
  inquiryType?: InquiryType;
  maintenanceRequestId?: string;
  maintenanceDecision?: MaintenanceDecision;
  maintenanceScheduledAt?: string;
  status: InquiryStatus;
  message: string;
  date: string;
  updatedAt?: string;
  updatedBy?: string;
  statusHistory?: InquiryStatusHistoryEntry[];
}
