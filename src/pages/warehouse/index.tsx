import BarcodeScanner from '@/components/barcode-scanner';
import {
  getLocationDetail,
  getLocationPage,
  markLocationFault,
  reInboundLocation,
} from '@/services/location/locationAPI';
import { inboundOrder } from '@/services/order/orderAPI';
import { boundOut } from '@/services/outbound/outboundAPI';
import { normalizeCode } from '@/utils/normalize-code';
import { PageContainer } from '@ant-design/pro-components';
import { useMutation, useQuery, useQueryClient, useSearchParams } from '@umijs/max';
import { App, Button, Divider, Input, Typography } from 'antd';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import FilterTags, { buildFilterTags } from './components/filter-tags';
import LocationCard from './components/location-card';
import LocationDetailDrawer from './components/location-detail-drawer';
import QuickActionModal, { QuickActionModalHandle } from './components/quick-action-modal';
import { DEFAULT_PAGE_SIZE, WAREHOUSE_GRID_HEIGHT_OFFSET } from './constants';
import type { FilterKey } from './types';

const { Text } = Typography;

const LOCATION_LIST_QUERY_KEY = ['location', 'page', { page: 1, size: DEFAULT_PAGE_SIZE }] as const;

const filterLocations = (
  locations: readonly LocationAPI.LocationVO[],
  filterKey: FilterKey,
  keyword: string,
): readonly LocationAPI.LocationVO[] => {
  const lowerKeyword = keyword.trim().toLowerCase();

  return locations.filter((location) => {
    let matchesStatus = false;
    if (filterKey === 'all') {
      matchesStatus = true;
    } else if (filterKey === 'executing') {
      // API placeholder: Filter by locations with active tasks
      // For now, treat LOCKED as executing (placeholder logic)
      matchesStatus = location.status === 'LOCKED';
    } else {
      matchesStatus = location.status === filterKey;
    }

    const matchesKeyword =
      !lowerKeyword ||
      location.locationNo.toLowerCase().includes(lowerKeyword) ||
      (location.orderNo && location.orderNo.toLowerCase().includes(lowerKeyword)) ||
      (location.boxCode && location.boxCode.toLowerCase().includes(lowerKeyword));

    return matchesStatus && matchesKeyword;
  });
};

