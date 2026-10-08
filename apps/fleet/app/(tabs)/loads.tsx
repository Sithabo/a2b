import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { PackageSearch } from "lucide-react-native";
import { ChipGroup, EmptyState, spacing, Text } from "@a2b/ui";
import { ScreenScroll } from "@/components/ScreenScroll";
import { LoadCard } from "@/components/LoadCard";
import { useFleetLoads, useLoadBoard } from "@/lib/queries";

type View_ = "board" | "mine";

export default function LoadsScreen() {
  const router = useRouter();
  const [view, setView] = useState<View_>("board");
  const board = useLoadBoard();
  const mine = useFleetLoads();
  const query = view === "board" ? board : mine;
  const loads = query.data ?? [];

  return (
    <ScreenScroll onRefresh={() => query.refetch()} refreshing={query.isRefetching}>
      <View style={styles.header}>
        <Text variant="h1" tone="primary">
          Loads
        </Text>
        <Text tone="secondary">
          {view === "board" ? "Open loads in your market, waiting for a carrier." : "Loads your trucks are carrying."}
        </Text>
      </View>

      <ChipGroup
        value={view}
        onChange={setView}
        options={[
          { value: "board", label: "Load board" },
          { value: "mine", label: "Our loads" },
        ]}
      />

      {query.isSuccess && loads.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title={view === "board" ? "No open loads right now" : "No loads yet"}
          message={view === "board" ? "Pull down to refresh." : "Dispatch a truck from the load board to get started."}
        />
      ) : (
        loads.map((load) => (
          <LoadCard
            key={load.id}
            load={load}
            onPress={() => router.push({ pathname: "/loads/[id]", params: { id: String(load.id) } })}
          />
        ))
      )}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.xs },
});
