import type {
  BaseballHitter,
  BaseballPitcher,
  PlayerEra,
  PlayerTeamStint
} from "@/lib/models/player";

export const BASEBALL_ERAS: PlayerEra[] = ["2020s"];

export const BASEBALL_SOURCE_TEAMS = [
  "阪神タイガース",
  "横浜DeNAベイスターズ",
  "福岡ソフトバンクホークス",
  "北海道日本ハムファイターズ"
] as const;

export const BASEBALL_DATA_SEASON = 2025;
export const BASEBALL_DATA_SOURCE =
  "https://npb.jp/bis/2025/stats/";

const TEAM_SLUGS: Record<(typeof BASEBALL_SOURCE_TEAMS)[number], string> = {
  "阪神タイガース": "hanshin-tigers",
  "横浜DeNAベイスターズ": "yokohama-dena-baystars",
  "福岡ソフトバンクホークス": "fukuoka-softbank-hawks",
  "北海道日本ハムファイターズ": "hokkaido-nipponham-fighters"
};

interface RawHitter {
  name: string;
  team: (typeof BASEBALL_SOURCE_TEAMS)[number];
  sourceUrl: string;
  games: number;
  pa: number;
  ab: number;
  runs: number;
  hits: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  rbi: number;
  steals: number;
  walks: number;
  strikeouts: number;
  avg: number;
  slg: number;
  obp: number;
  fieldingSeed: number;
}

interface RawPitcher {
  name: string;
  team: (typeof BASEBALL_SOURCE_TEAMS)[number];
  sourceUrl: string;
  games: number;
  wins: number;
  losses: number;
  battersFaced: number;
  innings: number;
  hitsAllowed: number;
  homeRunsAllowed: number;
  walks: number;
  strikeouts: number;
  runsAllowed: number;
  earnedRuns: number;
  eraValue: number;
}

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

function teamSlug(team: string): string {
  if (team in TEAM_SLUGS) return TEAM_SLUGS[team as (typeof BASEBALL_SOURCE_TEAMS)[number]];

  return team
    .toLowerCase()
    .replace(/[^a-z0-9\u3040-\u30ff\u3400-\u9fff]+/g, "-")
    .replace(/^-|-$/g, "");
}

function avatarId(id: string): string {
  return `avatar-${(stableHash(id) % 8) + 1}`;
}

function rating(value: number): number {
  return Math.round(clamp(value, 35, 95));
}

function contactRating(player: RawHitter): number {
  const sample = clamp(player.pa / 600, 0.45, 1);
  return rating(35 + player.avg * 105 + player.obp * 42 + sample * 8 - player.strikeouts / Math.max(player.pa, 1) * 20);
}

function powerRating(player: RawHitter): number {
  const hrRate = player.homeRuns / Math.max(player.pa, 1);
  const extraBaseRate = (player.doubles + player.triples + player.homeRuns) / Math.max(player.ab, 1);
  return rating(34 + player.slg * 58 + hrRate * 320 + extraBaseRate * 48);
}

function fieldingRating(player: RawHitter): number {
  const runningDefense = player.steals >= 20 ? 7 : player.steals >= 8 ? 4 : 0;
  return rating(52 + player.fieldingSeed + runningDefense + clamp(player.games / 143, 0.3, 1) * 8);
}

function controlRating(player: RawPitcher): number {
  const bbRate = player.walks / Math.max(player.battersFaced, 1);
  const eraBonus = clamp((3.2 - player.eraValue) * 8, -10, 14);
  return rating(68 - bbRate * 260 + eraBonus);
}

function stuffRating(player: RawPitcher): number {
  const strikeoutRate = player.strikeouts / Math.max(player.battersFaced, 1);
  const hrPenalty = player.homeRunsAllowed / Math.max(player.battersFaced, 1) * 220;
  return rating(48 + strikeoutRate * 190 - hrPenalty + clamp((2.8 - player.eraValue) * 4, -8, 8));
}

function staminaRating(player: RawPitcher): number {
  return rating(42 + clamp(player.innings / 180, 0.2, 1.15) * 42 + player.games * 0.35);
}

