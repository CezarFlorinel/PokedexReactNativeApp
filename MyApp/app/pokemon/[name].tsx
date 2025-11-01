import { PokemonImage } from "@/components/ui/pokemon-image";
import AppText from "@/components/ui/app-text"
import { useIsFavorite, useToggleFavorite } from "@/hooks/use-favorites";
import {
  idFromUrl,
  useEvolutionChain,
  usePokemonByName,
  usePokemonSpeciesByName,
} from "@/hooks/use-pokemon";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  View,
  Dimensions,
  Animated,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import PagerView from "react-native-pager-view";
import { BlurView } from "expo-blur";

type TabKey = "about" | "stats" | "evolution";
const TAB_TO_INDEX: Record<TabKey, number> = { about: 0, stats: 1, evolution: 2 };
const INDEX_TO_TAB: TabKey[] = ["about", "stats", "evolution"];
const BLUE_BG = "#edf6ff";

const TYPE_COLORS: Record<string, string> = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};

const { height: SCREEN_H } = Dimensions.get("window");
const PAGER_HEIGHT = Math.max(560, SCREEN_H * 0.8);
const HEADER_BAR_HEIGHT = 48; // height of the row with buttons/title

export default function PokemonDetailScreen() {
  const insets = useSafeAreaInsets();
  const { name } = useLocalSearchParams<{ name: string }>();

  // Hooks (stable order)
  const { data: pokemon, isLoading, error } = usePokemonByName(name || "");
  const { data: species } = usePokemonSpeciesByName(name || "");
  const chainId = useMemo(
    () => idFromUrl(species?.evolution_chain?.url ?? null) ?? undefined,
    [species]
  );
  const {
    data: chain,
    isLoading: isChainLoading,
    isError: isChainError,
    error: chainError,
  } = useEvolutionChain(chainId);

  const [tab, setTab] = useState<TabKey>("about");
  const pagerRef = useRef<PagerView>(null);

  const idNum = pokemon?.id ?? 0;
  const { data: isFav } = useIsFavorite(idNum);
  const toggleFavorite = useToggleFavorite();

  const scrollY = useRef(new Animated.Value(0)).current;
  const titleOpacity = scrollY.interpolate({
    inputRange: [0, 40, 90],
    outputRange: [0, 0, 1],
    extrapolate: "clamp",
  });

  const evolutions = useMemo(() => flattenEvolution(chain?.chain), [chain]);

  // No hooks below

  function getTypeColor(type: string) {
    return TYPE_COLORS[type.toLowerCase()] ?? "#888";
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#5631E8" />
          <AppText style={{ marginTop: 8, color: "#5631E8" }}>Loading Pokémon…</AppText>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !pokemon) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <AppText style={{ color: "#666" }}>Pokémon not found.</AppText>
        </View>
      </SafeAreaView>
    );
  }

  const title = capitalize(pokemon.name);
  const idPadded = String(pokemon.id).padStart(3, "0");
  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;

  const goToTab = (next: TabKey) => {
    setTab(next);
    pagerRef.current?.setPage(TAB_TO_INDEX[next]);
  };

  // Height we’ll reserve at the top of the scroll content
  const HEADER_TOTAL_HEIGHT = insets.top + HEADER_BAR_HEIGHT + 8; // +8 for breathing room

  return (
    <SafeAreaView style={styles.container}>
      {/* ===== Absolute Header (always on top & clickable) ===== */}
      <View
        style={[
          styles.absoluteHeader,
          { paddingTop: insets.top, height: insets.top + HEADER_BAR_HEIGHT + 8 },
        ]}
      >
        {/* Background (blur on iOS, solid on Android) */}
        {Platform.OS === "ios" ? (
          <>
            <BlurView
              tint="light"
              intensity={28}
              style={StyleSheet.absoluteFillObject}
              pointerEvents="none"
            />
            <View style={styles.stickyTintIOS} pointerEvents="none" />
          </>
        ) : (
          <View style={styles.stickyTintAndroid} pointerEvents="none" />
        )}

        {/* Foreground content */}
        <View style={styles.headerContentRow}>
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

          {/* Title that fades in while scrolling */}
          <Animated.View
            pointerEvents="none"
            style={[styles.headerTitleWrap, { opacity: titleOpacity }]}
          >
            <AppText numberOfLines={1} style={styles.headerTitleText}>
              {title}
            </AppText>
          </Animated.View>
        </View>
      </View>

      {/* ===== Scroll Content (padded down so it never goes under the header) ===== */}
      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: HEADER_TOTAL_HEIGHT, paddingBottom: 24 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Header content (below absolute header) */}
        <View style={styles.headerContainer}>
          <View style={styles.nameRow}>
            <AppText numberOfLines={1} style={styles.pokemonName}>
              {title}
            </AppText>
            <AppText style={styles.pokemonId}>{idPadded}</AppText>
          </View>
        </View>

        {/* Types */}
        <View style={styles.typesRow}>
          {pokemon.types.map((t, i) => (
            <View key={i} style={styles.typeBadge}>
              <View style={[styles.typeDot, { backgroundColor: getTypeColor(t.type.name) }]} />
              <AppText style={styles.typeText}>{capitalize(t.type.name)}</AppText>
            </View>
          ))}
        </View>

        {/* Hero */}
        <View style={styles.heroImageWrap}>
          <PokemonImage id={pokemon.id} size={220} />
        </View>

        {/* Tabs + Pager */}
        <View style={styles.panel}>
          <View style={styles.tabsRow}>
            <Tab label="About" active={tab === "about"} onPress={() => goToTab("about")} />
            <Tab label="Stats" active={tab === "stats"} onPress={() => goToTab("stats")} />
            <Tab label="Evolution" active={tab === "evolution"} onPress={() => goToTab("evolution")} />
          </View>

          <PagerView
            ref={pagerRef}
            style={{ height: PAGER_HEIGHT }}
            initialPage={TAB_TO_INDEX[tab]}
            onPageSelected={(e) => setTab(INDEX_TO_TAB[e.nativeEvent.position])}
          >
            {/* About */}
            <View key="about" style={{ flex: 1 }}>
              <Animated.ScrollView
                contentContainerStyle={{ paddingBottom: 24 }}
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
              >
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
              </Animated.ScrollView>
            </View>

            {/* Stats */}
            <View key="stats" style={{ flex: 1 }}>
              <Animated.ScrollView
                contentContainerStyle={{ paddingBottom: 24 }}
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.card}>
                  {pokemon.stats.map((s, i) => (
                    <StatRow
                      key={i}
                      label={formatStatName(s.stat.name)}
                      value={s.base_stat}
                      max={200}
                    />
                  ))}
                </View>
              </Animated.ScrollView>
            </View>

            {/* Evolution */}
            <View key="evolution" style={{ flex: 1 }}>
              {chainId == null ? (
                <View style={[styles.card, { alignItems: "center" }]}>
                  <AppText style={{ color: "#666" }}>No evolution data for this species.</AppText>
                </View>
              ) : isChainLoading ? (
                <View style={[styles.card, { alignItems: "center" }]}>
                  <ActivityIndicator size="small" color="#5631E8" />
                  <AppText style={{ marginTop: 8, color: "#5631E8" }}>
                    Loading evolution chain…
                  </AppText>
                </View>
              ) : isChainError ? (
                <View style={[styles.card, { alignItems: "center" }]}>
                  <AppText style={{ color: "#D14343", fontWeight: "700" }}>
                    Could not load evolution chain.
                  </AppText>
                  {!!chainError?.message && (
                    <AppText style={{ color: "#999", marginTop: 4 }}>{chainError.message}</AppText>
                  )}
                </View>
              ) : (
                <Animated.ScrollView
                  contentContainerStyle={{ paddingBottom: 24 }}
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.card}>
                    {(!evolutions || evolutions.length === 0) ? (
                      <AppText style={{ color: "#666" }}>This Pokémon does not evolve.</AppText>
                    ) : (
                      evolutions.map((evo, idx) => (
                        <View key={evo.id}>
                          {idx > 0 && <View style={styles.evoConnector} />}
                          <View style={styles.evoCard}>
                            <View style={styles.evoLeftPane}>
                              <Image
                                source={{
                                  uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evo.id}.png`,
                                }}
                                style={styles.evoImage}
                                resizeMode="contain"
                              />
                            </View>
                            <View style={styles.evoRightPane}>
                              <View style={styles.evoIdBadge}>
                                <AppText style={styles.evoIdText}>
                                  {String(evo.id).padStart(3, "0")}
                                </AppText>
                              </View>
                              <AppText style={styles.evoName}>{capitalize(evo.name)}</AppText>
                            </View>
                          </View>
                        </View>
                      ))
                    )}
                  </View>
                </Animated.ScrollView>
              )}
            </View>
          </PagerView>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

/* ---------- Small components ---------- */

function Tab({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.tabBtn}>
      <AppText style={[styles.tabText, active && styles.tabTextActive]}>{label}</AppText>
      {active && <View style={styles.tabUnderline} />}
    </Pressable>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <AppText style={styles.infoLabel}>{label}</AppText>
      <AppText style={styles.infoValue}>{value}</AppText>
    </View>
  );
}

function StatRow({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.min(1, value / max);
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={styles.statRow}>
        <AppText style={styles.statLabel}>{label}</AppText>
        <AppText style={styles.statValue}>{value}</AppText>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BLUE_BG },

  // Absolute header (always clickable)
  absoluteHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 1000,
    backgroundColor: "transparent",
  },

  // iOS tint over blur
  stickyTintIOS: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(237, 246, 255, 0.30)",
  },

  // Android solid bg
  stickyTintAndroid: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BLUE_BG,
  },

  // Header content wrapper (foreground)
  headerContentRow: {
    paddingHorizontal: 16,
    height: HEADER_BAR_HEIGHT + 8, // match space below safe area
    justifyContent: "center",
  },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: HEADER_BAR_HEIGHT,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  // Centered title inside header
  headerTitleWrap: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0E0940",
  },

  headerContainer: {
    backgroundColor: BLUE_BG,
    paddingHorizontal: 16,
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
    backgroundColor: "#E6ECF6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  typeDot: { width: 12, height: 12, borderRadius: 6 },
  typeText: { color: "#0E0940", fontWeight: "800" },

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
  pokemonId: { fontSize: 32, color: "#999", fontWeight: "300" },

  heroImageWrap: {
    backgroundColor: BLUE_BG,
    marginTop: 12,
    paddingVertical: 18,
    alignItems: "center",
  },

  panel: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 16,
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

  // Evolution visuals
  evoConnector: {
    height: 18,
    alignSelf: "center",
    borderLeftWidth: 2,
    borderColor: "#E5D9FF",
    borderStyle: "dashed",
    marginVertical: 6,
  },
  evoCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 14,
  },
  evoLeftPane: {
    width: 76,
    backgroundColor: "#F6E9FF",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
  },
  evoImage: { width: 50, height: 50 },
  evoRightPane: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  evoIdBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#7C5CFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  evoIdText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  evoName: { fontSize: 18, fontWeight: "800", color: "#0E0940" },

  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
});
