import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function AccountScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Account</Text>
        <Text style={[styles.subtitle, { color: theme.gray[500] }]}>
          Your profile and settings
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.placeholderText, { color: theme.text }]}>
          User Profile Phase 5
        </Text>

        <View style={styles.buttonContainer}>
          <Link href="/" asChild>
            <TouchableOpacity
              style={[styles.linkButton, { borderColor: theme.primary }]}
            >
              <Text style={{ color: theme.primary }}>Back to Home</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 18,
    marginBottom: 32,
    fontWeight: "600",
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  linkButton: {
    width: "100%",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
});
