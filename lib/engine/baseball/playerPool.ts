import type {
  BaseballHitter,
  BaseballPitcher,
  PlayerEra,
  PlayerTeamStint
} from "@/lib/models/player";

export const BASEBALL_ERAS: PlayerEra[] = ["1990s", "2000s", "2010s", "2020s"];

export const BASEBALL_SOURCE_TEAMS = [
  "Tokyo Meteors",
  "Osaka Waves",
  "Nagoya Falcons",
  "Fukuoka Suns"
] as const;

const GIVEN_NAMES = [
  "陸",
  "陽翔",
  "颯太",
  "蓮",
  "樹",
  "海斗",
  "大地",
  "湊",
  "悠斗",
  "晃",
  "駿",
  "冬真",
  "玲央",
  "直樹",
  "隼",
  "圭"
];

const FAMILY_NAMES = [
  "佐藤",
  "鈴木",
  "高橋",
  "田中",
  "渡辺",
  "伊藤",
  "山本",
  "中村",
  "小林",
  "加藤",
  "吉田",
  "山田",
  "佐々木",
  "山口",
  "松本",
  "井上"
];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function stableHash(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = Math.imul(31, hash) + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function rating(base: number, spread: number, key: string): number {
  const width = spread * 2 + 1;
  return clamp(base + (stableHash(key) % width) - spread, 35, 95);
}

function teamSlug(team: string): string {
  return team.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function avatarId(id: string): string {
  return `avatar-${(stableHash(id) % 8) + 1}`;
}

function previousEra(eraIndex: number, offset: number): PlayerEra {
  return BASEBALL_ERAS[Math.max(0, eraIndex - offset)];
}

function buildHitterHistory(
  era: PlayerEra,
  eraIndex: number,
  sourceTeam: string,
  teamIndex: number,
  slot: number,
  contact: number,
  power: number,
  fielding: number
): PlayerTeamStint[] {
  const secondTeam = BASEBALL_SOURCE_TEAMS[(teamIndex + slot + 1) % BASEBALL_SOURCE_TEAMS.length];
  const historyTeams = slot % 3 === 0
    ? [sourceTeam, secondTeam, BASEBALL_SOURCE_TEAMS[(teamIndex + 2) % BASEBALL_SOURCE_TEAMS.length]]
    : [sourceTeam, secondTeam];

  return historyTeams.map((teamName, index) => {
    const contactShift = index === 0 ? 0 : -4 - index;
    const powerShift = index === 0 ? 0 : -3 + index;
    const average = clamp(contact + contactShift, 35, 95);
    const slugging = clamp(power + powerShift, 35, 95);
    const battingAverage = (0.215 + average / 520).toFixed(3).replace(/^0/, "");
    const homeRuns = Math.round(6 + slugging / 3.8 + (slot % 4) * 2 - index * 3);
    const games = 96 + ((stableHash(`${teamName}-${era}-${slot}`) + index * 17) % 48);

    return {
      teamName,
      era: index === 0 ? era : previousEra(eraIndex, index),
      games,
      statLine: `打率 ${battingAverage} / ${Math.max(1, homeRuns)}本 / 守備${Math.round(fielding - index * 2)}`,
      note:
        index === 0
          ? "この年代・所属チームの成績を現在能力に反映"
          : "移籍前後の参考成績"
    };
  });
}

function buildPitcherHistory(
  era: PlayerEra,
  eraIndex: number,
  sourceTeam: string,
  teamIndex: number,
  slot: number,
  control: number,
  stuff: number,
  stamina: number
): PlayerTeamStint[] {
  const secondTeam = BASEBALL_SOURCE_TEAMS[(teamIndex + slot + 2) % BASEBALL_SOURCE_TEAMS.length];
  const historyTeams = slot === 0
    ? [sourceTeam, secondTeam, BASEBALL_SOURCE_TEAMS[(teamIndex + 3) % BASEBALL_SOURCE_TEAMS.length]]
    : [sourceTeam, secondTeam];

  return historyTeams.map((teamName, index) => {
    const command = clamp(control - index * 4, 35, 95);
    const strikeout = clamp(stuff - index * 2, 35, 95);
    const innings = 92 + ((stableHash(`${teamName}-${era}-p-${slot}`) + index * 19) % 76);
    const wins = Math.max(2, Math.round(innings / 15 + stamina / 18 - index));
    const eraValue = (4.85 - command / 48 - strikeout / 72 + index * 0.24).toFixed(2);

    return {
      teamName,
      era: index === 0 ? era : previousEra(eraIndex, index),
      games: Math.round(innings / 5.5),
      statLine: `${wins}勝 / 防御率 ${eraValue} / ${innings}回`,
      note:
        index === 0
          ? "この年代・所属チームの投球成績を現在能力に反映"
          : "移籍前後の参考成績"
    };
  });
}

export function getBaseballPlayerPool(): {
  hitters: BaseballHitter[];
  pitchers: BaseballPitcher[];
} {
  const hitters: BaseballHitter[] = [];
  const pitchers: BaseballPitcher[] = [];

  BASEBALL_ERAS.forEach((era, eraIndex) => {
    BASEBALL_SOURCE_TEAMS.forEach((sourceTeam, teamIndex) => {
      for (let slot = 0; slot < 10; slot += 1) {
        const nameIndex = eraIndex * 7 + teamIndex * 5 + slot;
        const key = `${era}-${sourceTeam}-h-${slot}`;
        const id = `bb-h-${era}-${teamSlug(sourceTeam)}-${slot + 1}`;
        const contact = rating(58 + eraIndex * 3 + (slot % 3) * 4 + teamIndex, 11, `${key}-c`);
        const power = rating(53 + teamIndex * 3 + (slot % 4) * 4 + eraIndex, 13, `${key}-p`);
        const fielding = rating(57 + teamIndex * 2 + (slot % 5) * 3 + eraIndex, 12, `${key}-f`);
        hitters.push({
          id,
          name: `${FAMILY_NAMES[(nameIndex * 3) % FAMILY_NAMES.length]} ${
            GIVEN_NAMES[nameIndex % GIVEN_NAMES.length]
          }`,
          sport: "baseball",
          role: "hitter",
          era,
          sourceTeam,
          imageId: avatarId(id),
          teamHistory: buildHitterHistory(
            era,
            eraIndex,
            sourceTeam,
            teamIndex,
            slot,
            contact,
            power,
            fielding
          ),
          contact,
          power,
          fielding
        });
      }

      for (let slot = 0; slot < 3; slot += 1) {
        const nameIndex = eraIndex * 9 + teamIndex * 6 + slot + 4;
        const key = `${era}-${sourceTeam}-p-${slot}`;
        const id = `bb-p-${era}-${teamSlug(sourceTeam)}-${slot + 1}`;
        const control = rating(59 + eraIndex * 2 + slot * 5 + teamIndex, 12, `${key}-ctl`);
        const stuff = rating(57 + teamIndex * 3 + slot * 5 + eraIndex, 12, `${key}-stf`);
        const stamina = rating(62 + eraIndex * 2 + slot * 6 + teamIndex, 10, `${key}-sta`);
        pitchers.push({
          id,
          name: `${FAMILY_NAMES[(nameIndex * 5) % FAMILY_NAMES.length]} ${
            GIVEN_NAMES[(nameIndex * 2) % GIVEN_NAMES.length]
          }`,
          sport: "baseball",
          role: "pitcher",
          era,
          sourceTeam,
          imageId: avatarId(id),
          teamHistory: buildPitcherHistory(
            era,
            eraIndex,
            sourceTeam,
            teamIndex,
            slot,
            control,
            stuff,
            stamina
          ),
          control,
          stuff,
          stamina
        });
      }
    });
  });

  return { hitters, pitchers };
}
