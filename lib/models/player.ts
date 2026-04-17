export type Sport = "baseball" | "soccer";

export type PlayerEra = "1990s" | "2000s" | "2010s" | "2020s";

export interface PlayerTeamStint {
  teamName: string;
  era: PlayerEra;
  games: number;
  statLine: string;
  note: string;
}

export interface PlayerBase {
  id: string;
  name: string;
  sport: Sport;
  era?: PlayerEra;
  sourceTeam?: string;
  imageId?: string;
  dataSeason?: number;
  sourceUrl?: string;
  teamHistory?: PlayerTeamStint[];
}

export interface BaseballHitter extends PlayerBase {
  sport: "baseball";
  role: "hitter";
  contact: number;
  power: number;
  fielding: number;
}

export interface BaseballPitcher extends PlayerBase {
  sport: "baseball";
  role: "pitcher";
  control: number;
  stuff: number;
  stamina: number;
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
