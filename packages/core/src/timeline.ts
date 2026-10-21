import type { LoadStatus } from './status.ts';

/** What has happened (done), what the load is waiting on (active), and what's still ahead (pending). */
export type TimelineStepState = 'done' | 'active' | 'pending';

export interface TimelineStep {
  status: LoadStatus;
  title: string;
  /** When it happened (ISO); null until then. */
  at: string | null;
  /** Shown under the title: who, how, or what it's waiting for. */
  notes: string[];
  state: TimelineStepState;
}

/** The lifecycle timestamps a load carries. */
export interface TimelineLoad {
  status: LoadStatus;
  postedAt: string | null;
  matchedAt: string | null;
  securedAt: string | null;
  inTransitAt: string | null;
  deliveredAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
}

/** A load event (status change, or a same-status note such as a reassignment). */
export interface TimelineEvent {
  fromStatus: LoadStatus | null;
  toStatus: LoadStatus;
  note: string | null;
}

type Stamp = keyof Omit<TimelineLoad, 'status'>;

const STEPS: { status: LoadStatus; title: string; stamp: Stamp; waiting: string }[] = [
  { status: 'OPEN', title: 'Posted to the load board', stamp: 'postedAt', waiting: 'Not posted yet' },
  { status: 'MATCHED', title: 'Carrier accepted', stamp: 'matchedAt', waiting: 'Waiting for a carrier to accept' },
  { status: 'SECURED', title: 'Payment secured in escrow', stamp: 'securedAt', waiting: 'Waiting for your deposit' },
  { status: 'IN_TRANSIT', title: 'Picked up', stamp: 'inTransitAt', waiting: 'Driver heading to pickup' },
  { status: 'DELIVERED', title: 'Delivered', stamp: 'deliveredAt', waiting: 'On the way to the drop-off' },
  { status: 'COMPLETED', title: 'Payment released', stamp: 'completedAt', waiting: 'Waiting for your release code' },
];

/** Notes for a step: how the load last entered it, then any changes while it was there (e.g. reassignments). */
function notesFor(status: LoadStatus, events: TimelineEvent[]) {
  const entries = events.filter((e) => e.toStatus === status && e.fromStatus !== status && e.note);
  const changes = events.filter((e) => e.toStatus === status && e.fromStatus === status && e.note);
  const latestEntry = entries.at(-1)?.note;
  return [...(latestEntry ? [latestEntry] : []), ...changes.map((e) => e.note!)];
}

/**
 * The load's progress as steps for a tracking timeline, built only from what
 * actually happened (lifecycle timestamps and events). A cancelled load shows
 * the steps it reached, then the cancellation.
 */
export function loadTimeline(load: TimelineLoad, events: TimelineEvent[] = []): TimelineStep[] {
  if (load.status === 'CANCELLED') {
    const reached = STEPS.filter((s) => load[s.stamp]).map(
      (s): TimelineStep => ({ status: s.status, title: s.title, at: load[s.stamp], notes: notesFor(s.status, events), state: 'done' })
    );
    return [
      ...reached,
      { status: 'CANCELLED', title: 'Cancelled', at: load.cancelledAt, notes: notesFor('CANCELLED', events), state: 'done' },
    ];
  }

  const current = STEPS.findIndex((s) => s.status === load.status); // -1 for a draft
  return STEPS.map((s, i): TimelineStep => {
    const state: TimelineStepState = i <= current ? 'done' : i === current + 1 ? 'active' : 'pending';
    return {
      status: s.status,
      title: s.title,
      at: state === 'done' ? load[s.stamp] : null,
      notes: state === 'done' ? notesFor(s.status, events) : state === 'active' ? [s.waiting] : [],
      state,
    };
  });
}
