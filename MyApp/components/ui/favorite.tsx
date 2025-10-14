import { useIsFavorite, useToggleFavorite } from "@/hooks/use-favorites";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity } from "react-native";

interface FavoriteProps {
  pokemonId: number;
  pokemonName: string;
  imageUrl?: string;
}

export default function Favorite({ pokemonId, pokemonName, imageUrl }: FavoriteProps) {
  const { data: isFavorited, isLoading } = useIsFavorite(pokemonId);
  const toggleFavorite = useToggleFavorite();

  const handleToggle = () => {
    if (isLoading) return;

    toggleFavorite.mutate({
      pokemonId,
      name: pokemonName,
      imageUrl,
      isCurrentlyFavorite: isFavorited || false,
    });
  };

  return (
    <TouchableOpacity
      style={styles.favoriteButton}
      onPress={handleToggle}
      disabled={toggleFavorite.isPending}
    >
      <Ionicons
        name={isFavorited ? "heart" : "heart-outline"}
        size={24}
        color={isFavorited ? "#FF6B6B" : "#666"}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  favoriteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
});
