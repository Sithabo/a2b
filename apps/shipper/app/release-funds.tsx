import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Clock } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { apiErrorMessage } from "@a2b/api-client";
import { Button, Card, colors, fontFamily, ScreenHeader, spacing, Text } from "@a2b/ui";
import { api } from "@/lib/session";
import { parseLoadId, useShipment } from "@/lib/loads";

const formatCode = (code: string) => `${code.slice(0, 3)} ${code.slice(3)}`;

function formatRemaining(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export default function ReleaseFundsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { trackingId } = useLocalSearchParams<{ trackingId: string }>();
  const loadId = parseLoadId(trackingId);

  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [isIssuing, setIsIssuing] = useState(false);
  const [now, setNow] = useState(Date.now());
  const latestRequest = useRef(0);

  // Watch for the driver entering the code.
  const { data: shipment } = useShipment(loadId, { pollMs: 4000 });

  const issueCode = useCallback(async () => {
    if (!loadId) return;
    const requestId = ++latestRequest.current;
    setIsIssuing(true);
    setError("");
    try {
      const { data } = await api.escrow.releaseCode({ params: { id: loadId } });
      // Each new code replaces the previous one server-side; only show the newest.
      if (requestId !== latestRequest.current) return;
      setCode(data.code);
      setExpiresAt(data.expiresAt ? new Date(data.expiresAt).getTime() : null);
    } catch (err) {
      if (requestId === latestRequest.current) setError(apiErrorMessage(err));
    } finally {
      if (requestId === latestRequest.current) setIsIssuing(false);
    }
  }, [loadId]);

  useEffect(() => {
    issueCode();
  }, [issueCode]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (shipment?.status === "COMPLETED") {
      router.replace({ pathname: "/official-receipt", params: { trackingId: shipment.id } });
    }
  }, [shipment?.status, shipment?.id, router]);

  const remaining = expiresAt ? expiresAt - now : 0;
  const expired = !!code && remaining <= 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <ScreenHeader title="Release Funds" onBackPress={() => router.back()} />

      <View style={styles.content}>
        <Text variant="body" align="center" style={styles.instructionText}>
          Give this 6-digit code to the driver{"\n"}to release payment.
        </Text>

        {/* Big Code Card */}
        <Card padding="3xl" style={styles.codeCard}>
          {code && !expired ? (
            <Text variant="code" tone="primary">{formatCode(code)}</Text>
          ) : isIssuing ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text variant="bodySm" tone="secondary" align="center">
              {error || "This code has expired. Make a new one."}
            </Text>
          )}
        </Card>

        {__DEV__ && code && shipment?.reference && (
          <Text variant="caption" tone="accent" style={styles.devText} selectable>
            Dev: act as the driver with{"\n"}node ace carrier:simulate {shipment.reference} release {code}
          </Text>
        )}

        {/* Expiration Timer */}
        {code && !expired && (
          <View style={styles.timerRow}>
            <Clock color={colors.accent} size={16} />
            <Text variant="bodyStrong" tone="accent">Expires in {formatRemaining(remaining)}</Text>
          </View>
        )}

        <Text variant="bodySm" tone="secondary" align="center">
          Only give this code if you have{"\n"}inspected your goods.
        </Text>
      </View>

      {/* Bottom Actions */}
      <View style={[styles.actionSection, { paddingBottom: insets.bottom > 0 ? insets.bottom : spacing.xl }]}>
        <Button
          title="Remake Code"
          fullWidth
          onPress={issueCode}
          disabled={isIssuing}
        />

        <Button
          title="Go Back"
          variant="ghost"
          fullWidth
          onPress={() => router.back()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing["2xl"],
    alignItems: "center",
    paddingTop: spacing["2xl"],
  },
  instructionText: {
    marginBottom: spacing["3xl"],
  },
  codeCard: {
    paddingHorizontal: spacing["4xl"],
    marginBottom: spacing.lg,
    width: "100%",
    alignItems: "center",
  },
  devText: {
    fontFamily: fontFamily.bold,
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing["2xl"],
  },
  actionSection: {
    paddingHorizontal: spacing["2xl"],
    gap: spacing.lg,
  },
});
