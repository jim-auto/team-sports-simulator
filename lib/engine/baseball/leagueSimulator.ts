import { baseballEngine } from "@/lib/engine/baseball/baseballEngine";
import {
  BASEBALL_CENTRAL_TEAMS,
  BASEBALL_PACIFIC_TEAMS,
  BASEBALL_SOURCE_TEAMS
} from "@/lib/engine/baseball/playerPool";
import { createRandomBaseballTeam } from "@/lib/engine/baseball/randomTeam";
import type {
  LeagueSeasonGroup,
  LeagueSeasonResult,
  LeagueStanding,
  MatchResult,
  MVPResult,
  PostseasonRoundResult,
  SeriesResult
} from "@/lib/models/result";
import type { BaseballTeam } from "@/lib/models/team";

interface MutableStanding {
  leagueName: string;
  team: BaseballTeam;
  wins: number;
  losses: number;
  draws: number;
  runsFor: number;
  runsAgainst: number;
}

interface SeriesOptions {
  seed: string;
  seedLabel: string;
  targetWins: number;
  maxGames: number;
  initialWinsA?: number;
  initialWinsB?: number;
  includeLog?: boolean;
}

const NPB_LEAGUES = [
  {
    name: "セントラル・リーグ",
    teams: BASEBALL_CENTRAL_TEAMS
  },
  {
    name: "パシフィック・リーグ",
    teams: BASEBALL_PACIFIC_TEAMS
  }
] as const;

function createLeagueTeams(seed: string): BaseballTeam[] {
  return BASEBALL_SOURCE_TEAMS.map((sourceTeam) =>
    createRandomBaseballTeam({
      seed: `${seed}:league:${sourceTeam}`,
      era: "2020s",
      sourceTeam,
      name: sourceTeam
    })
  );
}

function toStanding(record: MutableStanding): LeagueStanding {
  const decidedGames = record.wins + record.losses;
  return {
    leagueName: record.leagueName,
    teamName: record.team.name,
    wins: record.wins,
    losses: record.losses,
    draws: record.draws,
    runsFor: record.runsFor,
    runsAgainst: record.runsAgainst,
    winningPercentage: decidedGames === 0 ? 0 : Number((record.wins / decidedGames).toFixed(3))
  };
}

function sortStandings(standings: LeagueStanding[]): LeagueStanding[] {
  return [...standings].sort((a, b) => {
    if (b.winningPercentage !== a.winningPercentage) {
      return b.winningPercentage - a.winningPercentage;
    }
    if (b.wins !== a.wins) return b.wins - a.wins;
    const runDiffA = a.runsFor - a.runsAgainst;
    const runDiffB = b.runsFor - b.runsAgainst;
    return runDiffB - runDiffA;
  });
}

function applyMatchResult(
  result: MatchResult,
  teamARecord: MutableStanding,
  teamBRecord: MutableStanding
) {
  teamARecord.runsFor += result.scoreA;
  teamARecord.runsAgainst += result.scoreB;
  teamBRecord.runsFor += result.scoreB;
  teamBRecord.runsAgainst += result.scoreA;

  if (result.winner === "A") {
    teamARecord.wins += 1;
    teamBRecord.losses += 1;
  } else if (result.winner === "B") {
    teamBRecord.wins += 1;
    teamARecord.losses += 1;
  } else {
    teamARecord.draws += 1;
    teamBRecord.draws += 1;
  }
}

function emptySeriesResult(teamA: BaseballTeam, teamB: BaseballTeam): SeriesResult {
  return {
    sport: "baseball",
    games: 0,
    teamA: teamA.name,
    teamB: teamB.name,
    winsA: 0,
    winsB: 0,
    draws: 0,
    winningPercentageA: 0,
    winningPercentageB: 0,
    averageScoreA: 0,
    averageScoreB: 0,
    mvps: []
  };
}

function addSeriesMatch(series: SeriesResult, match: MatchResult) {
  series.games += 1;
  series.averageScoreA += match.scoreA;
  series.averageScoreB += match.scoreB;
  if (match.winner === "A") series.winsA += 1;
  if (match.winner === "B") series.winsB += 1;
  if (match.winner === "draw") series.draws += 1;
  if (match.mvp) series.mvps.push(match.mvp);
  if (!series.sampleMatch) series.sampleMatch = match;
}

function finalizeSeries(series: SeriesResult): SeriesResult {
  const decidedGames = series.winsA + series.winsB;
  const mvpScores = new Map<string, MVPResult>();

  series.mvps.forEach((mvp) => {
    const current = mvpScores.get(mvp.playerId);
    if (!current || mvp.score > current.score) {
      mvpScores.set(mvp.playerId, mvp);
    }
  });

  return {
    ...series,
    winningPercentageA: decidedGames === 0 ? 0 : Number((series.winsA / decidedGames).toFixed(3)),
    winningPercentageB: decidedGames === 0 ? 0 : Number((series.winsB / decidedGames).toFixed(3)),
    averageScoreA: Number((series.averageScoreA / Math.max(series.games, 1)).toFixed(2)),
    averageScoreB: Number((series.averageScoreB / Math.max(series.games, 1)).toFixed(2)),
    overallMvp: Array.from(mvpScores.values()).sort((a, b) => b.score - a.score)[0]
  };
}

function simulatePostseasonSeries(
  teamA: BaseballTeam,
  teamB: BaseballTeam,
  options: SeriesOptions
): SeriesResult {
  const series = emptySeriesResult(teamA, teamB);
  series.winsA = options.initialWinsA ?? 0;
  series.winsB = options.initialWinsB ?? 0;

  for (
    let game = 1;
    game <= options.maxGames &&
    series.winsA < options.targetWins &&
    series.winsB < options.targetWins;
    game += 1
  ) {
    const match = baseballEngine.simulateMatch(teamA, teamB, {
      seed: `${options.seed}:${options.seedLabel}:${game}`,
      includeLog: Boolean(options.includeLog && game === 1)
    });
    addSeriesMatch(series, match);
  }

  return finalizeSeries(series);
}

