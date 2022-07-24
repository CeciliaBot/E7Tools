# CeciliaBot Tools Source Code
`This version will soon replace the version running @ ceciliabot.github.io/e7tools/`

# Missing parts
    - Camping Simulator. The camping simulator running at ceciliabot.github.io/e7tools/ is using a different code different from e7tools, that old version will be replaced once the new version is created

## Dependencies
```
Vue 3+
Vue Router
Vuex
Vue  i18n 9+
Vue Multiselect (currently only used by the gear score calculator)
```
Using Vue-cli

# Pages

## Add a new page
To add a new page add a new route to the `src/router/index.js` file.

# Localization
## Open Language picker in code
You can use `this.$localePicker()` anywhere in a component to open the language selector (Provided by the `language.js` plugin)

## Add a new language
To add a new language create a new folder in the `src/locales/` folder and give that folder a unique language code (example 'it-IT' or 'it' for Italian)
Inside the new folder create a `info.json` file and add the following data:
```
{
    "langCodes": [
        "it-*",             // When to automatically apply this language pack, in this case 'it-*' will applay to all browsers that have 'it' as language no matter the region
        'it-IT'             // You can also provide a region
    ],
    "code": "it",           // Your code, the code you used as folder name
    "name": "Italiano",     // Name of your language
    "authors": ['Gio', 'Some other helper'],     // List of authors
    "flag": "https://someimage.png"              // Link to your flag
}
```
During the build process if a folder is missing the `info.json` file that language will be skipped.
Your result should look like this: `src/locales/<code>/info.json` (where <code> is your language code identifier)

## How to translate a Changelog
You can translate a changelog by creating a file named `<code>.json` (where <code> is your language code) in the changelog folder of that specific component/route/view 

# Todo
    - Split HeroDatabase.json and Camping Data into 2 different files
    - Rewrite Camping simulator using Vue 3 and multiple components
    - Rewrite Timeline adding a Spreadsheet style view, release stats and stats by year
    - (Maybe) Split translation async get function by route/component to avoid getting strings for a route not in use (way later in the future maybe)

# Installation

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).