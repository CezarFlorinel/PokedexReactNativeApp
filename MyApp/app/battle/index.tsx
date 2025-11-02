// app/battle/index.tsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    ImageBackground,
    Pressable,
    StyleSheet,
    Text,
    View,
    Animated,
    Easing,
    ImageSourcePropType,
    LayoutChangeEvent,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
    usePokemonByName,
    mapPagesToBasics,
    useInfinitePokemonList,
} from "@/hooks/use-pokemon";

const BLUE_BG = "#edf6ff";

// ---- minimal types (no any) ----
type BasicMon = { id: number; name: string };
type NamedType = { type: { name: string } };
type PokemonLite = { id?: number; name?: string; types?: NamedType[] };

const pixelFront = (id: number | string) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/${id}.png`;
const pixelBack = (id: number | string) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/back/${id}.png`;

// ---- local type icons (PNG) ----
const TYPE_ICONS: Record<string, ImageSourcePropType> = {
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
const SLASH_ICON = require("../../assets/images/slash.png");

export default function BattleScreen() {
    const { myId, myName } = useLocalSearchParams<{ myId?: string; myName?: string }>();

    // your Pokémon (for name + types)
    const { data: myPokemon } = usePokemonByName(myName ?? "");
    const myPoke: PokemonLite | undefined = myPokemon;

    // list to pick opponent
    const {
        data,
        isLoading: listLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfinitePokemonList();

    const grid: BasicMon[] = mapPagesToBasics(data) ?? [];

    const [opponent, setOpponent] = useState<BasicMon | null>(null);
    const OppTypes = opponent ? <OpponentTypes name={opponent.name} /> : null;

    const myIdNum = useMemo(
        () => Number(myId ?? (myPoke?.id ?? 0)),
        [myId, myPoke?.id]
    );
    const oppIdNum = opponent?.id ?? 4; // preview: Charmander

    // ===== shaking pokéball when no opponent =====
    const shakeBall = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        let anim: Animated.CompositeAnimation | null = null;
        if (!opponent) {
            anim = Animated.loop(
                Animated.sequence([
                    Animated.timing(shakeBall, { toValue: -6, duration: 120, easing: Easing.linear, useNativeDriver: true }),
                    Animated.timing(shakeBall, { toValue: 6, duration: 120, easing: Easing.linear, useNativeDriver: true }),
                    Animated.timing(shakeBall, { toValue: -6, duration: 120, easing: Easing.linear, useNativeDriver: true }),
                    Animated.timing(shakeBall, { toValue: 0, duration: 120, easing: Easing.linear, useNativeDriver: true }),
                ])
            );
            anim.start();
        } else {
            shakeBall.stopAnimation();
            shakeBall.setValue(0);
        }
        return () => { if (anim) anim.stop(); };
    }, [opponent, shakeBall]);

    // ===== SIMPLE BATTLE STATE =====
    const [battling, setBattling] = useState(false);
    const [myHits, setMyHits] = useState(0);     // hits TAKEN by me
    const [oppHits, setOppHits] = useState(0);   // hits TAKEN by opponent
    const [turn, setTurn] = useState<"me" | "opp">("me");
    const [result, setResult] = useState<null | "win" | "lose">(null);

    // ===== ARENA measurements for slash travel =====
    const [arenaWidth, setArenaWidth] = useState(0);
    const onArenaLayout = (e: LayoutChangeEvent) => setArenaWidth(e.nativeEvent.layout.width);

    // ===== ATTACK ANIMATION VALUES =====
    // attacker shake
    const myShake = useRef(new Animated.Value(0)).current;
    const oppShake = useRef(new Animated.Value(0)).current;
    // defender hit flash
    const myFlash = useRef(new Animated.Value(1)).current;
    const oppFlash = useRef(new Animated.Value(1)).current;
    // slash projectile
    const slashX = useRef(new Animated.Value(0)).current;
    const slashOpacity = useRef(new Animated.Value(0)).current;
    const [slashDir, setSlashDir] = useState<"meToOpp" | "oppToMe">("meToOpp");

    const randHits = () => 1 + Math.floor(Math.random() * 3); // 1..3

    // Shake helper
    const runShake = (val: Animated.Value) =>
        Animated.sequence([
            Animated.timing(val, { toValue: -6, duration: 60, easing: Easing.linear, useNativeDriver: true }),
            Animated.timing(val, { toValue: 6, duration: 120, easing: Easing.linear, useNativeDriver: true }),
            Animated.timing(val, { toValue: 0, duration: 60, easing: Easing.linear, useNativeDriver: true }),
        ]);

    // Defender flash helper
    const runFlash = (val: Animated.Value) =>
        Animated.sequence([
            Animated.timing(val, { toValue: 0.25, duration: 70, useNativeDriver: true }),
            Animated.timing(val, { toValue: 1, duration: 90, useNativeDriver: true }),
        ]);

    // Slash travel helper (flip is handled in render based on slashDir)
    const runSlash = (fromLeft: boolean) => {
        const margin = 36;
        const start = fromLeft ? margin : arenaWidth - margin;
        const end = fromLeft ? arenaWidth - margin : margin;

        slashX.setValue(start);
        slashOpacity.setValue(0);
        setSlashDir(fromLeft ? "meToOpp" : "oppToMe");

        return Animated.sequence([
            Animated.timing(slashOpacity, { toValue: 1, duration: 60, useNativeDriver: true }),
            Animated.timing(slashX, { toValue: end, duration: 260, easing: Easing.out(Easing.quad), useNativeDriver: true }),
            Animated.timing(slashOpacity, { toValue: 0, duration: 40, useNativeDriver: true }),
        ]);
    };

    // Perform N hits animation from 'me' or 'opp'
    const performAttack = (from: "me" | "opp", hits: number) =>
        new Promise<void>((resolve) => {
            let i = 0;
            const doOne = () => {
                const fromLeft = from === "me";
                const attackerShake = fromLeft ? myShake : oppShake;
                const defenderFlash = fromLeft ? oppFlash : myFlash;

                Animated.parallel([
                    runShake(attackerShake),
                    runSlash(fromLeft),
                ]).start(() => {
                    runFlash(defenderFlash).start(() => {
                        i += 1;
                        if (i < hits) {
                            setTimeout(doOne, 120);
                        } else {
                            resolve();
                        }
                    });
                });
            };
            doOne();
        });

    // Battle driver (async turn-by-turn to avoid stale state)
    useEffect(() => {
        let cancelled = false;
        const tick = async () => {
            if (!battling || result) return;
            const hits = randHits();

            if (turn === "me") {
                await performAttack("me", hits);
                if (cancelled) return;
                setOppHits((prev) => {
                    const next = prev + hits;
                    if (next >= 5) {
                        setResult("win");
                        setBattling(false);
                    } else {
                        setTurn("opp");
                    }
                    return next;
                });
            } else {
                await performAttack("opp", hits);
                if (cancelled) return;
                setMyHits((prev) => {
                    const next = prev + hits;
                    if (next >= 5) {
                        setResult("lose");
                        setBattling(false);
                    } else {
                        setTurn("me");
                    }
                    return next;
                });
            }
        };

        tick();
        return () => { cancelled = true; };
    }, [battling, turn, result]);

    const startBattle = () => {
        if (!opponent || battling) return;
        setResult(null);
        setMyHits(0);
        setOppHits(0);
        setTurn("me"); // you start
        setBattling(true);
    };

    const resetBattle = () => {
        setBattling(false);
        setMyHits(0);
        setOppHits(0);
        setTurn("me");
        setResult(null);
    };

    useEffect(() => {
        if (battling && !opponent) resetBattle();
    }, [opponent, battling]);

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

            {/* arena */}
            <ImageBackground
                source={require("../../assets/images/battle-scene.png")}
                resizeMode="cover"
                style={styles.arena}
                onLayout={onArenaLayout}
            >
                {/* left: YOU */}
                <Animated.Image
                    source={{ uri: pixelBack(myIdNum) }}
                    style={[
                        styles.mySprite,
                        { transform: [{ translateX: myShake }], opacity: myFlash },
                    ]}
                    resizeMode="contain"
                />

                {/* right: OPPONENT or pokéball */}
                {opponent ? (
                    <Animated.Image
                        source={{ uri: pixelFront(oppIdNum) }}
                        style={[
                            styles.enemySprite,
                            { transform: [{ translateX: oppShake }], opacity: oppFlash },
                        ]}
                        resizeMode="contain"
                    />
                ) : (
                    <Animated.Image
                        source={POKE_BALL_ICON}
                        style={[styles.pokeball, { transform: [{ translateX: shakeBall }] }]}
                        resizeMode="contain"
                    />
                )}

                {/* Slash projectile (flips only from enemy -> me) */}
                {arenaWidth > 0 && (
                    <Animated.View
                        style={[
                            styles.slash,
                            {
                                left: 0,
                                opacity: slashOpacity,
                                transform: [{ translateX: slashX }],
                            },
                        ]}
                        pointerEvents="none"
                    >
                        <Image
                            source={SLASH_ICON}
                            style={{
                                width: 56,
                                height: 56,
                                transform: [{ scaleX: slashDir === "oppToMe" ? -1 : 1 }],
                            }}
                            resizeMode="contain"
                        />
                    </Animated.View>
                )}
            </ImageBackground>

            {/* names + battle controls / indicators */}
            <View style={styles.cardRow}>
                {/* you */}
                <View style={styles.sideCard}>
                    <Text style={styles.pokeName} numberOfLines={1}>
                        {capitalize(myPoke?.name ?? myName ?? "You")}
                    </Text>
                    <View style={styles.typeRow}>
                        {(myPoke?.types ?? []).map((t: NamedType, i) => (
                            <TypeChip key={`${t.type.name}-${i}`} type={t.type.name} />
                        ))}
                    </View>
                </View>

                {/* center: battle button or score */}
                <View style={{ alignItems: "center", justifyContent: "center" }}>
                    {!battling && result === null ? (
                        <Pressable onPress={startBattle} disabled={!opponent} style={{ opacity: opponent ? 1 : 0.4 }}>
                            <Image source={BATTLE_ICON} style={{ width: 70, height: 70 }} />
                        </Pressable>
                    ) : (
                        <View style={styles.scoreRow}>
                            <View style={styles.scoreBox}><Text style={styles.scoreText}>{myHits}</Text></View>
                            <Text style={styles.scoreColon}>:</Text>
                            <View style={styles.scoreBox}><Text style={styles.scoreText}>{oppHits}</Text></View>
                        </View>
                    )}

                    {result && (
                        <Text style={[styles.resultText, { color: result === "win" ? "#1E9E5E" : "#E53935" }]}>
                            {result === "win" ? "You win!" : "You lose!"}
                        </Text>
                    )}
                    {result && (
                        <Pressable onPress={resetBattle} style={styles.rematchBtn}>
                            <Text style={styles.rematchText}>Rematch</Text>
                        </Pressable>
                    )}
                </View>

                {/* opponent */}
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
                            <Pressable
                                onPress={() => !battling && setOpponent(item)}
                                style={[styles.rowCard, selected && styles.rowCardActive, battling && { opacity: 0.5 }]}
                            >
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
    const poke: PokemonLite | undefined = data;
    if (isLoading || !poke) return null;
    return (
        <View style={[styles.typeRow, { justifyContent: "flex-end" }]}>
            {(poke.types ?? []).map((t: NamedType, i) => (
                <TypeChip key={`${t.type.name}-${i}`} type={t.type.name} />
            ))}
        </View>
    );
}

