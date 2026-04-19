import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { 
  ArrowLeft, 
  Truck, 
  Clock, 
  CheckCircle, 
  User, 
  Star, 
  PhoneCall, 
  MessageSquare, 
  Package 
} from 'lucide-react-native';

export default function ActiveDeliveryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Active Delivery</Text>
          <Text style={styles.headerSubtitle}>En route to pickup</Text>
        </View>
        <View style={styles.placeholderIcon} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Job Active Card */}
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Truck color="#0F3D26" size={24} />
          </View>
          <Text style={styles.jobActiveTitle}>Job Active</Text>
          <Text style={styles.jobActiveSubtitle}>Your driver is on the way</Text>

          <View style={styles.arrivalBox}>
            <View style={styles.arrivalColLeft}>
              <Clock color="#6B7280" size={16} />
              <Text style={styles.arrivalLabel}>Expected Arrival</Text>
            </View>
            <Text style={styles.arrivalValue}>35 minutes</Text>
          </View>

          <TouchableOpacity style={styles.confirmButton} activeOpacity={0.85}>
            <CheckCircle color="white" size={20} />
            <Text style={styles.confirmText}>Confirm Goods Received</Text>
          </TouchableOpacity>
        </View>

        {/* Driver Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <User color="#6B7280" size={14} />
            <Text style={styles.cardTitle}>Driver Information</Text>
          </View>
          
          <View style={styles.driverRow}>
            <View style={styles.driverAvatarContainer}>
               <View style={styles.driverAvatar}>
                 <Text style={styles.driverAvatarInitials}>JM</Text>
               </View>
               <View style={styles.onlineBadge} />
            </View>

            <View style={styles.driverMeta}>
              <Text style={styles.driverName}>John Mukasa</Text>
              <View style={styles.driverStats}>
                <View style={styles.starRow}>
                  <Star color="#EAB308" size={14} fill="#EAB308" />
                  <Text style={styles.ratingText}>4.8</Text>
                </View>
                <Text style={styles.separator}>|</Text>
                <Text style={styles.tripsText}>156 Trips</Text>
              </View>
            </View>
          </View>

          <View style={styles.contactActions}>
            <TouchableOpacity style={styles.callButton} activeOpacity={0.8}>
               <PhoneCall color="white" size={16} />
               <Text style={styles.callText}>Call Driver</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.messageButton} activeOpacity={0.7}>
               <MessageSquare color="#374151" size={16} />
               <Text style={styles.messageText}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Vehicle Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Truck color="#6B7280" size={14} />
            <Text style={styles.cardTitle}>Vehicle Information</Text>
          </View>

          <View style={styles.vehicleGrid}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Vehicle Type</Text>
              <Text style={styles.gridValue}>Lorry (Medium)</Text>
            </View>
            <View style={[styles.gridItem, { alignItems: 'flex-end' }]}>
              <Text style={styles.gridLabel}>Capacity</Text>
              <Text style={styles.gridValue}>5 Tons</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Make & Model</Text>
              <Text style={styles.gridValue}>Isuzu FRR</Text>
            </View>
            <View style={[styles.gridItem, { alignItems: 'flex-end' }]}>
              <Text style={styles.gridLabel}>Number Plate</Text>
              <View style={styles.plateBox}>
                <Text style={styles.plateText}>UAM 456K</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Shipment Details */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
             <Package color="#6B7280" size={14} />
             <Text style={styles.cardTitle}>Shipment Details</Text>
          </View>

          <View style={styles.timeline}>
             <View style={styles.timelineLine} />
             <View style={styles.timelineRow}>
                <View style={styles.timelineDotStart} />
                <View>
                  <Text style={styles.timelineLabel}>Pickup Location</Text>
                  <Text style={styles.timelineVal}>Kampala, Makindye District</Text>
                </View>
             </View>
             <View style={styles.timelineRow}>
                <View style={styles.timelineDotEnd} />
                <View>
                  <Text style={styles.timelineLabel}>Delivery Location</Text>
                  <Text style={styles.timelineVal}>Jinja, Industrial Area</Text>
                </View>
             </View>
          </View>

          <View style={styles.cargoBox}>
            <View style={styles.cargoColLeft}>
              <Text style={styles.cargoLabel}>Load Description</Text>
              <Text style={styles.cargoVal}>Rice bags (50kg × 10)</Text>
            </View>
            <View style={styles.cargoColRight}>
              <Text style={styles.cargoLabel}>Weight</Text>
              <Text style={styles.cargoVal}>500 kg</Text>
            </View>
          </View>

          <View style={styles.footerRow}>
             <View>
               <Text style={styles.offerLabel}>Offer Amount</Text>
               <Text style={styles.offerAmt}>150,000 <Text style={styles.offerCurrency}>UGX</Text></Text>
             </View>
             <View style={styles.securedBadge}>
               <CheckCircle color="#B45309" size={12} />
               <Text style={styles.securedText}>Secured in Escrow</Text>
             </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#0F3D26',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56, // For safe area
    paddingBottom: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitleContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#A7F3D0',
    fontSize: 12,
    fontWeight: '500',
  },
  placeholderIcon: {
    width: 40,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E6F4EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  jobActiveTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  jobActiveSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  arrivalBox: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 16,
  },
  arrivalColLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  arrivalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  arrivalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F3D26',
  },
  confirmButton: {
    width: '100%',
    backgroundColor: '#0F3D26',
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cardHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  driverRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  driverAvatarContainer: {
    position: 'relative',
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  driverAvatarInitials: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4B5563',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    backgroundColor: '#22C55E',
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  driverMeta: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  driverStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
  },
  separator: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  tripsText: {
    fontSize: 12,
    color: '#6B7280',
  },
  contactActions: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  callButton: {
    flex: 1,
    backgroundColor: '#0F3D26',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  callText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  messageButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  messageText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 14,
  },
  vehicleGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 16,
  },
  gridItem: {
    width: '50%',
  },
  gridLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  gridValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 4,
  },
  plateBox: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 4,
  },
  plateText: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: '#1F2937',
  },
  timeline: {
    width: '100%',
    position: 'relative',
    paddingLeft: 16,
    gap: 24,
  },
  timelineLine: {
    position: 'absolute',
    left: 20,
    top: 6,
    bottom: 24,
    width: 2,
    backgroundColor: '#E5E7EB',
  },
  timelineRow: {
    position: 'relative',
  },
  timelineDotStart: {
    position: 'absolute',
    left: -16,
    top: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0F3D26',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  timelineDotEnd: {
    position: 'absolute',
    left: -16,
    top: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#0F3D26',
  },
  timelineLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timelineVal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 2,
  },
  cargoBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginTop: 20,
  },
  cargoColLeft: {
    flex: 1,
  },
  cargoColRight: {
    paddingLeft: 16,
    borderLeftWidth: 1,
    borderLeftColor: '#E5E7EB',
    alignItems: 'flex-end',
  },
  cargoLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cargoVal: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginTop: 2,
  },
  footerRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
    marginTop: 16,
  },
  offerLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  offerAmt: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  offerCurrency: {
    fontSize: 12,
    fontWeight: 'normal',
    color: '#6B7280',
  },
  securedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  securedText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#B45309',
  },
});
