import type { BaseballHitter, BaseballPitcher, PlayerEra } from "@/lib/models/player";

export const BASEBALL_ERAS: PlayerEra[] = ["1990s", "2000s", "2010s", "2020s"];

export const BASEBALL_SOURCE_TEAMS = [
  "Tokyo Meteors",
  "Osaka Waves",
  "Nagoya Falcons",
  "Fukuoka Suns"
] as const;

const FIRST_NAMES = [
  "Riku",
  "Haruto",
  "Sota",
  "Ren",
  "Itsuki",
  "Kaito",
  "Daichi",
  "Minato",
  "Yuto",
  "Akira",
  "Shun",
  "Toma",
  "Reo",
  "Naoki",
  "Hayate",
  "Kei"
];

const LAST_NAMES = [
  "Sato",
  "Suzuki",
  "Takahashi",
  "Tanaka",
  "Watanabe",
  "Ito",
  "Yamamoto",
  "Nakamura",
  "Kobayashi",
  "Kato",
  "Yoshida",
  "Yamada",
  "Sasaki",
  "Yamaguchi",
  "Matsumoto",
  "Inoue"
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
        hitters.push({
          id: `bb-h-${era}-${teamSlug(sourceTeam)}-${slot + 1}`,
          name: `${FIRST_NAMES[nameIndex % FIRST_NAMES.length]} ${
            LAST_NAMES[(nameIndex * 3) % LAST_NAMES.length]
          }`,
          sport: "baseball",
          role: "hitter",
          era,
          sourceTeam,
          contact: rating(58 + eraIndex * 3 + (slot % 3) * 4 + teamIndex, 11, `${key}-c`),
          power: rating(53 + teamIndex * 3 + (slot % 4) * 4 + eraIndex, 13, `${key}-p`)
        });
      }

      for (let slot = 0; slot < 3; slot += 1) {
        const nameIndex = eraIndex * 9 + teamIndex * 6 + slot + 4;
        const key = `${era}-${sourceTeam}-p-${slot}`;
        pitchers.push({
          id: `bb-p-${era}-${teamSlug(sourceTeam)}-${slot + 1}`,
          name: `${FIRST_NAMES[(nameIndex * 2) % FIRST_NAMES.length]} ${
            LAST_NAMES[(nameIndex * 5) % LAST_NAMES.length]
          }`,
          sport: "baseball",
          role: "pitcher",
          era,
          sourceTeam,
          control: rating(59 + eraIndex * 2 + slot * 5 + teamIndex, 12, `${key}-ctl`),
          stuff: rating(57 + teamIndex * 3 + slot * 5 + eraIndex, 12, `${key}-stf`)
        });
      }
    });
  });

  return { hitters, pitchers };
}
