import { useState } from "react";
import { Alert, Platform, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Camera, CheckCircle2, Circle, ImageUp, ShieldCheck } from "lucide-react-native";
import { apiErrorMessage } from "@a2b/api-client";
import { getMarket, type DriverDocumentRequirement } from "@a2b/core";
import { QueryFallback } from "@a2b/features";
import { Badge, Button, Card, colors, ScreenHeader, ScreenScroll, spacing, Text } from "@a2b/ui";
import { useDriverDocuments, useUploadDriverDocument } from "@/lib/queries";
import { useSession } from "@/lib/session";

/** Upload licence and ID photos and follow the review. */
export default function VerificationScreen() {
  const router = useRouter();
  const user = useSession((s) => s.user);
  const documents = useDriverDocuments();
  const upload = useUploadDriverDocument();
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const pick = async (requirement: DriverDocumentRequirement, source: "camera" | "library") => {
    const permission =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        source === "camera" ? "Allow camera access to photograph your document." : "Allow photo access to choose a picture."
      );
      return;
    }
    const options: ImagePicker.ImagePickerOptions = { mediaTypes: ["images"], quality: 0.8 };
    const result =
      source === "camera" ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
    if (result.canceled) return;

    const asset = result.assets[0];
    setUploadingId(requirement.id);
    upload.mutate(
      {
        requirementId: requirement.id,
        file: { uri: asset.uri, name: asset.fileName ?? `${requirement.id}.jpg`, mimeType: asset.mimeType ?? "image/jpeg" },
      },
      {
        onError: (err) => Alert.alert("Upload failed", apiErrorMessage(err)),
        onSettled: () => setUploadingId(null),
      }
    );
  };

  const header = <ScreenHeader title="Get verified" onBackPress={() => router.back()} />;
  const profile = user?.driverProfile;
  if (!documents.data || !profile || !user) {
    return (
      <>
        {header}
        <QueryFallback error={documents.error} onRetry={() => documents.refetch()} />
      </>
    );
  }

  const requirements = getMarket(user.market).driverDocuments;
  const uploaded = new Map(documents.data.map((d) => [d.requirementId, d]));
  const missing = requirements.filter((r) => !uploaded.has(r.id)).length;

  return (
    <>
      {header}
      <ScreenScroll edges={["bottom"]}>
        <StatusCard
          status={profile.verificationStatus}
          submitted={!!profile.submittedAt}
          missing={missing}
          note={profile.reviewNote}
        />

        {!profile.licenseNumber && (
          <Card style={styles.section}>
            <Text variant="bodyStrong">Add your licence number</Text>
            <Text variant="bodySm" tone="secondary">
              Staff check your photos against it.
            </Text>
            <Button title="Add licence details" variant="secondary" size="md" onPress={() => router.push("/profile-setup")} />
          </Card>
        )}

        {requirements.map((requirement) => {
          const document = uploaded.get(requirement.id);
          const isUploading = uploadingId === requirement.id;
          return (
            <Card key={requirement.id} style={styles.section}>
              <View style={styles.row}>
                {document ? (
                  <CheckCircle2 size={22} color={colors.success} accessibilityLabel="Uploaded" />
                ) : (
                  <Circle size={22} color={colors.borderStrong} accessibilityLabel="Not uploaded" />
                )}
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="bodyStrong">{requirement.label}</Text>
                  <Text variant="caption" tone="muted">
                    {requirement.issuer}
                  </Text>
                </View>
              </View>
              <Text variant="bodySm" tone="secondary">
                {requirement.hint}
              </Text>
              <View style={styles.actions}>
                {Platform.OS !== "web" && (
                  <Button
                    title={document ? "Retake" : "Take photo"}
                    icon={Camera}
                    size="md"
                    variant={document ? "secondary" : "primary"}
                    onPress={() => pick(requirement, "camera")}
                    loading={isUploading}
                    disabled={!!uploadingId && !isUploading}
                    style={{ flex: 1 }}
                  />
                )}
                <Button
                  title={Platform.OS === "web" ? (document ? "Replace" : "Upload") : "From photos"}
                  icon={ImageUp}
                  size="md"
                  variant="secondary"
                  onPress={() => pick(requirement, "library")}
                  loading={Platform.OS === "web" && isUploading}
                  disabled={!!uploadingId}
                  style={{ flex: 1 }}
                />
              </View>
            </Card>
          );
        })}
      </ScreenScroll>
    </>
  );
}

function StatusCard({
  status,
  submitted,
  missing,
  note,
}: {
  status: "PENDING" | "VERIFIED" | "REJECTED";
  submitted: boolean;
  missing: number;
  note: string | null;
}) {
  if (status === "VERIFIED") {
    return (
      <Card style={[styles.section, styles.success]}>
        <View style={styles.row}>
          <ShieldCheck size={22} color={colors.success} />
          <Text variant="h3" style={{ flex: 1 }}>
            You&apos;re verified
          </Text>
        </View>
        <Text variant="bodySm" tone="secondary">
          You can accept loads on your own. Replacing a document sends it for a quick re-check.
        </Text>
      </Card>
    );
  }
  if (status === "REJECTED") {
    return (
      <Card style={[styles.section, styles.danger]}>
        <Badge label="Not accepted" tone="danger" />
        <Text variant="bodyStrong">{note ?? "We couldn't verify your documents."}</Text>
        <Text variant="bodySm" tone="secondary">
          Upload new photos of the documents below and we&apos;ll check them again.
        </Text>
      </Card>
    );
  }
  return (
    <Card style={[styles.section, styles.pending]}>
      <Badge label={submitted ? "Under review" : `${missing} to upload`} tone="warning" dot />
      <Text variant="bodySm" color={colors.text}>
        {submitted
          ? "Staff are checking your documents. We'll text you when it's done."
          : "Upload clear photos of each document. Until you're verified you can take jobs your fleet dispatches to you."}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  actions: { flexDirection: "row", gap: spacing.sm },
  success: { backgroundColor: colors.successMuted, borderColor: colors.successMuted },
  danger: { backgroundColor: colors.dangerMuted, borderColor: colors.dangerMuted },
  pending: { backgroundColor: colors.warningMuted, borderColor: colors.warningMuted },
});
