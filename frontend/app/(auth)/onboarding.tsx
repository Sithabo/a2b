import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  runOnJS,
} from "react-native-reanimated";
import { Truck, ShieldCheck, MapPin, ChevronRight } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { SafeAreaView } from "react-native-safe-area-context";
import { cn } from "@/components/ui/Button";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SLIDES = [
  {
    id: 1,
    title: "Reliable Logistics",
    description:
      "Connect with trusted drivers and shippers for seamless transport solutions across the country.",
    icon: require("../../assets/logo/a2b.png"),
    color: "#0F3D26", // Forest
  },
  {
    id: 2,
    title: "Secure Payments",
    description:
      "Experience peace of mind with our integrated mobile money and secure payment systems.",
    icon: require("../../assets/logo/a2b.png"),
    color: "#D97706", // Amber
  },
  {
    id: 3,
    title: "Real-time Tracking",
    description:
      "Monitor your cargo in real-time with our advanced GPS tracking features.",
    icon: require("../../assets/logo/a2b.png"),
    color: "#0F3D26", // Forest
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<Animated.ScrollView>(null);
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
    if (currentIndex < SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      // Using standard ScrollView scrollTo method which is reliable on both native and web
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          x: nextIndex * SCREEN_WIDTH,
          y: 0,
          animated: true,
        });
        setCurrentIndex(nextIndex);
      }
    } else {
      router.replace("/(auth)/welcome");
    }
  };

  const handleSkip = () => {
    router.replace("/(auth)/welcome");
  };

  const handleDotPress = (index: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        x: index * SCREEN_WIDTH,
        y: 0,
        animated: true,
      });
      setCurrentIndex(index);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center pb-6">
        {/* Header with Logo */}
        <View className="items-center mt-10 mb-6 flex-row">
          {/* <Image
            source={require("../../assets/logo/a2b.png")}
            style={{ width: 40, height: 40, resizeMode: "contain" }}
          /> */}
          {/* <Text
            className="text-2xl font-bold uppercase tracking-widest ml-2"
            style={{ color: "#0F3D26" }}
          >
            A2B Logistics
          </Text> */}
        </View>

        {/* Carousel */}
        <View className="flex-1 w-full py-10">
          <Animated.ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            className="flex-1"
            contentContainerStyle={{ alignItems: "center" }}
          >
            {SLIDES.map((item) => {
              const Icon = item.icon;
              return (
                <View
                  key={item.id}
                  style={{ width: SCREEN_WIDTH }}
                  className="justify-center items-center px-8"
                >
                  <Image
                    source={item.icon}
                    style={{
                      width: SCREEN_WIDTH - 80,
                      height: 300,
                      resizeMode: "contain",
                    }}
                    className="mb-10"
                  />

                  {/* Content */}
                  <View className="items-center">
                    <Text className="text-5xl font-semibold text-gray-900 mb-3 text-center">
                      {item.title}
                    </Text>

                    <Text className="text-gray-600 leading-relaxed text-center px-4">
                      {item.description}
                    </Text>
                  </View>
                </View>
              );
            })}
          </Animated.ScrollView>
        </View>

        {/* Dot Indicators */}
        <View className="flex-row justify-center gap-2">
          {SLIDES.map((_, index) => (
            <>
              <TouchableOpacity
                key={index}
                onPress={() => handleDotPress(index)}
                style={{
                  height: 8,
                  width: 24,
                  borderRadius: 4,
                  marginVertical: 20,
                  backgroundColor:
                    currentIndex === index ? "#0F3D26" : "#D1D5DB",
                }}
              />
            </>
          ))}
        </View>

        {/* Footer Actions */}
        <View
          className="w-full max-w-sm px-6 gap-6 mb-4"
          style={{ width: "100%" }}
        >
          {/* Next Button */}
          <Button
            title={currentIndex === SLIDES.length - 1 ? "Get Started" : "Next"}
            onPress={handleNext}
            size="lg"
            className="w-full rounded-xl"
            icon={
              currentIndex !== SLIDES.length - 1 ? (
                <ChevronRight size={20} color="#111827" />
              ) : undefined
            }
            iconRight
            style={{ width: "100%" }}
          />

          {/* Skip / Login Button */}
          <Button
            title="Skip"
            variant="ghost"
            onPress={handleSkip}
            className="w-full py-2"
            textClassName="text-gray-600 font-medium"
            style={{ width: "100%" }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
