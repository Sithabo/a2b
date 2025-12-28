import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Button } from "@/components/ui/Button";

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (method: "momo" | "sms") => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Pass the method and role to the next screen
      router.push({
        pathname: "/(auth)/verify-otp",
        params: { role: params.role, method, phone: phoneNumber },
      });
    }, 1000);
  };

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView contentContainerClassName="flex-grow p-6">
          {/* Header */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white items-center justify-center border border-gray-200 mb-8"
          >
            <ArrowLeft size={20} color="#333" />
          </TouchableOpacity>

          <View className="gap-2 mb-10">
            <Text className="text-3xl font-bold text-forest py-2">
              Enter Your Phone
            </Text>
            <Text className="text-gray-500 text-lg">
              Verify with MTN MoMo or SMS to continue as a{" "}
              {params.role || "user"}.
            </Text>
          </View>

          {/* Form */}
          <View className="gap-6">
            {/* Phone Input */}
            <View className="gap-2">
              <Text className="font-semibold text-forest ml-1">
                Phone Number
              </Text>
              <View className="flex-row items-center bg-white border border-gray-200 rounded-xl overflow-hidden h-14 focus-within:border-forest px-4">
                <View className="bg-gray-100 h-full justify-center px-3 mr-2 -ml-4 border-r border-gray-200">
                  <Text className="text-gray-600 font-bold">+256</Text>
                </View>
                <TextInput
                  placeholder="700 000 000"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 text-lg text-gray-900 font-medium"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  maxLength={9}
                />
              </View>
            </View>

            <View className="gap-4 mt-4">
              {/* MTN MoMo Button - Using custom yellow color #FFCC00 (MTN Brand ish) or Amber */}
              <Button
                title="MTN MoMo"
                size="lg"
                onPress={() => handleLogin("momo")}
                className="bg-[#FFCC00] border-[#FFCC00]"
                textClassName="text-black font-bold"
                isLoading={isLoading}
                // Placeholder for MTN logo if we had one
                // icon={<Image source={...} />}
              />

              <Button
                title="Send SMS Code"
                variant="primary"
                size="lg"
                onPress={() => handleLogin("sms")}
                isLoading={isLoading}
                className="bg-gray-600 border-gray-600"
              />
            </View>
          </View>

          <View className="flex-1 justify-end items-center mt-10 pb-6 gap-2">
            <Text className="text-center text-xs text-gray-400 px-10">
              By continuing, you agree to our Terms of Service & Privacy Policy
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
