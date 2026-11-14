import { useState } from "react";
import type { Activity } from "../../types/activity.types";
import { parseEventDate, getEventTiming, isDeadlinePassed } from "../../helpers/dateHelpers";
import { formatCriteriaName, getShortCriteriaLabel } from "../../helpers/criteriaHelpers";

interface ActivityCardProps {
  activity: Activity;
  onParticipate: (id: number) => void;
  onExpand: (activity: Activity) => void;
  isParticipating?: boolean;
  isFulfillingMissing?: boolean;
}

export default function ActivityCard({
  activity,
  onParticipate,
  onExpand,
  isParticipating = false,
  isFulfillingMissing = false,
}: ActivityCardProps) {
  const [imgError, setImgError] = useState(false);

  const startDateInfo = parseEventDate(activity.startTime);
  const finishDateInfo = parseEventDate(activity.finishTime);
  const timingStatus = getEventTiming(activity.startTime, activity.finishTime);
  const deadlineExpired = isDeadlinePassed(activity.deadline);

  const imageUrl = `https://ctsv.hust.edu.vn/uploads/activity/${activity.id}.jpg`;

  // Timing badge config
  const timingBadges = {
    upcoming: {
      text: "Sắp diễn ra",
      bg: "bg-blue-600/90 text-white",
      dot: "bg-blue-200",
    },
    ongoing: {
      text: "Đang diễn ra",
      bg: "bg-emerald-600/95 text-white",
      dot: "bg-emerald-300 animate-ping",
    },
    past: {
      text: "Đã diễn ra",
      bg: "bg-gray-700/85 text-gray-200",
      dot: "bg-gray-400",
    },
  };

  const currentTiming = timingBadges[timingStatus];

  // User registration status config
  const isJoined = activity.userStatus === 1 || activity.userStatus === 0;
  const isCompleted = activity.userStatus === 2;

  // Criteria summary chips
  const criteriaEntries = Object.entries(activity.criteriaLst || {});

  return (
    <div className="flex flex-col justify-between bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group hover:-translate-y-1">
      {/* 1. Cover Image with Badges */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-red-800 via-rose-700 to-amber-700">
        {!imgError ? (
          <img
            src={imageUrl}
            alt={activity.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-white/90 text-center">
            <svg
              className="w-10 h-10 mb-1 opacity-70"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-xs font-semibold uppercase tracking-wider line-clamp-1">
              {activity.groupName || "Đại học Bách khoa Hà Nội"}
            </span>
          </div>
        )}

        {/* Gradient overlay for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between gap-1 pointer-events-none">
          {/* Activity Type or Missing Criteria Pill */}
          {isFulfillingMissing ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white shadow-sm backdrop-blur-sm flex items-center gap-1">
              <span>🎯</span>
              <span>Bù điểm thiếu</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/95 text-gray-800 shadow-sm backdrop-blur-sm truncate max-w-[150px]">
              {activity.type || "Sự kiện"}
            </span>
          )}

          {/* Timing Status Pill */}
          <span
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-sm backdrop-blur-sm ${currentTiming.bg}`}
          >
            <span className={`w-2 h-2 rounded-full ${currentTiming.dot}`} />
            {currentTiming.text}
          </span>
        </div>

        {/* Bottom Banner Info: User Status Badge */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white pointer-events-none">
          {isCompleted ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-500 text-white shadow">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              Đã hoàn thành
            </span>
          ) : isJoined ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Đã đăng ký
            </span>
          ) : (
            <span className="text-[11px] text-white/90 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-sm">
              Mã: {activity.id}
            </span>
          )}
        </div>
      </div>

      {/* 2. Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        {/* Title + Date Block */}
        <div className="flex gap-3 items-start">
          {/* HUST-style Calendar Date Box */}
          <div className="flex-shrink-0 w-13 h-14 bg-red-50 border border-red-200/80 rounded-xl flex flex-col items-center justify-center text-center p-1 shadow-xs">
            <span className="text-base font-extrabold text-red-700 leading-none">
              {startDateInfo.day}
            </span>
            <span className="text-[10px] font-bold text-red-600 uppercase tracking-tighter mt-0.5">
              {startDateInfo.month.replace("Tháng ", "T.")}
            </span>
            <span className="text-[9px] text-gray-500 leading-none mt-0.5">
              {startDateInfo.year}
            </span>
          </div>

          {/* Title */}
          <div className="flex-1 min-w-0">
            <h4
              onClick={() => onExpand(activity)}
              className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 cursor-pointer hover:text-red-700 transition-colors"
              title={activity.name}
            >
              {activity.name}
            </h4>
            <p className="text-[11px] text-gray-500 font-medium truncate mt-1">
              Đơn vị: {activity.groupName || "Đại học Bách khoa Hà Nội"}
            </p>
          </div>
        </div>

        {/* Info Rows (Time, Location, Deadline) */}
        <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
          {/* Time range */}
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold text-gray-700 truncate">
              {startDateInfo.time} - {finishDateInfo.time} ({startDateInfo.formattedDate})
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate" title={activity.place || "Chưa cập nhật"}>
              {activity.place || "Chưa cập nhật địa điểm"}
            </span>
          </div>

          {/* Deadline */}
          {activity.deadline && (
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className={`truncate ${deadlineExpired ? "text-red-600 font-semibold" : "text-gray-500"}`}>
                Hạn ĐK: {activity.deadline.slice(5, 16)} {deadlineExpired && "(Đã hết hạn)"}
              </span>
            </div>
          )}
        </div>

        {/* Criteria chips (Vietnamese titles) */}
        {criteriaEntries.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {criteriaEntries.slice(0, 2).map(([key, maxPt]) => {
              const fullTitle = formatCriteriaName(key);
              const shortLabel = getShortCriteriaLabel(key);

              return (
                <span
                  key={key}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200/60 truncate max-w-[175px]"
                  title={`${fullTitle}: +${maxPt} điểm`}
                >
                  +{maxPt}đ {shortLabel}
                </span>
              );
            })}
            {criteriaEntries.length > 2 && (
              <span
                className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-600 cursor-pointer"
                title={criteriaEntries.slice(2).map(([k, p]) => `${formatCriteriaName(k)}: +${p}đ`).join('\n')}
              >
                +{criteriaEntries.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex gap-2">
          {isCompleted ? (
            <button
              disabled
              className="flex-1 py-2 px-3 text-xs font-bold text-green-700 bg-green-50 border border-green-200 rounded-xl cursor-default flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              Đã tham gia
            </button>
          ) : isJoined ? (
            <button
              disabled
              className="flex-1 py-2 px-3 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl cursor-default flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Đã đăng ký
            </button>
          ) : (
            <button
              onClick={() => onParticipate(activity.id)}
              disabled={isParticipating || deadlineExpired}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 ${
                deadlineExpired
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                  : isParticipating
                  ? "bg-blue-300 text-white cursor-wait"
                  : "bg-red-600 hover:bg-red-700 text-white hover:shadow-md"
              }`}
            >
              {isParticipating ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Đang đăng ký...
                </>
              ) : deadlineExpired ? (
                "Hết hạn ĐK"
              ) : (
                "Đăng ký tham gia"
              )}
            </button>
          )}

          {/* View Details Button */}
          <button
            onClick={() => onExpand(activity)}
            title="Xem chi tiết hoạt động"
            className="py-2 px-3 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors flex items-center justify-center"
          >
            Chi tiết
          </button>
        </div>
      </div>
    </div>
  );
}
