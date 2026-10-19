import { Button, Form, Input, Modal, Select, message } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';

interface InboundAllocateModalProps {
  readonly open: boolean;
  readonly onCancel: () => void;
  readonly onSuccess: (values: OrderAPI.OrderInboundReqVO) => Promise<boolean>;
}

const InboundAllocateModal: React.FC<InboundAllocateModalProps> = ({ open, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [scanningInProgress, setScanningInProgress] = useState<boolean>(false);
  const [visionResult, setVisionResult] = useState<{ code: string; quantity: string } | null>(null);

  // 货盘编码状态 (API placeholder)
  const [palletCode] = useState<string>('等待货盘到位');

  // 商品规格列表 (API placeholder)
  const [specOptions] = useState<Array<{ label: string; value: string }>>([]);

  useEffect(() => {
    if (!open) {
      // 关闭时重置所有状态
      form.resetFields();
      setSubmitting(false);
      setScanningInProgress(false);
      setVisionResult(null);
    }
  }, [open, form]);

  const handleReset = useCallback(() => {
    form.setFieldsValue({
      productSpec: undefined,
    });
    setVisionResult(null);
    setScanningInProgress(false);
  }, [form]);

  const handleStartVisionScan = useCallback(() => {
    if (palletCode === '等待货盘到位') {
      message.warning('等待货盘到位');
      return;
    }

    setScanningInProgress(true);

    // API placeholder: 模拟识别过程
    setTimeout(() => {
      setScanningInProgress(false);
      message.info('识别功能待接入');
    }, 500);
  }, [palletCode]);

  const handleSubmit = useCallback(async () => {
    try {
      await form.validateFields();

      // 验证: 识别结果必须存在
      if (!visionResult) {
        message.error('请先完成飞拍识别');
        return;
      }

      // 验证: 编码一致性检查
      if (visionResult.code !== palletCode && palletCode !== '等待货盘到位') {
        message.error('识别编码与到位编码不一致,请重新识别');
        return;
      }

      // 验证: 数量必须为正整数
      const qty = Number(visionResult.quantity);
      if (!visionResult.quantity || qty <= 0 || !Number.isInteger(qty)) {
        message.error('数量必须为正整数');
        return;
      }

      setSubmitting(true);

      // API placeholder
      message.warning('入库提交功能尚未接入后端API');
      setSubmitting(false);

      // 当API准备就绪时使用:
      // const values = form.getFieldsValue();
      // const success = await onSuccess({
      //   ...values,
      //   quantity: qty,
      // });
      // setSubmitting(false);
      // if (success) {
      //   onCancel();
      // }
    } catch (error) {
      setSubmitting(false);
    }
  }, [form, visionResult, palletCode, onSuccess, onCancel]);

  const canSubmit = visionResult && form.getFieldValue('productSpec');

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onCancel}
      centered
      width={520}
      closable
      maskClosable={false}
      classNames={{
        content: '!p-[32px] !rounded-[18px]',
      }}
      footer={
        <div className="flex gap-[12px] w-full mt-[24px]">
          <Button
            color="default"
            variant="filled"
            className="flex-1 h-[45px] rounded-[10px] text-[15px] font-medium"
            onClick={handleReset}
            disabled={submitting}
          >
            重置
          </Button>
          <Button
            type="primary"
            className="flex-1 h-[45px] rounded-[10px] text-[15px] font-medium"
            onClick={handleStartVisionScan}
            loading={scanningInProgress}
            disabled={submitting}
          >
            启动飞拍识别
          </Button>
          <Button
            type="primary"
            className="flex-1 h-[45px] rounded-[10px] text-[15px] font-medium bg-[#52c41a] hover:bg-[#73d13d]"
            onClick={handleSubmit}
            loading={submitting}
            disabled={!canSubmit}
          >
            确认入库
          </Button>
        </div>
      }
    >
      <div className="flex items-center gap-[8px] mb-[24px]">
        <span className="text-[18px]">📥</span>
        <span className="text-[18px] font-semibold text-[#262626]">入库</span>
      </div>

      <Form form={form} layout="vertical" className="flex flex-col gap-[12px]">
        {/* 货盘编码 */}
        <div>
          <div className="text-[13px] text-[#8C8C8C] mb-[8px]">货盘编码</div>
          <Input
            size="large"
            value={palletCode}
            readOnly
            className="bg-[#F5F5F5]"
          />
        </div>

        {/* 商品规格 */}
        <div>
          <div className="text-[13px] text-[#8C8C8C] mb-[8px]">商品规格</div>
          <Form.Item name="productSpec" noStyle rules={[{ required: true, message: '请选择商品规格' }]}>
            {specOptions.length > 0 ? (
              <Select
                size="large"
                placeholder="请选择商品规格"
                options={specOptions}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            ) : (
              <Input
                size="large"
                placeholder="暂无可用规格"
                readOnly
                className="bg-[#F5F5F5]"
              />
            )}
          </Form.Item>
        </div>

        {/* 飞拍识别结果 */}
        <div>
          <div className="text-[13px] text-[#8C8C8C] mb-[8px]">飞拍识别</div>
          <div className="grid grid-cols-2 gap-[12px]">
            <div className="bg-white border border-[#E7E1D7] rounded-[10px] p-[16px] text-center">
              <div className="text-[24px] font-semibold text-[#262626] mb-[4px]">
                {visionResult?.code || '--'}
              </div>
              <div className="text-[13px] text-[#8C8C8C]">识别编码</div>
            </div>
            <div className="bg-white border border-[#E7E1D7] rounded-[10px] p-[16px] text-center">
              <div className="text-[24px] font-semibold text-[#262626] mb-[4px]">
                {visionResult?.quantity || '--'}
              </div>
              <div className="text-[13px] text-[#8C8C8C]">识别数量（件）</div>
            </div>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default InboundAllocateModal;
