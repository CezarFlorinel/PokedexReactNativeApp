import { PokemonImage } from "@/components/ui/pokemon-image";
import { useIsFavorite, useToggleFavorite } from "@/hooks/use-favorites";
import {
  idFromUrl,
  useEvolutionChain,
  usePokemonByName,
  usePokemonSpeciesByName,
} from "@/hooks/use-pokemon";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView, StyleSheet, Text, View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type TabKey = "about" | "stats" | "evolution";

export default function PokemonDetailScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const { data: pokemon, isLoading, error } = usePokemonByName(name || "");
  const { data: species } = usePokemonSpeciesByName(name || "");
  const chainId = useMemo(
    () => idFromUrl(species?.evolution_chain?.url ?? null) ?? undefined,
    [species]
  );
  const { data: chain } = useEvolutionChain(chainId);

  const [tab, setTab] = useState<TabKey>("about");

  // favorite state
  const idNum = pokemon?.id ?? 0;
  const { data: isFav } = useIsFavorite(idNum);
  const toggleFavorite = useToggleFavorite();

const TYPE_COLORS: Record<string, string> = { // just use this made by chatgpt, looks good
  normal:  "#A8A77A",
  fire:    "#EE8130",
  water:   "#6390F0",
  electric:"#F7D02C",
  grass:   "#7AC74C",
  ice:     "#96D9D6",
  fighting:"#C22E28",
  poison:  "#A33EA1",
  ground:  "#E2BF65",
  flying:  "#A98FF3",
  psychic: "#F95587",
  bug:     "#A6B91A",
  rock:    "#B6A136",
  ghost:   "#735797",
  dragon:  "#6F35FC",
  dark:    "#705746",
  steel:   "#B7B7CE",
  fairy:   "#D685AD",
};

