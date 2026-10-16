import { exceptionStore } from '@/models/exception';
import { getExceptionPage } from '@/services/exception/exceptionAPI';
import { useQuery } from '@umijs/max';
import { useCallback, useEffect, useRef, useState } from 'react';

const VIEWED_STORAGE_KEY = 'viewed-exception-ids';
const MAX_VIEWED_IDS = 200;
const POLL_PAGE_SIZE = 10;

function loadViewedIds(): Set<number> {
  try {
    const raw = localStorage.getItem(VIEWED_STORAGE_KEY);
    return new Set<number>(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set<number>();
  }
}

function markAsViewed(id: number): void {
  const viewed = loadViewedIds();
  viewed.add(id);
  const arr = [...viewed];
  if (arr.length > MAX_VIEWED_IDS) {
    const trimmed = arr.slice(arr.length - MAX_VIEWED_IDS);
    localStorage.setItem(VIEWED_STORAGE_KEY, JSON.stringify(trimmed));
  } else {
    localStorage.setItem(VIEWED_STORAGE_KEY, JSON.stringify(arr));
  }
}

interface UseExceptionPollingOptions {
  pollInterval?: number;
  enabled?: boolean;
}

interface UseExceptionPollingReturn {
  current: ExceptionAPI.ExceptionVO | null;
  open: boolean;
  dismiss: () => void;
}

export function useExceptionPolling(options: UseExceptionPollingOptions = {}): UseExceptionPollingReturn {
  const { pollInterval = 10000, enabled = true } = options;

  const [current, setCurrent] = useState<ExceptionAPI.ExceptionVO | null>(null);
  const [open, setOpen] = useState(false);

  const queueRef = useRef<ExceptionAPI.ExceptionVO[]>([]);
  const isShowingRef = useRef(false);
  const currentIdRef = useRef<number | null>(null);
  const dismissRef = useRef<() => void>();

  isShowingRef.current = open;

  dismissRef.current = (): void => {
    if (currentIdRef.current !== null) {
      markAsViewed(currentIdRef.current);
      currentIdRef.current = null;
    }
    if (queueRef.current.length > 0) {
      const next = queueRef.current.shift()!;
      setCurrent(next);
      currentIdRef.current = next.id;
    } else {
      setCurrent(null);
      setOpen(false);
    }
  };

  const dismiss = useCallback(() => {
    dismissRef.current?.();
  }, []);

  useEffect(() => {
    if (!open || !current) return;

    const timerId = setTimeout(() => {
      dismissRef.current?.();
    }, 5000);

    return () => {
      clearTimeout(timerId);
    };
  }, [open, current]);

  const { data: pageData } = useQuery({
    queryKey: ['exception', 'poll', 'pending'],
    queryFn: async () => {
      if (window.location.pathname === '/login') return null;
      const res = await getExceptionPage({
        page: 1,
        size: POLL_PAGE_SIZE,
        handlingStatus: 'PENDING',
      });
      if (res.code !== 200 || !res.data) {
        throw new Error(res.msg || '获取异常列表失败');
      }
      return res.data;
    },
    enabled,
    refetchInterval: pollInterval,
    retry: false,
  });

  useEffect(() => {
    if (!pageData) return;

    const list = pageData.list;
    const pendingIds = new Set(list.map((item) => item.id));

    exceptionStore.count = pageData.total ?? list.length;

    if (currentIdRef.current !== null && !pendingIds.has(currentIdRef.current)) {
      dismissRef.current?.();
    }

    const viewedIds = loadViewedIds();
    const unseen = list.filter((item) => !viewedIds.has(item.id));

    if (unseen.length > 0) {
      queueRef.current.push(...unseen);

      if (!isShowingRef.current) {
        const first = queueRef.current.shift()!;
        setCurrent(first);
        currentIdRef.current = first.id;
        setOpen(true);
      }
    }
  }, [pageData]);

  return { current, open, dismiss };
}
