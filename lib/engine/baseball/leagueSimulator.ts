import { baseballEngine } from "@/lib/engine/baseball/baseballEngine";
import {
  BASEBALL_SOURCE_TEAMS
} from "@/lib/engine/baseball/playerPool";
import { createRandomBaseballTeam } from "@/lib/engine/baseball/randomTeam";
import type {
  LeagueSeasonGroup,
  LeagueSeasonResult,
  LeagueStanding,
  MatchResult,
  MVPResult,
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

const MINI_LEAGUES = [
  {
    name: "セントラル・リーグ",
    teams: [BASEBALL_SOURCE_TEAMS[0], BASEBALL_SOURCE_TEAMS[1]]
  },
  {
    name: "パシフィック・リーグ",
    teams: [BASEBALL_SOURCE_TEAMS[2], BASEBALL_SOURCE_TEAMS[3]]
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

function simulateBestOfSeven(teamA: BaseballTeam, teamB: BaseballTeam, seed: string): SeriesResult {
  const series = emptySeriesResult(teamA, teamB);

  for (let game = 1; game <= 7 && series.winsA < 4 && series.winsB < 4; game += 1) {
    const match = baseballEngine.simulateMatch(teamA, teamB, {
      seed: `${seed}:japan-series:${game}`,
      includeLog: game === 1
    });
    addSeriesMatch(series, match);
  }

  return finalizeSeries(series);
}

export function simulateNpbMiniSeason(
  options: { seed?: string; gamesPerCard?: number } = {}
): LeagueSeasonResult {
  const seed = options.seed ?? "league-seed";
  const gamesPerCard = options.gamesPerCard ?? 12;
  const teams = createLeagueTeams(seed);
  const teamByName = new Map(teams.map((team) => [team.name, team]));
  const leagueGroups: LeagueSeasonGroup[] = [];

  MINI_LEAGUES.forEach((league) => {
    const records = new Map<string, MutableStanding>();
    const leagueTeams = league.teams.map((teamName) => {
      const team = teamByName.get(teamName);
      if (!team) throw new Error(`Missing team for ${teamName}.`);
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
            seed: `${seed}:${league.name}:${teamA.name}:${teamB.name}:${game}`
          });
          applyMatchResult(match, records.get(teamA.name)!, records.get(teamB.name)!);
        }
      }
    }

    leagueGroups.push({
      name: league.name,
      standings: sortStandings(Array.from(records.values()).map(toStanding))
    });
  });

  const centralWinner = teamByName.get(leagueGroups[0].standings[0].teamName);
  const pacificWinner = teamByName.get(leagueGroups[1].standings[0].teamName);
  if (!centralWinner || !pacificWinner) {
    throw new Error("League winners could not be resolved.");
  }

  const japanSeries = simulateBestOfSeven(centralWinner, pacificWinner, seed);
  const champion =
    japanSeries.winsA >= japanSeries.winsB ? japanSeries.teamA : japanSeries.teamB;
  const runnerUp =
    japanSeries.winsA >= japanSeries.winsB ? japanSeries.teamB : japanSeries.teamA;

  return {
    sport: "baseball",
    gamesPerCard,
    leagues: leagueGroups,
    japanSeries,
    champion,
    runnerUp
  };
}
