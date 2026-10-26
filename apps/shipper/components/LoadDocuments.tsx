import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { FileText, X } from "lucide-react-native";
import { getMarket } from "@a2b/core";
import type { Data } from "@a2b/api-client";
import { AuthImage } from "@a2b/features";
import { Card, colors, IconButton, layout, palette, radius, spacing, Text } from "@a2b/ui";
import { api } from "@/lib/session";
import { loadKeys, type Load } from "@/lib/loads";

type LoadDocument = Data.LoadDocument;

/** "820 KB", "1.4 MB" */
function sizeLabel(bytes: number) {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/**
 * The customs documents the shipper uploaded for an import load, as the API
 * stores them. Renders nothing for domestic loads or while there are none.
 */
export function LoadDocuments({
  load,
  style,
}: {
  load: Pick<Load, "id" | "isImport" | "market">;
  style?: StyleProp<ViewStyle>;
}) {
  const insets = useSafeAreaInsets();
  const [viewing, setViewing] = useState<{ doc: LoadDocument; label: string } | null>(null);

  const { data: documents } = useQuery({
    queryKey: [...loadKeys.detail(load.id), "documents"],
    enabled: load.isImport,
    queryFn: async () => (await api.loadDocuments.index({ params: { id: load.id } })).data,
  });

  if (!load.isImport || !documents?.length) return null;

  const catalog = getMarket(load.market).documents;
  const pathOf = (doc: LoadDocument) => `loads/${load.id}/documents/${doc.id}`;

  return (
    <View style={[styles.section, style]}>
      <Text variant="h3">Documents</Text>
      <Card padding="none">
        {documents.map((doc, index) => {
          const label = catalog.find((entry) => entry.id === doc.requirementId)?.label ?? doc.requirementId;
          const isImage = doc.mimeType.startsWith("image/");
          return (
            <Pressable
              key={doc.id}
              accessibilityRole={isImage ? "button" : undefined}
              accessibilityLabel={isImage ? `${label}. View scan` : `${label}, ${doc.originalName}`}
              disabled={!isImage}
              onPress={() => setViewing({ doc, label })}
              style={({ pressed }) => [
                styles.row,
                index > 0 && styles.rowDivider,
                pressed && styles.pressed,
              ]}
            >
              {isImage ? (
                <AuthImage path={pathOf(doc)} style={styles.thumbnail} accessibilityLabel={label} />
              ) : (
                <View style={[styles.thumbnail, styles.fileIcon]}>
                  <FileText size={20} color={colors.textMuted} />
                </View>
              )}
              <View style={styles.rowText}>
                <Text variant="bodyStrong">{label}</Text>
                <Text variant="caption" tone="muted" numberOfLines={1}>
                  {isImage ? doc.originalName : `PDF · ${doc.originalName}`} · {sizeLabel(doc.sizeBytes)}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </Card>

      {/* Full-size scan */}
      <Modal
        animationType="slide"
        visible={!!viewing}
        onRequestClose={() => setViewing(null)}
      >
        <View style={[styles.viewer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <View style={styles.viewerHeader}>
            <Text variant="h3" tone="inverse" style={styles.viewerTitle} numberOfLines={1}>
              {viewing?.label}
            </Text>
            <IconButton icon={X} accessibilityLabel="Close" onPress={() => setViewing(null)} />
          </View>
          {viewing && (
            <AuthImage
              path={pathOf(viewing.doc)}
              style={styles.viewerImage}
              contentFit="contain"
              accessibilityLabel={viewing.label}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    padding: spacing.lg,
    minHeight: layout.touchMin,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  pressed: {
    opacity: 0.85,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSunken,
  },
  fileIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: {
    flex: 1,
    gap: spacing.xxs,
  },
  viewer: {
    flex: 1,
    backgroundColor: palette.gray[900],
  },
  viewerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.gray[800],
  },
  viewerTitle: {
    flex: 1,
  },
  viewerImage: {
    flex: 1,
    margin: layout.gutter,
  },
});
