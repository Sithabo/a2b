import React from "react";
import { View, StyleSheet } from "react-native";
import { Check } from "lucide-react-native";
import { Badge, colors, fontFamily, radius, spacing, Text } from "@a2b/ui";

export interface MilestoneItem {
  key: string;
  title: string;
  location: string;
  verification: string;
}

interface MilestoneTimelineProps {
  milestones: MilestoneItem[];
  currentMilestoneIndex: number;
  getMilestoneTime: (index: number) => string;
}

export const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({
  milestones,
  currentMilestoneIndex,
  getMilestoneTime,
}) => {
  return (
    <View style={styles.timelineContainer}>
      {milestones.map((item, index) => {
        const isCompleted = index < currentMilestoneIndex;
        const isActive = index === currentMilestoneIndex;
        const isPending = index > currentMilestoneIndex;

        return (
          <View key={item.key} style={styles.timelineItem}>
            {/* Left Column: Dot & Line */}
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
              {index < milestones.length - 1 && (
                <View
                  style={[
                    styles.timelineLine,
                    index < currentMilestoneIndex
                      ? styles.lineCompleted
                      : styles.linePending,
                  ]}
                />
              )}
            </View>

            {/* Right Column: Milestone Info */}
            <View style={styles.timelineContent}>
              <View style={styles.timelineHeaderRow}>
                <Text
                  variant="bodyStrong"
                  style={styles.timelineTitle}
                  color={
                    index <= currentMilestoneIndex
                      ? colors.text
                      : colors.textPlaceholder
                  }
                >
                  {item.title}
                </Text>
                {isCompleted && (
                  <Check
                    color={colors.success}
                    size={16}
                    style={styles.checkIcon}
                  />
                )}
                {isActive && <Badge label="Active" tone="brand" />}
              </View>

              <Text variant="caption" tone="muted" style={styles.timelineMetaText}>
                {isPending ? "--:--" : getMilestoneTime(index)} •{" "}
                {item.location}
              </Text>

              <Text
                variant="caption"
                style={styles.timelineVerificationText}
                color={
                  index < currentMilestoneIndex
                    ? colors.primary
                    : index === currentMilestoneIndex
                      ? colors.accent
                      : colors.textPlaceholder
                }
              >
                {isPending ? "Pending" : item.verification}
              </Text>
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
    minHeight: 88,
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
