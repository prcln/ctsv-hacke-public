import type { Category, Criterium } from "../types/criteria.types";
import { CRITERIA_MAP } from "./criteriaMap";

export { CRITERIA_MAP };

export interface GradeClassification {
  tier: string;
  subText: string;
  colorHex: string;
  badgeClass: string;
  nextTierName: string | null;
  pointsToNextTier: number;
  targetScore: number;
}

export interface CriteriaStats {
  totalScore: number;
  maxScore: number;
  percentage: number;
  totalRulesCount: number;
  earnedRulesCount: number;
  zeroRulesCount: number;
  totalLinkedActivities: number;
  classification: GradeClassification;
  categorySummaries: {
    id: number;
    name: string;
    romanId: string;
    points: number;
    maxPoints: number;
    percentage: number;
    isMaxed: boolean;
    gap: number;
  }[];
}

const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V"];

/**
 * Returns a dictionary of criteria rules where earned score is 0.
 */
export function getZeroCriterium(criteriaList: Category[]): Record<string, [number, number]> {
  return criteriaList
    .filter(score => score.CTMaxPoint > score.CTPoint)
    .flatMap(score => score.CriteriaGroupDetailsLst)
    .flatMap(section => section.UserCriteriaDetailsLst)
    .filter(criterium => criterium.UCPoint === 0.0)
    .reduce((acc, criterium) => {
      acc[criterium.CName] = [criterium.UCPoint, criterium.CMaxPoint];
      return acc;
    }, {} as Record<string, [number, number]>);
}

/**
 * Classifies score according to HUST / MoET standards.
 */
export function getClassification(score: number): GradeClassification {
  if (score >= 90) {
    return {
      tier: "Xuất sắc",
      subText: "Thành tích rèn luyện vượt bậc",
      colorHex: "#10b981", // emerald-500
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-300 ring-emerald-500/20",
      nextTierName: null,
      pointsToNextTier: 0,
      targetScore: 100,
    };
  }
  if (score >= 80) {
    return {
      tier: "Tốt",
      subText: "Rèn luyện đạt chuẩn cao",
      colorHex: "#2563eb", // blue-600
      badgeClass: "bg-blue-50 text-blue-700 border-blue-300 ring-blue-500/20",
      nextTierName: "Xuất sắc",
      pointsToNextTier: +(90 - score).toFixed(1),
      targetScore: 90,
    };
  }
  if (score >= 65) {
    return {
      tier: "Khá",
      subText: "Đạt chuẩn rèn luyện quy định",
      colorHex: "#f59e0b", // amber-500
      badgeClass: "bg-amber-50 text-amber-700 border-amber-300 ring-amber-500/20",
      nextTierName: "Tốt",
      pointsToNextTier: +(80 - score).toFixed(1),
      targetScore: 80,
    };
  }
  if (score >= 50) {
    return {
      tier: "Trung bình",
      subText: "Mức đạt tối thiểu, cần cải thiện",
      colorHex: "#f97316", // orange-500
      badgeClass: "bg-orange-50 text-orange-700 border-orange-300 ring-orange-500/20",
      nextTierName: "Khá",
      pointsToNextTier: +(65 - score).toFixed(1),
      targetScore: 65,
    };
  }
  return {
    tier: "Cần cải thiện (Yếu)",
    subText: "Dưới ngưỡng đạt yêu cầu",
    colorHex: "#ef4444", // red-500
    badgeClass: "bg-red-50 text-red-700 border-red-300 ring-red-500/20",
    nextTierName: score < 35 ? "Trung bình" : "Khá",
    pointsToNextTier: +(65 - score).toFixed(1),
    targetScore: 65,
  };
}

/**
 * Calculates comprehensive metrics and stats for 5-second visualization.
 */
