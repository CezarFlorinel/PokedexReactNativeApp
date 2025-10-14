import PokemonList from "@/components/ui/pokemon-list";
import SearchBar from "@/components/ui/search-bar";
import {
  useInfinitePokemonList,
  mapPagesToBasics,
  usePokemonIndex
} from "@/hooks/use-pokemon";
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

  const { data: fullIndex, isLoading: indexLoading } = usePokemonIndex();

  const flatData = mapPagesToBasics(data); // page-based list (for empty search)
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return flatData;                   // show paged list
    if (!fullIndex) return [];                 // wait for index
    return fullIndex.filter(p => p.name.toLowerCase().includes(q));
  }, [flatData, fullIndex, query]);

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
    // disable infinite load during search; filter is already “full DB”
    if (query) return;
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  const showIndexSpinner = query.length > 0 && indexLoading;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>All Pokémon</Text>

      <View style={styles.searchWrap}>
        <SearchBar value={query} onChangeText={setQuery} onClear={() => setQuery("")} />
      </View>

      {showIndexSpinner ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text>Searching entire Pokédex…</Text>
        </View>
      ) : (
        <PokemonList
          data={filtered}
          onEndReached={loadMore}
          isFetchingNextPage={!query && isFetchingNextPage}
        />
      )}

      {query.length > 0 && !indexLoading && filtered.length === 0 && (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>No Pokémon match “{query}”.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 6, backgroundColor: "#f0f8ff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginVertical: 12, marginLeft: 12, color: "#0E0940" },
  searchWrap: { paddingHorizontal: 6, marginBottom: 8 },
  emptyWrap: { alignItems: "center", paddingVertical: 16 },
  emptyText: { color: "#666" },
});

