import type { Sport } from "@/lib/models/player";
import { baseballEngine } from "./baseball/baseballEngine";
import { soccerEngine } from "./soccer/soccerEngine";

export function getSportEngine(sport: Sport) {
  if (sport === "baseball") return baseballEngine;
  if (sport === "soccer") return soccerEngine;
  throw new Error(`Unsupported sport: ${sport}`);
}
