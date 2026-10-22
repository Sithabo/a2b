import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Check } from 'lucide-react-native';
import type { Data } from '@a2b/api-client';
import {
  formatMarketTime,
  getMarket,
  loadTimeline,
  type LoadStatus,
  type Market,
  type TimelineAudience,
  type TimelineStep,
} from '@a2b/core';
import { Badge, colors, fontFamily, radius, spacing, Text } from '@a2b/ui';
import { LOADS_QUERY_ROOT } from '../queries/load_mutations.ts';
import { useAppSession } from '../session/session_context.tsx';

type PlaceFor = (status: LoadStatus) => string | undefined;

/**
 * The load's history (status changes and notes such as reassignments), oldest
 * first. Keyed by status so it refetches as soon as the load moves on.
 */
export function useLoadEvents(load: { id: number; status: LoadStatus } | undefined, options: { pollMs?: number } = {}) {
  const { api } = useAppSession();
  return useQuery({
    queryKey: [...LOADS_QUERY_ROOT, load?.id ?? 0, 'events', load?.status],
    enabled: !!load,
    queryFn: async () => (await api.loads.events({ params: { id: load!.id } })).data,
    refetchInterval: options.pollMs,
  });
}

export interface LoadTimelineProps {
  load: Data.Load;
  /** Who is reading: decides how "waiting for…" is worded. */
  audience: TimelineAudience;
  /** Refetch the history this often (ms), e.g. while a reassignment could happen. */
  pollMs?: number;
  /** Where a step happened; defaults to the pickup and drop-off summaries. */
  placeFor?: PlaceFor;
}

/** The tracking timeline for a load, built from its real lifecycle timestamps and events. */
export function LoadTimeline({ load, audience, pollMs, placeFor }: LoadTimelineProps) {
  const events = useLoadEvents(load, { pollMs });
  const steps = loadTimeline(load, events.data ?? [], audience);
  const defaultPlaceFor: PlaceFor = (status) =>
    status === 'IN_TRANSIT' ? load.pickupSummary : status === 'DELIVERED' ? load.dropoffSummary : undefined;
  return <MilestoneTimeline steps={steps} market={getMarket(load.market)} placeFor={placeFor ?? defaultPlaceFor} />;
}

interface MilestoneTimelineProps {
  steps: TimelineStep[];
  /** Times are shown in the load's market. */
  market: Market;
  /** Where a step happened, if it has a place (pickup, drop-off). */
  placeFor?: PlaceFor;
}

/** The load's progress, from `loadTimeline()`: what happened, what it's waiting on, what's ahead. */
export function MilestoneTimeline({ steps, market, placeFor }: MilestoneTimelineProps) {
  return (
    <View style={styles.timelineContainer} accessibilityRole='list'>
      {steps.map((step, index) => {
        const isCompleted = step.state === 'done';
        const isActive = step.state === 'active';
        const isPending = step.state === 'pending';
        const place = placeFor?.(step.status);
        const meta = [step.at ? formatMarketTime(step.at, market) : null, isCompleted ? place : null].filter(Boolean).join(' • ');

        return (
          <View
            key={step.status}
            style={styles.timelineItem}
            accessibilityLabel={[step.title, isCompleted ? 'done' : isActive ? 'in progress' : 'not yet', meta, ...step.notes]
              .filter(Boolean)
              .join(', ')}
          >
            <View style={styles.indicatorContainer}>
              <View
                style={[
                  styles.timelineDot,
                  isCompleted && styles.dotCompleted,
                  isActive && styles.dotActive,
                  isPending && styles.dotPending,
                ]}
              >
                {isActive && <View style={styles.dotActiveInner} />}
              </View>
              {index < steps.length - 1 && (
                <View style={[styles.timelineLine, isCompleted ? styles.lineCompleted : styles.linePending]} />
              )}
            </View>

            <View style={styles.timelineContent}>
              <View style={styles.timelineHeaderRow}>
                <Text
                  variant='bodyStrong'
                  style={styles.timelineTitle}
                  color={isPending ? colors.textPlaceholder : colors.text}
                >
                  {step.title}
                </Text>
                {isCompleted && <Check color={colors.success} size={16} style={styles.checkIcon} />}
                {isActive && <Badge label='Next' tone='brand' />}
              </View>

              {meta ? (
                <Text variant='caption' tone='muted' style={styles.timelineMetaText}>
                  {meta}
                </Text>
              ) : null}

              {step.notes.map((note) => (
                <Text
                  key={note}
                  variant='caption'
                  style={styles.timelineVerificationText}
                  color={isActive ? colors.accent : colors.primary}
                >
                  {note}
                </Text>
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  timelineContainer: {
    width: '100%',
    paddingLeft: spacing.xs,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 64,
  },
  indicatorContainer: {
    alignItems: 'center',
    width: 16,
    marginRight: spacing.lg,
    position: 'relative',
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: radius.pill,
    marginTop: spacing.xs,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotCompleted: {
    backgroundColor: colors.primary,
  },
  dotActive: {
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActiveInner: {
    width: 4,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.onPrimary,
  },
  dotPending: {
    backgroundColor: colors.border,
  },
  timelineLine: {
    position: 'absolute',
    top: 18,
    bottom: -12,
    left: 6,
    width: 2,
    zIndex: 1,
  },
  lineCompleted: {
    backgroundColor: colors.primary,
  },
  linePending: {
    backgroundColor: colors.border,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: spacing.lg,
  },
  timelineHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  timelineTitle: {
    flexShrink: 1,
  },
  checkIcon: {
    marginRight: spacing.xs,
  },
  timelineMetaText: {
    marginTop: spacing.xxs,
  },
  timelineVerificationText: {
    fontFamily: fontFamily.semibold,
    marginTop: spacing.xs,
  },
});
