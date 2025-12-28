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
import {
  ArrowLeft,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
} from "lucide-react-native";
import { Button } from "@/components/ui/Button";

export default function SignUpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.replace("/(tabs)");
    }, 1500);
  };

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView contentContainerClassName="flex-grow p-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white items-center justify-center border border-gray-200 mb-6"
          >
            <ArrowLeft size={20} color="#333" />
          </TouchableOpacity>

          <View className="gap-2 mb-8">
            <Text className="text-3xl font-bold text-forest">
              Create Account
            </Text>
            <Text className="text-gray-500 text-lg">
              Start your journey as a {params.role || "user"}.
            </Text>
          </View>

          <View className="gap-5">
            {/* Full Name */}
            <View className="gap-2">
              <Text className="font-semibold text-forest ml-1">Full Name</Text>
              <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 h-14 focus-within:border-forest">
                <User size={20} color="#9CA3AF" />
                <TextInput
                  placeholder="John Doe"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-3 text-base text-gray-900"
                />
              </View>
            </View>

            {/* Email */}
            <View className="gap-2">
              <Text className="font-semibold text-forest ml-1">
                Email Address
              </Text>
              <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 h-14 focus-within:border-forest">
                <Mail size={20} color="#9CA3AF" />
                <TextInput
                  placeholder="john@example.com"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-3 text-base text-gray-900"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Phone */}
            <View className="gap-2">
              <Text className="font-semibold text-forest ml-1">
                Phone Number
              </Text>
              <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 h-14 focus-within:border-forest">
                <Phone size={20} color="#9CA3AF" />
                <TextInput
                  placeholder="+1 234 567 8900"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-3 text-base text-gray-900"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Password */}
            <View className="gap-2">
              <Text className="font-semibold text-forest ml-1">Password</Text>
              <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 h-14 focus-within:border-forest">
                <Lock size={20} color="#9CA3AF" />
                <TextInput
                  placeholder="Create a password"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-3 text-base text-gray-900"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#9CA3AF" />
                  ) : (
                    <Eye size={20} color="#9CA3AF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <Button
              title="Create Account"
              size="lg"
              onPress={handleSignUp}
              isLoading={isLoading}
              className="mt-6"
            />
          </View>

          <View className="flex-1 justify-end items-center mt-8 pb-4">
            <View className="flex-row gap-1">
              <Text className="text-gray-500">Already have an account?</Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                <Text className="font-bold text-forest">Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