/** A pill with icon using local PNGs. */
function TypeChip({ type }: { type: string }) {
    const icon = TYPE_ICONS[type.toLowerCase()];
    return (
        <View style={styles.typeChip}>
            {icon ? <Image source={icon} style={{ width: 40, height: 40 }} /> : null}
        </View>
    );
}

function capitalize(s: string | undefined) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : s ?? "";
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BLUE_BG, paddingBottom: 50 },

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
    mySprite: { width: 120, height: 120, transform: [{ scaleX: 1 }] }, // face RIGHT
    enemySprite: { width: 120, height: 120 },

    // placeholder pokéball
    pokeball: { width: 20, height: 20, marginBottom: 40, marginRight: 20 },

    // slash projectile (absolute in arena)
    slash: {
        position: "absolute",
        bottom: 40,           // roughly between both sprites
        width: 56,
        height: 56,
    },

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
    typeChip: { flexDirection: "row", alignItems: "flex-start" },

    // === SCORE (hit indicators) ===
    scoreRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    scoreBox: {
        minWidth: 32,
        height: 28,
        borderRadius: 6,
        backgroundColor: "#EF5350",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 6,
    },
    scoreText: { color: "#fff", fontWeight: "800", fontSize: 16 },
    scoreColon: { color: "#EF5350", fontWeight: "800", fontSize: 18 },

    resultText: { marginTop: 6, fontWeight: "800" },
    rematchBtn: {
        marginTop: 6,
        alignSelf: "center",
        backgroundColor: "#6D55FF",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    rematchText: { color: "#fff", fontWeight: "700" },

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
