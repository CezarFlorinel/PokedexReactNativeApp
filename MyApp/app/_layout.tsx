import { databaseService } from "@/services/database";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

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
  useEffect(() => {
    databaseService.initDatabase().catch(console.error);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="pokemon/[name]" options={{ title: "Pokémon Details" }} />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

