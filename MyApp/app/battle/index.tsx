// app/battle/index.tsx
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  usePokemonByName,
  mapPagesToBasics,
  useInfinitePokemonList,
} from "@/hooks/use-pokemon";

const BLUE_BG = "#edf6ff";

// ---- pixel sprite helpers ----
const pixelFront = (id: number | string) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/${id}.png`;
const pixelBack = (id: number | string) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/back/${id}.png`;

// ---- local type icons (PNG) ----
// Place PNGs in assets/images/types/<type>.png (lowercase)
const TYPE_ICONS: Record<string, any> = {
  bug: require("../../assets/images/types/Type=Bug.png"),
  dark: require("../../assets/images/types/Type=Dark.png"),
  dragon: require("../../assets/images/types/Type=Dragon.png"),
  electric: require("../../assets/images/types/Type=Electric.png"),
  fairy: require("../../assets/images/types/Type=Fairy.png"),
  fighting: require("../../assets/images/types/Type=Fighting.png"),
  fire: require("../../assets/images/types/Type=Fire.png"),
  flying: require("../../assets/images/types/Type=Flying.png"),
  ghost: require("../../assets/images/types/Type=Ghost.png"),
  grass: require("../../assets/images/types/Type=Grass.png"),
  ground: require("../../assets/images/types/Type=Ground.png"),
  ice: require("../../assets/images/types/Type=Ice.png"),
  normal: require("../../assets/images/types/Type=Normal.png"),
  poison: require("../../assets/images/types/Type=Poison.png"),
  psychic: require("../../assets/images/types/Type=Psychic.png"),
  rock: require("../../assets/images/types/Type=Rock.png"),
  steel: require("../../assets/images/types/Type=Steel.png"),
  water: require("../../assets/images/types/Type=Water.png"),
};

const BATTLE_ICON = require("../../assets/images/BattleIconColor.png");
const POKE_BALL_ICON = require("../../assets/images/pokeball.png");

