import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { Clock } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UnderReviewScreen() {
  const router = useRouter();

  const handleBackToHome = () => {
    // Navigate back to the very start or handle accordingly
    router.dismissAll();
    router.replace("/(auth)/welcome");
  };

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      <View className="flex-1 items-center justify-center p-8 gap-8">
        <View className="w-32 h-32 rounded-full bg-amber/10 items-center justify-center mb-4 border-4 border-amber/20">
          <Clock size={64} color="#D97706" />
        </View>

        <View className="items-center gap-3">
          <Text className="text-3xl font-bold text-forest text-center">
            Account Under Review
          </Text>
          <Text className="text-gray-500 text-center text-lg leading-7">
            We're verifying your documents. This usually takes{" "}
            <Text className="font-bold text-forest">24-48 hours</Text>.
          </Text>
        </View>

        <View className="bg-amber/10 p-5 rounded-xl border border-amber/20 w-full">
          <Text className="text-amber-800 text-center font-medium">
            You cannot accept jobs yet. We'll send you an SMS when you're
            approved.
          </Text>
        </View>

        <View className="pt-10 w-full gap-4">
          <View className="items-center">
            <Text className="text-gray-400 font-bold mb-1">Questions?</Text>
            <Text className="text-forest text-lg font-bold">
              Call: 0800 123 456
            </Text>
          </View>

          <Button
            title="Back to Home"
            variant="ghost"
            onPress={handleBackToHome}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
