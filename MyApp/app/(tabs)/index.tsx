import PokemonList from "@/components/ui/pokemon-list";
import SearchBar from "@/components/ui/search-bar";
import { useInfinitePokemonList, mapPagesToBasics } from "@/hooks/use-pokemon";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PokemonScreen() {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfinitePokemonList();

  const flatData = mapPagesToBasics(data); // BasicPokemon[]

  const [query, setQuery] = useState("");

  // case-insensitive contains match
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return flatData;
    return flatData.filter(p => p.name.toLowerCase().includes(q));
  }, [flatData, query]);

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
    // When searching, don't fetch more pages.
    if (query) return;
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>All Pokémon</Text>

      <View style={styles.searchWrap}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          onClear={() => setQuery("")}
        />
      </View>

      <PokemonList
        data={filtered}
        onEndReached={loadMore}
        isFetchingNextPage={isFetchingNextPage}
      />

      {query.length > 0 && filtered.length === 0 && (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>No Pokémon match “{query}”.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 6, paddingVertical: 0, backgroundColor: "#f0f8ff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginVertical: 12, marginLeft: 12, color: "#0E0940" },
  searchWrap: { paddingHorizontal: 6, marginBottom: 8 },
  emptyWrap: { alignItems: "center", paddingVertical: 16 },
  emptyText: { color: "#666" },
});

