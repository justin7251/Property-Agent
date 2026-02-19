import type { Agent } from '../types/agent';
import type { Inquiry } from '../types/inquiry';
import type { Landlord } from '../types/landlord';
import type { Property } from '../types/property';
import type { AgentPerformance, RevenueReport } from '../types/report';

export const agents: Agent[] = [
  { id: 'a1', name: 'Sarah Johnson', email: 'sarah@propestate.com', phone: '+1 555-0101', totalSales: 2500000, activeListings: 6, closedDeals: 34, joinedAt: '2022-01-15' },
  { id: 'a2', name: 'Michael Chen', email: 'michael@propestate.com', phone: '+1 555-0102', totalSales: 1900000, activeListings: 5, closedDeals: 28, joinedAt: '2022-05-11' },
  { id: 'a3', name: 'Joy Hudson', email: 'joy@propestate.com', phone: '+1 555-0103', totalSales: 1300000, activeListings: 4, closedDeals: 19, joinedAt: '2023-02-01' },
  { id: 'a4', name: 'Maila Luson', email: 'maila@propestate.com', phone: '+1 555-0104', totalSales: 900000, activeListings: 3, closedDeals: 14, joinedAt: '2023-06-22' },
  { id: 'a5', name: 'Joffey Smith', email: 'joffey@propestate.com', phone: '+1 555-0105', totalSales: 1200000, activeListings: 4, closedDeals: 17, joinedAt: '2024-01-12' },
];

export const landlords: Landlord[] = [
  { id: 'l1', name: 'Acme Holdings', email: 'contact@acme.com', phone: '+1 555-0201', totalProperties: 4, activeProperties: 3, revenue: 220000, joinedAt: '2021-08-01' },
  { id: 'l2', name: 'Blue River Group', email: 'ops@blueriver.com', phone: '+1 555-0202', totalProperties: 3, activeProperties: 2, revenue: 160000, joinedAt: '2022-03-19' },
  { id: 'l3', name: 'Sunset Partners', email: 'team@sunset.com', phone: '+1 555-0203', totalProperties: 2, activeProperties: 2, revenue: 110000, joinedAt: '2023-04-14' },
  { id: 'l4', name: 'Urban Nest LLC', email: 'hello@urbannest.com', phone: '+1 555-0204', totalProperties: 1, activeProperties: 1, revenue: 54000, joinedAt: '2024-02-27' },
];

export const properties: Property[] = [
  { id: 'p1', title: 'Luxury Condo', address: '100 Main St, Downtown', price: 2500, priceUnit: 'mo', status: 'available', type: 'condo', bedrooms: 2, bathrooms: 2, sqft: 1150, agentId: 'a1', landlordId: 'l1', images: [], createdAt: '2025-01-02' },
  { id: 'p2', title: 'Skyline Apartment', address: '220 High St, Midtown', price: 2200, priceUnit: 'mo', status: 'rented', type: 'apartment', bedrooms: 1, bathrooms: 1, sqft: 820, agentId: 'a2', landlordId: 'l1', images: [], createdAt: '2025-01-05' },
  { id: 'p3', title: 'Riverfront Loft', address: '8 River Rd, Downtown', price: 3100, priceUnit: 'mo', status: 'available', type: 'apartment', bedrooms: 3, bathrooms: 2, sqft: 1320, agentId: 'a3', landlordId: 'l2', images: [], createdAt: '2025-01-07' },
  { id: 'p4', title: 'Elm Townhouse', address: '55 Elm Ave, Uptown', price: 2800, priceUnit: 'mo', status: 'under_review', type: 'house', bedrooms: 2, bathrooms: 2, sqft: 1460, agentId: 'a4', landlordId: 'l2', images: [], createdAt: '2025-01-10' },
  { id: 'p5', title: 'Central Office Suite', address: '14 Market St, Downtown', price: 6400, priceUnit: 'mo', status: 'available', type: 'office', bedrooms: 0, bathrooms: 2, sqft: 2200, agentId: 'a1', landlordId: 'l1', images: [], createdAt: '2025-01-13' },
  { id: 'p6', title: 'Harbor View Condo', address: '77 Bay St, Harbor', price: 3300, priceUnit: 'mo', status: 'off_market', type: 'condo', bedrooms: 2, bathrooms: 2, sqft: 1180, agentId: 'a5', landlordId: 'l3', images: [], createdAt: '2025-01-18' },
  { id: 'p7', title: 'Parkside House', address: '9 Green Ln, Westside', price: 3600, priceUnit: 'mo', status: 'rented', type: 'house', bedrooms: 4, bathrooms: 3, sqft: 2100, agentId: 'a2', landlordId: 'l3', images: [], createdAt: '2025-01-22' },
  { id: 'p8', title: 'Metro Apartment', address: '63 Rail Ave, Midtown', price: 2050, priceUnit: 'mo', status: 'available', type: 'apartment', bedrooms: 1, bathrooms: 1, sqft: 760, agentId: 'a4', landlordId: 'l4', images: [], createdAt: '2025-01-25' },
  { id: 'p9', title: 'Cedar Condo', address: '31 Cedar St, North End', price: 2450, priceUnit: 'mo', status: 'under_review', type: 'condo', bedrooms: 2, bathrooms: 2, sqft: 1080, agentId: 'a3', landlordId: 'l2', images: [], createdAt: '2025-01-29' },
  { id: 'p10', title: 'Union Office Floor', address: '1 Union Plaza, Downtown', price: 11200, priceUnit: 'mo', status: 'available', type: 'office', bedrooms: 0, bathrooms: 4, sqft: 5200, agentId: 'a5', landlordId: 'l1', images: [], createdAt: '2025-02-02' },
];

