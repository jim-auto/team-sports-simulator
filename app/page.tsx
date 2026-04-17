"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  BASEBALL_DATA_SEASON,
  BASEBALL_DATA_SOURCE,
  BASEBALL_ERAS,
  BASEBALL_SOURCE_TEAMS
} from "@/lib/engine/baseball/playerPool";
import { baseballEngine } from "@/lib/engine/baseball/baseballEngine";
import { createRandomBaseballTeam } from "@/lib/engine/baseball/randomTeam";
import type { BaseballHitter, BaseballPitcher, PlayerEra } from "@/lib/models/player";
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

type SelectedPlayer = {
  player: BaseballHitter | BaseballPitcher;
  team: BaseballTeam;
  teamSide: "A" | "B";
};

const defaultTeamA = BASEBALL_SOURCE_TEAMS[0];
const defaultTeamB = BASEBALL_SOURCE_TEAMS[2];

const initialTeamA = createRandomBaseballTeam({
  seed: "initial-a",
  era: "2020s",
  sourceTeam: defaultTeamA,
  name: defaultTeamA
});

const initialTeamB = createRandomBaseballTeam({
  seed: "initial-b",
  era: "2020s",
  sourceTeam: defaultTeamB,
  name: defaultTeamB
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

function fallbackAvatarSrc(player: BaseballHitter | BaseballPitcher): string {
  return `${basePath}/avatars/${player.imageId ?? "avatar-1"}.svg`;
}

function playerImageSrc(player: BaseballHitter | BaseballPitcher): string {
  return player.imageUrl ?? fallbackAvatarSrc(player);
}

function isPitcher(player: BaseballHitter | BaseballPitcher): player is BaseballPitcher {
  return player.role === "pitcher";
}

function updateHitter(
  team: BaseballTeam,
  index: number,
  field: "name" | "contact" | "power" | "fielding",
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
  teamSide,
  team,
  filters,
  onTeamChange,
  onFiltersChange,
  onRandomize,
  onPlayerSelect
}: {
  label: string;
  teamSide: "A" | "B";
  team: BaseballTeam;
  filters: TeamFilters;
  onTeamChange: (team: BaseballTeam) => void;
  onFiltersChange: (filters: TeamFilters) => void;
  onRandomize: () => void;
  onPlayerSelect: (selection: SelectedPlayer) => void;
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
        <table className="min-w-[820px] w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="py-2 pr-2">#</th>
              <th className="py-2 pr-2">打者</th>
              <th className="py-2 pr-2">ミート</th>
              <th className="py-2 pr-2">長打力</th>
              <th className="py-2 pr-2">守備</th>
              <th className="py-2 pr-2">年代</th>
              <th className="py-2 pr-2">成績元</th>
              <th className="py-2">詳細</th>
            </tr>
          </thead>
          <tbody>
            {team.hitters.map((hitter, index) => (
              <tr key={`${hitter.id}-${index}`} className="border-b border-slate-100">
                <td className="py-2 pr-2 font-medium text-slate-500">{index + 1}</td>
                <td className="py-2 pr-2">
                  <div className="flex min-w-[210px] items-center gap-2">
                    <Image
                      src={playerImageSrc(hitter)}
                      alt={`${hitter.name} portrait`}
                      width={34}
                      height={34}
                      className="h-[34px] w-[34px] rounded-md border border-slate-200 bg-slate-100 object-cover"
                    />
                    <input
                      value={hitter.name}
                      onChange={(event) =>
                        onTeamChange(updateHitter(team, index, "name", event.target.value))
                      }
                      className="w-full min-w-[150px] rounded-md border border-slate-300 px-2 py-1 outline-none focus:border-emerald-600"
                    />
                  </div>
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
                <td className="py-2 pr-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={hitter.fielding}
                    onChange={(event) =>
                      onTeamChange(updateHitter(team, index, "fielding", event.target.value))
                    }
                    className="w-20 rounded-md border border-slate-300 px-2 py-1 outline-none focus:border-emerald-600"
                  />
                </td>
                <td className="py-2 pr-2 text-slate-600">{hitter.era}</td>
                <td className="py-2 pr-2 text-slate-600">{hitter.sourceTeam}</td>
                <td className="py-2">
                  <a
                    href="#player-detail"
                    onClick={() => onPlayerSelect({ player: hitter, team, teamSide })}
                    className="font-semibold text-emerald-700 hover:text-emerald-900"
                  >
                    詳細
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-3 border-t border-slate-200 pt-4 md:grid-cols-[1fr_120px_120px_120px_70px]">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            投手
          </label>
          <div className="mt-1 flex items-center gap-2">
            <Image
              src={playerImageSrc(team.pitcher)}
              alt={`${team.pitcher.name} portrait`}
              width={38}
              height={38}
              className="h-[38px] w-[38px] rounded-md border border-slate-200 bg-slate-100 object-cover"
            />
            <input
              value={team.pitcher.name}
              onChange={(event) =>
                onTeamChange({
                  ...team,
                  pitcher: { ...team.pitcher, name: event.target.value }
                })
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-600"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            制球
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
            球威
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
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            スタミナ
          </label>
          <input
            type="number"
            min={0}
            max={100}
            value={team.pitcher.stamina}
            onChange={(event) =>
              onTeamChange({
                ...team,
                pitcher: {
                  ...team.pitcher,
                  stamina: clampRating(Number(event.target.value))
                }
              })
            }
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-600"
          />
        </div>
        <div className="flex items-end">
          <a
            href="#player-detail"
            onClick={() => onPlayerSelect({ player: team.pitcher, team, teamSide })}
            className="mb-2 font-semibold text-emerald-700 hover:text-emerald-900"
          >
            詳細
          </a>
        </div>
      </div>
    </section>
  );
}

function RatingBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-semibold text-slate-950">{value}</span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-slate-200">
        <div
          className="h-2 rounded-full bg-emerald-700"
          style={{ width: `${clampRating(value)}%` }}
        />
      </div>
    </div>
  );
}

function AbilityGuide() {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-panel">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-xl font-bold">能力モデル</h2>
          <p className="text-sm text-slate-600">
            {BASEBALL_DATA_SEASON}年NPB公式戦成績を0-100評価へ変換し、打撃・投球・守備を試合結果に反映しています。
          </p>
        </div>
        <a
          href={BASEBALL_DATA_SOURCE}
          target="_blank"
          rel="noreferrer"
          className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-emerald-800 hover:bg-slate-200"
        >
          成績ソース: NPB.jp
        </a>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-md border border-slate-200 p-3">
          <h3 className="font-semibold">ミート contact</h3>
          <p className="mt-1 text-sm text-slate-600">
            バットに当てる力。打率、出塁率、三振率、打席数から算出し、相手投手の制球と比べてヒット確率を決めます。
          </p>
        </div>
        <div className="rounded-md border border-slate-200 p-3">
          <h3 className="font-semibold">長打力 power</h3>
          <p className="mt-1 text-sm text-slate-600">
            二塁打・本塁打の出やすさ。長打率、本塁打率、長打本数から算出し、相手投手の球威と比べます。
          </p>
        </div>
        <div className="rounded-md border border-slate-200 p-3">
          <h3 className="font-semibold">守備 fielding</h3>
          <p className="mt-1 text-sm text-slate-600">
            守備力。MVPでは出場数、走力の目安、守備位置の補正から置いた暫定値で、守備側9人の平均値が高いほど相手のヒット確率を少し下げます。
          </p>
        </div>
        <div className="rounded-md border border-slate-200 p-3">
          <h3 className="font-semibold">制球 control</h3>
          <p className="mt-1 text-sm text-slate-600">
            四球の少なさと防御率から算出。打者のミートに対抗し、アウトを取りやすくします。
          </p>
        </div>
        <div className="rounded-md border border-slate-200 p-3">
          <h3 className="font-semibold">球威 stuff</h3>
          <p className="mt-1 text-sm text-slate-600">
            三振率、被本塁打率、防御率から算出。打者の長打力に対抗し、長打を抑えます。
          </p>
        </div>
        <div className="rounded-md border border-slate-200 p-3">
          <h3 className="font-semibold">スタミナ stamina</h3>
          <p className="mt-1 text-sm text-slate-600">
            投球回と登板数から算出。打者を多く相手にすると疲労し、制球と球威が徐々に落ちます。
          </p>
        </div>
      </div>
    </section>
  );
}

function PlayerDetailPanel({ selection }: { selection: SelectedPlayer | null }) {
  if (!selection) {
    return (
      <section
        id="player-detail"
        className="rounded-md border border-dashed border-slate-300 bg-white p-5 text-slate-500"
      >
        選手の「詳細」を押すと、画像・所属履歴・能力内訳が表示されます。
      </section>
    );
  }

  const { player, team, teamSide } = selection;
  const activeStint = player.teamHistory?.[0];
  const roleLabel = isPitcher(player) ? "投手" : "打者";

  return (
    <section id="player-detail" className="rounded-md border border-slate-200 bg-white p-5 shadow-panel">
      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        <div>
          <Image
            src={playerImageSrc(player)}
            alt={`${player.name} portrait`}
            width={220}
            height={220}
            className="h-[220px] w-[220px] rounded-md border border-slate-200 bg-slate-100 object-cover"
          />
          <p className="mt-2 text-xs text-slate-500">
            {player.imageCredit ? `画像: ${player.imageCredit}` : "画像: 生成アバター"}
          </p>
        </div>
        <div>
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                Team {teamSide} / {roleLabel}
              </p>
              <h2 className="text-2xl font-bold">{player.name}</h2>
              <p className="mt-1 text-sm text-slate-600">
                現在の起用: {team.name} / 能力基準: {player.dataSeason ?? BASEBALL_DATA_SEASON}年 {player.sourceTeam}
              </p>
            </div>
            <div className="flex flex-col gap-2 md:items-end">
              {activeStint && (
                <div className="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700">
                  {activeStint.statLine}
                </div>
              )}
              {player.sourceUrl && (
                <a
                  href={player.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold text-emerald-700 hover:text-emerald-900"
                >
                  成績ソースを見る
                </a>
              )}
              {player.profileUrl && (
                <a
                  href={player.profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold text-emerald-700 hover:text-emerald-900"
                >
                  Wikipediaで見る
                </a>
              )}
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {isPitcher(player) ? (
              <>
                <RatingBar label="制球 control" value={player.control} />
                <RatingBar label="球威 stuff" value={player.stuff} />
                <RatingBar label="スタミナ stamina" value={player.stamina} />
              </>
            ) : (
              <>
                <RatingBar label="ミート contact" value={player.contact} />
                <RatingBar label="長打力 power" value={player.power} />
                <RatingBar label="守備 fielding" value={player.fielding} />
              </>
            )}
          </div>

          {player.teamHistory && player.teamHistory.length > 0 && (
            <div className="mt-5 overflow-x-auto">
              <h3 className="font-semibold">所属履歴と能力の基準</h3>
              <table className="mt-2 min-w-[620px] w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-2 pr-3">年代</th>
                    <th className="py-2 pr-3">所属チーム</th>
                    <th className="py-2 pr-3">出場</th>
                    <th className="py-2 pr-3">成績メモ</th>
                    <th className="py-2">変換</th>
                  </tr>
                </thead>
                <tbody>
                  {player.teamHistory.map((stint, index) => (
                    <tr key={`${stint.teamName}-${stint.era}-${index}`} className="border-b border-slate-100">
                      <td className="py-2 pr-3">{stint.era}</td>
                      <td className="py-2 pr-3 font-medium">{stint.teamName}</td>
                      <td className="py-2 pr-3">{stint.games}</td>
                      <td className="py-2 pr-3">{stint.statLine}</td>
                      <td className="py-2 text-slate-600">{stint.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function GameFlowPanel({ match }: { match?: MatchResult }) {
  if (!match) return null;

  const scoringLog = match.log?.filter((entry) => entry.runsScored > 0) ?? [];

  return (
    <div className="mt-5 grid gap-4 xl:grid-cols-[420px_1fr]">
      {match.lineScore && (
        <div>
          <h3 className="font-semibold">イニング別スコア</h3>
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
        <h3 className="font-semibold">試合展開</h3>
        <div className="mt-2 max-h-72 overflow-y-auto rounded-md border border-slate-200">
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
                className="border-b border-slate-100 px-3 py-2 text-sm last:border-b-0"
              >
                {entry.description}
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

function RoadmapPanel() {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-panel">
      <h2 className="text-xl font-bold">長期ロードマップ</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-md border border-slate-200 p-3">
          <h3 className="font-semibold">詳細能力</h3>
          <p className="mt-1 text-sm text-slate-600">
            打撃、走塁、守備、肩、制球、球威、変化球、スタミナなどへ段階的に分解します。
          </p>
        </div>
        <div className="rounded-md border border-slate-200 p-3">
          <h3 className="font-semibold">実シーズン校正</h3>
          <p className="mt-1 text-sm text-slate-600">
            現在は選手成績から能力を暫定変換。次は得点、失点、勝率、打率、本塁打、防御率が実シーズンに近づくように係数を調整します。
          </p>
        </div>
        <div className="rounded-md border border-slate-200 p-3">
          <h3 className="font-semibold">検証方法</h3>
          <p className="mt-1 text-sm text-slate-600">
            同じカードを多数回シミュレーションし、実成績との差分が小さくなるように係数をチューニングします。
          </p>
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
        <GameFlowPanel match={result.sampleMatch} />
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
      <GameFlowPanel match={result} />
      {result.log && result.log.length > 0 && (
        <div className="mt-5">
          <h3 className="font-semibold">打席ログ</h3>
          <div className="mt-2 max-h-72 overflow-y-auto rounded-md border border-slate-200">
            {result.log.slice(-40).map((entry, index) => (
              <div
                key={`${entry.inning}-${entry.half}-${index}`}
                className="grid grid-cols-[70px_1fr_54px_70px_120px] gap-2 border-b border-slate-100 px-3 py-2 text-sm last:border-b-0"
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
                <span className="text-right text-slate-500">
                  hit {(entry.hitProbability * 100).toFixed(0)}% / 疲労 {entry.pitcherFatigue}
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
    sourceTeam: defaultTeamA
  });
  const [filtersB, setFiltersB] = useState<TeamFilters>({
    era: "2020s",
    sourceTeam: defaultTeamB
  });
  const [response, setResponse] = useState<SimulationResponse | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<SelectedPlayer | null>(null);
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
        <AbilityGuide />
        <ResultPanel response={response} />
        <PlayerDetailPanel selection={selectedPlayer} />
        <div className="grid gap-5 xl:grid-cols-2">
          <TeamEditor
            label="Team A"
            teamSide="A"
            team={teamA}
            filters={filtersA}
            onTeamChange={setTeamA}
            onFiltersChange={setFiltersA}
            onPlayerSelect={setSelectedPlayer}
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
            teamSide="B"
            team={teamB}
            filters={filtersB}
            onTeamChange={setTeamB}
            onFiltersChange={setFiltersB}
            onPlayerSelect={setSelectedPlayer}
            onRandomize={() => {
              try {
                randomizeTeam("B");
              } catch (caught) {
                setError(caught instanceof Error ? caught.message : "Random team failed.");
              }
            }}
          />
        </div>
        <RoadmapPanel />
      </div>
    </main>
  );
}
