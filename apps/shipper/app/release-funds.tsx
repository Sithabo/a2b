import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Clock } from "lucide-react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { apiErrorMessage } from "@a2b/api-client";
import { colors, palette } from "@a2b/ui";
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
      <View style={styles.header}>
        <SafeAreaView edges={["top"]} />
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <ArrowLeft color={palette.gray[900]} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Release Funds</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.instructionText}>
          Give this 6-digit code to the driver{"\n"}to release payment.
        </Text>

        {/* Big Code Card */}
        <View style={styles.codeCard}>
          {code && !expired ? (
            <Text style={styles.codeText}>{formatCode(code)}</Text>
          ) : isIssuing ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={styles.warningText}>{error || "This code has expired. Make a new one."}</Text>
          )}
        </View>

        {__DEV__ && code && shipment?.reference && (
          <Text style={styles.demoButtonText} selectable>
            Dev: act as the driver with{"\n"}node ace carrier:simulate {shipment.reference} release {code}
          </Text>
        )}

        {/* Expiration Timer */}
        {code && !expired && (
          <View style={styles.timerRow}>
            <Clock color={palette.amber[600]} size={16} />
            <Text style={styles.timerText}>Expires in {formatRemaining(remaining)}</Text>
          </View>
        )}

        <Text style={styles.warningText}>
          Only give this code if you have{"\n"}inspected your goods.
        </Text>
      </View>

      {/* Bottom Actions */}
      <View style={[styles.actionSection, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.8}
          onPress={issueCode}
          disabled={isIssuing}
        >
          <Text style={styles.primaryButtonText}>Remake Code</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.textButton}
          activeOpacity={0.8}
          onPress={() => router.back()}
        >
          <Text style={styles.textButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.ivory[200],
  },
  header: {
    backgroundColor: palette.ivory[200],
    zIndex: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    color: palette.gray[900],
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
    paddingTop: 24,
  },
  instructionText: {
    fontSize: 16,
    color: palette.gray[900],
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  codeCard: {
    backgroundColor: palette.white,
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 40,
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
    width: "100%",
    alignItems: "center",
  },
  codeText: {
    fontSize: 48,
    fontWeight: "900",
    color: colors.primary,
    letterSpacing: 2,
  },
  demoButton: {
    backgroundColor: palette.amber[100],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 32,
  },
  demoButtonText: {
    color: palette.amber[600],
    fontSize: 12,
    fontWeight: "bold",
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  timerText: {
    color: palette.amber[600],
    fontSize: 14,
    fontWeight: "bold",
  },
  warningText: {
    fontSize: 14,
    color: palette.gray[600],
    textAlign: "center",
    lineHeight: 20,
  },
  actionSection: {
    paddingHorizontal: 24,
    paddingBottom: 40, // standard safe area bottom padding space
    gap: 16,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 9999,
    paddingVertical: 18,
    alignItems: "center",
  },
  primaryButtonText: {
    color: palette.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  textButton: {
    paddingVertical: 16,
    alignItems: "center",
  },
  textButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "bold",
  },
});
