import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
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
        <View style={styles.modernCard}>
           <View style={styles.modernSubheadingRow}>
              <Package color="#9CA3AF" size={14} />
              <Text style={styles.modernSubheading}>PICKUP DETAILS</Text>
           </View>
           <View style={styles.modernTopRow}>
              <Text style={styles.modernOrderId}>#V99MZLQ</Text>
              <Text style={styles.modernPriceText}>150,000 UGX</Text>
           </View>

           <View style={styles.timelineWrapper}>
             <View style={styles.timelineDashedLine} />

             {/* Pickup */}
             <View style={styles.timelineStep}>
               <View style={styles.dotContainer}>
                 <View style={[styles.dot, styles.dotBlack]} />
               </View>
               <View style={styles.stepTextContainer}>
                 <Text style={styles.stepLabel}>PICKUP</Text>
                 <Text style={styles.stepValue} numberOfLines={2}>
                   Kampala, Makindye
                 </Text>
               </View>
             </View>

             {/* Delivery */}
             <View style={styles.timelineStep}>
               <View style={styles.dotContainer}>
                 <View style={[styles.dot, styles.dotDarkGreen]} />
               </View>
               <View style={[styles.stepTextContainer, { paddingBottom: 0 }]}>
                 <Text style={styles.stepLabel}>DELIVERY</Text>
                 <Text style={styles.stepValue} numberOfLines={2}>
                   Jinja, Industrial Area
                 </Text>
               </View>
             </View>
           </View>
           
           {/* Cargo specifics unique to this page */}
           <View style={styles.modernCargoList}>
              <View style={styles.cargoItem}>
                 <Image source={require("@/assets/images/cargo_box.png")} style={styles.cargoItemImg} contentFit="cover" />
                 <View style={styles.cargoItemDetails}>
                    <Text style={styles.cargoItemTitle}>Fragile Cargo</Text>
                    <Text style={styles.cargoItemMeta}>40x40x50 cm • 15 kg</Text>
                 </View>
              </View>
              <View style={styles.cargoItem}>
                 <Image source={require("@/assets/images/cargo_box.png")} style={styles.cargoItemImg} contentFit="cover" />
                 <View style={styles.cargoItemDetails}>
                    <Text style={styles.cargoItemTitle}>Bulk Cargo</Text>
                    <Text style={styles.cargoItemMeta}>120x80x100 cm • 200 kg</Text>
                 </View>
              </View>
              <View style={styles.cargoItem}>
                 <Image source={require("@/assets/images/cargo_box.png")} style={styles.cargoItemImg} contentFit="cover" />
                 <View style={styles.cargoItemDetails}>
                    <Text style={styles.cargoItemTitle}>General Cargo</Text>
                    <Text style={styles.cargoItemMeta}>60x40x40 cm • 25 kg</Text>
                 </View>
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
  modernCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  modernSubheadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  modernSubheading: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#9CA3AF", // gray-400 for a suitably grayed out look
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  modernTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modernOrderId: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1C1917", // near black
  },
  modernPriceText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1C1917",
  },
  timelineWrapper: {
    position: "relative",
    width: "100%",
  },
  timelineDashedLine: {
    position: "absolute",
    left: 7, // centered under dot -> 14px width dot -> center is 7
    top: 14, // below top dot
    bottom: 24, // stop above bottom dot bounding box
    width: 0,
    borderLeftWidth: 2,
    borderColor: "#0F3D26",
    borderStyle: "dashed",
    zIndex: 1,
    opacity: 0.8,
  },
  timelineStep: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  dotContainer: {
    alignItems: "center",
    width: 14, // strictly dot width
    marginRight: 16,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 2,
    zIndex: 2,
  },
  dotBlack: {
    backgroundColor: "#1F2937",
  },
  dotDarkGreen: {
    backgroundColor: "#0F3D26", // brand-forest
  },
  stepTextContainer: {
    flex: 1,
    paddingBottom: 22,
  },
  stepLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 2,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  stepValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
    lineHeight: 20,
  },
  modernCargoList: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    gap: 16,
  },
  cargoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cargoItemImg: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cargoItemDetails: {
    flex: 1,
  },
  cargoItemTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  cargoItemMeta: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
});