function hitterHistory(player: RawHitter): PlayerTeamStint[] {
  return [
    {
      teamName: player.team,
      era: "2020s",
      games: player.games,
      statLine: `2025年: 打率 ${player.avg.toFixed(3).replace(/^0/, "")} / ${player.homeRuns}本 / OPS ${(player.obp + player.slg).toFixed(3).replace(/^0/, "")}`,
      note: "2025年公式戦の打撃成績からミート / 長打力を変換"
    }
  ];
}

function pitcherHistory(player: RawPitcher): PlayerTeamStint[] {
  return [
    {
      teamName: player.team,
      era: "2020s",
      games: player.games,
      statLine: `2025年: ${player.wins}勝${player.losses}敗 / 防御率 ${player.eraValue.toFixed(2)} / ${player.innings}回`,
      note: "2025年公式戦の投球成績から制球 / 球威 / スタミナを変換"
    }
  ];
}

const RAW_HITTERS: RawHitter[] = [
  { team: "阪神タイガース", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_t.html", name: "近本 光司", games: 140, pa: 638, ab: 573, runs: 76, hits: 160, doubles: 25, triples: 4, homeRuns: 3, rbi: 34, steals: 32, walks: 60, strikeouts: 88, avg: 0.279, slg: 0.353, obp: 0.348, fieldingSeed: 12 },
  { team: "阪神タイガース", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_t.html", name: "中野 拓夢", games: 143, pa: 625, ab: 531, runs: 65, hits: 150, doubles: 18, triples: 3, homeRuns: 0, rbi: 30, steals: 19, walks: 44, strikeouts: 77, avg: 0.282, slg: 0.328, obp: 0.339, fieldingSeed: 13 },
  { team: "阪神タイガース", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_t.html", name: "森下 翔太", games: 143, pa: 620, ab: 549, runs: 82, hits: 151, doubles: 24, triples: 5, homeRuns: 23, rbi: 89, steals: 5, walks: 54, strikeouts: 86, avg: 0.275, slg: 0.463, obp: 0.350, fieldingSeed: 8 },
  { team: "阪神タイガース", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_t.html", name: "佐藤 輝明", games: 139, pa: 597, ab: 537, runs: 83, hits: 149, doubles: 34, triples: 4, homeRuns: 40, rbi: 102, steals: 10, walks: 57, strikeouts: 163, avg: 0.277, slg: 0.579, obp: 0.345, fieldingSeed: 5 },
  { team: "阪神タイガース", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_t.html", name: "大山 悠輔", games: 141, pa: 587, ab: 503, runs: 52, hits: 133, doubles: 25, triples: 1, homeRuns: 13, rbi: 75, steals: 6, walks: 74, strikeouts: 96, avg: 0.264, slg: 0.396, obp: 0.363, fieldingSeed: 8 },
  { team: "阪神タイガース", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_t.html", name: "坂本 誠志郎", games: 117, pa: 414, ab: 340, runs: 21, hits: 84, doubles: 19, triples: 1, homeRuns: 2, rbi: 27, steals: 2, walks: 53, strikeouts: 91, avg: 0.247, slg: 0.326, obp: 0.357, fieldingSeed: 14 },
  { team: "阪神タイガース", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_t.html", name: "小幡 竜平", games: 89, pa: 297, ab: 265, runs: 23, hits: 59, doubles: 8, triples: 0, homeRuns: 5, rbi: 17, steals: 6, walks: 18, strikeouts: 64, avg: 0.223, slg: 0.309, obp: 0.272, fieldingSeed: 12 },
  { team: "阪神タイガース", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_t.html", name: "前川 右京", games: 69, pa: 209, ab: 195, runs: 11, hits: 48, doubles: 10, triples: 1, homeRuns: 1, rbi: 15, steals: 0, walks: 8, strikeouts: 30, avg: 0.246, slg: 0.323, obp: 0.297, fieldingSeed: 4 },
  { team: "阪神タイガース", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_t.html", name: "熊谷 敬宥", games: 85, pa: 170, ab: 156, runs: 22, hits: 35, doubles: 2, triples: 3, homeRuns: 1, rbi: 18, steals: 6, walks: 5, strikeouts: 33, avg: 0.224, slg: 0.295, obp: 0.253, fieldingSeed: 13 },

  { team: "横浜DeNAベイスターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_db.html", name: "蝦名 達夫", games: 115, pa: 401, ab: 348, runs: 53, hits: 99, doubles: 21, triples: 1, homeRuns: 8, rbi: 41, steals: 5, walks: 31, strikeouts: 68, avg: 0.284, slg: 0.420, obp: 0.355, fieldingSeed: 8 },
  { team: "横浜DeNAベイスターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_db.html", name: "オースティン", games: 65, pa: 246, ab: 219, runs: 35, hits: 59, doubles: 14, triples: 0, homeRuns: 11, rbi: 28, steals: 0, walks: 26, strikeouts: 45, avg: 0.269, slg: 0.484, obp: 0.350, fieldingSeed: 2 },
  { team: "横浜DeNAベイスターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_db.html", name: "桑原 将志", games: 106, pa: 447, ab: 398, runs: 48, hits: 113, doubles: 17, triples: 2, homeRuns: 6, rbi: 27, steals: 10, walks: 30, strikeouts: 59, avg: 0.284, slg: 0.382, obp: 0.348, fieldingSeed: 12 },
  { team: "横浜DeNAベイスターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_db.html", name: "佐野 恵太", games: 138, pa: 569, ab: 525, runs: 47, hits: 144, doubles: 24, triples: 0, homeRuns: 15, rbi: 70, steals: 0, walks: 34, strikeouts: 61, avg: 0.274, slg: 0.406, obp: 0.322, fieldingSeed: 4 },
  { team: "横浜DeNAベイスターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_db.html", name: "筒香 嘉智", games: 75, pa: 257, ab: 224, runs: 29, hits: 51, doubles: 12, triples: 0, homeRuns: 20, rbi: 43, steals: 0, walks: 33, strikeouts: 59, avg: 0.228, slg: 0.549, obp: 0.327, fieldingSeed: 2 },
  { team: "横浜DeNAベイスターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_db.html", name: "牧 秀悟", games: 93, pa: 391, ab: 364, runs: 48, hits: 101, doubles: 24, triples: 0, homeRuns: 16, rbi: 49, steals: 3, walks: 16, strikeouts: 76, avg: 0.277, slg: 0.475, obp: 0.325, fieldingSeed: 6 },
  { team: "横浜DeNAベイスターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_db.html", name: "宮﨑 敏郎", games: 95, pa: 352, ab: 321, runs: 25, hits: 89, doubles: 16, triples: 1, homeRuns: 6, rbi: 39, steals: 0, walks: 28, strikeouts: 42, avg: 0.277, slg: 0.389, obp: 0.335, fieldingSeed: 3 },
  { team: "横浜DeNAベイスターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_db.html", name: "山本 祐大", games: 104, pa: 344, ab: 313, runs: 22, hits: 82, doubles: 19, triples: 2, homeRuns: 3, rbi: 41, steals: 0, walks: 16, strikeouts: 40, avg: 0.262, slg: 0.364, obp: 0.300, fieldingSeed: 14 },
  { team: "横浜DeNAベイスターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_db.html", name: "度会 隆輝", games: 86, pa: 301, ab: 270, runs: 24, hits: 65, doubles: 10, triples: 2, homeRuns: 6, rbi: 25, steals: 0, walks: 24, strikeouts: 36, avg: 0.241, slg: 0.359, obp: 0.303, fieldingSeed: 5 },

  { team: "福岡ソフトバンクホークス", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_h.html", name: "今宮 健太", games: 46, pa: 182, ab: 161, runs: 14, hits: 41, doubles: 8, triples: 1, homeRuns: 2, rbi: 12, steals: 0, walks: 12, strikeouts: 23, avg: 0.255, slg: 0.354, obp: 0.313, fieldingSeed: 16 },
  { team: "福岡ソフトバンクホークス", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_h.html", name: "栗原 陵矢", games: 80, pa: 332, ab: 285, runs: 33, hits: 76, doubles: 12, triples: 2, homeRuns: 8, rbi: 40, steals: 1, walks: 40, strikeouts: 67, avg: 0.267, slg: 0.407, obp: 0.356, fieldingSeed: 8 },
  { team: "福岡ソフトバンクホークス", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_h.html", name: "近藤 健介", games: 75, pa: 307, ab: 256, runs: 28, hits: 77, doubles: 17, triples: 1, homeRuns: 10, rbi: 41, steals: 0, walks: 47, strikeouts: 43, avg: 0.301, slg: 0.492, obp: 0.410, fieldingSeed: 5 },
  { team: "福岡ソフトバンクホークス", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_h.html", name: "周東 佑京", games: 96, pa: 430, ab: 384, runs: 45, hits: 110, doubles: 13, triples: 2, homeRuns: 3, rbi: 36, steals: 35, walks: 37, strikeouts: 73, avg: 0.286, slg: 0.354, obp: 0.357, fieldingSeed: 14 },
  { team: "福岡ソフトバンクホークス", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_h.html", name: "中村 晃", games: 116, pa: 431, ab: 371, runs: 34, hits: 89, doubles: 10, triples: 4, homeRuns: 3, rbi: 34, steals: 1, walks: 50, strikeouts: 48, avg: 0.240, slg: 0.313, obp: 0.330, fieldingSeed: 7 },
  { team: "福岡ソフトバンクホークス", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_h.html", name: "野村 勇", games: 126, pa: 413, ab: 376, runs: 50, hits: 102, doubles: 16, triples: 0, homeRuns: 12, rbi: 40, steals: 18, walks: 25, strikeouts: 122, avg: 0.271, slg: 0.410, obp: 0.324, fieldingSeed: 11 },
  { team: "福岡ソフトバンクホークス", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_h.html", name: "牧原 大成", games: 125, pa: 443, ab: 418, runs: 44, hits: 127, doubles: 17, triples: 6, homeRuns: 5, rbi: 49, steals: 12, walks: 7, strikeouts: 63, avg: 0.304, slg: 0.409, obp: 0.317, fieldingSeed: 13 },
  { team: "福岡ソフトバンクホークス", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_h.html", name: "柳町 達", games: 131, pa: 517, ab: 442, runs: 54, hits: 129, doubles: 17, triples: 1, homeRuns: 6, rbi: 50, steals: 2, walks: 62, strikeouts: 109, avg: 0.292, slg: 0.376, obp: 0.384, fieldingSeed: 5 },
  { team: "福岡ソフトバンクホークス", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_h.html", name: "山川 穂高", games: 130, pa: 496, ab: 443, runs: 45, hits: 100, doubles: 9, triples: 0, homeRuns: 23, rbi: 62, steals: 0, walks: 45, strikeouts: 126, avg: 0.226, slg: 0.402, obp: 0.300, fieldingSeed: 3 },

  { team: "北海道日本ハムファイターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_f.html", name: "石井 一成", games: 108, pa: 364, ab: 332, runs: 41, hits: 86, doubles: 17, triples: 3, homeRuns: 6, rbi: 30, steals: 3, walks: 23, strikeouts: 86, avg: 0.259, slg: 0.383, obp: 0.306, fieldingSeed: 12 },
  { team: "北海道日本ハムファイターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_f.html", name: "五十幡 亮汰", games: 118, pa: 307, ab: 284, runs: 45, hits: 66, doubles: 5, triples: 10, homeRuns: 1, rbi: 18, steals: 25, walks: 18, strikeouts: 73, avg: 0.232, slg: 0.331, obp: 0.283, fieldingSeed: 16 },
  { team: "北海道日本ハムファイターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_f.html", name: "清宮 幸太郎", games: 138, pa: 577, ab: 525, runs: 63, hits: 143, doubles: 25, triples: 1, homeRuns: 12, rbi: 65, steals: 8, walks: 46, strikeouts: 85, avg: 0.272, slg: 0.392, obp: 0.329, fieldingSeed: 6 },
  { team: "北海道日本ハムファイターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_f.html", name: "郡司 裕也", games: 111, pa: 422, ab: 364, runs: 46, hits: 108, doubles: 15, triples: 0, homeRuns: 10, rbi: 42, steals: 0, walks: 45, strikeouts: 71, avg: 0.297, slg: 0.420, obp: 0.379, fieldingSeed: 7 },
  { team: "北海道日本ハムファイターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_f.html", name: "田宮 裕涼", games: 79, pa: 274, ab: 245, runs: 29, hits: 62, doubles: 6, triples: 1, homeRuns: 5, rbi: 21, steals: 2, walks: 18, strikeouts: 44, avg: 0.253, slg: 0.347, obp: 0.303, fieldingSeed: 14 },
  { team: "北海道日本ハムファイターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_f.html", name: "野村 佑希", games: 101, pa: 369, ab: 339, runs: 28, hits: 91, doubles: 18, triples: 1, homeRuns: 8, rbi: 35, steals: 1, walks: 26, strikeouts: 70, avg: 0.268, slg: 0.398, obp: 0.325, fieldingSeed: 4 },
  { team: "北海道日本ハムファイターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_f.html", name: "万波 中正", games: 127, pa: 465, ab: 420, runs: 48, hits: 96, doubles: 23, triples: 1, homeRuns: 20, rbi: 56, steals: 3, walks: 43, strikeouts: 125, avg: 0.229, slg: 0.431, obp: 0.302, fieldingSeed: 13 },
  { team: "北海道日本ハムファイターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_f.html", name: "水谷 瞬", games: 87, pa: 321, ab: 296, runs: 45, hits: 82, doubles: 16, triples: 3, homeRuns: 12, rbi: 41, steals: 6, walks: 18, strikeouts: 77, avg: 0.277, slg: 0.473, obp: 0.322, fieldingSeed: 8 },
  { team: "北海道日本ハムファイターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_f.html", name: "レイエス", games: 132, pa: 531, ab: 476, runs: 62, hits: 132, doubles: 17, triples: 0, homeRuns: 32, rbi: 90, steals: 0, walks: 52, strikeouts: 129, avg: 0.277, slg: 0.515, obp: 0.347, fieldingSeed: 2 }
];

const RAW_PITCHERS: RawPitcher[] = [
  { team: "阪神タイガース", sourceUrl: "https://npb.jp/bis/2025/stats/idp1_t.html", name: "村上 頌樹", games: 26, wins: 14, losses: 4, battersFaced: 679, innings: 175.1, hitsAllowed: 131, homeRunsAllowed: 9, walks: 25, strikeouts: 144, runsAllowed: 41, earnedRuns: 41, eraValue: 2.10 },
  { team: "阪神タイガース", sourceUrl: "https://npb.jp/bis/2025/stats/idp1_t.html", name: "才木 浩人", games: 24, wins: 12, losses: 6, battersFaced: 636, innings: 157, hitsAllowed: 123, homeRunsAllowed: 6, walks: 44, strikeouts: 122, runsAllowed: 29, earnedRuns: 27, eraValue: 1.55 },
  { team: "阪神タイガース", sourceUrl: "https://npb.jp/bis/2025/stats/idp1_t.html", name: "デュプランティエ", games: 15, wins: 6, losses: 3, battersFaced: 349, innings: 90.2, hitsAllowed: 53, homeRunsAllowed: 1, walks: 20, strikeouts: 113, runsAllowed: 19, earnedRuns: 14, eraValue: 1.39 },
  { team: "横浜DeNAベイスターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idp1_db.html", name: "ケイ", games: 24, wins: 9, losses: 6, battersFaced: 604, innings: 155, hitsAllowed: 111, homeRunsAllowed: 8, walks: 41, strikeouts: 130, runsAllowed: 31, earnedRuns: 30, eraValue: 1.74 },
  { team: "横浜DeNAベイスターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idp1_db.html", name: "ジャクソン", games: 25, wins: 10, losses: 7, battersFaced: 636, innings: 150.2, hitsAllowed: 134, homeRunsAllowed: 9, walks: 55, strikeouts: 109, runsAllowed: 46, earnedRuns: 39, eraValue: 2.33 },
  { team: "横浜DeNAベイスターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idp1_db.html", name: "バウアー", games: 21, wins: 4, losses: 10, battersFaced: 570, innings: 133.2, hitsAllowed: 135, homeRunsAllowed: 15, walks: 48, strikeouts: 119, runsAllowed: 67, earnedRuns: 67, eraValue: 4.51 },
  { team: "福岡ソフトバンクホークス", sourceUrl: "https://npb.jp/bis/2025/stats/idp1_h.html", name: "有原 航平", games: 26, wins: 14, losses: 9, battersFaced: 724, innings: 175, hitsAllowed: 167, homeRunsAllowed: 10, walks: 41, strikeouts: 121, runsAllowed: 67, earnedRuns: 59, eraValue: 3.03 },
  { team: "福岡ソフトバンクホークス", sourceUrl: "https://npb.jp/bis/2025/stats/idp1_h.html", name: "上沢 直之", games: 23, wins: 12, losses: 6, battersFaced: 577, innings: 144.2, hitsAllowed: 113, homeRunsAllowed: 12, walks: 36, strikeouts: 115, runsAllowed: 52, earnedRuns: 44, eraValue: 2.74 },
  { team: "福岡ソフトバンクホークス", sourceUrl: "https://npb.jp/bis/2025/stats/idp1_h.html", name: "大関 友久", games: 24, wins: 13, losses: 5, battersFaced: 586, innings: 146.2, hitsAllowed: 107, homeRunsAllowed: 11, walks: 35, strikeouts: 97, runsAllowed: 36, earnedRuns: 27, eraValue: 1.66 },
  { team: "北海道日本ハムファイターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idp1_f.html", name: "伊藤 大海", games: 27, wins: 14, losses: 8, battersFaced: 797, innings: 196.2, hitsAllowed: 179, homeRunsAllowed: 15, walks: 29, strikeouts: 195, runsAllowed: 60, earnedRuns: 55, eraValue: 2.52 },
  { team: "北海道日本ハムファイターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idp1_f.html", name: "北山 亘基", games: 22, wins: 9, losses: 5, battersFaced: 599, innings: 149, hitsAllowed: 112, homeRunsAllowed: 7, walks: 45, strikeouts: 143, runsAllowed: 37, earnedRuns: 27, eraValue: 1.63 },
  { team: "北海道日本ハムファイターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idp1_f.html", name: "達 孝太", games: 16, wins: 8, losses: 2, battersFaced: 418, innings: 107.2, hitsAllowed: 80, homeRunsAllowed: 7, walks: 20, strikeouts: 94, runsAllowed: 27, earnedRuns: 25, eraValue: 2.09 }
];

export function getBaseballPlayerPool(): {
  hitters: BaseballHitter[];
  pitchers: BaseballPitcher[];
} {
  const hitters = RAW_HITTERS.map((player, index): BaseballHitter => {
    const id = `bb-h-2025-${teamSlug(player.team)}-${index + 1}`;
    return {
      id,
      name: player.name,
      sport: "baseball",
      role: "hitter",
      era: "2020s",
      sourceTeam: player.team,
      imageId: avatarId(id),
      dataSeason: BASEBALL_DATA_SEASON,
      sourceUrl: player.sourceUrl,
      teamHistory: hitterHistory(player),
      contact: contactRating(player),
      power: powerRating(player),
      fielding: fieldingRating(player)
    };
  });

  const pitchers = RAW_PITCHERS.map((player, index): BaseballPitcher => {
    const id = `bb-p-2025-${teamSlug(player.team)}-${index + 1}`;
    return {
      id,
      name: player.name,
      sport: "baseball",
      role: "pitcher",
      era: "2020s",
      sourceTeam: player.team,
      imageId: avatarId(id),
      dataSeason: BASEBALL_DATA_SEASON,
      sourceUrl: player.sourceUrl,
      teamHistory: pitcherHistory(player),
      control: controlRating(player),
      stuff: stuffRating(player),
      stamina: staminaRating(player)
    };
  });

  return { hitters, pitchers };
}
