import { EvolutionApiService, PokeApiService } from "@/services/pokemon-api";
import { useQuery } from "@tanstack/react-query";
import { NamedAPIResource } from "pokenode-ts";

// type for Pokémon with ID
export type PokemonWithId = NamedAPIResource & {
  id: string;
};

export type BasicPokemon = { id: number; name: string };

// species by name (to get evolution_chain url)
export const usePokemonSpeciesByName = (name: string) => {
  return useQuery({
    queryKey: ["pokemon-species", name],
    queryFn: () => PokeApiService.getPokemonSpeciesByName(name),
    enabled: !!name,
    staleTime: 10 * 60 * 1000,
  });
};

// evolution chain by id
export const useEvolutionChain = (chainId?: number) => {
  return useQuery({
    queryKey: ["evolution-chain", chainId],
    queryFn: () => EvolutionApiService.getEvolutionChainById(chainId!),
    enabled: typeof chainId === "number",
    staleTime: 10 * 60 * 1000,
  });
};

// hook for fetching Pokémon list
function getPokemonIdFromUrl(url: string): number {
  const match = url.match(/\/pokemon\/(\d+)\/?$/);
  return match ? parseInt(match[1], 10) : 0;
}

export const usePokemonList = (limit = 150, offset = 0) => {
  return useQuery({
    queryKey: ["pokemon-list", limit, offset],
    queryFn: async (): Promise<BasicPokemon[]> => {
      const res = await PokeApiService.listPokemons(limit, offset);
      return res.results.map((r: NamedAPIResource) => ({
        id: getPokemonIdFromUrl(r.url),
        name: r.name,
      }));
    },
  });
};

export const usePokemonByName = (name: string) => {
  return useQuery({
    queryKey: ["pokemon", name],
    queryFn: () => PokeApiService.getPokemonByName(name),
    enabled: !!name, // only run if we actually have a name
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// utility to extract ID from URL
export const idFromUrl = (url?: string | null): number | null => {
  if (!url) return null;
  const m = url.match(/\/(\d+)\/?$/);
  return m ? Number(m[1]) : null;
};