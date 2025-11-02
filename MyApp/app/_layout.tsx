// app/_layout.tsx (or wherever your RootLayout is)
import { databaseService } from "@/services/database";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { ActivityIndicator, View } from "react-native";

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});

export default function RootLayout() {
  // 1) Load Rubik faces (map to easy keys)
  const [fontsLoaded] = useFonts({
    RubikRegular: require("../assets/fonts/Rubik-Regular.ttf"),
    RubikMedium: require("../assets/fonts/Rubik-Medium.ttf"),
    RubikSemiBold: require("../assets/fonts/Rubik-SemiBold.ttf"),
    RubikBold: require("../assets/fonts/Rubik-Bold.ttf"),
    RubikItalic: require("../assets/fonts/Rubik-Italic.ttf"),
    RubikMediumItalic: require("../assets/fonts/Rubik-MediumItalic.ttf"),
    RubikSemiBoldItalic: require("../assets/fonts/Rubik-SemiBoldItalic.ttf"),
    RubikBoldItalic: require("../assets/fonts/Rubik-BoldItalic.ttf"),
  });

  useEffect(() => {
    databaseService.initDatabase().catch(console.error);
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="pokemon/[name]" options={{ headerShown: false }} />
          <Stack.Screen name="battle/index" options={{ headerShown: false }} />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}


