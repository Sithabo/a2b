import React from "react";
import { View, StyleSheet } from "react-native";
import { Check } from "lucide-react-native";
import type { LoadStatus, TimelineStep } from "@a2b/core";
import { Badge, colors, fontFamily, radius, spacing, Text } from "@a2b/ui";

interface MilestoneTimelineProps {
  steps: TimelineStep[];
  /** Where a step happened, if it has a place (pickup, drop-off). */
  placeFor?: (status: LoadStatus) => string | undefined;
}

const formatTime = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/** The load's progress, from `loadTimeline()`: what happened, what it's waiting on, what's ahead. */
export const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({ steps, placeFor }) => {
  return (
    <View style={styles.timelineContainer} accessibilityRole="list">
      {steps.map((step, index) => {
        const isCompleted = step.state === "done";
        const isActive = step.state === "active";
        const isPending = step.state === "pending";
        const place = placeFor?.(step.status);
        const meta = [step.at ? formatTime(step.at) : null, isCompleted ? place : null].filter(Boolean).join(" • ");

        return (
          <View
            key={step.status}
            style={styles.timelineItem}
            accessibilityLabel={[step.title, isCompleted ? "done" : isActive ? "in progress" : "not yet", meta, ...step.notes]
              .filter(Boolean)
              .join(", ")}
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
                  variant="bodyStrong"
                  style={styles.timelineTitle}
                  color={isPending ? colors.textPlaceholder : colors.text}
                >
                  {step.title}
                </Text>
                {isCompleted && <Check color={colors.success} size={16} style={styles.checkIcon} />}
                {isActive && <Badge label="Next" tone="brand" />}
              </View>

              {meta ? (
                <Text variant="caption" tone="muted" style={styles.timelineMetaText}>
                  {meta}
                </Text>
              ) : null}

              {step.notes.map((note) => (
                <Text
                  key={note}
                  variant="caption"
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
};

const styles = StyleSheet.create({
  timelineContainer: {
    width: "100%",
    paddingLeft: spacing.xs,
  },
  timelineItem: {
    flexDirection: "row",
    minHeight: 64,
  },
  indicatorContainer: {
    alignItems: "center",
    width: 16,
    marginRight: spacing.lg,
    position: "relative",
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: radius.pill,
    marginTop: spacing.xs,
    zIndex: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  dotCompleted: {
    backgroundColor: colors.primary,
  },
  dotActive: {
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
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
    position: "absolute",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
