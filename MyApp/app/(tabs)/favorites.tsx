import AppText from "@/components/ui/app-text";
import PokemonList from "@/components/ui/pokemon-list";
import { useFavorites } from "@/hooks/use-favorites";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FavoritesScreen() {
  const { data: favorites, isLoading, error } = useFavorites();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#EF5350" />
        <AppText>Loading favorites…</AppText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <AppText>Failed to load favorites. Try again later.</AppText>
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
      <AppText style={styles.title}>My favorites</AppText>

      {gridData.length === 0 ? (
        <View style={styles.center}>
          <AppText style={styles.emptyText}>No favorites yet!</AppText>
          <AppText style={styles.subText}>Tap the heart on any Pokémon to save it.</AppText>
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
