declare namespace DashboardAPI {
  /** 货位概览 */
  interface LocationSummaryVO {
    /** 货位总数 */
    total: number;
    /** 各状态货位数量统计 */
    statusCounts: Record<number, number>;
  }
}
