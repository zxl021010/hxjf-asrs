import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import {
  claimException,
  continueException,
  getExceptionDetail,
  getExceptionPage,
  remarkException,
  resolveException,
  retryException,
} from '@/services/exception/exceptionAPI';
import { PageContainer } from '@ant-design/pro-components';
import { keepPreviousData } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@umijs/max';
import { App, Button, Card, Spin, Tag } from 'antd';
import React, { useCallback, useMemo, useState } from 'react';
import ExceptionActionModal from './components/exception-action-modal';
import ExceptionDetailDrawer from './components/exception-detail-drawer';
import {
  EXCEPTION_PRIORITY_CONFIG,
  EXCEPTION_SOURCE_CONFIG,
  EXCEPTION_STATUS_CONFIG,
  EXCEPTION_TYPE_CONFIG,
} from './types';

type FilterType = 'all' | ExceptionAPI.HandlingStatus;

const INITIAL_SIZE = 20;
const SIZE_INCREMENT = 20;

const FILTER_TABS: readonly { readonly value: FilterType; readonly label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'PENDING', label: '待处理' },
  { value: 'PROCESSING', label: '处理中' },
  { value: 'RESOLVED', label: '已解决' },
];

interface FilterTabsProps {
  readonly activeKey: FilterType;
  readonly onChange: (key: FilterType) => void;
}

const FilterTabs: React.FC<FilterTabsProps> = ({ activeKey, onChange }) => (
  <div className="flex items-center gap-[8px] py-[8px]">
    {FILTER_TABS.map((tab) => {
      const isActive = tab.value === activeKey;
      return (
        <div
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className="p-[6px_16px] rounded-[20px] text-[13px] leading-[19px] font-medium cursor-pointer transition-all border-[1.5px]"
          style={{
            backgroundColor: isActive ? '#E6F4FF' : '#FFFFFF',
            borderColor: isActive ? '#1677FF' : '#E8E8E8',
            color: isActive ? '#1677FF' : '#8C8C8C',
          }}
        >
          {tab.label}
        </div>
      );
    })}
  </div>
);

interface ExceptionCardProps {
  readonly exception: ExceptionAPI.ExceptionVO;
  readonly onAction: (exception: ExceptionAPI.ExceptionVO) => void;
  readonly onClick: (exception: ExceptionAPI.ExceptionVO) => void;
  readonly index: number;
}

const ExceptionCard: React.FC<ExceptionCardProps> = ({ exception, onAction, onClick, index }) => {
  const statusConfig = EXCEPTION_STATUS_CONFIG[exception.handlingStatus];
  const priorityConfig = EXCEPTION_PRIORITY_CONFIG[exception.severity];
  const sourceConfig = EXCEPTION_SOURCE_CONFIG[exception.sourceType];
  const typeConfig = EXCEPTION_TYPE_CONFIG[exception.taskType];

  const handleAction = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onAction(exception);
    },
    [exception, onAction],
  );

  const renderAction = () => {
    if (exception.handlingStatus === 'PENDING') {
      return (
        <Button
          type="primary"
          className="h-[29px] text-[12px] leading-[12px] rounded-[8px] p-[6px_14px] border-0"
          onClick={handleAction}
        >
          去处理
        </Button>
      );
    }
    if (exception.handlingStatus === 'PROCESSING') {
      return (
        <Button
          className="h-[29px] text-[12px] rounded-[8px] p-[6px_14px] border-0"
          style={{ backgroundColor: '#52C41A', color: '#FFFFFF' }}
          onClick={handleAction}
        >
          已处理
        </Button>
      );
    }
    return <span className="text-[13px] text-[#8C8C8C]">已完成</span>;
  };

  const handleClick = useCallback(() => {
    onClick(exception);
  }, [exception, onClick]);

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md relative overflow-hidden"
      styles={{ body: { padding: 0 } }}
      style={{
        borderRadius: 12,
        marginBottom: 12,
        animation: `fadeSlideUp 0.35s ease-out both`,
        animationDelay: `${index * 0.05}s`,
      }}
      onClick={handleClick}
    >
      <div className="p-[16px] pl-[12px]" style={{ borderLeft: `4px solid ${statusConfig.borderColor}` }}>
        <div className="flex items-end justify-between">
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-[#000000] text-[15px] leading-[21px] mb-[6px]">
              {typeConfig.title} · {exception.exceptionCode}
            </div>

            <div className="text-[13px] leading-[19px] text-[#8C8C8C] mb-[10px]">
              货仓：{exception.locationNo} · {exception.message}
            </div>

            <div className="flex items-center gap-[6px] mt-[10px] flex-wrap">
              <Tag
                bordered={false}
                className="m-0 text-[11px] leading-[16px] font-medium rounded-[6px] p-[3px_10px] flex items-center border-none"
                style={{ color: sourceConfig.color, backgroundColor: sourceConfig.bgColor }}
              >
                {sourceConfig.label}
              </Tag>
              <Tag
                bordered={false}
                className="m-0 text-[11px] leading-[16px] font-medium rounded-[6px] p-[3px_10px] flex items-center border-none"
                style={{ color: priorityConfig.color, backgroundColor: priorityConfig.bgColor }}
              >
                {priorityConfig.label}
              </Tag>
              <Tag
                bordered={false}
                className="m-0 text-[11px] leading-[16px] font-medium rounded-[6px] p-[3px_10px] flex items-center border-none"
                style={{ color: statusConfig.color, backgroundColor: statusConfig.bgColor }}
              >
                {statusConfig.label}
              </Tag>
            </div>
          </div>

          <div className="flex items-center pt-[4px] flex-shrink-0">{renderAction()}</div>
        </div>
      </div>
    </Card>
  );
};

