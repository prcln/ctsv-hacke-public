import React, { useMemo } from 'react';
import type { Category } from '../types/criteria.types';
import { getCriteriaStats } from '../helpers/criteriaHelpers';

interface SidebarProps {
  username: string;
  setUsername: (username: string) => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onGetActivities: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onRefreshActivities: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onMissingCriteriaActivities: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onGetCriteria: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isLoading: boolean;
  activitiesCount: number;
  criteriaData: Category[];
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export default function Sidebar({
  username,
  setUsername,
  currentTab,
  setCurrentTab,
  onGetActivities,
  onRefreshActivities,
  onMissingCriteriaActivities,
  onGetCriteria,
  isLoading,
  activitiesCount,
  criteriaData,
  isMobileOpen,
  setIsMobileOpen,
}: SidebarProps) {
  // Pre-calculate mini DRL metrics for sidebar footer widget
  const drlStats = useMemo(() => {
    return getCriteriaStats(criteriaData);
  }, [criteriaData]);

  const handleNavClick = (tab: string, e?: React.MouseEvent) => {
    setCurrentTab(tab);
    setIsMobileOpen(false);
    if (tab === 'criteria' && criteriaData.length === 0 && e) {
      onGetCriteria(e as unknown as React.MouseEvent<HTMLButtonElement>);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Drawer / Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-76 sm:w-80 bg-white border-r border-gray-200/90 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:shrink-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top Scrollable Area */}
        <div className="overflow-y-auto px-5 py-6 space-y-6">
          {/* 1. Brand Logo & Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-black text-lg shadow-md shadow-red-500/20">
                H
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base font-black text-gray-900 tracking-tight leading-none">
                    CTSV HUST
                  </h1>
                  <span className="text-[10px] font-black text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200/60 uppercase">
                    Portal
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-gray-500 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Kỳ học: <strong>2026-1</strong></span>
                </div>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 lg:hidden"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 2. Student ID Input & Action */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Mã số sinh viên (MSSV)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="VD: 2024xxxx"
                className="w-full pl-9 pr-8 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
              />
              {username && (
                <button
                  type="button"
                  onClick={() => setUsername('')}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Primary Action Button */}
            <button
              type="button"
              disabled={!username.trim() || isLoading}
              onClick={onGetActivities}
              className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 active:scale-98 text-white font-bold text-xs rounded-xl transition-all shadow-sm shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Đang tải...
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Tải hoạt động
                </>
              )}
            </button>
          </div>

          {/* 3. Navigation View Menu */}
          <div className="space-y-1.5 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block px-1">
              Chế độ xem
            </span>

            {/* Nav Item: Activities */}
            <button
              type="button"
              onClick={() => handleNavClick('activities')}
              className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                currentTab === 'activities'
                  ? 'bg-red-50/80 text-red-700 border border-red-200/90 shadow-2xs font-bold'
                  : 'text-gray-600 hover:bg-gray-50 border border-transparent font-medium'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  currentTab === 'activities' ? 'bg-red-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600'
                }`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs leading-snug">Sự kiện & Hoạt động</div>
                  <div className="text-[10px] text-gray-400 font-normal">Khám phá & Đăng ký</div>
                </div>
              </div>
              {activitiesCount > 0 && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  currentTab === 'activities' ? 'bg-red-200/60 text-red-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {activitiesCount}
                </span>
              )}
            </button>

            {/* Nav Item: DRL Criteria */}
            <button
              type="button"
              onClick={(e) => handleNavClick('criteria', e)}
              className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                currentTab === 'criteria'
                  ? 'bg-red-50/80 text-red-700 border border-red-200/90 shadow-2xs font-bold'
                  : 'text-gray-600 hover:bg-gray-50 border border-transparent font-medium'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  currentTab === 'criteria' ? 'bg-red-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600'
                }`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs leading-snug">Điểm Rèn Luyện</div>
                  <div className="text-[10px] text-gray-400 font-normal">5 Tiêu chí & Phân loại</div>
                </div>
              </div>
              {criteriaData.length > 0 && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  currentTab === 'criteria' ? 'bg-red-200/60 text-red-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {drlStats.totalScore}/100
                </span>
              )}
            </button>
          </div>

          {/* 4. Quick Actions */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block px-1">
              Thao tác nhanh
            </span>

            {/* Refresh from CTSV */}
            <button
              type="button"
              disabled={!username.trim() || isLoading}
              onClick={onRefreshActivities}
              className="w-full p-2.5 bg-gray-50 hover:bg-gray-100 active:scale-98 rounded-xl border border-gray-200/80 text-gray-700 text-xs font-semibold transition flex items-center gap-2.5 disabled:opacity-40"
              title="Đồng bộ danh sách sự kiện mới nhất từ máy chủ CTSV"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Đồng bộ từ CTSV</span>
            </button>

            {/* Missing criteria events filter */}
            <button
              type="button"
              disabled={!username.trim() || isLoading}
              onClick={(e) => {
                onMissingCriteriaActivities(e);
                setCurrentTab('activities');
                setIsMobileOpen(false);
              }}
              className="w-full p-2.5 bg-amber-50 hover:bg-amber-100 active:scale-98 rounded-xl border border-amber-200 text-amber-900 text-xs font-semibold transition flex items-center justify-between disabled:opacity-40 shadow-2xs"
              title="Lọc các sự kiện giúp bù điểm tiêu chí còn 0"
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Lọc sự kiện bù điểm</span>
              </div>
              <span className="text-[10px] font-bold bg-amber-200/70 text-amber-900 px-1.5 py-0.5 rounded">
                Cần bù
              </span>
            </button>
          </div>
        </div>

        {/* 5. Footer Quick DRL Summary Widget */}
        <div className="p-4 border-t border-gray-200/80 bg-gray-50/60">
          {criteriaData.length > 0 ? (
            <div
              onClick={() => handleNavClick('criteria')}
              className="p-3 bg-white rounded-2xl border border-gray-200 hover:border-red-300 transition-all cursor-pointer shadow-2xs group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Khung ĐRL Hiện Tại
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${drlStats.classification.badgeClass}`}>
                  {drlStats.classification.tier}
                </span>
              </div>

              <div className="flex items-baseline justify-between mb-1.5">
                <div className="text-xl font-black text-gray-900">
                  {drlStats.totalScore}
                  <span className="text-xs font-semibold text-gray-400 ml-1">
                    / {drlStats.maxScore} đ
                  </span>
                </div>
                <span className="text-[10px] font-bold text-red-600 group-hover:underline">
                  Xem chi tiết →
                </span>
              </div>

              {/* Mini progress bar */}
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${drlStats.percentage}%`,
                    backgroundColor: drlStats.classification.colorHex,
                  }}
                />
              </div>

              {drlStats.classification.pointsToNextTier > 0 && (
                <p className="text-[10px] text-gray-500 mt-2 font-medium">
                  Thiếu <strong className="text-gray-700">+{drlStats.classification.pointsToNextTier}đ</strong> lên loại {drlStats.classification.nextTierName}
                </p>
              )}
            </div>
          ) : (
            <button
              onClick={onGetCriteria}
              className="w-full py-2.5 px-3 bg-white hover:bg-gray-100 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-700 transition flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Xem điểm rèn luyện</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

