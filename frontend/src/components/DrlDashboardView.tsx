import { useState, useMemo } from 'react';
import type { Category } from '../types/criteria.types';
import { getCriteriaStats } from '../helpers/criteriaHelpers';

interface DrlDashboardViewProps {
  criteria: Category[];
  onNavigateToMissingActivities: () => void;
  onRefreshCriteria: () => void;
  isLoading?: boolean;
}

export default function DrlDashboardView({
  criteria,
  onNavigateToMissingActivities,
  onRefreshCriteria,
  isLoading = false,
}: DrlDashboardViewProps) {
  // Filters & Accordion States
  const [activePillarFilter, setActivePillarFilter] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'zero' | 'earned'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
  });
  const [expandedActivities, setExpandedActivities] = useState<Record<number, boolean>>({});

  // 1. Calculate All Stats in One Pass
  const stats = useMemo(() => {
    return getCriteriaStats(criteria);
  }, [criteria]);

  // Gauge calculation
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stats.percentage / 100) * circumference;

  const toggleCategory = (id: number) => {
    setExpandedCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAllCategories = (expand: boolean) => {
    const nextState: Record<number, boolean> = {};
    criteria.forEach((cat) => {
      nextState[cat.CTId] = expand;
    });
    setExpandedCategories(nextState);
  };

  const toggleActivityProof = (cId: number) => {
    setExpandedActivities((prev) => ({ ...prev, [cId]: !prev[cId] }));
  };

  // Filter Categories & Criteria Rules
  const filteredCategories = useMemo(() => {
    return criteria
      .filter((cat) => {
        if (activePillarFilter !== null && cat.CTId !== activePillarFilter) {
          return false;
        }
        return true;
      })
      .map((cat) => {
        const filteredGroups = cat.CriteriaGroupDetailsLst.map((grp) => {
          const filteredRules = grp.UserCriteriaDetailsLst.filter((rule) => {
            // Type filter
            if (filterType === 'zero' && rule.UCPoint > 0) return false;
            if (filterType === 'earned' && rule.UCPoint === 0) return false;

            // Search filter
            if (searchQuery.trim()) {
              const q = searchQuery.toLowerCase();
              const matchName = rule.CName?.toLowerCase().includes(q);
              const matchId = String(rule.CId).includes(q);
              const matchGroup = grp.CGName?.toLowerCase().includes(q);
              return matchName || matchId || matchGroup;
            }

            return true;
          });

          return { ...grp, UserCriteriaDetailsLst: filteredRules };
        }).filter((grp) => grp.UserCriteriaDetailsLst.length > 0);

        return { ...cat, CriteriaGroupDetailsLst: filteredGroups };
      })
      .filter((cat) => cat.CriteriaGroupDetailsLst.length > 0);
  }, [criteria, activePillarFilter, filterType, searchQuery]);

  if (criteria.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-gray-200/80 p-12 text-center shadow-xs">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Chưa có dữ liệu điểm rèn luyện</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
          Nhấn nút bên dưới để tải bảng điểm rèn luyện mới nhất từ cổng CTSV cho sinh viên.
        </p>
        <button
          onClick={onRefreshCriteria}
          disabled={isLoading}
          className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 inline-flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Đang tải...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Tải bảng điểm rèn luyện
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* =========================================================================
          SECTION 1: 5-SECOND HERO DASHBOARD (GRASP ALL INFO IN 5 SECONDS)
         ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* HERO CARD 1: OVERALL SCORE & RADIAL GAUGE (Col 1-5) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
                Tổng Điểm Rèn Luyện
              </span>
              <h2 className="text-lg font-black text-gray-900 tracking-tight">
                Học kỳ 2026-1
              </h2>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-black border uppercase tracking-wider ${stats.classification.badgeClass}`}>
              {stats.classification.tier}
            </span>
          </div>

          <div className="flex items-center gap-6 my-2">
            {/* SVG Circular Progress Gauge */}
            <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                {/* Background Ring */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  stroke="#f1f5f9"
                  strokeWidth="11"
                  fill="transparent"
                />
                {/* Dynamic Value Ring */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  stroke={stats.classification.colorHex}
                  strokeWidth="11"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              {/* Score in center */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black text-gray-900 leading-none tracking-tight">
                  {stats.totalScore}
                </span>
                <span className="text-[11px] font-bold text-gray-400 mt-0.5">
                  / {stats.maxScore} đ
                </span>
              </div>
            </div>

            {/* Score Meta Details */}
            <div className="flex-1 space-y-2">
              <div className="text-xs text-gray-500 font-medium">
                {stats.classification.subText}
              </div>

              {stats.classification.pointsToNextTier > 0 ? (
                <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-200/80 text-xs">
                  <div className="font-semibold text-amber-900">
                    Mục tiêu kế tiếp: <strong className="text-amber-800">{stats.classification.nextTierName}</strong>
                  </div>
                  <div className="text-amber-700 text-[11px] mt-0.5">
                    Cần thêm <strong className="font-bold">+{stats.classification.pointsToNextTier} điểm</strong> để đạt mốc {stats.classification.targetScore}đ.
                  </div>
                </div>
              ) : (
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-800">
                  🎉 Bạn đã đạt mức điểm tối đa hoặc xếp loại cao nhất!
                </div>
              )}
            </div>
          </div>

          {/* Linear Milestone Indicator (0 - 50 - 65 - 80 - 90 - 100) */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1">
              <span>0</span>
              <span className="text-orange-500">50 TB</span>
              <span className="text-amber-600">65 Khá</span>
              <span className="text-blue-600">80 Tốt</span>
              <span className="text-emerald-600">90 XS</span>
              <span>100</span>
            </div>
            <div className="relative w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${Math.min(100, stats.percentage)}%`,
                  backgroundColor: stats.classification.colorHex,
                }}
              />
            </div>
          </div>
        </div>

        {/* HERO CARD 2: ACTIONABLE CRITERIA GAP & STAT TILES (Col 6-12) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Stat Tile A: Zero Points Criteria */}
          <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
                Cần bù điểm
              </span>
              <div className="w-8 h-8 rounded-xl bg-red-100/70 text-red-600 flex items-center justify-center font-bold">
                ⚠️
              </div>
            </div>
            <div className="my-3">
              <div className="text-3xl font-black text-gray-900 tracking-tight">
                {stats.zeroRulesCount}
                <span className="text-sm font-medium text-gray-400 ml-1.5">
                  / {stats.totalRulesCount} tiêu chí
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                Chưa có điểm rèn luyện (0.0 điểm). Cần đăng ký tham gia sự kiện tương ứng.
              </p>
            </div>
            <button
              onClick={onNavigateToMissingActivities}
              className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-all shadow-xs active:scale-95 flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Lọc sự kiện bù điểm ngay
            </button>
          </div>

          {/* Stat Tile B: Fulfilled Criteria & Proof Activities */}
          <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Đã ghi nhận
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                ✓
              </div>
            </div>
            <div className="my-3">
              <div className="text-3xl font-black text-gray-900 tracking-tight">
                {stats.earnedRulesCount}
                <span className="text-sm font-medium text-gray-400 ml-1.5">
                  / {stats.totalRulesCount} tiêu chí
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                Ghi nhận từ <strong>{stats.totalLinkedActivities}</strong> hoạt động đã hoàn thành trong kỳ.
              </p>
            </div>
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
              <span className="font-semibold">Điểm còn thiếu:</span>
              <span className="font-black text-red-600">
                +{(stats.maxScore - stats.totalScore).toFixed(1)} đ
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: 5 PILLARS VISUAL PROGRESS BARS (5 TIÊU CHÍ CỐT LÕI)
         ========================================================================= */}
      <section className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-base font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
              Tiến Độ 5 Khung Tiêu Chí Cốt Lõi
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Nhấp vào tiêu chí bất kỳ để lọc danh sách chi tiết bên dưới
            </p>
          </div>
          {activePillarFilter !== null && (
            <button
              onClick={() => setActivePillarFilter(null)}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition"
            >
              ✕ Hiển thị cả 5 tiêu chí
            </button>
          )}
        </div>

        {/* 5 Pillars Horizontal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {stats.categorySummaries.map((cat) => {
            const isSelected = activePillarFilter === cat.id;
            return (
              <div
                key={cat.id}
                onClick={() =>
                  setActivePillarFilter(isSelected ? null : cat.id)
                }
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-red-500 bg-red-50/40 shadow-sm ring-2 ring-red-500/20'
                    : 'border-gray-200/80 hover:border-gray-300 bg-gray-50/50 hover:bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-6 h-6 rounded-lg bg-gray-200 text-gray-800 text-[11px] font-black flex items-center justify-center">
                      {cat.romanId}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      cat.isMaxed
                        ? 'bg-emerald-100 text-emerald-800'
                        : cat.percentage >= 60
                        ? 'bg-blue-100 text-blue-800'
                        : cat.percentage > 0
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {cat.percentage}%
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-gray-800 line-clamp-2 min-h-[32px] leading-snug">
                    {cat.name}
                  </h4>
                </div>

                <div className="mt-3 pt-2">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-sm font-black text-gray-900">
                      {cat.points} <span className="text-xs text-gray-400 font-normal">/ {cat.maxPoints}đ</span>
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {cat.isMaxed ? 'Đạt tối đa' : `Thiếu ${cat.gap}đ`}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        cat.percentage >= 80
                          ? 'bg-emerald-500'
                          : cat.percentage >= 40
                          ? 'bg-blue-500'
                          : cat.percentage > 0
                          ? 'bg-amber-500'
                          : 'bg-red-400'
                      }`}
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: DETAILED CRITERIA EXPLORER & ACTIVITY PROOFS
         ========================================================================= */}
      <section className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-5">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-black text-gray-900 tracking-tight">
              Chi Tiết Từng Tiêu Chí Đánh Giá
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Kiểm tra điểm từng mục và danh sách hoạt động minh chứng
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleAllCategories(true)}
              className="text-xs font-semibold text-gray-600 hover:text-gray-900 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
            >
              Mở rộng tất cả
            </button>
            <button
              onClick={() => toggleAllCategories(false)}
              className="text-xs font-semibold text-gray-600 hover:text-gray-900 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
            >
              Thu gọn tất cả
            </button>
          </div>
        </div>

        {/* Filter Toolbar (Search & Filter Tabs) */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl border border-gray-200/70">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filterType === 'all'
                  ? 'bg-white text-gray-900 shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tất cả ({stats.totalRulesCount})
            </button>
            <button
              onClick={() => setFilterType('zero')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                filterType === 'zero'
                  ? 'bg-red-500 text-white shadow-2xs'
                  : 'text-gray-600 hover:text-red-700'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-300" />
              Chưa có điểm ({stats.zeroRulesCount})
            </button>
            <button
              onClick={() => setFilterType('earned')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                filterType === 'earned'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-gray-600 hover:text-emerald-700'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
              Đã có điểm ({stats.earnedRulesCount})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Tìm tiêu chí (VD: NCKH, hiến máu...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
            />
          </div>
        </div>

        {/* Tree Accordions */}
        <div className="space-y-4 pt-2">
          {filteredCategories.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-500 text-xs">
              Không tìm thấy tiêu chí nào phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
            filteredCategories.map((category) => {
              const isExpanded = expandedCategories[category.CTId] ?? true;
              const catPercent = category.CTMaxPoint > 0 
                ? Math.round((category.CTPoint / category.CTMaxPoint) * 100) 
                : 0;

              return (
                <div
                  key={category.CTId}
                  className="rounded-2xl border border-gray-200/80 overflow-hidden bg-white shadow-2xs"
                >
                  {/* Category Header */}
                  <button
                    type="button"
                    onClick={() => toggleCategory(category.CTId)}
                    className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50/80 hover:bg-gray-100/80 transition-colors gap-3 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white border border-gray-200 font-black text-xs text-gray-800 flex items-center justify-center shrink-0 shadow-2xs">
                        #{category.CTId}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-gray-900 leading-tight">
                          {category.CTName}
                        </h4>
                        <span className="text-[11px] text-gray-500 font-medium">
                          {category.CriteriaGroupDetailsLst.length} nhóm tiêu chí con
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                      <div className="text-right">
                        <span className="text-xs font-black text-gray-900">
                          {category.CTPoint} / {category.CTMaxPoint} đ
                        </span>
                        <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-red-600 rounded-full"
                            style={{ width: `${Math.min(100, catPercent)}%` }}
                          />
                        </div>
                      </div>

                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : 'rotate-0'
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* Level 2 Groups & Level 3 Rules */}
                  {isExpanded && (
                    <div className="p-4 space-y-4 bg-white divide-y divide-gray-100">
                      {category.CriteriaGroupDetailsLst.map((group) => (
                        <div key={group.CGId} className="pt-3 first:pt-0">
                          {/* Group Sub-Header */}
                          <div className="flex items-center justify-between py-1.5 mb-2">
                            <h5 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                              {group.CGName}
                            </h5>
                            <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                              {group.CGPoint} / {group.CGMaxPoint} đ
                            </span>
                          </div>

                          {/* Level 3 Criteria Rules List */}
                          <div className="space-y-2 pl-2 sm:pl-3">
                            {group.UserCriteriaDetailsLst.map((rule) => {
                              const hasProof = rule.UserCriteriaActivityLst && rule.UserCriteriaActivityLst.length > 0;
                              const isProofOpen = expandedActivities[rule.CId] ?? false;

                              return (
                                <div
                                  key={rule.CId}
                                  className={`p-3 rounded-xl border transition-all text-xs ${
                                    rule.UCPoint > 0
                                      ? 'bg-emerald-50/30 border-emerald-200/70'
                                      : 'bg-white border-gray-200/70 hover:border-gray-300'
                                  }`}
                                >
                                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                          #{rule.CId}
                                        </span>
                                        <p className="font-semibold text-gray-800 leading-snug">
                                          {rule.CName}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Score pill & Proof toggle */}
                                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                      {hasProof && (
                                        <button
                                          type="button"
                                          onClick={() => toggleActivityProof(rule.CId)}
                                          className="text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-1 rounded-lg transition flex items-center gap-1"
                                        >
                                          <span>{rule.UserCriteriaActivityLst.length} minh chứng</span>
                                          <svg
                                            className={`w-3 h-3 transition-transform ${
                                              isProofOpen ? 'rotate-180' : ''
                                            }`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                          </svg>
                                        </button>
                                      )}

                                      <span
                                        className={`px-2.5 py-1 rounded-lg font-black text-xs ${
                                          rule.UCPoint > 0
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : 'bg-gray-100 text-gray-500'
                                        }`}
                                      >
                                        {rule.UCPoint} / {rule.CMaxPoint} đ
                                      </span>
                                    </div>
                                  </div>

                                  {/* Expandable Activity Proofs (Level 4) */}
                                  {hasProof && isProofOpen && (
                                    <div className="mt-3 pt-2.5 border-t border-emerald-200/50 space-y-2">
                                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                        Hoạt động ghi nhận điểm:
                                      </span>
                                      <div className="grid grid-cols-1 gap-2">
                                        {rule.UserCriteriaActivityLst.map((act) => (
                                          <div
                                            key={act.UCAId}
                                            className="p-2.5 bg-white rounded-lg border border-emerald-100 flex items-center justify-between text-[11px]"
                                          >
                                            <div className="flex items-center gap-2">
                                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                              <span className="font-semibold text-gray-800">
                                                {act.AName}
                                              </span>
                                            </div>
                                            <span className="text-gray-400 shrink-0">
                                              {act.StartTime?.slice(0, 10)}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

