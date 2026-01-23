

Stundet number: 706431
Stundent Name: Cezar Ciobanu





#### App functionality

- [x] Working Expo Go project, should be able to scan the QR code and see the app running on any device.
- [x] PokeAPI is used to fetch Pokémon data https://pokeapi.co/
  - [x] List of Pokémon is loaded from the API.
  - [x] Pokémon details (metadata, stats, evolution chain) are loaded from the API.
- [x] List of Pokémon is displayed in a FlatList.
  - [x] Must be able to filter the list by name using the search bar.
- [x] Pokémon details are displayed in a ScrollView.
  - [x] Must be able to navigate to the Pokémon details page from the list.
  - [x] Must be able to favorite the Pokémon.
  - [x] Must display type(s) for the Pokémon and use a unique color for each type.
  - [x] Pokémon detail tabs should be swipeable left and right.
- [x] Favorites list is displayed in a FlatList.
  - [x] Must be able to navigate to the Pokémon details page from the favorites list.
  - [x] Must be able to unfavorite the Pokémon.
  - [x] Empty state must be displayed when there are no favorites.
- [x] Pokémon actions must include:
    - [x] Favorite.
    - [x] Share.
    - [x] Open in detail view.
- [x] All async operations must include an loading and error state.
    - [x] Fetching Pokémon list.
    - [x] Fetching Pokémon details.
    - [x] Fetching Pokémon evolution chain.

#### Project setup
- [x] Tanstack Query for API calls.
- [x] Expo Router for navigation.
- [x] SQLite for local storage.s
- [x] Uses Typescript with no TS errors.
- [x] Uses ESLint with no ESLint errors. (ideally use [React Compiler Linter](https://docs.expo.dev/guides/react-compiler/#enabling-the-linter))
- [x] Uses Separation of Concerns (determine a project structure that follows this principle).
- [x] Expo Font is used to implement [the font](./assets/fonts.zip).


### Optional items
Each optional item is worth 1 extra point.

- [ ] Use of animations (e.g. loading in UI elements).
- [ ] Dark mode support (making use of theming).
- [x] Pokémon list is paginated and infinite scroll is used.
- [ ] Clean Typescript: no use of `any`, typecasting `as SomeType`, or TS ignore comments.
- [ ] Pixel Perfect Design on either iOS or Android.
- [x] No bugs, console errors and use of console.log. ========= or at least none that i know of
- [ ] Added [localizations](https://docs.expo.dev/guides/localization/) for the app.
- [x] Adds Pokémon Battle Feature.


- [ ] Unchecked
- [x] Checked
