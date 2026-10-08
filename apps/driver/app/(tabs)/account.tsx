import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { LogOut } from "lucide-react-native";
import { getMarket } from "@a2b/core";
import { Badge, Button, Card, colors, spacing, Text } from "@a2b/ui";
import { ScreenScroll } from "@/components/ScreenScroll";
import { api, useSession } from "@/lib/session";

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

  const handleSignOut = async () => {
    await api.auth.logout({}).catch(() => {}); // revoke the token server-side when online
    await signOut();
    router.replace("/(auth)/sign-in");
  };

  return (
    <ScreenScroll>
      <Text variant="h1" tone="primary">
        Account
      </Text>

      <Card style={styles.section}>
        <View style={styles.head}>
          <Text variant="h2" style={{ flex: 1 }}>
            {user?.fullName ?? "Driver"}
          </Text>
          <Badge label={verification.label} tone={verification.tone} />
        </View>
        <Row label="Mobile" value={user?.phone} />
        <Row label="Market" value={`${market.flag} ${market.name}`} />
        <Row label="Works as" value={profile?.fleetId ? "Fleet driver" : "Independent owner-operator"} />
        <Row label="Licence" value={profile?.licenseNumber ? `${profile.licenseNumber} · Class ${profile.licenseClass ?? "—"}` : "—"} />
        <Row label="Completed trips" value={String(profile?.completedTrips ?? 0)} />
      </Card>

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
