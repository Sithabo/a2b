import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Button } from "@/components/ui/Button";

export default function VerifyOtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = () => {
    setIsLoading(true);

    // Simulate API Verification
    setTimeout(() => {
      setIsLoading(false);

      const role = params.role;

      if (role === "driver") {
        router.push("/(auth)/driver/verify-identity");
      } else {
        router.replace("/(tabs)");
      }
    }, 1500);
  };

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 p-6"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white items-center justify-center border border-gray-200 mb-8"
        >
          <ArrowLeft size={20} color="#333" />
        </TouchableOpacity>

        <View className="gap-2 mb-10">
          <Text className="text-3xl font-bold text-forest">
            Verification Code
          </Text>
          <Text className="text-gray-500 text-lg">
            We sent a code to +256 {params.phone || "*******"}.
          </Text>
        </View>

        <View className="gap-8">
          <View className="gap-2">
            <Text className="font-semibold text-forest ml-1">Enter Code</Text>
            <TextInput
              placeholder="000000"
              placeholderTextColor="#9CA3AF"
              className="bg-white border border-gray-200 rounded-xl px-4 h-16 text-center text-3xl font-bold tracking-[10px] text-gray-900 focus:border-forest"
              keyboardType="number-pad"
              value={otp}
              onChangeText={setOtp}
              maxLength={6}
              autoFocus
            />
          </View>

          <Button
            title="Verify & Continue"
            size="lg"
            onPress={handleVerify}
            isLoading={isLoading}
            disabled={otp.length < 6}
          />
        </View>

        <TouchableOpacity className="items-center mt-6">
          <Text className="text-forest font-semibold">Resend Code</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
