import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Pressable,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Anchor, MapPin, Search, X, ArrowLeft } from "lucide-react-native";
import type { LocationData } from "@a2b/core";
import { Badge, IconButton, Text, TextField, colors, layout, radius, spacing } from "@a2b/ui";

interface LocationSearchModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectLocation: (location: LocationData) => void;
  title: string;
  placeholder?: string;
}

const MOCK_PORTS: LocationData[] = [
  { id: "p_01", name: "Georgetown Wharves (Port Zone)", latitude: 6.8114, longitude: -58.1672, isPort: true },
  { id: "p_02", name: "Demerara Terminals (Port Zone)", latitude: 6.7901, longitude: -58.1812, isPort: true },
];

const MOCK_ADDRESSES: LocationData[] = [
  { id: "g_01", name: "Linden Highway, Guyana", latitude: 6.4021, longitude: -58.2190, isPort: false },
  { id: "g_02", name: "Demerara Harbour Bridge, Peters Hall", latitude: 6.7802, longitude: -58.1895, isPort: false },
  { id: "g_03", name: "Demerara Street, Georgetown", latitude: 6.8011, longitude: -58.1590, isPort: false },
  { id: "g_04", name: "Main Street, Georgetown, Guyana", latitude: 6.8082, longitude: -58.1654, isPort: false },
  { id: "g_05", name: "Sheriff Street, Campbellville, GT", latitude: 6.8021, longitude: -58.1402, isPort: false },
];

