import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { DoorOpen, LogOut, Pencil, ShieldCheck } from "lucide-react-native";
import { apiErrorMessage } from "@a2b/api-client";
import { getMarket } from "@a2b/core";
import { Avatar, confirmAction } from "@a2b/features";
import { Badge, Button, Card, colors, ScreenScroll, spacing, Text } from "@a2b/ui";
import { api, session, useSession } from "@/lib/session";

const VERIFICATION = {
  VERIFIED: { label: "Verified", tone: "success" },
  PENDING: { label: "Verification pending", tone: "warning" },
  REJECTED: { label: "Not verified", tone: "danger" },
} as const;

export default function AccountScreen() {
  const router = useRouter();
  const user = useSession((s) => s.user);
  const signOut = useSession((s) => s.signOut);
  const profile = user?.driverProfile;
  const market = getMarket(user?.market ?? "UG");
  const verification = VERIFICATION[profile?.verificationStatus ?? "PENDING"];
  const [isLeaving, setIsLeaving] = useState(false);

  const handleLeaveFleet = async () => {
    const confirmed = await confirmAction({
      title: "Leave your fleet?",
      message:
        profile?.verificationStatus === "VERIFIED"
          ? "You'll find and accept loads on your own, and get paid directly."
          : "You'll drive on your own. Until you're verified you can't accept loads yourself.",
      confirmLabel: "Leave fleet",
      destructive: true,
    });
    if (!confirmed) return;
    setIsLeaving(true);
    try {
      await api.fleetInvites.leave({});
      await session.refreshUser();
    } catch (err) {
      Alert.alert("Couldn't leave the fleet", apiErrorMessage(err));
    } finally {
      setIsLeaving(false);
    }
  };

  const handleSignOut = async () => {
    await api.auth.logout({}).catch(() => {}); // revoke the token server-side when online
    await signOut(); // the root layout routes back to sign-in
  };

  return (
    <ScreenScroll>
      <Text variant="h1" tone="primary">
        Account
      </Text>

      <Card style={styles.section}>
        <View style={styles.head}>
          <Avatar path={user?.avatarPath} name={user?.fullName} size={56} />
          <View style={{ flex: 1, gap: spacing.xs }}>
            <Text variant="h2">{user?.fullName ?? "Driver"}</Text>
            <Badge label={verification.label} tone={verification.tone} style={{ alignSelf: "flex-start" }} />
          </View>
        </View>
        <Row label="Mobile" value={user?.phone} />
        <Row label="Email" value={user?.email ?? "—"} />
        <Row label="Market" value={`${market.flag} ${market.name}`} />
        <Row label="Works as" value={profile?.fleetId ? "Fleet driver" : "Independent owner-operator"} />
        <Row label="Licence" value={profile?.licenseNumber ? `${profile.licenseNumber} · Class ${profile.licenseClass ?? "—"}` : "—"} />
        <Row label="Completed trips" value={String(profile?.completedTrips ?? 0)} />
      </Card>

      <Button title="Edit profile" icon={Pencil} variant="secondary" onPress={() => router.push("/account/edit")} />
      <Button title="Verification documents" icon={ShieldCheck} variant="secondary" onPress={() => router.push("/verification")} />
      {profile?.fleetId ? (
        <Button title="Leave fleet" icon={DoorOpen} variant="ghost" onPress={handleLeaveFleet} loading={isLeaving} />
      ) : null}
      <Button title="Sign out" icon={LogOut} variant="ghost" onPress={handleSignOut} />
    </ScreenScroll>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <View style={styles.row}>
      <Text tone="secondary">{label}</Text>
      <Text variant="bodyStrong" style={styles.value}>
        {value ?? "—"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  head: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  value: { flexShrink: 1, textAlign: "right" },
});
