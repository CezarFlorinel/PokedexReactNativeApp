import PokemonCard from "@/components/ui/pokemon-card";
import type { BasicPokemon } from "@/hooks/use-pokemon";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";

interface Props {
  data: BasicPokemon[];
  onEndReached?: () => void;          
  isFetchingNextPage?: boolean;       
}

export default function PokemonList({ data, onEndReached, isFetchingNextPage }: Props) {
  const router = useRouter();

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.content}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      renderItem={({ item }) => (
        <View style={styles.cell}>
          <PokemonCard
            pokemon={item}
            onPress={() =>
              router.push({ pathname: "/pokemon/[name]", params: { name: item.name } })
            }
          />
        </View>
      )}
      ListFooterComponent={
        isFetchingNextPage ? (
          <View style={styles.footer}>
            <ActivityIndicator />
          </View>
        ) : null
      }
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 6,
  },
  content: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  footer: { paddingVertical: 16, alignItems: "center" },

  // 👇 fixed-width grid cell (about half width with margins)
  cell: {
    flexBasis: "48%",
    maxWidth: "48%",
    flexGrow: 0,
    marginBottom: 12,
  },
});