export function getCriteriaStats(criteriaList: Category[]): CriteriaStats {
  let totalScore = 0;
  let maxScore = 0;
  let totalRulesCount = 0;
  let earnedRulesCount = 0;
  let zeroRulesCount = 0;
  let totalLinkedActivities = 0;

  const categorySummaries = criteriaList.map((category, index) => {
    totalScore += category.CTPoint;
    maxScore += category.CTMaxPoint;

    let catLinkedActs = 0;
    category.CriteriaGroupDetailsLst?.forEach(grp => {
      grp.UserCriteriaDetailsLst?.forEach((c: Criterium) => {
        totalRulesCount++;
        if (c.UCPoint > 0) {
          earnedRulesCount++;
        } else {
          zeroRulesCount++;
        }
        if (c.UserCriteriaActivityLst && c.UserCriteriaActivityLst.length > 0) {
          catLinkedActs += c.UserCriteriaActivityLst.length;
          totalLinkedActivities += c.UserCriteriaActivityLst.length;
        }
      });
    });

    const percentage = category.CTMaxPoint > 0 
      ? Math.min(100, Math.round((category.CTPoint / category.CTMaxPoint) * 100))
      : 0;

    return {
      id: category.CTId,
      name: category.CTName,
      romanId: ROMAN_NUMERALS[index] || `P${index + 1}`,
      points: category.CTPoint,
      maxPoints: category.CTMaxPoint,
      percentage,
      isMaxed: category.CTPoint >= category.CTMaxPoint,
      gap: +(category.CTMaxPoint - category.CTPoint).toFixed(1),
      linkedActsCount: catLinkedActs,
    };
  });

  // Safe percentage calculation
  const overallPercentage = maxScore > 0 ? Math.min(100, Math.round((totalScore / maxScore) * 100)) : 0;
  const classification = getClassification(totalScore);

  return {
    totalScore: +totalScore.toFixed(1),
    maxScore: +maxScore.toFixed(1),
    percentage: overallPercentage,
    totalRulesCount,
    earnedRulesCount,
    zeroRulesCount,
    totalLinkedActivities,
    classification,
    categorySummaries,
  };
}

/**
 * Converts any criteria key (English slug or raw title) into the official Vietnamese title.
 */
export function formatCriteriaName(rawKey: string): string {
  if (!rawKey) return "";
  const trimmed = rawKey.trim();
  if (CRITERIA_MAP[trimmed]) {
    return CRITERIA_MAP[trimmed];
  }
  // Try without trailing dot
  const noDot = trimmed.replace(/\.+$/, "");
  if (CRITERIA_MAP[noDot]) {
    return CRITERIA_MAP[noDot];
  }
  // Case-insensitive lookup in map
  const lower = trimmed.toLowerCase();
  for (const [slug, title] of Object.entries(CRITERIA_MAP)) {
    if (slug.toLowerCase() === lower) {
      return title;
    }
  }
  return trimmed;
}

/**
 * Provides a short, readable Vietnamese label for badges on cards.
 */
export function getShortCriteriaLabel(rawKey: string): string {
  const fullTitle = formatCriteriaName(rawKey);
  if (!fullTitle) return "";
  if (fullTitle.length <= 32) return fullTitle;
  return fullTitle.slice(0, 30) + "...";
}

/**
 * Extracts a normalized Set of all criteria titles where the student currently has 0 points.
 */
export function getMissingCriteriaSet(criteriaList: Category[]): Set<string> {
  const missingSet = new Set<string>();
  for (const category of criteriaList) {
    if (category.CTMaxPoint <= category.CTPoint) continue;
    for (const group of category.CriteriaGroupDetailsLst || []) {
      for (const rule of group.UserCriteriaDetailsLst || []) {
        if (rule.UCPoint === 0 && rule.CMaxPoint > 0) {
          const name = rule.CName.trim();
          missingSet.add(name.toLowerCase());
          missingSet.add(name.replace(/\.+$/, "").toLowerCase());
          // Also add CId string
          missingSet.add(String(rule.CId));
          // Also add reverse slug if any
          for (const [slug, title] of Object.entries(CRITERIA_MAP)) {
            if (title === name || title.replace(/\.+$/, "") === name.replace(/\.+$/, "")) {
              missingSet.add(slug.toLowerCase());
            }
          }
        }
      }
    }
  }
  return missingSet;
}

/**
 * Checks whether an activity's criteriaLst fulfills any missing criteria of the student.
 */
export function doesActivityFulfillMissing(
  criteriaLst: Record<string, number> | undefined,
  missingSet: Set<string>
): boolean {
  if (!criteriaLst || missingSet.size === 0) return false;
  for (const rawKey of Object.keys(criteriaLst)) {
    const formatted = formatCriteriaName(rawKey).toLowerCase();
    const cleanKey = rawKey.trim().toLowerCase();
    if (
      missingSet.has(cleanKey) ||
      missingSet.has(cleanKey.replace(/\.+$/, "")) ||
      missingSet.has(formatted) ||
      missingSet.has(formatted.replace(/\.+$/, ""))
    ) {
      return true;
    }
  }
  return false;
}
