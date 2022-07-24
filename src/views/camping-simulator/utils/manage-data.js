const ROSTER_PREFIX = 'CROSTER_';
const TEAMS_PREFIX = 'CTEAMS_';
const ACCOUNTS_OBJ = 'CACCOUNTS';
const CURRENT_ACCOUNT = 'CCACCOUNT';

export function importOldData(account, version) {
    if (!localStorage.getItem('CVERSION')) {
        var rowData = localStorage.getItem('Heroes') || "{}";
        var roster = JSON.parse(rowData);
        if (typeof roster === 'object') roster = Object.keys(roster);
        writeRoster(roster, account, version);

        var rawTeams = localStorage.getItem('savedCamps') || "{}";
        var teams = JSON.parse(rawTeams);
        var keys = Object.keys(teams);
        var arr = [];
        for (var i = 0; i<keys.length; i++) {
            var t = teams[keys[i]];
            arr.push(
                {
                    teamId: new Date().getTime() + i,
                    name: keys[i],
                    morale: t.morale,
                    topics: [t.opzioneMigliore1, t.opzioneMigliore2],
                    holder: [t.migliorPG1, t.migliorPG2],
                    team: t.team,
                    gamemode: [],
                    enemy: [],
                    uploaded: true
                }
            )
        }
        writeTeams(arr, account, version);
    }
}

export function writeRoster(data, profile, cversion) {
    try {
        if (!data) return;
        if (profile===undefined) profile = '';
        var toWrite = {
            version: cversion,
            data: data
        };
        localStorage.setItem(ROSTER_PREFIX+profile, JSON.stringify(toWrite));
        return Promise.resolve();
    } catch (err) {
        console.log(err);
        return Promise.reject(err);
    }
}
export function getRoster(profile, cversion) {
    try {
        if (profile===undefined) profile = '';
        var data = localStorage.getItem(ROSTER_PREFIX+profile) || '{}';
        var parsed = JSON.parse(data);
        var version = parsed.version || cversion;
        var roster = (parsed.data || [] ).splice(0);
        if (version<=0) console.log('Needs conversion');
        return Promise.resolve(roster);
    } catch (err) {
        return Promise.reject(err);
    }
}
export function writeTeams(data, profile, cversion) {
    try {
        if (!data) return;
        if (profile===undefined) profile = '';
        var toWrite = {
            version: cversion,
            data: data
        };
        localStorage.setItem(TEAMS_PREFIX+profile, JSON.stringify(toWrite));
        return Promise.resolve();
    } catch (err) {
        return Promise.reject(err);
    }
}
export function getTeams(profile, cversion) {
    try {
        if (profile===undefined) profile = '';
        var data = localStorage.getItem(TEAMS_PREFIX+profile) || '{}';
        var parsed = JSON.parse(data);
        var version = parsed.version || cversion;
        var teams = parsed.data || [];
        if (version<=0) console.log('Needs conversion');
        return Promise.resolve(teams);
    } catch (err) {
        return Promise.reject(err);
    }
}
export function clearProfileData(profile) {
    localStorage.removeItem(ROSTER_PREFIX+profile);
    localStorage.removeItem(TEAMS_PREFIX+profile);
}
export function writeAccounts(data, version) {
    try {
        if (!data) return;
        var toWrite = {
            version: version,
            data: data
        };
        localStorage.setItem(ACCOUNTS_OBJ, JSON.stringify(toWrite));
        return Promise.resolve();
    } catch (err) {
        return Promise.reject(err);
    }
}
export function getAccounts(cversion) {
    try {
        var data = localStorage.getItem(ACCOUNTS_OBJ) || '{}';
        var id = localStorage.getItem(CURRENT_ACCOUNT);
        var parsed = JSON.parse(data);
        var version = parsed.version || cversion;
        var accounts = parsed.data;
        if (!accounts) {
            var account = createNewAccount('Main');
            account.id = 0; // always give id 0 to the first roster
            id = account.id;
            localStorage.setItem(CURRENT_ACCOUNT, JSON.stringify(account.id));
            accounts = [account];
            localStorage.setItem(ACCOUNTS_OBJ, JSON.stringify({version: cversion, data: accounts}));
            importOldData(id, cversion);
        }
        if (!id) {
            id = accounts[0].id;
            setCurrentAccount(id);
        }
        if (version<=0) console.log('Needs conversion');
        return Promise.resolve([accounts, Number(id)]);
    } catch (err) {
        return Promise.reject(err);
    }
}
export function createNewAccount(name, icon) {
    var data = {
        id: new Date().getTime(),
        name: name || 'Roster'
    }
    if (icon) data.icon = icon;
    return data;
}
export function newAccount (name, icon, version) {
    return new Promise ((resolve, reject) => {
        getAccounts(version).then( ([accounts]) => {
            console.log(accounts)
            let newRoster = createNewAccount(name, icon, version)
            accounts.push(newRoster);
            writeAccounts(accounts, version).then( () => {
                setCurrentAccount(newRoster.id);
                resolve([accounts, newRoster.id]);
            }).catch(err => {
                console.log('Account writing failed!', err)
                reject(err)
            })
        }).catch(err => {
            reject(err)
        })
    })
}
export function deleteAccount(profile, version) {
    return new Promise ((resolve, reject) => {
        getAccounts(version).then(accounts => {
            accounts = accounts[0];
            let curr = getCurrentAccount();
            for (var i=0; i<accounts.length; i++) {
                if (accounts[i].id===profile) {
                    if (curr === profile) curr = null;
                    accounts.splice(i,1);
                    break
                }
            }
            if (!accounts.length) {
                let newRoster = createNewAccount()
                accounts.push(newRoster)
            }
            writeAccounts(accounts, version).then( () => {
                clearProfileData(profile);
                if (!curr) {
                    curr = accounts[0].id
                    setCurrentAccount(curr)
                }
                console.log('Account deleted');
                resolve([accounts, curr]);
            }).catch(err => {
                console.log('Account writing failed!', err)
                reject(err)
            })
        }).catch(err => {
            console.log('Account deletion failed!', err);
            reject(err);
        })
    })
}
export function editAccount (newData, version) {
    return new Promise ((resolve, reject) => {
        getAccounts(version).then(accounts => {
            accounts = accounts[0];
            for (var i=0; i<accounts.length; i++) {
                if (accounts[i].id===newData.id) {
                    accounts.splice(i,1, newData);
                    break
                }
            }
            writeAccounts(accounts, version).then( () => {
                console.log('Account edited');
                resolve(accounts);
            }).catch(err => {
                console.log('Account writing failed!', err)
                reject(err)
            })
        }).catch(err => {
            console.log('Account editing failed!', err);
            reject(err);
        })
    })
}
export function setCurrentAccount (id) {
    localStorage.setItem(CURRENT_ACCOUNT, id);
}
export function getCurrentAccount () {
    var v = localStorage.getItem(CURRENT_ACCOUNT);
    return v?Number(v):undefined;
}