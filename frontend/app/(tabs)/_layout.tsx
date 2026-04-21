import { Tabs, useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { Package, ReceiptText, User, Plus, Mail } from "lucide-react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#0F3D26",
        tabBarInactiveTintColor: "#a8a29e", // stone-400
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#F5F5F4", // stone-100
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 25,
          paddingTop: 10,
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          position: "absolute",
          bottom: 0,
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 15,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Package size={24} color={color} />,
          tabBarLabelStyle: { fontSize: 10, fontWeight: "bold", marginTop: 4 },
        }}
      />
      <Tabs.Screen
        name="receipts"
        options={{
          title: "Orders",
          tabBarIcon: ({ color }) => <ReceiptText size={24} color={color} />,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "bold",
            marginTop: 4,
            textTransform: "uppercase",
          },
        }}
      />

      {/* Central Post Load Button Placeholder Tab */}
      <Tabs.Screen
        name="post-load-placeholder"
        options={{
          title: "Post Load",
          tabBarButton: () => (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              <View
                style={{ position: "absolute", top: -24, alignItems: "center" }}
              >
                <TouchableOpacity
                  onPress={() => router.push("/create-load")}
                  activeOpacity={0.8}
                  style={{
                    width: 64,
                    height: 64,
                    backgroundColor: "#0F3D26",
                    borderRadius: 32,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 4,
                    borderColor: "#FFFFFF",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                  }}
                >
                  <Plus size={32} color="#FFD700" strokeWidth={3} />
                </TouchableOpacity>
                <Text
                  style={{
                    marginTop: 4,
                    fontSize: 10,
                    fontWeight: "900",
                    color: "#0F3D26",
                    textTransform: "uppercase",
                  }}
                >
                  Post Load
                </Text>
              </View>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="inbox"
        options={{
          title: "Inbox",
          tabBarIcon: ({ color }) => <Mail size={24} color={color} />,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "bold",
            marginTop: 4,
            textTransform: "uppercase",
          },
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "bold",
            marginTop: 4,
            textTransform: "uppercase",
          },
        }}
      />
    </Tabs>
  );
}
