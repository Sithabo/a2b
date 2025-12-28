import { Skeleton } from "@/components/Skeleton";
import { StatusCard } from "@/components/StatusCard";
import {
  CheckCircle,
  Clock,
  DollarSign,
  Lock,
  MapPin,
  User,
} from "lucide-react-native";
import React, { useState } from "react";
import { ScrollView, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Mock Data
const MOCK_JOB = {
  id: "#JOB-2024-88",
  pickup: "123 Forest Avenue, Seattle, WA",
  dropoff: "456 Ivory Lane, Redmond, WA",
  price: "$45.00",
  distance: "12.5 miles",
  duration: "25 mins",
  customer: "Alice Johnson",
};

export default function MyTripScreen() {
  const [isLocked, setIsLocked] = useState(true);

  const toggleState = () => setIsLocked(!isLocked);

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      <ScrollView contentContainerClassName="p-4 pb-20 gap-6">
        {/* Header / Controls */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-forest">My Trip</Text>
          <View className="flex-row items-center gap-2">
            <Text className="text-sm font-medium text-gray-600">
              {isLocked ? "Locked" : "Unlocked"} Mode
            </Text>
            <Switch
              value={!isLocked}
              onValueChange={toggleState}
              trackColor={{ false: "#D97706", true: "#0F3D26" }}
            />
          </View>
        </View>

        {/* Status Card */}
        <StatusCard
          variant={isLocked ? "locked" : "unlocked"}
          title={isLocked ? "WAITING FOR FUNDS" : "RIDE CONFIRMED"}
          icon={isLocked ? Clock : CheckCircle}
        >
          <View className="gap-6">
            {/* Price Section */}
            <View className="flex-row justify-between items-center border-b border-gray-200 pb-4">
              <View className="flex-row items-center gap-2">
                <DollarSign size={20} color="#0F3D26" />
                <Text className="text-forest font-semibold text-lg">
                  Earnings
                </Text>
              </View>
              {isLocked ? (
                <Skeleton width={80} height={28} className="rounded-md" />
              ) : (
                <Text className="text-2xl font-bold text-forest">
                  {MOCK_JOB.price}
                </Text>
              )}
            </View>

            {/* Route Details */}
            <View className="gap-4">
              {/* Pickup */}
              <View className="flex-row gap-3">
                <View className="mt-1">
                  <MapPin size={20} color="#D97706" />
                </View>
                <View className="flex-1 gap-1">
                  <Text className="text-xs uppercase text-gray-500 font-bold tracking-wider">
                    Pickup
                  </Text>
                  {isLocked ? (
                    <View className="gap-2">
                      <Skeleton width="80%" height={24} />
                    </View>
                  ) : (
                    <Text className="text-lg text-gray-900 font-medium">
                      {MOCK_JOB.pickup}
                    </Text>
                  )}
                </View>
              </View>

              {/* Connector Line */}
              <View className="ml-[9px] h-6 w-0.5 bg-gray-300" />

              {/* Dropoff */}
              <View className="flex-row gap-3">
                <View className="mt-1">
                  <MapPin size={20} color="#0F3D26" />
                </View>
                <View className="flex-1 gap-1">
                  <Text className="text-xs uppercase text-gray-500 font-bold tracking-wider">
                    Dropoff
                  </Text>
                  {isLocked ? (
                    <View className="gap-2">
                      <Skeleton width="60%" height={24} />
                    </View>
                  ) : (
                    <Text className="text-lg text-gray-900 font-medium">
                      {MOCK_JOB.dropoff}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Additional Info */}
            <View className="bg-white/50 p-3 rounded-lg flex-row gap-4 border border-gray-100">
              <View className="flex-1 gap-1">
                <View className="flex-row items-center gap-1">
                  <Clock size={14} color="#666" />
                  <Text className="text-xs text-gray-500">Duration</Text>
                </View>
                {isLocked ? (
                  <Skeleton width={60} height={20} />
                ) : (
                  <Text className="font-semibold text-forest">
                    {MOCK_JOB.duration}
                  </Text>
                )}
              </View>

              <View className="flex-1 gap-1">
                <View className="flex-row items-center gap-1">
                  <User size={14} color="#666" />
                  <Text className="text-xs text-gray-500">Customer</Text>
                </View>
                {isLocked ? (
                  <Skeleton width={80} height={20} />
                ) : (
                  <Text className="font-semibold text-forest">
                    {MOCK_JOB.customer}
                  </Text>
                )}
              </View>
            </View>

            {/* Footer Message */}
            {isLocked && (
              <View className="bg-amber/10 p-3 rounded-lg flex-row items-center gap-2 border border-amber/20">
                <Lock size={16} color="#D97706" />
                <Text className="text-amber-700 text-sm font-medium">
                  Details hidden until payment is secured.
                </Text>
              </View>
            )}
          </View>
        </StatusCard>
      </ScrollView>
    </SafeAreaView>
  );
}
