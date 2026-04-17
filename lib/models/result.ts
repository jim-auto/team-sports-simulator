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
  batter: string;
  outcome: PlateAppearanceOutcome;
  runsScored: number;
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
}
