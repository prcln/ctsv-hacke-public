import { useRef, useEffect, useState } from "react";
import type { Activity } from "../../types/activity.types";
import { parseEventDate, getEventTiming, isDeadlinePassed } from "../../helpers/dateHelpers";
import { formatCriteriaName } from "../../helpers/criteriaHelpers";

interface ActivityModalProps {
  activity: Activity;
  onClose: () => void;
  onParticipate?: (id: number) => void;
  isParticipating?: boolean;
}

export default function ActivityModal({
  activity,
  onClose,
  onParticipate,
  isParticipating = false,
}: ActivityModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (activity) {
      dialog?.showModal();
    } else {
      dialog?.close();
    }
  }, [activity]);

  if (!activity) return null;

  const startDateInfo = parseEventDate(activity.startTime);
  const finishDateInfo = parseEventDate(activity.finishTime);
  const timingStatus = getEventTiming(activity.startTime, activity.finishTime);
  const deadlineExpired = isDeadlinePassed(activity.deadline);

  const isJoined = activity.userStatus === 1 || activity.userStatus === 0;
  const isCompleted = activity.userStatus === 2;

  const imageUrl = `https://ctsv.hust.edu.vn/uploads/activity/${activity.id}.jpg`;

  const timingLabels = {
    upcoming: "Sắp diễn ra",
    ongoing: "Đang diễn ra",
    past: "Đã diễn ra",
  };

  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      className="m-auto w-full max-w-2xl rounded-3xl p-0 shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm overflow-hidden"
    >
      <div className="flex flex-col max-h-[90vh] bg-white">
        {/* Modal Header Image */}
        <div className="relative aspect-[21/9] w-full bg-gradient-to-r from-red-800 to-rose-700 overflow-hidden">
          {!imgError ? (
            <img
              src={imageUrl}
              alt={activity.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/80 font-bold text-lg">
              {activity.groupName || "Đại học Bách khoa Hà Nội"}
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors shadow-md backdrop-blur-xs"
          >
            ✕
          </button>

          {/* Timing & Type badges on header */}
          <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between text-white">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-800 shadow">
              {activity.type || "Sự kiện"}
            </span>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-600/90 text-white shadow backdrop-blur-xs">
              {timingLabels[timingStatus]}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Title */}
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 leading-snug">
              {activity.name}
            </h2>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500 font-medium">
              <span>Đơn vị tổ chức: <strong className="text-gray-700">{activity.groupName || "Chưa cập nhật"}</strong></span>
              <span>•</span>
              <span>Mã sự kiện: <strong className="text-gray-700">#{activity.id}</strong></span>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs">
            {/* Timeline */}
            <div className="space-y-1">
              <span className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Thời gian diễn ra</span>
              <p className="font-bold text-gray-800 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {startDateInfo.time} - {finishDateInfo.time} ({startDateInfo.formattedDate})
              </p>
            </div>

            {/* Location */}
            <div className="space-y-1">
              <span className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Địa điểm</span>
              <p className="font-bold text-gray-800 flex items-center gap-1.5 truncate" title={activity.place}>
                <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {activity.place || "Chưa cập nhật"}
              </p>
            </div>

            {/* Deadline */}
            <div className="space-y-1">
              <span className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Hạn đăng ký</span>
              <p className={`font-bold flex items-center gap-1.5 ${deadlineExpired ? "text-red-600" : "text-gray-800"}`}>
                <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {activity.deadline || "Không giới hạn"} {deadlineExpired && "(Đã hết hạn)"}
              </p>
            </div>

            {/* Status */}
            <div className="space-y-1">
              <span className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Trạng thái của bạn</span>
              <p className="font-bold flex items-center gap-1.5">
                {isCompleted ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    Đã hoàn thành / Đạt điểm
                  </span>
                ) : isJoined ? (
                  <span className="text-amber-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Đã đăng ký (Chờ duyệt)
                  </span>
                ) : (
                  <span className="text-gray-500">Chưa tham gia</span>
                )}
              </p>
            </div>
          </div>

          {/* Criteria award list */}
          {activity.criteriaLst && Object.keys(activity.criteriaLst).length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Tiêu chí điểm rèn luyện nhận được:
              </h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(activity.criteriaLst).map(([key, maxPt]) => (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-50 text-red-800 border border-red-200"
                  >
                    <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                    <span className="font-bold text-red-700">+{maxPt}đ:</span> {formatCriteriaName(key)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Nội dung chi tiết hoạt động:
            </h4>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 max-h-56 overflow-y-auto text-xs text-gray-700 leading-relaxed custom-scrollbar">
              {activity.desc ? (
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: activity.desc }}
                />
              ) : (
                <p className="text-gray-400 italic">Không có mô tả chi tiết.</p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 transition-colors shadow-xs"
          >
            Đóng
          </button>

          {onParticipate && !isCompleted && !isJoined && (
            <button
              onClick={() => onParticipate(activity.id)}
              disabled={isParticipating || deadlineExpired}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md active:scale-95 flex items-center gap-2 ${
                deadlineExpired
                  ? "bg-gray-400 cursor-not-allowed"
                  : isParticipating
                  ? "bg-blue-400 cursor-wait"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {isParticipating ? "Đang xử lý..." : "Đăng ký tham gia ngay"}
            </button>
          )}
        </div>
      </div>
    </dialog>
  );
}
