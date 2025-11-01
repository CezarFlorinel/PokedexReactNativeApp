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
- [ ] Uses ESLint with no ESLint errors. (ideally use [React Compiler Linter](https://docs.expo.dev/guides/react-compiler/#enabling-the-linter))
- [x] Uses Separation of Concerns (determine a project structure that follows this principle).
- [x] Expo Font is used to implement [the font](./assets/fonts.zip).


### Optional items
Each optional item is worth 1 extra point.

- [ ] Use of animations (e.g. loading in UI elements).
- [ ] Dark mode support (making use of theming).
- [ ] Pokémon list is paginated and infinite scroll is used.
- [ ] Clean Typescript: no use of `any`, typecasting `as SomeType`, or TS ignore comments.
- [-] Pixel Perfect Design on either iOS or Android.  ========== Chose Android, and i would say it is ~95%
- [ ] No bugs, console errors and use of console.log.
- [ ] Added [localizations](https://docs.expo.dev/guides/localization/) for the app.
- [ ] Adds Pokémon Battle Feature.


- [ ] Unchecked
- [x] Checked


#### NOTES FOR TEACHER ================================



- in the About,Stats,Evolution section, for the selected pokemon I added extra padding to make it scrollable, even tho there is nothing there, like in the design to show scroll functionality of page. Feels kind of unclear what is meant in the design for that, also the design for android has a mistake , it shows the wrong tab , it shows evolution, but the content is from about tab.

- Honestly, I just pray it works for IOS as well, I tested on ios using a phone's friend only once (and was working), but that was during a previous version not the final one.

- I focused mostly on the Android design from Figma (because couldn't test for ios xd), and there are no diferences for ios version , except the transparency that the top bar from the selected pokemon overview page has for ios, while on android it is not transparent.

