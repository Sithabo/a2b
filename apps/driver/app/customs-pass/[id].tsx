import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import QRCode from "react-native-qrcode-svg";
import { FileText, X } from "lucide-react-native";
import { getMarket } from "@a2b/core";
import { Card, colors, EmptyState, IconButton, layout, palette, spacing, Text } from "@a2b/ui";
import { API_URL, useSession } from "@/lib/session";
import { useDocuments, useLoad } from "@/lib/queries";

/**
 * Digital customs pass: a QR code identifying the load for gate staff, plus the
 * shipper's cleared documents. Only available once escrow is funded.
 */
export default function CustomsPassScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const loadId = Number(id);
  const load = useLoad(loadId);
  const docs = useDocuments(loadId);
  const token = useSession((s) => s.token);

  const l = load.data;
  const market = l ? getMarket(l.market) : null;
  const catalog = market?.documents ?? [];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text variant="label" color={palette.amber[300]}>
            Digital customs pass
          </Text>
          <Text variant="h2" color={colors.onPrimary}>
            {l?.reference ?? "…"}
          </Text>
        </View>
        <IconButton icon={X} onPress={() => router.back()} accessibilityLabel="Close" />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {l && (
          <Card style={styles.qrCard}>
            <QRCode value={`A2B:${l.reference}`} size={220} />
            <Text variant="h2" align="center">
              {l.reference}
            </Text>
            {l.containerId && (
              <Text variant="bodyStrong" tone="secondary" align="center">
                Container / customs ref: {l.containerId}
              </Text>
            )}
            <Text variant="caption" tone="muted" align="center">
              {market?.customsAuthority} · {l.pickupSummary} → {l.dropoffSummary}
            </Text>
          </Card>
        )}

        <Text variant="h3" color={colors.onPrimary}>
          Cleared documents
        </Text>
        {docs.isSuccess && docs.data.length === 0 && (
          <EmptyState icon={FileText} title="No documents attached" message="This load has no customs documents." />
        )}
        {docs.data?.map((doc) => {
          const label = catalog.find((c) => c.id === doc.requirementId)?.label ?? doc.requirementId;
          const uri = `${API_URL}/api/v1/loads/${loadId}/documents/${doc.id}`;
          return (
            <Card key={doc.id} style={styles.doc}>
              <Text variant="bodyStrong">{label}</Text>
              {doc.mimeType.startsWith("image/") ? (
                <Image
                  source={{ uri, headers: { Authorization: `Bearer ${token ?? ""}` } }}
                  style={styles.scan}
                  contentFit="contain"
                  accessibilityLabel={label}
                />
              ) : (
                <Text variant="caption" tone="muted">
                  {doc.originalName} (PDF — preview not supported yet)
                </Text>
              )}
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: layout.gutter },
  content: { padding: layout.gutter, gap: spacing.lg, paddingBottom: spacing["4xl"] },
  qrCard: { alignItems: "center", gap: spacing.md, paddingVertical: spacing["2xl"] },
  doc: { gap: spacing.md },
  scan: { width: "100%", aspectRatio: 0.75, backgroundColor: palette.gray[100], borderRadius: 8 },
});
