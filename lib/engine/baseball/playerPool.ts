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
  position: string;
  positionDetail?: string;
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
  pitchingRole: "先発" | "中継ぎ" | "抑え";
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

interface PlayerProfile {
  title: string;
  imageUrl?: string;
}

const WIKIMEDIA_CREDIT = "Wikipedia / Wikimedia Commons";

const PLAYER_PROFILES: Record<string, PlayerProfile> = {
  "近本 光司": {
    title: "近本光司",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Koji_Chikamoto_2021-9-1_%28cropped%29.jpg/500px-Koji_Chikamoto_2021-9-1_%28cropped%29.jpg"
  },
  "中野 拓夢": {
    title: "中野拓夢",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Takumu-Nakano-20231018-Koshien_%28cropped%29.jpg/500px-Takumu-Nakano-20231018-Koshien_%28cropped%29.jpg"
  },
  "森下 翔太": {
    title: "森下翔太",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Shota_Morishita_Tigers.jpg/500px-Shota_Morishita_Tigers.jpg"
  },
  "佐藤 輝明": {
    title: "佐藤輝明",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Teruaki-Sato-20240310-Koshien.jpg/500px-Teruaki-Sato-20240310-Koshien.jpg"
  },
  "大山 悠輔": {
    title: "大山悠輔",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Yusuke_Ohyama_20230618.jpg/500px-Yusuke_Ohyama_20230618.jpg"
  },
  "坂本 誠志郎": {
    title: "坂本誠志郎",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Seishio_Sakmoto_Tigers.jpg/500px-Seishio_Sakmoto_Tigers.jpg"
  },
  "小幡 竜平": { title: "小幡竜平" },
  "前川 右京": {
    title: "前川右京",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Ukyo-Maegawa-20240309-Koshien.jpg/500px-Ukyo-Maegawa-20240309-Koshien.jpg"
  },
  "熊谷 敬宥": {
    title: "熊谷敬宥",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Takahiro_Kumagai_20250830.jpg/500px-Takahiro_Kumagai_20250830.jpg"
  },
  "蝦名 達夫": {
    title: "蝦名達夫",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/20260322_Tatsuo_Ebina%2C_outfielder_of_the_Yokohama_DeNA_BayStars%2C_at_Seibu_Dome_Stadium.jpg/500px-20260322_Tatsuo_Ebina%2C_outfielder_of_the_Yokohama_DeNA_BayStars%2C_at_Seibu_Dome_Stadium.jpg"
  },
  "オースティン": {
    title: "タイラー・オースティン",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/20201030_Tyler_Austin_infielder_of_the_Yokohama_DeNA_BayStars%2C_at_Yokohama_Stadium.jpg/500px-20201030_Tyler_Austin_infielder_of_the_Yokohama_DeNA_BayStars%2C_at_Yokohama_Stadium.jpg"
  },
  "桑原 将志": {
    title: "桑原将志",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/%E6%A1%91%E5%8E%9F%E5%B0%86%E5%BF%97%E9%81%B8%E6%89%8B.jpg/500px-%E6%A1%91%E5%8E%9F%E5%B0%86%E5%BF%97%E9%81%B8%E6%89%8B.jpg"
  },
  "佐野 恵太": {
    title: "佐野恵太",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/DB-Keita-Sano20210606.jpg/500px-DB-Keita-Sano20210606.jpg"
  },
  "筒香 嘉智": {
    title: "筒香嘉智",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/%E7%AD%92%E9%A6%99%E5%98%89%E6%99%BA_202405261732_DSCN6088.jpg/500px-%E7%AD%92%E9%A6%99%E5%98%89%E6%99%BA_202405261732_DSCN6088.jpg"
  },
  "牧 秀悟": {
    title: "牧秀悟",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/20210306_Shugo_Maki_infielder_of_the_Yokohama_DeNA_BayStars%2C_at_Yokohama_Stadium_%28VS_ORIX%29.jpg/500px-20210306_Shugo_Maki_infielder_of_the_Yokohama_DeNA_BayStars%2C_at_Yokohama_Stadium_%28VS_ORIX%29.jpg"
  },
  "宮﨑 敏郎": {
    title: "宮﨑敏郎",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/20230325_Tosiro_Miyazaki_infielder_of_the_Yokohama_DeNA_BayStars%2C_at_Seibu_Dome.jpg/500px-20230325_Tosiro_Miyazaki_infielder_of_the_Yokohama_DeNA_BayStars%2C_at_Seibu_Dome.jpg"
  },
  "山本 祐大": {
    title: "山本祐大",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/20260322_Yudai_Yamamoto%2C_catcher_of_the_Yokohama_DeNA_BayStars%2C_at_Seibu_Dome_Stadium.jpg/500px-20260322_Yudai_Yamamoto%2C_catcher_of_the_Yokohama_DeNA_BayStars%2C_at_Seibu_Dome_Stadium.jpg"
  },
  "度会 隆輝": {
    title: "度会隆輝",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/20240309_Ryuki_Watarai%2C_outfielder_of_the_Yokohama_DeNA_BayStars%2C_at_Yokohama_Stadium.jpg/500px-20240309_Ryuki_Watarai%2C_outfielder_of_the_Yokohama_DeNA_BayStars%2C_at_Yokohama_Stadium.jpg"
  },
  "今宮 健太": {
    title: "今宮健太",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Kenta_Imamiya_20220507.jpg/500px-Kenta_Imamiya_20220507.jpg"
  },
  "栗原 陵矢": {
    title: "栗原陵矢",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Hawks-kurihara.jpg/500px-Hawks-kurihara.jpg"
  },
  "近藤 健介": {
    title: "近藤健介",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Kensuke_Kondoh_Hawks_20230405.jpg/500px-Kensuke_Kondoh_Hawks_20230405.jpg"
  },
  "周東 佑京": {
    title: "周東佑京",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/%E3%81%BF%E3%81%9A%E3%81%BBPayPay%E3%83%89%E3%83%BC%E3%83%A0_2024.9.18.jpg/500px-%E3%81%BF%E3%81%9A%E3%81%BBPayPay%E3%83%89%E3%83%BC%E3%83%A0_2024.9.18.jpg"
  },
  "中村 晃": { title: "中村晃" },
  "野村 勇": {
    title: "野村勇",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Isami_Nomura_Fukuoka_SoftBank_Hawks_20220911.jpg/500px-Isami_Nomura_Fukuoka_SoftBank_Hawks_20220911.jpg"
  },
  "牧原 大成": {
    title: "牧原大成",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/HAWKS69-MAKIHARA.jpg/500px-HAWKS69-MAKIHARA.jpg"
  },
  "柳町 達": {
    title: "柳町達",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/%E6%9F%B3%E7%94%BA%E9%81%94_cropped_from_202309241742_DSCN4522.jpg/500px-%E6%9F%B3%E7%94%BA%E9%81%94_cropped_from_202309241742_DSCN4522.jpg"
  },
  "山川 穂高": {
    title: "山川穂高",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Hotaka_Yamakawa_Hawks_20240329.jpg/500px-Hotaka_Yamakawa_Hawks_20240329.jpg"
  },
  "石井 一成": {
    title: "石井一成",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Kazunari_Ishi_20231102.jpg/500px-Kazunari_Ishi_20231102.jpg"
  },
  "五十幡 亮汰": {
    title: "五十幡亮汰",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Ryota_Isobata_Fighters_20230408.jpg/500px-Ryota_Isobata_Fighters_20230408.jpg"
  },
  "清宮 幸太郎": {
    title: "清宮幸太郎",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Kotaro_Kiyomiya_Fighters_20220807.jpg/500px-Kotaro_Kiyomiya_Fighters_20220807.jpg"
  },
  "郡司 裕也": {
    title: "郡司裕也",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Yuya_Gunji_Fighters_20230819.jpg/500px-Yuya_Gunji_Fighters_20230819.jpg"
  },
  "田宮 裕涼": {
    title: "田宮裕涼",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Yua_Tamiya.jpg/500px-Yua_Tamiya.jpg"
  },
  "野村 佑希": {
    title: "野村佑希",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/%E9%87%8E%E6%9D%91%E4%BD%91%E5%B8%8C20190321.jpg/500px-%E9%87%8E%E6%9D%91%E4%BD%91%E5%B8%8C20190321.jpg"
  },
  "万波 中正": {
    title: "万波中正",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Chusei_Mannami_Fighters_20230408.jpg/500px-Chusei_Mannami_Fighters_20230408.jpg"
  },
  "水谷 瞬": {
    title: "水谷瞬",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Shun_Mizutani_2.jpg/500px-Shun_Mizutani_2.jpg"
  },
  "レイエス": {
    title: "フランミル・レイエス",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Franmil_Federico_Reyes_Fighters_20240504.jpg/500px-Franmil_Federico_Reyes_Fighters_20240504.jpg"
  },
  "村上 頌樹": {
    title: "村上頌樹",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/%E6%9D%91%E4%B8%8A.jpg/500px-%E6%9D%91%E4%B8%8A.jpg"
  },
  "才木 浩人": {
    title: "才木浩人",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Hiroto_Saiki_20250309.jpg/500px-Hiroto_Saiki_20250309.jpg"
  },
  "デュプランティエ": {
    title: "ジョン・デュプランティエ",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/20260416_Jon_Christopher_Duplantier%2Cpitcher_of_the_Yokohama_DeNA_BayStars_at_Meijijinguh_Stadium.jpg/500px-20260416_Jon_Christopher_Duplantier%2Cpitcher_of_the_Yokohama_DeNA_BayStars_at_Meijijinguh_Stadium.jpg"
  },
  "ケイ": {
    title: "アンソニー・ケイ",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/20240309_Anthony_Benjamin_Kay%2C_pitcher_of_the_Yokohama_DeNA_BayStars%2C_at_Yokohama_Stadium.jpg/500px-20240309_Anthony_Benjamin_Kay%2C_pitcher_of_the_Yokohama_DeNA_BayStars%2C_at_Yokohama_Stadium.jpg"
  },
  "ジャクソン": {
    title: "アンドレ・ジャクソン",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/20240309_Andre_Terrell_Jackson%2C_pitcher_of_the_Yokohama_DeNA_BayStars%2C_at_Yokohama_Stadium.jpg/500px-20240309_Andre_Terrell_Jackson%2C_pitcher_of_the_Yokohama_DeNA_BayStars%2C_at_Yokohama_Stadium.jpg"
  },
  "バウアー": {
    title: "トレバー・バウアー",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/%E6%A8%AA%E6%B5%9CDeNA%E3%83%99%E3%82%A4%E3%82%B9%E3%82%BF%E3%83%BC%E3%82%BA%E6%89%80%E5%B1%9E%E3%81%AE%E3%83%90%E3%82%A6%E3%82%A2%E3%83%BC20230422trevorbauer.jpg/500px-%E6%A8%AA%E6%B5%9CDeNA%E3%83%99%E3%82%A4%E3%82%B9%E3%82%BF%E3%83%BC%E3%82%BA%E6%89%80%E5%B1%9E%E3%81%AE%E3%83%90%E3%82%A6%E3%82%A2%E3%83%BC20230422trevorbauer.jpg"
  },
  "有原 航平": {
    title: "有原航平",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Arihara%28fighters%29_%28cropped%29.jpg/500px-Arihara%28fighters%29_%28cropped%29.jpg"
  },
  "上沢 直之": {
    title: "上沢直之",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/NF-Naoyuki-Uwasawa20210417.jpg/500px-NF-Naoyuki-Uwasawa20210417.jpg"
  },
  "大関 友久": {
    title: "大関友久",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Tomohisa_Ozeki_20220507.jpg/500px-Tomohisa_Ozeki_20220507.jpg"
  },
  "伊藤 大海": { title: "伊藤大海" },
  "北山 亘基": {
    title: "北山亘基",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Fighters_Koki_Kitayama_20220403.jpg/500px-Fighters_Koki_Kitayama_20220403.jpg"
  },
  "達 孝太": {
    title: "達孝太",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Kota_Tatsu.jpg/500px-Kota_Tatsu.jpg"
  },
  "石井 大智": {
    title: "石井大智",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Daichi-Ishii.jpg/500px-Daichi-Ishii.jpg"
  },
  "岩崎 優": {
    title: "岩崎優",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Suguru-Iwazaki-20210901-Koshien.jpg/500px-Suguru-Iwazaki-20210901-Koshien.jpg"
  },
  "桐敷 拓馬": {
    title: "桐敷拓馬",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Tigers_Kirishiki_Takuma_20220320.jpg/500px-Tigers_Kirishiki_Takuma_20220320.jpg"
  },
  "伊勢 大夢": {
    title: "伊勢大夢",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/20201025_Hiromu_Ise_pitcher_of_the_Yokohama_DeNA_BayStars%2C_at_Yokohama_Stadium.jpg/500px-20201025_Hiromu_Ise_pitcher_of_the_Yokohama_DeNA_BayStars%2C_at_Yokohama_Stadium.jpg"
  },
  "入江 大生": {
    title: "入江大生",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/20220522_Taisei_Irie%2C_pitcher_of_the_Yokohama_DeNA_BayStars%2C_at_Yokohama_Stadium.jpg/500px-20220522_Taisei_Irie%2C_pitcher_of_the_Yokohama_DeNA_BayStars%2C_at_Yokohama_Stadium.jpg"
  },
  "森原 康平": {
    title: "森原康平",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/20230504_Kohei_Morihara_pitcher_of_the_Yokohama_DeNA_BayStars%2C_at_Yokohama_Stadium.jpg/500px-20230504_Kohei_Morihara_pitcher_of_the_Yokohama_DeNA_BayStars%2C_at_Yokohama_Stadium.jpg"
  },
  "杉山 一樹": {
    title: "杉山一樹",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Kazuki_Sugiyama.jpg/500px-Kazuki_Sugiyama.jpg"
  },
  "藤井 皓哉": {
    title: "藤井皓哉",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Kouya_Fujii_Fukuoka_SoftBank_Hawks_20220911.jpg/500px-Kouya_Fujii_Fukuoka_SoftBank_Hawks_20220911.jpg"
  },
  "松本 裕樹": {
    title: "松本裕樹",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Hawks-Matsumoto.jpg/500px-Hawks-Matsumoto.jpg"
  },
  "田中 正義": {
    title: "田中正義",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Seigi_Tanaka_Fighters_20230408.jpg/500px-Seigi_Tanaka_Fighters_20230408.jpg"
  },
  "河野 竜生": {
    title: "河野竜生",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Fighters_Ryusei_Kawano_20220403.jpg/500px-Fighters_Ryusei_Kawano_20220403.jpg"
  },
  "齋藤 友貴哉": {
    title: "齋藤友貴哉",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Yukiya_Saito_with_Hokkaido_Nippon-Ham.jpg/500px-Yukiya_Saito_with_Hokkaido_Nippon-Ham.jpg"
  }
};

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