export const inquiries: Inquiry[] = [
  { id: 'i1', clientName: 'Sarah Johnson', clientEmail: 'sarah.client@mail.com', propertyId: 'p1', propertyTitle: 'Luxury Condo', agentId: 'a1', status: 'new', message: 'Can I schedule a viewing this Friday?', date: '2026-02-01' },
  { id: 'i2', clientName: 'Michael Chen', clientEmail: 'mchen.client@mail.com', propertyId: 'p3', propertyTitle: 'Riverfront Loft', agentId: 'a3', status: 'in_progress', message: 'Interested in lease terms and parking.', date: '2026-02-02' },
  { id: 'i3', clientName: 'Joy Hduson', clientEmail: 'joy.h@mail.com', propertyId: 'p8', propertyTitle: 'Metro Apartment', agentId: 'a4', status: 'resolved', message: 'Could you share utility costs?', date: '2026-02-03' },
  { id: 'i4', clientName: 'Data K Plea', clientEmail: 'data.k@mail.com', propertyId: 'p4', propertyTitle: 'Elm Townhouse', agentId: 'a4', status: 'new', message: 'Need pet policy details.', date: '2026-02-04' },
  { id: 'i5', clientName: 'Maila Luson', clientEmail: 'maila.client@mail.com', propertyId: 'p5', propertyTitle: 'Central Office Suite', agentId: 'a1', status: 'closed', message: 'Signed contract, thanks.', date: '2026-02-05' },
  { id: 'i6', clientName: 'Grew Ciltan', clientEmail: 'grew@mail.com', propertyId: 'p10', propertyTitle: 'Union Office Floor', agentId: 'a5', status: 'in_progress', message: 'Requesting floor plan and availability.', date: '2026-02-06' },
  { id: 'i7', clientName: 'Lucia Tiide', clientEmail: 'lucia@mail.com', propertyId: 'p9', propertyTitle: 'Cedar Condo', agentId: 'a3', status: 'new', message: 'Can we negotiate the rent?', date: '2026-02-07' },
  { id: 'i8', clientName: 'Michael Kort', clientEmail: 'mkort@mail.com', propertyId: 'p7', propertyTitle: 'Parkside House', agentId: 'a2', status: 'resolved', message: 'Thanks, all questions answered.', date: '2026-02-08' },
];

export const revenueReports: RevenueReport[] = [
  { month: 'Sep', revenue: 160000, expenses: 81000, profit: 79000 },
  { month: 'Oct', revenue: 172000, expenses: 86000, profit: 86000 },
  { month: 'Nov', revenue: 181000, expenses: 91000, profit: 90000 },
  { month: 'Dec', revenue: 195000, expenses: 96000, profit: 99000 },
  { month: 'Jan', revenue: 210000, expenses: 101000, profit: 109000 },
  { month: 'Feb', revenue: 226000, expenses: 109000, profit: 117000 },
];

export const agentPerformance: AgentPerformance[] = agents.map((agent) => ({
  agentId: agent.id,
  agentName: agent.name,
  sales: agent.totalSales,
  inquiries: inquiries.filter((i) => i.agentId === agent.id).length,
  closedDeals: agent.closedDeals,
}));
