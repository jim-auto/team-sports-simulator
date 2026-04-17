import type { SportEngine, SimulateOptions } from "@/lib/engine/SportEngine";
import { createSeededRandom, deriveSeed } from "@/lib/engine/random";
import type { MatchResult, PlayerMatchStats, SeriesResult } from "@/lib/models/result";
import type { SoccerTeam } from "@/lib/models/team";

function average(values: number[]): number {
  if (values.length === 0) return 50;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function poisson(lambda: number, rng: ReturnType<typeof createSeededRandom>): number {
  const threshold = Math.exp(-lambda);
  let product = 1;
  let count = 0;
  do {
    count += 1;
    product *= rng.next();
  } while (product > threshold);
  return count - 1;
}

function teamStrength(team: SoccerTeam) {
  return {
    offense: average(team.players.map((player) => player.offense)),
    defense: average(team.players.map((player) => player.defense)),
    stamina: average(team.players.map((player) => player.stamina))
  };
}

function playerStats(
  team: SoccerTeam,
  teamSide: "A" | "B",
  goalsFor: number,
  goalsAgainst: number
): PlayerMatchStats[] {
  return team.players.map((player) => {
    const roleBias = player.role === "forward" ? 1.2 : player.role === "goalkeeper" ? 0.9 : 1;
    const mvpScore =
      (player.offense * 0.04 + player.defense * 0.035 + player.stamina * 0.02) * roleBias +
      goalsFor * 1.5 -
      goalsAgainst;
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
      runsAllowed: goalsAgainst,
      mvpScore: Number(mvpScore.toFixed(2))
    };
  });
}

export const soccerEngine: SportEngine<SoccerTeam> = {
  sport: "soccer",

  simulateMatch(teamA, teamB, options: SimulateOptions = {}): MatchResult {
    const rng = createSeededRandom(options.seed);
    const a = teamStrength(teamA);
    const b = teamStrength(teamB);
    const expectedA = Math.max(0.2, 1.25 + (a.offense - b.defense) / 45 + (a.stamina - b.stamina) / 120);
    const expectedB = Math.max(0.2, 1.25 + (b.offense - a.defense) / 45 + (b.stamina - a.stamina) / 120);
    const scoreA = poisson(expectedA, rng);
    const scoreB = poisson(expectedB, rng);
    const winner = scoreA > scoreB ? "A" : scoreB > scoreA ? "B" : "draw";
    const stats = [
      ...playerStats(teamA, "A", scoreA, scoreB),
      ...playerStats(teamB, "B", scoreB, scoreA)
    ];
    const eligible =
      winner === "draw"
        ? stats
        : stats.filter((record) => record.teamSide === winner);
    const best = [...eligible].sort((left, right) => right.mvpScore - left.mvpScore)[0];

    return {
      sport: "soccer",
      teamA: teamA.name,
      teamB: teamB.name,
      scoreA,
      scoreB,
      winner,
      playerStats: stats,
      mvp: best
        ? {
            playerId: best.playerId,
            playerName: best.playerName,
            teamId: best.teamId,
            teamName: best.teamName,
            teamSide: best.teamSide,
            score: best.mvpScore,
            summary: `${scoreA}-${scoreB}`
          }
        : undefined
    };
  },

  simulateSeries(teamA, teamB, n, options: SimulateOptions = {}): SeriesResult {
    const games = Math.max(1, Math.floor(n));
    let winsA = 0;
    let winsB = 0;
    let draws = 0;
    let totalScoreA = 0;
    let totalScoreB = 0;
    const mvps = [];

    for (let index = 0; index < games; index += 1) {
      const match = this.simulateMatch(teamA, teamB, {
        seed: deriveSeed(options.seed, `soccer-${index + 1}`)
      });
      totalScoreA += match.scoreA;
      totalScoreB += match.scoreB;
      if (match.winner === "A") winsA += 1;
      if (match.winner === "B") winsB += 1;
      if (match.winner === "draw") draws += 1;
      if (match.mvp) mvps.push(match.mvp);
    }

    return {
      sport: "soccer",
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
      overallMvp: mvps[0]
    };
  }
};
