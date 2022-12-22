export default function (hero, _this) {
    var name = _this.$store.getters.getHeroName(hero),
        data = _this.$store.getters.getHero(hero);

    var $t = _this.$t
    var topics = data.camping.topics.map(t => _this.$t(t))
    var cValues = Object.keys(data.camping.values).map(t => {
        return _this.$t('strings.'+t) + ': ' + data.camping.values[t]
    })


    window.$promiseAlert(
        name + ' - Info',
        $t('strings.role') + ': ' + $t('strings.' + data.role) + '<br>' +
        $t('strings.attribute') + ': ' + $t('strings.' + data.attribute) + '<br>' +
        $t('strings.rarity') + ': ' + data.rarity + '<br>' +
        'Cannot team up with: ' + ( (data.linked_hero || []).map(h => _this.$store.getters.getHeroName(h)).join(', ') || '-' ) + '<br>' +
        'Has AoE attack: ' + (data.common.includes('aoe') ? 'Yes' : 'No') + ' | Cleanse skill: ' +  (data.common.includes('cleanse') ? 'Yes' : 'No') + ' | Dispel skill: '+ (data.common.includes('dispel') ? 'Yes' : 'No') + '<br><br>' +
        _this.$t('strings.topics') + ': ' + topics.join(', ') + 
        '<br><br>'+
        cValues.join('<br>'),
        [$t('strings.back')]
    ).then(()=>{}).catch(()=>{})
}