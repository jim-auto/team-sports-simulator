import type { SportEngine, SimulateOptions } from "@/lib/engine/SportEngine";
import { createSeededRandom, deriveSeed } from "@/lib/engine/random";
import type { BaseballHitter, BaseballPitcher } from "@/lib/models/player";
import type {
  BaseballInningScore,
  BaseballKeyMoment,
  BaseballLogEntry,
  MatchResult,
  MVPResult,
  PlateAppearanceOutcome,
  PlayerMatchStats,
  SeriesResult
} from "@/lib/models/result";
import type { BaseballTeam } from "@/lib/models/team";

interface MutableGameState {
  scoreA: number;
  scoreB: number;
  batterIndexA: number;
  batterIndexB: number;
  pitcherBattersFacedA: number;
  pitcherBattersFacedB: number;
  stats: Map<string, PlayerMatchStats>;
  log: BaseballLogEntry[];
  lineScore: BaseballInningScore[];
  keyMoments: BaseballKeyMoment[];
}

interface PlateAppearanceResolution {
  outcome: PlateAppearanceOutcome;
  hitProbability: number;
  defenseRating: number;
  pitcherFatigue: number;
  effectiveControl: number;
  effectiveStuff: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function sigmoid(value: number): number {
  return 1 / (1 + Math.exp(-value));
}

function average(values: number[]): number {
  if (values.length === 0) return 50;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function averageFielding(team: BaseballTeam): number {
  return average(team.hitters.map((hitter) => hitter.fielding));
}

function pitcherFatiguePenalty(pitcher: BaseballPitcher, battersFaced: number): number {
  const comfortableWorkload = 16 + pitcher.stamina * 0.18;
  return clamp((battersFaced - comfortableWorkload) * 0.6, 0, 14);
}

function leader(scoreA: number, scoreB: number): "A" | "B" | "tie" {
  if (scoreA > scoreB) return "A";
  if (scoreB > scoreA) return "B";
  return "tie";
}

function halfLabel(half: "top" | "bottom"): string {
  return half === "top" ? "表" : "裏";
}

function outcomeText(outcome: PlateAppearanceOutcome): string {
  if (outcome === "home_run") return "本塁打";
  if (outcome === "double") return "二塁打";
  if (outcome === "single") return "安打";
  return "凡退";
}

function statKey(teamSide: "A" | "B", playerId: string): string {
  return `${teamSide}:${playerId}`;
}

function emptyStats(
  team: BaseballTeam,
  player: BaseballHitter | BaseballPitcher,
  teamSide: "A" | "B"
): PlayerMatchStats {
  return {
    playerId: player.id,
    playerName: player.name,
    teamId: team.id,
    teamName: team.name,
    teamSide,
    role: player.role,
    runs: 0,
    hits: 0,
    doubles: 0,
    homeRuns: 0,
    rbi: 0,
    outs: 0,
    pitchingOuts: 0,
    battersFaced: 0,
    runsAllowed: 0,
    mvpScore: 0
  };
}

function initializeStats(teamA: BaseballTeam, teamB: BaseballTeam): Map<string, PlayerMatchStats> {
  const stats = new Map<string, PlayerMatchStats>();
  [
    { team: teamA, side: "A" as const },
    { team: teamB, side: "B" as const }
  ].forEach(({ team, side }) => {
    team.hitters.forEach((hitter) => {
      stats.set(statKey(side, hitter.id), emptyStats(team, hitter, side));
    });
    stats.set(statKey(side, team.pitcher.id), emptyStats(team, team.pitcher, side));
  });
  return stats;
}

function getStats(
  stats: Map<string, PlayerMatchStats>,
  teamSide: "A" | "B",
  player: BaseballHitter | BaseballPitcher
): PlayerMatchStats {
  const record = stats.get(statKey(teamSide, player.id));
  if (!record) {
    throw new Error(`Missing stats record for ${player.name}.`);
  }
  return record;
}

function resolvePlateAppearance(
  hitter: BaseballHitter,
  pitcher: BaseballPitcher,
  defenseRating: number,
  battersFaced: number,
  rng: ReturnType<typeof createSeededRandom>
): PlateAppearanceResolution {
  const pitcherFatigue = pitcherFatiguePenalty(pitcher, battersFaced);
  const effectiveControl = clamp(pitcher.control - pitcherFatigue, 20, 100);
  const effectiveStuff = clamp(pitcher.stuff - pitcherFatigue * 0.8, 20, 100);
  const contactEdge = sigmoid((hitter.contact - effectiveControl) / 14);
  const powerEdge = sigmoid((hitter.power - effectiveStuff) / 14);
  const defenseAdjustment = clamp((defenseRating - 60) / 260, -0.08, 0.08);
  const hitProbability = clamp(0.18 + contactEdge * 0.32 - defenseAdjustment, 0.13, 0.52);

  if (rng.next() > hitProbability) {
    return {
      outcome: "out",
      hitProbability,
      defenseRating,
      pitcherFatigue,
      effectiveControl,
      effectiveStuff
    };
  }

  const homeRunShare = clamp(0.04 + powerEdge * 0.2, 0.03, 0.24);
  const doubleShare = clamp(0.11 + powerEdge * 0.16, 0.1, 0.28);
  const roll = rng.next();

  if (roll < homeRunShare) {
    return {
      outcome: "home_run",
      hitProbability,
      defenseRating,
      pitcherFatigue,
      effectiveControl,
      effectiveStuff
    };
  }
  if (roll < homeRunShare + doubleShare) {
    return {
      outcome: "double",
      hitProbability,
      defenseRating,
      pitcherFatigue,
      effectiveControl,
      effectiveStuff
    };
  }
  return {
    outcome: "single",
    hitProbability,
    defenseRating,
    pitcherFatigue,
    effectiveControl,
    effectiveStuff
  };
}

function scoreRunner(
  state: MutableGameState,
  battingSide: "A" | "B",
  runnerKey: string,
  runs: { count: number }
) {
  const runner = state.stats.get(runnerKey);
  if (runner) {
    runner.runs += 1;
  }
  if (battingSide === "A") {
    state.scoreA += 1;
  } else {
    state.scoreB += 1;
  }
  runs.count += 1;
}

function advanceBases(
  outcome: PlateAppearanceOutcome,
  bases: Array<string | null>,
  batterKey: string,
  state: MutableGameState,
  battingSide: "A" | "B"
): number {
  const runs = { count: 0 };

  if (outcome === "single") {
    if (bases[2]) scoreRunner(state, battingSide, bases[2], runs);
    bases[2] = bases[1];
    bases[1] = bases[0];
    bases[0] = batterKey;
  }

  if (outcome === "double") {
    if (bases[2]) scoreRunner(state, battingSide, bases[2], runs);
    if (bases[1]) scoreRunner(state, battingSide, bases[1], runs);
    bases[2] = bases[0];
    bases[1] = batterKey;
    bases[0] = null;
  }

  if (outcome === "home_run") {
    bases.forEach((runnerKey) => {
      if (runnerKey) scoreRunner(state, battingSide, runnerKey, runs);
    });
    scoreRunner(state, battingSide, batterKey, runs);
    bases[0] = null;
    bases[1] = null;
    bases[2] = null;
  }

  return runs.count;
}

function simulateHalfInning(
  inning: number,
  half: "top" | "bottom",
  battingTeam: BaseballTeam,
  pitchingTeam: BaseballTeam,
  state: MutableGameState,
  rng: ReturnType<typeof createSeededRandom>,
  includeLog: boolean
) {
  let outs = 0;
  const bases: Array<string | null> = [null, null, null];
  const battingSide = half === "top" ? "A" : "B";
  const pitchingSide = half === "top" ? "B" : "A";
  let batterIndex = battingSide === "A" ? state.batterIndexA : state.batterIndexB;
  const pitcherStats = getStats(state.stats, pitchingSide, pitchingTeam.pitcher);
  const defenseRating = averageFielding(pitchingTeam);
  let halfRuns = 0;

  while (outs < 3) {
    const batter = battingTeam.hitters[batterIndex % battingTeam.hitters.length];
    const batterStats = getStats(state.stats, battingSide, batter);
    const batterKey = statKey(battingSide, batter.id);
    const battersFaced =
      pitchingSide === "A" ? state.pitcherBattersFacedA : state.pitcherBattersFacedB;
    const beforeScoreA = state.scoreA;
    const beforeScoreB = state.scoreB;
    const beforeLeader = leader(state.scoreA, state.scoreB);
    const resolution = resolvePlateAppearance(
      batter,
      pitchingTeam.pitcher,
      defenseRating,
      battersFaced,
      rng
    );
    const outcome = resolution.outcome;
    batterIndex += 1;
    pitcherStats.battersFaced += 1;
    if (pitchingSide === "A") {
      state.pitcherBattersFacedA += 1;
    } else {
      state.pitcherBattersFacedB += 1;
    }

    let runsScored = 0;
    if (outcome === "out") {
      outs += 1;
      batterStats.outs += 1;
      pitcherStats.pitchingOuts += 1;
    } else {
      batterStats.hits += 1;
      if (outcome === "double") {
        batterStats.doubles += 1;
      }
      if (outcome === "home_run") {
        batterStats.homeRuns += 1;
      }
      runsScored = advanceBases(outcome, bases, batterKey, state, battingSide);
      halfRuns += runsScored;
      batterStats.rbi += runsScored;
      pitcherStats.runsAllowed += runsScored;
    }

    if (includeLog) {
      const afterLeader = leader(state.scoreA, state.scoreB);
      const scoringText =
        runsScored > 0
          ? `${battingTeam.name}の${batter.name}が${outcomeText(outcome)}で${runsScored}点`
          : `${battingTeam.name}の${batter.name}は${outcomeText(outcome)}`;
      const swingText =
        runsScored > 0 && beforeLeader !== afterLeader
          ? afterLeader === "tie"
            ? `${scoringText}。試合は同点。`
            : `${scoringText}。${battingTeam.name}が流れを変えた。`
          : scoringText;

      state.log.push({
        inning,
        half,
        battingTeam: battingTeam.name,
        pitchingTeam: pitchingTeam.name,
        batter: batter.name,
        pitcher: pitchingTeam.pitcher.name,
        outcome,
        runsScored,
        scoreA: state.scoreA,
        scoreB: state.scoreB,
        hitProbability: Number(resolution.hitProbability.toFixed(3)),
        defenseRating: Number(resolution.defenseRating.toFixed(1)),
        pitcherFatigue: Number(resolution.pitcherFatigue.toFixed(1)),
        description: swingText
      });

      if (runsScored > 0) {
        state.keyMoments.push({
          inning,
          half,
          text: `${inning}回${halfLabel(half)} ${swingText} (${beforeScoreA}-${beforeScoreB} -> ${state.scoreA}-${state.scoreB})`,
          scoreA: state.scoreA,
          scoreB: state.scoreB
        });
      }
    }

    if (inning === 9 && half === "bottom" && state.scoreB > state.scoreA) {
      break;
    }
  }

  const line = state.lineScore[inning - 1];
  if (half === "top") {
    line.top = halfRuns;
  } else {
    line.bottom = halfRuns;
  }

  if (battingSide === "A") {
    state.batterIndexA = batterIndex;
  } else {
    state.batterIndexB = batterIndex;
  }
}

function summarizeStats(stats: PlayerMatchStats): string {
  if (stats.role === "pitcher") {
    const innings = (stats.pitchingOuts / 3).toFixed(1).replace(".0", "");
    return `${innings} IP, ${stats.runsAllowed} RA`;
  }
  return `${stats.hits} H, ${stats.homeRuns} HR, ${stats.rbi} RBI`;
}

function finalizeStats(
  stats: PlayerMatchStats[],
  winner: "A" | "B" | "draw"
): PlayerMatchStats[] {
  return stats.map((record) => {
    const isWinner = winner !== "draw" && record.teamSide === winner;
    const hitterScore =
      record.hits * 2 +
      record.doubles * 1.5 +
      record.homeRuns * 4 +
      record.rbi * 1.4 +
      record.runs * 1.1 -
      record.outs * 0.1;
    const pitcherScore = record.pitchingOuts * 0.25 - record.runsAllowed * 1.8;

    return {
      ...record,
      mvpScore: Number(
        ((record.role === "pitcher" ? pitcherScore : hitterScore) + (isWinner ? 1 : 0)).toFixed(2)
      )
    };
  });
}

function pickMvp(stats: PlayerMatchStats[], winner: "A" | "B" | "draw"): MVPResult | undefined {
  const eligible =
    winner === "draw"
      ? stats
      : stats.filter((record) => record.teamSide === winner);
  const best = [...eligible].sort((a, b) => b.mvpScore - a.mvpScore)[0];
  if (!best) return undefined;
  return {
    playerId: best.playerId,
    playerName: best.playerName,
    teamId: best.teamId,
    teamName: best.teamName,
    teamSide: best.teamSide,
    score: best.mvpScore,
    summary: summarizeStats(best)
  };
}

export const baseballEngine: SportEngine<BaseballTeam> = {
  sport: "baseball",

  simulateMatch(teamA, teamB, options: SimulateOptions = {}): MatchResult {
    if (teamA.hitters.length !== 9 || teamB.hitters.length !== 9) {
      throw new Error("Baseball teams must have exactly 9 hitters.");
    }

    const rng = createSeededRandom(options.seed);
    const state: MutableGameState = {
      scoreA: 0,
      scoreB: 0,
      batterIndexA: 0,
      batterIndexB: 0,
      pitcherBattersFacedA: 0,
      pitcherBattersFacedB: 0,
      stats: initializeStats(teamA, teamB),
      log: [],
      lineScore: Array.from({ length: 9 }, (_, index) => ({
        inning: index + 1,
        top: 0,
        bottom: null
      })),
      keyMoments: []
    };

    for (let inning = 1; inning <= 9; inning += 1) {
      simulateHalfInning(inning, "top", teamA, teamB, state, rng, Boolean(options.includeLog));
      if (inning === 9 && state.scoreB > state.scoreA) {
        break;
      }
      simulateHalfInning(inning, "bottom", teamB, teamA, state, rng, Boolean(options.includeLog));
    }

    const winner = state.scoreA > state.scoreB ? "A" : state.scoreB > state.scoreA ? "B" : "draw";
    const playerStats = finalizeStats(Array.from(state.stats.values()), winner);
    const mvp = pickMvp(playerStats, winner);

    return {
      sport: "baseball",
      teamA: teamA.name,
      teamB: teamB.name,
      scoreA: state.scoreA,
      scoreB: state.scoreB,
      winner,
      playerStats,
      mvp,
      log: options.includeLog ? state.log : undefined,
      lineScore: state.lineScore,
      keyMoments: options.includeLog ? state.keyMoments : undefined
    };
  },

  simulateSeries(teamA, teamB, n, options: SimulateOptions = {}): SeriesResult {
    const games = Math.max(1, Math.floor(n));
    let winsA = 0;
    let winsB = 0;
    let draws = 0;
    let totalScoreA = 0;
    let totalScoreB = 0;
    const mvpAwards = new Map<string, MVPResult & { awards: number; totalScore: number }>();
    const mvps: MVPResult[] = [];
    let sampleMatch: MatchResult | undefined;

    for (let index = 0; index < games; index += 1) {
      const match = this.simulateMatch(teamA, teamB, {
        seed: deriveSeed(options.seed, `game-${index + 1}`),
        includeLog: index === 0
      });

      if (index === 0) {
        sampleMatch = match;
      }

      totalScoreA += match.scoreA;
      totalScoreB += match.scoreB;
      if (match.winner === "A") winsA += 1;
      if (match.winner === "B") winsB += 1;
      if (match.winner === "draw") draws += 1;

      if (match.mvp) {
        mvps.push(match.mvp);
        const key = `${match.mvp.teamSide}:${match.mvp.teamId}:${match.mvp.playerId}`;
        const current = mvpAwards.get(key);
        if (current) {
          current.awards += 1;
          current.totalScore += match.mvp.score;
        } else {
          mvpAwards.set(key, { ...match.mvp, awards: 1, totalScore: match.mvp.score });
        }
      }
    }

    const overall = Array.from(mvpAwards.values()).sort((a, b) => {
      if (b.awards !== a.awards) return b.awards - a.awards;
      return b.totalScore - a.totalScore;
    })[0];

    return {
      sport: "baseball",
      games,
      teamA: teamA.name,
      teamB: teamB.name,
      winsA,
      winsB,
      draws,
      winningPercentageA: winsA / games,
      winningPercentageB: winsB / games,
      averageScoreA: Number((totalScoreA / games).toFixed(2)),
      averageScoreB: Number((totalScoreB / games).toFixed(2)),
      mvps,
      sampleMatch,
      overallMvp: overall
        ? {
            playerId: overall.playerId,
            playerName: overall.playerName,
            teamId: overall.teamId,
            teamName: overall.teamName,
            teamSide: overall.teamSide,
            score: Number(overall.totalScore.toFixed(2)),
            summary: `${overall.awards} MVP awards`
          }
        : undefined
    };
  }
};
