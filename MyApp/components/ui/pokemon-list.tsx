import PokemonCard from "@/components/ui/pokemon-card";
import type { BasicPokemon } from "@/hooks/use-pokemon";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, StyleSheet, View } from "react-native";

interface Props {
  data: BasicPokemon[];
}

export default function PokemonList({ data }: Props) {
  const router = useRouter();

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.content}
      renderItem={({ item }) => (
        <PokemonCard
          pokemon={item}
          onPress={() =>
            router.push({ pathname: "/pokemon/[name]", params: { name: item.name } })
          }
        />
      )}
      ListFooterComponent={<View style={{ height: 16 }} />}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  row: { justifyContent: "space-between", paddingHorizontal: 8 },
  content: { paddingTop: 8, paddingBottom: 8 },
});
