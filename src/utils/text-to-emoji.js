import { cdn } from '@/utils/constant.js'

export var emj = {
    /* Sets */
    HitSet: cdn+'item/icon_set_acc.png',
    AttackSet: cdn+'item/icon_set_att.png',
    UnitySet: cdn+'item/icon_set_coop.png',
    CounterSet: cdn+'item/icon_set_counter.png',
    CritChanceSet: cdn+'item/icon_set_cri.png',
    CritDamageSet: cdn+'item/icon_set_cri_dmg.png',
    DefenseSet: cdn+'item/icon_set_def.png',
    HealSet: cdn+'item/icon_set_heal_inc.png',
    ImmunitySet: cdn+'item/icon_set_immune.png',
    HealthSet: cdn+'item/icon_set_max_hp.png',
    PenetrationSet: cdn+'item/icon_set_penetrate.png',
    RageSet: cdn+'item/icon_set_rage.png',
    UnknownSet: cdn+'item/icon_set_random.png',
    ResistSet: cdn+'item/icon_set_res.png',
    RevengeSet: cdn+'item/icon_set_revenge.png',
    InjurySet: cdn+'item/icon_set_scar.png',
    SpeedSet: cdn+'item/icon_set_speed.png',
    LifestealSet: cdn+'item/icon_set_vampire.png',

    /* Stats */
    attack: cdn+'img/icon_menu_att.png',
    defense: cdn+'img/icon_menu_def.png',
    health: cdn+'img/icon_menu_max_hp.png',
    speed: cdn+'img/icon_menu_speed.png',
    critchance: cdn+'img/icon_menu_cri.png',
    critdamage: cdn+'img/icon_menu_cri_dmg.png',
    effectivness: cdn+'img/icon_menu_acc.png',
    effectresist: cdn+'img/icon_menu_res.png',
    dual: cdn+'img/icon_menu_coop.png',
    counter: cdn+'img/icon_menu_counter.png',

    /* Rarity */
    rarity: cdn+'cm_icon_star.png',

    /* Roles */
    warrior: cdn+'class/cm_icon_role_warrior.png',
    knight: cdn+'class/cm_icon_role_knight.png',
    thief: cdn+'class/cm_icon_role_thief.png',
    ranger: cdn+'class/cm_icon_role_ranger.png',
    mage: cdn+'class/cm_icon_role_mage.png',
    'soul-weaver': cdn+'class/cm_icon_role_soul-weaver.png',

    /* Attributes */
    fire: cdn+'attribute/cm_icon_profire.png',
    ice: cdn+'attribute/cm_icon_proice.png',
    grass: cdn+'attribute/cm_icon_proearth.png',
    dark: cdn+'attribute/cm_icon_promdark.png',
    light: cdn+'attribute/cm_icon_prolight.png',

    /* Zodiac */
    aries: cdn+'img/cm_icon_zodiac_ram.png',
    taurus: cdn+'img/cm_icon_zodiac_bull.png',
    gemini: cdn+'img/cm_icon_zodiac_twins.png',
    cancer: cdn+'img/cm_icon_zodiac_crab.png',
    leo: cdn+'img/cm_icon_zodiac_lion.png',
    virgo: cdn+'img/cm_icon_zodiac_maiden.png',
    libra: cdn+'img/cm_icon_zodiac_scales.png',
    scorpius: cdn+'img/cm_icon_zodiac_scorpion.png',
    sagittarius: cdn+'img/cm_icon_zodiac_archer.png',
    capricornus: cdn+'img/cm_icon_zodiac_goat.png',
    aquarius: cdn+'img/cm_icon_zodiac_waterbearer.png',
    pisces: cdn+'img/cm_icon_zodiac_fish.png',

    CermiaWeird: cdn + 'ui/emote/CermiaWeird.png',
    /* E7 Emotes */
    CharlotteNoted: cdn+'ui/emote/c5009_hard_001.webp',
    MelanyLaugh: cdn+'ui/emote/c3121_provoke_001.webp',
    ChristieTired: cdn+'ui/emote/c3123_tired_001.webp',

    /* E7 Items */
    skystone: cdn+'item/token_crystal.png',
    transmit: cdn+'item/token_hero1.png',
    transmit2: cdn+'item/token_hero2.png',
    powder: cdn+'item/token_powder.png',
    covenant: cdn+'item/token_ticket_rare.png',
    mystic: cdn+'item/token_ticket_special.png',
    galaxy: cdn+'item/token_ticket_moon.png',
    molagoraseed: cdn+'item/token_mura.png',
    molagora: cdn+'item/ma_moragora1.png',

    /* Other E7Stuff */
    banned: cdn+'img/_cm_banned_res.png',
    D: cdn+'img/hero_dedi_a_d.png',
    C: cdn+'img/hero_dedi_a_c.png',
    B: cdn+'img/hero_dedi_a_b.png',
    A: cdn+'img/hero_dedi_a_a.png',
    S: cdn+'img/hero_dedi_a_s.png',
    SS: cdn+'img/hero_dedi_a_ss.png',
    SSS: cdn+'img/hero_dedi_a_sss.png',

    /* Twitch emotes */
    BOOBA: cdn+'ui/emote/booba.webp',
    BASED: cdn+'ui/emote/BASED.webp',
    BASEDCIGAR: cdn+'ui/emote/BASEDCIGAR.webp',
    modCheck: cdn+'ui/emote/modCheck.webp',
    Clueless: cdn+'ui/emote/Clueless.webp',
    Aware: cdn+'ui/emote/AWARE.gif',
    OMEGALUL: cdn+'ui/emote/OMEGALUL.png',
    NOPPERS: cdn+'ui/emote/NOPPERS.gif',
    EZ: cdn+'ui/emote/EZ.png',
    WHO: cdn+'ui/emote/WHO.webp',
    Pepega: cdn+'ui/emote/pepega.png',
    PepegaCredit: cdn+'ui/emote/PepegaCredit.webp',
    PepeLaugh: cdn+'ui/emote/PepeLaugh.gif',
    Copium: cdn+'ui/emote/copium.png',
    GiGACHAD: cdn+'ui/emote/GIGACHAD.webp',
    SUSSY: cdn+'ui/emote/SUSSY.webp',
    Bedge: cdn+'ui/emote/bedge.webp',
    Smadge: cdn+'ui/emote/Smadge.webp'
}

