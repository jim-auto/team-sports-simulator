import { createSeededRandom, type SeedInput } from "@/lib/engine/random";
import type { PlayerEra } from "@/lib/models/player";
import type { BaseballTeam } from "@/lib/models/team";
import {
  BASEBALL_ERAS,
  BASEBALL_SOURCE_TEAMS,
  getBaseballPlayerPool
} from "./playerPool";

export type BaseballRandomFilter = "all" | PlayerEra | (typeof BASEBALL_SOURCE_TEAMS)[number];

export interface BaseballRandomTeamOptions {
  seed?: SeedInput;
  era?: PlayerEra | "all";
  sourceTeam?: string | "all";
  name?: string;
}

function normalizeEra(era?: PlayerEra | "all"): PlayerEra | "all" {
  return era && BASEBALL_ERAS.includes(era as PlayerEra) ? (era as PlayerEra) : "all";
}

function normalizeSourceTeam(
  sourceTeam?: string | "all"
): (typeof BASEBALL_SOURCE_TEAMS)[number] | "all" {
  return sourceTeam && BASEBALL_SOURCE_TEAMS.includes(sourceTeam as (typeof BASEBALL_SOURCE_TEAMS)[number])
    ? (sourceTeam as (typeof BASEBALL_SOURCE_TEAMS)[number])
    : "all";
}

function makeTeamName(
  era: PlayerEra | "all",
  sourceTeam: (typeof BASEBALL_SOURCE_TEAMS)[number] | "all",
  suffix: number
): string {
  if (sourceTeam !== "all") return sourceTeam;

  const eraLabel = era === "all" ? "全年代" : era;
  return `${eraLabel} NPB選抜 ${suffix}`;
}

export function createRandomBaseballTeam(options: BaseballRandomTeamOptions = {}): BaseballTeam {
  const era = normalizeEra(options.era);
  const sourceTeam = normalizeSourceTeam(options.sourceTeam);
  const rng = createSeededRandom(`${options.seed ?? "team"}:${era}:${sourceTeam}`);
  const pool = getBaseballPlayerPool();

  const hitters = pool.hitters.filter((player) => {
    return (
      (era === "all" || player.era === era) &&
      (sourceTeam === "all" || player.sourceTeam === sourceTeam)
    );
  });
  const pitchers = pool.pitchers.filter((player) => {
    return (
      (era === "all" || player.era === era) &&
      (sourceTeam === "all" || player.sourceTeam === sourceTeam)
    );
  });

  if (hitters.length < 9 || pitchers.length < 1) {
    throw new Error("Not enough players for the selected baseball random filters.");
  }

  const suffix = rng.int(100, 999);
  const starterPool = pitchers.filter((player) => player.pitchingRole === "先発");
  const starter = rng.pick(starterPool.length > 0 ? starterPool : pitchers);
  const reservePitchers = rng
    .shuffle(pitchers.filter((player) => player.id !== starter.id))
    .slice(0, 5)
    .map((player) => ({ ...player }));

  return {
    id: `bb-team-${suffix}-${rng.int(1000, 9999)}`,
    name: options.name?.trim() || makeTeamName(era, sourceTeam, suffix),
    sport: "baseball",
    hitters: rng.shuffle(hitters).slice(0, 9).map((player) => ({ ...player })),
    pitcher: { ...starter },
    pitchingStaff: [{ ...starter }, ...reservePitchers]
  };
}
