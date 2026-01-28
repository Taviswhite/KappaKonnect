export type DashboardSectionKey =
  | "stats"
  | "quickActions"
  | "advisors"
  | "upcomingEvents"
  | "featuredAlumni"
  | "recentActivity"
  | "taskList"
  | "attendanceCheckIn"
  | "eBoard";

export type DashboardPreferences = Record<DashboardSectionKey, boolean>;

export const DASHBOARD_SECTIONS: DashboardSectionKey[] = [
  "stats",
  "quickActions",
  "advisors",
  "upcomingEvents",
  "attendanceCheckIn",
  "featuredAlumni",
  "taskList",
  "recentActivity",
  "eBoard",
];

export const defaultDashboardPreferences: DashboardPreferences = {
  stats: true,
  quickActions: true,
  advisors: true,
  upcomingEvents: true,
  featuredAlumni: true,
  recentActivity: true,
  taskList: true,
  attendanceCheckIn: true,
  eBoard: true,
};

const STORAGE_KEY_PREFIX = "kc_dashboard_prefs_";
const STORAGE_ORDER_PREFIX = "kc_dashboard_order_";

const getStorageKey = (userId: string) => `${STORAGE_KEY_PREFIX}${userId}`;
const getOrderStorageKey = (userId: string) => `${STORAGE_ORDER_PREFIX}${userId}`;

export const getDashboardPreferences = (
  userId?: string | null,
): DashboardPreferences => {
  if (typeof window === "undefined" || !userId) {
    return defaultDashboardPreferences;
  }

  try {
    const stored = window.localStorage.getItem(getStorageKey(userId));
    if (!stored) return defaultDashboardPreferences;

    const parsed = JSON.parse(stored) as Partial<DashboardPreferences>;
    return {
      ...defaultDashboardPreferences,
      ...parsed,
    };
  } catch {
    return defaultDashboardPreferences;
  }
};

export const updateDashboardPreferences = (
  userId: string,
  updater: (prev: DashboardPreferences) => DashboardPreferences,
): DashboardPreferences => {
  const current = getDashboardPreferences(userId);
  const next = updater(current);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(getStorageKey(userId), JSON.stringify(next));
  }

  return next;
};

export const resetDashboardPreferences = (userId?: string | null) => {
  if (typeof window === "undefined" || !userId) return;
  window.localStorage.removeItem(getStorageKey(userId));
  window.localStorage.removeItem(getOrderStorageKey(userId));
};

export const getDashboardOrder = (
  userId?: string | null,
): DashboardSectionKey[] => {
  if (typeof window === "undefined" || !userId) {
    return [...DASHBOARD_SECTIONS];
  }

  try {
    const stored = window.localStorage.getItem(getOrderStorageKey(userId));
    if (!stored) return [...DASHBOARD_SECTIONS];

    const parsed = JSON.parse(stored) as DashboardSectionKey[];
    const valid = parsed.filter((key) => DASHBOARD_SECTIONS.includes(key));
    const missing = DASHBOARD_SECTIONS.filter((key) => !valid.includes(key));
    return [...valid, ...missing];
  } catch {
    return [...DASHBOARD_SECTIONS];
  }
};

export const updateDashboardOrder = (
  userId: string,
  updater: (prev: DashboardSectionKey[]) => DashboardSectionKey[],
): DashboardSectionKey[] => {
  const current = getDashboardOrder(userId);
  const next = updater(current);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(
      getOrderStorageKey(userId),
      JSON.stringify(next),
    );
  }

  return next;
};

