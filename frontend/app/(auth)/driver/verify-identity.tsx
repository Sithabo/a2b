import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Shield } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "@/components/ui/FileUpload";

export default function VerifyIdentityScreen() {
  const router = useRouter();
  const [nationalIdStatus, setNationalIdStatus] = useState<
    "empty" | "completed"
  >("empty");
  const [permitStatus, setPermitStatus] = useState<"empty" | "completed">(
    "empty"
  );
  const [vehicleStatus, setVehicleStatus] = useState<"empty" | "completed">(
    "empty"
  );
  const [isLoading, setIsLoading] = useState(false);

  const mockUpload = (
    setStatus: React.Dispatch<React.SetStateAction<"empty" | "completed">>
  ) => {
    // Simulate upload
    setStatus("completed");
  };

  const handleSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/(auth)/driver/under-review");
    }, 1500);
  };

  const isFormValid =
    nationalIdStatus === "completed" &&
    permitStatus === "completed" &&
    vehicleStatus === "completed";

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      <ScrollView contentContainerClassName="p-6 pb-12">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white items-center justify-center border border-gray-200 mb-6"
        >
          <ArrowLeft size={20} color="#333" />
        </TouchableOpacity>

        <View className="gap-2 mb-8">
          <Text className="text-3xl font-bold text-forest">
            Verify Your Identity
          </Text>
          <Text className="text-gray-500 text-lg">
            Upload the following documents to get started.
          </Text>
        </View>

        <View className="gap-6 mb-10">
          <View className="gap-3">
            <Text className="font-bold text-forest uppercase text-xs tracking-wider">
              Identity
            </Text>
            <FileUpload
              label="National ID"
              description="Front and Back"
              status={nationalIdStatus}
              onPress={() => mockUpload(setNationalIdStatus)}
            />
            <FileUpload
              label="Driving Permit"
              description="Valid permit required"
              status={permitStatus}
              onPress={() => mockUpload(setPermitStatus)}
            />
          </View>

          <View className="gap-3">
            <Text className="font-bold text-forest uppercase text-xs tracking-wider">
              Vehicle
            </Text>
            <FileUpload
              label="Vehicle Photo"
              description="Show license plate clearly"
              status={vehicleStatus}
              onPress={() => mockUpload(setVehicleStatus)}
            />
          </View>
        </View>

        <View className="bg-forest/5 p-4 rounded-xl flex-row gap-3 mb-8 border border-forest/10">
          <Shield size={24} color="#0F3D26" />
          <View className="flex-1">
            <Text className="font-bold text-forest text-sm">
              Secure Verification
            </Text>
            <Text className="text-gray-500 text-xs">
              Your documents are encrypted and only used for verification
              purposes.
            </Text>
          </View>
        </View>

        <Button
          title="Submit Documents"
          size="lg"
          onPress={handleSubmit}
          isLoading={isLoading}
          disabled={!isFormValid}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
