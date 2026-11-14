/**
 * Utilities for parsing and formatting CTSV dates and calculating event timing status.
 */

export type EventTiming = 'upcoming' | 'ongoing' | 'past';

export interface ParsedDateInfo {
  day: string;
  month: string;
  year: string;
  time: string;
  formattedDate: string;
}

/**
 * Parse CTSV date string (e.g. "2026-11-27 06:30:00") into structured parts.
 */
export function parseEventDate(dateStr?: string): ParsedDateInfo {
  if (!dateStr) {
    return {
      day: "--",
      month: "---",
      year: "----",
      time: "--:--",
      formattedDate: "Chưa xác định",
    };
  }

  try {
    const cleanStr = dateStr.replace(" ", "T");
    const d = new Date(cleanStr);
    
    if (isNaN(d.getTime())) {
      // Fallback manual regex split
      const parts = dateStr.split(" ");
      const datePart = parts[0] || "";
      const timePart = parts[1] || "";
      const [y, m, day] = datePart.split("-");
      return {
        day: day || "--",
        month: m ? `Tháng ${m}` : "---",
        year: y || "----",
        time: timePart ? timePart.slice(0, 5) : "--:--",
        formattedDate: dateStr,
      };
    }

    const day = String(d.getDate()).padStart(2, "0");
    const month = `Tháng ${String(d.getMonth() + 1).padStart(2, "0")}`;
    const year = String(d.getFullYear());
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return {
      day,
      month,
      year,
      time: `${hours}:${minutes}`,
      formattedDate: `${day}/${String(d.getMonth() + 1).padStart(2, "0")}/${year}`,
    };
  } catch {
    return {
      day: "--",
      month: "---",
      year: "----",
      time: "--:--",
      formattedDate: dateStr,
    };
  }
}

/**
 * Determine event timing: Sắp diễn ra (upcoming), Đang diễn ra (ongoing), or Đã diễn ra (past).
 */
export function getEventTiming(startTime?: string, finishTime?: string): EventTiming {
  if (!startTime) return 'upcoming';

  try {
    const now = new Date().getTime();
    const start = new Date(startTime.replace(" ", "T")).getTime();
    const end = finishTime ? new Date(finishTime.replace(" ", "T")).getTime() : start;

    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'ongoing';
    return 'past';
  } catch {
    return 'upcoming';
  }
}

/**
 * Check if the registration deadline has passed.
 */
export function isDeadlinePassed(deadlineStr?: string): boolean {
  if (!deadlineStr) return false;
  try {
    const now = new Date().getTime();
    const deadline = new Date(deadlineStr.replace(" ", "T")).getTime();
    return now > deadline;
  } catch {
    return false;
  }
}

