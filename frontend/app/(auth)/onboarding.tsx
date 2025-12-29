import React, { useState, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  TouchableOpacity,
  Dimensions,
  Image,
  StyleSheet,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  runOnJS,
} from "react-native-reanimated";
import { ChevronRight } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";

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

  const handleNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          x: nextIndex * SCREEN_WIDTH,
          y: 0,
          animated: true,
        });
        setCurrentIndex(nextIndex);
      }
    } else {
      try {
        await AsyncStorage.setItem("hasLaunched", "true");
        router.replace("/(auth)/welcome");
      } catch (error) {
        console.error("Error saving onboarding status:", error);
        router.replace("/(auth)/welcome");
      }
    }
  };

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem("hasLaunched", "true");
      router.replace("/(auth)/welcome");
    } catch (error) {
      console.error("Error saving onboarding status:", error);
      router.replace("/(auth)/welcome");
    }
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header with Logo */}
        <View style={styles.header}>
          {/* Logo/Header content removed in previous edits, keeping empty/minimal as per user preference which evolved to showing generic header or nothing */}
        </View>

        {/* Carousel */}
        <View style={styles.carouselContainer}>
          <Animated.ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            {SLIDES.map((item) => (
              <View key={item.id} style={styles.slide}>
                <Image source={item.icon} style={styles.image} />

                {/* Content */}
                <View style={styles.contentContainer}>
                  <ThemedText type="title" style={styles.title}>
                    {item.title}
                  </ThemedText>

                  <ThemedText style={styles.description}>
                    {item.description}
                  </ThemedText>
                </View>
              </View>
            ))}
          </Animated.ScrollView>
        </View>

        {/* Dot Indicators */}
        <View style={styles.dotsContainer}>
          {SLIDES.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleDotPress(index)}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    currentIndex === index
                      ? Colors.light.primary
                      : Colors.light.gray[300],
                },
              ]}
            />
          ))}
        </View>

        {/* Footer Actions */}
        <View style={styles.footer}>
          {/* Next Button */}
          <Button
            title={currentIndex === SLIDES.length - 1 ? "Get Started" : "Next"}
            onPress={handleNext}
            size="lg"
            style={styles.fullWidth}
            icon={
              currentIndex !== SLIDES.length - 1 ? (
                <ChevronRight size={20} color={Colors.light.gray[900]} />
              ) : undefined
            }
            iconRight
          />

          {/* Skip Button */}
          <Button
            title="Skip"
            variant="ghost"
            onPress={handleSkip}
            style={styles.skipButton}
            textStyle={styles.skipText}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 24,
  },
  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 24,
    flexDirection: "row",
  },
  carouselContainer: {
    flex: 1,
    width: "100%",
    paddingVertical: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
  },
  slide: {
    width: SCREEN_WIDTH,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  image: {
    width: SCREEN_WIDTH - 80,
    height: 300,
    resizeMode: "contain",
    marginBottom: 40,
  },
  contentContainer: {
    alignItems: "center",
  },
  title: {
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    textAlign: "center",
    paddingHorizontal: 16,
    color: Colors.light.gray[600],
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24, // moved dots to be above footer in flow logic
  },
  dot: {
    height: 8,
    width: 24,
    borderRadius: 4,
    marginVertical: 20,
  },
  footer: {
    width: "100%",
    maxWidth: 384, // max-w-sm approx
    paddingHorizontal: 24,
    gap: 24,
    marginBottom: 16,
  },
  fullWidth: {
    width: "100%",
    borderRadius: 12, // rounded-xl
  },
  skipButton: {
    width: "100%",
    paddingVertical: 8,
  },
  skipText: {
    color: Colors.light.gray[600],
    fontWeight: "500",
  },
});
