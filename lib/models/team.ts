import type { BaseballHitter, BaseballPitcher, SoccerPlayer, Sport } from "./player";

export interface TeamBase {
  id: string;
  name: string;
  sport: Sport;
}

export interface BaseballTeam extends TeamBase {
  sport: "baseball";
  hitters: BaseballHitter[];
  pitcher: BaseballPitcher;
}

export interface SoccerTeam extends TeamBase {
  sport: "soccer";
  players: SoccerPlayer[];
}

export type Team = BaseballTeam | SoccerTeam;
