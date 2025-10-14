import PokemonCard from "@/components/ui/pokemon-card";
import { useFavorites } from "@/hooks/use-favorites";
import { router } from "expo-router";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FavoritesScreen() {
  const { data: favorites, isLoading, error } = useFavorites();

  const handlePress = (name: string) => {
    router.push(`/pokemon/${name}`);
  };

  const renderPokemon = ({ item }: { item: any }) => (
    <PokemonCard
      pokemon={{ id: item.id.toString(), name: item.name }}
      onPress={() => handlePress(item.name)}
    />
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#5631E8" />
      </SafeAreaView>
    );
  }

  if (error || !favorites || favorites.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.emptyText}>No favorites yet!</Text>
        <Text style={styles.subText}>Tap a heart to save Pokémon here.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Favorites</Text>
        <Text style={styles.subtitle}>
          {favorites.length} Pokémon saved
        </Text>
      </View>

      <FlatList
        data={favorites}
        renderItem={renderPokemon}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f8ff" },
  header: { padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "#0E0940" },
  subtitle: { fontSize: 16, color: "#666" },
  emptyText: { fontSize: 20, color: "#666", textAlign: "center", marginTop: 100 },
  subText: { fontSize: 16, color: "#999", textAlign: "center", marginTop: 8 },
  list: { padding: 16 },
});
