import type { Sport } from "./player";

export type MatchWinner = "A" | "B" | "draw";

export type PlateAppearanceOutcome = "out" | "single" | "double" | "home_run";

export interface PlayerMatchStats {
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  teamSide: "A" | "B";
  role: string;
  runs: number;
  hits: number;
  doubles: number;
  homeRuns: number;
  rbi: number;
  outs: number;
  pitchingOuts: number;
  battersFaced: number;
  runsAllowed: number;
  mvpScore: number;
}

export interface MVPResult {
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  teamSide: "A" | "B";
  score: number;
  summary: string;
}

export interface BaseballLogEntry {
  inning: number;
  half: "top" | "bottom";
  battingTeam: string;
  pitchingTeam: string;
  batter: string;
  pitcher: string;
  outcome: PlateAppearanceOutcome;
  runsScored: number;
  scoreA: number;
  scoreB: number;
  hitProbability: number;
  defenseRating: number;
  pitcherFatigue: number;
  description: string;
}

export interface BaseballInningScore {
  inning: number;
  top: number;
  bottom: number | null;
}

export interface BaseballKeyMoment {
  inning: number;
  half: "top" | "bottom";
  text: string;
  scoreA: number;
  scoreB: number;
}

export interface MatchResult {
  sport: Sport;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  winner: MatchWinner;
  playerStats: PlayerMatchStats[];
  mvp?: MVPResult;
  log?: BaseballLogEntry[];
  lineScore?: BaseballInningScore[];
  keyMoments?: BaseballKeyMoment[];
}

export interface SeriesResult {
  sport: Sport;
  games: number;
  teamA: string;
  teamB: string;
  winsA: number;
  winsB: number;
  draws: number;
  winningPercentageA: number;
  winningPercentageB: number;
  averageScoreA: number;
  averageScoreB: number;
  mvps: MVPResult[];
  overallMvp?: MVPResult;
  sampleMatch?: MatchResult;
}

export interface LeagueStanding {
  leagueName: string;
  teamName: string;
  wins: number;
  losses: number;
  draws: number;
  runsFor: number;
  runsAgainst: number;
  winningPercentage: number;
}

export interface LeagueSeasonGroup {
  name: string;
  standings: LeagueStanding[];
}

export interface PostseasonRoundResult {
  name: string;
  leagueName?: string;
  stage: "climax-first" | "climax-final" | "japan-series";
  teamASeed?: number;
  teamBSeed?: number;
  series: SeriesResult;
  winner: string;
  note?: string;
}

export interface LeagueSeasonResult {
  sport: "baseball";
  gamesPerCard: number;
  leagues: LeagueSeasonGroup[];
  climaxSeries: PostseasonRoundResult[];
  japanSeries: SeriesResult;
  champion: string;
  runnerUp: string;
}
