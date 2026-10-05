import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Anchor, MapPin, Search, X, ArrowLeft } from "lucide-react-native";
import { LocationData } from "@/store/useShipmentStore";

interface LocationSearchModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectLocation: (location: LocationData) => void;
  title: string;
  placeholder?: string;
}

const MOCK_PORTS: LocationData[] = [
  { id: "p_01", name: "Georgetown Wharves (Port Zone)", latitude: 6.8114, longitude: -58.1672, is_port: true },
  { id: "p_02", name: "Demerara Terminals (Port Zone)", latitude: 6.7901, longitude: -58.1812, is_port: true },
];

const MOCK_ADDRESSES: LocationData[] = [
  { id: "g_01", name: "Linden Highway, Guyana", latitude: 6.4021, longitude: -58.2190, is_port: false },
  { id: "g_02", name: "Demerara Harbour Bridge, Peters Hall", latitude: 6.7802, longitude: -58.1895, is_port: false },
  { id: "g_03", name: "Demerara Street, Georgetown", latitude: 6.8011, longitude: -58.1590, is_port: false },
  { id: "g_04", name: "Main Street, Georgetown, Guyana", latitude: 6.8082, longitude: -58.1654, is_port: false },
  { id: "g_05", name: "Sheriff Street, Campbellville, GT", latitude: 6.8021, longitude: -58.1402, is_port: false },
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
  const inputRef = useRef<TextInput>(null);
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
        <View style={[styles.innerContainer, { paddingTop: insets.top || 16 }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
              <ArrowLeft size={22} color="#0F3D26" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{title}</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Search Input Box */}
          <View style={styles.searchBar}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#0F3D26" style={styles.searchIcon} />
            ) : (
              <Search size={18} color="#9CA3AF" style={styles.searchIcon} />
            )}
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={query}
              onChangeText={setQuery}
              placeholder={placeholder}
              placeholderTextColor="#9CA3AF"
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery("")} style={styles.clearBtn}>
                <X size={16} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Results List */}
          {query && filteredPorts.length === 0 && filteredAddresses.length === 0 && !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{"No results found for \"" + query + "\""}</Text>
              <Text style={styles.emptySubText}>{'Try typing "Demerara" or "Georgetown" to test port detection.'}</Text>
            </View>
          ) : !query ? (
            <View style={styles.introContainer}>
              <Text style={styles.introHeader}>Quick Suggestions</Text>
              <View style={styles.suggestionsList}>
                {MOCK_PORTS.map(port => (
                  <TouchableOpacity
                    key={port.id}
                    style={styles.suggestionItem}
                    onPress={() => onSelectLocation(port)}
                    activeOpacity={0.7}
                  >
                    <Anchor size={16} color="#0F3D26" style={{ marginRight: 10 }} />
                    <Text style={styles.suggestionText}>{port.name}</Text>
                    <View style={styles.portBadge}>
                      <Text style={styles.portBadgeText}>PORT NODE</Text>
                    </View>
                  </TouchableOpacity>
                ))}
                {MOCK_ADDRESSES.slice(0, 3).map(addr => (
                  <TouchableOpacity
                    key={addr.id}
                    style={styles.suggestionItem}
                    onPress={() => onSelectLocation(addr)}
                    activeOpacity={0.7}
                  >
                    <MapPin size={16} color="#6B7280" style={{ marginRight: 10 }} />
                    <Text style={styles.suggestionText}>{addr.name}</Text>
                  </TouchableOpacity>
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
                    <Text style={styles.sectionHeader}>{item.title}</Text>
                  );
                }

                const location = item.item;
                return (
                  <TouchableOpacity
                    style={styles.resultItem}
                    onPress={() => onSelectLocation(location)}
                    activeOpacity={0.75}
                  >
                    <View style={styles.resultLeft}>
                      {location.is_port ? (
                        <View style={styles.anchorWrapper}>
                          <Anchor size={18} color="#0F3D26" />
                        </View>
                      ) : (
                        <View style={styles.pinWrapper}>
                          <MapPin size={18} color="#6B7280" />
                        </View>
                      )}
                      <Text style={[styles.resultName, location.is_port && styles.resultNamePort]}>
                        {location.name}
                      </Text>
                    </View>
                    
                    {location.is_port && (
                      <View style={styles.portBadge}>
                        <Text style={styles.portBadgeText}>PORT NODE</Text>
                      </View>
                    )}
                  </TouchableOpacity>
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
    backgroundColor: "#F5F5E9",
  },
  innerContainer: {
    flex: 1,
    backgroundColor: "#F5F5E9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F3D26",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    height: 48,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    paddingVertical: 8,
  },
  clearBtn: {
    padding: 4,
  },
  loadingContainer: {
    padding: 24,
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#9CA3AF", // subtle gray
    letterSpacing: 0.8,
    marginTop: 20,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  resultLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  anchorWrapper: {
    marginRight: 12,
  },
  pinWrapper: {
    marginRight: 12,
  },
  resultName: {
    fontSize: 15,
    color: "#374151",
    fontWeight: "500",
  },
  resultNamePort: {
    fontWeight: "600",
    color: "#0F3D26",
  },
  portBadge: {
    backgroundColor: "#E6F4EA",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  portBadgeText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#0F3D26",
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 18,
  },
  introContainer: {
    paddingHorizontal: 16,
  },
  introHeader: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0F3D26",
    marginBottom: 12,
    marginTop: 8,
  },
  suggestionsList: {
    gap: 8,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  suggestionText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
});
