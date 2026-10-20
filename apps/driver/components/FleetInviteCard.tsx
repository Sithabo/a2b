import { Alert, StyleSheet, View } from "react-native";
import { useMutation } from "@tanstack/react-query";
import { Users } from "lucide-react-native";
import type { Data } from "@a2b/api-client";
import { apiErrorMessage } from "@a2b/api-client";
import { Button, Card, colors, spacing, Text } from "@a2b/ui";
import { api, session } from "@/lib/session";
import { keys, useInvalidate } from "@/lib/queries";

/** A fleet asking the driver to join. Joining sends future payouts to the fleet owner. */
export function FleetInviteCard({ invite }: { invite: Data.FleetInvite }) {
  const invalidate = useInvalidate();
  const respond = useMutation({
    mutationFn: async (accept: boolean) => {
      const params = { id: invite.id };
      return accept ? api.fleetInvites.accept({ params }) : api.fleetInvites.decline({ params });
    },
    onSuccess: async () => {
      await Promise.all([invalidate(keys.fleetInvites), session.refreshUser()]);
    },
    onError: (err) => Alert.alert("Couldn't answer the invite", apiErrorMessage(err)),
  });

  const confirmAccept = () =>
    Alert.alert(
      `Join ${invite.fleetName}?`,
      "Your fleet owner will dispatch jobs to you, and payment for the loads you carry goes to them.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Join fleet", onPress: () => respond.mutate(true) },
      ]
    );

  return (
    <Card style={styles.card} padding="lg">
      <View style={styles.head}>
        <Users size={20} color={colors.primary} />
        <Text variant="h3" style={{ flex: 1 }}>
          {invite.fleetName} invited you to their fleet
        </Text>
      </View>
      <Text variant="bodySm" tone="secondary">
        If you join, they dispatch jobs to you and are paid for the loads you carry.
      </Text>
      <View style={styles.actions}>
        <Button
          title="Decline"
          variant="secondary"
          onPress={() => respond.mutate(false)}
          disabled={respond.isPending}
          style={{ flex: 1 }}
        />
        <Button title="Join fleet" onPress={confirmAccept} loading={respond.isPending} style={{ flex: 1 }} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  head: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  actions: { flexDirection: "row", gap: spacing.md },
});
