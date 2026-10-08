import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Switch, View } from "react-native";
import { useRouter } from "expo-router";
import { ArrowRight, Moon, PackageSearch, ShieldAlert } from "lucide-react-native";
import { apiErrorMessage } from "@a2b/api-client";
import { formatMoney, getMarket, statusMeta } from "@a2b/core";
import { LoadCard } from "@a2b/features";
import { Badge, Card, colors, EmptyState, palette, radius, spacing, Text } from "@a2b/ui";
import { ScreenScroll } from "@/components/ScreenScroll";
import { api, session, useSession } from "@/lib/session";
import { currentJob, useLoadBoard, useMyLoads } from "@/lib/queries";

export default function JobsScreen() {
  const router = useRouter();
  const user = useSession((s) => s.user);
  const profile = user?.driverProfile;
  const onDuty = profile?.dutyStatus === "AVAILABLE";
  const [isToggling, setIsToggling] = useState(false);

  const mine = useMyLoads();
  const job = currentJob(mine.data);
  const board = useLoadBoard(onDuty && !job);

  const toggleDuty = async (value: boolean) => {
    setIsToggling(true);
    try {
      await api.me.upsertDriverProfile({ body: { dutyStatus: value ? "AVAILABLE" : "OFF_DUTY" } });
      await session.refreshUser();
    } catch (err) {
      Alert.alert("Couldn't change your status", apiErrorMessage(err));
    } finally {
      setIsToggling(false);
    }
  };

  const refresh = () => {
    mine.refetch();
    if (onDuty) board.refetch();
    session.refreshUser().catch(() => {});
  };

  return (
    <ScreenScroll onRefresh={refresh} refreshing={mine.isRefetching || board.isRefetching}>
      <View>
        <Text variant="caption" tone="muted">
          {user?.phone}
        </Text>
        <Text variant="h1" tone="primary">
          Hi {user?.fullName?.split(" ")[0] ?? "driver"}
        </Text>
      </View>

      <Card style={[styles.duty, onDuty && styles.dutyOn]} padding="lg">
        <View style={{ flex: 1 }}>
          <Text variant="h3" color={onDuty ? colors.onPrimary : colors.text}>
            {onDuty ? "Available for loads" : "Off duty"}
          </Text>
          <Text variant="bodySm" color={onDuty ? palette.forest[50] : colors.textSecondary}>
            {onDuty ? "You can see and accept open loads." : "Go on duty to see open loads."}
          </Text>
        </View>
        <Switch
          value={onDuty}
          onValueChange={toggleDuty}
          disabled={isToggling}
          trackColor={{ true: palette.emerald[400], false: palette.gray[300] }}
          thumbColor={palette.white}
          accessibilityLabel="On duty"
        />
      </Card>

      {profile?.verificationStatus === "PENDING" && (
        <Card style={styles.notice} padding="lg">
          <ShieldAlert size={20} color={palette.amber[800]} />
          <Text variant="bodySm" color={palette.amber[900]} style={{ flex: 1 }}>
            Your licence is being verified. You can still take jobs your fleet dispatches to you.
          </Text>
        </Card>
      )}

      {job && (
        <Pressable
          onPress={() => router.push({ pathname: "/trip/[id]", params: { id: String(job.id) } })}
          style={({ pressed }) => [styles.jobCard, pressed && { opacity: 0.9 }]}
        >
          <View style={styles.row}>
            <Badge
              label={job.fleetId ? "Dispatched by your fleet" : "Your job"}
              tone="warning"
            />
            <Badge label={statusMeta[job.status].label} tone={statusMeta[job.status].tone} dot />
          </View>
          <Text variant="h2" color={colors.onPrimary}>
            {job.pickupSummary} → {job.dropoffSummary}
          </Text>
          <View style={styles.row}>
            <Text variant="h3" color={palette.amber[300]}>
              {formatMoney(job.escrow?.amount ?? job.offerPrice, getMarket(job.market))}
            </Text>
            <View style={styles.open}>
              <Text variant="button" color={colors.onPrimary}>
                Open job
              </Text>
              <ArrowRight size={18} color={colors.onPrimary} />
            </View>
          </View>
        </Pressable>
      )}

      {!job && (
        <>
          <Text variant="h2">Open loads</Text>
          {!onDuty ? (
            <EmptyState icon={Moon} title="You're off duty" message="Switch on above when you're ready for a load." />
          ) : board.isPending ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
          ) : board.isSuccess && board.data.length === 0 ? (
            <EmptyState icon={PackageSearch} title="No open loads right now" message="Pull down to refresh." />
          ) : (
            board.data?.map((load) => (
              <LoadCard
                key={load.id}
                load={load}
                onPress={() => router.push({ pathname: "/loads/[id]", params: { id: String(load.id) } })}
              />
            ))
          )}
        </>
      )}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  duty: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  dutyOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  notice: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: palette.amber[50],
    borderColor: palette.amber[200],
  },
  jobCard: { gap: spacing.md, padding: spacing.xl, borderRadius: radius.md, backgroundColor: colors.primary },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  open: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
});