const WarehousePage: React.FC = () => {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  const { data, refetch, isFetching } = useQuery({
    queryKey: LOCATION_LIST_QUERY_KEY,
    queryFn: async () => {
      const res = await getLocationPage({ page: 1, size: DEFAULT_PAGE_SIZE });
      if (res.code !== 200 || !res.data) {
        throw new Error(res.msg || '获取货位数据失败');
      }
      return res.data;
    },
  });
  const locations = data?.list ?? [];
  // Only derive global status counts when the full list has been loaded.
  const overview = useMemo(() => {
    const complete = data !== undefined && data.list.length === data.total;
    return {
      total: data?.total,
      inUse: complete ? data.list.filter((location) => location.status === 'OCCUPIED').length : undefined,
      offline: complete ? data.list.filter((location) => location.status === 'OFFLINE').length : undefined,
    };
  }, [data]);
  const overviewCards = [
    { title: '货盘总数', value: overview.total ?? '--', suffix: '个', color: '#24364B' },
    { title: '使用中货盘', value: overview.inUse ?? '--', suffix: `/ ${overview.total ?? '--'}`, color: '#24364B' },
    { title: '不在货架', value: overview.offline ?? '--', suffix: '个', color: '#9BAFC8' },
    // Inventory quantity and today's completed inbound/outbound quantities are not provided by the current API.
    { title: '库存总量', value: '--', suffix: '件', color: '#24364B' },
    {
      title: '今日入库 / 出库',
      value: <><span className="text-[#10B981]">--</span><span className="mx-[6px]">/</span><span className="text-[#1677FF]">--</span></>,
      suffix: '件',
      color: '#24364B',
    },
  ];

  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [searchParams, setSearchParams] = useSearchParams();
  const initialKeyword = searchParams.get('keyword') ?? '';
  const [keyword, setKeyword] = useState<string>(initialKeyword);

  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationAPI.LocationVO | null>(null);
  const selectedLocationId = selectedLocation?.id;
  const quickOutboundRef = useRef<QuickActionModalHandle>(null);

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const selectionMode = selectedIds.size > 0;

  const [activeRow, setActiveRow] = useState<number | null>(1);
  const [isNavExpanded, setIsNavExpanded] = useState<boolean>(false);
  const rowRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [gridHeight, setGridHeight] = useState<number | null>(null);
  const isScrollingByNav = useRef<boolean>(false);

  useLayoutEffect(() => {
    const toolbar = toolbarRef.current;
    const grid = gridContainerRef.current;
    if (!toolbar || !grid) return;

    const updateGridHeight = (): void => {
      setGridHeight(Math.max(240, window.innerHeight - grid.getBoundingClientRect().top - 16));
    };
    updateGridHeight();
    const observer = new ResizeObserver(updateGridHeight);
    observer.observe(toolbar);
    window.addEventListener('resize', updateGridHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateGridHeight);
    };
  }, []);

  const { data: locationDetail } = useQuery({
    queryKey: ['location', 'detail', selectedLocationId],
    queryFn: async () => {
      if (!selectedLocationId) {
        throw new Error('缺少货位 ID');
      }
      const res = await getLocationDetail(selectedLocationId);
      if (res.code !== 200 || !res.data) {
        throw new Error(res.msg || '获取货位详情失败');
      }
      return res.data;
    },
    enabled: drawerOpen && !!selectedLocationId,
  });
  const detailToShow = locationDetail ?? selectedLocation;

  const inboundMutation = useMutation({
    mutationFn: async (values: OrderAPI.OrderInboundReqVO) => {
      const res = await inboundOrder(values);
      if (res.code !== 200) {
        throw new Error(res.msg || '入库失败');
      }
      return res;
    },
    onSuccess: (_res, values) => {
      message.success({ content: `货位 #${values.locationNo} 入库流程已启动` });
      queryClient.invalidateQueries({ queryKey: LOCATION_LIST_QUERY_KEY });
      setDrawerOpen(false);
    },
  });

  const outboundMutation = useMutation({
    mutationFn: async (values: OutboundAPI.OutboundQuickReqVO) => {
      const res = await boundOut(values);
      if (res.code !== 200) {
        throw new Error(res.msg || '出库失败');
      }
      return res;
    },
    onSuccess: (_res, values) => {
      message.success({ content: `货位 #${values.locationNo} 出库流程已启动` });
      queryClient.invalidateQueries({ queryKey: LOCATION_LIST_QUERY_KEY });
      setDrawerOpen(false);
    },
  });

  const reinboundMutation = useMutation({
    mutationFn: async (locationNo: string) => {
      const res = await reInboundLocation(locationNo, {});
      if (res.code !== 200) {
        throw new Error(res.msg || '重新入库失败');
      }
      return res;
    },
    onSuccess: (_res, locationNo) => {
      message.success({ content: `货位 #${locationNo} 重新入库已提交` });
      queryClient.invalidateQueries({ queryKey: LOCATION_LIST_QUERY_KEY });
      setDrawerOpen(false);
    },
  });

  const markFaultMutation = useMutation({
    mutationFn: async (locationNo: string) => {
      const res = await markLocationFault(locationNo);
      if (res.code !== 200) {
        throw new Error(res.msg || '标记故障失败');
      }
      return res;
    },
    onSuccess: (_res, locationNo) => {
      message.success({ content: `货位 #${locationNo} 已标记为故障` });
      queryClient.invalidateQueries({ queryKey: LOCATION_LIST_QUERY_KEY });
      setDrawerOpen(false);
    },
  });

  const keywordFilteredLocations = useMemo(() => filterLocations(locations, 'all', keyword), [locations, keyword]);
  const filterTags = useMemo(() => buildFilterTags(keywordFilteredLocations), [keywordFilteredLocations]);
  const filteredLocations = useMemo(
    () => filterLocations(locations, activeFilter, keyword),
    [locations, activeFilter, keyword],
  );
  const rowGroupedLocations = useMemo(() => {
    const groups = new Map<number, LocationAPI.LocationVO[]>();
    filteredLocations.forEach((loc) => {
      const existing = groups.get(loc.rowNo);
      groups.set(loc.rowNo, existing ? [...existing, loc] : [loc]);
    });
    return Array.from(groups.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([rowNo, locs]) => {
        const sortedLocations = locs.sort((a, b) => a.columnNo - b.columnNo);
        const min = sortedLocations[0].locationNo;
        const max = sortedLocations[sortedLocations.length - 1].locationNo;
        return {
          rowNo,
          locations: sortedLocations,
          range: min === max ? min : `${min}~${max}`,
        };
      });
  }, [filteredLocations]);

  const scrollToRow = useCallback((rowNo: number) => {
    const el = rowRefs.current.get(rowNo);
    if (!el) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    isScrollingByNav.current = true;
    const top =
      container.scrollTop +
      el.getBoundingClientRect().top -
      container.getBoundingClientRect().top -
      container.clientTop;

    container.scrollTo({ top, behavior: 'smooth' });
  }, []);

  const handleFilterChange = useCallback((key: FilterKey) => {
    setActiveFilter(key);
  }, []);

  const handleScan = useCallback((code: string) => {
    setKeyword(code);
  }, []);

  const handleScrollToRow = useCallback(
    (rowNo: number) => {
      setActiveRow(rowNo);
      scrollToRow(rowNo);
    },
    [scrollToRow],
  );

  const handleClearKeyword = useCallback(() => {
    setKeyword('');
    const next = new URLSearchParams(searchParams);
    next.delete('keyword');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleClearFilter = useCallback(() => {
    setActiveFilter('all');
    handleClearKeyword();
  }, [handleClearKeyword]);

  const handleRefresh = useCallback(async () => {
    const result = await refetch();
    if (result.isSuccess) {
      message.success({ content: '刷新成功' });
    }
  }, [refetch, message]);

  const handleLocationClick = useCallback(
    (location: LocationAPI.LocationVO) => {
      if (selectionMode) {
        if (location.status === 'OCCUPIED' || location.status === 'IDLE') {
          setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(location.id)) {
              next.delete(location.id);
            } else {
              next.add(location.id);
            }
            return next;
          });
        }
        return;
      }
      setSelectedLocation(location);
      setDrawerOpen(true);
    },
    [selectionMode],
  );

  const handleInboundLookup = useCallback(
    (code: string) => {
      const normalized = normalizeCode(code);
      const location = locations.find((loc) => loc.locationNo === normalized || loc.boxCode === normalized);
      if (!location) return null;
      if (location.status !== 'OFFLINE') {
        return { ...location, errorMessage: '仅允许不在货架的盒子执行入库操作' };
      }
      return { ...location };
    },
    [locations],
  );

  const handleOutboundLookup = useCallback(
    (code: string) => {
      const normalized = normalizeCode(code);
      const location = locations.find(
        (loc) => loc.locationNo === normalized || loc.boxCode === normalized || loc.orderNo === normalized,
      );
      if (!location) return null;
      if (location.status !== 'OCCUPIED' && location.status !== 'IDLE') {
        return {
          ...location,
          errorMessage: `仅允许占用或空闲状态的盒子执行出库操作`,
        };
      }
      return { ...location };
    },
    [locations],
  );

  const handleInboundSubmit = useCallback(
    async (values: OrderAPI.OrderInboundReqVO): Promise<boolean> => {
      try {
        await inboundMutation.mutateAsync(values);
        return true;
      } catch {
        return false;
      }
    },
    [inboundMutation],
  );

  const handleOutboundSubmit = useCallback(
    async (values: OutboundAPI.OutboundQuickReqVO): Promise<boolean> => {
      try {
        await outboundMutation.mutateAsync(values);
        return true;
      } catch {
        return false;
      }
    },
    [outboundMutation],
  );

  const handleDrawerOutbound = useCallback(() => {
    if (!selectedLocation) return;
    quickOutboundRef.current?.openWithCode(selectedLocation.locationNo);
  }, [selectedLocation]);

  const handleDrawerReInbound = useCallback(() => {
    const loc = selectedLocation;
    if (!loc) return;
    reinboundMutation.mutate(loc.locationNo);
  }, [selectedLocation, reinboundMutation]);

  const handleDrawerMarkFault = useCallback(() => {
    const loc = selectedLocation;
    if (!loc) return;
    markFaultMutation.mutate(loc.locationNo);
  }, [selectedLocation, markFaultMutation]);

  useEffect(() => {
    if (rowGroupedLocations.length === 0) return;
    const firstRow = rowGroupedLocations[0].rowNo;
    setActiveRow(firstRow);
    scrollToRow(firstRow);
  }, [activeFilter, keyword, scrollToRow]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || rowRefs.current.size === 0) return;

    const visible = new Set<number>();
    const update = (): void => {
      if (isScrollingByNav.current) return;
      const cy = container.getBoundingClientRect().top + container.clientHeight / 2;
      let best = 0;
      let bestDist = Infinity;
      visible.forEach((n) => {
        const el = rowRefs.current.get(n);
        if (!el) return;
        const d = Math.abs(el.getBoundingClientRect().top + el.clientHeight / 2 - cy);
        if (d < bestDist) {
          bestDist = d;
          best = n;
        }
      });
      if (!best) return;
      setActiveRow((prev) => {
        if (prev !== best) {
          return best;
        }
        return prev;
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const n = Number((e.target as HTMLElement).dataset.rowNo);
          if (e.isIntersecting) visible.add(n);
          else visible.delete(n);
        });
        update();
      },
      { root: container, threshold: [0, 0.5] },
    );

    rowRefs.current.forEach((el) => observer.observe(el));

    const onPointerDown = (): void => {
      isScrollingByNav.current = false;
    };
    container.addEventListener('pointerdown', onPointerDown, { passive: true });

    return () => {
      observer.disconnect();
      container.removeEventListener('pointerdown', onPointerDown);
    };
  }, [rowGroupedLocations]);

  return (
    <PageContainer pageHeaderRender={false}>
      <div className={`${selectionMode ? 'pb-[140px]' : ''}`}>
        <div ref={toolbarRef}>
          <div className="flex items-center gap-3 mb-[12px]">
            <QuickActionModal
              type="inbound"
              trigger={
                <Button size="large" variant="solid" color="green">
                  📥 快捷入库
                </Button>
              }
              onLookup={handleInboundLookup}
              onFinish={handleInboundSubmit}
            />
            <QuickActionModal
              ref={quickOutboundRef}
              type="outbound"
              trigger={
                <Button size="large" type="primary">
                  📤 快捷出库
                </Button>
              }
              onLookup={handleOutboundLookup}
              onFinish={handleOutboundSubmit}
            />
            <Input
              size="large"
              placeholder="输入订单号或货仓编号"
              prefix="🔍"
              suffix={<BarcodeScanner onScan={handleScan} />}
              value={keyword}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setKeyword(event.target.value)}
              onClear={handleClearKeyword}
              allowClear
              className="flex-1"
            />
          </div>

          <Text type="secondary" className="block text-[12px]">
            提示：可扫码或输入订单号/货仓编号，按回车执行
          </Text>

          <section aria-label="货盘统计" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-[16px] mt-[12px] mb-[12px]">
            {overviewCards.map((card) => (
              <div key={card.title} className="min-w-0 rounded-[16px] border border-[#E2E8F0] bg-white px-[20px] py-[16px]">
                <div className="mb-[8px] text-[14px] leading-[20px] text-[#94A3B8]">{card.title}</div>
                <div className="flex flex-wrap items-baseline gap-x-[8px]">
                  <span className="text-[32px] font-bold leading-[40px] tabular-nums" style={{ color: card.color }}>{card.value}</span>
                  <span className="text-[14px] text-[#94A3B8]">{card.suffix}</span>
                </div>
              </div>
            ))}
          </section>

          <div className="flex flex-wrap items-center justify-between gap-x-[12px]">
            <div className="flex min-w-0 flex-wrap items-center gap-x-[16px]">
              <h2 className="m-0 shrink-0 text-[14px] font-semibold text-[#24364B]">货盘状态图（点击货盘查看详情）</h2>
              <FilterTags tags={filterTags} activeKey={activeFilter} onChange={handleFilterChange} />
            </div>
            <div className="flex items-center gap-[4px] shrink-0 ml-[8px]">
              <Button type="link" size="small" onClick={handleClearFilter}>
                清除筛选
              </Button>
              <Button type="link" size="small" onClick={handleRefresh} loading={isFetching}>
                刷新
              </Button>
            </div>
          </div>

        </div>

        <div ref={gridContainerRef} className="flex min-h-0 min-w-0 flex-col gap-[10px]" style={{ height: gridHeight ?? `calc(100vh - ${WAREHOUSE_GRID_HEIGHT_OFFSET}px)` }}>
          {/* Horizontal row navigation */}
          {rowGroupedLocations.length > 0 && (
            <div className="flex shrink-0 items-start gap-[8px]">
              <div className={`flex flex-wrap gap-[8px] flex-1 min-w-0 ${!isNavExpanded ? 'max-h-[38px] overflow-hidden' : ''}`}>
                {rowGroupedLocations.map(({ rowNo, locations, range }) => (
                  <button
                    key={rowNo}
                    type="button"
                    aria-pressed={activeRow === rowNo}
                    onClick={() => handleScrollToRow(rowNo)}
                    className={`whitespace-nowrap rounded-[16px] px-[14px] py-[6px] text-[13px] cursor-pointer transition-colors border ${
                      activeRow === rowNo
                        ? 'bg-[#E6F4FF] border-[#1677FF] text-[#1677FF]'
                        : 'bg-white border-[#E8E8E8] text-[#8C8C8C] hover:bg-[#FAFAFA]'
                    }`}
                  >
                    第{rowNo}列（{activeFilter === 'all' ? range : locations.length}）
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setIsNavExpanded(!isNavExpanded)}
                className="shrink-0 rounded-[16px] px-[14px] py-[6px] text-[13px] cursor-pointer transition-colors border bg-white border-[#E8E8E8] text-[#8C8C8C] hover:bg-[#FAFAFA]"
              >
                {isNavExpanded ? '收起 ▲' : '展开 ▼'}
              </button>
            </div>
          )}

          {/* Scrollable content */}
          <div ref={scrollContainerRef} className="flex-1 min-h-0 min-w-0 overflow-y-auto scrollbar-hidden">
            {rowGroupedLocations.map(({ rowNo, locations: groupedLocs, range }) => (
              <div
                key={rowNo}
                ref={(el: HTMLDivElement | null) => {
                  if (el) {
                    el.dataset.rowNo = String(rowNo);
                    rowRefs.current.set(rowNo, el);
                  } else {
                    rowRefs.current.delete(rowNo);
                  }
                }}
              >
                <Divider dashed orientation="left" orientationMargin={0} plain size="small">
                  第{rowNo}列（{activeFilter === 'all' ? range : groupedLocs.length}）
                </Divider>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 xl:grid-cols-[repeat(12,_minmax(0,_1fr))] 2xl:grid-cols-[repeat(14,_minmax(0,_1fr))] gap-[8px] content-start">
                  {groupedLocs.map((location) => (
                    <LocationCard
                      key={String(location.id)}
                      location={location}
                      isSelected={selectedIds.has(location.id)}
                      selectionMode={selectionMode}
                      onClick={handleLocationClick}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <LocationDetailDrawer
          open={drawerOpen}
          location={detailToShow}
          onClose={() => setDrawerOpen(false)}
          onOutboundConfirm={handleDrawerOutbound}
          onInboundSubmit={handleInboundSubmit}
          onReInbound={handleDrawerReInbound}
          onMarkFault={handleDrawerMarkFault}
        />
      </div>
    </PageContainer>
  );
};

export default WarehousePage;
