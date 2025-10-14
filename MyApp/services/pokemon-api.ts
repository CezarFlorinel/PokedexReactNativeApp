import { EvolutionClient, PokemonClient } from "pokenode-ts";

// singleton instance of the pokemon API client, to be reused aross the app
export const PokeApiService = new PokemonClient();
export const EvolutionApiService = new EvolutionClient();