export function score (substats) {
    var d = {atk: 0, atkRate: 0, hp: 0, hpRate: 0, def: 0, defRate: 0, eff: 0, efr: 0, spd: 0, cr: 0, cd: 0};
    substats.forEach(stat => {
      if (!stat || !stat.value) return;
      d[stat.type] = Number(stat.value);
    });
    return {
      score: d.atkRate + d.defRate + d.hpRate + d.eff + d.efr + d.spd*8/4 + d.cd*8/7 + d.cr*8/5 + d.atk*3.46/39 + d.def*4.99/31 + d.hp*3.09/174,
      dScore: d.atkRate + d.spd*8/4 + d.cd*8/7 + d.cr*8/5 + d.atk*3.46/39,
      sScore: d.defRate + d.hpRate + d.efr + d.spd*8/4 + d.def*4.99/31 + d.hp*3.09/174,
      cScore: d.atkRate + d.defRate + d.hpRate + d.spd*8/4 + d.cd*8/7 + d.cr*8/5 + d.atk*3.46/39 + d.def*4.99/31 + d.hp*3.09/174
    }
}