/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { UserProfile } from '../types';
import { Gift, Clock, CheckCircle, AlertTriangle, Sparkles, Users } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface LeaderboardModuleProps {
  currentUser: UserProfile;
  /** Firebase Realtime Database'dan real vaqtda kelayotgan barcha ro'yxatdan o'tgan foydalanuvchilar */
  usersList: UserProfile[];
}

interface RankedEntry {
  user: UserProfile;
  points: number;
  minutes: number;
  rank: number;
}

const computePoints = (u: UserProfile) => Math.round((u.bestIq || u.iqScore || 0) * 0.45);
const computeMinutes = (u: UserProfile) => Math.floor((u.weeklyTimeSpentSeconds || 0) / 60);

export const LeaderboardModule: React.FC<LeaderboardModuleProps> = ({ currentUser, usersList }) => {
  const [timeFilter, setTimeFilter] = useState<'weekly' | 'daily' | 'all'>('weekly');
  const [scopeFilter, setScopeFilter] = useState<'top10' | 'top50'>('top10');

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <span className="text-xl">🥇</span>;
    if (rank === 2) return <span className="text-xl">🥈</span>;
    if (rank === 3) return <span className="text-xl">🥉</span>;
    return <span className="font-mono text-xs font-bold text-slate-400">#{rank}</span>;
  };

  const getUnvonBadge = (iqScore: number) => {
    if (iqScore >= 120) {
      return { title: 'Daho', icon: '👑', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/40' };
    }
    if (iqScore >= 100) {
      return { title: 'Mantiq Ustasi', icon: '⚡', color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/40' };
    }
    return { title: 'Izlanuvchi', icon: '🎯', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/40' };
  };

  // Firebase'dan kelgan haqiqiy foydalanuvchilar + joriy foydalanuvchi (eng yangi holati bilan),
  // bloklangan (isBanned) foydalanuvchilar reytingdan chiqarib tashlanadi. Hech qanday soxta ma'lumot yo'q.
  const rankedUsers: RankedEntry[] = useMemo(() => {
    const byId = new Map<string, UserProfile>();
    (usersList || []).forEach((u) => {
      if (u && u.id) byId.set(u.id, u);
    });
    // Joriy foydalanuvchining eng so'nggi (mahalliy) holatini har doim ustun qo'yamiz,
    // chunki Firebase'dagi ma'lumot bir zumga eskirgan bo'lishi mumkin.
    if (currentUser?.id) byId.set(currentUser.id, currentUser);

    const activeUsers = Array.from(byId.values()).filter((u) => !u.isBanned);

    return activeUsers
      .map((u) => ({ user: u, points: computePoints(u), minutes: computeMinutes(u) }))
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.user.duelRating !== a.user.duelRating) return b.user.duelRating - a.user.duelRating;
        return (b.user.bestIq || 0) - (a.user.bestIq || 0);
      })
      .map((entry, idx) => ({ ...entry, rank: idx + 1 }));
  }, [usersList, currentUser]);

  const currentEntry = rankedUsers.find((r) => r.user.id === currentUser.id);
  const currentUserRank = currentEntry?.rank ?? rankedUsers.length + 1;
  const userIq = currentUser.bestIq || currentUser.iqScore || 0;
  const userPoints = currentEntry?.points ?? computePoints(currentUser);
  const userMinutes = currentEntry?.minutes ?? computeMinutes(currentUser);

  const hasMetPoints = userPoints >= 40;
  const hasMetTime = userMinutes >= 5;
  const isEligible = hasMetPoints && hasMetTime;

  const visibleList = rankedUsers.slice(0, scopeFilter === 'top10' ? 10 : 50);
  const totalPlayers = rankedUsers.length;

  return (
    <div className="w-full max-w-xl mx-auto p-4 space-y-4 animate-fade-in">
      {/* Top Banner with Weekly Prizes */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-amber-400/40 shadow-2xl text-center relative overflow-hidden">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-400/15 border border-amber-400 flex items-center justify-center text-amber-400 mb-2">
          <Gift className="w-6 h-6 animate-pulse" />
        </div>

        <h2 className="text-xl font-display font-bold text-white tracking-wide">
          HAFTALIK TOP-3 SOVG'ALARI
        </h2>
        <p className="text-xs text-amber-300 font-mono mt-0.5">
          Har yakshanba Telegram Stars va sovg'alar yuboriladi
        </p>

        {/* 3 Prize Podiums */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-700/80">
            <div className="text-2xl">🥈</div>
            <div className="text-xs font-bold text-slate-200">2-O'rin</div>
            <div className="text-xs font-mono font-bold text-cyan-400 mt-1">10 Stars</div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-400/60 scale-105 shadow-lg shadow-amber-400/10">
            <div className="text-3xl">🥇</div>
            <div className="text-xs font-bold text-amber-300">1-O'rin</div>
            <div className="text-xs font-mono font-extrabold text-amber-400 mt-1">15 Stars / Gift</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-700/80">
            <div className="text-2xl">🥉</div>
            <div className="text-xs font-bold text-slate-200">3-O'rin</div>
            <div className="text-xs font-mono font-bold text-purple-400 mt-1">5 Stars</div>
          </div>
        </div>

        {/* Mandatory Qualification Criteria */}
        <div className="mt-4 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-1.5 text-xs">
          <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Sovg'a Olish Shartlari (Majburiy):</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div className="flex items-center gap-1.5">
              {hasMetPoints ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span className="text-slate-300">
                Min. 40+ ochko: <strong className="font-mono text-cyan-300">{userPoints} ball</strong>
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {hasMetTime ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span className="text-slate-300">
                Min. 5 minut faollik: <strong className="font-mono text-cyan-300">{userMinutes} min</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Filter & Scope Tabs */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          {/* Time Filter */}
          <div className="inline-flex p-1 bg-slate-950 rounded-xl border border-slate-800">
            {[
              { id: 'weekly', label: 'Haftalik' },
              { id: 'daily', label: 'Kunlik' },
              { id: 'all', label: 'Barchasi' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  soundManager.playCyberClick();
                  setTimeFilter(tab.id as any);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  timeFilter === tab.id
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TOP 10 vs TOP 50 Switcher */}
          <div className="inline-flex p-1 bg-slate-950 rounded-xl border border-cyan-500/30">
            {[
              { id: 'top10', label: 'TOP 10' },
              { id: 'top50', label: 'TOP 50 (Barchasi)' },
            ].map((scope) => (
              <button
                key={scope.id}
                onClick={() => {
                  soundManager.playCyberClick();
                  setScopeFilter(scope.id as any);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  scopeFilter === scope.id
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                    : 'text-slate-400 hover:text-cyan-300'
                }`}
              >
                {scope.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* User's Own Rank Card */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/70 to-blue-950/70 border border-cyan-400/50 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-400/20 border border-cyan-400 flex items-center justify-center font-mono font-bold text-cyan-300 text-xs">
            #{currentUserRank}
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xl">{currentUser.avatar}</div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{currentUser.name}</span>
                <span className="text-[10px] text-cyan-400 font-mono">(Siz)</span>
                {userIq > 0 && (
                  <span className={`text-[10px] px-2 py-0.2 rounded-full border ${getUnvonBadge(userIq).border} ${getUnvonBadge(userIq).bg} ${getUnvonBadge(userIq).color} font-bold`}>
                    {getUnvonBadge(userIq).icon} {getUnvonBadge(userIq).title}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400">
                Vaqt: {userMinutes} min · Ochko: {userPoints}
              </div>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-bold font-mono text-amber-400">
            {isEligible ? 'Sovg\'aga Da\'vogar ✅' : 'Kvalifikatsiya kutilmoqda'}
          </div>
          <div className="text-[10px] text-slate-400">{userIq > 0 ? `${userIq} IQ` : 'Test topshiring'}</div>
        </div>
      </div>

      {/* Leaderboard List Header */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-400 font-mono">
        <span className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          O'yinchilar: {totalPlayers} ta ro'yxatdan o'tgan
        </span>
        <span>Haftalik Ochko / Reyting</span>
      </div>

      {/* Leaderboard List */}
      {visibleList.length === 0 ? (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 text-center space-y-2">
          <div className="text-3xl">🏁</div>
          <div className="text-sm font-bold text-white">Hali reyting bo'sh</div>
          <p className="text-xs text-slate-400">
            Ro'yxatdan o'tgan birinchi o'yinchi bo'ling — IQ test topshiring va reytingda TOP o'ringa chiqing!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {visibleList.map(({ user: leader, points, minutes, rank }) => {
            const leaderIq = leader.bestIq || leader.iqScore || 0;
            const badge = getUnvonBadge(leaderIq);
            const isSelf = leader.id === currentUser.id;
            return (
              <div
                key={leader.id}
                className={`p-3 rounded-2xl bg-slate-900/80 border transition-all flex items-center justify-between hover:border-cyan-500/40 ${
                  rank <= 3
                    ? 'border-amber-400/40 shadow-md shadow-amber-400/5 bg-slate-900'
                    : isSelf
                    ? 'border-cyan-400/50'
                    : 'border-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 flex items-center justify-center">
                    {getRankBadge(rank)}
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center text-lg">
                    {leader.avatar || '🧠'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{leader.name}</span>
                      {isSelf && <span className="text-[10px] text-cyan-400 font-mono">(Siz)</span>}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${badge.border} ${badge.bg} ${badge.color} font-semibold font-mono`}>
                        {badge.icon} {badge.title}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono mt-0.5">
                      <span className="text-cyan-400">{leaderIq} IQ</span>
                      <span>·</span>
                      <span>{minutes} min faol</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold font-display text-amber-400">
                    {points} <span className="text-[10px] font-normal text-slate-400">ochko</span>
                  </div>
                  <div className="text-[10px] text-cyan-300 font-mono">
                    {rank === 1 ? '🎁 15 Stars' : rank === 2 ? '⭐ 10 Stars' : rank === 3 ? '⭐ 5 Stars' : `#${rank}`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
