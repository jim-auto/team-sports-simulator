"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { simulateNpbSeason } from "@/lib/engine/baseball/leagueSimulator";
import type { LeagueSeasonGroup, LeagueSeasonResult, MatchResult, SeriesResult } from "@/lib/models/result";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function runDiff(runsFor: number, runsAgainst: number): string {
  const diff = runsFor - runsAgainst;
  return `${diff >= 0 ? "+" : ""}${diff}`;
}

function outcomeLabel(outcome: string): string {
  if (outcome === "home_run") return "HR";
  if (outcome === "single") return "1B";
  if (outcome === "double") return "2B";
  return "OUT";
}

function StandingsTable({ league }: { league: LeagueSeasonGroup }) {
  return (
    <div>
      <h3 className="font-semibold">{league.name}</h3>
      <div className="mt-2 overflow-x-auto rounded-md border border-slate-200 bg-white">
        <table className="min-w-[560px] w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left">
              <th className="px-2 py-2">順位</th>
              <th className="px-2 py-2">チーム</th>
              <th className="px-2 py-2 text-right">勝</th>
              <th className="px-2 py-2 text-right">敗</th>
              <th className="px-2 py-2 text-right">分</th>
              <th className="px-2 py-2 text-right">勝率</th>
              <th className="px-2 py-2 text-right">得点</th>
              <th className="px-2 py-2 text-right">失点</th>
              <th className="px-2 py-2 text-right">得失点</th>
            </tr>
          </thead>
          <tbody>
            {league.standings.map((standing, index) => (
              <tr key={standing.teamName} className="border-b border-slate-100 last:border-b-0">
                <td className="px-2 py-2 font-medium">{index + 1}</td>
                <td className="px-2 py-2 font-semibold">{standing.teamName}</td>
                <td className="px-2 py-2 text-right">{standing.wins}</td>
                <td className="px-2 py-2 text-right">{standing.losses}</td>
                <td className="px-2 py-2 text-right">{standing.draws}</td>
                <td className="px-2 py-2 text-right">{standing.winningPercentage.toFixed(3)}</td>
                <td className="px-2 py-2 text-right">{standing.runsFor}</td>
                <td className="px-2 py-2 text-right">{standing.runsAgainst}</td>
                <td className="px-2 py-2 text-right">
                  {runDiff(standing.runsFor, standing.runsAgainst)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SeriesScore({ series }: { series: SeriesResult }) {
  return (
    <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
      <div>
        <div className="text-sm text-slate-500">{series.teamA}</div>
        <div className="text-3xl font-bold">{series.winsA}勝</div>
        <div className="text-xs text-slate-500">平均 {series.averageScoreA}点</div>
      </div>
      <div className="text-center text-sm font-semibold text-slate-500">
        {series.games}試合
        {series.draws > 0 && <div className="text-xs">引分 {series.draws}</div>}
      </div>
      <div className="text-right md:text-left">
        <div className="text-sm text-slate-500">{series.teamB}</div>
        <div className="text-3xl font-bold">{series.winsB}勝</div>
        <div className="text-xs text-slate-500">平均 {series.averageScoreB}点</div>
      </div>
    </div>
  );
}

function GameFlowPanel({ match }: { match?: MatchResult }) {
  if (!match) return null;

  const scoringLog = match.log?.filter((entry) => entry.runsScored > 0) ?? [];

  return (
    <div className="mt-5 grid gap-4 xl:grid-cols-[420px_1fr]">
      {match.lineScore && (
        <div>
          <h3 className="font-semibold">日本シリーズ第1戦スコア</h3>
          <div className="mt-2 overflow-x-auto rounded-md border border-slate-200">
            <table className="min-w-[390px] w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-2 py-2 text-left">Team</th>
                  {match.lineScore.map((line) => (
                    <th key={line.inning} className="px-2 py-2 text-center">
                      {line.inning}
                    </th>
                  ))}
                  <th className="px-2 py-2 text-center">R</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="px-2 py-2 font-medium">{match.teamA}</td>
                  {match.lineScore.map((line) => (
                    <td key={line.inning} className="px-2 py-2 text-center">
                      {line.top}
                    </td>
                  ))}
                  <td className="px-2 py-2 text-center font-bold">{match.scoreA}</td>
                </tr>
                <tr>
                  <td className="px-2 py-2 font-medium">{match.teamB}</td>
                  {match.lineScore.map((line) => (
                    <td key={line.inning} className="px-2 py-2 text-center">
                      {line.bottom ?? "-"}
                    </td>
                  ))}
                  <td className="px-2 py-2 text-center font-bold">{match.scoreB}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div>
        <h3 className="font-semibold">第1戦の展開</h3>
        <div className="mt-2 max-h-72 overflow-y-auto rounded-md border border-slate-200 bg-white">
          {(match.keyMoments && match.keyMoments.length > 0 ? match.keyMoments : []).map((moment) => (
            <div
              key={`${moment.inning}-${moment.half}-${moment.text}`}
              className="border-b border-slate-100 px-3 py-2 text-sm last:border-b-0"
            >
              {moment.text}
            </div>
          ))}
          {(!match.keyMoments || match.keyMoments.length === 0) &&
            scoringLog.map((entry, index) => (
              <div
                key={`${entry.inning}-${entry.half}-${index}`}
                className="grid grid-cols-[64px_1fr_54px] gap-2 border-b border-slate-100 px-3 py-2 text-sm last:border-b-0"
              >
                <span className="font-medium text-slate-500">
                  {entry.inning}
                  {entry.half === "top" ? "表" : "裏"}
                </span>
                <span className="min-w-0 truncate">
                  {entry.battingTeam} / {entry.batter}
                </span>
                <span className="font-semibold text-emerald-700">{outcomeLabel(entry.outcome)}</span>
              </div>
            ))}
          {(!match.keyMoments || match.keyMoments.length === 0) && scoringLog.length === 0 && (
            <div className="px-3 py-2 text-sm text-slate-500">大きな得点場面はありませんでした。</div>
          )}
        </div>
      </div>
    </div>
  );
}

function SeasonResultPanel({ result }: { result: LeagueSeasonResult | null }) {
  if (!result) {
    return (
      <section className="rounded-md border border-dashed border-slate-300 bg-white p-5 text-slate-500">
        1年シーズンの結果はここに表示されます。
      </section>
    );
  }

  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-panel">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-xl font-bold">12球団リーグ戦 + CS + 日本シリーズ</h2>
          <p className="text-sm text-slate-600">
            同一リーグ各カード {result.gamesPerCard} 試合 / 日本一: {result.champion}
          </p>
        </div>
        <div className="rounded-md bg-amber-100 px-3 py-2 text-sm text-amber-950">
          優勝: {result.champion}
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        {result.leagues.map((league) => (
          <StandingsTable key={league.name} league={league} />
        ))}
      </div>

      <div className="mt-5">
        <h3 className="font-semibold">クライマックスシリーズ</h3>
        <div className="mt-3 grid gap-3 xl:grid-cols-2">
          {result.climaxSeries.map((round) => (
            <div key={round.name} className="rounded-md border border-slate-200 p-3">
              <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="font-semibold">{round.name}</div>
                  <div className="text-sm text-slate-500">
                    {round.series.teamA}
                    {round.teamASeed ? ` (${round.teamASeed}位)` : ""} vs {round.series.teamB}
                    {round.teamBSeed ? ` (${round.teamBSeed}位)` : ""}
                  </div>
                </div>
                <div className="text-sm font-semibold text-emerald-700">勝者: {round.winner}</div>
              </div>
              <SeriesScore series={round.series} />
              {round.note && <p className="mt-2 text-xs text-slate-500">{round.note}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-md border border-slate-200 p-4">
        <h3 className="font-semibold">日本シリーズ</h3>
        <SeriesScore series={result.japanSeries} />
        {result.japanSeries.overallMvp && (
          <div className="mt-3 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700">
            シリーズMVP: {result.japanSeries.overallMvp.playerName}
          </div>
        )}
        <GameFlowPanel match={result.japanSeries.sampleMatch} />
      </div>
    </section>
  );
}

export default function SeasonPage() {
  const [gamesPerCard, setGamesPerCard] = useState(12);
  const [seed, setSeed] = useState("season-seed");
  const [result, setResult] = useState<LeagueSeasonResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function simulateSeason() {
    setLoading(true);
    setError("");
    try {
      setResult(
        simulateNpbSeason({
          seed,
          gamesPerCard
        })
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Season simulation failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[1fr_240px] md:px-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                Team Sports Simulator
              </p>
              <Link
                href="/"
                prefetch={false}
                className="rounded-md border border-slate-300 px-3 py-1 text-sm font-semibold text-slate-700 hover:border-emerald-700"
              >
                対戦ページへ
              </Link>
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
              1年シーズン
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              12球団の同一リーグ戦からCS、日本シリーズまでをまとめてシミュレーションします。
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-[220px_1fr_auto] md:items-end">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  league games
                </span>
                <select
                  value={gamesPerCard}
                  onChange={(event) => setGamesPerCard(Number(event.target.value))}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2"
                >
                  <option value={6}>各カード6試合（短縮）</option>
                  <option value={12}>各カード12試合</option>
                  <option value={24}>各カード24試合</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  seed
                </span>
                <input
                  value={seed}
                  onChange={(event) => setSeed(event.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-emerald-600"
                />
              </label>
              <button
                type="button"
                onClick={simulateSeason}
                disabled={loading}
                className="rounded-md bg-emerald-700 px-5 py-2 font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {loading ? "Simulating..." : "シーズン開始"}
              </button>
            </div>
            {error && <p className="mt-3 text-sm font-medium text-rose-700">{error}</p>}
          </div>
          <div className="flex items-center justify-center rounded-md border border-emerald-900/10 bg-emerald-800 p-4">
            <Image
              src={`${basePath}/baseball-diamond.svg`}
              alt="Baseball field diagram"
              width={188}
              height={188}
              className="h-48 w-48"
            />
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 md:px-6">
        <SeasonResultPanel result={result} />
      </div>
    </main>
  );
}
