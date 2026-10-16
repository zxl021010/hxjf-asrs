import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import type { PageResult } from '@/services/api-response';
import {
  getAutoDispatchStatus,
  getTaskDetail,
  getTaskPage,
  getTaskStatistics,
  reorderTask,
  setAutoDispatch,
} from '@/services/task/taskAPI';
import { LoadingOutlined, PlayCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { keepPreviousData } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient, useSearchParams } from '@umijs/max';
import { App, Badge, Button, Input, Spin, Tag } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import FilterTabs from './components/filter-tabs';
import TaskCard from './components/task-card';
import TaskDetailDrawer from './components/task-detail-drawer';
import useDragSort from './hooks/use-drag-sort';
import type { FilterType } from './types';
import { FILTER_SUBTITLE, STAT_ITEMS, mapTaskStatistics, type TaskStats } from './types';

const INITIAL_SIZE = 20;
const SIZE_INCREMENT = 20;
const KEYWORD_DEBOUNCE_MS = 300;
const POLLING_INTERVAL_MS = 5000;

const EMPTY_STATS: TaskStats = {
  total: 0,
  erpCount: 0,
  manualCount: 0,
  executingCount: 0,
  exceptionCount: 0,
};

const AUTO_DISPATCH_QUERY_KEY = ['task', 'auto-dispatch-status'] as const;

