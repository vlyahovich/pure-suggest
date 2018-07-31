# Pure-Suggest

Suggest plugin written on vanilla js.

![Alt text](/misc/screenshot1.png?raw=true "single select")

![Alt text](/misc/screenshot2.png?raw=true "multi select")

Technologies:

- php 7.2.8
- composer
- es6
- es7 decorators
- typescript
- webpack

# Demo app

Domo app is hosted on heroku https://gentle-inlet-93900.herokuapp.com/. It might open slow for the first time because if it idles for 30 min app will slep.

# Plugin usage

Plugin usage demonstrated in `src/demo/demo.ts` file. First of all you need to create `SuggestSource` from which plugin will perform searches, example of such `SuggestSource` is in `src/demo/UsersSuggestSource.ts`, it should be an instance of `SuggestSource` and implement series of methods:

- `fetch` to fetch the data, should return `Promise`
- `serialize` to serialize fetched data if needed
- `search` to perform search by some term, should return `Promise`
- `highlight` to highlight some text in menu title, should return an array of string parts

Then you need to pass an element in which select will be initialized, it should have `suggest` class and preferrably input with `suggest__input` class + div with `suggest__toggle` class to avoid delays while page loads script. Second argument is options which should contain `createSource` method which returns `SuggestSource` instance. Example of usage can be seen in `src/demo` folder.

# Highlight usage

`highlight` method of `SuggestSource` is used to highlight text in menu item title. It should return an array of 1, 2 or 3 items in length. Plugin will take middle item as highlight e. g. `['text']` will produce no highlight and `['t', 'ex', 't']` will highlight `ex` part. For array `['te', 'xt']` it will highlight only `xt` part.

# Plugin options

Plugin needs to be supplied by `SuggestSource` from which it can fetch data and perform searches. This can be done by `createSource` option. This option is a function called with initial data and should produce `SuggestSource` instance. This option is required for component to function.

Plugin can show items with or without avatars and supports single or multiple selections. Pass these options:

- `hideAvatar` to not display avatar
- `multi` to use multi-select

Plugin can be supplied bu some initial data which will be passed to `SuggestSource` to contain and search for some data on the client as shown in demo `SuggestSource` under `demo` folder. This can be done by passing `initialData` option to plugin options.

## Polyfills

Plugin uses `Promise` and `Array.prototype.find` so if you need some older browsers support you can inlude `dist/polyfills.js` or `src/extension/polyfills.ts` for `esnext` projects.

## Development

Run `npm run watch` for a dev files watcher to rebuild files on change.

## Build

Run `npm run build` to build the project with production environment.