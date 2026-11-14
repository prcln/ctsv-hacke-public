export interface Activity {
  id: number;
  code?: string | number;
  name: string;
  type?: string | number;
  desc?: string;
  startTime?: string;
  finishTime?: string;
  place?: string;
  groupName?: string;
  deadline?: string;
  activityStatus?: number;
  userStatus?: number;
  criteriaLst?: Record<string, number>;
}

export type EventTimingFilter = 'all' | 'upcoming' | 'ongoing' | 'past';
