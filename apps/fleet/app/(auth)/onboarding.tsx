import { useRef, useState } from "react";
import { FlatList, StyleSheet, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowRight, Banknote, Truck, Users, type LucideIcon } from "lucide-react-native";
import { Badge, Button, colors, layout, radius, spacing, Text } from "@a2b/ui";
import { useSession } from "@/lib/session";

const SLIDES: { icon: LucideIcon; eyebrow: string; title: string; body: string }[] = [
  {
    icon: Truck,
    eyebrow: "Your fleet",
    title: "Every truck in one place",
    body: "See which trucks are on a load, which are idle and which are in the workshop — and what each one has earned.",
  },
  {
    icon: Users,
    eyebrow: "Your drivers",
    title: "Dispatch with one tap",
    body: "Pick an open load, choose the truck and driver, and the driver gets the job with pickup details once it's paid for.",
  },
  {
    icon: Banknote,
    eyebrow: "Guaranteed pay",
    title: "Paid through escrow",
    body: "Shippers fund every load before pickup. The money is released to your account when the cargo is delivered.",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const list = useRef<FlatList>(null);
  const completeOnboarding = useSession((s) => s.completeOnboarding);

  const finish = () => {
    completeOnboarding();
    router.replace("/(auth)/sign-in");
  };

  const next = () => {
    if (index === SLIDES.length - 1) return finish();
    list.current?.scrollToIndex({ index: index + 1 });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topRow}>
        <Badge label={`Step ${index + 1} of ${SLIDES.length}`} tone="neutral" dot />
        <Button title="Skip" variant="ghost" size="sm" onPress={finish} />
      </View>

      <FlatList
        ref={list}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(s) => s.title}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={styles.illustration}>
              <item.icon size={72} color={colors.onPrimary} strokeWidth={1.5} />
            </View>
            <Text variant="label" tone="accent">
              {item.eyebrow}
            </Text>
            <Text variant="display" tone="primary">
              {item.title}
            </Text>
            <Text variant="body" tone="secondary">
              {item.body}
            </Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((s, i) => (
            <View key={s.title} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
        <Button
          title={index === SLIDES.length - 1 ? "Get started" : "Next"}
          icon={ArrowRight}
          iconPosition="right"
          onPress={next}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: layout.gutter,
    paddingTop: spacing.sm,
  },
  slide: { paddingHorizontal: layout.gutter, paddingTop: spacing["2xl"], gap: spacing.md },
  illustration: {
    height: 220,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  footer: { padding: layout.gutter, gap: spacing.xl },
  dots: { flexDirection: "row", justifyContent: "center", gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.borderStrong },
  dotActive: { width: 28, backgroundColor: colors.primary },
});