export var emotes = Object.keys(emj).map(key => {
    return {
        code: key,
        src: emj[key]
    }
})

export function buildEmoteElement (emote) {
    var img = document.createElement( 'img' );
    img.src=emj[emote];
    img.setAttribute('draggable', false);
    img.title = ':'+emote+':';
    img.style.height='1.5em';
    img.style.verticalAlign = 'middle';
    img.style.pointerEvents = 'none'; //allows user to click around the emote
    img.setAttribute('SameSite', 'Lax');
    return img;
}

export function stringToHtmlEmotes (text) {
    let str = (text || '').replace(/<(?!br\s*\/?)[^>]+>/, (match) => {
        return match.replace('<', '&lt;').replace('>', '&gt;').replace('/', '&#47;')
    })
    //let str = (text || '').replace('<[^br]', '&lt;').replace('[^br]>', '&gt;').replace('/', '&#47;'); //replace <,>,/ to prevent pure html code in the string
    let newString = str.replace(/:[a-zA-Z0-9_-]+:/g, function (match) {
        var emote = emj[match.replace(/:/g,'')];
        if (emote) {
            return '<img src="' + emote + '" title="' + match + '" draggable="false" style="height: 1.5em; vertical-align: middle; pointer-events: none;" SameSite="Lax" />'
        } else
            return match;
    })
    return newString
}
export function recursiveCleaner(node) { /* Loop through each node and get text + emotes */
    var str = '';
    if (!node.childNodes) return node.innerHTML;
    node.childNodes.forEach((child, index) => {
        if (child.nodeName === '#text')
            str+=child.data;
        else if (child.nodeName === 'IMG'/* && node.title*/)
            str+=child.title||'';
        else if (child.nodeName === 'BR' && index>0)
            str+='<br>'
        else if (child.nodeName === 'DIV' || child.nodeName === 'P')
            str+='<div>'+recursiveCleaner(child)+'</div>'
    })
    return str.replace(/(<[/]*div>){2}/g,'<br>').replace(/(<[/]*div>)/g, '<br>').replace(/(<br>)*$/,'');
}
export function cleanInnerText (el) {
    let text= recursiveCleaner(el);
    return text
}

export function getSelection() {
    if (window.getSelection) {
        const sel = window.getSelection();
        if (sel.getRangeAt /*&& sel.rangeCount*/) {
            return sel.getRangeAt(0);
        }
    } else if (document.selection && document.selection.createRange) {
        return document.selection.createRange();
    }
    return null;
}
// function setCaretPosition(elem, caretPos) {
//     if(elem != null) {
//         if(elem.createTextRange) {
//             var range = elem.createTextRange();
//             range.move('character', caretPos);
//             range.select();
//         }
//         else {
//             if(elem.selectionStart) {
//                 elem.focus();
//                 elem.setSelectionRange(caretPos, caretPos);
//             }
//             else
//                 elem.focus();
//         }
//     }
// }

export function insertAtIndex (targetEl, newEl, index, length = 0) {
    var sel, range;
    if (window.getSelection)
    {
        sel = window.getSelection();    
        if (index !==undefined && length !==undefined) { // Live text to emote
            range = document.createRange();
            range.setStart(targetEl, index);
            range.setEnd(targetEl, index+length);
            sel.removeAllRanges();
            sel.addRange(range);
        } 
        if (sel.rangeCount)
        {
            range = sel.getRangeAt(0);          
            //var selectedText = range.toString();
            range.deleteContents();
            range.insertNode( newEl ); 
            
            //move the cursor
            range.setStartAfter(newEl);
            range.setEndAfter(newEl); 
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }
}

export function clickToInsertEmote(emote, targetEl) {
    var caret = getSelection();
    console.log(caret)
    var target = caret.startContainer;
    if (!emote) return;
    if (targetEl) {
        var isAChild = targetEl.contains(target);
        if (!isAChild) {
            target = targetEl.lastChild;
            if (!target) {
                target = document.createTextNode("");
                targetEl.appendChild( target );
            }
        } else {
            console.log('is a child')
        }
    }
    insertAtIndex(
        target,
        buildEmoteElement(emote)
    );
}