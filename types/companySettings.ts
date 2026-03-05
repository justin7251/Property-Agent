export interface CompanySettings {
  id: string;
  companyId: string;
  companyName: string;
  logoUrl: string;
  contactEmail: string;
  contactPhone: string;
  timezone: string;
  currency: string;
  updatedAt: string;
  updatedBy: string;
}

export type CompanySettingsPatch = Partial<
  Omit<CompanySettings, 'id' | 'companyId' | 'updatedAt' | 'updatedBy'>
>;
