import { Alert, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import type { UploadFile } from "@a2b/features";

async function launch(source: "camera" | "library"): Promise<UploadFile | null> {
  const permission =
    source === "camera"
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert(
      "Permission needed",
      source === "camera" ? "Allow camera access to take your photo." : "Allow photo access to choose a picture."
    );
    return null;
  }
  const options: ImagePicker.ImagePickerOptions = { mediaTypes: ["images"], quality: 0.7, allowsEditing: true, aspect: [1, 1] };
  const result =
    source === "camera" ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
  if (result.canceled) return null;
  const asset = result.assets[0];
  return { uri: asset.uri, name: asset.fileName ?? "photo.jpg", mimeType: asset.mimeType ?? "image/jpeg" };
}

/** Profile photo from the camera or the photo library (library only on web). */
export function pickProfilePhoto(): Promise<UploadFile | null> {
  if (Platform.OS === "web") return launch("library");
  return new Promise((resolve) =>
    Alert.alert(
      "Profile photo",
      undefined,
      [
        { text: "Take photo", onPress: () => resolve(launch("camera")) },
        { text: "Choose from photos", onPress: () => resolve(launch("library")) },
        { text: "Cancel", style: "cancel", onPress: () => resolve(null) },
      ],
      { cancelable: true, onDismiss: () => resolve(null) }
    )
  );
}
