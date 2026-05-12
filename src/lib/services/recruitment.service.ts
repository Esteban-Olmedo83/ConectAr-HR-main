import { getSupabaseAdminClient, isSupabaseConfigured } from '../supabase-server';
import { initialVacancies } from '../mock-data';

const TENANT = 'c0nec7ar-0001-0001-0001-000000000001';

export interface RecruitmentPosition {
  id: string;
  title: string;
  department_id: string | null;
  description: string | null;
  work_mode: string;
  status: string;
  priority: string;
  openings: number;
  deadline: string | null;
  departments?: { name: string } | null;
  candidates?: Candidate[];
}

export interface Candidate {
  id: string;
  position_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  source: string;
  stage: string;
  rating: number | null;
  notes: string | null;
  applied_at: string;
}

export async function getRecruitmentPositions(tenantId = TENANT): Promise<RecruitmentPosition[]> {
  if (!isSupabaseConfigured) return getMockPositions();
  const db = getSupabaseAdminClient();
  if (!db) return getMockPositions();

  const { data, error } = await db
    .from('recruitment_positions')
    .select('*, departments(name), candidates(*)')
    .eq('tenant_id', tenantId)
    .in('status', ['open','on_hold'])
    .order('created_at', { ascending: false });

  if (error) { console.error('[recruitment.service]', error.message); return getMockPositions(); }
  return (data ?? []) as RecruitmentPosition[];
}

export async function getCandidates(positionId: string, tenantId = TENANT): Promise<Candidate[]> {
  if (!isSupabaseConfigured) return [];
  const db = getSupabaseAdminClient();
  if (!db) return [];

  const { data, error } = await db
    .from('candidates')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('position_id', positionId)
    .order('applied_at', { ascending: false });

  if (error) return [];
  return (data ?? []) as Candidate[];
}

// ── Mock bridge ───────────────────────────────────────────────────────────────

function getMockPositions(): RecruitmentPosition[] {
  // Group vacancies by title as "positions", each with candidates
  const statusMap: Record<string, string> = {
    'Nuevas Vacantes': 'open',
    'En Proceso de Selección': 'open',
    'Entrevistas': 'open',
    'Oferta Enviada': 'open',
    'Contratado': 'open',
  };

  return initialVacancies.map(v => ({
    id: v.id,
    title: v.title,
    department_id: null,
    description: null,
    work_mode: 'Híbrido',
    status: statusMap[v.status] ?? 'open',
    priority: 'normal',
    openings: 1,
    deadline: null,
    departments: { name: v.department },
    candidates: v.candidates.map((c, i) => ({
      id: c.id,
      position_id: v.id,
      full_name: c.name,
      email: `${c.name.toLowerCase().replace(' ', '.')}@email.com`,
      phone: null,
      source: 'linkedin',
      stage: stageFromVacancyStatus(v.status),
      rating: 3 + (i % 3),
      notes: c.role,
      applied_at: new Date().toISOString(),
    })),
  }));
}

function stageFromVacancyStatus(s: string): string {
  if (s === 'Nuevas Vacantes') return 'new';
  if (s === 'En Proceso de Selección') return 'screening';
  if (s === 'Entrevistas') return 'interview';
  if (s === 'Oferta Enviada') return 'offer';
  if (s === 'Contratado') return 'hired';
  return 'new';
}
