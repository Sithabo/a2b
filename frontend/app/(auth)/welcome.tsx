import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Truck } from "lucide-react-native"; // Assuming user icon is available, or use generic
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-ivory justify-between">
      <View className="flex-1 items-center justify-center p-6 gap-8">
        <View className="items-center gap-2">
          <View className="w-20 h-20 bg-forest rounded-2xl items-center justify-center mb-4">
            <Text className="text-4xl font-bold text-white">A2B</Text>
          </View>
          <Text className="text-3xl font-bold text-forest text-center">
            Welcome to A2B
          </Text>
          <Text className="text-gray-500 text-center text-lg">
            Choose how you want to use the app
          </Text>
        </View>

        <View className="w-full gap-4">
          <Button
            title="I'm a Driver"
            variant="outline"
            size="lg"
            className="justify-between px-6 bg-white border-2 border-forest/10 hover:border-forest"
            textClassName="text-forest font-bold text-lg"
            onPress={() =>
              router.push({
                pathname: "/(auth)/login",
                params: { role: "driver" },
              })
            }
            icon={<Truck size={24} color="#0F3D26" />}
          />

          <Button
            title="I'm a Shipper"
            variant="outline"
            size="lg"
            className="justify-between px-6 bg-white border-2 border-forest/10 hover:border-forest"
            textClassName="text-forest font-bold text-lg"
            onPress={() =>
              router.push({
                pathname: "/(auth)/login",
                params: { role: "shipper" },
              })
            }
            // using Truck as placeholder, ideally User or Box icon
            icon={
              <View className="w-6 h-6 rounded-full bg-forest/20 items-center justify-center">
                <View className="w-3 h-3 bg-forest rounded-full" />
              </View>
            }
          />
        </View>
      </View>

      <View className="p-6 gap-4">
        <Text className="text-center text-gray-500">
          Already have an account?
        </Text>
        <Button
          title="Log In"
          variant="primary"
          size="lg"
          onPress={() => router.push("/(auth)/login")}
        />
      </View>
    </SafeAreaView>
  );
}
