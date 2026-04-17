export type Sport = "baseball" | "soccer";

export type PlayerEra = "1990s" | "2000s" | "2010s" | "2020s";

export interface PlayerBase {
  id: string;
  name: string;
  sport: Sport;
  era?: PlayerEra;
  sourceTeam?: string;
}

export interface BaseballHitter extends PlayerBase {
  sport: "baseball";
  role: "hitter";
  contact: number;
  power: number;
}

export interface BaseballPitcher extends PlayerBase {
  sport: "baseball";
  role: "pitcher";
  control: number;
  stuff: number;
}

export type SoccerRole = "goalkeeper" | "defender" | "midfielder" | "forward";

export interface SoccerPlayer extends PlayerBase {
  sport: "soccer";
  role: SoccerRole;
  offense: number;
  defense: number;
  stamina: number;
}

export type Player = BaseballHitter | BaseballPitcher | SoccerPlayer;
