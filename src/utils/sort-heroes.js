import store from '../store'
export default function(list, by, reverse, hero) {
  if (!hero) hero = function (id) {return store.getters.getHero(id)};
  if (by!=='recent' && by!=='rarity') list.sort((x, y) => { return (hero(x)[by] > hero(y)[by] ) - (hero(x)[by] < hero(y)[by] ) || (hero(x).name > hero(y).name ) - (hero(x).name < hero(y).name ) });
  else if (by!=='recent') list.sort((x, y) => { return (hero(x)[by] < hero(y)[by] ) - (hero(x)[by] > hero(y)[by] ) || (hero(x).name > hero(y).name ) - (hero(x).name < hero(y).name ) });
  if (reverse) list.reverse();
  return list
}