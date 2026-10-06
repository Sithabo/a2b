import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Check } from "lucide-react-native";
import { colors, palette } from "@a2b/ui";

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
                  style={[
                    styles.timelineTitle,
                    index <= currentMilestoneIndex
                      ? styles.textCompleted
                      : styles.textPending,
                  ]}
                >
                  {item.title}
                </Text>
                {isCompleted && (
                  <Check
                    color={palette.emerald[500]}
                    size={16}
                    style={styles.checkIcon}
                  />
                )}
                {isActive && (
                  <View style={styles.activePill}>
                    <Text style={styles.activePillText}>ACTIVE</Text>
                  </View>
                )}
              </View>

              <Text style={styles.timelineMetaText}>
                {isPending ? "--:--" : getMilestoneTime(index)} •{" "}
                {item.location}
              </Text>

              <Text
                style={[
                  styles.timelineVerificationText,
                  index < currentMilestoneIndex
                    ? styles.verificationCompleted
                    : index === currentMilestoneIndex
                      ? styles.verificationActive
                      : styles.verificationPending,
                ]}
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
    paddingLeft: 4,
  },
  timelineItem: {
    flexDirection: "row",
    minHeight: 88,
  },
  indicatorContainer: {
    alignItems: "center",
    width: 16,
    marginRight: 16,
    position: "relative",
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 4,
    zIndex: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  dotCompleted: {
    backgroundColor: palette.gray[900],
  },
  dotActive: {
    backgroundColor: palette.gray[900],
    borderWidth: 3,
    borderColor: palette.emerald[500],
    alignItems: "center",
    justifyContent: "center",
  },
  dotActiveInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.white,
  },
  dotPending: {
    backgroundColor: palette.gray[200],
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
    backgroundColor: palette.gray[900],
  },
  linePending: {
    backgroundColor: palette.gray[200],
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 16,
  },
  timelineHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: "bold",
  },
  textCompleted: {
    color: palette.gray[900],
  },
  textPending: {
    color: palette.gray[400],
  },
  checkIcon: {
    marginRight: 4,
  },
  activePill: {
    backgroundColor: palette.forest[50],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activePillText: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.primary,
  },
  timelineMetaText: {
    fontSize: 12,
    color: palette.gray[500],
    marginTop: 2,
    fontWeight: "500",
  },
  timelineVerificationText: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },
  verificationCompleted: {
    color: colors.primary,
  },
  verificationActive: {
    color: palette.amber[600],
  },
  verificationPending: {
    color: palette.gray[400],
  },
});
