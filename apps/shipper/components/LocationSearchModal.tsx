import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Anchor, ArrowLeft, MapPin, Search, X } from "lucide-react-native";
import { apiErrorMessage } from "@a2b/api-client";
import type { LocationData } from "@a2b/core";
import { Badge, IconButton, Text, TextField, colors, layout, radius, spacing } from "@a2b/ui";
import { newSearchSession, resolvePlace, usePlaceSearch, type PlaceResult } from "@/lib/places";
import { useMarket } from "@/store/useMarket";

interface LocationSearchModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectLocation: (location: LocationData) => void;
  title: string;
  placeholder?: string;
}

const NO_RESULTS: PlaceResult[] = [];

/** Ports, border posts and towns from the market's catalog, shown before the shipper types. */
function useSuggestions(): PlaceResult[] {
  const market = useMarket();
  return useMemo(
    () =>
      [...market.places]
        .sort((a, b) => Number(b.isPort) - Number(a.isPort))
        .slice(0, 8)
        .map((p) => ({
          id: `catalog:${p.id}`,
          name: p.name,
          address: p.region,
          isPort: p.isPort,
          latitude: p.latitude,
          longitude: p.longitude,
          source: "catalog" as const,
        })),
    [market]
  );
}

/**
 * Pickup / drop-off search in the shipper's market: A2B's known places (customs
 * zones first) plus addresses from the search provider, through the API.
 */
export const LocationSearchModal = ({
  isVisible,
  onClose,
  onSelectLocation,
  title,
  placeholder = "Search a place or address",
}: LocationSearchModalProps) => {
  const market = useMarket();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<React.ComponentRef<typeof TextField>>(null);
  const suggestions = useSuggestions();

  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  // One provider billing session per opened search
  const session = useMemo(() => (isVisible ? newSearchSession() : ""), [isVisible]);
  const search = usePlaceSearch(debounced, session);

  useEffect(() => {
    if (!isVisible) return;
    setQuery("");
    setDebounced("");
    const focus = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(focus);
  }, [isVisible]);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(query), 250);
    return () => clearTimeout(handler);
  }, [query]);

  const select = async (place: PlaceResult) => {
    setResolvingId(place.id);
    try {
      onSelectLocation(await resolvePlace(place, session));
    } catch (err) {
      Alert.alert("Couldn't use this place", apiErrorMessage(err));
    } finally {
      setResolvingId(null);
    }
  };

  const typing = query.trim().length >= 2;
  const results = typing ? (search.data ?? NO_RESULTS) : suggestions;
  const isSearching = typing && (query !== debounced || search.isFetching);
  const rows = useMemo(() => {
    const ports = results.filter((r) => r.isPort);
    const others = results.filter((r) => !r.isPort);
    const list: ({ type: "header"; title: string } | { type: "item"; item: PlaceResult })[] = [];
    if (ports.length) list.push({ type: "header", title: "Ports & customs zones" }, ...ports.map((item) => ({ type: "item" as const, item })));
    if (others.length) list.push({ type: "header", title: typing ? "Places & addresses" : "Towns & industrial areas" }, ...others.map((item) => ({ type: "item" as const, item })));
    return list;
  }, [results, typing]);

  return (
    <Modal animationType="slide" transparent visible={isVisible} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.modalContainer}>
        <View style={[styles.innerContainer, { paddingTop: insets.top || spacing.lg }]}>
          <View style={styles.header}>
            <IconButton icon={ArrowLeft} onPress={onClose} accessibilityLabel="Go back" />
            <Text variant="h3" tone="primary" align="center" numberOfLines={1} style={styles.headerTitle}>
              {title}
            </Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.searchBar}>
            <TextField
              ref={inputRef}
              value={query}
              onChangeText={setQuery}
              placeholder={placeholder}
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="while-editing"
              leading={
                isSearching ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Search size={18} color={colors.textPlaceholder} />
                )
              }
              trailing={
                query.length > 0 ? (
                  <IconButton icon={X} variant="plain" size={32} accessibilityLabel="Clear search" onPress={() => setQuery("")} />
                ) : undefined
              }
            />
          </View>

          {typing && !isSearching && search.isError ? (
            <View style={styles.emptyContainer}>
              <Text variant="bodyStrong" tone="secondary" align="center">
                {apiErrorMessage(search.error, "Search isn't available right now.")}
              </Text>
            </View>
          ) : typing && !isSearching && results.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text variant="bodyStrong" tone="secondary" align="center">{`No places in ${market.name} match "${query.trim()}"`}</Text>
              <Text variant="caption" tone="muted" align="center" style={styles.emptySubText}>
                Try a street, market, warehouse or town name.
              </Text>
            </View>
          ) : (
            <FlatList
              data={rows}
              keyExtractor={(row) => (row.type === "header" ? `h:${row.title}` : row.item.id)}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item: row }) => {
                if (row.type === "header") {
                  return (
                    <Text variant="label" tone="muted" style={styles.sectionHeader}>
                      {row.title}
                    </Text>
                  );
                }
                const place = row.item;
                const isResolving = resolvingId === place.id;
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={[place.name, place.address, place.isPort ? "customs zone" : null].filter(Boolean).join(", ")}
                    disabled={!!resolvingId}
                    style={({ pressed }) => [styles.resultItem, pressed && { opacity: 0.85 }]}
                    onPress={() => select(place)}
                  >
                    <View style={styles.resultLeft}>
                      <View style={styles.iconWrapper}>
                        {place.isPort ? <Anchor size={18} color={colors.primary} /> : <MapPin size={18} color={colors.textMuted} />}
                      </View>
                      <View style={styles.resultName}>
                        <Text variant={place.isPort ? "bodyStrong" : "body"} tone={place.isPort ? "primary" : "default"}>
                          {place.name}
                        </Text>
                        {place.address ? (
                          <Text variant="caption" tone="muted" numberOfLines={1}>
                            {place.address}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                    {isResolving ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : place.isPort ? (
                      <Badge label="Customs" tone="brand" />
                    ) : null}
                  </Pressable>
                );
              }}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  innerContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  headerSpacer: {
    width: 40,
  },
  searchBar: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing["2xl"],
  },
  sectionHeader: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: layout.touchMin,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconWrapper: {
    marginRight: spacing.md,
  },
  resultName: {
    flexShrink: 1,
    gap: spacing.xxs,
  },
  emptyContainer: {
    padding: spacing["3xl"],
    alignItems: "center",
  },
  emptySubText: {
    marginTop: spacing.sm,
  },
});