export default function BattleScreen() {
  const { myId, myName } = useLocalSearchParams<{ myId?: string; myName?: string }>();

  // your Pokémon (for name + types)
  const { data: myPokemon } = usePokemonByName(myName ?? "");

  // list to pick opponent
  const {
    data,
    isLoading: listLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfinitePokemonList();
  const grid = mapPagesToBasics(data);

  const [opponent, setOpponent] = useState<{ id: number; name: string } | null>(null);

  // fetch opponent details (to get types) only when selected
  const OppTypes = opponent ? <OpponentTypes name={opponent.name} /> : null;

  const myIdNum = useMemo(() => Number(myId ?? myPokemon?.id ?? 0), [myId, myPokemon?.id]);
  const oppIdNum = opponent?.id ?? 4; // preview: Charmander

  return (
    <View style={styles.container}>
      {/* top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn} accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={22} color="#0E0940" />
        </Pressable>
        <Text style={styles.headerTitle}>Details</Text>
        <View style={styles.iconBtn} />
      </View>

      {/* arena with background image */}
      <ImageBackground
        source={require("../../assets/images/battle-scene.png")}
        resizeMode="cover"
        style={styles.arena}
      >
        {/* your back sprite — mirrored so it faces RIGHT */}
        <Image source={{ uri: pixelBack(myIdNum) }} style={styles.mySprite} resizeMode="contain" />
        {/* opponent front sprite */}
        <Image source={{ uri: pixelFront(oppIdNum) }} style={styles.enemySprite} resizeMode="contain" />
      </ImageBackground>

      {/* names + types */}
      <View style={styles.cardRow}>
        {/* left: YOU */}
        <View style={styles.sideCard}>
          <Text style={styles.pokeName} numberOfLines={1}>
            {capitalize(myPokemon?.name ?? myName ?? "You")}
          </Text>
          <View style={styles.typeRow}>
            {(myPokemon?.types ?? []).map((t, i) => (
              <TypeChip key={i} type={t.type.name} />
            ))}
          </View>
        </View>

        <View>
          <Image source={BATTLE_ICON} style={{ width: 70, height: 70 }} />
        </View>

        {/* right: OPPONENT (right aligned) */}
        <View style={[styles.sideCard, styles.rightAligned]}>
          <Text style={[styles.pokeName, styles.rightText]} numberOfLines={1}>
            {opponent ? capitalize(opponent.name) : "Select rival"}
          </Text>
          {OppTypes}
        </View>
      </View>

      <Text style={styles.subtitle}>Select your opponent</Text>

      {listLoading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.muted}>Loading list…</Text>
        </View>
      ) : (
        <FlatList
          data={grid}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          renderItem={({ item }) => {
            const selected = opponent?.id === item.id;
            return (
              <Pressable onPress={() => setOpponent(item)} style={[styles.rowCard, selected && styles.rowCardActive]}>
                <Image source={{ uri: pixelFront(item.id) }} style={{ width: 40, height: 40 }} resizeMode="contain" />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <View style={styles.idBadge}>
                    <Text style={styles.idText}>{String(item.id).padStart(3, "0")}</Text>
                  </View>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {capitalize(item.name)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#8083A3" />
              </Pressable>
            );
          }}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={{ paddingVertical: 12 }}>
                <ActivityIndicator />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

/** Loads a Pokémon by name and renders its type chips. */
function OpponentTypes({ name }: { name: string }) {
  const { data, isLoading } = usePokemonByName(name);
  if (isLoading || !data) return null;
  return (
    <View style={[styles.typeRow, { justifyContent: "flex-end" }]}>
      {data.types.map((t: any, i: number) => (
        <TypeChip key={i} type={t.type.name} />
      ))}
    </View>
  );
}

/** A pill with icon + type label using local PNGs. */
function TypeChip({ type }: { type: string }) {
  const key = type.toLowerCase();
  const icon = TYPE_ICONS[key];
  return (
    <View style={styles.typeChip}>
      {icon ? <Image source={icon} style={{ width: 40, height: 40 }} /> : null}
    </View>
  );
}

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BLUE_BG,paddingBottom: 50 },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 50,
    paddingBottom: 8,
    gap: 8,
  },
  headerTitle: { flex: 1, textAlign: "left", color: "#0E0940", fontWeight: "700", fontSize: 16 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },

  arena: {
    height: 180,
    marginHorizontal: 12,
    borderRadius: 14,
    overflow: "hidden",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 16,
  },
  mySprite: {
    width: 120,
    height: 120,
    transform: [{ scaleX: 1 }], // face RIGHT DONT CHANGEEEEEEEEEEE
  },
  enemySprite: { width: 120, height: 120 },

  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginHorizontal: 12,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 14,
    gap: 10,
  },
  sideCard: { flex: 1 },
  rightAligned: { alignItems: "flex-end" },
  rightText: { textAlign: "right", alignSelf: "stretch" },

  pokeName: { color: "#0E0940", fontWeight: "800", fontSize: 16 },
  subtle: { color: "#8083A3", marginTop: 2 },

  typeRow: { flexDirection: "row", flexWrap: "wrap" },
  typeChip: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  typeText: { color: "#0E0940", fontWeight: "700", fontSize: 12 },

  subtitle: {
    marginTop: 14,
    marginBottom: 4,
    marginHorizontal: 16,
    color: "#0E0940",
    fontWeight: "800",
    fontSize: 18,
  },

  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 3,
  },
  rowCardActive: { borderWidth: 2, borderColor: "#6D55FF" },

  idBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#7C5CFF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 6,
  },
  idText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  itemName: { color: "#0E0940", fontWeight: "700", fontSize: 15 },

  center: { alignItems: "center", justifyContent: "center", paddingVertical: 24 },
  muted: { color: "#666", marginTop: 6 },
});