export const LocationSearchModal = ({
  isVisible,
  onClose,
  onSelectLocation,
  title,
  placeholder = "Search locations...",
}: LocationSearchModalProps) => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [filteredPorts, setFilteredPorts] = useState<LocationData[]>([]);
  const [filteredAddresses, setFilteredAddresses] = useState<LocationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<React.ComponentRef<typeof TextField>>(null);
  const insets = useSafeAreaInsets();

  // Focus input on mount
  useEffect(() => {
    if (isVisible) {
      setQuery("");
      setDebouncedQuery("");
      setFilteredPorts([]);
      setFilteredAddresses([]);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isVisible]);

  // Debounce logic (300ms)
  useEffect(() => {
    if (!query) {
      setDebouncedQuery("");
      return;
    }

    setIsLoading(true);
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
      setIsLoading(false);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  // Search filtering
  useEffect(() => {
    if (!debouncedQuery) {
      setFilteredPorts([]);
      setFilteredAddresses([]);
      return;
    }

    const lowerQuery = debouncedQuery.toLowerCase();
    
    // Filter ports
    const ports = MOCK_PORTS.filter(p => p.name.toLowerCase().includes(lowerQuery));
    setFilteredPorts(ports);

    // Filter addresses
    const addresses = MOCK_ADDRESSES.filter(a => a.name.toLowerCase().includes(lowerQuery));
    setFilteredAddresses(addresses);
  }, [debouncedQuery]);

  // Render search results grouped cleanly (SectionList styling using custom FlatList rendering)
  const renderData = React.useMemo(() => {
    const listData: ({ type: "header"; title: string } | { type: "item"; item: LocationData })[] = [];

    if (filteredPorts.length > 0) {
      listData.push({ type: "header", title: "PORTS & CUSTOMS ZONES" });
      filteredPorts.forEach(port => {
        listData.push({ type: "item", item: port });
      });
    }

    if (filteredAddresses.length > 0) {
      listData.push({ type: "header", title: "ADDRESSES & TOWNS" });
      filteredAddresses.forEach(addr => {
        listData.push({ type: "item", item: addr });
      });
    }

    return listData;
  }, [filteredPorts, filteredAddresses]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalContainer}
      >
        <View style={[styles.innerContainer, { paddingTop: insets.top || spacing.lg }]}>
          {/* Header */}
          <View style={styles.header}>
            <IconButton icon={ArrowLeft} onPress={onClose} accessibilityLabel="Go back" />
            <Text variant="h3" tone="primary" align="center" numberOfLines={1} style={styles.headerTitle}>
              {title}
            </Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Search Input Box */}
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
                isLoading ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Search size={18} color={colors.textPlaceholder} />
                )
              }
              trailing={
                query.length > 0 ? (
                  <IconButton
                    icon={X}
                    variant="plain"
                    size={32}
                    accessibilityLabel="Clear search"
                    onPress={() => setQuery("")}
                  />
                ) : undefined
              }
            />
          </View>

          {/* Results List */}
          {query && filteredPorts.length === 0 && filteredAddresses.length === 0 && !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text variant="bodyStrong" tone="secondary" align="center">{"No results found for \"" + query + "\""}</Text>
              <Text variant="caption" tone="muted" align="center" style={styles.emptySubText}>{'Try typing "Demerara" or "Georgetown" to test port detection.'}</Text>
            </View>
          ) : !query ? (
            <View style={styles.introContainer}>
              <Text variant="bodyStrong" tone="primary" style={styles.introHeader}>Quick Suggestions</Text>
              <View style={styles.suggestionsList}>
                {MOCK_PORTS.map(port => (
                  <Pressable
                    key={port.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${port.name}, port node`}
                    style={({ pressed }) => [styles.suggestionItem, pressed && { opacity: 0.85 }]}
                    onPress={() => onSelectLocation(port)}
                  >
                    <Anchor size={16} color={colors.primary} style={styles.suggestionIcon} />
                    <Text variant="bodySm" tone="secondary" style={styles.suggestionText}>{port.name}</Text>
                    <Badge label="PORT NODE" tone="brand" />
                  </Pressable>
                ))}
                {MOCK_ADDRESSES.slice(0, 3).map(addr => (
                  <Pressable
                    key={addr.id}
                    accessibilityRole="button"
                    accessibilityLabel={addr.name}
                    style={({ pressed }) => [styles.suggestionItem, pressed && { opacity: 0.85 }]}
                    onPress={() => onSelectLocation(addr)}
                  >
                    <MapPin size={16} color={colors.textMuted} style={styles.suggestionIcon} />
                    <Text variant="bodySm" tone="secondary" style={styles.suggestionText}>{addr.name}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : (
            <FlatList
              data={renderData}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                if (item.type === "header") {
                  return (
                    <Text variant="label" tone="muted" style={styles.sectionHeader}>{item.title}</Text>
                  );
                }

                const location = item.item;
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={location.isPort ? `${location.name}, port node` : location.name}
                    style={({ pressed }) => [styles.resultItem, pressed && { opacity: 0.85 }]}
                    onPress={() => onSelectLocation(location)}
                  >
                    <View style={styles.resultLeft}>
                      {location.isPort ? (
                        <View style={styles.anchorWrapper}>
                          <Anchor size={18} color={colors.primary} />
                        </View>
                      ) : (
                        <View style={styles.pinWrapper}>
                          <MapPin size={18} color={colors.textMuted} />
                        </View>
                      )}
                      <Text
                        variant={location.isPort ? "bodyStrong" : "body"}
                        tone={location.isPort ? "primary" : "secondary"}
                        style={styles.resultName}
                      >
                        {location.name}
                      </Text>
                    </View>
                    
                    {location.isPort && (
                      <Badge label="PORT NODE" tone="brand" />
                    )}
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
  anchorWrapper: {
    marginRight: spacing.md,
  },
  pinWrapper: {
    marginRight: spacing.md,
  },
  resultName: {
    flexShrink: 1,
  },
  emptyContainer: {
    padding: spacing["3xl"],
    alignItems: "center",
  },
  emptySubText: {
    marginTop: spacing.sm,
  },
  introContainer: {
    paddingHorizontal: spacing.lg,
  },
  introHeader: {
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  suggestionsList: {
    gap: spacing.sm,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: layout.touchMin,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionIcon: {
    marginRight: spacing.sm,
  },
  suggestionText: {
    flex: 1,
  },
});
