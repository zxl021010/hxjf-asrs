import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { getLogDetail, getLogPage } from '@/services/log/logAPI';
import { PageContainer } from '@ant-design/pro-components';
import { keepPreviousData } from '@tanstack/react-query';
import { useQuery } from '@umijs/max';
import { Button, Card, Spin, Tag } from 'antd';
import React, { useCallback, useMemo, useState } from 'react';
import LogDetailDrawer from './components/log-detail-drawer';
import { CATEGORY_STYLE, SOURCE_STYLE } from './types';

const INITIAL_SIZE = 20;
const SIZE_INCREMENT = 20;

type LogCategoryFilter = 'all' | 'inbound' | 'outbound' | 'system';

const LOG_FILTER_TABS: readonly { readonly value: LogCategoryFilter; readonly label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'inbound', label: '📥 入库' },
  { value: 'outbound', label: '📤 出库' },
  { value: 'system', label: '🔧 系统' },
];

interface LogCardProps {
  readonly log: LogAPI.BusinessEventLogVO;
  readonly onClick: (log: LogAPI.BusinessEventLogVO) => void;
}

const LogCard: React.FC<LogCardProps> = ({ log, onClick }) => {
  const style = CATEGORY_STYLE[log.eventType];
  const sourceStyle = SOURCE_STYLE[log.source];

  return (
    <Card
      hoverable
      styles={{ body: { padding: 0 } }}
      onClick={() => onClick(log)}
      className="cursor-pointer transition-all overflow-hidden"
      style={{
        borderRadius: 14,
        marginBottom: 12,
      }}
    >
      <div className="p-[16px_20px] pl-[16px]" style={{ borderLeft: `4px solid ${style.color}` }}>
        <div className="text-[12px] leading-[14px] text-[#8C8C8C] mb-[6px] font-[monospace]">{log.occurredTime}</div>
        <div className="text-[15px] leading-[21px] font-semibold text-[#262626] mb-[4px]">{style.label}</div>
        <div className="flex justify-start">
          <div className="text-[13px] leading-[1.6] text-[#8C8C8C]">{log.message}</div>
          <div className="flex items-center gap-[6px]">
            <div
              className="text-[11px] font-medium rounded-[6px] p-[3px_10px]"
              style={{ color: sourceStyle.color, backgroundColor: sourceStyle.bgColor }}
            >
              {sourceStyle.label}
            </div>
            <div
              className="text-[11px] font-medium rounded-[6px] p-[3px_10px]"
              style={{ color: style.color, backgroundColor: style.bgColor }}
            >
              {style.label}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

const LogPage: React.FC = () => {
  const [size, setSize] = useState<number>(INITIAL_SIZE);
  const [activeFilter, setActiveFilter] = useState<LogCategoryFilter>('all');

  const [selectedLogId, setSelectedLogId] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const logListQueryKey = useMemo(() => ['log', 'page', size, activeFilter] as const, [size, activeFilter]);

  const {
    data: logPageData,
    isFetching,
    isPending,
    refetch,
  } = useQuery({
    queryKey: logListQueryKey,
    queryFn: async () => {
      // API placeholder: Category filtering requires backend support
      // For now, fetch all logs and filter client-side
      const res = await getLogPage({ page: 1, size });
      if (res.code !== 200) {
        throw new Error(res.msg || '获取日志列表失败');
      }
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  // Client-side filtering (API placeholder)
  const allLogs = logPageData?.list ?? [];
  const filteredLogs = useMemo(() => {
    if (activeFilter === 'all') return allLogs;

    return allLogs.filter((log) => {
      if (activeFilter === 'inbound') {
        return log.eventType === 'INBOUND';
      } else if (activeFilter === 'outbound') {
        return log.eventType === 'OUTBOUND';
      } else if (activeFilter === 'system') {
        return log.eventType === 'SYSTEM';
      }
      return true;
    });
  }, [allLogs, activeFilter]);

  const logs = filteredLogs;
  const total = logPageData?.total ?? 0;
  const loading = isPending;
  const loadingMore = isFetching && size > INITIAL_SIZE;

  const { data: drawerLog } = useQuery({
    queryKey: ['log', 'detail', selectedLogId],
    queryFn: async () => {
      if (selectedLogId === null) {
        throw new Error('缺少日志 ID');
      }
      const res = await getLogDetail(selectedLogId);
      if (res.code !== 200) {
        throw new Error(res.msg || '获取日志详情失败');
      }
      return res.data;
    },
    enabled: drawerOpen && selectedLogId !== null,
  });

  const hasMore = logs.length < total && !loading && !loadingMore;

  const handleLoadMore = useCallback(() => {
    setSize((prev) => prev + SIZE_INCREMENT);
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleFilterChange = useCallback((filter: LogCategoryFilter) => {
    setActiveFilter(filter);
    setSize(INITIAL_SIZE); // Reset pagination when filter changes
  }, []);

  const handleCardClick = useCallback((log: LogAPI.BusinessEventLogVO) => {
    setSelectedLogId(log.id);
    setDrawerOpen(true);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const { sentinelRef } = useInfiniteScroll({
    hasMore,
    loading: loading || loadingMore,
    onLoadMore: handleLoadMore,
  });

  return (
    <PageContainer pageHeaderRender={false}>
      <div className="flex items-start justify-between gap-[12px] pb-[8px]">
        <div>
          <div className="text-[22px] leading-[32px] font-semibold text-[#262626]">操作日志</div>
          <div className="text-[#8C8C8C] mt-[4px] text-[13px]">点击任意日志记录查看详情</div>
        </div>
        <Button
          type="primary"
          className="h-[31px] rounded-[20px] p-[6px_16px] border-none text-[13px] leading-[13px]"
          loading={isFetching}
          onClick={handleRefresh}
        >
          🔄 刷新
        </Button>
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-[8px] py-[12px] border-b border-[#F0F0F0]">
        {LOG_FILTER_TABS.map((tab) => (
          <Tag
            key={tab.value}
            color={activeFilter === tab.value ? '#1677FF' : 'default'}
            className="cursor-pointer m-0 rounded-[20px] px-[16px] py-[6px] text-[13px] font-medium"
            style={{
              borderColor: activeFilter === tab.value ? '#1677FF' : '#D9D9D9',
              color: activeFilter === tab.value ? '#FFF' : '#595959',
            }}
            onClick={() => handleFilterChange(tab.value)}
          >
            {tab.label}
          </Tag>
        ))}
      </div>

      <div className="pt-[16px] pb-[80px]">
        {loading ? (
          <div className="flex justify-center py-12">
            <Spin size="large" />
          </div>
        ) : (
          <>
            {logs.map((log) => (
              <LogCard key={log.id} log={log} onClick={handleCardClick} />
            ))}
            {logs.length === 0 && <div className="text-center py-12 text-gray-400">暂无日志</div>}
            <div ref={sentinelRef} className="h-[1px]" />
            {loadingMore && (
              <div className="flex justify-center py-4">
                <Spin size="small" />
                <span className="ml-2 text-gray-400 text-[13px]">加载更多...</span>
              </div>
            )}
            {!hasMore && logs.length > 0 && (
              <div className="text-center py-4 text-gray-400 text-[13px]">
                {total > 0 ? `已加载全部 ${total} 条日志` : '没有更多了'}
              </div>
            )}
          </>
        )}
      </div>

      <LogDetailDrawer log={drawerLog ?? null} open={drawerOpen} onClose={handleDrawerClose} />
    </PageContainer>
  );
};

export default LogPage;