const TaskPage: React.FC = () => {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchParams, setSearchParams] = useSearchParams();
  const initialKeyword = searchParams.get('keyword') ?? '';
  const [rawKeyword, setRawKeyword] = useState<string>(initialKeyword);
  const [keyword, setKeyword] = useState<string>(initialKeyword);
  const keywordTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const [drawerTask, setDrawerTask] = useState<TaskAPI.TaskVO | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const [size, setSize] = useState<number>(INITIAL_SIZE);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  const buildPageParams = useCallback(
    (pageSize: number): TaskAPI.TaskPageParams => {
      const params: TaskAPI.TaskPageParams = { page: 1, size: pageSize };
      if (activeFilter !== 'all') {
        if (activeFilter === 'EXCEPTION') {
          params.status = 'EXCEPTION';
        } else {
          params.taskType = activeFilter as TaskAPI.TaskType;
        }
      }
      if (keyword) {
        params.keyword = keyword;
      }
      return params;
    },
    [activeFilter, keyword],
  );

  const taskListQueryKey = useMemo(
    () => ['task', 'page', activeFilter, keyword, size] as const,
    [activeFilter, keyword, size],
  );

  const {
    data: taskPageData,
    isFetching,
    isPending,
    refetch,
  } = useQuery({
    queryKey: taskListQueryKey,
    queryFn: async () => {
      const res = await getTaskPage(buildPageParams(size));
      if (res.code !== 200) {
        throw new Error(res.msg || '获取任务列表失败');
      }
      return res.data;
    },
    placeholderData: keepPreviousData,
    refetchInterval: POLLING_INTERVAL_MS,
  });

  const tasks = taskPageData?.list ?? [];
  const total = taskPageData?.total ?? 0;

  const { data: statsData } = useQuery({
    queryKey: ['task', 'statistics'],
    queryFn: async () => {
      const res = await getTaskStatistics();
      if (res.code !== 200) {
        throw new Error(res.msg || '获取任务统计失败');
      }
      return mapTaskStatistics(res.data);
    },
    refetchInterval: POLLING_INTERVAL_MS,
  });

  const { data: autoDispatchEnabled = false } = useQuery({
    queryKey: AUTO_DISPATCH_QUERY_KEY,
    queryFn: async () => {
      const res = await getAutoDispatchStatus();
      if (res.code !== 200) {
        throw new Error(res.msg || '获取自动下发状态失败');
      }
      return !!res.data?.enabled;
    },
    refetchInterval: (query) => (query.state.data ? POLLING_INTERVAL_MS : false),
  });

  const reorderMutation = useMutation({
    mutationFn: async ({
      draggedTaskId,
      targetTaskId,
      position,
    }: {
      draggedTaskId: number;
      targetTaskId: number;
      position: 'BEFORE' | 'AFTER';
    }) => {
      const res = await reorderTask(draggedTaskId, { targetTaskId, position });
      if (res.code !== 200) {
        throw new Error(res.msg || '排序失败');
      }
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
    onSettled: () => {
      refetch();
    },
  });

  const setAutoDispatchMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const res = await setAutoDispatch({ enabled });
      if (res.code !== 200) {
        throw new Error(res.msg || '操作失败');
      }
    },
    onSuccess: (_data, enabled) => {
      queryClient.setQueryData(AUTO_DISPATCH_QUERY_KEY, enabled);
      message.success(enabled ? '已开启任务自动下发' : '已关闭任务自动下发');
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });

  const stats = statsData ?? EMPTY_STATS;
  const hasMore = tasks.length < total && !loadingMore;

  const handleLoadMore = useCallback(() => {
    setLoadingMore(true);
    setSize((prev) => prev + SIZE_INCREMENT);
  }, []);

  const handleClearKeyword = useCallback(() => {
    setRawKeyword('');
    setKeyword('');
    const next = new URLSearchParams(searchParams);
    next.delete('keyword');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const setTasks = useCallback(
    (updater: React.SetStateAction<TaskAPI.TaskVO[]>) => {
      queryClient.setQueryData<PageResult<TaskAPI.TaskVO>>(taskListQueryKey, (old) => {
        if (!old) return old;
        const next = typeof updater === 'function' ? updater(old.list) : updater;
        return { ...old, list: next };
      });
    },
    [queryClient, taskListQueryKey],
  );

  const handleReorder = useCallback(
    (draggedTaskId: number, targetTaskId: number, position: 'BEFORE' | 'AFTER') => {
      reorderMutation.mutate({ draggedTaskId, targetTaskId, position });
    },
    [reorderMutation],
  );

  const handleToggleAutoDispatch = useCallback(() => {
    setAutoDispatchMutation.mutate(!autoDispatchEnabled);
  }, [autoDispatchEnabled, setAutoDispatchMutation]);

  const handleCardClick = useCallback(
    async (task: TaskAPI.TaskVO) => {
      try {
        const res = await getTaskDetail(task.id);
        if (res.code === 200) {
          setDrawerTask(res.data);
          setDrawerOpen(true);
        } else {
          message.error(res.msg || '获取任务详情失败');
        }
      } catch {
        message.error('网络请求失败，请稍后重试');
      }
    },
    [message],
  );

  const { dragSourceIndex, dragTargetIndex, handleDragStart } = useDragSort({
    tasks,
    setTasks,
    onReorder: handleReorder,
  });

  const { sentinelRef } = useInfiniteScroll({
    hasMore,
    loading: isPending || loadingMore,
    onLoadMore: handleLoadMore,
  });

  useEffect(() => {
    if (keywordTimerRef.current) clearTimeout(keywordTimerRef.current);
    keywordTimerRef.current = setTimeout(() => setKeyword(rawKeyword.trim()), KEYWORD_DEBOUNCE_MS);
    return () => {
      if (keywordTimerRef.current) clearTimeout(keywordTimerRef.current);
    };
  }, [rawKeyword]);

  useEffect(() => {
    if (!isFetching) {
      setLoadingMore(false);
    }
  }, [isFetching]);

  useEffect(() => {
    if (drawerOpen && drawerTask) {
      const latest = tasks.find((t) => t.id === drawerTask.id);
      if (latest) {
        setDrawerTask(latest);
      }
    }
  }, [tasks, drawerOpen, drawerTask]);

  return (
    <PageContainer pageHeaderRender={false}>
      <div>
        <div className="flex items-start justify-between gap-[12px] pb-[8px]">
          <div>
            <div className="text-[24px] leading-[35px] font-bold text-[#262626]">任务管理</div>
            <div className="text-[13px] leading-[19px] mt-[4px] text-[#8C8C8C]">{FILTER_SUBTITLE[activeFilter]}</div>
          </div>
          <Button
            type={'primary'}
            loading={setAutoDispatchMutation.isPending}
            icon={autoDispatchEnabled ? <LoadingOutlined /> : <PlayCircleOutlined />}
            onClick={handleToggleAutoDispatch}
          >
            {autoDispatchEnabled ? '运行中' : '启动'}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-[10px] py-[12px]">
          {STAT_ITEMS.map((item) => (
            <Tag
              key={item.label}
              bordered={false}
              color="#ffffff"
              className="m-0 rounded-[20px] border-0 px-[16px] py-[8px] text-[13px] leading-[19px] font-medium inline-flex items-center gap-[6px]"
              style={{ color: item.textColor, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            >
              {item.badgeColor && <Badge color={item.badgeColor} />}
              {item.badgeColor ? `${item.label} · ${item.getValue(stats)}` : `📋${item.getValue(stats)}`}
            </Tag>
          ))}
        </div>

        <Input
          size="large"
          placeholder="搜索订单号、货仓编号、操作人、物品..."
          prefix={<SearchOutlined />}
          value={rawKeyword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRawKeyword(e.target.value)}
          onClear={handleClearKeyword}
          allowClear
          className="mt-[8px] mb-[12px]"
        />

        <FilterTabs activeKey={activeFilter} onChange={(key: FilterType) => setActiveFilter(key)} />

        {isPending ? (
          <div className="flex justify-center py-12">
            <Spin size="large" />
          </div>
        ) : (
          <div className="py-2" key={activeFilter}>
            {tasks.map((task, idx) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={handleCardClick}
                index={idx}
                dragSourceIndex={dragSourceIndex}
                dragTargetIndex={dragTargetIndex}
                onDragStart={handleDragStart}
              />
            ))}
            {tasks.length === 0 && !isPending && <div className="text-center py-12 text-gray-400">暂无任务</div>}
            <div ref={sentinelRef} className="h-[1px]" />
            {loadingMore && (
              <div className="flex justify-center py-4">
                <Spin size="small" />
                <span className="ml-2 text-gray-400 text-[13px]">加载更多...</span>
              </div>
            )}
            {!hasMore && tasks.length > 0 && (
              <div className="text-center py-4 text-gray-400 text-[13px]">
                {total > 0 ? `已加载全部 ${total} 条任务` : '没有更多了'}
              </div>
            )}
          </div>
        )}

        <TaskDetailDrawer task={drawerTask} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      </div>
    </PageContainer>
  );
};

export default TaskPage;
