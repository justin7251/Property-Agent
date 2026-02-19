export type PropertyStatus = 'available' | 'rented' | 'under_review' | 'off_market';

export interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  priceUnit: 'mo' | 'yr';
  status: PropertyStatus;
  type: 'condo' | 'apartment' | 'house' | 'office';
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  agentId: string;
  landlordId: string;
  images: string[];
  createdAt: string;
}
