/**
 * In-memory invitation store shared between API routes.
 *
 * Works within a single serverless instance only.
 * For production with multiple instances: replace with Upstash Redis or
 * store invitations in the Supabase `client_invitations` table.
 */

export interface PendingInvitation {
  id: string;
  token: string;
  companyName: string;
  adminEmail: string;
  plan: string;
  modules: string[];
  status: 'pending' | 'activated' | 'expired';
  expiresAt: string;
  createdAt: string;
  activationUrl: string;
}

export const invitationStore = new Map<string, PendingInvitation>();
