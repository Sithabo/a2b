import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Clock, CheckCircle, Package, Smartphone } from 'lucide-react-native';
import { useShipmentStore, Shipment } from '@/store/useShipmentStore';

// Helper to calculate simple "time ago" string
const timeAgo = (dateString: string) => {
  const diffInMinutes = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 60000);
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  return `${Math.floor(diffInHours / 24)} days ago`;
};

export default function ReceiptsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const shipments = useShipmentStore(state => state.shipments);
  
  // Sort by newest first
  const sortedShipments = [...shipments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const openShipments = sortedShipments.filter(s => s.status === 'OPEN' || s.status === 'MATCHED');
  const activeShipments = sortedShipments.filter(s => s.status === 'SECURED' || s.status === 'ACTIVE' || s.status === 'COMPLETED');

  // Hardcode fallback data since user is simulating but might not have created one yet.
  // We'll show the dynamic ones first, then fallback mock items if empty.
  const hasOpen = openShipments.length > 0;
  const hasActive = activeShipments.length > 0;

  const renderOpenCard = (shipment: Shipment) => (
    <TouchableOpacity key={shipment.id} style={styles.shipmentCard} activeOpacity={0.8}>
      <View style={styles.cardTopRow}>
        <View>
          <Text style={styles.locationMeta}>Pickup</Text>
          <Text style={styles.locationText}>{shipment.pickup}</Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.priceValue}>{Number(shipment.offerPrice).toLocaleString()}</Text>
          <Text style={styles.priceCurrency}>UGX</Text>
        </View>
      </View>

      <View style={styles.deliveryRow}>
        <Text style={styles.locationMeta}>Delivery</Text>
        <Text style={styles.locationText}>{shipment.delivery}</Text>
      </View>

      <View style={styles.cargoRow}>
        <Package color="#9CA3AF" size={14} />
        <Text style={styles.cargoText}>{shipment.cargoType}</Text>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.postedTime}>Posted {timeAgo(shipment.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderActiveCard = (shipment: Shipment) => (
    <TouchableOpacity
      key={shipment.id}
      style={[styles.shipmentCard, styles.activeCard]}
      onPress={() => router.push('/active-delivery')}
      activeOpacity={0.8}
    >
      <View style={styles.activeAccentBar} />

      <View style={[styles.cardTopRow, styles.activeCardPadding]}>
        <View>
          <Text style={styles.locationMeta}>Pickup</Text>
          <Text style={styles.locationText}>{shipment.pickup}</Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.priceValue}>{Number(shipment.offerPrice).toLocaleString()}</Text>
          <Text style={styles.priceCurrency}>UGX</Text>
        </View>
      </View>

      <View style={[styles.deliveryRow, styles.activeCardPadding]}>
        <Text style={styles.locationMeta}>Delivery</Text>
        <Text style={styles.locationText}>{shipment.delivery}</Text>
      </View>

      <View style={[styles.cargoRow, styles.activeCardPadding]}>
        <Package color="#9CA3AF" size={14} />
        <Text style={styles.cargoText}>{shipment.cargoType}</Text>
      </View>

      <View style={[styles.driverRow, styles.activeCardPadding]}>
        <View style={styles.driverAvatar}>
          <Text style={styles.driverAvatarText}>JM</Text>
        </View>
        <View>
          <Text style={styles.driverMeta}>Driver</Text>
          <Text style={styles.driverName}>John Mukasa</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>
            {shipment.status === 'SECURED' ? 'Confirmed' : 'En route to pickup'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pending Shipments</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Section 1: Waiting for Driver ── */}
        <View>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLabelRow}>
              <Clock color="#D97706" size={18} />
              <Text style={styles.sectionLabel}>Waiting for Driver</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{openShipments.length > 0 ? openShipments.length : 2}</Text>
            </View>
          </View>

          {hasOpen ? (
            openShipments.map(renderOpenCard)
          ) : (
            <>
              {/* Fallback Static Cards */}
              <TouchableOpacity style={styles.shipmentCard} activeOpacity={0.8}>
                <View style={styles.cardTopRow}>
                  <View>
                    <Text style={styles.locationMeta}>Pickup</Text>
                    <Text style={styles.locationText}>Kampala, Makindye</Text>
                  </View>
                  <View style={styles.priceContainer}>
                    <Text style={styles.priceValue}>150,000</Text>
                    <Text style={styles.priceCurrency}>UGX</Text>
                  </View>
                </View>

                <View style={styles.deliveryRow}>
                  <Text style={styles.locationMeta}>Delivery</Text>
                  <Text style={styles.locationText}>Jinja, Industrial Area</Text>
                </View>

                <View style={styles.cargoRow}>
                  <Package color="#9CA3AF" size={14} />
                  <Text style={styles.cargoText}>Rice bags (50kg × 10)</Text>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.postedTime}>Posted 15 mins ago</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shipmentCard} activeOpacity={0.8}>
                <View style={styles.cardTopRow}>
                  <View>
                    <Text style={styles.locationMeta}>Pickup</Text>
                    <Text style={styles.locationText}>Entebbe, Airport Road</Text>
                  </View>
                  <View style={styles.priceContainer}>
                    <Text style={styles.priceValue}>75,000</Text>
                    <Text style={styles.priceCurrency}>UGX</Text>
                  </View>
                </View>

                <View style={styles.deliveryRow}>
                  <Text style={styles.locationMeta}>Delivery</Text>
                  <Text style={styles.locationText}>Kampala, City Center</Text>
                </View>

                <View style={styles.cargoRow}>
                  <Smartphone color="#9CA3AF" size={14} />
                  <Text style={styles.cargoText}>Electronics (5 boxes)</Text>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.postedTime}>Posted 1 hour ago</Text>
                </View>
              </TouchableOpacity>
            </  >
          )}
        </View>

        {/* ── Section 2: Paid & Active ── */}
        <View style={styles.activeSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLabelRow}>
              <CheckCircle color="#059669" size={18} />
              <Text style={styles.sectionLabel}>Paid & Active</Text>
            </View>
            <View style={[styles.badge, styles.activeBadge]}>
              <Text style={[styles.badgeText, styles.activeBadgeText]}>{activeShipments.length > 0 ? activeShipments.length : 1}</Text>
            </View>
          </View>

          {hasActive ? (
            activeShipments.map(renderActiveCard)
          ) : (
            /* Fallback Static Active Card */
            <TouchableOpacity
              style={[styles.shipmentCard, styles.activeCard]}
              onPress={() => router.push('/active-delivery')}
              activeOpacity={0.8}
            >
              <View style={styles.activeAccentBar} />

              <View style={[styles.cardTopRow, styles.activeCardPadding]}>
                <View>
                  <Text style={styles.locationMeta}>Pickup</Text>
                  <Text style={styles.locationText}>Kampala, Makindye</Text>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceValue}>150,000</Text>
                  <Text style={styles.priceCurrency}>UGX</Text>
                </View>
              </View>

              <View style={[styles.deliveryRow, styles.activeCardPadding]}>
                <Text style={styles.locationMeta}>Delivery</Text>
                <Text style={styles.locationText}>Jinja, Industrial Area</Text>
              </View>

              <View style={[styles.cargoRow, styles.activeCardPadding]}>
                <Package color="#9CA3AF" size={14} />
                <Text style={styles.cargoText}>Rice bags (50kg × 10)</Text>
              </View>

              <View style={[styles.driverRow, styles.activeCardPadding]}>
                <View style={styles.driverAvatar}>
                  <Text style={styles.driverAvatarText}>JM</Text>
                </View>
                <View>
                  <Text style={styles.driverMeta}>Driver</Text>
                  <Text style={styles.driverName}>John Mukasa</Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>En route to pickup</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 56, paddingBottom: 16, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
    backgroundColor: '#F5F5E9',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#0F3D26' },
  scrollContent: { padding: 16, paddingBottom: 100, gap: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, color: '#0F3D26' },
  badge: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999 },
  badgeText: { fontSize: 12, fontWeight: 'bold', color: '#92400E' },
  activeBadge: { backgroundColor: '#D1FAE5' },
  activeBadgeText: { color: '#065F46' },
  shipmentCard: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#F3F4F6', shadowColor: '#1B4D3E',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06,
    shadowRadius: 8, elevation: 2, marginBottom: 12,
    position: 'relative', overflow: 'hidden',
  },
  activeCard: { borderColor: '#A7F3D0' },
  activeAccentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: '#10B981', borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
  activeCardPadding: { paddingLeft: 8 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  locationMeta: { fontSize: 10, fontWeight: 'bold', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 2 },
  locationText: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
  priceContainer: { alignItems: 'flex-end' },
  priceValue: { fontSize: 18, fontWeight: 'bold', color: '#0F3D26' },
  priceCurrency: { fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 },
  deliveryRow: { marginBottom: 12 },
  cargoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F9FAFB', borderRadius: 8, padding: 8, marginBottom: 12 },
  cargoText: { fontSize: 12, color: '#374151', fontWeight: '500' },
  cardFooter: { borderTopWidth: 1, borderTopColor: '#F9FAFB', paddingTop: 8 },
  postedTime: { fontSize: 12, color: '#9CA3AF' },
  activeSection: {},
  driverRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderTopWidth: 1, borderTopColor: '#F9FAFB', paddingTop: 12 },
  driverAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  driverAvatarText: { fontSize: 10, fontWeight: 'bold', color: '#374151' },
  driverMeta: { fontSize: 10, fontWeight: 'bold', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 },
  driverName: { fontSize: 12, fontWeight: 'bold', color: '#111827' },
  statusBadge: { marginLeft: 'auto', backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  statusBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#065F46' },
});
