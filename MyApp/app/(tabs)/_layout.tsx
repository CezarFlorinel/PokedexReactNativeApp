// app/(tabs)/_layout.tsx  (adjust the path if your file is elsewhere)
import { Image } from "react-native";
import { Tabs } from "expo-router";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#5631E8",
        tabBarInactiveTintColor: "#666",
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Pokémon",
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require("../../assets/images/pokeballs.png")}
              style={{
                width: size,
                height: size,
                tintColor: color,    // works best if the PNG is pure white on transparent
                resizeMode: "contain",
              }}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
