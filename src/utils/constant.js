/* CDN Used for images */
export const cdn = 'https://res.cloudinary.com/ceciliabot/image/upload/epic-seven/';

/* In game data */
export const roles = ['warrior', 'knight', 'assassin', 'ranger', 'mage', 'manauser'];
export const attributes = ['fire', 'ice', 'wind', 'light', 'dark'];
export const rarity = [5,4,3];
export const zodiac = ['ram', 'bull', 'twins', 'crab', 'lion', 'maiden', 'scales', 'scorpion', 'archer', 'goat', 'waterbearer', 'fish'];
export function getZodiacIcon(zodiac) {if (zodiac==="all") return cdn+'label-all.png'; return cdn+'img/cm_icon_zodiac_'+zodiac+'.png'}
//const zodiacMap = ["Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius and Pisces"]