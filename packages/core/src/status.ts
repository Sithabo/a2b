/**
 * Load lifecycle shared by every A2B app.
 *
 * DRAFT → OPEN → MATCHED → SECURED → IN_TRANSIT → DELIVERED → COMPLETED
 *                                  ↘ CANCELLED (from any pre-transit state)
 */
export const LOAD_STATUSES = [
  'DRAFT', // created, not yet on the load board (e.g. customs documents still missing)
  'OPEN', // on the load board, waiting for a carrier
  'MATCHED', // carrier accepted; shipper must fund escrow (amber state)
  'SECURED', // escrow funded; contact details and pickup navigation unlocked
  'IN_TRANSIT', // driver confirmed cargo loaded
  'DELIVERED', // driver confirmed arrival; waiting for the 6-digit release code
  'COMPLETED', // release code accepted; escrow paid out to the carrier
  'CANCELLED',
] as const;

export type LoadStatus = (typeof LOAD_STATUSES)[number];

/** Who is allowed to move a load between states. `system` = backend (payments, timeouts). */
export type StatusActor = 'shipper' | 'driver' | 'fleet_owner' | 'system';

/** Mirrors the tone names in @a2b/ui so apps can pass `statusMeta[s].tone` straight to a Badge. */
export type StatusTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';

const TRANSITIONS: Record<LoadStatus, Partial<Record<LoadStatus, readonly StatusActor[]>>> = {
  DRAFT: { OPEN: ['shipper'], CANCELLED: ['shipper'] },
  OPEN: { MATCHED: ['driver', 'fleet_owner'], CANCELLED: ['shipper'] },
  MATCHED: {
    SECURED: ['system'], // escrow deposit confirmed by the payment provider
    OPEN: ['driver', 'fleet_owner', 'system'], // carrier withdrew or the funding window lapsed
    CANCELLED: ['shipper'],
  },
  SECURED: { IN_TRANSIT: ['driver'], CANCELLED: ['system'] },
  IN_TRANSIT: { DELIVERED: ['driver'] },
  DELIVERED: { COMPLETED: ['driver'] }, // backend verifies the release code
  COMPLETED: {},
  CANCELLED: {},
};

export function nextStatuses(from: LoadStatus, actor?: StatusActor): LoadStatus[] {
  return (Object.entries(TRANSITIONS[from]) as [LoadStatus, readonly StatusActor[]][])
    .filter(([, actors]) => !actor || actors.includes(actor))
    .map(([to]) => to);
}

export function canTransition(from: LoadStatus, to: LoadStatus, actor: StatusActor): boolean {
  return TRANSITIONS[from][to]?.includes(actor) ?? false;
}

/** Coarse buckets used by list filters ("Active", "Pending", "Completed"). */
export type StatusGroup = 'draft' | 'pending' | 'active' | 'done';

export interface StatusMeta {
  label: string;
  tone: StatusTone;
  group: StatusGroup;
  /** 0–1, for progress bars. */
  progress: number;
}

export const statusMeta: Record<LoadStatus, StatusMeta> = {
  DRAFT: { label: 'Draft', tone: 'neutral', group: 'draft', progress: 0 },
  OPEN: { label: 'Waiting for driver', tone: 'info', group: 'pending', progress: 0.1 },
  MATCHED: { label: 'Awaiting deposit', tone: 'warning', group: 'active', progress: 0.25 },
  SECURED: { label: 'Paid & secured', tone: 'brand', group: 'active', progress: 0.4 },
  IN_TRANSIT: { label: 'In transit', tone: 'brand', group: 'active', progress: 0.65 },
  DELIVERED: { label: 'Awaiting release code', tone: 'warning', group: 'active', progress: 0.9 },
  COMPLETED: { label: 'Completed', tone: 'success', group: 'done', progress: 1 },
  CANCELLED: { label: 'Cancelled', tone: 'danger', group: 'done', progress: 0 },
};

export const statusGroup = (s: LoadStatus): StatusGroup => statusMeta[s].group;
export const isActiveStatus = (s: LoadStatus) => statusMeta[s].group === 'active';

/** Maps status values written by older app versions onto the canonical list. */
export function normalizeStatus(value: string): LoadStatus {
  switch (value) {
    case 'ACTIVE':
      return 'IN_TRANSIT';
    case 'DRAFT_PENDING_DOCS':
      return 'DRAFT';
    default:
      return (LOAD_STATUSES as readonly string[]).includes(value) ? (value as LoadStatus) : 'DRAFT';
  }
}
