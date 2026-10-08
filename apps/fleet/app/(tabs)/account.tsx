import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { LogOut } from "lucide-react-native";
import { getMarket } from "@a2b/core";
import { Button, Card, colors, spacing, Text } from "@a2b/ui";
import { ScreenScroll } from "@/components/ScreenScroll";
import { api, useSession } from "@/lib/session";
import { useFleet } from "@/lib/queries";

const SIZE_LABELS = { "1-5": "1–5 trucks", "6-20": "6–20 trucks", "20+": "20+ trucks" } as const;

export default function AccountScreen() {
  const router = useRouter();
  const user = useSession((s) => s.user);
  const signOut = useSession((s) => s.signOut);
  const fleet = useFleet();
  const market = getMarket(fleet.data?.market ?? user?.market ?? "UG");

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
        <Text variant="label" tone="secondary">
          Fleet
        </Text>
        <Row label="Company" value={fleet.data?.name} />
        <Row label="Market" value={`${market.flag} ${market.name}`} />
        <Row label="Size" value={fleet.data ? SIZE_LABELS[fleet.data.sizeTier] : undefined} />
        <Row label={`${market.taxId.issuer} TIN`} value={fleet.data?.taxId ?? "Not added"} />
        <Row label="Main corridor" value={fleet.data?.primaryCorridor ?? "—"} />
        <Row label="Address" value={fleet.data?.address ?? "—"} />
      </Card>

      <Card style={styles.section}>
        <Text variant="label" tone="secondary">
          Owner
        </Text>
        <Row label="Mobile" value={user?.phone} />
        <Row label="Name" value={user?.fullName ?? "—"} />
      </Card>

      <Button title="Sign out" icon={LogOut} variant="ghost" onPress={handleSignOut} />
    </ScreenScroll>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <View style={styles.row}>
      <Text tone="secondary">{label}</Text>
      <Text variant="bodyStrong" style={styles.value} numberOfLines={2}>
        {value ?? "—"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
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
