import OperationConfirm from '@/components/OperationConfirm';
import { clearPlcQueue, getPlcRegisters, getPlcStatus } from '@/services/plc/plcAPI';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { ModalForm, ProFormInstance, ProFormItemRender } from '@ant-design/pro-components';
import { useQuery } from '@umijs/max';
import { App, Button, Tooltip, Typography } from 'antd';
import React, { useCallback, useRef, useState } from 'react';

const PLC_POLL_INTERVAL_MS = 5000;

export const PLCStatus: React.FC = () => {
  const { message } = App.useApp();
  const [plcQueueModalVisible, setPlcQueueModalVisible] = useState<boolean>(false);
  const formRef = useRef<ProFormInstance>();

  const plcStatusQuery = useQuery({
    queryKey: ['plc', 'status'],
    queryFn: async () => {
      const res = await getPlcStatus();
      if (res.code !== 200 || !res.data) {
        throw new Error(res.msg || '获取PLC状态失败');
      }
      return res.data;
    },
    refetchInterval: PLC_POLL_INTERVAL_MS,
  });

  const plcRegistersQuery = useQuery({
    queryKey: ['plc', 'registers'],
    queryFn: async () => {
      const res = await getPlcRegisters();
      if (res.code !== 200) {
        throw new Error(res.msg || '获取PLC寄存器失败');
      }
      return res.data;
    },
    enabled: plcQueueModalVisible,
  });

  const plcStatusData = plcStatusQuery.data;
  const isInitialPositionLoaded = !!plcStatusData;
  const systemState = plcStatusData?.systemState ?? 'READY';
  const currentPosition =
    !plcStatusData || !plcStatusData.connected || !plcStatusData.enabled || plcStatusData.systemState === 'ERROR'
      ? -1
      : 0;

  const getPLCStatusText = () => {
    if (!isInitialPositionLoaded) return '正在等待PLC响应...';
    if (currentPosition === -1 || systemState === 'ERROR') return 'PLC连接异常';
    if (systemState === 'BUSY') return '当前PLC运行中';
    return '当前PLC空闲';
  };

  const fetchPlcStatus = useCallback(async (): Promise<{ data: PlcAPI.PlcStatusVO }> => {
    try {
      const result = await plcStatusQuery.refetch();
      if (result.data) {
        return { data: result.data };
      }
      message.error('获取PLC状态失败');
      return { data: {} as PlcAPI.PlcStatusVO };
    } catch {
      message.error('获取PLC状态失败');
      return { data: {} as PlcAPI.PlcStatusVO };
    }
  }, [plcStatusQuery, message]);

  const handlePLCQueueModalVisibleChange = (visible: boolean) => {
    setPlcQueueModalVisible(visible);
    if (visible) {
      plcRegistersQuery.refetch();
    }
  };

  return (
    <>
      <Typography.Text
        key="current-position"
        type={currentPosition === -1 || systemState === 'ERROR' ? 'danger' : 'secondary'}
        className="font-normal"
      >
        {getPLCStatusText()}
        <Tooltip title={`每${PLC_POLL_INTERVAL_MS / 1000}秒更新状态`}>
          <QuestionCircleOutlined className="ml-1" />
        </Tooltip>
      </Typography.Text>
      <Button
        key="plc-queue-button"
        type="link"
        size="small"
        className=" !text-white"
        onClick={() => {
          setPlcQueueModalVisible(true);
        }}
      >
        查看
      </Button>
      <ModalForm
        key="plc-queue"
        open={plcQueueModalVisible}
        onOpenChange={handlePLCQueueModalVisibleChange}
        title={[
          <>
            查看PLC当前状态
            <OperationConfirm
              key="clear-plc-queue"
              modalConfig={{
                title: '确认清空PLC队列吗？',
                onOk: async () => await clearPlcQueue(),
              }}
              fetchData={fetchPlcStatus}
              btnText="清空PLC队列"
            />
          </>,
          <Button key="reload" type="link" loading={plcStatusQuery.isFetching} onClick={fetchPlcStatus}>
            更新
          </Button>,
        ]}
        width={500}
        modalProps={{
          centered: true,
          destroyOnHidden: true,
          maskClosable: false,
        }}
        submitter={false}
        formRef={formRef}
        request={fetchPlcStatus}
      >
        <Typography.Title level={5} className="!mb-2">
          PLC 关键寄存器
        </Typography.Title>
        {plcRegistersQuery.data ? (
          <Typography.Text>
            <pre>{JSON.stringify(plcRegistersQuery.data, null, 2)}</pre>
          </Typography.Text>
        ) : (
          <Typography.Text type="secondary">正在加载寄存器数据...</Typography.Text>
        )}
        <Typography.Title level={5} className="!mb-2 !mt-4">
          PLC 连接状态
        </Typography.Title>
        <ProFormItemRender name="data" noStyle>
          {({ value }: { value: PlcAPI.PlcStatusVO | undefined }) => {
            return (
              <Typography.Text>
                <pre>{`${value ? JSON.stringify(value, null, 2) : '无法获取PLC状态'}`}</pre>
              </Typography.Text>
            );
          }}
        </ProFormItemRender>
      </ModalForm>
    </>
  );
};
