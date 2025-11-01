import React, { useEffect, useMemo, useState } from "react";
import { Image, StyleSheet, View } from "react-native";

type Variant = "official" | "pixel";

interface PokemonImageProps {
  id: string | number;
  size?: number;          // box size (width = height)
  variant?: Variant;      // "pixel" for Gen V sprites, "official" for artwork
  pixelPerfect?: boolean; // round scale to integer when variant === "pixel"
}

const getUrl = (id: string | number, variant: Variant) => {
  if (variant === "pixel") {
    // Gen V (Black/White) static pixel sprite PNG
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/${id}.png`;
  }
  // Official artwork (smooth)
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
};

export function PokemonImage({
  id,
  size = 110,
  variant = "official",     // ✅ default = non-pixel artwork
  pixelPerfect = true,
}: PokemonImageProps) {
  const uri = useMemo(() => getUrl(id, variant), [id, variant]);

  const [intrinsic, setIntrinsic] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    let mounted = true;
    Image.getSize(
      uri,
      (w, h) => mounted && setIntrinsic({ w, h }),
      () => mounted && setIntrinsic({ w: size, h: size })
    );
    return () => {
      mounted = false;
    };
  }, [uri, size]);

  const { w, h } = intrinsic ?? { w: size, h: size };
  const baseScale = Math.min(size / w, size / h);
  const scale =
    variant === "pixel" && pixelPerfect
      ? Math.max(1, Math.floor(baseScale)) // 1x, 2x, 3x …
      : baseScale;

  const renderW = Math.round(w * scale);
  const renderH = Math.round(h * scale);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={{ uri }}
        style={{ width: renderW, height: renderH }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: "center", alignItems: "center" },
});
