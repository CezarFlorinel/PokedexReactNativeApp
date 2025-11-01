import PokemonList from "@/components/ui/pokemon-list";
import { useFavorites } from "@/hooks/use-favorites";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FavoritesScreen() {
  const { data: favorites, isLoading, error } = useFavorites();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#EF5350" />
        <Text>Loading favorites…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>Failed to load favorites. Try again later.</Text>
      </View>
    );
  }

  const gridData =
    (favorites ?? []).map((f: any) => ({
      id: Number(f.id),
      name: f.name,
    })) ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My favorites</Text>

      {gridData.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No favorites yet!</Text>
          <Text style={styles.subText}>Tap the heart on any Pokémon to save it.</Text>
        </View>
      ) : (
        <PokemonList
          data={gridData}
          // no infinite scroll here; it’s local DB data
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 6, paddingBottom: -50, backgroundColor: "#f0f8ff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginVertical: 12, marginLeft: 12, color: "#0E0940" },
  emptyText: { fontSize: 18, color: "#666", textAlign: "center", marginBottom: 6 },
  subText: { fontSize: 14, color: "#999", textAlign: "center" },
});