function wikiUrl(title: string): string {
  return `https://ja.wikipedia.org/wiki/${encodeURIComponent(title)}`;
}

function playerProfile(name: string): {
  profileUrl?: string;
  imageUrl?: string;
  imageCredit?: string;
} {
  const profile = PLAYER_PROFILES[name];
  if (!profile) return {};

  return {
    profileUrl: wikiUrl(profile.title),
    imageUrl: profile.imageUrl,
    imageCredit: profile.imageUrl ? WIKIMEDIA_CREDIT : undefined
  };
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
      statLine: `2025年: ${player.position} / 打率 ${player.avg.toFixed(3).replace(/^0/, "")} / ${player.homeRuns}本 / OPS ${(player.obp + player.slg).toFixed(3).replace(/^0/, "")}`,
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
      statLine: `2025年: ${player.pitchingRole} / ${player.wins}勝${player.losses}敗 / 防御率 ${player.eraValue.toFixed(2)} / ${player.innings}回`,
      note: "2025年公式戦の投球成績から制球 / 球威 / スタミナを変換"
    }
  ];
}

const RAW_HITTERS: RawHitter[] = [
  { team: "阪神タイガース", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_t.html", name: "近本 光司", position: "中堅手", positionDetail: "外野手", games: 140, pa: 638, ab: 573, runs: 76, hits: 160, doubles: 25, triples: 4, homeRuns: 3, rbi: 34, steals: 32, walks: 60, strikeouts: 88, avg: 0.279, slg: 0.353, obp: 0.348, fieldingSeed: 12 },
  { team: "阪神タイガース", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_t.html", name: "中野 拓夢", position: "二塁手", positionDetail: "内野手", games: 143, pa: 625, ab: 531, runs: 65, hits: 150, doubles: 18, triples: 3, homeRuns: 0, rbi: 30, steals: 19, walks: 44, strikeouts: 77, avg: 0.282, slg: 0.328, obp: 0.339, fieldingSeed: 13 },
  { team: "阪神タイガース", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_t.html", name: "森下 翔太", position: "右翼手", positionDetail: "外野手", games: 143, pa: 620, ab: 549, runs: 82, hits: 151, doubles: 24, triples: 5, homeRuns: 23, rbi: 89, steals: 5, walks: 54, strikeouts: 86, avg: 0.275, slg: 0.463, obp: 0.350, fieldingSeed: 8 },
  { team: "阪神タイガース", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_t.html", name: "佐藤 輝明", position: "三塁手", positionDetail: "内野手", games: 139, pa: 597, ab: 537, runs: 83, hits: 149, doubles: 34, triples: 4, homeRuns: 40, rbi: 102, steals: 10, walks: 57, strikeouts: 163, avg: 0.277, slg: 0.579, obp: 0.345, fieldingSeed: 5 },
  { team: "阪神タイガース", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_t.html", name: "大山 悠輔", position: "一塁手", positionDetail: "内野手", games: 141, pa: 587, ab: 503, runs: 52, hits: 133, doubles: 25, triples: 1, homeRuns: 13, rbi: 75, steals: 6, walks: 74, strikeouts: 96, avg: 0.264, slg: 0.396, obp: 0.363, fieldingSeed: 8 },
  { team: "阪神タイガース", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_t.html", name: "坂本 誠志郎", position: "捕手", games: 117, pa: 414, ab: 340, runs: 21, hits: 84, doubles: 19, triples: 1, homeRuns: 2, rbi: 27, steals: 2, walks: 53, strikeouts: 91, avg: 0.247, slg: 0.326, obp: 0.357, fieldingSeed: 14 },
  { team: "阪神タイガース", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_t.html", name: "小幡 竜平", position: "遊撃手", positionDetail: "内野手", games: 89, pa: 297, ab: 265, runs: 23, hits: 59, doubles: 8, triples: 0, homeRuns: 5, rbi: 17, steals: 6, walks: 18, strikeouts: 64, avg: 0.223, slg: 0.309, obp: 0.272, fieldingSeed: 12 },
  { team: "阪神タイガース", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_t.html", name: "前川 右京", position: "左翼手", positionDetail: "外野手", games: 69, pa: 209, ab: 195, runs: 11, hits: 48, doubles: 10, triples: 1, homeRuns: 1, rbi: 15, steals: 0, walks: 8, strikeouts: 30, avg: 0.246, slg: 0.323, obp: 0.297, fieldingSeed: 4 },
  { team: "阪神タイガース", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_t.html", name: "熊谷 敬宥", position: "内野手", positionDetail: "ユーティリティ", games: 85, pa: 170, ab: 156, runs: 22, hits: 35, doubles: 2, triples: 3, homeRuns: 1, rbi: 18, steals: 6, walks: 5, strikeouts: 33, avg: 0.224, slg: 0.295, obp: 0.253, fieldingSeed: 13 },

  { team: "横浜DeNAベイスターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_db.html", name: "蝦名 達夫", position: "外野手", games: 115, pa: 401, ab: 348, runs: 53, hits: 99, doubles: 21, triples: 1, homeRuns: 8, rbi: 41, steals: 5, walks: 31, strikeouts: 68, avg: 0.284, slg: 0.420, obp: 0.355, fieldingSeed: 8 },
  { team: "横浜DeNAベイスターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_db.html", name: "オースティン", position: "一塁手", positionDetail: "内野手 / 外野手", games: 65, pa: 246, ab: 219, runs: 35, hits: 59, doubles: 14, triples: 0, homeRuns: 11, rbi: 28, steals: 0, walks: 26, strikeouts: 45, avg: 0.269, slg: 0.484, obp: 0.350, fieldingSeed: 2 },
  { team: "横浜DeNAベイスターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_db.html", name: "桑原 将志", position: "中堅手", positionDetail: "外野手", games: 106, pa: 447, ab: 398, runs: 48, hits: 113, doubles: 17, triples: 2, homeRuns: 6, rbi: 27, steals: 10, walks: 30, strikeouts: 59, avg: 0.284, slg: 0.382, obp: 0.348, fieldingSeed: 12 },
  { team: "横浜DeNAベイスターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_db.html", name: "佐野 恵太", position: "左翼手", positionDetail: "外野手 / 一塁手", games: 138, pa: 569, ab: 525, runs: 47, hits: 144, doubles: 24, triples: 0, homeRuns: 15, rbi: 70, steals: 0, walks: 34, strikeouts: 61, avg: 0.274, slg: 0.406, obp: 0.322, fieldingSeed: 4 },
  { team: "横浜DeNAベイスターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_db.html", name: "筒香 嘉智", position: "外野手", positionDetail: "左翼手 / 一塁手", games: 75, pa: 257, ab: 224, runs: 29, hits: 51, doubles: 12, triples: 0, homeRuns: 20, rbi: 43, steals: 0, walks: 33, strikeouts: 59, avg: 0.228, slg: 0.549, obp: 0.327, fieldingSeed: 2 },
  { team: "横浜DeNAベイスターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_db.html", name: "牧 秀悟", position: "二塁手", positionDetail: "内野手", games: 93, pa: 391, ab: 364, runs: 48, hits: 101, doubles: 24, triples: 0, homeRuns: 16, rbi: 49, steals: 3, walks: 16, strikeouts: 76, avg: 0.277, slg: 0.475, obp: 0.325, fieldingSeed: 6 },
  { team: "横浜DeNAベイスターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_db.html", name: "宮﨑 敏郎", position: "三塁手", positionDetail: "内野手", games: 95, pa: 352, ab: 321, runs: 25, hits: 89, doubles: 16, triples: 1, homeRuns: 6, rbi: 39, steals: 0, walks: 28, strikeouts: 42, avg: 0.277, slg: 0.389, obp: 0.335, fieldingSeed: 3 },
  { team: "横浜DeNAベイスターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_db.html", name: "山本 祐大", position: "捕手", games: 104, pa: 344, ab: 313, runs: 22, hits: 82, doubles: 19, triples: 2, homeRuns: 3, rbi: 41, steals: 0, walks: 16, strikeouts: 40, avg: 0.262, slg: 0.364, obp: 0.300, fieldingSeed: 14 },
  { team: "横浜DeNAベイスターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_db.html", name: "度会 隆輝", position: "右翼手", positionDetail: "外野手", games: 86, pa: 301, ab: 270, runs: 24, hits: 65, doubles: 10, triples: 2, homeRuns: 6, rbi: 25, steals: 0, walks: 24, strikeouts: 36, avg: 0.241, slg: 0.359, obp: 0.303, fieldingSeed: 5 },

  { team: "福岡ソフトバンクホークス", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_h.html", name: "今宮 健太", position: "遊撃手", positionDetail: "内野手", games: 46, pa: 182, ab: 161, runs: 14, hits: 41, doubles: 8, triples: 1, homeRuns: 2, rbi: 12, steals: 0, walks: 12, strikeouts: 23, avg: 0.255, slg: 0.354, obp: 0.313, fieldingSeed: 16 },
  { team: "福岡ソフトバンクホークス", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_h.html", name: "栗原 陵矢", position: "三塁手", positionDetail: "内野手 / 外野手", games: 80, pa: 332, ab: 285, runs: 33, hits: 76, doubles: 12, triples: 2, homeRuns: 8, rbi: 40, steals: 1, walks: 40, strikeouts: 67, avg: 0.267, slg: 0.407, obp: 0.356, fieldingSeed: 8 },
  { team: "福岡ソフトバンクホークス", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_h.html", name: "近藤 健介", position: "左翼手", positionDetail: "外野手 / 指名打者", games: 75, pa: 307, ab: 256, runs: 28, hits: 77, doubles: 17, triples: 1, homeRuns: 10, rbi: 41, steals: 0, walks: 47, strikeouts: 43, avg: 0.301, slg: 0.492, obp: 0.410, fieldingSeed: 5 },
  { team: "福岡ソフトバンクホークス", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_h.html", name: "周東 佑京", position: "中堅手", positionDetail: "外野手 / 二塁手", games: 96, pa: 430, ab: 384, runs: 45, hits: 110, doubles: 13, triples: 2, homeRuns: 3, rbi: 36, steals: 35, walks: 37, strikeouts: 73, avg: 0.286, slg: 0.354, obp: 0.357, fieldingSeed: 14 },
  { team: "福岡ソフトバンクホークス", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_h.html", name: "中村 晃", position: "一塁手", positionDetail: "内野手 / 外野手", games: 116, pa: 431, ab: 371, runs: 34, hits: 89, doubles: 10, triples: 4, homeRuns: 3, rbi: 34, steals: 1, walks: 50, strikeouts: 48, avg: 0.240, slg: 0.313, obp: 0.330, fieldingSeed: 7 },
  { team: "福岡ソフトバンクホークス", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_h.html", name: "野村 勇", position: "内野手", positionDetail: "二塁手 / 三塁手 / 遊撃手", games: 126, pa: 413, ab: 376, runs: 50, hits: 102, doubles: 16, triples: 0, homeRuns: 12, rbi: 40, steals: 18, walks: 25, strikeouts: 122, avg: 0.271, slg: 0.410, obp: 0.324, fieldingSeed: 11 },
  { team: "福岡ソフトバンクホークス", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_h.html", name: "牧原 大成", position: "内野手", positionDetail: "二塁手 / 外野手", games: 125, pa: 443, ab: 418, runs: 44, hits: 127, doubles: 17, triples: 6, homeRuns: 5, rbi: 49, steals: 12, walks: 7, strikeouts: 63, avg: 0.304, slg: 0.409, obp: 0.317, fieldingSeed: 13 },
  { team: "福岡ソフトバンクホークス", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_h.html", name: "柳町 達", position: "外野手", games: 131, pa: 517, ab: 442, runs: 54, hits: 129, doubles: 17, triples: 1, homeRuns: 6, rbi: 50, steals: 2, walks: 62, strikeouts: 109, avg: 0.292, slg: 0.376, obp: 0.384, fieldingSeed: 5 },
  { team: "福岡ソフトバンクホークス", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_h.html", name: "山川 穂高", position: "一塁手", positionDetail: "内野手 / 指名打者", games: 130, pa: 496, ab: 443, runs: 45, hits: 100, doubles: 9, triples: 0, homeRuns: 23, rbi: 62, steals: 0, walks: 45, strikeouts: 126, avg: 0.226, slg: 0.402, obp: 0.300, fieldingSeed: 3 },

  { team: "北海道日本ハムファイターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_f.html", name: "石井 一成", position: "二塁手", positionDetail: "内野手", games: 108, pa: 364, ab: 332, runs: 41, hits: 86, doubles: 17, triples: 3, homeRuns: 6, rbi: 30, steals: 3, walks: 23, strikeouts: 86, avg: 0.259, slg: 0.383, obp: 0.306, fieldingSeed: 12 },
  { team: "北海道日本ハムファイターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_f.html", name: "五十幡 亮汰", position: "中堅手", positionDetail: "外野手", games: 118, pa: 307, ab: 284, runs: 45, hits: 66, doubles: 5, triples: 10, homeRuns: 1, rbi: 18, steals: 25, walks: 18, strikeouts: 73, avg: 0.232, slg: 0.331, obp: 0.283, fieldingSeed: 16 },
  { team: "北海道日本ハムファイターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_f.html", name: "清宮 幸太郎", position: "三塁手", positionDetail: "一塁手 / 三塁手", games: 138, pa: 577, ab: 525, runs: 63, hits: 143, doubles: 25, triples: 1, homeRuns: 12, rbi: 65, steals: 8, walks: 46, strikeouts: 85, avg: 0.272, slg: 0.392, obp: 0.329, fieldingSeed: 6 },
  { team: "北海道日本ハムファイターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_f.html", name: "郡司 裕也", position: "一塁手", positionDetail: "捕手 / 内野手", games: 111, pa: 422, ab: 364, runs: 46, hits: 108, doubles: 15, triples: 0, homeRuns: 10, rbi: 42, steals: 0, walks: 45, strikeouts: 71, avg: 0.297, slg: 0.420, obp: 0.379, fieldingSeed: 7 },
  { team: "北海道日本ハムファイターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_f.html", name: "田宮 裕涼", position: "捕手", games: 79, pa: 274, ab: 245, runs: 29, hits: 62, doubles: 6, triples: 1, homeRuns: 5, rbi: 21, steals: 2, walks: 18, strikeouts: 44, avg: 0.253, slg: 0.347, obp: 0.303, fieldingSeed: 14 },
  { team: "北海道日本ハムファイターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_f.html", name: "野村 佑希", position: "一塁手", positionDetail: "内野手 / 外野手", games: 101, pa: 369, ab: 339, runs: 28, hits: 91, doubles: 18, triples: 1, homeRuns: 8, rbi: 35, steals: 1, walks: 26, strikeouts: 70, avg: 0.268, slg: 0.398, obp: 0.325, fieldingSeed: 4 },
  { team: "北海道日本ハムファイターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_f.html", name: "万波 中正", position: "右翼手", positionDetail: "外野手", games: 127, pa: 465, ab: 420, runs: 48, hits: 96, doubles: 23, triples: 1, homeRuns: 20, rbi: 56, steals: 3, walks: 43, strikeouts: 125, avg: 0.229, slg: 0.431, obp: 0.302, fieldingSeed: 13 },
  { team: "北海道日本ハムファイターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_f.html", name: "水谷 瞬", position: "左翼手", positionDetail: "外野手", games: 87, pa: 321, ab: 296, runs: 45, hits: 82, doubles: 16, triples: 3, homeRuns: 12, rbi: 41, steals: 6, walks: 18, strikeouts: 77, avg: 0.277, slg: 0.473, obp: 0.322, fieldingSeed: 8 },
  { team: "北海道日本ハムファイターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idb1_f.html", name: "レイエス", position: "指名打者", positionDetail: "外野手 / 指名打者", games: 132, pa: 531, ab: 476, runs: 62, hits: 132, doubles: 17, triples: 0, homeRuns: 32, rbi: 90, steals: 0, walks: 52, strikeouts: 129, avg: 0.277, slg: 0.515, obp: 0.347, fieldingSeed: 2 }
];

const RAW_PITCHERS: RawPitcher[] = [
  { team: "阪神タイガース", sourceUrl: "https://npb.jp/bis/2025/stats/idp1_t.html", name: "村上 頌樹", pitchingRole: "先発", games: 26, wins: 14, losses: 4, battersFaced: 679, innings: 175.1, hitsAllowed: 131, homeRunsAllowed: 9, walks: 25, strikeouts: 144, runsAllowed: 41, earnedRuns: 41, eraValue: 2.10 },
  { team: "阪神タイガース", sourceUrl: "https://npb.jp/bis/2025/stats/idp1_t.html", name: "才木 浩人", pitchingRole: "先発", games: 24, wins: 12, losses: 6, battersFaced: 636, innings: 157, hitsAllowed: 123, homeRunsAllowed: 6, walks: 44, strikeouts: 122, runsAllowed: 29, earnedRuns: 27, eraValue: 1.55 },
  { team: "阪神タイガース", sourceUrl: "https://npb.jp/bis/2025/stats/idp1_t.html", name: "デュプランティエ", pitchingRole: "先発", games: 15, wins: 6, losses: 3, battersFaced: 349, innings: 90.2, hitsAllowed: 53, homeRunsAllowed: 1, walks: 20, strikeouts: 113, runsAllowed: 19, earnedRuns: 14, eraValue: 1.39 },
  { team: "阪神タイガース", sourceUrl: "https://npb.jp/bis/2025/stats/idp1_t.html", name: "石井 大智", pitchingRole: "中継ぎ", games: 53, wins: 1, losses: 0, battersFaced: 199, innings: 53, hitsAllowed: 37, homeRunsAllowed: 0, walks: 7, strikeouts: 42, runsAllowed: 1, earnedRuns: 1, eraValue: 0.17 },
  { team: "阪神タイガース", sourceUrl: "https://npb.jp/bis/2025/stats/idp1_t.html", name: "岩崎 優", pitchingRole: "抑え", games: 53, wins: 1, losses: 3, battersFaced: 211, innings: 51.1, hitsAllowed: 49, homeRunsAllowed: 1, walks: 13, strikeouts: 40, runsAllowed: 15, earnedRuns: 12, eraValue: 2.10 },
  { team: "阪神タイガース", sourceUrl: "https://npb.jp/bis/2025/stats/idp1_t.html", name: "桐敷 拓馬", pitchingRole: "中継ぎ", games: 43, wins: 2, losses: 1, battersFaced: 166, innings: 38, hitsAllowed: 45, homeRunsAllowed: 0, walks: 7, strikeouts: 35, runsAllowed: 13, earnedRuns: 12, eraValue: 2.84 },

  { team: "横浜DeNAベイスターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idp1_db.html", name: "ケイ", pitchingRole: "先発", games: 24, wins: 9, losses: 6, battersFaced: 604, innings: 155, hitsAllowed: 111, homeRunsAllowed: 8, walks: 41, strikeouts: 130, runsAllowed: 31, earnedRuns: 30, eraValue: 1.74 },
  { team: "横浜DeNAベイスターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idp1_db.html", name: "ジャクソン", pitchingRole: "先発", games: 25, wins: 10, losses: 7, battersFaced: 636, innings: 150.2, hitsAllowed: 134, homeRunsAllowed: 9, walks: 55, strikeouts: 109, runsAllowed: 46, earnedRuns: 39, eraValue: 2.33 },
  { team: "横浜DeNAベイスターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idp1_db.html", name: "バウアー", pitchingRole: "先発", games: 21, wins: 4, losses: 10, battersFaced: 570, innings: 133.2, hitsAllowed: 135, homeRunsAllowed: 15, walks: 48, strikeouts: 119, runsAllowed: 67, earnedRuns: 67, eraValue: 4.51 },
  { team: "横浜DeNAベイスターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idp1_db.html", name: "伊勢 大夢", pitchingRole: "中継ぎ", games: 55, wins: 0, losses: 5, battersFaced: 214, innings: 53, hitsAllowed: 46, homeRunsAllowed: 3, walks: 13, strikeouts: 58, runsAllowed: 17, earnedRuns: 17, eraValue: 2.89 },
  { team: "横浜DeNAベイスターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idp1_db.html", name: "入江 大生", pitchingRole: "抑え", games: 50, wins: 3, losses: 3, battersFaced: 190, innings: 45.2, hitsAllowed: 33, homeRunsAllowed: 6, walks: 19, strikeouts: 45, runsAllowed: 18, earnedRuns: 16, eraValue: 3.15 },
  { team: "横浜DeNAベイスターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idp1_db.html", name: "森原 康平", pitchingRole: "中継ぎ", games: 30, wins: 0, losses: 2, battersFaced: 109, innings: 28, hitsAllowed: 20, homeRunsAllowed: 1, walks: 3, strikeouts: 25, runsAllowed: 9, earnedRuns: 8, eraValue: 2.57 },

  { team: "福岡ソフトバンクホークス", sourceUrl: "https://npb.jp/bis/2025/stats/idp1_h.html", name: "有原 航平", pitchingRole: "先発", games: 26, wins: 14, losses: 9, battersFaced: 724, innings: 175, hitsAllowed: 167, homeRunsAllowed: 10, walks: 41, strikeouts: 121, runsAllowed: 67, earnedRuns: 59, eraValue: 3.03 },
  { team: "福岡ソフトバンクホークス", sourceUrl: "https://npb.jp/bis/2025/stats/idp1_h.html", name: "上沢 直之", pitchingRole: "先発", games: 23, wins: 12, losses: 6, battersFaced: 577, innings: 144.2, hitsAllowed: 113, homeRunsAllowed: 12, walks: 36, strikeouts: 115, runsAllowed: 52, earnedRuns: 44, eraValue: 2.74 },
  { team: "福岡ソフトバンクホークス", sourceUrl: "https://npb.jp/bis/2025/stats/idp1_h.html", name: "大関 友久", pitchingRole: "先発", games: 24, wins: 13, losses: 5, battersFaced: 586, innings: 146.2, hitsAllowed: 107, homeRunsAllowed: 11, walks: 35, strikeouts: 97, runsAllowed: 36, earnedRuns: 27, eraValue: 1.66 },
  { team: "福岡ソフトバンクホークス", sourceUrl: "https://npb.jp/bis/2025/stats/idp1_h.html", name: "杉山 一樹", pitchingRole: "抑え", games: 65, wins: 3, losses: 4, battersFaced: 270, innings: 64.1, hitsAllowed: 48, homeRunsAllowed: 3, walks: 23, strikeouts: 85, runsAllowed: 17, earnedRuns: 13, eraValue: 1.82 },
  { team: "福岡ソフトバンクホークス", sourceUrl: "https://npb.jp/bis/2025/stats/idp1_h.html", name: "藤井 皓哉", pitchingRole: "中継ぎ", games: 51, wins: 2, losses: 3, battersFaced: 195, innings: 50, hitsAllowed: 32, homeRunsAllowed: 2, walks: 14, strikeouts: 75, runsAllowed: 9, earnedRuns: 8, eraValue: 1.44 },
  { team: "福岡ソフトバンクホークス", sourceUrl: "https://npb.jp/bis/2025/stats/idp1_h.html", name: "松本 裕樹", pitchingRole: "中継ぎ", games: 51, wins: 5, losses: 2, battersFaced: 188, innings: 50.2, hitsAllowed: 28, homeRunsAllowed: 3, walks: 13, strikeouts: 56, runsAllowed: 6, earnedRuns: 6, eraValue: 1.07 },

  { team: "北海道日本ハムファイターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idp1_f.html", name: "伊藤 大海", pitchingRole: "先発", games: 27, wins: 14, losses: 8, battersFaced: 797, innings: 196.2, hitsAllowed: 179, homeRunsAllowed: 15, walks: 29, strikeouts: 195, runsAllowed: 60, earnedRuns: 55, eraValue: 2.52 },
  { team: "北海道日本ハムファイターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idp1_f.html", name: "北山 亘基", pitchingRole: "先発", games: 22, wins: 9, losses: 5, battersFaced: 599, innings: 149, hitsAllowed: 112, homeRunsAllowed: 7, walks: 45, strikeouts: 143, runsAllowed: 37, earnedRuns: 27, eraValue: 1.63 },
  { team: "北海道日本ハムファイターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idp1_f.html", name: "達 孝太", pitchingRole: "先発", games: 16, wins: 8, losses: 2, battersFaced: 418, innings: 107.2, hitsAllowed: 80, homeRunsAllowed: 7, walks: 20, strikeouts: 94, runsAllowed: 27, earnedRuns: 25, eraValue: 2.09 },
  { team: "北海道日本ハムファイターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idp1_f.html", name: "田中 正義", pitchingRole: "抑え", games: 49, wins: 1, losses: 1, battersFaced: 196, innings: 47.2, hitsAllowed: 37, homeRunsAllowed: 2, walks: 13, strikeouts: 48, runsAllowed: 7, earnedRuns: 7, eraValue: 1.32 },
  { team: "北海道日本ハムファイターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idp1_f.html", name: "河野 竜生", pitchingRole: "中継ぎ", games: 32, wins: 2, losses: 0, battersFaced: 107, innings: 26.2, hitsAllowed: 19, homeRunsAllowed: 4, walks: 6, strikeouts: 21, runsAllowed: 14, earnedRuns: 12, eraValue: 4.05 },
  { team: "北海道日本ハムファイターズ", sourceUrl: "https://npb.jp/bis/2025/stats/idp1_f.html", name: "齋藤 友貴哉", pitchingRole: "中継ぎ", games: 47, wins: 1, losses: 2, battersFaced: 180, innings: 46.2, hitsAllowed: 31, homeRunsAllowed: 1, walks: 14, strikeouts: 37, runsAllowed: 7, earnedRuns: 7, eraValue: 1.35 }
];

export function getBaseballPlayerPool(): {
  hitters: BaseballHitter[];
  pitchers: BaseballPitcher[];
} {
  const hitters = RAW_HITTERS.map((player, index): BaseballHitter => {
    const id = `bb-h-2025-${teamSlug(player.team)}-${index + 1}`;
    const profile = playerProfile(player.name);
    return {
      id,
      name: player.name,
      sport: "baseball",
      role: "hitter",
      position: player.position,
      positionDetail: player.positionDetail,
      era: "2020s",
      sourceTeam: player.team,
      imageId: avatarId(id),
      ...profile,
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
    const profile = playerProfile(player.name);
    return {
      id,
      name: player.name,
      sport: "baseball",
      role: "pitcher",
      position: "投手",
      pitchingRole: player.pitchingRole,
      era: "2020s",
      sourceTeam: player.team,
      imageId: avatarId(id),
      ...profile,
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
