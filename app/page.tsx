"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  BASEBALL_ERAS,
  BASEBALL_SOURCE_TEAMS
} from "@/lib/engine/baseball/playerPool";
import { baseballEngine } from "@/lib/engine/baseball/baseballEngine";
import { createRandomBaseballTeam } from "@/lib/engine/baseball/randomTeam";
import type { PlayerEra } from "@/lib/models/player";
import type { BaseballTeam } from "@/lib/models/team";
import type { MatchResult, SeriesResult } from "@/lib/models/result";

type SportOption = "baseball" | "soccer";
type SimulationResponse =
  | { mode: "match"; result: MatchResult }
  | { mode: "series"; result: SeriesResult };

interface TeamFilters {
  era: PlayerEra | "all";
  sourceTeam: string | "all";
}

const initialTeamA = createRandomBaseballTeam({
  seed: "initial-a",
  era: "2020s",
  sourceTeam: "Tokyo Meteors",
  name: "Tokyo Aces"
});

const initialTeamB = createRandomBaseballTeam({
  seed: "initial-b",
  era: "2020s",
  sourceTeam: "Osaka Waves",
  name: "Osaka Breakers"
});

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function clampRating(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function outcomeLabel(outcome: string): string {
  if (outcome === "home_run") return "HR";
  if (outcome === "single") return "1B";
  if (outcome === "double") return "2B";
  return "OUT";
}

function updateHitter(
  team: BaseballTeam,
  index: number,
  field: "name" | "contact" | "power",
  value: string
): BaseballTeam {
  return {
    ...team,
    hitters: team.hitters.map((hitter, currentIndex) => {
      if (currentIndex !== index) return hitter;
      if (field === "name") return { ...hitter, name: value };
      return { ...hitter, [field]: clampRating(Number(value)) };
    })
  };
}

function TeamEditor({
  label,
  team,
  filters,
  onTeamChange,
  onFiltersChange,
  onRandomize
}: {
  label: string;
  team: BaseballTeam;
  filters: TeamFilters;
  onTeamChange: (team: BaseballTeam) => void;
  onFiltersChange: (filters: TeamFilters) => void;
  onRandomize: () => void;
}) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-4 shadow-panel">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 flex-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </label>
          <input
            value={team.name}
            onChange={(event) => onTeamChange({ ...team, name: event.target.value })}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-lg font-semibold outline-none focus:border-emerald-600"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 md:w-[360px]">
          <select
            value={filters.era}
            onChange={(event) =>
              onFiltersChange({ ...filters, era: event.target.value as TeamFilters["era"] })
            }
            className="rounded-md border border-slate-300 bg-white px-3 py-2"
          >
            <option value="all">年代: all</option>
            {BASEBALL_ERAS.map((era) => (
              <option key={era} value={era}>
                年代: {era}
              </option>
            ))}
          </select>
          <select
            value={filters.sourceTeam}
            onChange={(event) =>
              onFiltersChange({ ...filters, sourceTeam: event.target.value })
            }
            className="rounded-md border border-slate-300 bg-white px-3 py-2"
          >
            <option value="all">チーム: all</option>
            {BASEBALL_SOURCE_TEAMS.map((sourceTeam) => (
              <option key={sourceTeam} value={sourceTeam}>
                {sourceTeam}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onRandomize}
            className="col-span-2 rounded-md bg-emerald-700 px-3 py-2 font-semibold text-white hover:bg-emerald-800"
          >
            ランダム編成
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-[680px] w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="py-2 pr-2">#</th>
              <th className="py-2 pr-2">打者</th>
              <th className="py-2 pr-2">contact</th>
              <th className="py-2 pr-2">power</th>
              <th className="py-2 pr-2">era</th>
              <th className="py-2">source</th>
            </tr>
          </thead>
          <tbody>
            {team.hitters.map((hitter, index) => (
              <tr key={`${hitter.id}-${index}`} className="border-b border-slate-100">
                <td className="py-2 pr-2 font-medium text-slate-500">{index + 1}</td>
                <td className="py-2 pr-2">
                  <input
                    value={hitter.name}
                    onChange={(event) =>
                      onTeamChange(updateHitter(team, index, "name", event.target.value))
                    }
                    className="w-full min-w-[150px] rounded-md border border-slate-300 px-2 py-1 outline-none focus:border-emerald-600"
                  />
                </td>
                <td className="py-2 pr-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={hitter.contact}
                    onChange={(event) =>
                      onTeamChange(updateHitter(team, index, "contact", event.target.value))
                    }
                    className="w-20 rounded-md border border-slate-300 px-2 py-1 outline-none focus:border-emerald-600"
                  />
                </td>
                <td className="py-2 pr-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={hitter.power}
                    onChange={(event) =>
                      onTeamChange(updateHitter(team, index, "power", event.target.value))
                    }
                    className="w-20 rounded-md border border-slate-300 px-2 py-1 outline-none focus:border-emerald-600"
                  />
                </td>
                <td className="py-2 pr-2 text-slate-600">{hitter.era}</td>
                <td className="py-2 text-slate-600">{hitter.sourceTeam}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-3 border-t border-slate-200 pt-4 md:grid-cols-[1fr_120px_120px]">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            投手
          </label>
          <input
            value={team.pitcher.name}
            onChange={(event) =>
              onTeamChange({
                ...team,
                pitcher: { ...team.pitcher, name: event.target.value }
              })
            }
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-600"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            control
          </label>
          <input
            type="number"
            min={0}
            max={100}
            value={team.pitcher.control}
            onChange={(event) =>
              onTeamChange({
                ...team,
                pitcher: {
                  ...team.pitcher,
                  control: clampRating(Number(event.target.value))
                }
              })
            }
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-600"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            stuff
          </label>
          <input
            type="number"
            min={0}
            max={100}
            value={team.pitcher.stuff}
            onChange={(event) =>
              onTeamChange({
                ...team,
                pitcher: {
                  ...team.pitcher,
                  stuff: clampRating(Number(event.target.value))
                }
              })
            }
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-600"
          />
        </div>
      </div>
    </section>
  );
}

function ResultPanel({ response }: { response: SimulationResponse | null }) {
  if (!response) {
    return (
      <section className="rounded-md border border-dashed border-slate-300 bg-white p-5 text-slate-500">
        結果はここに表示されます。
      </section>
    );
  }

  if (response.mode === "series") {
    const result = response.result;
    return (
      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-panel">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-xl font-bold">Series Result</h2>
            <p className="text-sm text-slate-600">
              {result.teamA} vs {result.teamB} / {result.games} games
            </p>
          </div>
          {result.overallMvp && (
            <div className="rounded-md bg-amber-100 px-3 py-2 text-sm text-amber-950">
              MVP: {result.overallMvp.playerName} ({result.overallMvp.teamName})
            </div>
          )}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-md border border-slate-200 p-3">
            <div className="text-sm text-slate-500">{result.teamA}</div>
            <div className="text-2xl font-bold">{formatPercent(result.winningPercentageA)}</div>
            <div className="text-sm text-slate-600">
              {result.winsA}勝 / 平均 {result.averageScoreA}点
            </div>
          </div>
          <div className="rounded-md border border-slate-200 p-3">
            <div className="text-sm text-slate-500">{result.teamB}</div>
            <div className="text-2xl font-bold">{formatPercent(result.winningPercentageB)}</div>
            <div className="text-sm text-slate-600">
              {result.winsB}勝 / 平均 {result.averageScoreB}点
            </div>
          </div>
          <div className="rounded-md border border-slate-200 p-3">
            <div className="text-sm text-slate-500">Draws</div>
            <div className="text-2xl font-bold">{result.draws}</div>
            <div className="text-sm text-slate-600">9回終了時点の同点</div>
          </div>
        </div>
      </section>
    );
  }

  const result = response.result;
  const winnerName =
    result.winner === "A" ? result.teamA : result.winner === "B" ? result.teamB : "Draw";

  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-panel">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-xl font-bold">Match Result</h2>
          <p className="text-sm text-slate-600">Winner: {winnerName}</p>
        </div>
        {result.mvp && (
          <div className="rounded-md bg-amber-100 px-3 py-2 text-sm text-amber-950">
            MVP: {result.mvp.playerName} / {result.mvp.summary}
          </div>
        )}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <div className="rounded-md border border-slate-200 p-4">
          <div className="text-sm text-slate-500">{result.teamA}</div>
          <div className="text-4xl font-bold">{result.scoreA}</div>
        </div>
        <div className="text-center text-sm font-semibold text-slate-500">VS</div>
        <div className="rounded-md border border-slate-200 p-4">
          <div className="text-sm text-slate-500">{result.teamB}</div>
          <div className="text-4xl font-bold">{result.scoreB}</div>
        </div>
      </div>
      {result.log && result.log.length > 0 && (
        <div className="mt-5">
          <h3 className="font-semibold">Game Log</h3>
          <div className="mt-2 max-h-72 overflow-y-auto rounded-md border border-slate-200">
            {result.log.slice(-40).map((entry, index) => (
              <div
                key={`${entry.inning}-${entry.half}-${index}`}
                className="grid grid-cols-[70px_1fr_54px_70px] gap-2 border-b border-slate-100 px-3 py-2 text-sm last:border-b-0"
              >
                <span className="font-medium text-slate-500">
                  {entry.inning}
                  {entry.half === "top" ? "表" : "裏"}
                </span>
                <span className="min-w-0 truncate">
                  {entry.battingTeam} / {entry.batter}
                </span>
                <span className="font-semibold text-emerald-700">{outcomeLabel(entry.outcome)}</span>
                <span className="text-right text-slate-600">
                  {entry.scoreA}-{entry.scoreB}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default function Home() {
  const [sport, setSport] = useState<SportOption>("baseball");
  const [games, setGames] = useState(100);
  const [seed, setSeed] = useState("demo-seed");
  const [teamA, setTeamA] = useState<BaseballTeam>(initialTeamA);
  const [teamB, setTeamB] = useState<BaseballTeam>(initialTeamB);
  const [filtersA, setFiltersA] = useState<TeamFilters>({
    era: "2020s",
    sourceTeam: "Tokyo Meteors"
  });
  const [filtersB, setFiltersB] = useState<TeamFilters>({
    era: "2020s",
    sourceTeam: "Osaka Waves"
  });
  const [response, setResponse] = useState<SimulationResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const disabled = sport !== "baseball";
  const matchupName = useMemo(() => `${teamA.name} vs ${teamB.name}`, [teamA.name, teamB.name]);

  function randomizeTeam(side: "A" | "B") {
    const filters = side === "A" ? filtersA : filtersB;
    const setTeam = side === "A" ? setTeamA : setTeamB;

    const team = createRandomBaseballTeam({
      seed: `${seed || Date.now()}-${side}`,
      era: filters.era,
      sourceTeam: filters.sourceTeam
    });

    setTeam(team);
  }

  function randomizeBoth() {
    setError("");
    try {
      randomizeTeam("A");
      randomizeTeam("B");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Random team failed.");
    }
  }

  function simulate() {
    setLoading(true);
    setError("");
    try {
      const result =
        games === 1
          ? baseballEngine.simulateMatch(teamA, teamB, {
              seed,
              includeLog: true
            })
          : baseballEngine.simulateSeries(teamA, teamB, games, {
              seed
            });

      setResponse({
        mode: games === 1 ? "match" : "series",
        result
      } as SimulationResponse);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Simulation failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[1fr_280px] md:px-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Team Sports Simulator
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
              {matchupName}
            </h1>
            <div className="mt-5 grid gap-3 md:grid-cols-4">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  sport
                </span>
                <select
                  value={sport}
                  onChange={(event) => setSport(event.target.value as SportOption)}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2"
                >
                  <option value="baseball">Baseball</option>
                  <option value="soccer">Soccer</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  games
                </span>
                <select
                  value={games}
                  onChange={(event) => setGames(Number(event.target.value))}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2"
                >
                  <option value={1}>1</option>
                  <option value={100}>100</option>
                  <option value={1000}>1000</option>
                </select>
              </label>
              <label className="block md:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  seed
                </span>
                <input
                  value={seed}
                  onChange={(event) => setSeed(event.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-emerald-600"
                />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={simulate}
                disabled={disabled || loading}
                className="rounded-md bg-slate-950 px-5 py-2 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {loading ? "Simulating..." : "シミュレーション"}
              </button>
              <button
                type="button"
                onClick={randomizeBoth}
                disabled={disabled}
                className="rounded-md border border-slate-300 bg-white px-5 py-2 font-semibold text-slate-900 hover:border-emerald-700 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                両チームをランダム編成
              </button>
            </div>
            {disabled && (
              <p className="mt-3 text-sm text-rose-700">
                Web UIの入力フォームはMVPでは野球のみ対応しています。
              </p>
            )}
            {error && <p className="mt-3 text-sm font-medium text-rose-700">{error}</p>}
          </div>
          <div className="flex items-center justify-center rounded-md border border-emerald-900/10 bg-emerald-800 p-4">
            <Image
              src={`${basePath}/baseball-diamond.svg`}
              alt="Baseball field diagram"
              width={208}
              height={208}
              className="h-52 w-52"
            />
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 md:px-6">
        <ResultPanel response={response} />
        <div className="grid gap-5 xl:grid-cols-2">
          <TeamEditor
            label="Team A"
            team={teamA}
            filters={filtersA}
            onTeamChange={setTeamA}
            onFiltersChange={setFiltersA}
            onRandomize={() => {
              try {
                randomizeTeam("A");
              } catch (caught) {
                setError(caught instanceof Error ? caught.message : "Random team failed.");
              }
            }}
          />
          <TeamEditor
            label="Team B"
            team={teamB}
            filters={filtersB}
            onTeamChange={setTeamB}
            onFiltersChange={setFiltersB}
            onRandomize={() => {
              try {
                randomizeTeam("B");
              } catch (caught) {
                setError(caught instanceof Error ? caught.message : "Random team failed.");
              }
            }}
          />
        </div>
      </div>
    </main>
  );
}
