import React, { useState, useRef } from "react";
import {
  View,
  Pressable,
  Dimensions,
  Image,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  runOnJS,
} from "react-native-reanimated";
import { ChevronRight } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "@/lib/session";
import { Button, colors, radius, spacing, Text } from "@a2b/ui";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SLIDES = [
  {
    id: 1,
    title: "Reliable Logistics",
    description:
      "Connect with trusted drivers and shippers for seamless transport solutions across the country.",
    icon: require("../../assets/logo/a2b.png"),
    color: colors.primary, // Forest
  },
  {
    id: 2,
    title: "Secure Payments",
    description:
      "Experience peace of mind with our integrated mobile money and secure payment systems.",
    icon: require("../../assets/logo/a2b.png"),
    color: colors.accent, // Amber
  },
  {
    id: 3,
    title: "Real-time Tracking",
    description:
      "Monitor your cargo in real-time with our advanced GPS tracking features.",
    icon: require("../../assets/logo/a2b.png"),
    color: colors.primary, // Forest
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const completeOnboarding = useSession((s) => s.completeOnboarding);
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
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          x: nextIndex * SCREEN_WIDTH,
          y: 0,
          animated: true,
        });
        setCurrentIndex(nextIndex);
      }
    } else {
      completeOnboarding();
      router.replace("/(auth)/welcome");
    }
  };

  const handleSkip = () => {
    completeOnboarding();
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header with Logo */}
        <View style={styles.header} />

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
                <Image source={item.icon} style={styles.image} height={200} width={200}/>

                {/* Content */}
                <View style={styles.contentContainer}>
                  <Text variant="display" tone="primary" align="center" style={styles.title}>
                    {item.title}
                  </Text>

                  <Text tone="secondary" align="center" style={styles.description}>
                    {item.description}
                  </Text>
                </View>
              </View>
            ))}
          </Animated.ScrollView>
        </View>

        {/* Dot Indicators */}
        <View style={styles.dotsContainer}>
          {SLIDES.map((_, index) => (
            <Pressable
              key={index}
              accessibilityRole="button"
              accessibilityLabel={`Go to slide ${index + 1} of ${SLIDES.length}`}
              accessibilityState={{ selected: currentIndex === index }}
              hitSlop={styles.dotHitSlop}
              onPress={() => handleDotPress(index)}
              style={({ pressed }) => [
                styles.dot,
                {
                  backgroundColor:
                    currentIndex === index
                      ? colors.primary
                      : colors.borderStrong,
                },
                pressed && styles.pressed,
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
            fullWidth
            icon={currentIndex !== SLIDES.length - 1 ? ChevronRight : undefined}
            iconPosition="right"
          />

          {/* Skip Button */}
          <Button
            title="Skip"
            variant="ghost"
            onPress={handleSkip}
            fullWidth
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: spacing['2xl'],
  },
  header: {
    alignItems: "center",
    marginTop: spacing['4xl'],
    marginBottom: spacing['2xl'],
    flexDirection: "row",
  },
  carouselContainer: {
    flex: 1,
    width: "100%",
    paddingVertical: spacing['4xl'],
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
    paddingHorizontal: spacing['3xl'],
  },
  image: {
    width: SCREEN_WIDTH - 80,
    height: SCREEN_WIDTH - 80,
    resizeMode: "contain",
    marginBottom: spacing['4xl'],
  },
  contentContainer: {
    alignItems: "center",
  },
  title: {
    marginBottom: spacing.md,
  },
  description: {
    paddingHorizontal: spacing.lg,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
    marginBottom: spacing['2xl'], // moved dots to be above footer in flow logic
  },
  dot: {
    height: 8,
    width: 24,
    borderRadius: radius.pill,
    marginVertical: spacing.xl,
  },
  // Dots are 24x8; extend the touch target to 48pt tall without overlapping neighbours.
  dotHitSlop: {
    top: spacing.xl,
    bottom: spacing.xl,
    left: spacing.xs,
    right: spacing.xs,
  },
  pressed: {
    opacity: 0.85,
  },
  footer: {
    width: "100%",
    maxWidth: 384, // max-w-sm approx
    paddingHorizontal: spacing['2xl'],
    gap: spacing['2xl'],
    marginBottom: spacing.lg,
  },
});
