export type MaintenancePriority = 'low' | 'medium' | 'high' | 'critical';
export type MaintenanceStatus = 'new' | 'assigned' | 'in_progress' | 'completed';

export interface MaintenanceStatusHistoryEntry {
  from: MaintenanceStatus;
  to: MaintenanceStatus;
  at: string;
  by: string;
  note?: string;
}

export interface MaintenanceRequest {
  id: string;
  companyId: string;
  propertyId: string;
  propertyTitle: string;
  title: string;
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  landlordId: string;
  createdBy: string;
  assignedToUserId?: string;
  assignedBy?: string;
  assignedAt?: string;
  completedAt?: string;
  completedBy?: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
  statusHistory: MaintenanceStatusHistoryEntry[];
}

export interface CreateMaintenanceRequestInput {
  propertyId: string;
  propertyTitle: string;
  title: string;
  description: string;
  priority: MaintenancePriority;
}
