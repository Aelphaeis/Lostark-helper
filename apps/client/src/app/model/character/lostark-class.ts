export enum LostarkClass {
  DESTROYER,
  UNRELEASED,
  ARCANA,
  BERSERKER,
  WARDANCER,
  DEADEYE,
  UNRELEASED0,
  GUNLANCER,
  GUNNER,
  SCRAPPER,
  MAGE,
  SUMMONER,
  WARRIOR,
  SOULFIST,
  SHARPSHOOTER,
  ARTILLERIST,
  BARD,
  GLAIVIER,
  ASSASSIN,
  DEATHBLADE,
  SHADOWHUNTER,
  PALADIN,
  SCOUTER,
  REAPER,
  UNRELEASED4,
  GUNSLINGER,
  UNRELEASED5,
  STRIKER,
  SORCERESS,
  ARTIST,
  SLAYER
}

export function isSupportClass(c: LostarkClass): boolean {
  return [LostarkClass.BARD, LostarkClass.PALADIN, LostarkClass.ARTIST].includes(+c);
}
