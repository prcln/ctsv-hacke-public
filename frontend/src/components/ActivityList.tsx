import { useMemo, useState } from 'react';
import type { Activity, EventTimingFilter } from '../types/activity.types';
import type { Category } from '../types/criteria.types';
import ActivityCard from './Activity/ActivityCard';
import ActivityModal from './Activity/ActivityModal';
import { getEventTiming } from '../helpers/dateHelpers';
import {
  formatCriteriaName,
  getMissingCriteriaSet,
  doesActivityFulfillMissing,
} from '../helpers/criteriaHelpers';

interface ActivityListProps {
  activities: Activity[];
  criteriaList?: Category[];
  onParticipate: (AID: number) => void;
  participatingId?: number | null;
  onRefresh?: () => void;
  initialMissingOnly?: boolean;
}

const ITEMS_PER_PAGE = 8;

export default function ActivityList({
  activities,
  criteriaList = [],
  onParticipate,
  participatingId = null,
  onRefresh,
  initialMissingOnly = false,
}: ActivityListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  // Filters state
  const [timeFilter, setTimeFilter] = useState<EventTimingFilter>('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [missingOnlyFilter, setMissingOnlyFilter] = useState(initialMissingOnly);
  const [selectedCriteria, setSelectedCriteria] = useState<string>('all');

  // 1. Calculate missing criteria set from loaded criteria evaluation tree
  const missingCriteriaSet = useMemo(() => {
    return getMissingCriteriaSet(criteriaList);
  }, [criteriaList]);

  // 2. Count of activities that can fulfill student's missing (0đ) criteria
  const missingActivitiesCount = useMemo(() => {
    if (missingCriteriaSet.size === 0) return 0;
    return activities.filter((act) =>
      doesActivityFulfillMissing(act.criteriaLst, missingCriteriaSet)
    ).length;
  }, [activities, missingCriteriaSet]);

  // 3. Collect unique criteria present across all activities for the criteria dropdown
  const criteriaOptions = useMemo(() => {
    const map = new Map<string, { key: string; name: string; isMissing: boolean }>();

    activities.forEach((act) => {
      Object.keys(act.criteriaLst || {}).forEach((rawKey) => {
        const vietName = formatCriteriaName(rawKey);
        if (!map.has(vietName)) {
          const isMissing =
            missingCriteriaSet.has(vietName.toLowerCase()) ||
            missingCriteriaSet.has(rawKey.toLowerCase());
          map.set(vietName, { key: rawKey, name: vietName, isMissing });
        }
      });
    });

    return Array.from(map.values()).sort((a, b) => {
      // Missing criteria first, then alphabetical
      if (a.isMissing && !b.isMissing) return -1;
      if (!a.isMissing && b.isMissing) return 1;
      return a.name.localeCompare(b.name, 'vi');
    });
  }, [activities, missingCriteriaSet]);

  // 4. Calculate timing counts for tabs
  const timingCounts = useMemo(() => {
    let upcoming = 0;
    let ongoing = 0;
    let past = 0;

    for (const act of activities) {
      const timing = getEventTiming(act.startTime, act.finishTime);
      if (timing === 'upcoming') upcoming++;
      else if (timing === 'ongoing') ongoing++;
      else if (timing === 'past') past++;
    }

    return {
      all: activities.length,
      upcoming,
      ongoing,
      past,
    };
  }, [activities]);

  // 5. Main Filter & Search Pipeline (Includes Search Activities by Criteria)
  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const isFulfilling = doesActivityFulfillMissing(
        activity.criteriaLst,
        missingCriteriaSet
      );

      // A. Missing Criteria Toggle Filter
      if (missingOnlyFilter && !isFulfilling) {
        return false;
      }

      // B. Specific Criteria Dropdown Filter
      if (selectedCriteria !== 'all') {
        if (selectedCriteria === '__missing_only__') {
          if (!isFulfilling) return false;
        } else {
          const matchesCriterion = Object.keys(activity.criteriaLst || {}).some(
            (rawKey) => {
              const vietTitle = formatCriteriaName(rawKey);
              return (
                vietTitle === selectedCriteria ||
                rawKey === selectedCriteria ||
                vietTitle.toLowerCase() === selectedCriteria.toLowerCase()
              );
            }
          );
          if (!matchesCriterion) return false;
        }
      }

      // C. Timing Filter
      if (timeFilter !== 'all') {
        const timing = getEventTiming(activity.startTime, activity.finishTime);
        if (timing !== timeFilter) return false;
      }

      // D. User Registration Status Filter
      if (statusFilter !== 'all') {
        const uStatus = activity.userStatus ?? -1;
        if (statusFilter === '-1' && uStatus !== -1) return false;
        if (statusFilter === '1' && uStatus !== 1 && uStatus !== 0) return false;
        if (statusFilter === '2' && uStatus !== 2) return false;
      }

      // E. Search Query: Matches name, place, group, type, desc AND CRITERIA (Vietnamese + slug)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = activity.name?.toLowerCase().includes(q);
        const matchesPlace = activity.place?.toLowerCase().includes(q);
        const matchesGroup = activity.groupName?.toLowerCase().includes(q);
        const matchesType = String(activity.type || '').toLowerCase().includes(q);
        const matchesDesc = activity.desc?.toLowerCase().includes(q);

        // Search activities by criteria!
        const matchesCriteria = Object.entries(activity.criteriaLst || {}).some(
          ([rawKey, _pts]) => {
            const vietTitle = formatCriteriaName(rawKey).toLowerCase();
            const rawKeyLower = rawKey.toLowerCase();
            return vietTitle.includes(q) || rawKeyLower.includes(q);
          }
        );

        if (
          !matchesName &&
          !matchesPlace &&
          !matchesGroup &&
          !matchesType &&
          !matchesDesc &&
          !matchesCriteria
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    activities,
    missingOnlyFilter,
    selectedCriteria,
    timeFilter,
    statusFilter,
    searchQuery,
    missingCriteriaSet,
  ]);

  // 6. Pagination calculations
  const totalPages = Math.ceil(filteredActivities.length / ITEMS_PER_PAGE) || 1;
  const paginatedActivities = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredActivities.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredActivities, currentPage]);

  const handleTimeTabChange = (tab: EventTimingFilter) => {
    setTimeFilter(tab);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setTimeFilter('all');
    setStatusFilter('all');
    setSearchQuery('');
    setMissingOnlyFilter(false);
    setSelectedCriteria('all');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    timeFilter !== 'all' ||
    statusFilter !== 'all' ||
    searchQuery.trim() !== '' ||
    missingOnlyFilter ||
    selectedCriteria !== 'all';

  return (
    <>
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-xs space-y-6">
        {/* View Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
              Sự Kiện & Hoạt Động Ngoại Khóa
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">
              Tìm kiếm theo tiêu chí ĐRL, theo dõi thời hạn và đăng ký tích lũy điểm
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto text-xs font-semibold">
            {missingActivitiesCount > 0 && (
              <span className="bg-amber-50 text-amber-900 border border-amber-200/80 px-2.5 py-1 rounded-xl">
                🎯 <strong>{missingActivitiesCount}</strong> sự kiện bù điểm thiếu
              </span>
            )}
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-xl border border-gray-200/80">
              Tổng số: <strong className="text-gray-900">{activities.length}</strong> sự kiện
            </span>
          </div>
        </div>

        {/* 1. Timing Filter Tabs + Quick Missing Criteria Toggle */}
        <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
          {/* Timing Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-100 rounded-2xl border border-gray-200/70 flex-1">
            <button
              onClick={() => handleTimeTabChange('all')}
              className={`flex-1 min-w-[90px] py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                timeFilter === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              <span>Tất cả</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  timeFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {timingCounts.all}
              </span>
            </button>

            <button
              onClick={() => handleTimeTabChange('upcoming')}
              className={`flex-1 min-w-[110px] py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                timeFilter === 'upcoming'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-blue-700 hover:bg-gray-200/60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-300" />
              <span>Sắp diễn ra</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  timeFilter === 'upcoming' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
                }`}
              >
                {timingCounts.upcoming}
              </span>
            </button>

            <button
              onClick={() => handleTimeTabChange('ongoing')}
              className={`flex-1 min-w-[110px] py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                timeFilter === 'ongoing'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-200/60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              <span>Đang diễn ra</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  timeFilter === 'ongoing'
                    ? 'bg-white/20 text-white'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {timingCounts.ongoing}
              </span>
            </button>

            <button
              onClick={() => handleTimeTabChange('past')}
              className={`flex-1 min-w-[95px] py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                timeFilter === 'past'
                  ? 'bg-gray-700 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-gray-400" />
              <span>Đã qua</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  timeFilter === 'past' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {timingCounts.past}
              </span>
            </button>
          </div>

          {/* Missing Criteria Quick Filter Toggle Button */}
          <button
            onClick={() => {
              setMissingOnlyFilter(!missingOnlyFilter);
              setCurrentPage(1);
            }}
            className={`py-2 px-3.5 rounded-2xl text-xs font-bold transition-all border flex items-center justify-center gap-2 shrink-0 ${
              missingOnlyFilter
                ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                : 'bg-amber-50/70 text-amber-900 border-amber-200 hover:bg-amber-100'
            }`}
            title="Lọc chỉ hiển thị các hoạt động giúp bù điểm các tiêu chí sinh viên còn 0 điểm"
          >
            <span className="text-sm">🎯</span>
            <span>Chỉ bù điểm thiếu</span>
            {missingActivitiesCount > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  missingOnlyFilter ? 'bg-white/25 text-white' : 'bg-amber-200/80 text-amber-950 font-black'
                }`}
              >
                {missingActivitiesCount}
              </span>
            )}
          </button>
        </div>

        {/* 2. Search & Criteria Filter Controls Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Box (Matches Name + Location + CRITERIA!) */}
          <div className="md:col-span-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Tìm theo tên sự kiện, tiêu chí ĐRL (VD: hiến máu, thể thao), địa điểm..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Criteria Dropdown Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedCriteria}
              onChange={(e) => {
                setSelectedCriteria(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-800 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition truncate"
              title="Lọc danh sách theo tiêu chí rèn luyện cụ thể"
            >
              <option value="all">Tất cả tiêu chí ({criteriaOptions.length})</option>
              <option value="__missing_only__">⚠️ Chỉ tiêu chí còn thiếu (0 điểm)</option>
              <optgroup label="--- Tiêu chí có hoạt động ---">
                {criteriaOptions.map((opt) => (
                  <option key={opt.key} value={opt.name}>
                    {opt.isMissing ? '🎯 (Thiếu) ' : ''}
                    {opt.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-800 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="-1">Chưa đăng ký</option>
              <option value="1">Đã đăng ký / Chờ duyệt</option>
              <option value="2">Đã tham gia & Ghi nhận điểm</option>
            </select>
          </div>
        </div>

        {/* 3. Filter Summary & Reset Action */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 pt-1">
          <div className="flex items-center gap-2">
            <span>
              Hiển thị <strong>{filteredActivities.length}</strong> / {activities.length} hoạt động
            </span>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-red-600 hover:text-red-800 font-semibold underline text-[11px] ml-1"
              >
                Đặt lại bộ lọc
              </button>
            )}
          </div>

          {filteredActivities.length > ITEMS_PER_PAGE && (
            <span>
              Trang {currentPage} / {totalPages}
            </span>
          )}
        </div>

        {/* 4. Activities Cards Grid */}
        <section>
          {filteredActivities.length === 0 ? (
            <div className="text-center py-16 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200 p-8">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-gray-800">
                {activities.length === 0
                  ? 'Chưa có hoạt động nào được tải'
                  : 'Không tìm thấy hoạt động nào phù hợp với bộ lọc'}
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                {activities.length === 0
                  ? 'Nhập MSSV và nhấn nút "Tải hoạt động" ở thanh điều hướng bên trái để bắt đầu.'
                  : 'Thử tìm từ khóa tiêu chí khác hoặc tắt bộ lọc "Chỉ bù điểm thiếu".'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl shadow-2xs transition"
                >
                  Xóa tất cả bộ lọc
                </button>
              )}
              {activities.length === 0 && onRefresh && (
                <button
                  onClick={onRefresh}
                  className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  Tải ngay
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {paginatedActivities.map((activity) => {
                const isFulfilling = doesActivityFulfillMissing(
                  activity.criteriaLst,
                  missingCriteriaSet
                );

                return (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onExpand={setSelectedActivity}
                    onParticipate={onParticipate}
                    isParticipating={participatingId === activity.id}
                    isFulfillingMissing={isFulfilling}
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* 5. Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8 pt-4 border-t border-gray-100">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
            >
              ← Trước
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((pageNum, idx, arr) => {
                  const prevPage = arr[idx - 1];
                  const showEllipsis = prevPage && pageNum - prevPage > 1;

                  return (
                    <div key={pageNum} className="flex items-center gap-1">
                      {showEllipsis && <span className="text-gray-400 px-1 text-xs">...</span>}
                      <button
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                          currentPage === pageNum
                            ? 'bg-red-600 text-white shadow-sm'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    </div>
                  );
                })}
            </div>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
            >
              Sau →
            </button>
          </div>
        )}
      </div>

      {/* Detailed Modal */}
      {selectedActivity && (
        <ActivityModal
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
          onParticipate={onParticipate}
          isParticipating={participatingId === selectedActivity.id}
        />
      )}
    </>
  );
}
