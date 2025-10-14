import { EvolutionApiService, PokeApiService } from "@/services/pokemon-api";
import { InfiniteData, useQuery } from "@tanstack/react-query";
import { NamedAPIResource } from "pokenode-ts";
import { useInfiniteQuery } from "@tanstack/react-query";

// type for Pokémon with ID
export type PokemonWithId = NamedAPIResource & {
  id: string;
};

export type BasicPokemon = { id: number; name: string };
export const PAGE_SIZE = 150;

const toBasic = (r: NamedAPIResource): BasicPokemon => ({
  id: getId(r.url),
  name: r.name,
});

interface ApiResourceList {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedAPIResource[];
}

export const ALL_POKEMON_LIMIT = 2000; // use for the search bar , to check all Pokémon

const getId = (url: string): number =>
  Number(url.match(/\/pokemon\/(\d+)\/?$/)?.[1] || 0);

export const useInfinitePokemonList = (pageSize = PAGE_SIZE) =>
  useInfiniteQuery<
    ApiResourceList,                  // TQueryFnData
    Error,                            // TError
    InfiniteData<ApiResourceList, number>, // TData  ✅ important
    [string, number],                 // TQueryKey
    number                            // TPageParam
  >({
    queryKey: ["pokemon-infinite", pageSize],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const offset = pageParam as number;
      return PokeApiService.listPokemons(offset, pageSize); // (offset, limit)
    },
    getNextPageParam: (lastPage, pages) => {
      if (!lastPage?.results || lastPage.results.length < pageSize) return undefined;
      return pages.length * pageSize;
    },
    staleTime: 5 * 60 * 1000,
  });

export const mapPagesToBasics = (
  data?: InfiniteData<ApiResourceList, number>
): BasicPokemon[] =>
  data?.pages?.flatMap((p) => p.results.map((r) => ({
    id: getId(r.url),
    name: r.name,
  }))) ?? [];

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

export const usePokemonList = (offset = 0, limit = 150) => {
  return useQuery({
    queryKey: ["pokemon-list", offset, limit],
    queryFn: async (): Promise<BasicPokemon[]> => {
      const res = await PokeApiService.listPokemons(offset, limit); // 👈 order fixed
      return res.results.map((r) => ({
        id: Number(r.url.match(/\/pokemon\/(\d+)\/?$/)?.[1] || 0),
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

export const usePokemonIndex = () =>
  useQuery({
    queryKey: ["pokemon-index"],
    // PokeAPI uses (offset, limit)
    queryFn: async () => {
      const res = await PokeApiService.listPokemons(0, ALL_POKEMON_LIMIT);
      return res.results.map(toBasic); // -> BasicPokemon[] (id, name)
    },
    // keep it around; it hardly changes
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });