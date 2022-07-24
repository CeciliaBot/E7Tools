import { createI18n } from 'vue-i18n'
function requireAll(r) { return r.keys().map(r); }
const datetimeFormats = {
  'en': {
    'short': {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    },
    'long': {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
  }
}

const i18n = createI18n({
  locale: process.env.VUE_APP_I18N_LOCALE || "en",
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || "en",
  datetimeFormats,
  messages: {},
  silentTranslationWarn: true // turn this off to see warning in the console when a string is missing translation
})
i18n._availableLocales = requireAll(require.context('./locales', true, /info\.json$/))
i18n.global._availableLocales = requireAll(require.context('./locales', true, /info\.json$/))


const loadedLanguages = [];
export function loadLocaleMessagesAsync(locale) {
  if (loadedLanguages.length > 0 && i18n.global.locale === locale) {
    return Promise.resolve(locale)
  }
  // If the language was already loaded
  if (loadedLanguages.includes(locale)) {
    i18n.global.locale = locale
    return Promise.resolve(locale)
  }
  // If the language hasn't been loaded yet
  return Promise.all([
    import(/* webpackChunkName: "[request]" */ `./locales/${locale}/strings.json`).catch(() => {return {}}),
    import(/* webpackChunkName: "[request]" */ `./locales/${locale}/heroes.json`).catch(() => {return {}}),
    import(/* webpackChunkName: "[request]" */ `./locales/${locale}/artifacts.json`).catch(() => {return {}}),
    import(/* webpackChunkName: "[request]" */ `./locales/${locale}/camping.json`).catch(() => {return {}})
  ]).then(([strings, heroes, artifacts, camping]) => {
    //Object.assign(strings.default, camping.default, heroes.default, artifacts.default)  // Merge!
    i18n.global.setLocaleMessage(locale, {strings:strings.default, heroes: heroes.default, artifacts: artifacts.default, camping: camping.default})
    loadedLanguages.push(locale)
    i18n.global.locale = locale
    return Promise.resolve(locale)
  }).catch(() => {
    return Promise.resolve(false)
  })
}

export default i18n;

/********************* Load Fallback and Current/Local Language @ start up *********************/
var init = [
  i18n.global.fallbackLocale,
  [ loadLocaleMessagesAsync(i18n.global.fallbackLocale) ]
];
var userLang = localStorage.getItem('USER_PREFERED_LOCALE');
if (!userLang) { // TRY TO DETECT AND APPLAY THE CORRECT LOCALE
    const tLang = navigator.language || navigator.userLanguage;
    i18n._availableLocales.forEach(locale => {
        locale.langCodes.forEach(code => {
            const langCode = code.split('-')[0];
            const zoneCode = code.split('-').slice(1).join('');
            const tZoneCode = tLang.split('-').slice(1).join('');
            if (langCode === tLang.split('-')[0] && (zoneCode=== '*' || !tZoneCode || zoneCode===tZoneCode))
              if (locale.code !== i18n.global.fallbackLocale)
                init[0] = locale.code,
                init[1].push(loadLocaleMessagesAsync(locale.code))
        })
    })
} else if (userLang !== i18n.global.fallbackLocale) {
  init[0] = userLang,
  init[1].push(loadLocaleMessagesAsync(userLang))
}

Promise.all(
  init[1]
).then( () => {
  i18n.global.locale = init[0];
})