function seriesWinner(series: SeriesResult, defaultWinner: "A" | "B" = "A"): string {
  if (series.winsA > series.winsB) return series.teamA;
  if (series.winsB > series.winsA) return series.teamB;
  return defaultWinner === "A" ? series.teamA : series.teamB;
}

function requireTeam(teamByName: Map<string, BaseballTeam>, teamName: string): BaseballTeam {
  const team = teamByName.get(teamName);
  if (!team) throw new Error(`Missing team for ${teamName}.`);
  return team;
}

function simulateLeagueGroup(
  league: (typeof NPB_LEAGUES)[number],
  teamByName: Map<string, BaseballTeam>,
  seed: string,
  gamesPerCard: number
): LeagueSeasonGroup {
  const records = new Map<string, MutableStanding>();
  const leagueTeams = league.teams.map((teamName) => {
    const team = requireTeam(teamByName, teamName);
    records.set(team.name, {
      leagueName: league.name,
      team,
      wins: 0,
      losses: 0,
      draws: 0,
      runsFor: 0,
      runsAgainst: 0
    });
    return team;
  });

  for (let i = 0; i < leagueTeams.length; i += 1) {
    for (let j = i + 1; j < leagueTeams.length; j += 1) {
      for (let game = 1; game <= gamesPerCard; game += 1) {
        const teamA = leagueTeams[i];
        const teamB = leagueTeams[j];
        const match = baseballEngine.simulateMatch(teamA, teamB, {
          seed: `${seed}:regular:${league.name}:${teamA.name}:${teamB.name}:${game}`
        });
        applyMatchResult(match, records.get(teamA.name)!, records.get(teamB.name)!);
      }
    }
  }

  return {
    name: league.name,
    standings: sortStandings(Array.from(records.values()).map(toStanding))
  };
}

function simulateClimaxSeries(
  leagueGroup: LeagueSeasonGroup,
  teamByName: Map<string, BaseballTeam>,
  seed: string
): { rounds: PostseasonRoundResult[]; winner: BaseballTeam } {
  const first = requireTeam(teamByName, leagueGroup.standings[0].teamName);
  const second = requireTeam(teamByName, leagueGroup.standings[1].teamName);
  const third = requireTeam(teamByName, leagueGroup.standings[2].teamName);

  const firstStage = simulatePostseasonSeries(second, third, {
    seed,
    seedLabel: `${leagueGroup.name}:climax-first`,
    targetWins: 2,
    maxGames: 3
  });
  const firstStageWinnerName = seriesWinner(firstStage, "A");
  const firstStageWinner = requireTeam(teamByName, firstStageWinnerName);
  const challengerSeed = firstStageWinner.name === second.name ? 2 : 3;

  const finalStage = simulatePostseasonSeries(first, firstStageWinner, {
    seed,
    seedLabel: `${leagueGroup.name}:climax-final`,
    targetWins: 4,
    maxGames: 6,
    initialWinsA: 1
  });
  const leagueWinnerName = seriesWinner(finalStage, "A");
  const leagueWinner = requireTeam(teamByName, leagueWinnerName);

  return {
    winner: leagueWinner,
    rounds: [
      {
        name: `${leagueGroup.name} CSファーストステージ`,
        leagueName: leagueGroup.name,
        stage: "climax-first",
        teamASeed: 2,
        teamBSeed: 3,
        series: firstStage,
        winner: firstStageWinnerName,
        note: "2位と3位の3試合制。勝敗が並んだ場合は上位チームを勝者にします。"
      },
      {
        name: `${leagueGroup.name} CSファイナルステージ`,
        leagueName: leagueGroup.name,
        stage: "climax-final",
        teamASeed: 1,
        teamBSeed: challengerSeed,
        series: finalStage,
        winner: leagueWinnerName,
        note: "1位チームに1勝アドバンテージを付けた6試合制です。"
      }
    ]
  };
}

export function simulateNpbSeason(
  options: { seed?: string; gamesPerCard?: number } = {}
): LeagueSeasonResult {
  const seed = options.seed ?? "league-seed";
  const gamesPerCard = options.gamesPerCard ?? 12;
  const teams = createLeagueTeams(seed);
  const teamByName = new Map(teams.map((team) => [team.name, team]));

  const leagueGroups = NPB_LEAGUES.map((league) =>
    simulateLeagueGroup(league, teamByName, seed, gamesPerCard)
  );

  const climaxSeries: PostseasonRoundResult[] = [];
  const leagueChampions = leagueGroups.map((leagueGroup) => {
    const result = simulateClimaxSeries(leagueGroup, teamByName, seed);
    climaxSeries.push(...result.rounds);
    return result.winner;
  });

  const japanSeries = simulatePostseasonSeries(leagueChampions[0], leagueChampions[1], {
    seed,
    seedLabel: "japan-series",
    targetWins: 4,
    maxGames: 7,
    includeLog: true
  });
  const champion = seriesWinner(japanSeries, "A");
  const runnerUp = champion === japanSeries.teamA ? japanSeries.teamB : japanSeries.teamA;

  return {
    sport: "baseball",
    gamesPerCard,
    leagues: leagueGroups,
    climaxSeries,
    japanSeries,
    champion,
    runnerUp
  };
}

export const simulateNpbMiniSeason = simulateNpbSeason;
