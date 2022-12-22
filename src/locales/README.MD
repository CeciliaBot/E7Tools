# Set up a new Language

## Open Language picker in code
You can use this.$localePicker() anywhere in a component to open the language selector (Provided by the 'language.js' plugin)

## Add a new language
To add a new language create a new folder in the 'locales' folder and give that folder a unique language code (example 'it-IT' or 'it' for Italian)
Inside the new folder create a 'info.json' file and add the following data:
```
{
    "langCodes": [
        "it-*",                                  // When to automatically apply this language pack in this case 'it-*' will applay to all browsers that have it as language
        'it-IT'                                  // You can also provide a region
    ],
    "code": "it",                                // Your code, the code you used as folder name
    "name": "Italiano",                          // Name of your language
    "authors": ['Gio', 'Some other helper'],     // List of authors
    "flag": "https://someimage.png"              // Link to your flag
}
```
During the build process if a folder is missing the 'info.json' file that language will be skipped.

## How to translate a Changelog
You can translate a changelog by creating a file named <code>.json (where '<code>' is your language code) in the changelog folder of that specific component/route/view 

## Tanslate UI
Create a new file named 'strings.json' and translate each (or some) of the keys

## Translate Character Names
Create a new file named 'heroes.json' and translate each character _id you can find in the pubilc/data/HeroDatabase.json file

## Translate Artifact Names
Create a new file named 'artifacts.json' and translate each artifact _id you can find in the pubilc/data/artifacts.json file

# Todo
    - (Maybe) Split translation async get function by route/component to avoid getting strings for a route not in use (way later in the future maybe)
    - (Maybe) Character Nicknames