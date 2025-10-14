import PokemonList from "@/components/ui/pokemon-list";
import { useInfinitePokemonList, mapPagesToBasics } from "@/hooks/use-pokemon"; // ✅ change
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PokemonScreen() {
  // use infinite query (default page size = 150)
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfinitePokemonList();

  const flatData = mapPagesToBasics(data); // flatten pages -> BasicPokemon[]

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#EF5350" />
        <Text>Loading Pokémon…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>Failed to load. Try again later.</Text>
      </View>
    );
  }

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>All Pokémon</Text>
      <PokemonList
        data={flatData}
        onEndReached={loadMore}                 
        isFetchingNextPage={isFetchingNextPage} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 6, paddingVertical: 0, backgroundColor: "#f0f8ff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginVertical: 12, marginLeft: 12, color: "#0E0940" },
});
