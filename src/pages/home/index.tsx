import { Column } from '@ant-design/charts';
import { PageContainer } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { App, Badge, Button, Card, Col, Row, Tag, Typography } from 'antd';
import React, { useCallback, useMemo, useState } from 'react';

const { Title, Text } = Typography;

interface MetricCardProps {
  readonly icon: string;
  readonly title: string;
  readonly value: string;
  readonly label: string;
  readonly color: string;
  readonly path?: string;
}

interface StatusTagProps {
  readonly color: string;
  readonly label: string;
  readonly value: string;
}

const MOCK_DATA = {
  locationTotal: 33,
  availableLocationCount: 7,
  todayTaskCount: 6,
  todayExceptionCount: 2,
  runningTaskCount: 4,
  pendingExceptionCount: 3,
  inRackBoxCount: 18,
  trends: [
    { hour: '08:00', inbound: 8, outbound: 4 },
    { hour: '09:00', inbound: 15, outbound: 10 },
    { hour: '10:00', inbound: 5, outbound: 10 },
    { hour: '11:00', inbound: 3, outbound: 7 },
    { hour: '12:00', inbound: 2, outbound: 4 },
    { hour: '13:00', inbound: 3, outbound: 4 },
    { hour: '14:00', inbound: 6, outbound: 5 },
    { hour: '15:00', inbound: 4, outbound: 5 },
    { hour: '16:00', inbound: 10, outbound: 8 },
    { hour: '17:00', inbound: 7, outbound: 8 },
  ],
};

const StatusTag: React.FC<StatusTagProps> = ({ color, label, value }) => (
  <Tag
    bordered={false}
    style={{ color: '#262626', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}
    color={'#ffffff'}
    className="flex items-center gap-[6px] px-[14px] py-[6px] text-[12px] leading-[17px] m-0 rounded-[16px] border-none"
  >
    <Badge color={color} text={`${label}: ${value}`} />
  </Tag>
);

const MetricCard: React.FC<MetricCardProps> = ({ icon, title, value, label, color, path }) => {
  const handleClick = useCallback(() => {
    if (path) {
      history.push(path);
    }
  }, [path]);

  return (
    <Card
      styles={{
        body: {
          padding: 0,
        },
      }}
      hoverable={!!path}
      onClick={handleClick}
      style={{
        borderRadius: 12,
        height: '100%',
        overflow: 'hidden',
        cursor: path ? 'pointer' : 'default',
      }}
    >
      <div className="flex h-full">
        <div className="w-[3px] flex-shrink-0" style={{ backgroundColor: color }} />
        <div className="p-[14px] flex-1">
          <div className="flex items-center gap-1 mb-[6px] text-[12px] leading-[17px]" style={{ color: '#6B7280' }}>
            {icon}
            <span className="text-[#8C8C8C]">{title}</span>
          </div>
          <div className="flex items-baseline gap-1 text-[28px] leading-[28px] font-bold mb-[2px]">{value}</div>
          <div className="text-[11px] leading-[16px] text-[#8C8C8C]">{label}</div>
        </div>
      </div>
    </Card>
  );
};

const HomePage: React.FC = () => {
  // 接口 ready 后替换为: useState + useEffect + API 调用
  const overviewData = MOCK_DATA;
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  const handleRefresh = useCallback(async () => {
    setLoading(true);

    message.success({ content: '刷新成功' });
    setLoading(false);
  }, [message]);

  const statusTags: readonly StatusTagProps[] = useMemo(() => {
    const d = overviewData;
    return [
      { color: '#1677FF', label: '货位', value: String(d.locationTotal ?? '--') },
      { color: '#1677FF', label: '任务', value: String(d.todayTaskCount ?? '--') },
      { color: '#FF4D4F', label: '异常', value: String(d.todayExceptionCount ?? '--') },
      // 以下暂无后端对应字段，暂时保留原型值
      { color: '#13C2C2', label: '设备', value: '97%' },
      { color: '#722ED1', label: '周转', value: '2.3x' },
    ];
  }, [overviewData]);

  const metrics: readonly MetricCardProps[] = useMemo(() => {
    const d = overviewData;
    return [
      {
        icon: '🟢',
        title: '空闲货位',
        value: String(d.availableLocationCount ?? '--'),
        label: '可入库',
        color: '#52C41A',
        path: '/warehouse',
      },
      {
        icon: '📋',
        title: '今日任务',
        value: String(d.todayTaskCount ?? '--'),
        label: '查看任务',
        color: '#1677FF',
        path: '/task',
      },
      {
        icon: '⚠️',
        title: '今日异常',
        value: String(d.todayExceptionCount ?? '--'),
        label: '查看异常',
        color: '#FAAD14',
        path: '/exception',
      },
      // 以下暂无后端对应字段，暂时保留原型值
      { icon: '📡', title: '设备在线', value: '97%', label: 'RFID / 传感', color: '#13C2C2' },
      { icon: '📊', title: '库存周转', value: '2.3x', label: '30天均值', color: '#722ED1' },
    ];
  }, [overviewData]);

  const chartData = useMemo(() => {
    const trends = overviewData.trends ?? [];
    return trends.flatMap((t) => [
      { hour: t.hour, type: '入库', value: t.inbound ?? 0 },
      { hour: t.hour, type: '出库', value: t.outbound ?? 0 },
    ]);
  }, [overviewData]);

  const chartConfig = {
    data: chartData,
    xField: 'hour' as const,
    yField: 'value' as const,
    colorField: 'type' as const,
    group: true,
    scale: {
      color: {
        range: ['#1677FF', '#52C41A'],
      },
    },
    height: 150,
    style: {
      radiusTopLeft: 4,
      radiusTopRight: 4,
    },
    xAxis: {
      label: { style: { fill: '#6B7280' } },
      line: null,
      tickLine: null,
    },
    yAxis: false,
    label: undefined,
    meta: { value: { alias: '操作次数' } },
  };

  return (
    <PageContainer pageHeaderRender={false}>
      <div className="space-y-3">
        <Row justify="space-between" align="middle">
          <div>
            <Title level={4} style={{ margin: 0 }}>
              系统总览
            </Title>
            <Text type="secondary">
              今日任务 {overviewData.todayTaskCount ?? '--'} 笔 · 异常 {overviewData.todayExceptionCount ?? '--'} 笔
            </Text>
          </div>
          <Button type="primary" className="h-[35px]" loading={loading} onClick={handleRefresh}>
            🔄 刷新
          </Button>
        </Row>

        <Row gutter={[10, 10]}>
          {statusTags.map((tag) => (
            <Col key={`${tag.label}-${tag.value}`}>
              <StatusTag {...tag} />
            </Col>
          ))}
        </Row>

        <Row gutter={[12, 12]}>
          {metrics.map((metric) => (
            <Col key={metric.title} xs={24} sm={12} lg={8}>
              <MetricCard {...metric} />
            </Col>
          ))}
        </Row>

        <Card title={<span className="flex items-center gap-2">📈 今日操作趋势</span>} style={{ borderRadius: 12 }}>
          <Column {...chartConfig} />
        </Card>
      </div>
    </PageContainer>
  );
};

export default HomePage;
