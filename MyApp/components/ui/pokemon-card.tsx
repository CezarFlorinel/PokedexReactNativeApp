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
  onPress?: () => void;
}

export default function PokemonCard({ pokemon, onPress }: PokemonCardProps) {
  const idNum = Number(pokemon.id);
  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${idNum}.png`;

  const { data: isFav } = useIsFavorite(idNum);
  const toggleFavorite = useToggleFavorite();
  const [menuVisible, setMenuVisible] = useState(false);

  const openDetails = () => {
    setMenuVisible(false);
    if (onPress) onPress();
    else router.push({ pathname: "/pokemon/[name]", params: { name: pokemon.name } });
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
        url: imageUrl,
        title: `Pokémon • ${capitalize(pokemon.name)}`,
      });
    } catch {}
  };

  return (
    <>
      <TouchableOpacity style={styles.card} onPress={openDetails} activeOpacity={0.9}>
        {/* Top (pink) image section */}
        <View style={styles.imageSection}>
          <View style={styles.idBadge}>
            <Text style={styles.idText}>{String(idNum).padStart(3, "0")}</Text>
          </View>

          {/* Scaled sprite (visual scale only; layout unchanged) */}
          <View style={styles.spriteWrap}>
            <PokemonImage id={idNum} size={110} variant="pixel" pixelPerfect />
          </View>
        </View>

        {/* Bottom (white) info strip */}
        <View style={styles.infoSection}>
          <Text numberOfLines={1} style={styles.name}>
            {capitalize(pokemon.name)}
          </Text>

          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              setMenuVisible(true);
            }}
            hitSlop={12}
            style={styles.menuButton}
          >
            <Ionicons name="ellipsis-vertical" size={18} color="#0E0940" />
          </Pressable>
        </View>
      </TouchableOpacity>

      {/* Bottom sheet */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setMenuVisible(false)} />
        <View style={styles.sheet}>
          <MenuItem icon="open-outline" label="Open Pokémon" onPress={openDetails} />
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
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },

  /* Top image section (pink) */
  imageSection: {
    backgroundColor: "#F6F6FF",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 4,
    paddingBottom: 5,
    minHeight: 150,
  },

  // 👇 visual up-scale that doesn't affect layout
  spriteWrap: {
    transform: [{ scale: 1.50 }], // adjust 1.12 – 1.25 to taste
    overflow: "visible",
  },

  idBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#7C5CFF",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    zIndex: 1,
  },
  idText: { color: "#fff", fontWeight: "bold", fontSize: 10 },

  /* Bottom info strip (white) */
  infoSection: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  name: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: "#0E0940",
  },
  menuButton: {
    height: 30,
    width: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
  },

  /* Modal sheet */
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.25)" },
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
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 14 },
  menuText: { marginLeft: 8, fontSize: 16, color: "#0E0940", fontWeight: "600" },
});
