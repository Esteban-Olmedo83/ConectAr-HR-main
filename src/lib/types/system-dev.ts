/**
 * Tipos para Sistema y Desarrollo (Client Management)
 */

export type ClientStatus = 'trial' | 'active' | 'suspended' | 'cancelled';
export type BillingPeriod = 'monthly' | 'yearly';

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  costCents: number;
  billingPeriod: BillingPeriod;
  modules: string[];
  features?: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  companyName: string;
  companySlug: string;
  contactEmail: string;
  contactPhone?: string;
  contactPerson?: string;
  country?: string;
  region?: string;
  city?: string;
  status: ClientStatus;
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientSubscription {
  id: string;
  clientId: string;
  planId: string;
  assignedModules: string[];
  startedAt: Date;
  renewsAt: Date;
  cancelledAt?: Date;
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientDetail extends Client {
  subscription?: ClientSubscription & { plan?: SubscriptionPlan };
  nextRenewal?: Date;
}

export interface CreateClientInput {
  companyName: string;
  companySlug: string;
  contactEmail: string;
  contactPhone?: string;
  contactPerson?: string;
  country?: string;
  region?: string;
  city?: string;
  planId: string;
  modules?: string[];
}

export interface UpdateClientInput {
  companyName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactPerson?: string;
  country?: string;
  region?: string;
  city?: string;
  status?: ClientStatus;
}

export interface UpdateSubscriptionInput {
  planId: string;
  modules?: string[];
}

export interface ClientAuditLog {
  id: string;
  action: string;
  clientId?: string;
  beforeState?: Record<string, any>;
  afterState?: Record<string, any>;
  userId: string;
  ipAddress?: string;
  createdAt: Date;
}
