import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { LogOut, Pencil } from "lucide-react-native";
import { getMarket } from "@a2b/core";
import { Button, Card, colors, ScreenScroll, spacing, Text } from "@a2b/ui";
import { SIZE_LABELS } from "@/components/FleetDetailsForm";
import { api, useSession } from "@/lib/session";
import { useFleet } from "@/lib/queries";

export default function AccountScreen() {
  const router = useRouter();
  const user = useSession((s) => s.user);
  const signOut = useSession((s) => s.signOut);
  const fleet = useFleet();
  const market = getMarket(fleet.data?.market ?? user?.market ?? "UG");

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
        <SectionHeader
          title="Fleet"
          editLabel="Edit fleet details"
          onEdit={fleet.data ? () => router.push("/fleet/edit") : undefined}
        />
        <Row label="Company" value={fleet.data?.name} />
        <Row label="Market" value={`${market.flag} ${market.name}`} />
        <Row label="Size" value={fleet.data ? SIZE_LABELS[fleet.data.sizeTier] : undefined} />
        <Row label={`${market.taxId.issuer} TIN`} value={fleet.data?.taxId ?? "Not added"} />
        <Row label="Main corridor" value={fleet.data?.primaryCorridor ?? "—"} />
        <Row label="Address" value={fleet.data?.address ?? "—"} />
      </Card>

      <Card style={styles.section}>
        <SectionHeader title="Owner" editLabel="Edit your profile" onEdit={() => router.push("/account/edit")} />
        <Row label="Name" value={user?.fullName ?? "—"} />
        <Row label="Mobile" value={user?.phone} />
        <Row label="Email" value={user?.email ?? "Not added"} />
      </Card>

      <Button title="Sign out" icon={LogOut} variant="ghost" onPress={handleSignOut} />
    </ScreenScroll>
  );
}

function SectionHeader({ title, editLabel, onEdit }: { title: string; editLabel: string; onEdit?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text variant="label" tone="secondary">
        {title}
      </Text>
      {onEdit ? (
        <Button title="Edit" icon={Pencil} variant="ghost" size="sm" onPress={onEdit} accessibilityLabel={editLabel} />
      ) : null}
    </View>
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
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", minHeight: 40 },
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