function getTypeColor(type: string) {
  return TYPE_COLORS[type.toLowerCase()] ?? "#888";
}

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#5631E8" />
          <Text style={{ marginTop: 8, color: "#5631E8" }}>Loading Pokémon…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !pokemon) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={{ color: "#666" }}>Pokémon not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const title = capitalize(pokemon.name);
  const idPadded = String(pokemon.id).padStart(3, "0");
  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;

  // Evolution list (flatten chain)
  const evolutions = useMemo(() => flattenEvolution(chain?.chain), [chain]);
  return (
   <SafeAreaView style={styles.container}>
  <ScrollView contentContainerStyle={styles.scrollContent}>
    {/* header  */}
    <View style={styles.headerContainer}>
      <View style={styles.topBar}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#0E0940" />
        </Pressable>

        <Pressable
          style={styles.iconBtn}
          onPress={() =>
            toggleFavorite.mutate({
              pokemonId: idNum,
              name: pokemon.name,
              imageUrl,
              isCurrentlyFavorite: !!isFav,
            })
          }
        >
          <Ionicons
            name={isFav ? "heart" : "heart-outline"}
            size={22}
            color={isFav ? "#EF5350" : "#0E0940"}
          />
        </Pressable>
      </View>

      {/* Name + ID */}
      <View style={styles.nameRow}>
        <Text numberOfLines={1} style={styles.pokemonName}>{title}</Text>
        <Text style={styles.pokemonId}>{idPadded}</Text>
      </View>
    </View>

        {/* Types on blue background */}
<View style={styles.typesRow}>
  {pokemon.types.map((t, i) => (
    <View key={i} style={styles.typeBadge}>
      <View style={[styles.typeDot, { backgroundColor: getTypeColor(t.type.name) }]} />
      <Text style={styles.typeText}>{capitalize(t.type.name)}</Text>
    </View>
  ))}
</View>

        {/* Big image on blue background */}
        <View style={styles.heroImageWrap}>
          <PokemonImage id={pokemon.id} size={220} />
        </View>

        {/* ===== White panel starts here ===== */}
        <View style={styles.panel}>
          {/* Tabs */}
          <View style={styles.tabsRow}>
            <Tab label="About" active={tab === "about"} onPress={() => setTab("about")} />
            <Tab label="Stats" active={tab === "stats"} onPress={() => setTab("stats")} />
            <Tab label="Evolution" active={tab === "evolution"} onPress={() => setTab("evolution")} />
          </View>

          {/* About */}
          {tab === "about" && (
            <View style={styles.card}>
              <InfoRow label="Name" value={title} />
              <InfoRow label="ID" value={idPadded} />
              <InfoRow label="Base" value={`${pokemon.base_experience ?? "-"} XP`} />
              <InfoRow label="Weight" value={`${(pokemon.weight ?? 0) / 10} kg`} />
              <InfoRow label="Height" value={`${(pokemon.height ?? 0) / 10} m`} />
              <InfoRow
                label="Types"
                value={pokemon.types.map((t) => capitalize(t.type.name)).join(", ")}
              />
              <InfoRow
                label="Abilities"
                value={pokemon.abilities
                  .map((a) => capitalize(a.ability.name.replace("-", " ")))
                  .join(", ")}
              />
            </View>
          )}

          {/* Stats */}
          {tab === "stats" && (
            <View style={styles.card}>
              {pokemon.stats.map((s, i) => (
                <StatRow key={i} label={formatStatName(s.stat.name)} value={s.base_stat} max={200} />
              ))}
            </View>
          )}

          {/* Evolution */}
          {tab === "evolution" && (
            <View style={[styles.card, { gap: 12 }]}>
              {evolutions.length === 0 && (
                <Text style={{ color: "#666" }}>This Pokémon does not evolve.</Text>
              )}
              {evolutions.map((evo) => (
                <View key={evo.id} style={styles.evoRow}>
                  <View style={styles.evoLeft}>
                    <View style={styles.evoIdBadge}>
                      <Text style={styles.evoIdText}>{String(evo.id).padStart(3, "0")}</Text>
                    </View>
                    <Image
                      source={{
                        uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evo.id}.png`,
                      }}
                      style={{ width: 40, height: 40 }}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.evoName}>{capitalize(evo.name)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        {/* ===== White panel ends ===== */}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- Small components ---------- */

function Tab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.tabBtn}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
      {active && <View style={styles.tabUnderline} />}
    </Pressable>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function StatRow({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.min(1, value / max);
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={styles.statRow}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct * 100}%` }]} />
      </View>
    </View>
  );
}

/* ---------- Helpers ---------- */

function flattenEvolution(node: any | undefined): { id: number; name: string }[] {
  if (!node) return [];
  const out: { id: number; name: string }[] = [];
  const walk = (n: any) => {
    const name: string = n?.species?.name ?? "";
    const id = idFromUrl(n?.species?.url) ?? 0;
    if (id && name) out.push({ id, name });
    (n?.evolves_to || []).forEach(walk);
  };
  walk(node);
  return out;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatStatName(s: string) {
  const map: Record<string, string> = {
    "special-attack": "Special Attack",
    "special-defense": "Special Defense",
  };
  return map[s] || capitalize(s);
}

/* ---------- Styles ---------- */

const BLUE_BG = "#edf6ff";
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BLUE_BG },

    headerContainer: {
    backgroundColor: BLUE_BG,
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  // REPLACES actionsRow
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  typesRow: {
  flexDirection: "row",
  gap: 8,
  paddingHorizontal: 16,
  paddingTop: 8,
},

typeBadge: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  backgroundColor: "#E6ECF6", // subtle pill background
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 20,
},

typeDot: {
  width: 12,
  height: 12,
  borderRadius: 6,
},

typeText: {
  color: "#0E0940",
  fontWeight: "800",
},

  // REPLACES header
  nameRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },

  pokemonName: {
    flexShrink: 1,
    fontSize: 32,
    fontWeight: "800",
    color: "#0E0940",
    textTransform: "capitalize",
    paddingRight: 12,
  },

  // let content stretch so the panel sits right under the image
  scrollContent: { paddingBottom: 24 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  actionsRow: {
    paddingHorizontal: 12,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  pokemonId: { fontSize: 32, color: "#999", fontWeight: "300" },

  // keep hero on blue bg
  heroImageWrap: {
    backgroundColor: BLUE_BG,
    marginTop: 12,
    paddingVertical: 18,
    alignItems: "center",
  },

  /** White panel that starts below the image */
  panel: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 8,
    // Pull the white panel slightly up to tuck under the image for a seamless look
    marginTop: -8,
  },

  tabsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  tabBtn: { alignItems: "center", paddingBottom: 8, flex: 1 },
  tabText: { color: "#8083A3", fontWeight: "700" },
  tabTextActive: { color: "#5631E8" },
  tabUnderline: {
    marginTop: 6,
    height: 2,
    width: "90%",
    backgroundColor: "#5631E8",
    borderRadius: 2,
  },

  // inner cards remain white
  card: {
    marginTop: 12,
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  infoLabel: { color: "#8083A3", fontWeight: "700" },
  infoValue: { color: "#0E0940", fontWeight: "700" },

  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  statLabel: { color: "#0E0940", fontWeight: "700" },
  statValue: { color: "#0E0940", fontWeight: "700" },
  progressTrack: {
    height: 6,
    backgroundColor: "#E8E1FF",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#5631E8" },

  evoRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8FF",
    padding: 12,
    borderRadius: 12,
  },
  evoLeft: { flexDirection: "row", alignItems: "center", gap: 8, width: 90 },
  evoIdBadge: {
    backgroundColor: "#A64AC9",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  evoIdText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
  evoName: { fontSize: 16, fontWeight: "700", color: "#0E0940" },

  
});

