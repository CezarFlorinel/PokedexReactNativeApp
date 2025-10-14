import { databaseService } from "@/services/database";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Get all favorite Pokémon
export const useFavorites = () => {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: () => databaseService.getAllFavorites(),
    staleTime: 0,
  });
};

// Check if a specific Pokémon is favorite
export const useIsFavorite = (pokemonId: number) => {
  return useQuery({
    queryKey: ["is-favorite", pokemonId],
    queryFn: () => databaseService.isFavorite(pokemonId),
    staleTime: 0,
  });
};

// Toggle favorite state
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      pokemonId,
      name,
      imageUrl,
      isCurrentlyFavorite,
    }: {
      pokemonId: number;
      name: string;
      imageUrl?: string;
      isCurrentlyFavorite: boolean;
    }) => {
      if (isCurrentlyFavorite) {
        await databaseService.removeFavorite(pokemonId);
      } else {
        await databaseService.addFavorite(pokemonId, name, imageUrl);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({ queryKey: ["is-favorite", variables.pokemonId] });
    },
  });
};
