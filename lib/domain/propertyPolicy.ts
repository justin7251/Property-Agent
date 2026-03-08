import type { Property, PropertyStatus } from '../../types/property';

const ALLOWED_STATUS_TRANSITIONS: Record<PropertyStatus, PropertyStatus[]> = {
  available: ['available', 'under_review', 'rented', 'off_market'],
  under_review: ['under_review', 'available', 'rented', 'off_market'],
  rented: ['rented', 'available', 'off_market'],
  off_market: ['off_market', 'under_review', 'available'],
};

function assertNonEmpty(label: string, value: string): void {
  if (!value || !value.trim()) {
    throw new Error(`${label} is required.`);
  }
}

function assertPositive(label: string, value: number): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be a positive number.`);
  }
}

function assertNonNegative(label: string, value: number): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${label} must be zero or greater.`);
  }
}

export function validatePropertyCreateInput(data: Omit<Property, 'id'>): void {
  assertNonEmpty('Property title', data.title);
  assertNonEmpty('Property address', data.address);
  assertPositive('Property price', data.price);
  assertPositive('Property size (sqft)', data.sqft);
  assertNonNegative('Bedrooms', data.bedrooms);
  assertNonNegative('Bathrooms', data.bathrooms);
  assertNonEmpty('Agent ID', data.agentId);
  assertNonEmpty('Landlord ID', data.landlordId);
  assertStatusTransition(data.status, data.status);
}

export function assertStatusTransition(currentStatus: PropertyStatus, nextStatus: PropertyStatus): void {
  const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(nextStatus)) {
    throw new Error(`Invalid property status transition: ${currentStatus} -> ${nextStatus}.`);
  }
}

export function validatePropertyPatch(current: Property, patch: Partial<Property>): void {
  if (typeof patch.title === 'string') assertNonEmpty('Property title', patch.title);
  if (typeof patch.address === 'string') assertNonEmpty('Property address', patch.address);
  if (typeof patch.price === 'number') assertPositive('Property price', patch.price);
  if (typeof patch.sqft === 'number') assertPositive('Property size (sqft)', patch.sqft);
  if (typeof patch.bedrooms === 'number') assertNonNegative('Bedrooms', patch.bedrooms);
  if (typeof patch.bathrooms === 'number') assertNonNegative('Bathrooms', patch.bathrooms);
  if (typeof patch.agentId === 'string') assertNonEmpty('Agent ID', patch.agentId);
  if (typeof patch.landlordId === 'string') assertNonEmpty('Landlord ID', patch.landlordId);

  if (patch.status) {
    assertStatusTransition(current.status, patch.status);
  }
}
