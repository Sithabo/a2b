import React, { useState } from "react";
import { View, Text, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useAnimatedScrollHandler,
  runOnJS,
} from "react-native-reanimated";
import { Truck, Package, ShieldCheck, ArrowRight } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

const ONBOARDING_DATA = [
  {
    id: 1,
    title: "Reliable Logistics",
    description:
      "Connect with trusted drivers and shippers across the country instantly.",
    icon: Truck,
  },
  {
    id: 2,
    title: "Secure Payments",
    description:
      "Your funds are held safely until the delivery is successfully completed.",
    icon: ShieldCheck,
  },
  {
    id: 3,
    title: "Real-time Tracking",
    description: "Monitor your cargo every step of the way with live updates.",
    icon: Package,
  },
];

export default function OnboardingScreen() {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
    onMomentumEnd: (event) => {
      const index = Math.round(event.contentOffset.x / SCREEN_WIDTH);
      runOnJS(setCurrentIndex)(index);
    },
  });

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      // Logic to scroll to next would go here if we had a ref to the scrollView
      // For simplicity in this demo, strictly visual sync isn't forced via button press
      // layout logic normally requires a ref
    } else {
      router.push("/(auth)/welcome");
    }
  };

  const handleSkip = () => {
    router.replace("/(auth)/welcome");
  };

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      {/* Header */}
      <View className="px-6 py-4 flex-row justify-between items-center">
        <Text className="text-xl font-bold text-forest tracking-tighter">
          A2B
        </Text>
        <Button
          title="Skip"
          variant="ghost"
          onPress={handleSkip}
          textClassName="text-forest opacity-60"
          className="px-0 py-0"
        />
      </View>

      {/* Carousel */}
      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        className="flex-1"
      >
        {ONBOARDING_DATA.map((item, index) => (
          <View
            key={item.id}
            style={{ width: SCREEN_WIDTH }}
            className="items-center justify-center p-8"
          >
            <View className="w-full aspect-square bg-forest/5 rounded-full items-center justify-center mb-10 overflow-hidden relative">
              <View className="absolute w-[150%] h-[150%] bg-forest/5 rounded-full -top-[25%] -left-[25%]" />
              <item.icon size={120} color="#0F3D26" />
            </View>

            <View className="gap-3 items-center">
              <Text className="text-3xl font-bold text-forest text-center">
                {item.title}
              </Text>
              <Text className="text-gray-500 text-center leading-6 text-lg px-4">
                {item.description}
              </Text>
            </View>
          </View>
        ))}
      </Animated.ScrollView>

      {/* Footer */}
      <View className="px-6 pb-10 gap-8">
        {/* Pagination Dots */}
        <View className="flex-row justify-center gap-2">
          {ONBOARDING_DATA.map((_, index) => {
            const isActive = index === currentIndex;
            return (
              <View
                key={index}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  isActive ? "w-8 bg-forest" : "w-2 bg-forest/20"
                )}
              />
            );
          })}
        </View>

        {/* Action Button */}
        <Button
          title={
            currentIndex === ONBOARDING_DATA.length - 1 ? "Get Started" : "Next"
          }
          onPress={handleNext}
          size="lg"
          className="shadow-md shadow-forest/20"
          icon={
            currentIndex !== ONBOARDING_DATA.length - 1 && (
              <ArrowRight size={20} color="white" />
            )
          }
        />
      </View>
    </SafeAreaView>
  );
}
