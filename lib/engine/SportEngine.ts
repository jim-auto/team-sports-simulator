import type { MatchResult, SeriesResult } from "@/lib/models/result";
import type { Team } from "@/lib/models/team";

export interface SimulateOptions {
  seed?: string | number;
  includeLog?: boolean;
}

export interface SeriesOptions extends SimulateOptions {
  games?: number;
}

export interface SportEngine<TTeam extends Team = Team> {
  sport: TTeam["sport"];
  simulateMatch(teamA: TTeam, teamB: TTeam, options?: SimulateOptions): MatchResult;
  simulateSeries(
    teamA: TTeam,
    teamB: TTeam,
    n: number,
    options?: SimulateOptions
  ): SeriesResult;
}
