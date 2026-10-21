import { useState } from "react";
import { Alert, Platform, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Camera, ImageUp } from "lucide-react-native";
import type { Data } from "@a2b/api-client";
import { useDeliverLoad, type UploadFile } from "@a2b/features";
import { Button, Card, colors, radius, SlideToConfirm, spacing, Text, TextField } from "@a2b/ui";

/**
 * Drop-off: who received the cargo and a photo of it. The shipper sees both
 * before giving the release code, so the photo should show the cargo at the
 * destination (and the receiver, if they agree).
 */
export function ProofOfDelivery({ load }: { load: Data.Load }) {
  const [receiverName, setReceiverName] = useState(load.location?.receiverName ?? "");
  const [photo, setPhoto] = useState<UploadFile | null>(null);
  const deliver = useDeliverLoad(load.id);

  const pick = async (source: "camera" | "library") => {
    const permission =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow access so you can add a photo of the delivered cargo.");
      return;
    }
    const options: ImagePicker.ImagePickerOptions = { mediaTypes: ["images"], quality: 0.7 };
    const result =
      source === "camera" ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
    if (result.canceled) return;
    const asset = result.assets[0];
    setPhoto({ uri: asset.uri, name: asset.fileName ?? "delivery.jpg", mimeType: asset.mimeType ?? "image/jpeg" });
  };

  const ready = !!photo && receiverName.trim().length >= 2;

  return (
    <Card style={styles.card}>
      <Text variant="h3">Proof of delivery</Text>
      <Text variant="bodySm" tone="secondary">
        Photograph the cargo where you left it and note who received it. The shipper sees both before releasing your
        payment.
      </Text>

      {photo ? (
        <Image source={{ uri: photo.uri }} style={styles.preview} contentFit="cover" accessibilityLabel="Delivery photo" />
      ) : null}
      <View style={styles.actions}>
        {Platform.OS !== "web" && (
          <Button
            title={photo ? "Retake" : "Take photo"}
            icon={Camera}
            size="md"
            variant={photo ? "secondary" : "primary"}
            onPress={() => pick("camera")}
            style={{ flex: 1 }}
          />
        )}
        <Button
          title={Platform.OS === "web" ? (photo ? "Replace photo" : "Add photo") : "From photos"}
          icon={ImageUp}
          size="md"
          variant="secondary"
          onPress={() => pick("library")}
          style={{ flex: 1 }}
        />
      </View>

      <TextField
        label="Received by"
        value={receiverName}
        onChangeText={setReceiverName}
        placeholder="Name of the person who took the cargo"
        autoCapitalize="words"
      />

      <SlideToConfirm
        label={ready ? "Slide to confirm delivery" : "Add photo and name first"}
        onConfirm={() => photo && deliver.mutate({ receiverName: receiverName.trim(), photo })}
        loading={deliver.isPending}
        disabled={!ready}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  actions: { flexDirection: "row", gap: spacing.sm },
  preview: { width: "100%", aspectRatio: 4 / 3, borderRadius: radius.md, backgroundColor: colors.surfaceSunken },
});