interface ExceptionStats {
  readonly total: number;
  readonly pendingCount: number;
  readonly processingCount: number;
  readonly resolvedCount: number;
}

const computeStats = (exceptions: readonly ExceptionAPI.ExceptionVO[], totalFromApi: number): ExceptionStats => ({
  total: totalFromApi,
  pendingCount: exceptions.filter((item) => item.handlingStatus === 'PENDING').length,
  processingCount: exceptions.filter((item) => item.handlingStatus === 'PROCESSING').length,
  resolvedCount: exceptions.filter((item) => item.handlingStatus === 'RESOLVED').length,
});

const ExceptionPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [size, setSize] = useState<number>(INITIAL_SIZE);

  const [selectedExceptionId, setSelectedExceptionId] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const [actionModalOpen, setActionModalOpen] = useState<boolean>(false);
  const [actionModalException, setActionModalException] = useState<ExceptionAPI.ExceptionVO | null>(null);

  const exceptionListQueryKey = useMemo(() => ['exception', 'page', activeFilter, size] as const, [activeFilter, size]);

  const {
    data: exceptionPageData,
    isFetching,
    isPending,
    refetch,
  } = useQuery({
    queryKey: exceptionListQueryKey,
    queryFn: async () => {
      const params: ExceptionAPI.ExceptionPageParams = { page: 1, size };
      if (activeFilter !== 'all') {
        params.handlingStatus = activeFilter;
      }
      const res = await getExceptionPage(params);
      if (res.code !== 200) {
        throw new Error(res.msg || '获取异常列表失败');
      }
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const exceptions = exceptionPageData?.list ?? [];
  const exceptionsTotal = exceptionPageData?.total ?? 0;
  const loading = isPending;
  const loadingMore = isFetching && size > INITIAL_SIZE;

  const { data: selectedException, isFetching: detailLoading } = useQuery({
    queryKey: ['exception', 'detail', selectedExceptionId],
    queryFn: async () => {
      if (selectedExceptionId === null) {
        throw new Error('缺少异常 ID');
      }
      const res = await getExceptionDetail(selectedExceptionId);
      if (res.code !== 200) {
        throw new Error(res.msg || '获取异常详情失败');
      }
      return res.data;
    },
    enabled: drawerOpen && selectedExceptionId !== null,
  });

  const invalidateExceptionQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['exception', 'page'] });
    if (selectedExceptionId !== null) {
      queryClient.invalidateQueries({ queryKey: ['exception', 'detail', selectedExceptionId] });
    }
  }, [queryClient, selectedExceptionId]);

  const continueOrRetryMutation = useMutation({
    mutationFn: async (exception: ExceptionAPI.ExceptionVO) => {
      const action = exception.recommendedAction;
      const ACTION_API: Record<string, (id: number) => Promise<{ code: number }>> = {
        CONTINUE: continueException,
        RETRY: retryException,
      };
      const res = await ACTION_API[action](exception.id);
      if (res.code !== 200) {
        throw new Error('操作失败');
      }
      return action;
    },
    onSuccess: (action) => {
      const ACTION_MSG: Record<string, string> = {
        CONTINUE: '已操作：继续',
        RETRY: '已操作：重试',
      };
      message.success(ACTION_MSG[action]);
      setActionModalOpen(false);
      setActionModalException(null);
      invalidateExceptionQueries();
    },
    onError: () => {
      message.error('操作失败');
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async (exception: ExceptionAPI.ExceptionVO) => {
      if (exception.handlingStatus === 'PENDING') {
        await claimException(exception.id);
      }
      const res = await resolveException({ id: exception.id });
      if (res.code !== 200) {
        throw new Error('操作失败');
      }
    },
    onSuccess: () => {
      message.success('处理成功');
      setActionModalOpen(false);
      setActionModalException(null);
      invalidateExceptionQueries();
    },
    onError: () => {
      message.error('操作失败');
    },
  });

  const saveRemarkMutation = useMutation({
    mutationFn: async (remark: string) => {
      if (!selectedException) {
        throw new Error('缺少异常信息');
      }
      const res = await remarkException({ id: selectedException.id, remark });
      if (res.code !== 200) {
        throw new Error('备注保存失败');
      }
    },
    onSuccess: () => {
      message.success('备注保存成功');
      setDrawerOpen(false);
      invalidateExceptionQueries();
    },
    onError: () => {
      message.error('备注保存失败');
    },
  });

  const stats = useMemo(() => computeStats(exceptions, exceptionsTotal), [exceptions, exceptionsTotal]);
  const hasMore = exceptions.length < exceptionsTotal && !loading && !loadingMore;
  const actionLoading = continueOrRetryMutation.isPending || resolveMutation.isPending;

  const handleLoadMore = useCallback(() => {
    setSize((prev) => prev + SIZE_INCREMENT);
  }, []);

  const handleFilterChange = useCallback((key: FilterType) => {
    setActiveFilter(key);
    setSize(INITIAL_SIZE);
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleAction = useCallback((exception: ExceptionAPI.ExceptionVO) => {
    setActionModalException(exception);
    setActionModalOpen(true);
  }, []);

  const handleContinueOrRetry = useCallback(() => {
    if (!actionModalException) return;
    continueOrRetryMutation.mutate(actionModalException);
  }, [actionModalException, continueOrRetryMutation]);

  const handleResolve = useCallback(() => {
    if (!actionModalException) return;
    resolveMutation.mutate(actionModalException);
  }, [actionModalException, resolveMutation]);

  const handleCardClick = useCallback((exception: ExceptionAPI.ExceptionVO) => {
    setSelectedExceptionId(exception.id);
    setDrawerOpen(true);
  }, []);

  const handleSaveRemark = useCallback(
    (remark: string) => {
      if (!selectedException) return;
      if (!remark.trim()) {
        message.warning('请输入备注内容');
        return;
      }
      saveRemarkMutation.mutate(remark);
    },
    [selectedException, saveRemarkMutation],
  );

  const { sentinelRef } = useInfiniteScroll({
    hasMore,
    loading: loading || loadingMore,
    onLoadMore: handleLoadMore,
  });

  return (
    <PageContainer pageHeaderRender={false}>
      <div>
        <div className="flex items-start justify-between gap-[12px] pb-[8px]">
          <div>
            <div className="text-[20px] leading-[29px] font-semibold">异常管理</div>
            <div className="text-[12px] leading-[17px] mt-[2px] text-[#8C8C8C]">
              共 {stats.total} 条异常 · 待处理 {stats.pendingCount} 条
            </div>
          </div>
          <Button
            type="primary"
            className="h-[31px] rounded-[20px] p-[6px_16px] border-none text-[13px] leading-[13px]"
            loading={loading}
            onClick={handleRefresh}
          >
            🔄 刷新
          </Button>
        </div>

        <FilterTabs activeKey={activeFilter} onChange={handleFilterChange} />

        {loading ? (
          <div className="flex justify-center py-12">
            <Spin size="large" />
          </div>
        ) : (
          <div className="py-2" key={activeFilter}>
            {exceptions.map((exception, idx) => (
              <ExceptionCard
                key={exception.id}
                exception={exception}
                onAction={handleAction}
                onClick={handleCardClick}
                index={idx}
              />
            ))}
            {exceptions.length === 0 && !loading && <div className="text-center py-12 text-gray-400">暂无异常</div>}
            <div ref={sentinelRef} className="h-[1px]" />
            {loadingMore && (
              <div className="flex justify-center py-4">
                <Spin size="small" />
                <span className="ml-2 text-gray-400 text-[13px]">加载更多...</span>
              </div>
            )}
            {!hasMore && exceptions.length > 0 && (
              <div className="text-center py-4 text-gray-400 text-[13px]">
                {exceptionsTotal > 0 ? `已加载全部 ${exceptionsTotal} 条异常` : '没有更多了'}
              </div>
            )}
          </div>
        )}
      </div>

      <ExceptionDetailDrawer
        exception={selectedException ?? null}
        open={drawerOpen}
        loading={detailLoading}
        onClose={() => setDrawerOpen(false)}
        onSaveRemark={handleSaveRemark}
      />

      <ExceptionActionModal
        open={actionModalOpen}
        exception={actionModalException}
        onContinueOrRetry={handleContinueOrRetry}
        onResolve={handleResolve}
        onCancel={() => {
          setActionModalOpen(false);
          setActionModalException(null);
        }}
        loading={actionLoading}
      />
    </PageContainer>
  );
};

export default ExceptionPage;
