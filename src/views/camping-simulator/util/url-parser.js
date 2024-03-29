import {cleanUrl, decodeLink, decodeOldLink} from './export-link.js'
export default function (heroList, context) { /* context === this from main camping instance */
    var urlRoster;
    var oldLink = false;
    if (context.$route) {
        context.$route.hash.split('&')
            .forEach(param => {
                if (/^\s*roster/i.test(param)) {
                    urlRoster = param.split('=')[1]
                }
            })
    } else {
        window.location.href.split('#').forEach(hash => { /* if not using router (Standalone version) */
            hash.split('&')
                .forEach(param => {
                    if (/^\s*roster/i.test(param)) {
                        urlRoster = param.split('=')[1]
                    }
                })
        })
    }
    if (!urlRoster) { /******* for compatibility with old urls generated by the old page *******/
        const urlParams = new URLSearchParams(window.location.search);
        if (!context.$router && urlParams.get("camproster"))
            urlRoster = urlParams.get("camproster");
        else if (context.$router && context.$route.query.camproster)
            urlRoster = context.$route.query.camproster;
        if (urlRoster) oldLink = true;
    }
    if (urlRoster) {
        context.$promiseAlert(
            context.$t('strings.url_to_roster'),
            new Promise ((resolve, reject) => {
                setTimeout( () => {
                    try {
                        urlRoster = oldLink ? decodeOldLink(urlRoster) : decodeLink(urlRoster, heroList);
                        if (!urlRoster.length) throw 'No roster found';
                        resolve('<div>Replace current roster with roster from URL?<div>'+urlRoster.map(el => {return context.$store.getters.getHeroName(el)+'<br>'}).join('') + '</div></div>')
                    } catch(err) {
                        reject('Something went wrong while parsing URL...')
                    }
                }, 200)
            }),
            [ { name: context.$t('strings.confirm'), class: "material-button basic confirm", hideOnError: true }, context.$t('strings.cancel')]
        ).then(async ([answer]) => {
            if (answer === 0) {
                context.roster = urlRoster
                window.history.pushState("", "", cleanUrl(context.$router)); // remove ?camproster= from the URL to avoid accidental refreshes replacing your current team
            }
        })
    }
}