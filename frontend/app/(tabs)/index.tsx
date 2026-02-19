import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Plus, Package } from "lucide-react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TrustBadge } from "@/components/TrustBadge";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Card } from "@/components/Card";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScreenHeader
        title="Hello, Musa Hardware"
        subtitle="Manage your shipments"
      />

      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
        <TrustBadge message="Driver Found for Jinja Load! Payment needed to unlock." />

        <Card>
          <Text className="font-bold text-lg mb-2">Component Demo</Text>
          <Text className="text-gray-500 mb-4">
            Phase 2: Core Shared Components
          </Text>

          <View className="gap-4">
            <PrimaryButton
              title="Post a New Load"
              onPress={() => console.log("Post a Load")}
              icon={Plus}
            />

            <PrimaryButton
              title="Secondary Action"
              variant="secondary"
              onPress={() => console.log("Secondary")}
            />

            <PrimaryButton
              title="Outline Button"
              variant="outline"
              onPress={() => console.log("Outline")}
            />
          </View>
        </Card>

        <View className="flex-row gap-4">
          <Card className="flex-1 items-center py-6">
            <Text className="text-3xl font-bold text-[#0F3D26]">2</Text>
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Active Loads
            </Text>
          </Card>
          <Card className="flex-1 items-center py-6">
            <Text className="text-3xl font-bold text-[#0F3D26]">1</Text>
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pending Load
            </Text>
          </Card>
        </View>

        <Card className="flex-row items-center gap-4">
          <View className="bg-green-100 p-2 rounded-full">
            <Package color="#0F3D26" size={20} />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-gray-900">
              Kampala to Jinja
            </Text>
            <Text className="text-xs text-gray-500">
              Order #2938 • In Transit
            </Text>
          </View>
          <Text className="text-xs font-bold text-gray-400">2h ago</Text>
        </Card>
      </ScrollView>
    </View>
  );
}
