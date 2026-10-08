import { useRef, useState } from "react";
import { FlatList, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowRight, FileCheck2, Navigation, Wallet, type LucideIcon } from "lucide-react-native";
import { Button, colors, layout, palette, radius, spacing, Text } from "@a2b/ui";
import { useSession } from "@/lib/session";

const SLIDES: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Wallet,
    title: "Paid for every load",
    body: "Shippers lock the money in escrow before you drive. Enter their release code at delivery and it's paid out.",
  },
  {
    icon: FileCheck2,
    title: "Port papers on your phone",
    body: "Import loads come with a digital customs pass — the cleared documents and a QR code for the gate.",
  },
  {
    icon: Navigation,
    title: "Straight to the address",
    body: "Pickup and drop-off open in your maps app, with one-tap calls to the people at each end.",
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
  const next = () => (index === SLIDES.length - 1 ? finish() : list.current?.scrollToIndex({ index: index + 1 }));

  // High contrast for outdoor use: white on deep forest.
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topRow}>
        <Pressable onPress={finish} hitSlop={12} accessibilityRole="button" style={styles.skip}>
          <Text variant="button" color={colors.onPrimary}>
            Skip
          </Text>
        </Pressable>
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
            <View style={styles.icon}>
              <item.icon size={64} color={colors.primary} strokeWidth={1.75} />
            </View>
            <Text variant="display" color={colors.onPrimary}>
              {item.title}
            </Text>
            <Text variant="body" color={palette.forest[50]} style={{ fontSize: 18 }}>
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
          variant="accent"
          onPress={next}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary },
  topRow: { alignItems: "flex-end", paddingHorizontal: layout.gutter },
  skip: { minHeight: 48, justifyContent: "center", paddingHorizontal: spacing.sm },
  slide: { paddingHorizontal: layout.gutter, paddingTop: spacing["3xl"], gap: spacing.lg },
  icon: {
    width: 120,
    height: 120,
    borderRadius: radius.xl,
    backgroundColor: palette.amber[300],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  footer: { padding: layout.gutter, gap: spacing.xl },
  dots: { flexDirection: "row", justifyContent: "center", gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.3)" },
  dotActive: { width: 28, backgroundColor: palette.amber[300] },
});
