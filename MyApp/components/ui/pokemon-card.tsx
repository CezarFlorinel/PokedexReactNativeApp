import { PokemonImage } from "@/components/ui/pokemon-image";
import { useIsFavorite, useToggleFavorite } from "@/hooks/use-favorites";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Modal,
    Pressable,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface PokemonCardProps {
  pokemon: { id: string | number; name: string };
  onPress?: () => void; // optional; tapping the card can still open details
}

export default function PokemonCard({ pokemon, onPress }: PokemonCardProps) {
  const idNum = Number(pokemon.id);
  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${idNum}.png`;

  const { data: isFav } = useIsFavorite(idNum);
  const toggleFavorite = useToggleFavorite();

  const [menuVisible, setMenuVisible] = useState(false);

  const openDetails = () => {
    setMenuVisible(false);
    if (onPress) {
      onPress();
    } else {
      router.push({ pathname: "/pokemon/[name]", params: { name: pokemon.name } });
    }
  };

  const handleToggleFavorite = () => {
    setMenuVisible(false);
    toggleFavorite.mutate({
      pokemonId: idNum,
      name: pokemon.name,
      imageUrl,
      isCurrentlyFavorite: !!isFav,
    });
  };

  const handleShare = async () => {
    setMenuVisible(false);
    try {
      await Share.share({
        message: `Check out ${capitalize(pokemon.name)}! #${String(idNum).padStart(3, "0")}`,
        url: imageUrl, // iOS reads this; Android uses message contents
        title: `Pokémon • ${capitalize(pokemon.name)}`,
      });
    } catch {
      // ignore
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.card}
        onPress={onPress ?? openDetails}
        activeOpacity={0.85}
      >
        {/* top: id badge */}
        <View style={styles.topRow}>
          <View style={styles.idBadge}>
            <Text style={styles.idText}>#{String(idNum).padStart(3, "0")}</Text>
          </View>
        </View>

        {/* image */}
        <View style={styles.imageWrap}>
          <PokemonImage id={idNum} size={96} />
        </View>

        {/* name + 3-dots menu button */}
        <View style={styles.bottomRow}>
          <Text numberOfLines={1} style={styles.name}>
            {capitalize(pokemon.name)}
          </Text>

          <Pressable
            onPress={() => setMenuVisible(true)}
            hitSlop={12}
            style={styles.menuButton}
          >
            <Ionicons name="ellipsis-vertical" size={18} color="#0E0940" />
          </Pressable>
        </View>
      </TouchableOpacity>

      {/* Bottom-sheet like menu */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setMenuVisible(false)} />
        <View style={styles.sheet}>
          <MenuItem
            icon="open-outline"
            label="Open Pokémon"
            onPress={openDetails}
          />
          <MenuItem
            icon={isFav ? "heart-dislike-outline" : "heart-outline"}
            label={isFav ? "Remove from favorites" : "Add to favorites"}
            onPress={handleToggleFavorite}
          />
          <MenuItem icon="share-outline" label="Share" onPress={handleShare} />
          <View style={styles.sheetHandle} />
        </View>
      </Modal>
    </>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.8}>
      <Ionicons name={icon} size={22} color="#0E0940" style={{ width: 26 }} />
      <Text style={styles.menuText}>{label}</Text>
    </TouchableOpacity>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    margin: 8,
    minHeight: 190,
    // shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  idBadge: {
    backgroundColor: "#A64AC9",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  idText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
  imageWrap: { alignItems: "center", justifyContent: "center", marginTop: 8 },
  bottomRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#0E0940",
  },
  menuButton: {
    height: 28,
    width: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },

  // modal sheet
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  sheetHandle: {
    alignSelf: "center",
    marginTop: 10,
    height: 4,
    width: 40,
    borderRadius: 2,
    backgroundColor: "#ddd",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  menuText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#0E0940",
    fontWeight: "600",
  },
});
