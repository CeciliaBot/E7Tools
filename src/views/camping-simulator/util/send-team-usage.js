import ajax from '@/utils/ajax.js'

export default function (camp, isAdding) {
    return new Promise( (resolve, reject) => {
        if (!camp.uploaded || camp.converted || camp._type==='friendship') // don't upload usage stats if it's a friendship comp
            return reject();

        // convert to the old format (this will be deleted onece I update the api)
        var obj = {
            morale: camp.morale,
            team: camp.team
        }

        var enemy = camp.gameMode.some( mode => mode.indexOf("azmakalis") === -1) ? camp.enemy : [],
            enemies = ['queen', 'vera', 'karkanis', 'juleeve', 'arakahan']
        for (var i = 0; i < enemies.length; i++) {
            obj[enemies[i]] = enemy.includes(enemies[i])
        }

        obj.nightmare = camp.gameMode.includes("azmakalis_nightmare")
        obj.hell = camp.gameMode.includes("azmakalis_hell")
        obj.normal = camp.gameMode.includes("azmakalis_normal")

        ajax("https://ceciliabotgithub.glitch.me/ceciliabot-team-usage", 'POST',  JSON.stringify({function: isAdding ? 'add' : 'remove', data: camp})).then( (response) => {
            resolve(response)
        }).catch( err => {
            reject(err)
        })
    })
}