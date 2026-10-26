import React from "react";
import {
  View,
  Pressable,
  StyleSheet,
  GestureResponderEvent,
} from "react-native";
import { MailIcon, PhoneIcon } from "lucide-react-native";
import { Avatar } from "@a2b/features";
import { Card, colors, radius, spacing, Text } from "@a2b/ui";

interface DriverContactCardProps {
  driverName: string;
  role?: string;
  /** The driver's `driverAvatarPath` from the load; initials are shown without one. */
  avatarPath?: string | null;
  onPressCard: () => void;
  onCallPress: () => void;
  onMessagePress: () => void;
}

export const DriverContactCard: React.FC<DriverContactCardProps> = ({
  driverName,
  role = "Driver",
  avatarPath,
  onPressCard,
  onCallPress,
  onMessagePress,
}) => {
  const handleCall = (e: GestureResponderEvent) => {
    e.stopPropagation();
    onCallPress();
  };

  const handleMessage = (e: GestureResponderEvent) => {
    e.stopPropagation();
    onMessagePress();
  };

  return (
    <Card
      variant="brand"
      padding="lg"
      style={styles.driverCard}
      onPress={onPressCard}
      accessibilityLabel={`${driverName}, ${role}. View driver and vehicle details`}
    >
      <View style={styles.driverInfoContainer}>
        <Avatar path={avatarPath} name={driverName} size={55} />
        <View style={styles.driverTextContainer}>
          <Text variant="bodyStrong" tone="inverse">{driverName}</Text>
          <Text variant="caption" color={colors.onPrimaryMuted} style={styles.driverRoleText}>
            {role}
          </Text>
        </View>
      </View>
      <View style={styles.driverActionsContainer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Call ${driverName}`}
          hitSlop={4}
          style={({ pressed }) => [styles.driverActionButton, pressed && styles.pressed]}
          onPress={handleCall}
        >
          <PhoneIcon color={colors.primary} size={20} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Message ${driverName}`}
          hitSlop={4}
          style={({ pressed }) => [styles.driverActionButton, pressed && styles.pressed]}
          onPress={handleMessage}
        >
          <MailIcon color={colors.primary} size={20} />
        </Pressable>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  driverCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    width: "100%",
  },
  driverInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  driverTextContainer: {
    marginLeft: spacing.md,
    flex: 1,
  },
  driverRoleText: {
    marginTop: spacing.xxs,
  },
  driverActionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  // Same look as IconButton's "surface" variant; kept as a Pressable because the
  // handlers need the press event to stop it reaching the card.
  driverActionButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.7,
  },
});
